// The living title backdrop: three painted layers drawn over each other, each shifted by its own
// depth as the pointer moves, so the ledge with the lander slides over the rock islands and those
// over the silt sea, and the grid lights on the pylons flicker. Falls back to nothing (the plain
// <img> of the flat picture stays) without WebGL or when a layer fails to load.
//
// The background layer holds only sky and sea. It is read in one place, `backdrop()` in the fragment
// shader, so a generated sea or a prerendered loop can take its place without touching the rest.

/** The size of the whole picture; every position below is in its pixels. */
export const ART_W = 1920;
export const ART_H = 1080;

/** How far content at full depth moves, as a fraction of the picture, at the pointer's extreme. */
const SHIFT = 0.02;
/** The depth that stays put; nearer moves with the pointer shift, farther against it. */
const PIVOT = 0.35;
/** Shows slightly less than the whole picture so the shifted edges never run out of art. */
const ZOOM = 0.968;

/**
 * A cut-out layer: a band of the picture's rows. Its file is twice as tall as the band, the colour
 * over the matte in the upper half and the alpha as grey in the lower half.
 */
export interface Band {
  /** First row of the band in the picture, and the row after its last. */
  readonly top: number;
  readonly bottom: number;
  /** 0 is the far sea, 1 the near ledge. */
  readonly depth: number;
}

/** The sky and the silt sea: the whole picture, opaque. */
export const BACKGROUND_DEPTH = 0;
/** The rock islands in the sea. */
export const MID: Band = { top: 500, bottom: 920, depth: 0.45 };
/** The near ledge with the lander and the pylons. */
export const FOREGROUND: Band = { top: 560, bottom: 1080, depth: 1 };
/** The colour the layer files have under their transparent pixels. */
const MATTE = [0x1a, 0x12, 0x10] as const;

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
  { x: 719, y: 916, kind: "pylon" },
  { x: 887, y: 843, kind: "pylon" },
  { x: 1066, y: 780, kind: "pylon" },
  { x: 1243, y: 725, kind: "pylon" },
  { x: 1738, y: 585, kind: "beacon" },
  { x: 1610, y: 655, kind: "core" },
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

const VERTEX = `
attribute vec2 corner;
varying vec2 uv;
void main() {
  uv = vec2(corner.x * 0.5 + 0.5, 0.5 - corner.y * 0.5);
  gl_Position = vec4(corner, 0.0, 1.0);
}`;

const glsl = (n: number): string => n.toFixed(5);
const band = (b: Band): string => `vec2(${glsl(b.top / ART_H)}, ${glsl((b.bottom - b.top) / ART_H)})`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D background;
uniform sampler2D mid;
uniform sampler2D foreground;
uniform vec2 shift;
uniform vec4 lights[${LIGHTS.length}];
uniform vec3 tints[${LIGHTS.length}];
varying vec2 uv;
const float ZOOM = ${glsl(ZOOM)};
const float PIVOT = ${glsl(PIVOT)};
const float ASPECT = ${glsl(ART_W / ART_H)};
const vec3 MATTE = vec3(${MATTE.map((v) => glsl(v / 255)).join(", ")});

// The sky and the sea at a point of the picture. The one place that reads the background.
vec3 backdrop(vec2 p) {
  return texture2D(background, p).rgb;
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

void main() {
  vec2 base = 0.5 + (uv - 0.5) * ZOOM;
  vec2 at;
  vec3 c = backdrop(base + shift * (${glsl(BACKGROUND_DEPTH)} - PIVOT));

  vec2 pm = base + shift * (${glsl(MID.depth)} - PIVOT);
  float am = cover(mid, pm, ${band(MID)}, at);
  c = mix(c, over(c, texture2D(mid, at).rgb, am), step(0.001, am));

  // The lights are painted on the foreground, so they move with it.
  vec2 pf = base + shift * (${glsl(FOREGROUND.depth)} - PIVOT);
  float af = cover(foreground, pf, ${band(FOREGROUND)}, at);
  vec3 near = texture2D(foreground, at).rgb;
  vec3 glow = vec3(0.0);
  for (int i = 0; i < ${LIGHTS.length}; i++) {
    vec2 d = (pf - lights[i].xy) * vec2(ASPECT, 1.0);
    float r2 = dot(d, d);
    float level = lights[i].z;
    float core = exp(-r2 / (lights[i].w * lights[i].w));
    float halo = exp(-r2 / (lights[i].w * lights[i].w * 16.0));
    // Dim the painted light when the level drops, then add its glow back on top.
    near *= mix(1.0, 0.35 + 0.65 * min(level, 1.0), core);
    glow += tints[i] * (core * 0.55 * level + halo * 0.22 * level * level);
  }
  c = mix(c, over(c, near, af), step(0.001, af));
  gl_FragColor = vec4(c + glow, 1.0);
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

  const shiftAt = gl.getUniformLocation(program, "shift");
  const lightsAt = gl.getUniformLocation(program, "lights");
  const tintsAt = gl.getUniformLocation(program, "tints");
  gl.uniform1i(gl.getUniformLocation(program, "background"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "mid"), 1);
  gl.uniform1i(gl.getUniformLocation(program, "foreground"), 2);
  const tint: Record<LightKind, readonly number[]> = {
    pylon: [0.35, 0.9, 1.0],
    beacon: [0.45, 0.95, 1.0],
    core: [0.2, 0.75, 0.9],
  };
  const radius: Record<LightKind, number> = { pylon: 0.0085, beacon: 0.007, core: 0.02 };
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

  // The scene starts only with all three layers; with one missing, the flat picture stays.
  void Promise.all([urls.background, urls.mid, urls.foreground].map(loadImage)).then(
    (images) => {
      if (stopped) return;
      images.forEach((image, unit) => {
        texture(gl, unit, image);
      });
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
