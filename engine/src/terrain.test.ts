import { describe, expect, it } from "vitest";
import { CAMPAIGN, skirmish } from "./levels.ts";
import { next, int } from "./rng.ts";
import { fingerprint } from "./save.ts";
import { generate } from "./terrain.ts";
import { distance, tileOf, within } from "./hex.ts";
import { KINDS, MAX_HEIGHT, ROCK, find } from "./state.ts";

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
      expect(close).toBeGreaterThanOrEqual(2);
      for (const h of game.height) {
        expect(h).toBeGreaterThanOrEqual(ROCK);
        expect(h).toBeLessThanOrEqual(MAX_HEIGHT);
      }
      for (const vent of game.vents) {
        expect(game.height[vent.y * game.w + vent.x]).not.toBe(ROCK);
        expect(distance(vent.x, vent.y, lander.x, lander.y)).toBeGreaterThanOrEqual(level.size * 0.35);
      }
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
