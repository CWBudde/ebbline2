import { describe, expect, it } from "vitest";
import { LINK_RANGE, TRUNK_RANGE, neighbour } from "@ebbline2/engine";
import { dragPlaces, spacing } from "./place.ts";

describe("drag placement", () => {
  it("spaces connectors so that a dragged row still links up", () => {
    expect(spacing("pylon")).toBeLessThanOrEqual(LINK_RANGE);
    expect(spacing("trunk")).toBeLessThanOrEqual(TRUNK_RANGE);
  });

  it("places at the start, then only after the spacing", () => {
    expect(dragPlaces("pylon", undefined, 3, 3)).toBe(true);
    expect(dragPlaces("pylon", { x: 3, y: 3 }, 6, 3)).toBe(false);
    expect(dragPlaces("pylon", { x: 3, y: 3 }, 8, 3)).toBe(true);
    expect(dragPlaces("lance", { x: 3, y: 3 }, 3, 3)).toBe(false);
    expect(dragPlaces("lance", { x: 3, y: 3 }, 4, 3)).toBe(true);
  });

  it("counts steps along a slanted row, not straight-line distance", () => {
    // Five steps south-east from an odd row and from an even one.
    for (const start of [{ x: 3, y: 3 }, { x: 3, y: 4 }]) {
      let at = start;
      for (let n = 0; n < 4; n++) at = neighbour(at.x, at.y, 1);
      expect(dragPlaces("pylon", start, at.x, at.y)).toBe(false);
      at = neighbour(at.x, at.y, 1);
      expect(dragPlaces("pylon", start, at.x, at.y)).toBe(true);
    }
    // Each row down is one step, although rows lie closer together than touching tiles.
    expect(dragPlaces("pylon", { x: 3, y: 3 }, 3, 7)).toBe(false);
    expect(dragPlaces("pylon", { x: 3, y: 3 }, 3, 8)).toBe(true);
  });
});
