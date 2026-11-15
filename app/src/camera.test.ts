import { describe, expect, it } from "vitest";
import { MAX_ZOOM, MIN_ZOOM, TILE, centreOn, clamp, tileAt, toScreen, toWorld, zoomAt } from "./camera.ts";

describe("camera", () => {
  it("maps between screen and world both ways", () => {
    const view = { x: 100, y: 50, zoom: 2 };
    const w = toWorld(view, 40, 60);
    expect(w).toEqual({ x: 120, y: 80 });
    expect(toScreen(view, w.x, w.y)).toEqual({ x: 40, y: 60 });
    expect(tileAt(view, 40, 60)).toEqual({ x: Math.floor(120 / TILE), y: Math.floor(80 / TILE) });
  });

  it("zooms around the pointer and respects the limits", () => {
    const view = { x: 0, y: 0, zoom: 1 };
    const before = toWorld(view, 300, 200);
    zoomAt(view, 300, 200, 1.5);
    expect(view.zoom).toBe(1.5);
    const after = toWorld(view, 300, 200);
    expect(after.x).toBeCloseTo(before.x, 9);
    expect(after.y).toBeCloseTo(before.y, 9);
    zoomAt(view, 0, 0, 100);
    expect(view.zoom).toBe(MAX_ZOOM);
    zoomAt(view, 0, 0, 0.0001);
    expect(view.zoom).toBe(MIN_ZOOM);
  });

  it("keeps the screen centre over the map", () => {
    const view = { x: -5000, y: 9000, zoom: 1 };
    clamp(view, { w: 1000, h: 1000 }, { w: 800, h: 600 });
    expect(toWorld(view, 400, 300)).toEqual({ x: 0, y: 1000 });
  });

  it("centres on a point", () => {
    const view = { x: 0, y: 0, zoom: 2 };
    centreOn(view, { w: 800, h: 600 }, 500, 500);
    expect(toWorld(view, 400, 300)).toEqual({ x: 500, y: 500 });
  });
});
