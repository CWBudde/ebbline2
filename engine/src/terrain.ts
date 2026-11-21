// Builds a fresh game from a level definition: terrain, lander, vents, spitters and lodes.

import { ROW, centre, distance, extent, span, tileAtPoint, within, type Tile } from "./hex.ts";
import { emptyHistory, sample } from "./history.ts";
import { prepareMovingGround, rotateBend, unrotateBend } from "./movingFloor.ts";
import { int, next, type RngState } from "./rng.ts";
import { flow, stepVents, VENT_STAGGER } from "./silt.ts";
import {
  FLOW_EVERY,
  KINDS,
  TICK_HZ,
  footprint,
  MAX_HEIGHT,
  ROCK,
  emptyFlow,
  type Game,
  type LevelDef,
  type Structure,
  type VentTweak,
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
  normalise(sum);
  return sum;
}

/** Stretches the values to fill 0..1 again. */
function normalise(values: Float32Array): void {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  const range = hi - lo || 1;
  for (let i = 0; i < values.length; i++) values[i] = ((values[i] as number) - lo) / range;
}

/** Where a landform puts the lander and the vents, for the landforms that decide it themselves. */
interface Ends {
  /** The lander goes on one of the tiles within two steps of this one. */
  readonly lander: Tile;
  /** The vents take the lowest ground within `reach` steps of this one. */
  readonly vents: Tile;
  readonly reach: number;
  /** 1 on every tile the landform makes rock, whatever the stone noise says. */
  readonly rock?: Uint8Array;
}

/**
 * The horseshoe valley, in tile units: two arms running north from a bend in the south of the map, the vents' arm
 * to the east and the lander's to the west. Its floor falls gently from the end of the vents' arm, all the way round
 * the bend, to the end of the lander's arm, so the silt runs round to the lander. The rims stand at the top height,
 * and a thin spine of rock along the crest of the spur between the arms keeps a full vents' arm from spilling
 * straight across to the lander; the grid still reaches over it. For the shoal bend the valley is a little wider
 * and the whole layout is turned (see rotateBend), so `at` and `spine` take points of the unturned layout while the
 * ends are tiles of the map.
 */
function horseshoe(size: number, shoals: boolean): {
  /** Distance to the valley's middle line and how far along it, from 0 at the vents to 1 at the lander. */
  readonly at: (px: number, py: number) => { readonly off: number; readonly along: number };
  /** How far a point lies from the rock spine along the spur's crest, which keeps the silt from going over it. */
  readonly spine: (px: number, py: number) => number;
  readonly half: number;
  readonly ends: Ends;
} {
  const bx = size * 0.5;
  const by = size * ROW * 0.5;
  const arm = size * 0.17;
  const top = size * ROW * 0.18;
  const half = size * (shoals ? 0.104 : 0.1);
  const length = 2 * (by - top) + Math.PI * arm;
  const at = (px: number, py: number): { off: number; along: number } => {
    if (py > by) {
      const angle = Math.atan2(py - by, px - bx);
      return {
        off: Math.abs(Math.hypot(px - bx, py - by) - arm),
        along: (by - top + Math.max(0, angle) * arm) / length,
      };
    }
    const y = Math.max(top, py);
    const east = Math.hypot(px - bx - arm, py - y);
    const west = Math.hypot(px - bx + arm, py - y);
    return east < west
      ? { off: east, along: (y - top) / length }
      : { off: west, along: 1 - (y - top) / length };
  };
  const end = (x: number, y: number): Tile => {
    const p = shoals ? rotateBend({ x, y }, size) : { x, y };
    return tileAtPoint(p.x, p.y);
  };
  return {
    at,
    spine: (px, py) => Math.hypot(px - bx, Math.max(0, py - by - (arm - half) * 0.5)),
    half,
    ends: {
      lander: end(bx - arm, top + 1),
      vents: end(bx + arm, top + half * 0.6),
      reach: Math.round(half),
    },
  };
}

// The islands of the shoal bend, in its unturned layout: centre x, y and radius as fractions of the map's width,
// and the height of the top on the 0..1 relief.
const BEND_ISLANDS = [
  [0.335, 0.165, 0.09, 0.47], // Landing headland.
  [0.363, 0.326, 0.064, 0.72],
  [0.404, 0.541, 0.069, 0.80],
  [0.558, 0.556, 0.065, 0.74],
  [0.681, 0.399, 0.064, 0.94],
] as const;

/**
 * Bends 0..1 relief into the given landform, in place; "hills" leaves it as it is. Returns where the lander and
 * the vents go, and where there must be rock, if the landform decides that.
 */
function shape(relief: Float32Array, size: number, level: LevelDef): Ends | undefined {
  const landform = level.landform ?? "hills";
  if (landform === "hills") return undefined;
  const shoals = landform === "shoal-bend";
  if (landform === "horseshoe" || shoals) {
    const valley = horseshoe(size, shoals);
    const rock = new Uint8Array(relief.length);
    for (let i = 0; i < relief.length; i++) {
      const r = relief[i] as number;
      const tile = centre(i % size, Math.floor(i / size));
      const p = shoals ? unrotateBend(tile, size) : tile;
      const { off, along } = valley.at(p.x, p.y);
      if (valley.spine(p.x + (r - 0.5) * 3, p.y) < 1.2) rock[i] = 1;
      // The noise makes the walls wander a little and roughens the floor.
      const inside = smooth(Math.max(0, Math.min(1, (valley.half + 1.5 - off - (r - 0.5) * 4) / 3)));
      // The rims stand at the top height, so the silt has to go round; further off, the high ground rolls a little.
      const wall = 1 - 0.3 * r * smooth(Math.max(0, Math.min(1, (off - valley.half - 4) / 6)));
      const floor = 0.02 + 0.4 * (1 - along) + 0.12 * (r - 0.5);
      let elevation = wall + (floor - wall) * inside;
      if (shoals) {
        // Island shores follow the channel's existing noise so they break up the bend unevenly.
        for (const [x, y, radius, top] of BEND_ISLANDS) {
          const distance = Math.hypot(p.x - x * size, p.y - y * size) + (r - 0.5) * 2;
          const shore = smooth(Math.max(0, Math.min(1, (radius * size - distance) / 2)));
          elevation = Math.max(elevation, floor + (top - floor) * shore);
        }
      }
      relief[i] = elevation;
    }
    normalise(relief);
    return { ...valley.ends, rock };
  }
  const mid = centre(size >> 1, size >> 1);
  for (let i = 0; i < relief.length; i++) {
    const r = relief[i] as number;
    const x = i % size;
    const y = Math.floor(i / size);
    // 0 in the middle of the map, 1 at the middle of each edge.
    const out = Math.min(1, span(x, y, Math.round(mid.x), Math.round(mid.y)) / (size / 2));
    switch (landform) {
      case "basin":
        relief[i] = 0.4 * r + 0.6 * out * out;
        break;
      case "mesa": {
        const lift = smooth(Math.max(0, Math.min(1, (0.75 - out) / 0.3)));
        relief[i] = 0.35 * r + 0.65 * lift;
        break;
      }
      case "ridges":
        relief[i] = 1 - Math.abs(2 * r - 1);
        break;
      case "channels":
        relief[i] = Math.sqrt(Math.abs(2 * r - 1));
        break;
      case "terraces":
        relief[i] = Math.min(3, Math.floor(r * 4)) / 3;
        break;
    }
  }
  if (landform !== "terraces") normalise(relief);
  return undefined;
}

/** Distance between the centres of neighbouring islands of an archipelago, in tile units, before the jitter. */
const ISLE_SPACING = 13;
/** Radius of the smallest island before the noise bends its shore; the largest is half as wide again. */
const ISLE_RADIUS = 3.6;
/** Land that comes out smaller than this many tiles is too small to count as an island and goes under again. */
const ISLE_LEAST = 20;
/** Where two islands come closer than this, in island radii, the sea runs between them. */
const ISLE_STRAIT = 0.3;

/**
 * An archipelago: islands with steep shores standing out of a low sea floor, spread over the map on a jittered
 * grid and within about a factor of three of each other in area. Each island starts as an ellipse, turned and
 * stretched at random, whose shore the noise bends. Rewrites `relief` so that the usual tenfold scaling gives the
 * sea floor heights 0 to 2 and the islands' tops 6 to 9 behind a shore that starts at 4, and clears `stone` on the
 * sea floor so no rock stands in the sea. Returns the tile indices of each island.
 */
function archipelago(rng: RngState, relief: Float32Array, stone: Float32Array, size: number): number[][] {
  const wobble = fractal(rng, size, Math.round(size / 5));
  const { width, height } = extent(size, size);
  const across = Math.max(1, Math.round(width / ISLE_SPACING));
  const down = Math.max(1, Math.round(height / ISLE_SPACING));
  const isles: { x: number; y: number; r: number; cos: number; sin: number; stretch: number; top: number }[] = [];
  for (let row = 0; row < down; row++) {
    for (let col = 0; col < across; col++) {
      const angle = next(rng) * Math.PI;
      isles.push({
        x: ((col + 0.5 + (next(rng) - 0.5) * 0.6) * width) / across,
        y: ((row + 0.5 + (next(rng) - 0.5) * 0.6) * height) / down,
        r: ISLE_RADIUS * (1 + next(rng) * 0.5),
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        stretch: Math.sqrt(1 + next(rng) * 0.8),
        top: 7 + int(rng, 3),
      });
    }
  }
  const floor = new Int8Array(size * size);
  const land = new Int8Array(size * size);
  for (let i = 0; i < relief.length; i++) {
    const r = relief[i] as number;
    floor[i] = Math.min(2, Math.floor(r * 3));
    const p = centre(i % size, Math.floor(i / size));
    // How far out the tile lies on the island it is most part of, in island radii: below 1 is land.
    let reach = Infinity;
    let other = Infinity;
    let top = 0;
    for (const c of isles) {
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const u = (dx * c.cos + dy * c.sin) / c.stretch;
      const v = (dy * c.cos - dx * c.sin) * c.stretch;
      const q = Math.hypot(u, v) / c.r;
      if (q < reach) {
        other = reach;
        reach = q;
        top = c.top;
      } else if (q < other) {
        other = q;
      }
    }
    // Where two islands would meet, a strait keeps them apart.
    const strait = other - reach < ISLE_STRAIT;
    reach += ((wobble[i] as number) - 0.5) * 0.9;
    // Two steps of shore, then the island's top, which the broad noise dents by a step here and there.
    land[i] = reach < 1 && !strait ? Math.min(top - Math.floor(r * 2), 4 + Math.floor((1 - reach) * 12)) : 0;
  }
  // The islands as they came out: every group of touching land tiles. Specks sink back into the sea.
  const islands: number[][] = [];
  const seen = new Uint8Array(size * size);
  for (let start = 0; start < land.length; start++) {
    if (land[start] === 0 || seen[start] === 1) continue;
    const island = [start];
    seen[start] = 1;
    for (let k = 0; k < island.length; k++) {
      const i = island[k] as number;
      within(size, size, i % size, Math.floor(i / size), 1, (j) => {
        if (land[j] !== 0 && seen[j] !== 1) {
          seen[j] = 1;
          island.push(j);
        }
      });
    }
    if (island.length >= ISLE_LEAST) islands.push(island);
    else for (const i of island) land[i] = 0;
  }
  for (let i = 0; i < relief.length; i++) {
    const h = land[i] === 0 ? (floor[i] as number) : (land[i] as number);
    if (land[i] === 0) stone[i] = 0;
    relief[i] = (h + 0.5) / 10;
  }
  return islands;
}

/** Radius of Atlantis as a share of the map's width, before the noise bends its shore. */
const ATLANTIS_RADIUS = 0.3;
/** Islets round Atlantis: how many, how far out from the middle as a share of the width, and their radius. */
const ISLETS = 4;
const ISLET_OUT = 0.43;
const ISLET_RADIUS = 2.6;

/**
 * Atlantis: one great island in the middle of the map, whose shore stands at 5 and climbs a step every two or three
 * tiles to a crown at the top height, and a few small islets far out round it. Rewrites `relief` so that the usual
 * tenfold scaling gives the sea floor heights 0 to 2, and clears `stone` on the sea floor so no rock stands in it.
 */
function atlantis(rng: RngState, relief: Float32Array, stone: Float32Array, size: number): void {
  const wobble = fractal(rng, size, Math.round(size / 6));
  const { width, height } = extent(size, size);
  const mid = { x: width / 2, y: height / 2 };
  const radius = ATLANTIS_RADIUS * width;
  const first = next(rng) * 2 * Math.PI;
  const islets = Array.from({ length: ISLETS }, (_, n) => {
    const angle = first + ((n + (next(rng) - 0.5) * 0.4) * 2 * Math.PI) / ISLETS;
    return { x: mid.x + Math.cos(angle) * ISLET_OUT * width, y: mid.y + Math.sin(angle) * ISLET_OUT * width };
  });
  for (let i = 0; i < relief.length; i++) {
    const r = relief[i] as number;
    const bend = (wobble[i] as number) - 0.5;
    const p = centre(i % size, Math.floor(i / size));
    const floor = Math.min(2, Math.floor(r * 3));
    let h = floor;
    const reach = Math.hypot(p.x - mid.x, p.y - mid.y) / radius + bend * 0.35;
    if (reach < 1) h = Math.min(MAX_HEIGHT, 5 + Math.floor((1 - reach) * 6.5 + (r - 0.5) * 1.5));
    for (const c of islets) {
      const out = Math.hypot(p.x - c.x, p.y - c.y) / ISLET_RADIUS + bend * 0.5;
      if (out < 1) h = Math.max(h, out < 0.5 ? 6 : 5);
    }
    if (h === floor) stone[i] = 0;
    relief[i] = (h + 0.5) / 10;
  }
}

/** Radius of the levee's ring as a share of the map's width, before the noise bends it. */
const LEVEE_RADIUS = 0.36;
/** How far the levee reaches either side of its line, in tiles: about two tiles thick. */
const LEVEE_HALF = 1.05;
/** Low places in the levee, level with the sea, where it spills over as it rises; and their half width in tiles. */
const NOTCHES = 3;
const NOTCH_HALF = 1.3;
/** Rocks standing out of the sea beyond the levee, for the spitters. */
const SKERRIES = 3;
const SKERRY_OUT = 0.47;
const SKERRY_RADIUS = 1.8;

/**
 * A levee: a wide, low basin in the middle of the map with only small rises, ringed by a thin wall two tiles thick
 * whose crest stands one to three steps above `sea`, except at a few notches level with it, where the sea outside
 * spills in as soon as it rises. Outside lies a low sea floor and a few skerries. Rewrites `relief` as atlantis does, clears `stone`
 * outside the basin, and returns the middle of the basin for the lander.
 */
function levee(rng: RngState, relief: Float32Array, stone: Float32Array, size: number, sea: number): Tile {
  const wobble = fractal(rng, size, Math.round(size / 6));
  const crest = fractal(rng, size, Math.round(size / 4));
  const { width, height } = extent(size, size);
  const mid = { x: width / 2, y: height / 2 };
  const radius = LEVEE_RADIUS * width;
  const first = next(rng) * 2 * Math.PI;
  const notches = Array.from(
    { length: NOTCHES },
    (_, n) => first + ((n + (next(rng) - 0.5) * 0.5) * 2 * Math.PI) / NOTCHES,
  );
  const skerries = Array.from({ length: SKERRIES }, (_, n) => {
    const angle = first + Math.PI / NOTCHES + ((n + (next(rng) - 0.5) * 0.4) * 2 * Math.PI) / SKERRIES;
    return { x: mid.x + Math.cos(angle) * SKERRY_OUT * width, y: mid.y + Math.sin(angle) * SKERRY_OUT * width };
  });
  for (let i = 0; i < relief.length; i++) {
    const r = relief[i] as number;
    const p = centre(i % size, Math.floor(i / size));
    const d = Math.hypot(p.x - mid.x, p.y - mid.y);
    const angle = Math.atan2(p.y - mid.y, p.x - mid.x);
    const ring = d - radius * (1 + ((wobble[i] as number) - 0.5) * 0.25);
    let h: number;
    if (Math.abs(ring) <= LEVEE_HALF) {
      const notched = notches.some((a) => {
        const off = Math.abs(((angle - a + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
        return off * d < NOTCH_HALF;
      });
      h = notched ? sea : Math.min(MAX_HEIGHT, sea + 1 + Math.floor((crest[i] as number) * 2.99));
      stone[i] = 0;
    } else if (ring < 0) {
      h = 1 + Math.min(2, Math.floor(r * 2.6));
    } else {
      h = Math.min(2, Math.floor(r * 3));
      stone[i] = 0;
    }
    for (const c of skerries) {
      if (Math.hypot(p.x - c.x, p.y - c.y) < SKERRY_RADIUS) h = sea + 2;
    }
    relief[i] = (h + 0.5) / 10;
  }
  return tileAtPoint(mid.x, mid.y);
}

/** The noise level above which `share` of the values lie. */
function quantile(values: Float32Array, share: number): number {
  const sorted = Float32Array.from(values).sort();
  const at = Math.min(sorted.length - 1, Math.max(0, Math.floor((1 - share) * sorted.length)));
  return sorted[at] ?? 1;
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
  const ends = shape(relief, size, level);
  // An archipelago draws its islands over the noise that shape() left alone.
  const isles = level.landform === "archipelago" ? archipelago(rng, relief, stone, size) : undefined;
  if (level.landform === "atlantis") atlantis(rng, relief, stone, size);
  const basin = level.landform === "levee" ? levee(rng, relief, stone, size, level.sea ?? 6) : undefined;
  const rockAbove = level.rock === undefined ? 0.82 : quantile(stone, level.rock);
  for (let i = 0; i < height.length; i++) {
    height[i] =
      (stone[i] as number) > rockAbove || ends?.rock?.[i] === 1
        ? ROCK
        : Math.min(MAX_HEIGHT, Math.floor((relief[i] as number) * 10));
  }
  const at = (x: number, y: number): number => height[y * size + x] as number;

  // The lander takes the spot its landform gives it, or else one of the highest spots away from the edge, or
  // middling ground near the centre.
  const spots: Tile[] = [];
  const home = ends?.lander ?? basin;
  if (home) {
    within(size, size, home.x, home.y, 2, (i, _steps, x, y) => {
      if (height[i] !== ROCK) spots.push({ x, y });
    });
  } else if (isles) {
    // Away from the map's edge on the island of middling size, among those with room for the lander and a ring of
    // land round it.
    const room = isles
      .map((island) => {
        const own = new Set(island);
        const inland: Tile[] = [];
        for (const i of island) {
          const x = i % size;
          const y = Math.floor(i / size);
          let fits = height[i] !== ROCK && x >= 5 && y >= 5 && x < size - 5 && y < size - 5;
          within(size, size, x, y, 2, (j) => {
            if (!own.has(j)) fits = false;
          });
          if (fits) inland.push({ x, y });
        }
        return { tiles: island.length, inland };
      })
      .filter((island) => island.inland.length > 0)
      .sort((a, b) => a.tiles - b.tiles);
    spots.push(...(room[room.length >> 1]?.inland ?? []));
  } else {
    let best = -1;
    for (let y = 5; y < size - 5; y++) {
      for (let x = 5; x < size - 5; x++) best = Math.max(best, at(x, y));
    }
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
  }
  const lander = spots[int(rng, spots.length)] ?? { x: size >> 1, y: size >> 1 };
  // The lander's own seven tiles are levelled; the two rings around them only lose their rock.
  const ground = Math.max(0, at(lander.x, lander.y));
  within(size, size, lander.x, lander.y, 3, (i, steps) => {
    if (steps <= KINDS.lander.radius || height[i] === ROCK) height[i] = ground;
  });
  prepareMovingGround(height, size, level, lander);
  const fromLander = (p: Tile): number => distance(p.x, p.y, lander.x, lander.y);

  // Vents sit in the lowest ground far from the lander, or where the landform puts them, spread apart.
  const ventArea = (p: Tile): boolean =>
    ends ? distance(p.x, p.y, ends.vents.x, ends.vents.y) <= ends.reach : fromLander(p) >= size * 0.35;
  const low: (Tile & { key: number })[] = [];
  for (let y = 3; y < size - 3; y++) {
    for (let x = 3; x < size - 3; x++) {
      const p = { x, y };
      if (at(x, y) !== ROCK && ventArea(p)) {
        low.push({ x, y, key: at(x, y) + next(rng) * 0.99 });
      }
    }
  }
  low.sort((a, b) => a.key - b.key);
  const vents: Tile[] = [];
  const near = level.vents.near;
  if (near !== undefined && level.vents.count > 0) {
    // The lowest ground in a ring around the lander, a little way off.
    let first: (Tile & { key: number }) | undefined;
    for (let y = 3; y < size - 3; y++) {
      for (let x = 3; x < size - 3; x++) {
        const p = { x, y };
        const d = fromLander(p);
        if (at(x, y) === ROCK || d < near || d > near + 2) continue;
        const key = at(x, y) + next(rng) * 0.99;
        if (!first || key < first.key) first = { x, y, key };
      }
    }
    if (first) vents.push({ x: first.x, y: first.y });
  }
  for (let spread = ends ? ends.reach : size * 0.25; vents.length < level.vents.count; spread /= 2) {
    for (const p of low) {
      if (vents.length >= level.vents.count) break;
      if (far(p, vents, spread)) vents.push({ x: p.x, y: p.y });
    }
    if (spread < 1) break;
  }

  // Per-vent tweaks count from the vent nearest the lander.
  const nearest = [...vents].sort((a, b) => fromLander(a) - fromLander(b));
  const tweaks = vents.map((p): VentTweak => level.vents.each?.[nearest.indexOf(p)] ?? {});

  const taken: Tile[] = [lander, ...vents];
  // With a sea on the map, lodes and spitters stand on land above it, or in a dry basin below it.
  const wet = seaCover(height, size, level.sea);
  const ashore = (p: Tile): boolean =>
    level.sea === undefined || at(p.x, p.y) > level.sea || (at(p.x, p.y) < level.sea && wet[p.y * size + p.x] === 0);
  const pick = (ok: (p: Tile) => boolean, gap: number): Tile | undefined => {
    for (let tries = 0; tries < 400; tries++) {
      const p = { x: 2 + int(rng, size - 4), y: 2 + int(rng, size - 4) };
      if (at(p.x, p.y) !== ROCK && far(p, taken, gap) && ashore(p) && ok(p)) {
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
    harvest: new Uint8Array(size * size),
    harvestRev: 0,
    structures: [],
    packets: [],
    shells: [],
    planes: [],
    globs: [],
    vents: vents.map((p, n) => {
      const tweak = tweaks[n] ?? {};
      const period = tweak.period ?? level.vents.period;
      return {
        x: p.x,
        y: p.y,
        period,
        amount: level.vents.amount * (tweak.amount ?? 1),
        ramp: level.vents.ramp,
        // Staggered so the vents do not pulse in unison.
        timer: period + n * VENT_STAGGER + Math.round((tweak.delay ?? 0) * TICK_HZ),
        capped: false,
        pressure: 0,
      };
    }),
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
    flow: emptyFlow(),
    history: emptyHistory(),
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
  const sea = level.sea;
  if (sea !== undefined) {
    // Level, as if it had been standing for long: every tile the sea reaches is covered up to its surface.
    height.forEach((ground, i) => {
      if (wet[i] === 1) game.silt[i] = sea - ground;
    });
  }
  if (level.flood !== undefined) {
    preflood(game, level.flood, tweaks.map((t) => (t.delay ?? 0) > 0));
  }
  // The first sample, so the graphs start where the game does.
  sample(game);
  return game;
}

/**
 * The tiles a sea of the given height covers: open ground below its surface that it reaches from the map's edge,
 * so a basin behind a wall above the surface stays dry. All 0 without a sea.
 */
function seaCover(height: Int8Array, size: number, sea: number | undefined): Uint8Array {
  const wet = new Uint8Array(size * size);
  if (sea === undefined) return wet;
  const open = (i: number): boolean => height[i] !== ROCK && (height[i] as number) < sea;
  const queue: number[] = [];
  for (let i = 0; i < wet.length; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    if ((x === 0 || y === 0 || x === size - 1 || y === size - 1) && open(i)) {
      wet[i] = 1;
      queue.push(i);
    }
  }
  for (const i of queue) {
    within(size, size, i % size, Math.floor(i / size), 1, (j) => {
      if (wet[j] === 0 && open(j)) {
        wet[j] = 1;
        queue.push(j);
      }
    });
  }
  return wet;
}

/**
 * Lets the vents run for `seconds` before the game starts, so their pools already stand on the map. Dormant vents
 * (those with a delay) stay dry, the ramp does not grow, and the vents' timers are set back afterwards.
 */
function preflood(game: Game, seconds: number, dormant: readonly boolean[]): void {
  const timers = game.vents.map((v) => v.timer);
  game.vents.forEach((v, n) => {
    v.capped = dormant[n] === true;
  });
  for (let t = 1; t <= seconds * TICK_HZ; t++) {
    stepVents(game, []);
    if (t % FLOW_EVERY === 0) flow(game);
  }
  game.vents.forEach((v, n) => {
    v.capped = false;
    v.timer = timers[n] ?? v.period;
  });
}
