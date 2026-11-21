import { describe, expect, it } from "vitest";
import { CAMPAIGN, skirmish } from "@ebbline2/engine";
import { briefingPlan } from "./briefing.ts";

describe("briefingPlan", () => {
  it("lists the new subjects of each mission, a threat or objective first", () => {
    expect(CAMPAIGN.map((level) => briefingPlan(level.id)?.subjects)).toEqual([
      ["pylon", "lance", "cap"],
      ["tap", "cell"],
      ["lobber"],
      ["trunk", "booster"],
      ["pump"],
      ["survive", "baffle", "grader"],
      ["spitter", "interceptor"],
      [],
      // c9
      [],
      // c10
      ["airfield"],
      // c11
      [],
      // c12
      [],
      // c13
      [],
    ]);
  });

  it("numbers the mission and states its goal", () => {
    expect(briefingPlan("c1")).toMatchObject({ number: 1, total: 13, goal: { kind: "cap", vents: 1 } });
    expect(briefingPlan("c2")).toMatchObject({ number: 2, goal: { kind: "cap", vents: 2 } });
    expect(briefingPlan("c6")).toMatchObject({ number: 6, goal: { kind: "survive", minutes: 10 } });
  });

  it("has nothing for a skirmish", () => {
    expect(briefingPlan(skirmish(1, "small", "easy").id)).toBeUndefined();
  });
});
