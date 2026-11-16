import { describe, expect, it } from "vitest";
import { distance } from "./hex.ts";
import { CAMPAIGN, introduced, skirmish } from "./levels.ts";
import { BUILDABLE, type LevelDef } from "./state.ts";
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
      ["c10", { structures: [], ...none }],
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
