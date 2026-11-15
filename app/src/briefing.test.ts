import { describe, expect, it } from "vitest";
import { CAMPAIGN, skirmish } from "@ebbline2/engine";
import { briefingPlan } from "./briefing.ts";

describe("briefingPlan", () => {
  it("lists the new subjects of each mission, a threat or objective first", () => {
    expect(CAMPAIGN.map((level) => briefingPlan(level.id)?.subjects)).toEqual([
      ["pylon", "tap", "lance", "cap"],
      ["cell", "lobber"],
      ["pump"],
      ["trunk"],
      ["spitter", "interceptor"],
      ["survive", "baffle"],
      ["grader"],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ]);
  });

  it("numbers the mission and states its goal", () => {
    expect(briefingPlan("c1")).toMatchObject({ number: 1, total: 14, goal: { kind: "cap", vents: 2 } });
    expect(briefingPlan("c2")).toMatchObject({ number: 2, goal: { kind: "cap", vents: 3 } });
    expect(briefingPlan("c6")).toMatchObject({ number: 6, goal: { kind: "survive", minutes: 10 } });
  });

  it("has nothing for a skirmish", () => {
    expect(briefingPlan(skirmish(1, "small", "easy").id)).toBeUndefined();
  });
});
