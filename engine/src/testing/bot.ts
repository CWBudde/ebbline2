// A scripted player. Balance tests use it to show that every mission can be won, and the levels are tuned so
// that it only just wins them: it plays like a careful, competent human.
//
// What it does, in order of urgency: give up cut-off structures and taps drowned too deep to pay for their
// mending, cap vents as soon as they can take a cap, shoot down globs and guard the lander, put pumps by standing
// silt where the map starts with a sea or a long flood, tap lodes, put pylons on flats for their harvest, set springs
// where their balm runs down into the silt, then push toward the nearest open vent with lances sited on high ground
// that overlooks the silt, backed by lobbers on deep pools.
//
// When it only has to hold out, it digs in instead: graders raise a ring of ground round the lander to the top
// height, lances and lobbers stand inside it or on its crest, and pumps on the crest skim the silt that rises
// against it for energy.

import { apply, type Command } from "../commands.ts";
import { linkLength, relays } from "../grid.ts";
import { harvestIncome, harvestPreview } from "../harvest.ts";
import { centre, distance, span, tileAtPoint, tileOf, within, type Tile } from "../hex.ts";
import { LANDER_INCOME, TAP_INCOME } from "../packets.ts";
import { densest } from "../spitters.ts";
import { step } from "../step.ts";
import { placeError, WEAR } from "../structures.ts";
import { LANCE, LOBBER } from "../weapons.ts";
import {
  CAP_DRY,
  DRY,
  KINDS,
  LINK_RANGE,
  MAX_HEIGHT,
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

/** What a structure has to gain on a tile before the bot brings a pylon to it rather than use one in reach. */
const DETOUR = 2;

/** A pylon put down only for its harvest has to claim at least this many tiles to pay for itself soon. */
const HARVEST_WORTH = 12;

/**
 * Steps from the lander to the dike it raises when it only has to hold out: far enough out that the taps, cells
 * and weapons next to the lander fit inside.
 */
const DIKE = 5;

/** Graders that raise the dike. */
const GRADERS = 2;

/** Pumps the bot puts by standing silt at first; one more joins every minute. */
const PUMPS = 2;

/** Seconds a level's vents have flowed before landing for its silt to count as standing, like a sea. */
const STANDING_FLOOD = 90;

/** A pump on the dike's crest has to have at least this many wet tiles in reach to be worth its cost. */
const PUMP_WET = 5;

/** Springs the bot keeps pouring at first; one more joins every minute, up to SPRINGS_MOST. */
const SPRINGS = 2;
const SPRINGS_MOST = 8;
/** Steps balm may run downhill from a spring before it has to reach silt, for a new spring and a working one. */
const SPRING_REACH = 6;
const SPRING_KEEP = 10;

/** Steps between two tiles. */
function steps(a: Tile, b: Tile): number {
  return distance(a.x, a.y, b.x, b.y);
}

/** Whether a relay on the grid links to this structure, or would link to one placed here. */
function reaches(game: Game, kind: Kind, x: number, y: number): boolean {
  const probe = { kind, x, y } as Structure;
  return game.structures.some((s) => relays(s.kind) && Number.isFinite(s.dist) && linkLength(probe, s) > 0);
}

/** Whether any tile within `radius` steps of p stands in silt. */
function wetNear(game: Game, p: Tile, radius: number): boolean {
  let wet = false;
  within(game.w, game.h, p.x, p.y, radius, (i) => {
    if ((game.silt[i] ?? 0) >= DRY) wet = true;
  });
  return wet;
}

/**
 * Whether a structure of this kind could stand here, clear of silt, once the grid reaches the tile. Ground marked
 * for grading stays free: a grader cannot raise a tile that something stands on.
 */
function free(game: Game, kind: Kind, p: Tile): boolean {
  if ((game.mark[p.y * game.w + p.x] ?? -1) >= 0) return false;
  return placeError(game, kind, p.x, p.y) === null && !wetNear(game, p, 1);
}

/** Whether a structure of this kind can go here now, on the grid and clear of silt. */
function fits(game: Game, kind: Kind, p: Tile): boolean {
  return free(game, kind, p) && reaches(game, kind, p.x, p.y);
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

/**
 * A pylon that would bring the grid to a structure wanted at `target`: on a tile that joins the grid now and lies
 * within link range of the target, the one that harvests most, then the one nearest the target.
 */
function bridge(game: Game, target: Tile): Tile | undefined {
  return site(game, "pylon", target, LINK_RANGE, (q) =>
    q.x === target.x && q.y === target.y
      ? -Infinity
      : harvestPreview(game, q.x, q.y).length * 0.05 - span(target.x, target.y, q.x, q.y) * 0.01,
  );
}

/**
 * What gets a structure onto the best tile within `radius` steps of `near`, by `score`: the structure itself where
 * a relay on the grid reaches the tile, else first a pylon that brings the grid there. Only relays pass packets on,
 * so a structure can never hang off another lance or tap. Tiles even a pylon cannot bring the grid to are passed
 * over, and so is a tile scored -Infinity.
 */
function want(
  game: Game,
  kind: Kind,
  near: Tile,
  radius: number,
  score: (p: Tile, i: number) => number,
): Command[] | undefined {
  const tiles: { p: Tile; value: number }[] = [];
  within(game.w, game.h, near.x, near.y, radius, (i, _steps, x, y) => {
    const p = { x, y };
    if (!free(game, kind, p)) return;
    const value = score(p, i) - (reaches(game, kind, x, y) ? 0 : DETOUR);
    if (value > -Infinity) tiles.push({ p, value });
  });
  // Stable, so among equals the first tile `within` visits wins.
  tiles.sort((a, b) => b.value - a.value);
  for (const { p } of tiles) {
    if (reaches(game, kind, p.x, p.y)) return order(kind, p);
    const pylon = kind === "pylon" ? undefined : bridge(game, p);
    if (pylon) return order("pylon", pylon);
  }
  return undefined;
}

/** The score for the tile closest to `near`; equally near tiles go to the higher ground. */
function nearest(game: Game, near: Tile): (p: Tile, i: number) => number {
  return (p, i) => -span(near.x, near.y, p.x, p.y) + (game.height[i] ?? 0) * 1e-3;
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

/**
 * Indices of the tiles of the dike round the lander: every tile DIKE steps from it that is not rock. Silt can only
 * get from beyond the ring to the lander across one of them, so with all of them raised the ring holds silt back
 * until it rises above their top.
 */
function dike(game: Game, home: Tile): number[] {
  const ring: number[] = [];
  within(game.w, game.h, home.x, home.y, DIKE, (i, d) => {
    if (d === DIKE && game.height[i] !== ROCK) ring.push(i);
  });
  return ring;
}

/** The finished crest tile for a pump that reaches the most wet tiles, if one reaches enough of them. */
function crestPump(game: Game, ring: readonly number[]): Tile | undefined {
  let best: Tile | undefined;
  let bestWet = PUMP_WET - 1;
  for (const i of ring) {
    const p = tileOf(game.w, i);
    if ((game.height[i] ?? 0) < MAX_HEIGHT || (game.silt[i] ?? 0) >= DRY) continue;
    if (placeError(game, "pump", p.x, p.y) !== null || !reaches(game, "pump", p.x, p.y)) continue;
    let wet = 0;
    within(game.w, game.h, p.x, p.y, KINDS.pump.range, (j) => {
      if ((game.silt[j] ?? 0) >= DRY) wet += 1;
    });
    if (wet > bestWet) {
      best = p;
      bestWet = wet;
    }
  }
  return best;
}

/**
 * A tile on the grid for a pump that skims the most silt: dry itself and next to it, so the first film does not take
 * it before it is built, with at least `least` wet tiles two steps out.
 */
function pumpSite(game: Game, relaysOnGrid: readonly Structure[], least: number): Tile | undefined {
  let best: Tile | undefined;
  let bestWet = least - 1;
  for (const r of relaysOnGrid) {
    if (!r.built) continue;
    within(game.w, game.h, r.x, r.y, LINK_RANGE, (_i, _d, x, y) => {
      const p = { x, y };
      if (!free(game, "pump", p)) return;
      let wet = 0;
      within(game.w, game.h, x, y, KINDS.pump.range, (j, d) => {
        if (d === KINDS.pump.range && (game.silt[j] ?? 0) >= DRY) wet += 1;
      });
      if (wet > bestWet && reaches(game, "pump", x, y)) {
        best = p;
        bestWet = wet;
      }
    });
  }
  return best;
}

/**
 * Where balm poured at p runs: every tile it reaches by never going uphill, within `limit` steps. Gives the fewest
 * steps to a tile with silt on it, how many tiles the balm spreads over on the way, how far it falls to the
 * silt's surface there and that tile, or undefined when it reaches no silt, as from a hollow.
 */
function runoff(
  game: Game,
  p: Tile,
  limit: number,
): { steps: number; spread: number; drop: number; at: Tile } | undefined {
  const start = p.y * game.w + p.x;
  const seen = new Map<number, number>([[start, 0]]);
  const queue = [start];
  for (const i of queue) {
    const d = seen.get(i) ?? 0;
    if ((game.silt[i] ?? 0) >= DRY) {
      const drop = (game.height[start] ?? 0) - (game.height[i] ?? 0) - (game.silt[i] ?? 0);
      return { steps: d, spread: seen.size, drop, at: tileOf(game.w, i) };
    }
    if (d >= limit) continue;
    const own = game.height[i] ?? 0;
    within(game.w, game.h, i % game.w, Math.floor(i / game.w), 1, (j) => {
      const ground = game.height[j] ?? ROCK;
      if (seen.has(j) || ground === ROCK || ground > own) return;
      seen.set(j, d + 1);
      queue.push(j);
    });
  }
  return undefined;
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
  // The grid reaches on only from its relays, so they are its front.
  const nodes = onGrid.filter((s) => relays(s.kind));
  const closest = (p: Tile): Structure | undefined => {
    let best: Structure | undefined;
    for (const c of nodes) {
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
  // A structure placed by a relay that is still unfinished waits for it: it is not on the grid yet, nor cut off.
  const joined = (s: Structure): boolean =>
    Number.isFinite(s.dist) || nodes.some((r) => !r.built && linkLength(r, s) > 0);
  const backlog = all.filter((s) => !s.built && s.kind !== "cap" && joined(s)).length;

  // 0. Give up structures the grid no longer reaches.
  const stranded = all.find((s) => !joined(s) && s.kind !== "lander" && game.tick > 30);
  if (stranded && !game.gridDirty) {
    return [{ kind: "dismantle", id: stranded.id }];
  }

  // A tap standing so deep in silt that mending it costs more than it brings in is given up; the lode is tapped
  // again once it runs dry.
  const sunk = all.find(
    (s) => s.kind === "tap" && s.built && (game.silt[s.y * game.w + s.x] ?? 0) * WEAR * TICK_HZ > TAP_INCOME,
  );
  if (sunk) return [{ kind: "dismantle", id: sunk.id }];

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
  // Holding out, the bot digs in behind a dike, where it can raise one.
  const ring = home && game.level.objective.kind === "survive" && allowed("grader") ? dike(game, home) : undefined;
  /** Whether a weapon here stands safe: anywhere without a dike, else inside it or on its finished crest. */
  const behind = (q: Tile): boolean => {
    if (!ring || !home) return true;
    const d = steps(q, home);
    return d < DIKE || (d === DIKE && (game.height[q.y * game.w + q.x] ?? 0) >= MAX_HEIGHT);
  };
  const hub = allowed("interceptor") && game.spitters.length > 0 ? densest(game) : undefined;
  const cover = hub ? near("interceptor", hub, 6) : 2;
  if (hub && cover === 0 && backlog < 3) {
    const move = want(game, "interceptor", hub, 4, nearest(game, hub));
    if (move) return move;
  }
  // Landed below a sea held off by higher ground, whatever spills over runs down to the lander: silt closing in
  // calls for lances round it, the more the longer it keeps coming. Where the land sinks, pushing to the vents
  // does better.
  const guard = !home ? 0 : wetNear(game, home, 4) ? 3 : 0;
  const below =
    home !== undefined &&
    game.level.sinking === undefined &&
    (game.height[home.y * game.w + home.x] ?? 0) < (game.level.sea ?? 0);
  const siege = home && below && wetNear(game, home, 8) ? Math.min(8, 2 + Math.floor(game.tick / (60 * TICK_HZ))) : 0;
  if (home && near("lance", home, 6) < Math.max(guard, siege) && backlog < 3) {
    const move = want(game, "lance", home, 6, (q) => (behind(q) ? overlook(game, q) - steps(q, home) : -Infinity));
    if (move) return move;
  }
  // Marking the dike costs nothing, so it comes first; the graders go back once it stands to its full height.
  const low = ring?.filter((i) => (game.height[i] ?? 0) < MAX_HEIGHT) ?? [];
  if (ring) {
    const unmarked = low.filter((i) => (game.mark[i] ?? -1) < 0 && game.occ[i] === 0);
    if (unmarked.length > 0) return [{ kind: "mark", tiles: unmarked, height: MAX_HEIGHT }];
    const grader = all.find((s) => s.kind === "grader");
    if (low.length === 0 && grader) return [{ kind: "dismantle", id: grader.id }];
  }
  if (backlog >= 3 || game.energy < 3) return [];

  // Graders stand well inside the dike, by the lander, where they reach all of it.
  if (home && low.length > 0 && count("grader") < GRADERS && game.energy >= KINDS.grader.cost && backlog === 0) {
    const move = want(game, "grader", home, DIKE - 2, (q, i) => -steps(q, home) * 0.1 + (game.height[i] ?? 0) * 0.01);
    if (move) return move;
  }

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
    // Over a sea, the line runs into the water; the hop then goes to whatever dry tile in reach lies nearest the goal.
    if (game.level.sea !== undefined) {
      return site(game, "pylon", from, LINK_RANGE, (q) =>
        steps(q, goal) < gap ? -span(q.x, q.y, goal.x, goal.y) : -Infinity,
      );
    }
    return undefined;
  };
  // Where silt stands from the start, in a sea or a long flood, pumps by it skim it and pay for themselves within
  // half a minute. Elsewhere the lances burn it off before a pump earns its cost back.
  const standing = game.level.sea !== undefined || (game.level.flood ?? 0) >= STANDING_FLOOD;
  const pumpsDue = PUMPS + Math.floor(game.tick / (60 * TICK_HZ));
  if (standing && allowed("pump") && game.energy >= KINDS.pump.cost && count("pump") < pumpsDue) {
    const p = pumpSite(game, nodes, PUMP_WET);
    if (p) return order("pump", p);
  }
  lodes.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  // Lodes on islands stand by the shore, so over a sea a dry ring round the lode has to do.
  const lode = lodes.find((p) => !wetNear(game, p, game.level.sea === undefined ? 2 : 1));
  if (lode && backlog === 0 && steps(lode, closest(lode) ?? lode) < 20) {
    const p = walk(lode);
    if (p) return order("pylon", p);
  }
  if (backlog > 0) return [];

  // 4. Pylons on open flats near the lander for their harvest, while they pay back quickly.
  const harvestSite = (): Tile | undefined => {
    let best: Tile | undefined;
    let bestCount = HARVEST_WORTH - 1;
    for (const s of nodes) {
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
    const by = home && { x: home.x + 2, y: home.y + 2 };
    const move = by && want(game, "cell", by, 3, nearest(game, by));
    if (move) return move;
  }

  // 4b. Springs pour balm down the slope into the silt: just above the shore, where it runs into the silt within a
  // few steps, falls steeply and spreads over few tiles on the way, as down a gully, and meets the silt near the
  // vent the push goes for. A spring the shore has left far behind is given up for one closer to it.
  const open = game.vents.filter((v) => !v.capped);
  open.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  const target = open[0];
  if (allowed("spring") && target) {
    const springs = all.filter((s) => s.kind === "spring");
    const idle = springs.find((s) => s.built && !runoff(game, s, SPRING_KEEP));
    if (idle) return [{ kind: "dismantle", id: idle.id }];
    const due = Math.min(SPRINGS_MOST, SPRINGS + Math.floor(game.tick / (60 * TICK_HZ)));
    if (springs.length < due && game.energy >= KINDS.spring.cost) {
      let best: Tile | undefined;
      let bestScore = -Infinity;
      for (const r of nodes) {
        if (!r.built) continue;
        within(game.w, game.h, r.x, r.y, LINK_RANGE, (_i, _d, x, y) => {
          const p = { x, y };
          if (springs.some((s) => steps(s, p) < 3) || !fits(game, "spring", p)) return;
          const run = runoff(game, p, SPRING_REACH);
          if (!run) return;
          const score = -run.steps - run.spread * 0.05 + run.drop * 0.5 - steps(run.at, target) * 0.2;
          if (score > bestScore) {
            best = p;
            bestScore = score;
          }
        });
      }
      if (best) return order("spring", best);
    }
  }

  // 5. Cover the densest cluster against globs with a second interceptor.
  if (hub && count("interceptor") < 10 && cover < 2 && game.energy >= 12) {
    const move = want(game, "interceptor", hub, 6, nearest(game, hub));
    if (move) return move;
  }

  // 6. With nothing to cap, ring the lander with weapons close in: further out they would burn energy on silt
  // that is no threat yet.
  if (game.level.objective.kind === "survive" && home) {
    if (game.energy < 12) return [];
    // Silt rising against the dike feeds pumps on its crest, which pay for the lances once the lodes outside drown.
    const pump = ring && allowed("pump") ? crestPump(game, ring) : undefined;
    if (pump) return order("pump", pump);
    // Posts spread round the lander at golden-angle steps, so the ring closes evenly as it grows.
    const posts = 3 + Math.floor(game.tick / (40 * TICK_HZ));
    const post = heading(home, count("lance") * 2.4, 4);
    if (count("lance") < posts * 2) {
      // Behind a dike, lances go wherever they overlook the most silt; its crest overlooks everything.
      const move = ring
        ? want(game, "lance", home, DIKE, (q) => (behind(q) ? overlook(game, q) : -Infinity))
        : want(game, "lance", post, 3, nearest(game, post));
      if (move) return move;
    }
    if (allowed("lobber") && count("lobber") < posts) {
      const move = ring
        ? want(game, "lobber", post, 3, (q) => (steps(q, home) < DIKE ? -span(post.x, post.y, q.x, q.y) : -Infinity))
        : want(game, "lobber", post, 3, nearest(game, post));
      if (move) return move;
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
    const base = 4 + Math.floor(game.tick / (90 * TICK_HZ));
    // A full bank doubles the push rather than throwing everything at it, which starved the harvest.
    const wave = flush ? 2 * base : base;
    if (near("lance", front, 7) < wave) {
      // Out ahead of the front toward the vent; where silt has drowned that, round the front along the shore.
      const score = (q: Tile): number => overlook(game, q) - steps(q, vent) * 0.6;
      const move = want(game, "lance", toward(front, vent, 3), 5, score) ?? want(game, "lance", front, LINK_RANGE + 2, score);
      if (move) return move;
    }
    if (
      allowed("lobber") &&
      near("lobber", front, 8) < Math.min(wave, near("lance", front, 7)) / 2 &&
      upkeep + LOBBER_UPKEEP <= income
    ) {
      const move = want(game, "lobber", toward(front, vent, -1), 5, (q) =>
        siltAround(game, q, KINDS.lobber.range, KINDS.lobber.minRange),
      );
      if (move) return move;
    }
  }
  // Spare energy goes into more harvest.
  if (game.energy >= game.capacity * 0.6) {
    const p = harvestSite();
    if (p) return order("pylon", p);
  }
  if (gap > LINK_RANGE - 1) {
    // The cap needs a relay within link range of the vent; the vent's pulses drown low ground, so the last pylon
    // goes as high as it can.
    const p =
      site(game, "pylon", vent, LINK_RANGE, (q, i) => (game.height[i] ?? 0) - steps(q, vent) * 0.1) ?? walk(vent);
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
