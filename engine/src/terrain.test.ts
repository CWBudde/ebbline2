import { describe, expect, it } from "vitest";
import { CAMPAIGN, skirmish } from "./levels.ts";
import { next, int } from "./rng.ts";
import { fingerprint } from "./save.ts";
import { generate } from "./terrain.ts";
import { distance, tileOf, within } from "./hex.ts";
import { KINDS, MAX_HEIGHT, ROCK, TICK_HZ, find, type Game, type Landform, type LevelDef } from "./state.ts";

describe("rng", () => {
  it("repeats for the same seed and stays in range", () => {
    const a = { rng: 42 };
    const b = { rng: 42 };
    for (let n = 0; n < 1000; n++) {
      const v = next(a);
      expect(v).toBe(next(b));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(int(a, 1)).toBe(0);
    expect(next({ rng: 1 })).not.toBe(next({ rng: 2 }));
  });
});

describe("terrain", () => {
  it("is the same for the same level and differs between seeds", () => {
    const level = skirmish(5, "small", "normal");
    expect(fingerprint(generate(level))).toBe(fingerprint(generate(level)));
    expect(fingerprint(generate(skirmish(6, "small", "normal")))).not.toBe(
      fingerprint(generate(level)),
    );
  });

  it.each([...CAMPAIGN, skirmish(1, "small", "easy"), skirmish(99, "large", "hard")])(
    "sets up $id as the level asks",
    (level) => {
      const game = generate(level);
      const lander = find(game, game.landerId);
      if (!lander) throw new Error("no lander");
      expect(game.vents).toHaveLength(level.vents.count);
      expect(game.spitters).toHaveLength(level.spitters.count);
      let lodes = 0;
      let close = 0;
      for (let i = 0; i < game.lode.length; i++) {
        if (game.lode[i] !== 1) continue;
        lodes += 1;
        expect(game.height[i]).not.toBe(ROCK);
        const t = tileOf(game.w, i);
        const d = distance(lander.x, lander.y, t.x, t.y);
        expect(d).toBeGreaterThanOrEqual(3);
        if (d <= 5) close += 1;
      }
      expect(lodes).toBe(level.lodes);
      // Two lodes within reach of the lander, when the level has two.
      expect(close).toBeGreaterThanOrEqual(Math.min(2, level.lodes));
      for (const h of game.height) {
        expect(h).toBeGreaterThanOrEqual(ROCK);
        expect(h).toBeLessThanOrEqual(MAX_HEIGHT);
      }
      game.vents.forEach((vent, n) => {
        expect(game.height[vent.y * game.w + vent.x]).not.toBe(ROCK);
        const d = distance(vent.x, vent.y, lander.x, lander.y);
        // A level may ask for its first vent close by; the rest lie far out.
        const near = level.vents.near;
        if (n === 0 && near !== undefined) {
          expect(d).toBeGreaterThanOrEqual(near);
          expect(d).toBeLessThanOrEqual(near + 2);
        } else if (level.landform === "shoal-bend") {
          // The clockwise bend puts the vents south of the lander, across the wide spur.
          expect(vent.y).toBeGreaterThan(game.h / 2);
          expect(lander.y).toBeLessThan(game.h / 2);
          expect(d).toBeGreaterThanOrEqual(level.size * 0.35);
        } else {
          // A horseshoe puts them across the spur from the lander, a little closer as the crow flies but much
          // further round the valley.
          expect(d).toBeGreaterThanOrEqual(level.size * (level.landform === "horseshoe" ? 0.3 : 0.35));
        }
      });
      for (const spitter of game.spitters) {
        expect(distance(spitter.x, spitter.y, lander.x, lander.y)).toBeGreaterThanOrEqual(level.size * 0.4);
      }
      // The lander's seven tiles are level ground, and no rock stands within three steps of it.
      const ground = game.height[lander.y * game.w + lander.x];
      within(game.w, game.h, lander.x, lander.y, 3, (i, steps) => {
        expect(game.height[i]).not.toBe(ROCK);
        if (steps <= KINDS.lander.radius) expect(game.height[i]).toBe(ground);
      });
    },
  );
});

describe("level variations", () => {
  const base = skirmish(5, "medium", "normal");
  const variant = (change: Partial<LevelDef>): LevelDef => ({ ...base, ...change });
  const lander = (game: Game): { x: number; y: number } => {
    const l = find(game, game.landerId);
    if (!l) throw new Error("no lander");
    return l;
  };

  /** Mean ground height of the non-rock tiles whose distance from the map's middle passes the test. */
  function meanHeight(game: Game, keep: (fromMiddle: number) => boolean): number {
    const mid = game.w >> 1;
    let sum = 0;
    let n = 0;
    game.height.forEach((h, i) => {
      const t = tileOf(game.w, i);
      if (h === ROCK || !keep(distance(t.x, t.y, mid, mid))) return;
      sum += h;
      n += 1;
    });
    return sum / n;
  }

  it("leaves the map as it was when a level names no landform or names hills", () => {
    const hills = generate(variant({ landform: "hills" }));
    const plain = generate(base);
    expect(hills.height).toEqual(plain.height);
    expect(hills.lode).toEqual(plain.lode);
    expect(hills.vents).toEqual(plain.vents);
  });

  it("bends a horseshoe valley from the vents in the east round to the lander low in the west, rock on the spur", () => {
    for (const size of [48, 64]) {
      const game = generate(variant({ landform: "horseshoe", size }));
      const l = lander(game);
      const ground = (x: number, y: number): number => game.height[y * game.w + x] ?? ROCK;
      expect(l.x).toBeLessThan(size / 2);
      for (const vent of game.vents) {
        expect(vent.x).toBeGreaterThan(size / 2);
        expect(ground(vent.x, vent.y)).toBeGreaterThan(ground(l.x, l.y));
      }
      // The spine of rock on the spur stands across the lander's row, between it and the vents.
      let rock = false;
      for (let x = l.x; x < size; x++) if (ground(x, l.y) === ROCK && x > size * 0.4 && x < size * 0.6) rock = true;
      expect(rock).toBe(true);
    }
  });

  it.each(["basin", "mesa", "ridges", "channels", "terraces", "horseshoe"] as const)(
    "shapes %s land that differs from hills and stays in range",
    (landform: Landform) => {
      const game = generate(variant({ landform }));
      expect(game.height).not.toEqual(generate(base).height);
      for (const h of game.height) {
        expect(h).toBeGreaterThanOrEqual(ROCK);
        expect(h).toBeLessThanOrEqual(MAX_HEIGHT);
      }
      expect(game.vents).toHaveLength(base.vents.count);
    },
  );

  it("sinks the middle of a basin and lifts the middle of a mesa", () => {
    const size = base.size;
    const middle = (d: number): boolean => d < size / 6;
    const rim = (d: number): boolean => d > size * 0.4;
    const basin = generate(variant({ landform: "basin" }));
    expect(meanHeight(basin, middle)).toBeLessThan(meanHeight(basin, rim) - 2);
    const mesa = generate(variant({ landform: "mesa" }));
    expect(meanHeight(mesa, middle)).toBeGreaterThan(meanHeight(mesa, rim) + 2);
  });

  it("flattens terraces into a few wide steps", () => {
    const game = generate(variant({ landform: "terraces" }));
    const levels = new Set(game.height.filter((h) => h !== ROCK));
    expect([...levels].sort()).toEqual([0, 3, 6, 9]);
  });

  it("turns about the share of the map to rock that the level asks for", () => {
    for (const rock of [0, 0.1, 0.3]) {
      const game = generate(variant({ rock }));
      const share = game.height.filter((h) => h === ROCK).length / game.height.length;
      // The lander's surroundings are cleared of rock, so the share can only come out a little lower.
      expect(share).toBeLessThanOrEqual(rock + 1e-9);
      expect(share).toBeGreaterThan(rock - 0.01);
    }
  });

  it("starts a flooded level with silt on the map and the clock and vents as usual", () => {
    const dry = generate(base);
    const game = generate(variant({ flood: 60 }));
    expect(game.tick).toBe(0);
    expect(game.silt.reduce((a, b) => a + b, 0)).toBeGreaterThan(base.vents.amount * 10);
    expect(game.vents.map((v) => v.timer)).toEqual(dry.vents.map((v) => v.timer));
    expect(game.vents.every((v) => !v.capped && v.pressure === 0)).toBe(true);
  });

  it("keeps a dormant vent dry while the level floods", () => {
    const one = { ...base.vents, count: 1, each: [{ delay: 30 }] };
    const game = generate(variant({ vents: one, flood: 60 }));
    expect(game.silt.reduce((a, b) => a + b, 0)).toBe(0);
  });

  it("fills a sea level up to its surface and leaves the ground above it dry", () => {
    const game = generate(variant({ sea: 3 }));
    game.height.forEach((h, i) => {
      const silt = game.silt[i] ?? 0;
      if (h === ROCK || h >= 3) expect(silt).toBe(0);
      else expect(h + silt).toBe(3);
    });
    for (let i = 0; i < game.lode.length; i++) {
      if (game.lode[i] === 1) expect(game.height[i]).toBeGreaterThan(3);
    }
  });

  it("raises an archipelago of steep islands of similar size, the lander on a middling one", () => {
    const sea = 4;
    const game = generate(variant({ landform: "archipelago", sea }));
    // Islands are groups of touching tiles above the sea floor; rock only stands on them.
    const island = new Int32Array(game.height.length).fill(-1);
    const sizes: number[] = [];
    const tops: number[] = [];
    game.height.forEach((h, start) => {
      if ((h !== ROCK && h < sea) || island[start] !== -1) return;
      const id = sizes.length;
      const group = [start];
      island[start] = id;
      let top = 0;
      for (let k = 0; k < group.length; k++) {
        const t = tileOf(game.w, group[k] as number);
        top = Math.max(top, game.height[group[k] as number] ?? 0);
        within(game.w, game.h, t.x, t.y, 1, (j) => {
          const g = game.height[j] ?? 0;
          if ((g === ROCK || g >= sea) && island[j] === -1) {
            island[j] = id;
            group.push(j);
          }
        });
      }
      sizes.push(group.length);
      tops.push(top);
    });
    for (const h of game.height) expect(h === ROCK || h <= 2 || h >= sea).toBe(true);
    expect(sizes.length).toBeGreaterThanOrEqual(12);
    expect(Math.max(...sizes)).toBeLessThan(Math.min(...sizes) * 4);
    for (const top of tops) expect(top).toBeGreaterThanOrEqual(6);
    const l = lander(game);
    const own = sizes[island[l.y * game.w + l.x] ?? -1] ?? 0;
    expect(own).toBeGreaterThan(Math.min(...sizes));
    expect(own).toBeLessThan(Math.max(...sizes));
    // The vents lie on the sea floor under the sea, the lodes on the islands.
    for (const v of game.vents) expect(game.silt[v.y * game.w + v.x]).toBeGreaterThanOrEqual(sea - 2);
    for (let i = 0; i < game.lode.length; i++) {
      if (game.lode[i] === 1) expect(game.height[i]).toBeGreaterThan(sea);
    }
  });

  it("changes each vent as listed, counting from the one nearest the lander", () => {
    const each = [{ amount: 2 }, { period: 25, delay: 10 }];
    const game = generate(variant({ vents: { ...base.vents, each } }));
    const plain = generate(base);
    const l = lander(game);
    const order = [...game.vents].sort((a, b) => distance(a.x, a.y, l.x, l.y) - distance(b.x, b.y, l.x, l.y));
    const [first, second, third] = order;
    if (!first || !second || !third) throw new Error("three vents expected");
    expect(first.amount).toBe(base.vents.amount * 2);
    expect(first.period).toBe(base.vents.period);
    expect(second.amount).toBe(base.vents.amount);
    expect(second.period).toBe(25);
    expect(third).toMatchObject({ amount: base.vents.amount, period: base.vents.period });
    // The delay comes on top of the usual stagger.
    const index = game.vents.indexOf(second);
    expect(second.timer).toBe(25 + index * 17 + 10 * TICK_HZ);
    expect(game.vents.map((v) => [v.x, v.y])).toEqual(plain.vents.map((v) => [v.x, v.y]));
  });

  it("puts the first vent close to the lander when asked", () => {
    const game = generate(variant({ vents: { ...base.vents, near: 8 } }));
    const l = lander(game);
    const [first, ...rest] = game.vents;
    if (!first) throw new Error("no vent");
    const d = distance(first.x, first.y, l.x, l.y);
    expect(d).toBeGreaterThanOrEqual(8);
    expect(d).toBeLessThanOrEqual(10);
    expect(rest).toHaveLength(base.vents.count - 1);
  });

  it("only stores the ground colour for the renderer", () => {
    const game = generate(variant({ ground: "ash" }));
    expect(game.level.ground).toBe("ash");
    expect(game.height).toEqual(generate(base).height);
  });
});
