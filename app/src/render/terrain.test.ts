import { describe, expect, it } from "vitest";
import { centre } from "@ebbline2/engine";
import { ORIGIN } from "../camera.ts";
import { SILT_SUB, paintSilt, siltLayout } from "./terrain.ts";

const W = 12;
const H = 10;

/** The blended depth of every pixel, or NaN off the map. */
function depths(silt: Float32Array): { values: Float64Array; width: number; height: number } {
  const layout = siltLayout(W, H);
  const values = new Float64Array(layout.width * layout.height);
  for (let p = 0; p < values.length; p++) {
    const a = layout.tiles[p * 3] ?? -1;
    if (a < 0) {
      values[p] = NaN;
      continue;
    }
    let sum = 0;
    for (let k = 0; k < 3; k++) sum += (silt[layout.tiles[p * 3 + k] ?? a] ?? 0) * (layout.weights[p * 3 + k] ?? 0);
    values[p] = sum;
  }
  return { values, width: layout.width, height: layout.height };
}

describe("silt layout", () => {
  it("weighs every pixel on the map by up to three tiles, summing to one", () => {
    const layout = siltLayout(W, H);
    let on = 0;
    for (let p = 0; p < layout.width * layout.height; p++) {
      if ((layout.tiles[p * 3] ?? -1) < 0) continue;
      on++;
      const w = [0, 1, 2].map((k) => layout.weights[p * 3 + k] ?? -1);
      for (const v of w) expect(v).toBeGreaterThanOrEqual(0);
      expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
    }
    // The hexagons cover the map's extent but for the notches along its edges.
    expect(on / (layout.width * layout.height)).toBeGreaterThan(0.85);
  });

  it("takes the pixel at a tile's centre mostly from that tile", () => {
    const layout = siltLayout(W, H);
    for (const [x, y] of [[0, 0], [3, 4], [4, 5], [11, 9]] as const) {
      const c = centre(x, y);
      const p = Math.floor((c.y + ORIGIN.y) * SILT_SUB) * layout.width + Math.floor((c.x + ORIGIN.x) * SILT_SUB);
      expect(layout.tiles[p * 3]).toBe(y * W + x);
      expect(layout.weights[p * 3]).toBeGreaterThan(0.6);
    }
  });

  it("blends without jumps, so no rows or seams show", () => {
    const silt = new Float32Array(W * H);
    silt[5 * W + 6] = 1;
    silt[4 * W + 3] = 1;
    const { values, width, height } = depths(silt);
    // Depth falls from 1 to 0 over the distance between rows at the steepest, about 1.15 per tile.
    const limit = 1.2 / SILT_SUB + 0.01;
    let worst = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const here = values[y * width + x] ?? NaN;
        const right = x + 1 < width ? (values[y * width + x + 1] ?? NaN) : NaN;
        const below = y + 1 < height ? (values[(y + 1) * width + x] ?? NaN) : NaN;
        if (!Number.isNaN(here) && !Number.isNaN(right)) worst = Math.max(worst, Math.abs(here - right));
        if (!Number.isNaN(here) && !Number.isNaN(below)) worst = Math.max(worst, Math.abs(here - below));
      }
    }
    expect(worst).toBeLessThan(limit);
  });

  it("paints wet tiles and leaves dry ground and the map's notches clear", () => {
    const layout = siltLayout(W, H);
    const image = { data: new Uint8ClampedArray(layout.width * layout.height * 4).fill(255) } as unknown as ImageData;
    const silt = new Float32Array(W * H);
    silt[5 * W + 6] = 2;
    paintSilt(image, silt, layout, 0);
    const c = centre(6, 5);
    const wet = (Math.floor((c.y + ORIGIN.y) * SILT_SUB) * layout.width + Math.floor((c.x + ORIGIN.x) * SILT_SUB)) * 4;
    expect(image.data[wet + 3]).toBeGreaterThan(100);
    // The top-left pixel lies outside tile (0, 0); a dry tile far away stays clear.
    expect(image.data[3]).toBe(0);
    const far = centre(1, 8);
    const dry = (Math.floor((far.y + ORIGIN.y) * SILT_SUB) * layout.width + Math.floor((far.x + ORIGIN.x) * SILT_SUB)) * 4;
    expect(image.data[dry + 3]).toBe(0);
  });
});
