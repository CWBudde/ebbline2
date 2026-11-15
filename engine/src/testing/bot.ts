// A scripted player. Balance tests use it to show that every mission can be won, and the levels are tuned so
// that it only just wins them: it plays like a careful, competent human.
//
// What it does, in order of urgency: give up cut-off structures, cap vents as soon as they can take a cap, shoot
// down globs and guard the lander, tap lodes, put pylons on flats for their harvest, then push toward the nearest
// open vent with lances sited on high ground that overlooks the silt, backed by lobbers on deep pools.

import { apply, type Command } from "../commands.ts";
import { linkLength } from "../grid.ts";
import { harvestIncome, harvestPreview } from "../harvest.ts";
import { centre, distance, span, tileAtPoint, tileOf, within, type Tile } from "../hex.ts";
import { LANDER_INCOME, TAP_INCOME } from "../packets.ts";
import { densest } from "../spitters.ts";
import { step } from "../step.ts";
import { placeError } from "../structures.ts";
import { LANCE, LOBBER } from "../weapons.ts";
import {
  CAP_DRY,
  DRY,
  KINDS,
  LINK_RANGE,
  ROCK,
  TICK_HZ,
  type Game,
  type Kind,
  type Structure,
} from "../state.ts";

/** Energy per second a lance or lobber burns while it fires without pause. */
const LANCE_UPKEEP = (LANCE.cost * TICK_HZ) / LANCE.every;
const LOBBER_UPKEEP = (LOBBER.cost * TICK_HZ) / LOBBER.every;

/** Turns off the straight line, in radians, that a pylon walk tries in this order. */
const DETOURS = [0, 0.5, -0.5, 1, -1, 1.5, -1.5];

/** A pylon put down only for its harvest has to claim at least this many tiles to pay for itself soon. */
const HARVEST_WORTH = 12;

/** Steps between two tiles. */
function steps(a: Tile, b: Tile): number {
  return distance(a.x, a.y, b.x, b.y);
}

/** Whether a structure placed here would link to a structure that is itself on the grid. */
function reaches(game: Game, kind: Kind, x: number, y: number): boolean {
  const probe = { kind, x, y } as Structure;
  return game.structures.some((s) => Number.isFinite(s.dist) && linkLength(probe, s) > 0);
}

/** Whether any tile within `radius` steps of p stands in silt. */
function wetNear(game: Game, p: Tile, radius: number): boolean {
  let wet = false;
  within(game.w, game.h, p.x, p.y, radius, (i) => {
    if ((game.silt[i] ?? 0) >= DRY) wet = true;
  });
  return wet;
}

/** Whether a structure of this kind can go here now, on the grid and clear of silt. */
function fits(game: Game, kind: Kind, p: Tile): boolean {
  return placeError(game, kind, p.x, p.y) === null && reaches(game, kind, p.x, p.y) && !wetNear(game, p, 1);
}

/**
 * The best tile within `radius` steps of `near` for a structure, by `score`; a tile scored -Infinity is never
 * taken. Every tile must fit the structure, join the grid and not stand next to silt: a structure starts at no
 * health, so the first film that reaches it would take it at once.
 */
function site(
  game: Game,
  kind: Kind,
  near: Tile,
  radius: number,
  score: (p: Tile, i: number) => number,
): Tile | undefined {
  let best: Tile | undefined;
  let bestScore = -Infinity;
  within(game.w, game.h, near.x, near.y, radius, (i, _steps, x, y) => {
    const p = { x, y };
    if (!fits(game, kind, p)) return;
    const value = score(p, i);
    if (value > bestScore) {
      best = p;
      bestScore = value;
    }
  });
  return best;
}

/** The tile within `radius` steps of `near` closest to it; equally near tiles go to the higher ground. */
function spot(game: Game, kind: Kind, near: Tile, radius: number): Tile | undefined {
  return site(game, kind, near, radius, (p, i) => -span(near.x, near.y, p.x, p.y) + (game.height[i] ?? 0) * 1e-3);
}

/**
 * What a lance on this tile would be worth: the silt it could reach, as lances cannot aim uphill, and to a lesser
 * degree the dry low ground in range that silt will run into.
 */
function overlook(game: Game, p: Tile): number {
  const own = game.height[p.y * game.w + p.x] ?? 0;
  let value = 0;
  within(game.w, game.h, p.x, p.y, KINDS.lance.range, (i) => {
    const ground = game.height[i] ?? ROCK;
    if (ground === ROCK || ground > own) return;
    const depth = game.silt[i] ?? 0;
    value += depth >= DRY ? 1 + Math.min(depth, 2) : 0.15;
  });
  return value;
}

/** Total silt within `radius` steps of p, counting only what lies at least `min` steps away. */
function siltAround(game: Game, p: Tile, radius: number, min = 0): number {
  let sum = 0;
  within(game.w, game.h, p.x, p.y, radius, (i, d) => {
    if (d >= min) sum += game.silt[i] ?? 0;
  });
  return sum;
}

/** The deepest silt within `radius` steps of p. */
function deepest(game: Game, p: Tile, radius: number): number {
  let most = 0;
  within(game.w, game.h, p.x, p.y, radius, (i) => {
    most = Math.max(most, game.silt[i] ?? 0);
  });
  return most;
}

/** The tile `by` tile units from `from` on the straight line toward `to`; a negative `by` goes away from it. */
function toward(from: Tile, to: Tile, by: number): Tile {
  const a = centre(from.x, from.y);
  const b = centre(to.x, to.y);
  const f = by / (span(from.x, from.y, to.x, to.y) || 1);
  return tileAtPoint(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
}

/** The tile `by` tile units from `from` in the direction of the angle, in radians. */
function heading(from: Tile, angle: number, by: number): Tile {
  const a = centre(from.x, from.y);
  return tileAtPoint(a.x + Math.cos(angle) * by, a.y + Math.sin(angle) * by);
}

function order(structure: Kind, p: Tile): Command[] {
  return [{ kind: "place", structure, x: p.x, y: p.y }];
}

/** Decides the bot's next move; at most one command per call. */
export function think(game: Game): Command[] {
  const allowed = (kind: Kind): boolean => game.level.allowed.includes(kind);
  const all = game.structures;
  const count = (kind: Kind): number => all.filter((s) => s.kind === kind).length;
  const near = (kind: Kind, p: Tile, r: number): number =>
    all.filter((s) => s.kind === kind && steps(s, p) <= r).length;
  const onGrid = all.filter((s) => Number.isFinite(s.dist));
  const closest = (p: Tile): Structure | undefined => {
    let best: Structure | undefined;
    for (const c of onGrid) {
      if (!best || steps(c, p) < steps(best, p)) best = c;
    }
    return best;
  };
  // What the weapons burn when they fire without pause, against what comes in.
  const income =
    LANDER_INCOME +
    all.filter((s) => s.kind === "tap" && s.built).length * TAP_INCOME +
    harvestIncome(game);
  // Only weapons that found something to fire at last time burn energy.
  const firing = (kind: Kind): number => all.filter((s) => s.kind === kind && s.built && s.target >= 0).length;
  const upkeep = firing("lance") * LANCE_UPKEEP + firing("lobber") * LOBBER_UPKEEP;
  const backlog = all.filter((s) => !s.built && s.kind !== "cap" && Number.isFinite(s.dist)).length;

  // 0. Give up structures the grid no longer reaches.
  const stranded = all.find((s) => !Number.isFinite(s.dist) && s.kind !== "lander" && game.tick > 30);
  if (stranded && !game.gridDirty) {
    return [{ kind: "dismantle", id: stranded.id }];
  }

  // 1. Cap a vent as soon as it and the ring around it can take one: an unfinished cap clamps the vent, so from
  // then on the pool only shrinks, but silt flowing back over the cap would wear it away.
  for (const vent of game.vents) {
    if (vent.capped || placeError(game, "cap", vent.x, vent.y) !== null || !reaches(game, "cap", vent.x, vent.y)) {
      continue;
    }
    if (deepest(game, vent, 1) < CAP_DRY * 0.6 && siltAround(game, vent, 2) < 2) return order("cap", vent);
  }

  // 2. Emergencies come before saving up: placing costs nothing, and silt that lands by the lander, from a glob
  // or a flood, wears everything there down and eats the energy in repairs, so waiting only makes it worse.
  const home = all.find((s) => s.kind === "lander");
  const hub = allowed("interceptor") && game.spitters.length > 0 ? densest(game) : undefined;
  const cover = hub ? near("interceptor", hub, 6) : 2;
  if (hub && cover === 0 && backlog < 3) {
    const p = spot(game, "interceptor", hub, 4);
    if (p) return order("interceptor", p);
  }
  if (home && wetNear(game, home, 4) && near("lance", home, 6) < 3 && backlog < 3) {
    const p = site(game, "lance", home, 6, (q) => overlook(game, q) - steps(q, home));
    if (p) return order("lance", p);
  }
  if (backlog >= 3 || game.energy < 3) return [];

  // 3. Tap every lode the grid reaches; walk pylons to the nearest dry one.
  const lodes: Tile[] = [];
  for (let i = 0; i < game.lode.length; i++) {
    if (game.lode[i] === 1 && game.occ[i] === 0) lodes.push(tileOf(game.w, i));
  }
  for (const lode of lodes) {
    if (fits(game, "tap", lode)) return order("tap", lode);
  }
  /** A pylon one link closer to the goal, on the tile that harvests most among those that will do. */
  const walk = (goal: Tile): Tile | undefined => {
    const from = closest(goal);
    if (!from) return undefined;
    const gap = steps(from, goal);
    const reach = Math.min(LINK_RANGE - 1, Math.max(1, gap - LINK_RANGE + 1));
    // Straight on if the ground allows, else swing ever wider round silt and rock.
    const a = centre(from.x, from.y);
    const b = centre(goal.x, goal.y);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    for (const swing of DETOURS) {
      const aim = heading(from, angle + swing, reach);
      const p = site(
        game,
        "pylon",
        aim,
        1,
        (q) => -span(aim.x, aim.y, q.x, q.y) + harvestPreview(game, q.x, q.y).length * 0.05,
      );
      if (p) return p;
    }
    return undefined;
  };
  lodes.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  const lode = lodes.find((p) => !wetNear(game, p, 2));
  if (lode && backlog === 0 && steps(lode, closest(lode) ?? lode) < 20) {
    const p = walk(lode);
    if (p) return order("pylon", p);
  }
  if (backlog > 0) return [];

  // 4. Pylons on open flats near the lander for their harvest, while they pay back quickly.
  const harvestSite = (): Tile | undefined => {
    let best: Tile | undefined;
    let bestCount = HARVEST_WORTH - 1;
    for (const s of onGrid) {
      if (!s.built || (home && steps(s, home) > 14)) continue;
      within(game.w, game.h, s.x, s.y, LINK_RANGE, (_i, _d, x, y) => {
        const p = { x, y };
        if (wetNear(game, p, 3)) return;
        const claim = harvestPreview(game, x, y).length;
        if (claim > bestCount && fits(game, "pylon", p)) {
          best = p;
          bestCount = claim;
        }
      });
    }
    return best;
  };
  // Early on, a few of them round the lander pay for themselves many times over.
  if (game.tick < TICK_HZ * 30 && count("pylon") < 3) {
    const p = harvestSite();
    if (p) return order("pylon", p);
  }

  if (allowed("cell") && count("tap") >= 3 && count("cell") < 2) {
    const p = home && spot(game, "cell", { x: home.x + 2, y: home.y + 2 }, 3);
    if (p) return order("cell", p);
  }

  // 5. Cover the densest cluster against globs with a second interceptor.
  if (hub && count("interceptor") < 10 && cover < 2 && game.energy >= 12) {
    const p = spot(game, "interceptor", hub, 6);
    if (p) return order("interceptor", p);
  }

  // 6. With nothing to cap, ring the lander with weapons close in: further out they would burn energy on silt
  // that is no threat yet.
  if (game.level.objective.kind === "survive" && home) {
    if (game.energy < 12) return [];
    // Posts spread round the lander at golden-angle steps, so the ring closes evenly as it grows.
    const ring = 3 + Math.floor(game.tick / (40 * TICK_HZ));
    const post = heading(home, count("lance") * 2.4, 4);
    if (count("lance") < ring * 2) {
      const p = spot(game, "lance", post, 3);
      if (p) return order("lance", p);
    }
    if (allowed("lobber") && count("lobber") < ring) {
      const p = spot(game, "lobber", post, 3);
      if (p) return order("lobber", p);
    }
    return [];
  }

  // 7. Push toward the nearest open vent.
  const vents = game.vents.filter((v) => !v.capped);
  vents.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  const vent = vents[0];
  const front = vent && closest(vent);
  if (!vent || !front || game.energy < 12) return [];
  const gap = steps(front, vent);
  const contested = wetNear(game, front, KINDS.lance.range);
  if (contested || gap <= LINK_RANGE + 2) {
    // The longer the push takes, the more firepower the bot commits.
    const flush = game.energy >= game.capacity * 0.8;
    const wave = flush ? 99 : 4 + Math.floor(game.tick / (90 * TICK_HZ));
    if (near("lance", front, 7) < wave) {
      const aim = toward(front, vent, 3);
      const p = site(game, "lance", aim, 5, (q) => overlook(game, q) - steps(q, vent) * 0.6);
      if (p) return order("lance", p);
    }
    if (
      allowed("lobber") &&
      near("lobber", front, 8) < Math.min(wave, near("lance", front, 7)) / 2 &&
      upkeep + LOBBER_UPKEEP <= income
    ) {
      const p = site(game, "lobber", toward(front, vent, -1), 5, (q) =>
        siltAround(game, q, KINDS.lobber.range, KINDS.lobber.minRange),
      );
      if (p) return order("lobber", p);
    }
  }
  // Spare energy goes into more harvest.
  if (game.energy >= game.capacity * 0.6) {
    const p = harvestSite();
    if (p) return order("pylon", p);
  }
  if (gap > LINK_RANGE - 1) {
    const p = walk(vent);
    if (p) return order("pylon", p);
  }
  return [];
}

export interface Outcome {
  phase: Game["phase"];
  seconds: number;
  structures: number;
}

/** Plays a game with the bot, or with nobody at all, until it ends or time runs out. */
export function play(game: Game, maxSeconds: number, bot = true): Outcome {
  const limit = maxSeconds * TICK_HZ;
  while (game.phase === "playing" && game.tick < limit) {
    if (bot && game.tick % 15 === 0) {
      for (const command of think(game)) apply(game, command);
    }
    step(game);
  }
  return {
    phase: game.phase,
    seconds: Math.floor(game.tick / TICK_HZ),
    structures: game.structures.length,
  };
}
