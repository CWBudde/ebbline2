// Builds a fresh game from a level definition: terrain, lander, vents, spitters and lodes.

import { centre, distance, within, type Tile } from "./hex.ts";
import { int, next, type RngState } from "./rng.ts";
import {
  KINDS,
  footprint,
  MAX_HEIGHT,
  ROCK,
  type Game,
  type LevelDef,
  type Structure,
} from "./state.ts";

export const START_ENERGY = 20;
export const BASE_CAPACITY = 30;

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * One octave of value noise over a size×size map with the given number of lattice cells. It is sampled at the
 * tile centres, so the half-tile shift of odd rows does not shear the landforms.
 */
function octave(rng: RngState, size: number, cells: number): Float32Array {
  const n = cells + 1;
  const lattice = new Float32Array(n * n);
  for (let i = 0; i < lattice.length; i++) lattice[i] = next(rng);
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Centres stay below size in both directions, so the lattice is never overrun.
      const at = centre(x, y);
      const fy = (at.y / size) * cells;
      const y0 = Math.floor(fy);
      const ty = smooth(fy - y0);
      const fx = (at.x / size) * cells;
      const x0 = Math.floor(fx);
      const tx = smooth(fx - x0);
      const a = lattice[y0 * n + x0] as number;
      const b = lattice[y0 * n + x0 + 1] as number;
      const c = lattice[(y0 + 1) * n + x0] as number;
      const d = lattice[(y0 + 1) * n + x0 + 1] as number;
      out[y * size + x] =
        (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
  }
  return out;
}

/** Fractal noise normalised to 0..1. */
function fractal(rng: RngState, size: number, cells: number): Float32Array {
  const sum = new Float32Array(size * size);
  let amplitude = 1;
  for (let o = 0; o < 4; o++) {
    const layer = octave(rng, size, cells << o);
    for (let i = 0; i < sum.length; i++) {
      sum[i] = (sum[i] as number) + (layer[i] as number) * amplitude;
    }
    amplitude /= 2;
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of sum) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  const range = hi - lo || 1;
  for (let i = 0; i < sum.length; i++) sum[i] = ((sum[i] as number) - lo) / range;
  return sum;
}

/** Whether p is at least `min` steps from every other tile. */
function far(p: Tile, others: readonly Tile[], min: number): boolean {
  return others.every((o) => distance(o.x, o.y, p.x, p.y) >= min);
}

export function generate(level: LevelDef): Game {
  const size = level.size;
  const rng: RngState = { rng: level.seed | 0 };
  const height = new Int8Array(size * size);
  const relief = fractal(rng, size, 3);
  const stone = fractal(rng, size, 8);
  for (let i = 0; i < height.length; i++) {
    height[i] =
      (stone[i] as number) > 0.82
        ? ROCK
        : Math.min(MAX_HEIGHT, Math.floor((relief[i] as number) * 10));
  }
  const at = (x: number, y: number): number => height[y * size + x] as number;

  // The lander takes one of the highest spots away from the edge, or middling ground near the centre.
  let best = -1;
  for (let y = 5; y < size - 5; y++) {
    for (let x = 5; x < size - 5; x++) best = Math.max(best, at(x, y));
  }
  const spots: Tile[] = [];
  const middle = size >> 1;
  for (let y = 5; y < size - 5; y++) {
    for (let x = 5; x < size - 5; x++) {
      const fits =
        level.lowStart === true
          ? at(x, y) === Math.ceil(best / 2) &&
            distance(x, y, middle, middle) < size / 4
          : at(x, y) >= best - 1;
      if (fits) spots.push({ x, y });
    }
  }
  const lander = spots[int(rng, spots.length)] ?? {
    x: size >> 1,
    y: size >> 1,
  };
  // The lander's own seven tiles are levelled; the two rings around them only lose their rock.
  const ground = Math.max(0, at(lander.x, lander.y));
  within(size, size, lander.x, lander.y, 3, (i, steps) => {
    if (steps <= KINDS.lander.radius || height[i] === ROCK) height[i] = ground;
  });
  const fromLander = (p: Tile): number => distance(p.x, p.y, lander.x, lander.y);

  // Vents sit in the lowest ground far from the lander, spread apart.
  const low: (Tile & { key: number })[] = [];
  for (let y = 3; y < size - 3; y++) {
    for (let x = 3; x < size - 3; x++) {
      const p = { x, y };
      if (at(x, y) !== ROCK && fromLander(p) >= size * 0.35) {
        low.push({ x, y, key: at(x, y) + next(rng) * 0.99 });
      }
    }
  }
  low.sort((a, b) => a.key - b.key);
  const vents: Tile[] = [];
  for (let spread = size * 0.25; vents.length < level.vents.count; spread /= 2) {
    for (const p of low) {
      if (vents.length >= level.vents.count) break;
      if (far(p, vents, spread)) vents.push({ x: p.x, y: p.y });
    }
    if (spread < 1) break;
  }

  const taken: Tile[] = [lander, ...vents];
  const pick = (ok: (p: Tile) => boolean, gap: number): Tile | undefined => {
    for (let tries = 0; tries < 400; tries++) {
      const p = { x: 2 + int(rng, size - 4), y: 2 + int(rng, size - 4) };
      if (at(p.x, p.y) !== ROCK && far(p, taken, gap) && ok(p)) {
        taken.push(p);
        return p;
      }
    }
    return undefined;
  };

  const spitters: Tile[] = [];
  for (let n = 0; n < level.spitters.count; n++) {
    const p = pick((q) => fromLander(q) >= size * 0.4, 6);
    if (p) spitters.push(p);
  }

  // Two lodes within reach of the lander, the rest further out.
  const lode = new Uint8Array(size * size);
  for (let n = 0; n < level.lodes; n++) {
    const p =
      n < 2
        ? pick((q) => fromLander(q) >= 3 && fromLander(q) <= 5, 3)
        : pick((q) => fromLander(q) >= 7 && fromLander(q) <= size * 0.6, 6);
    if (p) lode[p.y * size + p.x] = 1;
  }

  const game: Game = {
    level,
    w: size,
    h: size,
    tick: 0,
    rng: rng.rng,
    phase: "playing",
    height,
    silt: new Float32Array(size * size),
    siltNext: new Float32Array(size * size),
    lode,
    mark: new Int8Array(size * size).fill(-1),
    occ: new Int32Array(size * size),
    baffle: new Uint8Array(size * size),
    structures: [],
    packets: [],
    shells: [],
    globs: [],
    vents: vents.map((p, n) => ({
      x: p.x,
      y: p.y,
      period: level.vents.period,
      amount: level.vents.amount,
      ramp: level.vents.ramp,
      // Staggered so the vents do not pulse in unison.
      timer: level.vents.period + n * 17,
      capped: false,
      pressure: 0,
    })),
    spitters: spitters.map((p, n) => ({
      x: p.x,
      y: p.y,
      period: level.spitters.period,
      amount: level.spitters.amount,
      timer: level.spitters.period + n * 131,
    })),
    nextId: 2,
    energy: START_ENERGY,
    capacity: BASE_CAPACITY,
    landerId: 1,
    links: [],
    gridDirty: true,
    cursor: 0,
    dispatchWait: 0,
    stats: { spent: 0, built: 0, lost: 0, removed: 0 },
    rateIn: 0,
    rateOut: 0,
    accIn: 0,
    accOut: 0,
  };
  const base: Structure = {
    id: 1,
    kind: "lander",
    x: lander.x,
    y: lander.y,
    health: KINDS.lander.cost,
    built: true,
    active: true,
    energy: 0,
    pendingBuild: 0,
    pendingEnergy: 0,
    cooldown: 0,
    progress: 0,
    target: -1,
    dist: 0,
    parent: 0,
  };
  game.structures.push(base);
  for (const i of footprint(game, "lander", lander.x, lander.y)) game.occ[i] = base.id;
  return game;
}
