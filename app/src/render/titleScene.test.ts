import { describe, expect, it } from "vitest";
import {
  ART_H,
  ART_W,
  CULL,
  FOREGROUND,
  HORIZON,
  ISLANDS,
  LIGHTS,
  MID,
  PLUME,
  REACH,
  REST,
  camera,
  cardPoint,
  ledgeShift,
  lightLevel,
  noiseTexels,
  project,
  ray,
  seaDistance,
  seaPoint,
  VENT,
  viewWindow,
} from "./titleScene.ts";

/** The camera at the four extremes of the pointer, idle sway included, and at rest. */
const CAMERAS = [
  camera(0, 0),
  camera(-REACH.x, -REACH.y),
  camera(REACH.x, -REACH.y),
  camera(-REACH.x, REACH.y),
  camera(REACH.x, REACH.y),
];

describe("viewWindow", () => {
  it("shows the zoomed picture in a box of its shape", () => {
    const win = viewWindow(ART_W, ART_H, 0.5, 0.5, 1);
    expect(win.x).toBeGreaterThan(0);
    expect(win.x + win.w).toBeCloseTo(ART_W - win.x);
    expect(win.y + win.h).toBeCloseTo(ART_H - win.y);
    expect(win.w / win.h).toBeCloseTo(ART_W / ART_H);
  });

  it("crops a tall box as object-fit: cover does, keeping the right edge for position 100%", () => {
    const right = viewWindow(400, 500, 1, 1, 1);
    const left = viewWindow(400, 500, 0, 1, 1);
    expect(right.w / right.h).toBeCloseTo(400 / 500);
    expect(right.x + right.w).toBeCloseTo(ART_W - viewWindow(ART_W, ART_H, 0.5, 0.5, 1).x);
    expect(left.x).toBeCloseTo(viewWindow(ART_W, ART_H, 0.5, 0.5, 1).x);
  });

  it("draws at the device's resolution but never finer than the art", () => {
    expect(viewWindow(960, 540, 0.5, 0.5, 1).scale).toBe(1);
    expect(viewWindow(960, 540, 0.5, 0.5, 3).scale).toBeCloseTo(2);
    expect(viewWindow(3840, 2160, 0.5, 0.5, 1).scale).toBeCloseTo(0.5);
  });
});

describe("camera", () => {
  it("at rest puts the horizon on the painted one", () => {
    const far = project(REST, [0, 0, 1e6]);
    expect(far[1]).toBeCloseTo(HORIZON, 1);
    expect(far[0]).toBeCloseTo(ART_W / 2, 3);
    expect(seaPoint(REST, ART_W / 2, HORIZON - 1)).toBeUndefined();
  });

  it("projects the points it casts rays through back onto the same pixel", () => {
    for (const cam of CAMERAS) {
      for (const [x, y] of [[100, 700], [960, 1000], [1800, 520]] as const) {
        const p = seaPoint(cam, x, y);
        expect(p).toBeDefined();
        if (!p) continue;
        expect(p[1]).toBeCloseTo(0);
        const back = project(cam, p);
        expect(back[0]).toBeCloseTo(x, 6);
        expect(back[1]).toBeCloseTo(y, 6);
      }
    }
  });

  it("moves near water against far water, a little", () => {
    const near: [number, number, number] = [0, 0, 2.5];
    const far: [number, number, number] = [0, 0, 40];
    const right = camera(1, 0);
    const nearShift = project(right, near)[0] - project(REST, near)[0];
    const farShift = project(right, far)[0] - project(REST, far)[0];
    expect(nearShift).toBeLessThan(0);
    expect(farShift).toBeGreaterThan(0);
    expect(Math.abs(nearShift)).toBeLessThan(40);
  });
});

describe("islands", () => {
  it("lie in the band of their file and stand on painted sea", () => {
    for (const island of ISLANDS) {
      expect(island.top).toBeGreaterThanOrEqual(MID.top);
      expect(island.base).toBeLessThan(MID.bottom);
      expect(island.base).toBeGreaterThan(HORIZON);
      expect(seaDistance(island.base)).toBeGreaterThan(1);
    }
  });

  it("keep their waterline on the silt they stand in whatever the camera does", () => {
    for (const island of ISLANDS) {
      const distance = seaDistance(island.base);
      for (const x of [Math.max(0, island.left), (island.left + island.right) / 2, island.right]) {
        // The foot of the island as painted, a point on the sea.
        const foot = cardPoint(REST, x, island.base, distance);
        expect(foot[1]).toBeCloseTo(0, 9);
        for (const cam of CAMERAS) {
          const [sx, sy] = project(cam, foot);
          // The sea and the island's card meet the ray through that pixel in the same point.
          const sea = seaPoint(cam, sx, sy);
          const card = cardPoint(cam, sx, sy, distance);
          expect(sea).toBeDefined();
          if (!sea) continue;
          for (let i = 0; i < 3; i++) {
            expect(sea[i]).toBeCloseTo(foot[i] ?? 0, 6);
            expect(card[i]).toBeCloseTo(foot[i] ?? 0, 6);
          }
        }
      }
    }
  });

  it("never leave the margin the shader looks for them in", () => {
    for (const island of ISLANDS) {
      const distance = seaDistance(island.base);
      for (const x of [island.left, island.right]) {
        for (const y of [island.top, island.base]) {
          const point = cardPoint(REST, x, y, distance);
          for (const cam of CAMERAS) {
            const [sx, sy] = project(cam, point);
            expect(Math.abs(sx - x)).toBeLessThan(CULL * 0.75);
            expect(Math.abs(sy - y)).toBeLessThan(CULL * 0.75);
          }
        }
      }
    }
  });

  it("are drawn at rest exactly where they were painted", () => {
    for (const island of ISLANDS) {
      const distance = seaDistance(island.base);
      const x = (island.left + island.right) / 2;
      const y = (island.top + island.base) / 2;
      const back = project(REST, cardPoint(REST, x, y, distance));
      expect(back[0]).toBeCloseTo(x, 6);
      expect(back[1]).toBeCloseTo(y, 6);
    }
  });
});

describe("vent", () => {
  /** The art position a direction appears at through the camera at rest, as the shader reads the sky. */
  const restSky = (d: readonly [number, number, number]): readonly [number, number] =>
    project(REST, [d[0] * 1e6, 1 + d[1] * 1e6, d[2] * 1e6]);

  it("stands on the painted horizon", () => {
    expect(VENT.y).toBeLessThan(HORIZON);
    expect(HORIZON - VENT.y).toBeLessThan(25);
  });

  it("keeps the plume's foot on the vent's mouth whatever the camera does", () => {
    const d = ray(REST, VENT.x, VENT.y);
    for (const cam of CAMERAS) {
      // Where the mouth appears now, and what the shader reads there.
      const [sx, sy] = project(cam, [d[0] * 1e6, 1 + d[1] * 1e6, d[2] * 1e6]);
      const [ax, ay] = restSky(ray(cam, sx, sy));
      expect(ax).toBeCloseTo(VENT.x, 3);
      expect(ay).toBeCloseTo(VENT.y, 3);
    }
  });

  it("lets the plume rise inside the picture", () => {
    expect(VENT.y - PLUME.top).toBeGreaterThan(0);
    // Where the painted plume fades, about 260 px up, its axis is still in the picture.
    expect(VENT.x + PLUME.bend * 260 * 260 + PLUME.base + PLUME.spread * 260).toBeLessThan(ART_W);
  });
});

describe("edges", () => {
  const win = viewWindow(ART_W, ART_H, 0.5, 0.5, 1);
  const corners = [
    [win.x, win.y],
    [win.x + win.w, win.y],
    [win.x, win.y + win.h],
    [win.x + win.w, win.y + win.h],
  ] as const;

  it("never shows past the painted sky", () => {
    for (const cam of CAMERAS) {
      for (const [x, y] of corners) {
        const d = ray(cam, x, y);
        // Only the sky is read by direction; below the horizon it is the sea's.
        if (d[1] < 0) continue;
        const [ax, ay] = project(REST, [d[0] * 1e6, 1 + d[1] * 1e6, d[2] * 1e6]);
        expect(ax).toBeGreaterThanOrEqual(0);
        expect(ax).toBeLessThanOrEqual(ART_W);
        expect(ay).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("never shifts the ledge further than the margin the zoom leaves", () => {
    for (const cam of CAMERAS) {
      const [dx, dy] = ledgeShift(cam, FOREGROUND.depth);
      expect(Math.abs(dx)).toBeLessThan(win.x);
      expect(Math.abs(dy)).toBeLessThan(win.y);
    }
  });

  it("leaves the ledge where it was painted at rest", () => {
    const [dx, dy] = ledgeShift(REST, FOREGROUND.depth);
    expect(dx).toBeCloseTo(0, 9);
    expect(dy).toBeCloseTo(0, 9);
  });
});

describe("noiseTexels", () => {
  it("tiles: the last column runs into the first", () => {
    const n = 256;
    const texels = noiseTexels(3);
    let jump = 0;
    let step = 0;
    for (let y = 0; y < n; y++) {
      const at = (x: number): number => texels[(y * n + x) * 4] ?? 0;
      jump = Math.max(jump, Math.abs(at(n - 1) - at(0)));
      step = Math.max(step, Math.abs(at(1) - at(0)));
    }
    expect(jump).toBeLessThanOrEqual(step + 4);
    expect(noiseTexels(3)).toEqual(texels);
  });
});

describe("lightLevel", () => {
  it("keeps every light within its range and lets the pylons stutter", () => {
    let seed = 1;
    const rand = (): number => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    LIGHTS.forEach((light, i) => {
      const f = { phase: 0.5, glitchAt: 0, glitchEnd: 0 };
      let low = Infinity;
      for (let t = 0; t < 60; t += 1 / 30) {
        const level = lightLevel(light, i, t, f, rand);
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(1.15);
        low = Math.min(low, level);
      }
      if (light.kind !== "core") expect(low).toBeLessThan(0.5);
    });
  });
});

describe("layers", () => {
  it("keeps every light on the foreground band", () => {
    for (const light of LIGHTS) {
      expect(light.y).toBeGreaterThan(FOREGROUND.top);
      expect(light.y).toBeLessThan(FOREGROUND.bottom);
    }
  });
});
