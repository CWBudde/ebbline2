// The ground, baked into one canvas: height-banded hexagons with a material texture overlaid and lit
// and shadowed edges; and the silt, painted into a small image every few frames.

import {
  CORNER,
  CORNERS,
  DIRECTIONS,
  ROCK,
  centre,
  extent,
  neighbourIndices,
  tileAtPoint,
  neighbour,
  tileOf,
  type Game,
} from "@ebbline2/engine";
import { ORIGIN, TILE, tileToWorld, worldSize } from "../camera.ts";

/** Canvas pixels per tile (centre to centre). An 80 × 80 map bakes to about 2600 × 2250 pixels. */
export const BAKE = 32;
/** Canvas pixels per world pixel. */
const SCALE = BAKE / TILE;
/** Tiles covered by one period of a material. */
const PERIOD = 8;
/** Silt image pixels per tile. */
export const SILT_SUB = 5;

/** Tileable textures with a mean luma near 128; each is optional. */
export interface Materials {
  ground?: CanvasImageSource | undefined;
  rock?: CanvasImageSource | undefined;
}

interface Patterns {
  ground: CanvasPattern | null;
  rock: CanvasPattern | null;
  /** Hatching for rock that has no material. */
  hatch: CanvasPattern | null;
}

const PATTERNS = new WeakMap<HTMLCanvasElement, Patterns>();

const STOPS: readonly (readonly [number, number, number, number])[] = [
  [0, 0x13, 0x22, 0x2b],
  [3, 0x2a, 0x47, 0x49],
  [6, 0x5a, 0x78, 0x61],
  [9, 0xb9, 0xc0, 0x96],
];

/** The colour of a terrain height as [r, g, b]. */
export function groundColor(height: number): [number, number, number] {
  let a = STOPS[0] ?? [0, 0, 0, 0];
  let b = STOPS[STOPS.length - 1] ?? a;
  for (let n = 0; n < STOPS.length - 1; n++) {
    const lo = STOPS[n];
    const hi = STOPS[n + 1];
    if (lo && hi && height >= lo[0] && height <= hi[0]) {
      a = lo;
      b = hi;
    }
  }
  const t = b[0] === a[0] ? 0 : (height - a[0]) / (b[0] - a[0]);
  return [
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t),
  ];
}

/** A material scaled so that one period spans PERIOD tiles, as a pattern anchored to the canvas. */
function pattern(ctx: CanvasRenderingContext2D, image: CanvasImageSource | undefined): CanvasPattern | null {
  if (!image) return null;
  try {
    const size = PERIOD * BAKE;
    const scaled = document.createElement("canvas");
    scaled.width = size;
    scaled.height = size;
    const sctx = scaled.getContext("2d");
    if (!sctx) return null;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(image, 0, 0, size, size);
    return ctx.createPattern(scaled, "repeat");
  } catch {
    return null;
  }
}

/** Diagonal hatching, ten pixels apart, as a repeating pattern. */
function hatching(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement("canvas");
  tile.width = 10;
  tile.height = 10;
  const tctx = tile.getContext("2d");
  if (!tctx) return null;
  tctx.strokeStyle = "#1a252b";
  tctx.lineWidth = 2;
  tctx.beginPath();
  for (const d of [-10, 0, 10]) {
    tctx.moveTo(d, 0);
    tctx.lineTo(d + 10, 10);
  }
  tctx.stroke();
  return ctx.createPattern(tile, "repeat");
}

/** Adds a tile's hexagon, centred on (cx, cy) in canvas pixels and grown by `grow` pixels, to a path. */
function hexPath(path: CanvasPath, cx: number, cy: number, grow = 0): void {
  // CORNERS are in tiles; the sides lie BAKE / 2 from the centre, so growing them by `grow` scales by 1 + 2 grow / BAKE.
  const r = BAKE + 2 * grow;
  const first = CORNERS[0];
  if (!first) return;
  path.moveTo(cx + first.x * r, cy + first.y * r);
  for (let k = 1; k < CORNERS.length; k++) {
    const c = CORNERS[k];
    if (c) path.lineTo(cx + c.x * r, cy + c.y * r);
  }
  path.closePath();
}

/** A tile's centre in canvas pixels. */
function at(x: number, y: number): { x: number; y: number } {
  const p = tileToWorld(x, y);
  return { x: p.x * SCALE, y: p.y * SCALE };
}

// Light comes from the north-west. A side faces the light as far as its outward direction (60° × d) points
// toward it: west, north-west and north-east face it, east, south-east and south-west face away.
const LIGHT = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 };
/** Per direction: +1 for a side facing the light, -1 for one facing away. */
const FACING: readonly number[] = Array.from({ length: DIRECTIONS }, (_, d) => {
  const a = (d * Math.PI) / 3;
  return Math.sign(Math.cos(a) * LIGHT.x + Math.sin(a) * LIGHT.y);
});
/**
 * Per direction: how strongly the side shows its light or shade, 1 for the side facing straight to the
 * light or away from it, about half for the sides that only graze it.
 */
const WEIGHT: readonly number[] = Array.from({ length: DIRECTIONS }, (_, d) => {
  const a = (d * Math.PI) / 3;
  const dot = Math.abs(Math.cos(a) * LIGHT.x + Math.sin(a) * LIGHT.y);
  return 0.35 + 0.65 * (dot / Math.cos(Math.PI / 12));
});

/** Distance from a tile's centre to the middle of a side, in canvas pixels. */
const APOTHEM = BAKE / 2;
const BAND_W = Math.ceil(BAKE) + 2;
const BAND_H = Math.ceil(BAKE * 2 * CORNER) + 2;
const bands = new Map<number, HTMLCanvasElement>();

/**
 * A hexagon-shaped tile image holding a band of shadow along the side facing `direction`: opaque at the side,
 * clear `depth` pixels further in. Cached, since the bake draws the same few thousands of times.
 */
function band(direction: number, depth: number): HTMLCanvasElement {
  const id = direction * 100 + depth;
  const cached = bands.get(id);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = BAND_W;
  canvas.height = BAND_H;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const cx = BAND_W / 2;
    const cy = BAND_H / 2;
    ctx.beginPath();
    hexPath(ctx, cx, cy);
    ctx.clip();
    const a = (direction * Math.PI) / 3;
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const shade = ctx.createLinearGradient(
      cx + nx * APOTHEM,
      cy + ny * APOTHEM,
      cx + nx * (APOTHEM - depth),
      cy + ny * (APOTHEM - depth),
    );
    shade.addColorStop(0, "rgba(0,0,0,1)");
    shade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, BAND_W, BAND_H);
  }
  bands.set(id, canvas);
  return canvas;
}

/** A band of shadow along one side of the tile centred on (cx, cy), fading inward. */
function shadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, direction: number, depth: number, alpha: number): void {
  ctx.globalAlpha = alpha * (WEIGHT[direction] ?? 1);
  ctx.drawImage(band(direction, Math.round(depth)), cx - BAND_W / 2, cy - BAND_H / 2);
}

/** Adds a line just inside one side of the tile centred on (cx, cy) to a path. */
function rimPath(path: CanvasPath | undefined, cx: number, cy: number, direction: number): void {
  // Pulled one pixel in, so a two-pixel line stays inside the tile.
  const r = BAKE * (1 - 1 / APOTHEM);
  const a = CORNERS[direction];
  const b = CORNERS[(direction + 1) % DIRECTIONS];
  if (!a || !b || !path) return;
  path.moveTo(cx + a.x * r, cy + a.y * r);
  path.lineTo(cx + b.x * r, cy + b.y * r);
}

/** Paints the given tiles: colours, then materials, then edges. */
function paint(ctx: CanvasRenderingContext2D, game: Game, patterns: Patterns, tiles: readonly number[]): void {
  const w = game.w;
  const height = (i: number): number => (i < 0 ? ROCK : (game.height[i] ?? ROCK));

  // Flat colours. Each hexagon is grown by half a pixel so that the antialiased sides of neighbours overlap
  // instead of letting the dark background show through as a seam.
  for (const i of tiles) {
    const { x, y } = tileOf(w, i);
    const h = height(i);
    const c = at(x, y);
    if (h !== ROCK) {
      const [r, g, b] = groundColor(h);
      // A fixed per-tile grain keeps large plateaus from looking flat.
      const grain = (((x * 73856093) ^ (y * 19349663)) >>> 0) % 7 - 3;
      ctx.fillStyle = `rgb(${String(r + grain)},${String(g + grain)},${String(b + grain)})`;
    } else {
      ctx.fillStyle = patterns.rock ? "#121b20" : "#0a1013";
    }
    ctx.beginPath();
    hexPath(ctx, c.x, c.y, 0.5);
    ctx.fill();
    if (h === ROCK && !patterns.rock && patterns.hatch) {
      ctx.fillStyle = patterns.hatch;
      ctx.fill();
    }
  }

  // The materials, each in one fill over all its tiles. Over these dark colours "overlay" multiplies
  // by twice the material, so a mid-grey material keeps the band colour and only adds its texture.
  for (const rock of [false, true]) {
    const fill = rock ? patterns.rock : patterns.ground;
    if (!fill) continue;
    ctx.beginPath();
    for (const i of tiles) {
      if ((height(i) === ROCK) !== rock) continue;
      const t = tileOf(w, i);
      const c = at(t.x, t.y);
      hexPath(ctx, c.x, c.y, 0.5);
    }
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  // Edges. A higher neighbour on a lit side throws a shadow into the tile, deeper the higher it stands, and a
  // lower one shows this tile's lit rim; on the far sides the step down is in shade. Rock stands above
  // open ground and has its own pale rim.
  const around = new Int32Array(DIRECTIONS);
  const rims: Path2D[] = Array.from({ length: DIRECTIONS }, () => new Path2D());
  const rockRims: Path2D[] = Array.from({ length: DIRECTIONS }, () => new Path2D());
  for (const i of tiles) {
    const { x, y } = tileOf(w, i);
    const h = height(i);
    const c = at(x, y);
    neighbourIndices(w, game.h, x, y, around);
    for (let d = 0; d < DIRECTIONS; d++) {
      const n = height(around[d] ?? -1);
      const lit = (FACING[d] ?? 0) > 0;
      if (h === ROCK) {
        if (n === ROCK) continue;
        if (lit) rimPath(rockRims[d], c.x, c.y, d);
        else shadow(ctx, c.x, c.y, d, 5, 0.55);
        continue;
      }
      if (lit) {
        if (n === ROCK) shadow(ctx, c.x, c.y, d, 8, 0.5);
        else if (n > h) shadow(ctx, c.x, c.y, d, Math.min(14, 6 + 3 * (n - h)), 0.5);
        else if (n < h) rimPath(rims[d], c.x, c.y, d);
      } else if (n !== ROCK && n < h) {
        shadow(ctx, c.x, c.y, d, 5, 0.42);
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  for (let d = 0; d < DIRECTIONS; d++) {
    const weight = WEIGHT[d] ?? 1;
    const lit = rims[d];
    const rock = rockRims[d];
    if (lit) {
      ctx.strokeStyle = `rgba(255,255,255,${String(0.17 * weight)})`;
      ctx.stroke(lit);
    }
    if (rock) {
      ctx.strokeStyle = `rgba(150,190,200,${String(0.16 * weight)})`;
      ctx.stroke(rock);
    }
  }
}

export function bakeTerrain(game: Game, materials: Materials = {}): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const size = worldSize(game.w, game.h);
  canvas.width = Math.ceil(size.w * SCALE);
  canvas.height = Math.ceil(size.h * SCALE);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const patterns = {
      ground: pattern(ctx, materials.ground),
      rock: pattern(ctx, materials.rock),
      hatch: hatching(ctx),
    };
    PATTERNS.set(canvas, patterns);
    paint(ctx, game, patterns, Array.from({ length: game.w * game.h }, (_, i) => i));
  }
  return canvas;
}

/** Redraws a tile and its six neighbours after the ground changed, and nothing outside them. */
export function rebakeTile(canvas: HTMLCanvasElement, game: Game, tile: number): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const patterns = PATTERNS.get(canvas) ?? { ground: null, rock: null, hatch: null };
  const { x, y } = tileOf(game.w, tile);
  const tiles = [tile];
  const around = new Int32Array(DIRECTIONS);
  neighbourIndices(game.w, game.h, x, y, around);
  for (const n of around) if (n >= 0) tiles.push(n);
  // The repainted hexagons are grown a little; the clip keeps them off the tiles that were not repainted.
  ctx.save();
  ctx.beginPath();
  for (const i of tiles) {
    const t = tileOf(game.w, i);
    const c = at(t.x, t.y);
    hexPath(ctx, c.x, c.y);
  }
  ctx.clip();
  paint(ctx, game, patterns, tiles);
  ctx.restore();
}

/**
 * Where each silt pixel takes its depth from: the up to three tile centres around it, with barycentric
 * weights inside their triangle, so depth blends smoothly across hexagons. Built once per map; it also
 * holds the shimmer's scratch tables so painting allocates nothing.
 */
export interface SiltLayout {
  /** Image size in pixels. */
  width: number;
  height: number;
  /** Three tile indices per pixel; the first is -1 for a pixel off the map. */
  tiles: Int32Array;
  weights: Float32Array;
  waveX: Float32Array;
  waveY: Float32Array;
  waveD: Float32Array;
  waveU: Float32Array;
}

export function siltLayout(w: number, h: number): SiltLayout {
  const e = extent(w, h);
  const width = Math.ceil(e.width * SILT_SUB);
  const height = Math.ceil(e.height * SILT_SUB);
  const tiles = new Int32Array(width * height * 3).fill(-1);
  const weights = new Float32Array(width * height * 3);
  const step = Math.PI / 3;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      // The pixel's centre in tile units.
      const ux = (px + 0.5) / SILT_SUB - ORIGIN.x;
      const uy = (py + 0.5) / SILT_SUB - ORIGIN.y;
      const t = tileAtPoint(ux, uy);
      if (t.x < 0 || t.y < 0 || t.x >= w || t.y >= h) continue;
      const c = centre(t.x, t.y);
      const vx = ux - c.x;
      const vy = uy - c.y;
      // The pixel lies in the triangle of this centre and the neighbours in the two directions either side of it.
      let angle = Math.atan2(vy, vx);
      if (angle < 0) angle += 2 * Math.PI;
      const d = Math.min(DIRECTIONS - 1, Math.floor(angle / step));
      const c0 = Math.cos(d * step);
      const s0 = Math.sin(d * step);
      const c1 = Math.cos((d + 1) * step);
      const s1 = Math.sin((d + 1) * step);
      const det = c0 * s1 - s0 * c1;
      const a = Math.max(0, (vx * s1 - vy * c1) / det);
      const b = Math.max(0, (c0 * vy - s0 * vx) / det);
      const self = t.y * w + t.x;
      // A neighbour off the map lends its weight to the tile itself, so pools reach the edge at full depth.
      const index = (n: { x: number; y: number }): number =>
        n.x >= 0 && n.y >= 0 && n.x < w && n.y < h ? n.y * w + n.x : self;
      const o = (py * width + px) * 3;
      tiles[o] = self;
      tiles[o + 1] = index(neighbour(t.x, t.y, d));
      tiles[o + 2] = index(neighbour(t.x, t.y, (d + 1) % DIRECTIONS));
      weights[o] = Math.max(0, 1 - a - b);
      weights[o + 1] = a;
      weights[o + 2] = b;
    }
  }
  return {
    width,
    height,
    tiles,
    weights,
    waveX: new Float32Array(width),
    waveY: new Float32Array(height),
    waveD: new Float32Array(width + height),
    waveU: new Float32Array(width + height),
  };
}

/**
 * Paints the silt depths into an image laid out by `layout`. Pools get soft shores with a pale rim; `phase`
 * (radians, any size) moves a slow shimmer across deeper silt and may stay fixed for a still picture.
 */
export function paintSilt(image: ImageData, silt: Float32Array, layout: SiltLayout, phase: number): void {
  const data = image.data;
  const { width, height, tiles, weights, waveX, waveY, waveD, waveU } = layout;
  // The shimmer is built from sine tables along both axes and both diagonals, so no pixel needs a
  // sine of its own.
  for (let n = 0; n < width; n++) waveX[n] = Math.sin(n * 0.47 + phase);
  for (let n = 0; n < height; n++) waveY[n] = Math.sin(n * 0.39 - phase * 0.7);
  for (let n = 0; n < width + height; n++) {
    waveD[n] = Math.sin(n * 0.23 + phase * 1.3);
    waveU[n] = Math.sin(n * 0.17 - phase * 0.9);
  }
  let q = 0;
  let o = 0;
  for (let gy = 0; gy < height; gy++) {
    const wy = waveY[gy] ?? 0;
    for (let gx = 0; gx < width; gx++, q += 3, o += 4) {
      const a = tiles[q] ?? -1;
      if (a < 0) {
        data[o + 3] = 0;
        continue;
      }
      const depth =
        (silt[a] ?? 0) * (weights[q] ?? 0) +
        (silt[tiles[q + 1] ?? a] ?? 0) * (weights[q + 1] ?? 0) +
        (silt[tiles[q + 2] ?? a] ?? 0) * (weights[q + 2] ?? 0);
      if (depth < 0.02) {
        data[o + 3] = 0;
        continue;
      }
      // Violet shallows, magenta pools, pale pink depths.
      const t = Math.min(1, depth / 5);
      const mid = Math.min(1, t * 2.5);
      const top = Math.max(0, (t - 0.4) / 0.6);
      // The shore: opacity rises over the first quarter step, with a pale rim just inside it.
      const shore = Math.min(1, (depth - 0.02) / 0.1);
      const rim = Math.max(0, 1 - Math.abs(depth - 0.16) / 0.14) * 0.45;
      const wave =
        0.4 * (waveX[gx] ?? 0) * wy +
        0.6 * (waveD[gx + gy] ?? 0) +
        0.6 * (waveU[gx - gy + height] ?? 0);
      const lift = rim * 90 + wave * (10 + 14 * mid);
      data[o] = Math.min(255, 122 + (255 - 122) * mid + lift);
      data[o + 1] = Math.max(0, Math.min(255, 44 + (63 - 44) * mid + (208 - 63) * top + lift));
      data[o + 2] = Math.min(255, 255 + (164 - 255) * mid + (234 - 164) * top + lift * 0.5);
      data[o + 3] = shore * Math.min(240, 120 + depth * 110);
    }
  }
}
