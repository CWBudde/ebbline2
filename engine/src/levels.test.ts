import { describe, expect, it } from "vitest";
import { distance, tileAtPoint, within } from "./hex.ts";
import { CAMPAIGN, introduced, skirmish } from "./levels.ts";
import { floorCanBeGraded, rotateBend } from "./movingFloor.ts";
import { load, save } from "./save.ts";
import { step } from "./step.ts";
import { BUILDABLE, MAX_HEIGHT, ROCK, TICK_HZ, type Game, type LevelDef } from "./state.ts";
import { generate } from "./terrain.ts";
import { lander } from "./testing/fixtures.ts";

describe("introduced", () => {
  it("names what each campaign mission shows for the first time", () => {
    const none = { spitters: false, survive: false };
    expect(CAMPAIGN.map((level) => [level.id, introduced(level.id)])).toEqual([
      ["c1", { structures: ["pylon", "lance", "cap"], ...none }],
      ["c2", { structures: ["tap", "cell"], ...none }],
      ["c3", { structures: ["lobber"], ...none }],
      ["c4", { structures: ["trunk", "booster"], ...none }],
      ["c5", { structures: ["pump"], ...none }],
      ["c6", { structures: ["baffle", "grader"], spitters: false, survive: true }],
      ["c7", { structures: ["interceptor"], spitters: true, survive: false }],
      ["c8", { structures: [], ...none }],
      ["c9", { structures: [], ...none }],
      ["c10", { structures: ["airfield"], ...none }],
      ["c11", { structures: [], ...none }],
      ["c12", { structures: [], ...none }],
    ]);
  });

  it("introduces every buildable structure exactly once over the campaign", () => {
    const all = CAMPAIGN.flatMap((level) => introduced(level.id).structures);
    expect([...all].sort()).toEqual([...BUILDABLE].sort());
  });

  it("introduces nothing outside the campaign", () => {
    const empty = { structures: [], spitters: false, survive: false };
    expect(introduced(skirmish(7, "small", "hard").id)).toEqual(empty);
    expect(introduced("nope")).toEqual(empty);
  });
});

describe("the campaign", () => {
  it("numbers its missions c1 onwards, which saved progress and the translations key on", () => {
    expect(CAMPAIGN.map((level) => level.id)).toEqual(CAMPAIGN.map((_, i) => `c${i + 1}`));
  });

  it("brings spitters and interceptors in together and ends with everything", () => {
    for (const level of CAMPAIGN) {
      expect(level.allowed.includes("interceptor")).toBe(level.spitters.count > 0);
    }
    expect([...(CAMPAIGN.at(-1)?.allowed ?? [])].sort()).toEqual([...BUILDABLE].sort());
    expect(CAMPAIGN.some((level) => level.objective.kind === "survive")).toBe(true);
  });

  // The briefs count these distances in steps, so they must match the generated maps.
  it.each([
    ["c1", 15],
    ["c4", 29],
  ])("puts the nearest vent of %s %i steps from the lander", (id, steps) => {
    const game = generate(CAMPAIGN.find((level) => level.id === id) as LevelDef);
    const l = lander(game);
    expect(Math.min(...game.vents.map((v) => distance(v.x, v.y, l.x, l.y)))).toBe(steps);
  });
});

describe("moving ground", () => {
  const mission = (id: string): LevelDef => CAMPAIGN.find((level) => level.id === id) as LevelDef;
  const advance = (game: Game, seconds: number): void => {
    for (let i = 0; i < seconds * TICK_HZ; i++) step(game);
  };

  it("leaves the ground of other missions alone", () => {
    const game = generate(mission("c9"));
    const initial = game.height.slice();
    advance(game, 9);
    expect(game.height).toEqual(initial);
    expect(Array.from(game.height.keys()).every((i) => floorCanBeGraded(game, i))).toBe(true);
  });

  it("rolls waves out from a rising plateau over the terrain and keeps the steady ring still", () => {
    const level = mission("c11");
    const game = generate(level);
    const home = lander(game);
    const initial = game.height.slice();
    // The waves move over generated terrain, rock and all, not over a flat map.
    expect(initial).toContain(ROCK);
    expect(new Set(initial.filter((h) => h !== ROCK)).size).toBeGreaterThan(5);

    advance(game, 7);
    expect(game.height).toEqual(initial);
    const still = load(save(game));
    still.level = { ...level, movingFloor: false };
    advance(still, 2);
    advance(game, 2);
    expect(game.silt).not.toEqual(still.silt);

    const plateau = game.height[home.y * game.w + home.x];
    expect(plateau).toBe((initial[home.y * game.w + home.x] ?? 0) + 1);
    within(game.w, game.h, home.x, home.y, 4, (i, ring) => {
      expect(game.height[i]).toBe(ring < 4 ? plateau : initial[i]);
      expect(floorCanBeGraded(game, i)).toBe(ring === 4);
    });
    const outside: boolean[] = [];
    within(game.w, game.h, home.x, home.y, 12, (i, ring) => {
      if (ring > 4) outside.push(game.height[i] !== initial[i]);
    });
    expect(outside).toContain(true);
    expect(outside).toContain(false);

    const resumed = load(save(game));
    advance(game, 19);
    advance(resumed, 19);
    expect(resumed.height).toEqual(game.height);
    expect(resumed.silt).toEqual(game.silt);

    // Rock stays, nothing leaves the range of heights, and a whole cycle brings the ground back.
    for (let shift = 0; shift < 6; shift++) {
      advance(game, 8);
      for (const [i, h] of game.height.entries()) {
        if (initial[i] === ROCK) expect(h).toBe(ROCK);
        else expect(h >= 0 && h <= MAX_HEIGHT).toBe(true);
      }
    }
    // Two whole cycles of six eight-second shifts.
    advance(game, 96 - game.tick / TICK_HZ);
    expect(game.height).toEqual(initial);
  });

  it("floods the bend and moves its shoals out of phase without moving the headland or the islands", () => {
    const level = mission("c12");
    const game = generate(level);
    const home = lander(game);
    const initial = game.height.slice();
    expect(home.x).toBeGreaterThan(game.w / 2);
    expect(home.y).toBeLessThan(game.h / 3);
    expect(game.vents.every((v) => v.x > game.w / 2 && v.y >= (2 * game.h) / 3)).toBe(true);
    const islandTops = [
      [0.363, 0.326],
      [0.404, 0.541],
      [0.558, 0.556],
      [0.681, 0.399],
    ].map(([x = 0, y = 0]) => {
      const p = rotateBend({ x: x * game.w, y: y * game.w }, game.w);
      const tile = tileAtPoint(p.x, p.y);
      return tile.y * game.w + tile.x;
    });
    for (const i of islandTops) {
      expect(game.height[i]).toBeGreaterThanOrEqual(7);
      expect(game.silt[i]).toBe(0);
    }
    expect(game.silt.some((depth) => depth > 0)).toBe(true);
    const raised = (): number[] =>
      Array.from(game.height.keys()).filter((i) => (game.height[i] ?? 0) > (initial[i] ?? 0));

    advance(game, 8);
    const firstShoal = raised();
    expect(firstShoal.length).toBeGreaterThan(1);
    const restored = load(save(game));
    const fixed = load(save(game));
    fixed.level = { ...level, landform: "horseshoe" };
    advance(fixed, 8);
    advance(game, 8);
    expect(game.silt).not.toEqual(fixed.silt);
    advance(restored, 8);
    const secondShoal = raised().filter((i) => !firstShoal.includes(i));
    expect(secondShoal.length).toBeGreaterThan(1);
    for (const i of [...firstShoal, ...secondShoal]) expect(floorCanBeGraded(game, i)).toBe(false);
    for (const i of islandTops) {
      expect(game.height[i]).toBe(initial[i]);
      expect(floorCanBeGraded(game, i)).toBe(true);
    }
    expect(restored.height).toEqual(game.height);
    expect(restored.silt).toEqual(game.silt);
    within(game.w, game.h, home.x, home.y, 3, (i) => {
      expect(game.height[i]).toBe(initial[i]);
    });

    advance(game, 32);
    expect(game.height).toEqual(initial);
  });
});
