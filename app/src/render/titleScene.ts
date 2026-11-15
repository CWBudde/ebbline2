// The living title backdrop: the key art drawn through a depth map, so the ledge with the lander
// shifts more than the silt plain and the sky drifts the other way as the pointer moves, and the
// grid lights on the pylons flicker. Falls back to nothing (the plain <img> stays) without WebGL.

/** The key art's own size; every position below is in its pixels. */
export const ART_W = 1920;
export const ART_H = 1080;

/** How far content at full depth moves, as a fraction of the picture, at the pointer's extreme. */
const SHIFT = 0.012;
/** The depth that stays put; nearer moves with the pointer shift, farther against it. */
const PIVOT = 0.35;
/** Shows slightly less than the whole picture so the shifted edges never run out of art. */
const ZOOM = 0.968;

type Pt = readonly [number, number];

/** The near ledge from the bottom-left rocks to the right edge, the lander on it. */
const LEDGE: readonly Pt[] = [
  [560, 1080], [700, 1040], [750, 1010], [800, 962], [900, 942], [1000, 930], [1080, 918],
  [1180, 880], [1250, 852], [1320, 842], [1440, 836], [1462, 842], [1468, 742], [1498, 708],
  [1576, 700], [1580, 672], [1622, 672], [1626, 690], [1668, 690], [1674, 668], [1706, 668],
  [1710, 622], [1724, 622], [1726, 690], [1798, 704], [1816, 746], [1822, 800], [1920, 772],
  [1920, 1080],
];
/** The dark rocks in the bottom-left corner. */
const CORNER: readonly Pt[] = [[0, 975], [120, 962], [250, 985], [320, 1080], [0, 1080]];
/** The big rock island on the left of the plain. */
const ISLAND: readonly Pt[] = [
  [0, 735], [120, 700], [260, 680], [420, 662], [480, 660], [600, 720], [700, 760], [860, 800],
  [700, 830], [460, 850], [240, 880], [0, 900],
];
/** The pylon poles: tip and foot. */
const POLES: readonly (readonly [number, number, number])[] = [
  [840, 896, 975], [970, 876, 955], [1098, 842, 925], [1337, 778, 870],
];

export type LightKind = "pylon" | "beacon" | "core";
export interface Light {
  readonly x: number;
  readonly y: number;
  readonly kind: LightKind;
}

/** The lights of the picture, painted bright; the shader dims and brightens them. */
export const LIGHTS: readonly Light[] = [
  { x: 840, y: 903, kind: "pylon" },
  { x: 970, y: 883, kind: "pylon" },
  { x: 1098, y: 850, kind: "pylon" },
  { x: 1337, y: 786, kind: "pylon" },
  { x: 1717, y: 627, kind: "beacon" },
  { x: 1682, y: 820, kind: "core" },
];

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

function path(ctx: CanvasRenderingContext2D, points: readonly Pt[], k: number): void {
  ctx.beginPath();
  points.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * k, y * k);
    else ctx.lineTo(x * k, y * k);
  });
  ctx.closePath();
  ctx.fill();
}

/** Paints the depth map, near white, far black, at a quarter of the art's size. */
function depthMap(): HTMLCanvasElement {
  const k = 0.25;
  const canvas = document.createElement("canvas");
  canvas.width = ART_W * k;
  canvas.height = ART_H * k;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const horizon = 0.53;
  const plain = ctx.createLinearGradient(0, 0, 0, canvas.height);
  plain.addColorStop(0, "rgb(0,0,0)");
  plain.addColorStop(horizon, "rgb(10,10,10)");
  plain.addColorStop(1, "rgb(130,130,130)");
  ctx.fillStyle = plain;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const blur = (px: number): void => {
    if ("filter" in ctx) ctx.filter = px > 0 ? `blur(${px}px)` : "none";
  };
  blur(6);
  ctx.fillStyle = "rgb(105,105,105)";
  path(ctx, ISLAND, k);
  blur(2.5);
  ctx.fillStyle = "rgb(255,255,255)";
  path(ctx, LEDGE, k);
  path(ctx, CORNER, k);
  blur(1);
  for (const [x, top, foot] of POLES) ctx.fillRect((x - 11) * k, (top - 6) * k, 22 * k, (foot - top + 6) * k);
  blur(0);
  return canvas;
}

const VERTEX = `
attribute vec2 corner;
varying vec2 uv;
void main() {
  uv = vec2(corner.x * 0.5 + 0.5, 0.5 - corner.y * 0.5);
  gl_Position = vec4(corner, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D art;
uniform sampler2D depth;
uniform vec2 shift;
uniform vec4 lights[${LIGHTS.length}];
uniform vec3 tints[${LIGHTS.length}];
varying vec2 uv;
const float ZOOM = ${ZOOM.toFixed(4)};
const float PIVOT = ${PIVOT.toFixed(4)};
const float ASPECT = ${(ART_W / ART_H).toFixed(4)};
void main() {
  vec2 base = 0.5 + (uv - 0.5) * ZOOM;
  // Two steps toward the depth at the displaced point keep near edges from smearing.
  vec2 p = base + shift * (texture2D(depth, base).r - PIVOT);
  p = base + shift * (texture2D(depth, p).r - PIVOT);
  vec3 c = texture2D(art, p).rgb;
  for (int i = 0; i < ${LIGHTS.length}; i++) {
    vec2 d = (p - lights[i].xy) * vec2(ASPECT, 1.0);
    float r2 = dot(d, d);
    float level = lights[i].z;
    float core = exp(-r2 / (lights[i].w * lights[i].w));
    float halo = exp(-r2 / (lights[i].w * lights[i].w * 16.0));
    // Dim the painted light when the level drops, then add its glow back on top.
    c *= mix(1.0, 0.35 + 0.65 * min(level, 1.0), core);
    c += tints[i] * (core * 0.55 * level + halo * 0.22 * level * level);
  }
  gl_FragColor = vec4(c, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
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

/** The canvas resolution for a displayed box: enough for a sharp cover fit, never above the art. */
export function canvasScale(width: number, height: number, dpr: number): number {
  return Math.min(1, Math.max(width / ART_W, height / ART_H) * dpr);
}

export interface SceneOptions {
  /** True keeps everything still: no parallax, steady lights. */
  readonly still: boolean;
  /** Called once the scene draws, so the plain picture under it can step aside. */
  readonly onReady?: () => void;
}

/** Starts the scene on a canvas; returns the function that stops it. */
export function startTitleScene(canvas: HTMLCanvasElement, artUrl: string, options: SceneOptions): () => void {
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

  const shiftAt = gl.getUniformLocation(program, "shift");
  const lightsAt = gl.getUniformLocation(program, "lights");
  const tintsAt = gl.getUniformLocation(program, "tints");
  gl.uniform1i(gl.getUniformLocation(program, "art"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "depth"), 1);
  const tint: Record<LightKind, readonly number[]> = {
    pylon: [0.35, 0.9, 1.0],
    beacon: [0.45, 0.95, 1.0],
    core: [0.2, 0.75, 0.9],
  };
  const radius: Record<LightKind, number> = { pylon: 0.0075, beacon: 0.006, core: 0.02 };
  gl.uniform3fv(tintsAt, LIGHTS.flatMap((l) => tint[l.kind]));
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
    const scale = canvasScale(box.width, box.height, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(ART_W * scale));
    const height = Math.max(1, Math.round(ART_H * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      // A still scene draws only on demand, and resizing clears it.
      if (options.still && ready) frame = requestAnimationFrame(draw);
    }
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
    gl.uniform2f(shiftAt, eased.x * SHIFT, eased.y * SHIFT * 0.6);
    flicker.forEach((f, i) => {
      const light = LIGHTS[i];
      if (light) lights[i * 4 + 2] = options.still ? 1 : lightLevel(light, i, t, f, Math.random);
    });
    gl.uniform4fv(lightsAt, lights);
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

  const image = new Image();
  image.decoding = "async";
  image.onload = (): void => {
    if (stopped) return;
    texture(gl, 0, image);
    texture(gl, 1, depthMap());
    resize();
    frame = requestAnimationFrame(draw);
  };
  image.src = artUrl;

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
