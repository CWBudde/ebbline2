// A simple scripted player. Balance tests use it to show that every mission can be won.

import { apply, type Command } from "../commands.ts";
import { linkLength } from "../grid.ts";
import { centre, distance, span, tileAtPoint, tileOf, within, type Tile } from "../hex.ts";
import { densest } from "../spitters.ts";
import { step } from "../step.ts";
import { placeError } from "../structures.ts";
import {
  DRY,
  KINDS,
  LINK_RANGE,
  TICK_HZ,
  type Game,
  type Kind,
  type Structure,
} from "../state.ts";

/** Steps between two tiles. */
function steps(a: Tile, b: Tile): number {
  return distance(a.x, a.y, b.x, b.y);
}

/** The tile within `radius` steps of `near`, closest to it, where the structure fits and joins the grid. */
function spot(
  game: Game,
  kind: Kind,
  near: Tile,
  radius: number,
  ok: (p: Tile) => boolean = () => true,
): Tile | undefined {
  let best: Tile | undefined;
  let bestD = Infinity;
  within(game.w, game.h, near.x, near.y, radius, (_i, _steps, x, y) => {
    const d = span(near.x, near.y, x, y);
    if (d >= bestD || placeError(game, kind, x, y) !== null) return;
    if (!reaches(game, kind, x, y) || !ok({ x, y })) return;
    best = { x, y };
    bestD = d;
  });
  return best;
}

/** Whether a structure placed here would link to a structure that is itself on the grid. */
function reaches(game: Game, kind: Kind, x: number, y: number): boolean {
  const probe = { kind, x, y } as Structure;
  return game.structures.some(
    (s) =>
      Number.isFinite(s.dist) &&
      linkLength(probe, s) > 0,
  );
}

/** Whether any tile within `radius` steps of p stands in silt. */
function wetNear(game: Game, p: Tile, radius: number): boolean {
  let wet = false;
  within(game.w, game.h, p.x, p.y, radius, (i) => {
    if ((game.silt[i] ?? 0) >= DRY) wet = true;
  });
  return wet;
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
  const backlog = all.filter(
    (s) => !s.built && s.kind !== "cap" && Number.isFinite(s.dist),
  ).length;

  // 0. Give up structures the grid no longer reaches.
  const stranded = all.find(
    (s) => !Number.isFinite(s.dist) && s.kind !== "lander" && game.tick > 30,
  );
  if (stranded && !game.gridDirty) {
    return [{ kind: "dismantle", id: stranded.id }];
  }

  // 1. Cap any vent that has run dry.
  for (const vent of game.vents) {
    if (
      !vent.capped &&
      placeError(game, "cap", vent.x, vent.y) === null &&
      reaches(game, "cap", vent.x, vent.y)
    ) {
      return order("cap", vent);
    }
  }
  if (backlog >= 3 || game.energy < 3) return [];

  // 2. Tap every lode the grid reaches; walk pylons to the nearest dry one.
  const lodes: Tile[] = [];
  for (let i = 0; i < game.lode.length; i++) {
    if (game.lode[i] === 1 && game.occ[i] === 0) lodes.push(tileOf(game.w, i));
  }
  for (const lode of lodes) {
    if (
      placeError(game, "tap", lode.x, lode.y) === null &&
      reaches(game, "tap", lode.x, lode.y)
    ) {
      return order("tap", lode);
    }
  }
  const walk = (goal: Tile): Tile | undefined => {
    const from = closest(goal);
    if (!from) return undefined;
    const gap = steps(from, goal);
    const reach = Math.min(LINK_RANGE - 1, Math.max(1, gap - LINK_RANGE + 1));
    return spot(game, "pylon", toward(from, goal, reach), 2, (p) => !wetNear(game, p, 1));
  };
  lodes.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  const lode = lodes.find((p) => !wetNear(game, p, 2));
  if (lode && backlog === 0 && steps(lode, closest(lode) ?? lode) < 20) {
    const p = walk(lode);
    if (p) return order("pylon", p);
  }
  if (backlog > 0) return [];

  if (allowed("cell") && count("tap") >= 3 && count("cell") < 2) {
    const lander = all.find((s) => s.kind === "lander");
    const p = lander && spot(game, "cell", { x: lander.x + 2, y: lander.y + 2 }, 3);
    if (p) return order("cell", p);
  }

  // 3. Cover the densest cluster against globs.
  if (
    allowed("interceptor") &&
    game.spitters.length > 0 &&
    count("interceptor") < 10 &&
    game.energy >= 12
  ) {
    const hub = densest(game);
    const p =
      hub && near("interceptor", hub, 6) < 2
        ? spot(game, "interceptor", hub, 4)
        : undefined;
    if (p) return order("interceptor", p);
  }

  // 4. With nothing to cap, ring the lander with weapons instead.
  const home = all.find((s) => s.kind === "lander");
  if (game.level.objective.kind === "survive" && home) {
    if (game.energy < 12) return [];
    const ring = 3 + Math.floor(game.tick / (40 * TICK_HZ));
    const angle = count("lance") * 2.4;
    const post = heading(home, angle, 4);
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

  // 5. Push toward the nearest open vent.
  const vents = game.vents.filter((v) => !v.capped);
  vents.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  const vent = vents[0];
  const front = vent && closest(vent);
  if (!vent || !front || game.energy < 12) return [];
  const gap = steps(front, vent);
  const contested = wetNear(game, front, KINDS.lance.range - 1);
  if (contested || gap <= LINK_RANGE) {
    const aim = toward(front, vent, 2);
    // The longer the push takes, the more firepower the bot commits.
    const flush = game.energy >= game.capacity * 0.8;
    const wave = flush ? 99 : 4 + Math.floor(game.tick / (90 * TICK_HZ));
    if (near("lance", front, 6) < wave) {
      const p = spot(game, "lance", aim, 4);
      if (p) return order("lance", p);
    }
    if (allowed("lobber") && near("lobber", front, 6) < Math.min(wave, near("lance", front, 6)) / 2) {
      const p = spot(game, "lobber", toward(front, vent, -1), 4);
      if (p) return order("lobber", p);
    }
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
