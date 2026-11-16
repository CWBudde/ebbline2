import { describe, expect, it } from "vitest";
import {
  areaPath,
  axisTicks,
  bandPath,
  decimals,
  linePath,
  linear,
  mean,
  niceStep,
  peak,
  perSecond,
  shares,
  smooth,
  stack,
  stepPath,
  timeTicks,
} from "./chart.ts";

describe("axis ticks", () => {
  it("picks round steps", () => {
    expect(niceStep(100, 4)).toBe(25);
    expect(niceStep(90, 4)).toBe(25);
    expect(niceStep(7, 4)).toBe(2);
    expect(niceStep(1.3, 4)).toBe(0.5);
    expect(niceStep(1200, 4)).toBe(500);
  });

  it("keeps whole-number axes whole", () => {
    expect(niceStep(3, 4, true)).toBe(1);
    expect(niceStep(9, 4, true)).toBe(5);
    expect(niceStep(90, 4, true)).toBe(25);
    expect(axisTicks(3, 4, true).values).toEqual([0, 1, 2, 3]);
    expect(axisTicks(0.5, 4, true).values).toEqual([0, 1]);
  });

  it("runs from 0 to at least the largest value", () => {
    const ticks = axisTicks(87);
    expect(ticks.values[0]).toBe(0);
    expect(ticks.max).toBeGreaterThanOrEqual(87);
    expect(ticks.values.at(-1)).toBe(ticks.max);
    expect(ticks.values.length).toBeLessThanOrEqual(6);
    expect(axisTicks(1.2).values).toEqual([0, 0.5, 1, 1.5]);
  });

  it("gives an empty or broken series an axis anyway", () => {
    for (const max of [0, -3, NaN, Infinity]) {
      const ticks = axisTicks(max);
      expect(ticks.values).toEqual([0, 0.25, 0.5, 0.75, 1]);
      expect(ticks.max).toBe(1);
    }
  });

  it("counts the decimals a step needs", () => {
    expect(decimals(5)).toBe(0);
    expect(decimals(0.5)).toBe(1);
    expect(decimals(0.25)).toBe(2);
    expect(decimals(250)).toBe(0);
  });
});

describe("time ticks", () => {
  it("steps in round seconds and minutes", () => {
    expect(timeTicks(0, 5)).toEqual([0]);
    expect(timeTicks(4, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(timeTicks(45, 5)).toEqual([0, 10, 20, 30, 40]);
    expect(timeTicks(400, 5)).toEqual([0, 120, 240, 360]);
    expect(timeTicks(3600, 6)).toEqual([0, 600, 1200, 1800, 2400, 3000, 3600]);
  });
});

describe("paths", () => {
  const x = linear(0, 10, 0, 100);
  const y = linear(0, 5, 50, 0);

  it("draws a polyline through the samples", () => {
    expect(linePath([0, 5, 10], [0, 5, 2.5], x, y)).toBe("M0.0 50.0L50.0 0.0L100.0 25.0");
  });

  it("draws a step line", () => {
    expect(stepPath([0, 5, 10], [1, 2, 2], x, y)).toBe("M0.0 40.0H50.0V30.0H100.0V30.0");
  });

  it("closes an area down to the baseline", () => {
    expect(areaPath([0, 10], [5, 5], x, y, 50)).toBe("M0.0 0.0L100.0 0.0L100.0 50.0L0.0 50.0Z");
  });

  it("draws nothing for no samples and no NaN for one", () => {
    expect(linePath([], [], x, y)).toBe("");
    expect(stepPath([], [], x, y)).toBe("");
    expect(areaPath([], [], x, y, 50)).toBe("");
    // One sample: the domain has no width, and the path must still be finite.
    const flat = linear(0, 0, 0, 100);
    const one = linePath([0], [3], flat, linear(3, 3, 50, 0));
    expect(one).toBe("M0.0 50.0");
    expect(areaPath([0], [3], flat, y, 50)).toBe("");
  });

  it("skips points that are not finite", () => {
    expect(linePath([0, 5, 10], [0, NaN, 5], x, y)).toBe("M0.0 50.0L100.0 0.0");
    expect(linePath([0, 5], [1], x, y)).not.toContain("NaN");
  });
});

describe("series helpers", () => {
  it("turns a running total into a rate per second", () => {
    expect(perSecond([0, 30, 60, 120], [0, 3, 3, 9], 30)).toEqual([0, 3, 0, 3]);
    expect(perSecond([], [], 30)).toEqual([]);
  });

  it("finds the first peak", () => {
    expect(peak([1, 4, 2, 4])).toEqual({ value: 4, index: 1 });
    expect(peak([])).toEqual({ value: 0, index: -1 });
  });

  it("averages", () => {
    expect(mean([1, 2, 3])).toBe(2);
    expect(mean([])).toBe(0);
  });
});

describe("smoothing", () => {
  it("averages over a window centred on each sample", () => {
    expect(smooth([0, 3, 0, 3, 0], 3)).toEqual([1.5, 1, 2, 1, 1.5]);
    expect(smooth([1, 2, 3], 1)).toEqual([1, 2, 3]);
    expect(smooth([], 5)).toEqual([]);
    expect(smooth([2, NaN, 4], 3)).toEqual([2, 3, 4]);
  });
});

describe("stacking", () => {
  it("sums the series from the bottom up, ignoring what is not a positive number", () => {
    expect(stack([[1, 2], [3, NaN], [-1, 4]])).toEqual([[1, 2], [4, 2], [4, 6]]);
    expect(stack([])).toEqual([]);
  });

  it("closes a band between two edges", () => {
    const x = linear(0, 10, 0, 100);
    const y = linear(0, 10, 100, 0);
    expect(bandPath([0, 10], [0, 0], [5, 10], x, y)).toBe("M0.0 50.0L100.0 0.0L100.0 100.0L0.0 100.0Z");
    expect(bandPath([0], [0], [5], x, y)).toBe("");
  });

  it("gives each part its share", () => {
    expect(shares([1, 3])).toEqual([0.25, 0.75]);
    expect(shares([0, 0])).toEqual([0, 0]);
  });
});
