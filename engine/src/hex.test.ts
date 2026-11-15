import { describe, expect, it } from "vitest";
import {
  CORNER,
  CORNERS,
  DIRECTIONS,
  centre,
  disc,
  distance,
  extent,
  neighbour,
  neighbourIndices,
  neighbours,
  span,
  tileAtPoint,
  within,
} from "./hex.ts";

const W = 13;
const H = 11;

/** Steps to every tile from (sx, sy), found by walking from neighbour to neighbour. */
function walk(sx: number, sy: number): number[] {
  const steps = new Array<number>(W * H).fill(-1);
  steps[sy * W + sx] = 0;
  const queue = [{ x: sx, y: sy }];
  for (const tile of queue) {
    const here = steps[tile.y * W + tile.x] ?? 0;
    for (const n of neighbours(W, H, tile.x, tile.y)) {
      if (steps[n.y * W + n.x] !== -1) continue;
      steps[n.y * W + n.x] = here + 1;
      queue.push(n);
    }
  }
  return steps;
}

describe("neighbours", () => {
  it("has six in the middle of the map, all one tile away", () => {
    for (const [x, y] of [
      [5, 4],
      [5, 5],
    ] as const) {
      const around = neighbours(W, H, x, y);
      expect(around).toHaveLength(6);
      expect(new Set(around.map((n) => `${n.x},${n.y}`)).size).toBe(6);
      for (const n of around) expect(span(x, y, n.x, n.y)).toBeCloseTo(1, 10);
    }
  });

  it("is mutual: the opposite direction leads back", () => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        for (let d = 0; d < DIRECTIONS; d++) {
          const n = neighbour(x, y, d);
          expect(neighbour(n.x, n.y, (d + 3) % 6)).toEqual({ x, y });
        }
      }
    }
  });

  it("points each direction at 60° steps, clockwise from east", () => {
    for (const y of [4, 5]) {
      const from = centre(5, y);
      for (let d = 0; d < DIRECTIONS; d++) {
        const n = neighbour(5, y, d);
        const to = centre(n.x, n.y);
        const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
        expect((Math.round(angle) + 360) % 360).toBe(60 * d);
      }
    }
  });

  it("is cut off at the map edge", () => {
    expect(neighbours(W, H, 0, 0)).toHaveLength(2);
    expect(neighbours(W, H, 0, 1)).toHaveLength(5);
    const out = new Int32Array(6);
    neighbourIndices(W, H, 0, 0, out);
    expect([...out]).toEqual([1, W, -1, -1, -1, -1]);
    neighbourIndices(W, H, 5, 5, out);
    expect([...out].sort((a, b) => a - b)).toEqual(
      neighbours(W, H, 5, 5)
        .map((n) => n.y * W + n.x)
        .sort((a, b) => a - b),
    );
  });
});

describe("distance", () => {
  it("counts the steps of the shortest walk", () => {
    for (const [sx, sy] of [
      [0, 0],
      [6, 5],
      [12, 10],
      [3, 8],
    ] as const) {
      const steps = walk(sx, sy);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) expect(distance(sx, sy, x, y)).toBe(steps[y * W + x]);
      }
    }
  });
});

describe("within", () => {
  it("visits exactly the tiles in range, each once, with its step count", () => {
    for (const [cx, cy, radius] of [
      [6, 5, 0],
      [6, 5, 3],
      [6, 4, 2],
      [0, 0, 4],
      [12, 9, 5],
    ] as const) {
      const seen = new Map<number, number>();
      within(W, H, cx, cy, radius, (i, steps, x, y) => {
        expect(seen.has(i)).toBe(false);
        expect(i).toBe(y * W + x);
        seen.set(i, steps);
      });
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const d = distance(cx, cy, x, y);
          expect(seen.get(y * W + x)).toBe(d <= radius ? d : undefined);
        }
      }
    }
  });

  it("covers 1 + 3r(r + 1) tiles away from the edge", () => {
    for (const radius of [0, 1, 2, 3]) {
      let count = 0;
      within(W, H, 6, 5, radius, () => count++);
      expect(count).toBe(1 + 3 * radius * (radius + 1));
    }
  });

  it("drops the fraction of a radius", () => {
    let count = 0;
    within(W, H, 6, 5, 1.9, () => count++);
    expect(count).toBe(7);
  });
});

describe("disc", () => {
  it("is the tile and the rings around it, on or off the map", () => {
    expect(disc(4, 4, 0)).toEqual([{ x: 4, y: 4 }]);
    for (const cy of [4, 5]) {
      const tiles = disc(4, cy, 1);
      expect(tiles).toHaveLength(7);
      for (const tile of tiles) expect(distance(4, cy, tile.x, tile.y)).toBeLessThanOrEqual(1);
    }
    expect(disc(0, 0, 1).some((tile) => tile.x < 0 || tile.y < 0)).toBe(true);
  });
});

describe("positions", () => {
  it("finds the tile under its own centre and under points just inside its corners", () => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = centre(x, y);
        expect(tileAtPoint(c.x, c.y)).toEqual({ x, y });
        for (const corner of CORNERS) {
          expect(tileAtPoint(c.x + corner.x * 0.98, c.y + corner.y * 0.98)).toEqual({ x, y });
        }
      }
    }
  });

  it("gives a point to the nearest centre", () => {
    let seed = 7;
    const random = (): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let n = 0; n < 2000; n++) {
      const px = random() * (W - 1);
      const py = random() * (H - 1) * 0.86;
      const tile = tileAtPoint(px, py);
      const c = centre(tile.x, tile.y);
      const own = Math.hypot(px - c.x, py - c.y);
      for (let d = 0; d < DIRECTIONS; d++) {
        const other = neighbour(tile.x, tile.y, d);
        const oc = centre(other.x, other.y);
        expect(own).toBeLessThanOrEqual(Math.hypot(px - oc.x, py - oc.y) + 1e-9);
      }
    }
  });

  it("puts the corners on a circle, the side of each direction facing its neighbour", () => {
    for (let d = 0; d < DIRECTIONS; d++) {
      const a = CORNERS[d] ?? { x: 0, y: 0 };
      const b = CORNERS[(d + 1) % 6] ?? { x: 0, y: 0 };
      expect(Math.hypot(a.x, a.y)).toBeCloseTo(CORNER, 10);
      const n = neighbour(5, 4, d);
      const from = centre(5, 4);
      const to = centre(n.x, n.y);
      // The middle of the side is halfway to the neighbour.
      expect((a.x + b.x) / 2).toBeCloseTo((to.x - from.x) / 2, 10);
      expect((a.y + b.y) / 2).toBeCloseTo((to.y - from.y) / 2, 10);
    }
  });

  it("measures the map from edge to edge", () => {
    const size = extent(W, H);
    const last = centre(W - 1, H - 2);
    expect(size.width).toBeCloseTo(last.x + 1, 10);
    expect(size.height).toBeCloseTo(centre(0, H - 1).y + 2 * CORNER, 10);
  });
});
