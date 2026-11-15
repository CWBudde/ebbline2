import { describe, expect, it } from "vitest";
import { distance } from "@ebbline2/engine";
import { areaOutline, hexPoints, outline } from "./hexes.ts";

/** Every vertex of every loop, as "x,y" rounded to a tenth of a pixel. */
const vertices = (loops: number[][]): string[] =>
  loops.flatMap((loop) => {
    const out: string[] = [];
    for (let n = 0; n < loop.length; n += 2) out.push(`${(loop[n] ?? 0).toFixed(1)},${(loop[n + 1] ?? 0).toFixed(1)}`);
    return out;
  });

describe("tile outlines", () => {
  it("outlines a single tile as its own hexagon", () => {
    const loops = areaOutline(20, 20, 7, 7, 0);
    expect(loops).toHaveLength(1);
    expect(new Set(vertices(loops))).toEqual(new Set(vertices([hexPoints(7, 7)])));
  });

  it("outlines a range as one closed loop of 6 (2r + 1) sides", () => {
    for (const [x, y] of [[10, 10], [10, 11]] as const) {
      const loops = areaOutline(30, 30, x, y, 3);
      expect(loops).toHaveLength(1);
      expect(loops[0]).toHaveLength(2 * 6 * 7);
    }
  });

  it("closes a range cut off by the edge of the map along that edge", () => {
    const loops = areaOutline(30, 30, 1, 0, 4);
    expect(loops).toHaveLength(1);
    // No vertex lies above the top row's corners or left of the first column's sides.
    for (const v of vertices(loops)) {
      const [vx, vy] = v.split(",").map(Number);
      expect(vx).toBeGreaterThanOrEqual(-0.05);
      expect(vy).toBeGreaterThanOrEqual(-0.05);
    }
  });

  it("gives a ring an outer and an inner loop", () => {
    const members: { x: number; y: number }[] = [];
    const inSet = (x: number, y: number): boolean => {
      const d = distance(10, 10, x, y);
      return d >= 2 && d <= 3;
    };
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) if (inSet(x, y)) members.push({ x, y });
    const loops = outline(members, inSet);
    expect(loops.map((l) => l.length / 2).sort((a, b) => a - b)).toEqual([6 * 3, 6 * 7]);
  });
});
