// Tile helpers for the scripted player: where a structure can stand, what a tile is worth and how a pylon walk
// goes. They read the game and never change it.

import type { Command } from "../../commands.ts";
import { linkLength, relays } from "../../grid.ts";
import { harvestPreview } from "../../harvest.ts";
import { centre, distance, span, tileAtPoint, tileOf, within, type Tile } from "../../hex.ts";
import { floorCanBeGraded } from "../../movingFloor.ts";
import { placeError } from "../../structures.ts";
import {
  DRY,
  KINDS,
  LINK_RANGE,
  MAX_HEIGHT,
  ROCK,
  type Game,
  type Kind,
  type Structure,
} from "../../state.ts";
import type { View } from "./view.ts";

/** Turns off the straight line, in radians, that a pylon walk tries in this order. */
const DETOURS = [0, 0.5, -0.5, 1, -1, 1.5, -1.5];

/** What a structure has to gain on a tile before the bot brings a pylon to it rather than use one in reach. */
const DETOUR = 2;

/** A pylon put down only for its harvest has to claim at least this many tiles to pay for itself soon. */
const HARVEST_WORTH = 12;
/** Steps from the lander within which the relays stand that harvest pylons go by, so that they stay near home. */
const HARVEST_FAR = 14;

/**
 * Steps from the lander to the dike it raises when it only has to hold out: far enough out that the taps, cells
 * and weapons next to the lander fit inside.
 */
export const DIKE = 5;

/** A pump on the dike's crest has to have at least this many wet tiles in reach to be worth its cost. */
export const PUMP_WET = 5;

/** Steps between two tiles. */
export function steps(a: Tile, b: Tile): number {
  return distance(a.x, a.y, b.x, b.y);
}

/** Whether a relay on the grid links to this structure, or would link to one placed here. */
export function reaches(game: Game, kind: Kind, x: number, y: number): boolean {
  const probe = { kind, x, y } as Structure;
  return game.structures.some((s) => relays(s.kind) && Number.isFinite(s.dist) && linkLength(probe, s) > 0);
}

/** Whether any tile within `radius` steps of p stands in silt. */
export function wetNear(game: Game, p: Tile, radius: number): boolean {
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
export function free(game: Game, kind: Kind, p: Tile): boolean {
  if ((game.mark[p.y * game.w + p.x] ?? -1) >= 0) return false;
  return placeError(game, kind, p.x, p.y) === null && !wetNear(game, p, 1);
}

/** Whether a structure of this kind can go here now, on the grid and clear of silt. */
export function fits(game: Game, kind: Kind, p: Tile): boolean {
  return free(game, kind, p) && reaches(game, kind, p.x, p.y);
}

/**
 * The best tile within `radius` steps of `near` for a structure, by `score`; a tile scored -Infinity is never
 * taken. Every tile must fit the structure, join the grid and not stand next to silt: a structure starts at no
 * health, so the first film that reaches it would take it at once.
 */
export function site(
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
export function bridge(game: Game, target: Tile): Tile | undefined {
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
export function want(
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
export function nearest(game: Game, near: Tile): (p: Tile, i: number) => number {
  return (p, i) => -span(near.x, near.y, p.x, p.y) + (game.height[i] ?? 0) * 1e-3;
}

/**
 * What a lance on this tile would be worth: the silt it could reach, as lances cannot aim uphill, and to a lesser
 * degree the dry low ground in range that silt will run into.
 */
export function overlook(game: Game, p: Tile): number {
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

/** How many wet tiles a lance on p could aim at: in its range and on ground no higher than its own. */
export function aimable(game: Game, p: Tile): number {
  const own = game.height[p.y * game.w + p.x] ?? 0;
  let wet = 0;
  within(game.w, game.h, p.x, p.y, KINDS.lance.range, (i) => {
    const ground = game.height[i] ?? ROCK;
    if (ground !== ROCK && ground <= own && (game.silt[i] ?? 0) >= DRY) wet += 1;
  });
  return wet;
}

/** Total silt within `radius` steps of p, counting only what lies at least `min` steps away. */
export function siltAround(game: Game, p: Tile, radius: number, min = 0): number {
  let sum = 0;
  within(game.w, game.h, p.x, p.y, radius, (i, d) => {
    if (d >= min) sum += game.silt[i] ?? 0;
  });
  return sum;
}

/** Total silt within `radius` steps of p on ground higher than p's. */
export function siltAbove(game: Game, p: Tile, radius: number): number {
  const own = game.height[p.y * game.w + p.x] ?? 0;
  let sum = 0;
  within(game.w, game.h, p.x, p.y, radius, (i) => {
    if ((game.height[i] ?? ROCK) > own) sum += game.silt[i] ?? 0;
  });
  return sum;
}

/** The deepest silt within `radius` steps of p. */
export function deepest(game: Game, p: Tile, radius: number): number {
  let most = 0;
  within(game.w, game.h, p.x, p.y, radius, (i) => {
    most = Math.max(most, game.silt[i] ?? 0);
  });
  return most;
}

/** The tile whose surroundings within `radius` steps hold the most silt on the whole map, and how much they hold. */
export function deepArea(game: Game, radius: number): { at: Tile; silt: number } | undefined {
  let best: { at: Tile; silt: number } | undefined;
  for (let y = 0; y < game.h; y++) {
    for (let x = 0; x < game.w; x++) {
      if (game.height[y * game.w + x] === ROCK) continue;
      const silt = siltAround(game, { x, y }, radius);
      if (!best || silt > best.silt) best = { at: { x, y }, silt };
    }
  }
  return best;
}

/** The tile `by` tile units from `from` on the straight line toward `to`; a negative `by` goes away from it. */
export function toward(from: Tile, to: Tile, by: number): Tile {
  const a = centre(from.x, from.y);
  const b = centre(to.x, to.y);
  const f = by / (span(from.x, from.y, to.x, to.y) || 1);
  return tileAtPoint(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
}

/** The tile `by` tile units from `from` in the direction of the angle, in radians. */
export function heading(from: Tile, angle: number, by: number): Tile {
  const a = centre(from.x, from.y);
  return tileAtPoint(a.x + Math.cos(angle) * by, a.y + Math.sin(angle) * by);
}

/**
 * Indices of the tiles of the dike round the lander: every tile DIKE steps from it that is not rock. Silt can only
 * get from beyond the ring to the lander across one of them, so with all of them raised the ring holds silt back
 * until it rises above their top.
 */
export function dike(game: Game, home: Tile): number[] {
  const ring: number[] = [];
  within(game.w, game.h, home.x, home.y, DIKE, (i, d) => {
    if (d === DIKE && game.height[i] !== ROCK) ring.push(i);
  });
  return ring;
}

/** The finished crest tile for a pump that reaches the most wet tiles, if one reaches enough of them. */
export function crestPump(game: Game, ring: readonly number[]): Tile | undefined {
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
export function pumpSite(game: Game, relaysOnGrid: readonly Structure[], least: number): Tile | undefined {
  let best: Tile | undefined;
  let bestWet = least - 1;
  // The relays' reaches overlap; a tile is weighed once, where it is first met.
  const seen = new Set<number>();
  for (const r of relaysOnGrid) {
    if (!r.built) continue;
    within(game.w, game.h, r.x, r.y, LINK_RANGE, (i, _d, x, y) => {
      if (seen.has(i)) return;
      seen.add(i);
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
export function runoff(
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

/** Whether any tile within `radius` steps of p is marked for grading. */
export function marked(game: Game, p: Tile, radius: number): boolean {
  let any = false;
  within(game.w, game.h, p.x, p.y, radius, (i) => {
    if ((game.mark[i] ?? -1) >= 0) any = true;
  });
  return any;
}

/** Silt at least this deep stands, as a sea or a pool, rather than running off as a film. */
const STANDING = 3;

/** How far below the standing silt's surface the gap may lie before it counts as spilling, or about to. */
const SPILL = 0.5;

/** Steps the ground beyond a rim has to lie below its top for the silt there to stand against it. */
const RIM = 2;

/** Steps above the standing silt's surface the bot raises a gap to. */
const GAP_LIFT = 2;

/**
 * The lowest gap in the ground between standing silt and the lander, where the silt is about to spill through it:
 * on the way from the lander to standing silt whose highest point is lowest, the free tiles at that highest point,
 * and the height that holds the silt off for a while. Ground marked for grading counts at its mark, so once a gap is
 * marked the next one comes up. Undefined while no gap lies near the silt's surface, or where the silt would only
 * have to run downhill to the lander, which no gap holds off.
 */
export function gap(game: Game, home: Tile): { tiles: number[]; height: number } | undefined {
  const { w, h } = game;
  const start = home.y * w + home.x;
  const ground = (i: number): number => {
    const own = game.height[i] ?? ROCK;
    const mark = game.mark[i] ?? -1;
    return own === ROCK ? ROCK : Math.max(own, mark);
  };
  // Ground heights are whole steps, so a bucket per height orders the search.
  const cost = new Int8Array(w * h).fill(-1);
  const from = new Int32Array(w * h).fill(-1);
  const buckets: number[][] = Array.from({ length: MAX_HEIGHT + 1 }, () => []);
  cost[start] = ground(start);
  buckets[ground(start)]?.push(start);
  let source = -1;
  for (let c = 0; c <= MAX_HEIGHT && source < 0; c++) {
    const bucket = buckets[c] ?? [];
    for (let k = 0; k < bucket.length && source < 0; k++) {
      const i = bucket[k] ?? 0;
      if (cost[i] !== c) continue;
      if ((game.silt[i] ?? 0) >= STANDING) {
        source = i;
        break;
      }
      within(w, h, i % w, Math.floor(i / w), 1, (j) => {
        const g = ground(j);
        if (g === ROCK) return;
        const next = Math.max(c, g);
        const known = cost[j] ?? -1;
        if (known < 0 || next < known) {
          cost[j] = next;
          from[j] = i;
          buckets[next]?.push(j);
        }
      });
    }
  }
  if (source < 0) return undefined;
  const pass = cost[source] ?? 0;
  const surface = (game.height[source] ?? 0) + (game.silt[source] ?? 0);
  const lift = Math.min(MAX_HEIGHT, Math.ceil(surface) + GAP_LIFT);
  // Only a rim that the silt stands against counts, not the slope a flood runs down.
  if (pass <= ground(start) || pass - ground(source) < RIM || surface < pass - SPILL || lift <= pass) return undefined;
  // The tiles at the top of the way where it crosses the rim, from the silt's side; further along the way at the
  // same height they only matter once these are raised.
  const tiles: number[] = [];
  let i = from[source] ?? -1;
  while (i >= 0 && i !== start && ground(i) < pass) i = from[i] ?? -1;
  for (; i >= 0 && i !== start && ground(i) === pass; i = from[i] ?? -1) {
    if (game.occ[i] === 0 && (game.mark[i] ?? -1) < 0 && floorCanBeGraded(game, i)) tiles.push(i);
  }
  return tiles.length > 0 ? { tiles, height: lift } : undefined;
}

/** The command that places a structure on a tile. */
export function order(structure: Kind, p: Tile): Command[] {
  return [{ kind: "place", structure, x: p.x, y: p.y }];
}

/** A pylon one link closer to the goal, on the tile that harvests most among those that will do. */
export function walk(v: View, goal: Tile): Tile | undefined {
  const { game } = v;
  const from = v.closest(goal);
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
  // Where silt or a sea has drowned the line, the hop goes to whatever dry tile in reach lies nearest the goal.
  return site(game, "pylon", from, LINK_RANGE, (q) =>
    steps(q, goal) < gap ? -span(q.x, q.y, goal.x, goal.y) : -Infinity,
  );
}

/**
 * The tile for a pylon put down only for its harvest: the one that claims most, if it claims at least `least` tiles,
 * by a relay at most `far` steps from the lander.
 */
export function harvestSite(v: View, least = HARVEST_WORTH, far = HARVEST_FAR): Tile | undefined {
  const { game, home } = v;
  let best: Tile | undefined;
  let bestCount = least - 1;
  const seen = new Set<number>();
  for (const s of v.nodes) {
    if (!s.built || (home && steps(s, home) > far)) continue;
    within(game.w, game.h, s.x, s.y, LINK_RANGE, (i, _d, x, y) => {
      if (seen.has(i)) return;
      seen.add(i);
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
}
