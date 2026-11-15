import { describe, expect, it } from "vitest";
import { CAMPAIGN, introduced, skirmish } from "./levels.ts";
import { BUILDABLE } from "./state.ts";

describe("introduced", () => {
  it("names what each campaign mission shows for the first time", () => {
    const none = { spitters: false, survive: false };
    expect(CAMPAIGN.map((level) => [level.id, introduced(level.id)])).toEqual([
      ["c1", { structures: ["pylon", "tap", "lance", "cap"], ...none }],
      ["c2", { structures: ["cell", "lobber"], ...none }],
      ["c3", { structures: ["pump"], ...none }],
      ["c4", { structures: ["trunk"], ...none }],
      ["c5", { structures: ["interceptor"], spitters: true, survive: false }],
      ["c6", { structures: ["baffle"], spitters: false, survive: true }],
      ["c7", { structures: ["grader"], ...none }],
      ["c8", { structures: [], ...none }],
      ["c9", { structures: [], ...none }],
      ["c10", { structures: [], ...none }],
      ["c11", { structures: [], ...none }],
      ["c12", { structures: [], ...none }],
      ["c13", { structures: [], ...none }],
      ["c14", { structures: [], ...none }],
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
