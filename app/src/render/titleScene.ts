// The living title backdrop. The picture is seen through a camera standing one unit above a sea of
// silt: the sea is drawn in the fragment shader as a plane with real perspective, the painted rock
// islands stand on it as upright cards at their own distances, and the painted sky stays at infinity.
// The pointer moves the camera a little (sideways and up and down, turning to keep looking at one
// point of the sea), so near water slides against far water, an island's waterline stays glued to
// the silt it stands in, and the horizon only turns with the view. The ledge with the lander is still
// a flat cut-out shifted as the ledge would move; its grid lights flicker. Without WebGL, or when an
// image fails to load, nothing is drawn and the plain <img> of the flat picture stays.
//
// Coordinates: "art" positions are pixels of the 1920 × 1080 picture. The world has x to the right,
// y up and z away from the camera, in units of the camera's height over the silt.

/** The size of the whole picture; every art position below is in its pixels. */
export const ART_W = 1920;
export const ART_H = 1080;

/** The first row of painted sea under the sky: the horizon of the camera at rest. */
export const HORIZON = 454;
/** The focal length of the picture, in its pixels: a vertical field of view of about 40°. */
export const FOCAL = 1480;
/** How far the camera moves, in camera heights, at the pointer's extreme. Enough to feel, no more. */
const SWAY = 0.045;
/** Up and down moves this much less than sideways. */
const SWAY_Y = 0.6;
/** The distance of the point of the sea the camera keeps looking at; nearer things move against it. */
const PIVOT = 7.5;
/** Shows slightly less than the whole picture so the moved edges never run out of art. */
const ZOOM = 0.968;

/**
 * A cut-out layer: a band of the picture's rows. Its file is twice as tall as the band, the colour
 * over the matte in the upper half and the alpha as grey in the lower half.
 */
export interface Band {
  /** First row of the band in the picture, and the row after its last. */
  readonly top: number;
  readonly bottom: number;
  /** How strongly the layer follows the camera: 1 moves as the ledge at `LEDGE` does. */
  readonly depth: number;
}

/** The rows of the picture a cut-out file holds. */
export type Rows = Pick<Band, "top" | "bottom">;

/** The rows of the rock islands' file. */
export const MID: Rows = { top: 376, bottom: 746 };
/** The near ledge with the lander and the pylons. */
export const FOREGROUND: Band = { top: 610, bottom: 1080, depth: 1 };
/** A point of the ledge (art position and distance); the foreground layer moves as it does. */
const LEDGE = { x: 1450, y: 860, distance: 2.1 } as const;
/** The colour the layer files have under their transparent pixels. */
const MATTE = [0x1a, 0x12, 0x10] as const;

/**
 * One rock island of the mid layer: the art box it fills and the row of its waterline. It stands in
 * the world as an upright card at the distance where the sea meets that row.
 */
export interface Island {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly base: number;
}

/**
 * The islands of `title-mid.jpg`, far to near: the measured rock boxes (2 px margin) and waterline
 * rows. The two mountain ranges stand a few rows under the horizon, hundreds of camera heights away,
 * so they move with the sky; their boxes run past the picture's edges, where the texture read clamps.
 */
export const ISLANDS: readonly Island[] = [
  { left: -16, right: 918, top: 381, base: 457 }, // range-left
  { left: 1439, right: 2264, top: 385, base: 457 }, // range-right
  { left: 989, right: 1121, top: 456, base: 474 }, // islet-1
  { left: 559, right: 702, top: 459, base: 478 }, // islet-2
  { left: 298, right: 452, top: 461, base: 485 }, // islet-3
  { left: 798, right: 952, top: 461, base: 490 }, // islet-4
  { left: 1518, right: 1691, top: 461, base: 495 }, // islet-5
  { left: 1289, right: 1452, top: 472, base: 498 }, // islet-6
  { left: 469, right: 701, top: 480, base: 524 }, // islet-7
  { left: 38, right: 262, top: 469, base: 540 }, // crags
  { left: 1599, right: 1901, top: 502, base: 560 }, // mesa
  { left: 1119, right: 1520, top: 499, base: 575 }, // reef
  { left: 928, right: 1250, top: 577, base: 690 }, // slab
  { left: -38, right: 842, top: 541, base: 742 }, // ridge
];

/**
 * The mouth of the distant vent and the plume over it, as painted in `title-bg.jpg`; both must follow
 * that picture. The vent stands on the horizon, so like the sky it is read by direction through the
 * camera at rest and moves exactly as the painted cone does. The plume's axis rises from the mouth
 * and bends with the wind: it lies `bend * h²` pixels right of the mouth at `h` pixels above it,
 * about `base + spread * h` wide on each side, and is set moving up to `top` pixels above the mouth.
 */
export const VENT = { x: 1344, y: 437 } as const;
export const PLUME = { bend: 0.0042, base: 16, spread: 0.62, top: 380 } as const;

export interface LayerUrls {
  readonly background: string;
  readonly mid: string;
  readonly foreground: string;
}

export type LightKind = "pylon" | "beacon" | "core";
export interface Light {
  readonly x: number;
  readonly y: number;
  readonly kind: LightKind;
}

/** The lights of the picture, painted bright; the shader dims and brightens them. */
export const LIGHTS: readonly Light[] = [
  { x: 841, y: 908, kind: "pylon" },
  { x: 969, y: 889, kind: "pylon" },
  { x: 1105, y: 857, kind: "pylon" },
  { x: 1331, y: 789, kind: "pylon" },
  { x: 1772, y: 649, kind: "beacon" },
  { x: 1644, y: 761, kind: "core" },
];

// --- The camera -------------------------------------------------------------------------------------

export type Vec3 = readonly [number, number, number];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a: Vec3): Vec3 => scale(a, 1 / Math.sqrt(dot(a, a)));

/** A pinhole camera: where it stands and its axes. `forward` points through the picture's centre. */
export interface Camera {
  readonly position: Vec3;
  readonly right: Vec3;
  readonly up: Vec3;
  readonly forward: Vec3;
}

/** How far the camera at rest looks down: the picture's centre lies below the horizon. */
export const PITCH = Math.atan((ART_H / 2 - HORIZON) / FOCAL);

/** A camera looking along `forward`, held level (no roll). */
function aim(position: Vec3, forward: Vec3): Camera {
  const f = normalize(forward);
  const right = normalize([f[2], 0, -f[0]]);
  const up: Vec3 = [
    f[1] * right[2] - f[2] * right[1],
    f[2] * right[0] - f[0] * right[2],
    f[0] * right[1] - f[1] * right[0],
  ];
  return { position, right, up, forward: f };
}

/** The camera that took the picture. */
export const REST: Camera = aim([0, 1, 0], [0, -Math.sin(PITCH), Math.cos(PITCH)]);

/**
 * The camera for a pointer position, each axis -1..1 (right and down positive). It moves with the
 * pointer and turns to keep looking at the point of the sea `PIVOT` away along the rest view.
 */
export function camera(sx: number, sy: number): Camera {
  const position: Vec3 = [sx * SWAY, 1 - sy * SWAY * SWAY_Y, 0];
  const target = add(REST.position, scale(REST.forward, PIVOT));
  return aim(position, sub(target, position));
}

/** Where a world point appears in the picture through a camera, in art pixels. */
export function project(cam: Camera, p: Vec3): readonly [number, number] {
  const r = sub(p, cam.position);
  const z = dot(r, cam.forward);
  return [ART_W / 2 + (FOCAL * dot(r, cam.right)) / z, ART_H / 2 - (FOCAL * dot(r, cam.up)) / z];
}

/** The direction of the ray through an art position. Not unit length: its forward part is 1. */
export function ray(cam: Camera, x: number, y: number): Vec3 {
  return add(add(scale(cam.right, (x - ART_W / 2) / FOCAL), scale(cam.up, (ART_H / 2 - y) / FOCAL)), cam.forward);
}

/** Where the ray through an art position meets the silt (y = 0), or undefined above the horizon. */
export function seaPoint(cam: Camera, x: number, y: number): Vec3 | undefined {
  const d = ray(cam, x, y);
  if (d[1] >= 0) return undefined;
  return add(cam.position, scale(d, -cam.position[1] / d[1]));
}

/** Where the ray through an art position meets the upright plane z = `distance`. */
export function cardPoint(cam: Camera, x: number, y: number, distance: number): Vec3 {
  const d = ray(cam, x, y);
  return add(cam.position, scale(d, (distance - cam.position[2]) / d[2]));
}

/** How far away the sea is that the camera at rest sees on a row below the horizon. */
export function seaDistance(row: number): number {
  const p = seaPoint(REST, ART_W / 2, row);
  if (!p) throw new Error(`row ${row} is not below the horizon`);
  return p[2];
}

/**
 * How far the foreground layer must be shifted, in art pixels, to move as the ledge would through
 * a camera: where the ledge was painted minus where it now appears.
 */
export function ledgeShift(cam: Camera, depth: number): readonly [number, number] {
  const anchor = add(REST.position, scale(ray(REST, LEDGE.x, LEDGE.y), LEDGE.distance));
  const now = project(cam, anchor);
  return [(LEDGE.x - now[0]) * depth, (LEDGE.y - now[1]) * depth];
}

/** The pointer reach including the idle sway, so tests can check the edges at the extremes. */
export const REACH = { x: 1.18, y: 1.12 } as const;

// --- The view ---------------------------------------------------------------------------------------

/**
 * The part of the picture a box shows, as the CSS `object-fit: cover` of the plain picture under
 * the canvas places it (`posX`/`posY` are its `object-position` as fractions), zoomed in by `ZOOM`
 * about the picture's centre. `x`/`y` is the art position of the box's top left corner and `w`/`h`
 * the art size of the box. `scale` is the canvas resolution in pixels per CSS pixel: the device's,
 * but never finer than the art, so a phone does not shade pixels nobody sees in more detail.
 */
export function viewWindow(
  width: number,
  height: number,
  posX: number,
  posY: number,
  dpr: number,
): { x: number; y: number; w: number; h: number; scale: number } {
  const fit = Math.max(width / ART_W, height / ART_H);
  const left = ((width - ART_W * fit) * posX) / -fit;
  const top = ((height - ART_H * fit) * posY) / -fit;
  return {
    x: ART_W / 2 + (left - ART_W / 2) * ZOOM,
    y: ART_H / 2 + (top - ART_H / 2) * ZOOM,
    w: (width / fit) * ZOOM,
    h: (height / fit) * ZOOM,
    scale: Math.min(dpr, 1 / fit),
  };
}

/** One part of a CSS `object-position` as a fraction; percentages only, the centre otherwise. */
function fraction(part: string | undefined): number {
  return part?.endsWith("%") === true ? Number.parseFloat(part) / 100 : 0.5;
}

// --- Lights -----------------------------------------------------------------------------------------

/** Per-light flicker state; `glitchAt`/`glitchEnd` bracket a bout of stutter. */
interface Flicker {
  phase: number;
  glitchAt: number;
  glitchEnd: number;
}

/** A 0..1 hash of a number, so stutter steps are random but stable within a step. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * How bright a light is at a time in seconds, from about 0.1 (nearly off) to 1.15 (a packet passes).
 * Pylons hum, stutter now and then like a failing tube and light up in turn as a packet runs
 * along the chain to the lander; the beacon blinks; the core breathes.
 */
export function lightLevel(light: Light, index: number, t: number, f: Flicker, rand: () => number): number {
  if (light.kind === "core") return 0.82 + 0.18 * Math.sin(t * 1.6 + f.phase);
  if (light.kind === "beacon") {
    const cycle = (t + f.phase) % 2.4;
    return cycle < 0.12 || (cycle > 0.3 && cycle < 0.42) ? 1.15 : 0.35;
  }
  if (t >= f.glitchEnd) {
    f.glitchAt = t + 1.5 + rand() * 6;
    f.glitchEnd = f.glitchAt + 0.15 + rand() * 0.55;
  }
  let level = 0.88 + 0.06 * Math.sin(t * 9 + f.phase) + 0.04 * Math.sin(t * 23.7 + f.phase * 2);
  if (t >= f.glitchAt) {
    const step = Math.floor(t * 18);
    level = hash(step + index * 97) < 0.45 ? 0.08 + 0.25 * hash(step * 3 + index) : 0.95;
  }
  // A packet runs from the far pylon to the lander every few seconds.
  const run = (t % 4.5) - index * 0.22;
  if (run > 0 && run < 0.25) level = Math.max(level, 1.15 - run * 1.2);
  return Math.min(1.15, Math.max(0, level));
}

// --- Noise ------------------------------------------------------------------------------------------

/** The side of the noise texture, and the side of one of its lattice cells, in texels. */
const NOISE = 256;
const NOISE_CELL = 8;

/** A slope channel of the current texture spans -SLOPE..SLOPE per texture width. */
const SLOPE = 64;

/**
 * The current texture: the first channel of a noise texture, with its slope along both axes (per
 * texture width) in the next two channels, so the shader reads the field and the direction of its
 * level lines in one fetch.
 */
export function currentTexels(noise: Uint8Array): Uint8Array {
  const at = (x: number, y: number): number =>
    (noise[(((y + NOISE) % NOISE) * NOISE + ((x + NOISE) % NOISE)) * 4] ?? 0) / 255;
  const code = (slope: number): number => Math.round(Math.min(255, Math.max(0, 127.5 + (slope / SLOPE) * 127.5)));
  const texels = new Uint8Array(NOISE * NOISE * 4);
  for (let y = 0; y < NOISE; y++) {
    for (let x = 0; x < NOISE; x++) {
      const i = (y * NOISE + x) * 4;
      texels[i] = noise[i] ?? 0;
      texels[i + 1] = code(((at(x + 1, y) - at(x - 1, y)) / 2) * NOISE);
      texels[i + 2] = code(((at(x, y + 1) - at(x, y - 1)) / 2) * NOISE);
      texels[i + 3] = 255;
    }
  }
  return texels;
}

/**
 * A tileable texture of smooth value noise, four independent channels, two octaves each. The shader
 * reads one octave pair per fetch, and mipmaps keep the far sea from shimmering.
 */
export function noiseTexels(seed: number): Uint8Array {
  let s = seed >>> 0;
  const rand = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const octave = (cell: number): Float32Array => {
    const n = NOISE / cell;
    const lattice = Float32Array.from({ length: n * n }, rand);
    const out = new Float32Array(NOISE * NOISE);
    const at = (i: number, j: number): number => lattice[((j + n) % n) * n + ((i + n) % n)] ?? 0;
    const ease = (t: number): number => t * t * (3 - 2 * t);
    for (let y = 0; y < NOISE; y++) {
      for (let x = 0; x < NOISE; x++) {
        const i = Math.floor(x / cell);
        const j = Math.floor(y / cell);
        const u = ease(x / cell - i);
        const v = ease(y / cell - j);
        const top = at(i, j) + (at(i + 1, j) - at(i, j)) * u;
        const bottom = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * u;
        out[y * NOISE + x] = top + (bottom - top) * v;
      }
    }
    return out;
  };
  const texels = new Uint8Array(NOISE * NOISE * 4);
  for (let c = 0; c < 4; c++) {
    const low = octave(NOISE_CELL);
    const high = octave(NOISE_CELL / 2);
    for (let i = 0; i < NOISE * NOISE; i++) {
      texels[i * 4 + c] = Math.round(255 * ((low[i] ?? 0) * 0.7 + (high[i] ?? 0) * 0.3));
    }
  }
  return texels;
}

// --- Shaders ----------------------------------------------------------------------------------------

const VERTEX = `
attribute vec2 corner;
varying vec2 uv;
void main() {
  uv = vec2(corner.x * 0.5 + 0.5, 0.5 - corner.y * 0.5);
  gl_Position = vec4(corner, 0.0, 1.0);
}`;

const glsl = (n: number): string => n.toFixed(5);
const vec3 = (v: Vec3): string => `vec3(${v.map(glsl).join(", ")})`;

/** The texture position of an art position in a cut-out file; the alpha lies 0.5 lower. */
const cutUv = (b: Rows): string =>
  `vec2(a.x / ART.x, 0.5 * clamp((a.y - ${glsl(b.top)}) / ${glsl(b.bottom - b.top)}, 0.004, 0.996))`;

/**
 * How far, in art pixels, an island can appear from where it was painted while the camera moves.
 * The shader only looks for an island's card and its reflection within this margin of its box, so
 * pixels far from every island skip the island maths entirely.
 */
export const CULL = 40;

/** An island's height over the silt, in camera heights, from its painted box. */
function islandHeight(island: Island): number {
  return ((island.base - island.top) / FOCAL) * seaDistance(island.base);
}

/**
 * How much air pales an island at a distance (camera heights): gently, and never more than about
 * half, so even the mountain ranges on the horizon stay a visible line.
 */
export function rockHaze(distance: number): number {
  return 0.55 * (1 - Math.exp(-distance / 60));
}

/** Draws island `i` over the colour `c` where the ray `d` from the camera meets its card. */
function islandCard(island: Island): string {
  const z = glsl(seaDistance(island.base));
  return `
  if (art.x > ${glsl(island.left - CULL)} && art.x < ${glsl(island.right + CULL)} && art.y > ${glsl(island.top - CULL)} && art.y < ${glsl(island.base + CULL)}) {
    vec3 h = camPos + d * ((${z} - camPos.z) / d.z);
    vec2 a = restArt(h);
    if (h.y > 0.0 && a.x > ${glsl(island.left)} && a.x < ${glsl(island.right)} && a.y > ${glsl(island.top)}) {
      vec2 at = ${cutUv(MID)};
      float alpha = smoothstep(0.03, 0.97, texture2D(mid, at + vec2(0.0, 0.5)).g);
      c = c * (1.0 - alpha) + rock(texture2D(mid, at).rgb - MATTE * (1.0 - alpha), alpha, h.y, ${glsl(rockHaze(seaDistance(island.base)))});
    }
  }`;
}

/**
 * Mirrors island `i` in the silt at sea point `s` for the reflected ray `r`: a short darkening at
 * the foot, gone within about a quarter of the island's height, that the bands run through. Also lights a lip of silt where it presses against the island's foot.
 */
function islandMirror(island: Island): string {
  const z = glsl(seaDistance(island.base));
  const below = island.base + (island.base - island.top) * 1.3 + CULL;
  return `
  if (s.z < ${z} && art.x > ${glsl(island.left - CULL)} && art.x < ${glsl(island.right + CULL)} && art.y > ${glsl(island.base - CULL)} && art.y < ${glsl(below)}) {
    vec3 h = s + r * ((${z} - s.z) / r.z);
    vec2 a = restArt(h);
    if (a.x > ${glsl(island.left)} && a.x < ${glsl(island.right)} && a.y > ${glsl(island.top)} && a.y < ${glsl(island.base + 1)}) {
      vec2 at = ${cutUv(MID)};
      float alpha = smoothstep(0.03, 0.97, texture2D(mid, at + vec2(0.0, 0.5)).g);
      float fade = alpha * 0.7 * exp(-h.y * ${glsl(4 / islandHeight(island))});
      mirror = mix(mirror, texture2D(mid, at).rgb - MATTE * (1.0 - alpha), fade);
      shade = mix(shade, 0.0, fade);
    }
    float gap = ${z} - s.z;
    if (gap < 0.25) {
      a = restArt(vec3(s.x, 0.012, ${z}));
      if (a.x > ${glsl(island.left)} && a.x < ${glsl(island.right)}) {
        vec2 at = ${cutUv(MID)};
        float foot = texture2D(mid, at + vec2(0.0, 0.5)).g;
        lip = max(lip, foot * exp(-gap * 15.0 / (1.0 + s.z * 0.1)));
      }
    }
  }`;
}

/** How many of the nearest islands turn eddies in the silt; the rest are too small to show them. */
const EDDIES = 6;

/**
 * The eddies the silt turns around the nearest islands: a bump in the current under each island's
 * foot, as wide as the island and centred a little behind its card, whose level lines close around
 * the rock. Adds the bump and its slope to 'f' (value, slope), skipping pixels far from it.
 */
function eddies(islands: readonly Island[]): string {
  const nearest = [...islands].sort((a, b) => b.base - a.base).slice(0, EDDIES);
  return nearest
    .map((island) => {
      const z = seaDistance(island.base);
      const left = cardPoint(REST, island.left, island.base, z)[0];
      const right = cardPoint(REST, island.right, island.base, z)[0];
      const r = (right - left) / 2;
      const k = 1 / (r * r);
      return `  {
    vec2 o = p - vec2(${glsl((left + right) / 2)}, ${glsl(z + r * 0.5)});
    float q = dot(o, o) * ${glsl(k)};
    if (q < 9.0) {
      float b = 0.2 * exp(-q);
      f += vec3(b, o * (-2.0 * ${glsl(k)} * b));
    }
  }
`;
    })
    .join("");
}

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D background;
uniform sampler2D mid;
uniform sampler2D foreground;
uniform sampler2D noise;
uniform sampler2D flow;
uniform vec3 camPos;
uniform vec3 camRight;
uniform vec3 camUp;
uniform vec3 camFwd;
uniform vec4 view;
uniform float pixel;
uniform vec2 ledge;
uniform float time;
uniform vec4 lights[${LIGHTS.length}];
uniform vec3 tints[${LIGHTS.length}];
varying vec2 uv;
const vec2 ART = vec2(${glsl(ART_W)}, ${glsl(ART_H)});
const float FOCAL = ${glsl(FOCAL)};
const float HORIZON = ${glsl(HORIZON)};
const vec3 REST_POS = ${vec3(REST.position)};
const vec3 REST_UP = ${vec3(REST.up)};
const vec3 REST_FWD = ${vec3(REST.forward)};
const vec2 VENT = vec2(${glsl(VENT.x)}, ${glsl(VENT.y)});
const float PLUME_BEND = ${glsl(PLUME.bend)};
const float PLUME_BASE = ${glsl(PLUME.base)};
const float PLUME_SPREAD = ${glsl(PLUME.spread)};
const float PLUME_TOP = ${glsl(PLUME.top)};
const vec3 MATTE = vec3(${MATTE.map((v) => glsl(v / 255)).join(", ")});

// Where a world point was in the picture: the camera at rest is the one the art was painted for.
vec2 restArt(vec3 p) {
  vec3 r = p - REST_POS;
  float z = dot(r, REST_FWD);
  return vec2(ART.x * 0.5 + FOCAL * r.x / z, ART.y * 0.5 - FOCAL * dot(r, REST_UP) / z);
}

// The painted sky at an art position (never below the horizon, where the picture is painted sea).
vec3 skyAt(vec2 a) {
  return texture2D(background, vec2(a.x, min(a.y, HORIZON - 0.75)) / ART).rgb;
}

// The painted plume over the vent, set rising: inside a corridor around its axis the picture slides
// slowly up along the axis, churned by a little noise, in two copies half a period apart that take
// turns, so the smoke keeps climbing without ever jumping back. A little above the mouth it cools
// from the silt's pink into slate grey with a faint pink cast, and the mouth glows and flickers. Outside the corridor it costs one test.
vec3 plume(vec2 a, vec3 painted) {
  float h = VENT.y - a.y;
  float width = PLUME_BASE + PLUME_SPREAD * max(h, 0.0);
  float off = abs(a.x - VENT.x - PLUME_BEND * h * h) / width;
  if (h < -6.0 || h > PLUME_TOP + 40.0 || off > 2.0) return painted;
  float top = 1.0 - smoothstep(PLUME_TOP - 40.0, PLUME_TOP + 40.0, h);
  // Low down, where the painted pink cloud streaks cross the plume, only the dense smoke counts: the
  // streaks are paler than the plume there, so they neither move nor turn grey.
  float dense = max(smoothstep(110.0, 160.0, h), smoothstep(0.3, 0.5, painted.r - painted.g));
  float inside = (1.0 - smoothstep(0.8, 1.3, off)) * top * dense;
  float t = time;
  vec3 smoke = painted;
  if (inside > 0.0) {
    vec2 up = normalize(vec2(2.0 * PLUME_BEND * max(h, 0.0), -1.0));
    float reach = 10.0 * smoothstep(0.0, 60.0, h);
    vec2 churn = (texture2D(noise, a * 0.004 + vec2(0.0, 0.0011 * t)).rg - 0.5) * 16.0 * smoothstep(10.0, 140.0, h);
    float p1 = fract(t / 6.0);
    float p2 = fract(t / 6.0 + 0.5);
    vec3 s1 = skyAt(a + churn - up * reach * p1);
    vec3 s2 = skyAt(a - churn - up * reach * p2);
    smoke = mix(painted, mix(s1, s2, abs(2.0 * p1 - 1.0)), inside);
  }
  // Cooling reaches a little wider than the movement, so no pink fringe is left beside the plume.
  float cool = smoothstep(25.0, 140.0, h) * 0.88 * (1.0 - smoothstep(1.3, 2.0, off)) * top * dense;
  float pink = smoothstep(0.03, 0.22, smoke.r - smoke.g);
  float lum = dot(smoke, vec3(0.3, 0.5, 0.2));
  smoke = mix(smoke, vec3(0.3, 0.38, 0.42) * (0.55 + lum), pink * cool);
  float glow = exp(-max(h, 0.0) * 0.045) * (0.85 + 0.15 * sin(t * 1.3) * sin(t * 0.7 + 1.0));
  return smoke + vec3(1.0, 0.3, 0.65) * glow * pink * 0.3 * inside;
}

// The painted sky in a direction; it is so far away that only the camera's turn moves it.
vec3 sky(vec3 d) {
  float z = dot(d, REST_FWD);
  vec2 a = vec2(ART.x * 0.5 + FOCAL * d.x / z, ART.y * 0.5 - FOCAL * dot(d, REST_UP) / z);
  return plume(a, skyAt(a));
}

// The painted sea just under the horizon in a direction: the colour the silt fades into far away.
vec3 haze(vec3 d) {
  float x = ART.x * 0.5 + FOCAL * d.x / dot(d, REST_FWD);
  return texture2D(background, vec2(x, HORIZON + 5.0) / ART).rgb;
}

// The pink the far silt and the air over it fade to.
const vec3 PINK_HAZE = vec3(0.7, 0.3, 0.5);

// Shades the painted slate rock (premultiplied by 'alpha'), lit from below by the silt at its
// foot ('height' over the silt), and lets air lift and pale it with distance ('haze' 0..1).
vec3 rock(vec3 colour, float alpha, float height, float haze) {
  // The paint is slate already; darken it a little toward the foreground ridge and cool it.
  vec3 slate = colour * vec3(0.84, 0.9, 0.94);
  // The silt lights the foot of the rock where it laps against it.
  slate += vec3(1.0, 0.25, 0.62) * alpha * (exp(-height * 30.0) * 0.55 + exp(-height * 7.0) * 0.1);
  return mix(slate, vec3(0.36, 0.38, 0.44) * alpha, haze);
}

// Lays a cut-out layer over what is below it. The layer's colour sits on the matte, so taking the
// matte's share out again leaves the layer's own, premultiplied colour.
vec3 over(vec3 below, vec3 colour, float alpha) {
  return colour + (below - MATTE) * (1.0 - alpha);
}

// The alpha of a cut-out layer at a point of the picture; 0 outside its band.
float cover(sampler2D layer, vec2 p, vec2 rows, out vec2 at) {
  float v = (p.y - rows.x) / rows.y;
  // Keeps the lookups a texel away from the seam between the two halves of the file.
  at = vec2(p.x, 0.5 * clamp(v, 0.004, 0.996));
  if (v <= 0.0 || v >= 1.0) return 0.0;
  return smoothstep(0.03, 0.97, texture2D(layer, at + vec2(0.0, 0.5)).g);
}

// The current at a point of the sea (x, z) and its slope there, per world unit: a smooth field a few
// camera heights across, bent by a wider one ('warp', whose own bend the slope leaves out). The silt
// flows along its level lines, and the feet of the nearest islands raise bumps in it, so the lines
// close into eddies around the rock.
vec3 current(vec2 p, vec2 warp) {
  vec4 c = texture2D(flow, p * 0.0085 + warp);
  vec3 f = vec3(c.r, (c.gb - 0.5) * ${glsl(2 * SLOPE * 0.0085)});
${eddies(ISLANDS)}  return f;
}

// A smooth random function of one variable, read along a row of the noise texture. Where it is
// packed tighter than a pixel the mipmaps blur it, so far fibres melt instead of shimmering.
float grain(float x, float row) {
  return texture2D(noise, vec2(x, row)).r;
}

// The glowing silt at a point of the sea (x, z). 'blur' is the size of a pixel there, in world
// units; detail finer than it fades to its mean so the far sea does not shimmer. 'tilt' returns the
// slope of the surface for the reflections.
vec3 silt(vec2 p, float blur, out vec2 tilt) {
  float t = time;
  // The wide bend drifts, so the bands meander anew over minutes.
  vec2 warp = (texture2D(noise, p * 0.0035 + vec2(0.00017, 0.00011) * t).ba - 0.5) * 0.075;
  vec3 cur = current(p, warp);
  float slope = length(cur.yz) + 0.0005;
  vec2 along = vec2(-cur.z, cur.y) / slope;

  // Bands: every level line of the current at a step of 1/K is the axis of one band of glowing silt.
  // Each band has its own width and strength, most of them faint so that a few rivers carry the
  // light; far away, where bands get thinner than a few pixels, they melt into their mean.
  float k = 7.0;
  float ph = cur.x * k;
  float id = floor(ph);
  float across = abs(fract(ph) - 0.5) * 2.0;
  float strength = 0.25 + 0.75 * pow(fract(sin(id * 91.7 + 3.1) * 437.5), 1.6);
  float width = mix(0.36, 0.72, fract(sin(id * 37.3 + 1.7) * 153.1));
  float fade = smoothstep(0.08, 0.35, blur * k * slope);
  float band = mix(1.0 - smoothstep(width * 0.55, width, across), 0.4, fade);
  float core = mix(1.0 - smoothstep(width * 0.06, width * 0.3, across), 0.06, fade);
  float bloom = mix(exp(-pow(across / (width * 1.5), 2.0)), 0.5, fade);

  // Flow: clots of brighter silt ride along the bands. Two copies of the clot pattern slide along
  // the flow out of phase and take turns, so the movement never has to jump back.
  float period = 8.0;
  float ph1 = fract(t / period);
  float ph2 = fract(t / period + 0.5);
  vec2 slide = along * 1.5 * 0.06;
  vec2 cq = p * 0.06;
  float c1 = texture2D(noise, cq - slide * ph1).g;
  float c2 = texture2D(noise, cq - slide * ph2 + vec2(0.37, 0.61)).g;
  float swap = abs(2.0 * ph1 - 1.0);
  float clot = clamp((mix(c1, c2, swap) - 0.5) * 1.8 + 0.5, 0.0, 1.0);
  tilt = vec2(c1, c2) - 0.5;
  // Faint fibres along the flow inside the bands.
  float fibre = smoothstep(0.38, 0.66, grain(ph * 0.21 + clot * 0.02, 0.61));
  fibre = mix(fibre, 0.5, smoothstep(0.02, 0.07, blur * k * slope * 6.0));

  vec3 deep = vec3(0.46, 0.025, 0.25);
  vec3 body = vec3(0.8, 0.07, 0.44);
  vec3 glow = vec3(1.0, 0.17, 0.6);
  vec3 hot = vec3(1.0, 0.64, 0.88);
  float pulse = 0.6 + 0.8 * clot;
  // The gaps: dark silt, lifted by the bloom of nearby rivers and by the passing clots.
  vec3 col = mix(deep, body, 0.35 + 0.45 * bloom * strength + 0.2 * clot);
  col = mix(col, glow, clamp(band * (0.45 + 0.75 * strength) * pulse * (0.8 + 0.3 * fibre), 0.0, 1.0));
  col = mix(col, hot, clamp(core * strength * pulse * (0.5 + 0.7 * fibre), 0.0, 1.0) * 0.9);
  // A faint bloom: strong rivers light the silt around them.
  col += glow * (bloom * bloom * strength * strength * pulse * 0.22);
  return col;
}

void main() {
  vec2 art = view.xy + uv * view.zw;
  vec3 d = camRight * (art.x - ART.x * 0.5) / FOCAL + camUp * (ART.y * 0.5 - art.y) / FOCAL + camFwd;
  // The ray's climb per pixel, to soften the horizon over one pixel.
  float px = pixel / FOCAL;
  vec3 c = sky(d);

  if (d.y < px) {
    vec3 sea = haze(d);
    if (d.y < 0.0) {
      float dist = camPos.y / -d.y;
      vec3 s = camPos + d * dist;
      float range = dist * length(d);
      vec2 tilt;
      vec3 lit = silt(s.xz, range * range * px / camPos.y, tilt);

      // The silt mirrors a little of the sky, more towards the horizon, and the islands in it.
      vec3 v = normalize(d);
      vec3 r = reflect(v, normalize(vec3(tilt.x * 0.1, 1.0, tilt.y * 0.1)));
      r.y = max(r.y, 0.0005);
      float fresnel = 0.02 + 0.2 * pow(1.0 - clamp(-v.y, 0.0, 1.0), 12.0);
      vec3 mirror = sky(r);
      float shade = 1.0;
      float lip = 0.0;
      ${ISLANDS.map(islandMirror).join("")}
      lit *= mix(0.8, 1.0, shade);
      lit = mix(lit, vec3(1.0, 0.62, 0.88), lip * 0.85);
      sea = lit * (1.0 - fresnel) + mirror * (fresnel + (1.0 - shade) * 0.06);

      // Haze: the far silt fades into the painted horizon.
      float fog = 1.0 - exp(-pow(range / 130.0, 1.6));
      sea = mix(sea, mix(haze(d), PINK_HAZE, 0.45), fog);
    }
    c = mix(sea, c, clamp(d.y / px + 0.5, 0.0, 1.0));
  }

  ${ISLANDS.map(islandCard).join("")}

  // The lights are painted on the foreground, so they move with it.
  vec2 pf = (art + ledge) / ART;
  vec2 at;
  float af = cover(foreground, pf, vec2(${glsl(FOREGROUND.top / ART_H)}, ${glsl((FOREGROUND.bottom - FOREGROUND.top) / ART_H)}), at);
  vec3 near = texture2D(foreground, at).rgb;
  vec3 glow = vec3(0.0);
  for (int i = 0; i < ${LIGHTS.length}; i++) {
    vec2 o = (pf - lights[i].xy) * vec2(ART.x / ART.y, 1.0);
    float r2 = dot(o, o);
    // Beyond three halo radii a light adds nothing worth its two exponentials.
    if (r2 < lights[i].w * lights[i].w * 144.0) {
      float level = lights[i].z;
      float core = exp(-r2 / (lights[i].w * lights[i].w));
      float halo = exp(-r2 / (lights[i].w * lights[i].w * 16.0));
      // Dim the painted light when the level drops, then add its glow back on top.
      near *= mix(1.0, 0.35 + 0.65 * min(level, 1.0), core);
      glow += tints[i] * (core * 0.55 * level + halo * 0.22 * level * level);
    }
  }
  c = mix(c, over(c, near, af), step(0.001, af));
  gl_FragColor = vec4(c + glow, 1.0);
}`;

// --- Running it -------------------------------------------------------------------------------------

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("title scene:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function texture(gl: WebGLRenderingContext, unit: number, source: TexImageSource): void {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
}

function noiseTexture(gl: WebGLRenderingContext, unit: number, texels: Uint8Array): void {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NOISE, NOISE, 0, gl.RGBA, gl.UNSIGNED_BYTE, texels);
  gl.generateMipmap(gl.TEXTURE_2D);
}

export interface SceneOptions {
  /** True keeps everything still: no parallax, steady lights, a resting sea. */
  readonly still: boolean;
  /** Called once the scene draws, so the plain picture under it can step aside. */
  readonly onReady?: () => void;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = (): void => {
      resolve(image);
    };
    image.onerror = (): void => {
      reject(new Error(`no image at ${url}`));
    };
    image.src = url;
  });
}

/** The time a still scene shows the sea at. */
const STILL_TIME = 40;
/** The sea's clock wraps after this many seconds, so its numbers stay small enough for the GPU. */
const TIME_WRAP = 3600;

/** Starts the scene on a canvas; returns the function that stops it. */
export function startTitleScene(canvas: HTMLCanvasElement, urls: LayerUrls, options: SceneOptions): () => void {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, preserveDrawingBuffer: false });
  if (!gl) return () => undefined;
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs) return () => undefined;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => undefined;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const corner = gl.getAttribLocation(program, "corner");
  gl.enableVertexAttribArray(corner);
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);

  const at = (name: string): WebGLUniformLocation | null => gl.getUniformLocation(program, name);
  const uniforms = {
    camPos: at("camPos"),
    camRight: at("camRight"),
    camUp: at("camUp"),
    camFwd: at("camFwd"),
    view: at("view"),
    pixel: at("pixel"),
    ledge: at("ledge"),
    time: at("time"),
    lights: at("lights"),
    tints: at("tints"),
  };
  gl.uniform1i(at("background"), 0);
  gl.uniform1i(at("mid"), 1);
  gl.uniform1i(at("foreground"), 2);
  gl.uniform1i(at("noise"), 3);
  gl.uniform1i(at("flow"), 4);
  const tint: Record<LightKind, readonly number[]> = {
    pylon: [0.35, 0.9, 1.0],
    beacon: [0.45, 0.95, 1.0],
    core: [0.2, 0.75, 0.9],
  };
  const radius: Record<LightKind, number> = { pylon: 0.0085, beacon: 0.007, core: 0.02 };
  gl.uniform3fv(uniforms.tints, LIGHTS.flatMap((l) => tint[l.kind]));
  const lights = new Float32Array(LIGHTS.length * 4);
  LIGHTS.forEach((l, i) => {
    lights.set([l.x / ART_W, l.y / ART_H, 1, radius[l.kind]], i * 4);
  });
  const flicker: Flicker[] = LIGHTS.map(() => ({ phase: Math.random() * 6.28, glitchAt: 0, glitchEnd: 0 }));

  let stopped = false;
  let frame = 0;
  let ready = false;
  const target = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };

  const resize = (): void => {
    const box = canvas.getBoundingClientRect();
    const position = getComputedStyle(canvas).objectPosition.split(/\s+/);
    const win = viewWindow(
      Math.max(1, box.width),
      Math.max(1, box.height),
      fraction(position[0]),
      fraction(position[1]),
      window.devicePixelRatio || 1,
    );
    const width = Math.max(1, Math.round(box.width * win.scale));
    const height = Math.max(1, Math.round(box.height * win.scale));
    gl.uniform4f(uniforms.view, win.x, win.y, win.w, win.h);
    gl.uniform1f(uniforms.pixel, win.w / width);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    // A still scene draws only on demand, and resizing clears it.
    if (options.still && ready) frame = requestAnimationFrame(draw);
  };

  const draw = (now: number): void => {
    if (stopped) return;
    const t = now / 1000;
    if (!options.still) {
      // A slow idle sway keeps the scene alive on touch screens and when the pointer rests.
      const idleX = 0.18 * Math.sin(t * 0.21);
      const idleY = 0.12 * Math.sin(t * 0.17 + 1);
      const k = 0.06;
      eased.x += (target.x + idleX - eased.x) * k;
      eased.y += (target.y + idleY - eased.y) * k;
    }
    const cam = camera(eased.x, eased.y);
    gl.uniform3fv(uniforms.camPos, cam.position);
    gl.uniform3fv(uniforms.camRight, cam.right);
    gl.uniform3fv(uniforms.camUp, cam.up);
    gl.uniform3fv(uniforms.camFwd, cam.forward);
    gl.uniform2fv(uniforms.ledge, ledgeShift(cam, FOREGROUND.depth));
    gl.uniform1f(uniforms.time, options.still ? STILL_TIME : t % TIME_WRAP);
    flicker.forEach((f, i) => {
      const light = LIGHTS[i];
      if (light) lights[i * 4 + 2] = options.still ? 1 : lightLevel(light, i, t, f, Math.random);
    });
    gl.uniform4fv(uniforms.lights, lights);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!ready) {
      ready = true;
      options.onReady?.();
    }
    if (!options.still) frame = requestAnimationFrame(draw);
  };

  const move = (e: PointerEvent): void => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const leave = (): void => {
    target.x = 0;
    target.y = 0;
  };

  // The scene starts only with all three pictures; with one missing, the flat picture stays.
  void Promise.all([urls.background, urls.mid, urls.foreground].map(loadImage)).then(
    (images) => {
      if (stopped) return;
      images.forEach((image, unit) => {
        texture(gl, unit, image);
      });
      const noise = noiseTexels(7);
      noiseTexture(gl, images.length, noise);
      noiseTexture(gl, images.length + 1, currentTexels(noise));
      resize();
      frame = requestAnimationFrame(draw);
    },
    () => undefined,
  );

  window.addEventListener("resize", resize);
  if (!options.still) {
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
  }
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", leave);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
