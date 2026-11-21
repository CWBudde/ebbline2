// What built structures do each tick: lances, lobbers, pumps, baffles, interceptors, graders and airfields.

import { centre, distance, span, tileAtPoint, within, type Point } from "./hex.ts";
import { updateHarvest } from "./harvest.ts";
import { gain } from "./packets.ts";
import {
  DRY,
  FLOW_EVERY,
  KINDS,
  MAX_HEIGHT,
  ROCK,
  type Event,
  type Game,
  type Plane,
  type Structure,
} from "./state.ts";

export const LANCE = { every: 10, cost: 0.04, removes: 0.8, idle: 15 } as const;
/**
 * The blast reaches every tile within `radius` steps and takes `removes` × (1 − steps / (radius + 1)) from each.
 * Over its 19 tiles that is 13.05 silt, about what the square-tile blast of radius 2.5 took over 21 tiles.
 */
export const LOBBER = {
  every: 75,
  cost: 1,
  removes: 1.45,
  radius: 2,
  least: 0.3,
} as const;
export const PUMP = { removes: 0.03, yield: 0.15 } as const;
export const BAFFLE = { lift: 2, drainEvery: 90 } as const;
export const INTERCEPTOR = { every: 15, cost: 1 } as const;
export const GRADER = { work: 45, cost: 0.5 } as const;
/**
 * The plane flies `speed` tiles per tick (7.5 a second) and carries `bombs` bombs, which it drops evenly along a
 * run of `run` tiles centred on its target. Each bomb is a lobber blast (`blast`, `removes`). The target is the
 * tile whose surroundings within `area` steps hold the most silt; with less than `least` there, the plane stays
 * on the ground and the airfield looks again after `idle` ticks.
 */
export const AIRFIELD = {
  speed: 0.25,
  bombs: 15,
  run: 8,
  area: 3,
  blast: 2,
  removes: 1.45,
  least: 0.3,
  idle: 30,
} as const;

function take(game: Game, i: number, amount: number): number {
  const depth = game.silt[i] ?? 0;
  const taken = Math.min(depth, amount);
  game.silt[i] = depth - taken;
  game.stats.removed += taken;
  return taken;
}

function lance(game: Game, s: Structure, events: Event[]): void {
  if (s.cooldown > 0 || s.energy < LANCE.cost) return;
  const own = game.height[s.y * game.w + s.x] ?? 0;
  // Aim where a shot burns the most, nearest first: a thin film is not worth a full shot.
  let best = -1;
  let bestScore = -Infinity;
  let bx = 0;
  let by = 0;
  within(game.w, game.h, s.x, s.y, KINDS.lance.range, (i, d, x, y) => {
    const depth = game.silt[i] ?? 0;
    if (depth < DRY || (game.height[i] ?? 0) > own) return;
    const score = Math.min(depth, LANCE.removes) - d * 0.02;
    if (score > bestScore) {
      best = i;
      bestScore = score;
      bx = x;
      by = y;
    }
  });
  s.target = best;
  if (best < 0) {
    s.cooldown = LANCE.idle;
    return;
  }
  take(game, best, LANCE.removes);
  s.energy -= LANCE.cost;
  s.cooldown = LANCE.every;
  events.push({ kind: "lance", id: s.id, x: bx, y: by });
}

function lobber(game: Game, s: Structure, events: Event[]): void {
  if (s.cooldown > 0 || s.energy < LOBBER.cost) return;
  let best = -1;
  let bestDepth: number = LOBBER.least;
  let bx = 0;
  let by = 0;
  within(game.w, game.h, s.x, s.y, KINDS.lobber.range, (i, d, x, y) => {
    const depth = game.silt[i] ?? 0;
    if (d < KINDS.lobber.minRange || depth <= bestDepth) return;
    best = i;
    bestDepth = depth;
    bx = x;
    by = y;
  });
  s.target = best;
  if (best < 0) {
    s.cooldown = LANCE.idle;
    return;
  }
  s.energy -= LOBBER.cost;
  s.cooldown = LOBBER.every;
  game.shells.push({
    id: game.nextId++,
    sx: s.x,
    sy: s.y,
    tx: bx,
    ty: by,
    t: 0,
    // The shell flies in a straight line, so its flight time follows the distance between the centres.
    duration: Math.round(span(s.x, s.y, bx, by) * 2.5) + 10,
  });
  events.push({ kind: "lob", x: s.x, y: s.y });
}

function stepShells(game: Game, events: Event[]): void {
  const kept = [];
  for (const shell of game.shells) {
    shell.t += 1;
    if (shell.t < shell.duration) {
      kept.push(shell);
      continue;
    }
    within(game.w, game.h, shell.tx, shell.ty, LOBBER.radius, (i, d) => {
      take(game, i, LOBBER.removes * (1 - d / (LOBBER.radius + 1)));
    });
    events.push({
      kind: "impact",
      x: shell.tx,
      y: shell.ty,
      radius: LOBBER.radius,
    });
  }
  game.shells = kept;
}

/** The plane of an airfield while it is in the air. */
export function planeOf(game: Game, base: number): Plane | undefined {
  return game.planes.find((p) => p.base === base);
}

/**
 * The tile whose surroundings within `AIRFIELD.area` steps hold the most silt on the whole map, nearest to the
 * airfield on a tie; -1 when nowhere holds more than `AIRFIELD.least`.
 */
function pickTarget(game: Game, s: Structure): number {
  let best = -1;
  let bestSum: number = AIRFIELD.least;
  let bestD = Infinity;
  for (let y = 0; y < game.h; y++) {
    for (let x = 0; x < game.w; x++) {
      const i = y * game.w + x;
      if (game.height[i] === ROCK) continue;
      let sum = 0;
      within(game.w, game.h, x, y, AIRFIELD.area, (j) => {
        sum += game.silt[j] ?? 0;
      });
      if (sum < bestSum) continue;
      const d = distance(s.x, s.y, x, y);
      if (sum === bestSum && (best < 0 || d >= bestD)) continue;
      best = i;
      bestSum = sum;
      bestD = d;
    }
  }
  return best;
}

function airfield(game: Game, s: Structure, events: Event[]): void {
  if (s.cooldown > 0 || s.energy < KINDS.airfield.store || planeOf(game, s.id)) return;
  const best = pickTarget(game, s);
  if (best < 0) {
    s.cooldown = AIRFIELD.idle;
    return;
  }
  s.energy = 0;
  s.target = best;
  const from = centre(s.x, s.y);
  const to = centre(best % game.w, Math.floor(best / game.w));
  const far = Math.hypot(to.x - from.x, to.y - from.y);
  const every = AIRFIELD.run / AIRFIELD.bombs;
  game.planes.push({
    id: game.nextId++,
    base: s.id,
    x: from.x,
    y: from.y,
    tx: to.x,
    ty: to.y,
    heading: far > 0 ? Math.atan2(to.y - from.y, to.x - from.x) : 0,
    leg: "out",
    bombs: AIRFIELD.bombs,
    // The bombs fall in the middle of equal stretches of the run; a target closer than half the run is bombed
    // from the airfield on.
    next: Math.max(0, far - AIRFIELD.run / 2 + every / 2),
  });
  events.push({ kind: "takeoff", id: s.id, x: s.x, y: s.y });
}

/** Silt does not touch a plane: it only drops its bombs and comes home, or is lost with its airfield. */
function stepPlanes(game: Game, events: Event[]): void {
  const kept: Plane[] = [];
  for (const plane of game.planes) {
    const base = game.structures.find((o) => o.id === plane.base);
    if (!base) continue;
    if (plane.leg === "out") {
      plane.x += Math.cos(plane.heading) * AIRFIELD.speed;
      plane.y += Math.sin(plane.heading) * AIRFIELD.speed;
      plane.next -= AIRFIELD.speed;
      while (plane.next <= 0 && plane.bombs > 0) {
        bomb(game, plane, events);
        plane.bombs -= 1;
        plane.next += AIRFIELD.run / AIRFIELD.bombs;
      }
      if (plane.bombs === 0) plane.leg = "back";
      kept.push(plane);
      continue;
    }
    const home = centre(base.x, base.y);
    const dx = home.x - plane.x;
    const dy = home.y - plane.y;
    const left = Math.hypot(dx, dy);
    if (left <= AIRFIELD.speed) {
      base.target = -1;
      events.push({ kind: "landed", id: base.id });
      continue;
    }
    plane.heading = Math.atan2(dy, dx);
    plane.x += (dx / left) * AIRFIELD.speed;
    plane.y += (dy / left) * AIRFIELD.speed;
    kept.push(plane);
  }
  game.planes = kept;
}

function bomb(game: Game, plane: Plane, events: Event[]): void {
  const at = tileAtPoint(plane.x, plane.y);
  within(game.w, game.h, at.x, at.y, AIRFIELD.blast, (i, d) => {
    take(game, i, AIRFIELD.removes * (1 - d / (AIRFIELD.blast + 1)));
  });
  events.push({ kind: "impact", x: at.x, y: at.y, radius: AIRFIELD.blast });
}

function pump(game: Game, s: Structure): void {
  if (game.tick % FLOW_EVERY !== 0) return;
  let taken = 0;
  within(game.w, game.h, s.x, s.y, KINDS.pump.range, (i) => {
    taken += take(game, i, PUMP.removes);
  });
  if (taken > 0) gain(game, taken * PUMP.yield, "pump");
}

function baffle(game: Game, s: Structure): void {
  if (s.energy <= 0) return;
  s.progress += 1;
  if (s.progress >= BAFFLE.drainEvery) {
    s.progress = 0;
    s.energy = Math.max(0, s.energy - 1);
  }
}

/** Rebuilds the baffle field from every powered baffle. */
export function projectBaffles(game: Game): void {
  game.baffle.fill(0);
  for (const s of game.structures) {
    if (s.kind !== "baffle" || !s.built || !s.active || s.energy <= 0) continue;
    within(game.w, game.h, s.x, s.y, KINDS.baffle.range, (i) => {
      game.baffle[i] = BAFFLE.lift;
    });
  }
}

/**
 * Where a glob or shell is right now, as a position in tile units (see centre()), not a tile: it flies in a
 * straight line from the centre of its start tile to the centre of its target tile.
 */
export function globAt(g: { sx: number; sy: number; tx: number; ty: number; t: number; duration: number }): Point {
  const f = g.t / g.duration;
  const a = centre(g.sx, g.sy);
  const b = centre(g.tx, g.ty);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

function interceptor(game: Game, s: Structure, events: Event[]): void {
  if (s.cooldown > 0 || s.energy < INTERCEPTOR.cost) return;
  let best: (typeof game.globs)[number] | undefined;
  let bestD: number = KINDS.interceptor.range;
  for (const g of game.globs) {
    // In range when the tile the glob is over right now is.
    const p = globAt(g);
    const over = tileAtPoint(p.x, p.y);
    const d = distance(s.x, s.y, over.x, over.y);
    if (d <= bestD) {
      best = g;
      bestD = d;
    }
  }
  if (!best) return;
  const p = globAt(best);
  best.hp -= 1;
  s.energy -= INTERCEPTOR.cost;
  s.cooldown = INTERCEPTOR.every;
  const kill = best.hp <= 0;
  if (kill) game.globs = game.globs.filter((g) => g !== best);
  events.push({ kind: "intercept", id: s.id, x: p.x, y: p.y, kill });
}

function gradeable(game: Game, i: number): boolean {
  const mark = game.mark[i] ?? -1;
  const ground = game.height[i] ?? ROCK;
  return mark >= 0 && ground !== ROCK && ground !== mark && game.occ[i] === 0;
}

function grader(game: Game, s: Structure, events: Event[]): void {
  if (s.energy < GRADER.cost) return;
  if (s.target < 0 || !gradeable(game, s.target)) {
    s.target = -1;
    s.progress = 0;
    let bestD = Infinity;
    within(game.w, game.h, s.x, s.y, KINDS.grader.range, (i, d) => {
      if (d < bestD && gradeable(game, i)) {
        s.target = i;
        bestD = d;
      }
    });
    if (s.target < 0) return;
  }
  s.progress += 1;
  if (s.progress < GRADER.work) return;
  s.progress = 0;
  s.energy -= GRADER.cost;
  const i = s.target;
  const ground = game.height[i] ?? 0;
  const mark = game.mark[i] ?? 0;
  const next = Math.min(MAX_HEIGHT, ground + Math.sign(mark - ground));
  game.height[i] = next;
  if (next === mark) game.mark[i] = -1;
  // Ground that changed height may now lie at a pylon's level, or no longer.
  updateHarvest(game);
  events.push({ kind: "graded", tile: i });
}

export function stepWeapons(game: Game, events: Event[]): void {
  for (const s of game.structures) {
    if (s.cooldown > 0) s.cooldown -= 1;
    if (!s.built || !s.active) continue;
    switch (s.kind) {
      case "lance":
        lance(game, s, events);
        break;
      case "lobber":
        lobber(game, s, events);
        break;
      case "pump":
        pump(game, s);
        break;
      case "baffle":
        baffle(game, s);
        break;
      case "interceptor":
        interceptor(game, s, events);
        break;
      case "grader":
        grader(game, s, events);
        break;
      case "airfield":
        airfield(game, s, events);
        break;
      default:
        break;
    }
  }
  stepShells(game, events);
  stepPlanes(game, events);
}
