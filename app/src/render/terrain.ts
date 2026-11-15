// The ground, baked into one canvas: height-banded colours with a material texture overlaid and lit
// and shadowed edges; and the silt, painted into a small image every few frames.

import { ROCK, type Game } from "@ebbline2/engine";

/** Canvas pixels per tile. */
export const BAKE = 32;
/** Tiles covered by one period of a material. */
const PERIOD = 8;
/** Silt image pixels per tile. */
export const SILT_SUB = 4;

/** Tileable textures with a mean luma near 128; each is optional. */
export interface Materials {
  ground?: CanvasImageSource | undefined;
  rock?: CanvasImageSource | undefined;
}

interface Patterns {
  ground: CanvasPattern | null;
  rock: CanvasPattern | null;
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

type Side = "n" | "w" | "s" | "e";

const STRIP = 16;
let strips: Record<Side, HTMLCanvasElement> | undefined;

/** Four small black gradients, opaque at the named edge and clear at the far one. */
function shades(): Record<Side, HTMLCanvasElement> {
  if (strips) return strips;
  const make = (side: Side): HTMLCanvasElement => {
    const upright = side === "n" || side === "s";
    const canvas = document.createElement("canvas");
    canvas.width = upright ? 1 : STRIP;
    canvas.height = upright ? STRIP : 1;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const far = side === "n" || side === "w" ? STRIP : 0;
      const shade = upright
        ? ctx.createLinearGradient(0, STRIP - far, 0, far)
        : ctx.createLinearGradient(STRIP - far, 0, far, 0);
      shade.addColorStop(0, "rgba(0,0,0,1)");
      shade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return canvas;
  };
  strips = { n: make("n"), w: make("w"), s: make("s"), e: make("e") };
  return strips;
}

/** A band of shadow along one edge of a tile, fading inward. */
function shadow(ctx: CanvasRenderingContext2D, px: number, py: number, side: Side, depth: number, alpha: number): void {
  ctx.globalAlpha = alpha;
  const strip = shades()[side];
  if (side === "n") ctx.drawImage(strip, px, py, BAKE, depth);
  else if (side === "s") ctx.drawImage(strip, px, py + BAKE - depth, BAKE, depth);
  else if (side === "w") ctx.drawImage(strip, px, py, depth, BAKE);
  else ctx.drawImage(strip, px + BAKE - depth, py, depth, BAKE);
  ctx.globalAlpha = 1;
}

/** Paints the tiles of a rectangle (x1 and y1 exclusive): colours, then materials, then edges. */
function paint(
  ctx: CanvasRenderingContext2D,
  game: Game,
  patterns: Patterns,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  const at = (tx: number, ty: number): number =>
    tx < 0 || ty < 0 || tx >= game.w || ty >= game.h
      ? ROCK
      : (game.height[ty * game.w + tx] ?? ROCK);

  // Flat colours; rock without a material gets its hatching instead.
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const h = at(x, y);
      const px = x * BAKE;
      const py = y * BAKE;
      if (h !== ROCK) {
        const [r, g, b] = groundColor(h);
        // A fixed per-tile grain keeps large plateaus from looking flat.
        const grain = (((x * 73856093) ^ (y * 19349663)) >>> 0) % 7 - 3;
        ctx.fillStyle = `rgb(${r + grain},${g + grain},${b + grain})`;
        ctx.fillRect(px, py, BAKE, BAKE);
      } else if (patterns.rock) {
        ctx.fillStyle = "#121b20";
        ctx.fillRect(px, py, BAKE, BAKE);
      } else {
        ctx.fillStyle = "#0a1013";
        ctx.fillRect(px, py, BAKE, BAKE);
        ctx.strokeStyle = "#1a252b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let d = -BAKE; d < BAKE; d += 10) {
          ctx.moveTo(px + Math.max(0, d), py + Math.max(0, -d));
          ctx.lineTo(px + Math.min(BAKE, d + BAKE), py + Math.min(BAKE, BAKE - d));
        }
        ctx.stroke();
      }
    }
  }

  // The materials, each in one fill over all its tiles. Over these dark colours "overlay" multiplies
  // by twice the material, so a mid-grey material keeps the band colour and only adds its texture.
  for (const rock of [false, true]) {
    const fill = rock ? patterns.rock : patterns.ground;
    if (!fill) continue;
    ctx.beginPath();
    for (let y = y0; y < y1; y++) {
      let start = -1;
      for (let x = x0; x <= x1; x++) {
        const mine = x < x1 && (at(x, y) === ROCK) === rock;
        if (mine && start < 0) start = x;
        if (!mine && start >= 0) {
          ctx.rect(start * BAKE, y * BAKE, (x - start) * BAKE, BAKE);
          start = -1;
        }
      }
    }
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  // Edges. Light comes from the north-west: a higher neighbour there throws a shadow, a lower one
  // shows this tile's lit rim; toward the south-east the step down is in shade. Rock stands above
  // open ground.
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const h = at(x, y);
      const px = x * BAKE;
      const py = y * BAKE;
      const north = at(x, y - 1);
      const west = at(x - 1, y);
      const south = at(x, y + 1);
      const east = at(x + 1, y);
      if (h === ROCK) {
        if (south !== ROCK) shadow(ctx, px, py, "s", 5, 0.55);
        if (east !== ROCK) shadow(ctx, px, py, "e", 5, 0.55);
        ctx.fillStyle = "rgba(150,190,200,0.16)";
        if (north !== ROCK) ctx.fillRect(px, py, BAKE, 2);
        if (west !== ROCK) ctx.fillRect(px, py, 2, BAKE);
        continue;
      }
      if (north === ROCK) shadow(ctx, px, py, "n", 8, 0.5);
      else if (north > h) shadow(ctx, px, py, "n", Math.min(14, 6 + 3 * (north - h)), 0.5);
      if (west === ROCK) shadow(ctx, px, py, "w", 8, 0.5);
      else if (west > h) shadow(ctx, px, py, "w", Math.min(14, 6 + 3 * (west - h)), 0.5);
      ctx.fillStyle = "rgba(255,255,255,0.17)";
      if (north !== ROCK && north < h) ctx.fillRect(px, py, BAKE, 2);
      if (west !== ROCK && west < h) ctx.fillRect(px, py, 2, BAKE);
      if (south !== ROCK && south < h) shadow(ctx, px, py, "s", 5, 0.42);
      if (east !== ROCK && east < h) shadow(ctx, px, py, "e", 5, 0.42);
    }
  }
}

export function bakeTerrain(game: Game, materials: Materials = {}): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = game.w * BAKE;
  canvas.height = game.h * BAKE;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const patterns = { ground: pattern(ctx, materials.ground), rock: pattern(ctx, materials.rock) };
    PATTERNS.set(canvas, patterns);
    paint(ctx, game, patterns, 0, 0, game.w, game.h);
  }
  return canvas;
}

/** Redraws a tile and its neighbours after the ground changed. */
export function rebakeTile(canvas: HTMLCanvasElement, game: Game, tile: number): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const patterns = PATTERNS.get(canvas) ?? { ground: null, rock: null };
  const x = tile % game.w;
  const y = Math.floor(tile / game.w);
  paint(ctx, game, patterns, Math.max(0, x - 1), Math.max(0, y - 1), Math.min(game.w, x + 2), Math.min(game.h, y + 2));
}

const SUB_OFFSET: readonly number[] = Array.from({ length: SILT_SUB }, (_, n) => (n + 0.5) / SILT_SUB - 0.5);

/**
 * Paints the silt depths into an image of SILT_SUB x SILT_SUB pixels per tile. Depths are blended
 * between tile centres so pools get round, soft shores with a pale rim; `phase` (radians, any size)
 * moves a slow shimmer across deeper silt and may stay fixed for a still picture.
 */
export function paintSilt(image: ImageData, silt: Float32Array, w: number, h: number, phase: number): void {
  const data = image.data;
  const stride = w * SILT_SUB * 4;
  // The shimmer is built from sine tables along both axes and both diagonals, so no pixel needs a
  // sine of its own.
  const across = w * SILT_SUB;
  const along = h * SILT_SUB;
  const waveX = new Float32Array(across);
  const waveY = new Float32Array(along);
  const waveD = new Float32Array(across + along);
  const waveU = new Float32Array(across + along);
  for (let n = 0; n < across; n++) waveX[n] = Math.sin(n * 0.47 + phase);
  for (let n = 0; n < along; n++) waveY[n] = Math.sin(n * 0.39 - phase * 0.7);
  for (let n = 0; n < across + along; n++) {
    waveD[n] = Math.sin(n * 0.23 + phase * 1.3);
    waveU[n] = Math.sin(n * 0.17 - phase * 0.9);
  }
  for (let ty = 0; ty < h; ty++) {
    const up = ty > 0 ? -w : 0;
    const down = ty < h - 1 ? w : 0;
    for (let tx = 0; tx < w; tx++) {
      const i = ty * w + tx;
      const left = tx > 0 ? -1 : 0;
      const right = tx < w - 1 ? 1 : 0;
      const c = silt[i] ?? 0;
      const base = (ty * SILT_SUB) * stride + tx * SILT_SUB * 4;
      let wet = c;
      if (wet < 0.03) {
        wet = Math.max(
          silt[i + left] ?? 0, silt[i + right] ?? 0, silt[i + up] ?? 0, silt[i + down] ?? 0,
          silt[i + up + left] ?? 0, silt[i + up + right] ?? 0,
          silt[i + down + left] ?? 0, silt[i + down + right] ?? 0,
        );
      }
      if (wet < 0.03) {
        for (let sy = 0; sy < SILT_SUB; sy++) {
          for (let sx = 0; sx < SILT_SUB; sx++) data[base + sy * stride + sx * 4 + 3] = 0;
        }
        continue;
      }
      for (let sy = 0; sy < SILT_SUB; sy++) {
        const fy = SUB_OFFSET[sy] ?? 0;
        const ny = fy < 0 ? up : down;
        const wy = Math.abs(fy);
        for (let sx = 0; sx < SILT_SUB; sx++) {
          const fx = SUB_OFFSET[sx] ?? 0;
          const nx = fx < 0 ? left : right;
          const wx = Math.abs(fx);
          const depth =
            (c * (1 - wx) + (silt[i + nx] ?? 0) * wx) * (1 - wy) +
            ((silt[i + ny] ?? 0) * (1 - wx) + (silt[i + ny + nx] ?? 0) * wx) * wy;
          const o = base + sy * stride + sx * 4;
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
          const gx = tx * SILT_SUB + sx;
          const gy = ty * SILT_SUB + sy;
          const wave =
            0.4 * (waveX[gx] ?? 0) * (waveY[gy] ?? 0) +
            0.6 * (waveD[gx + gy] ?? 0) +
            0.6 * (waveU[gx - gy + along] ?? 0);
          const lift = rim * 90 + wave * (10 + 14 * mid);
          data[o] = Math.min(255, 122 + (255 - 122) * mid + lift);
          data[o + 1] = Math.max(0, Math.min(255, 44 + (63 - 44) * mid + (208 - 63) * top + lift));
          data[o + 2] = Math.min(255, 255 + (164 - 255) * mid + (234 - 164) * top + lift * 0.5);
          data[o + 3] = shore * Math.min(240, 120 + depth * 110);
        }
      }
    }
  }
}
