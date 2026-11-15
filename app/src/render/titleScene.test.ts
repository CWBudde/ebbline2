import { describe, expect, it } from "vitest";
import { ART_H, ART_W, LIGHTS, canvasScale, lightLevel } from "./titleScene.ts";

describe("canvasScale", () => {
  it("covers the box at the device's resolution", () => {
    expect(canvasScale(960, 400, 1)).toBeCloseTo(0.5);
    expect(canvasScale(480, 540, 1)).toBeCloseTo(0.5);
  });

  it("never draws above the art's own size", () => {
    expect(canvasScale(ART_W, ART_H, 2)).toBe(1);
    expect(canvasScale(3840, 2160, 1)).toBe(1);
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
