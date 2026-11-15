import { describe, expect, it } from "vitest";
import { CORNER, CORNERS, ROW, centre, extent } from "@ebbline2/engine";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  ORIGIN,
  TILE,
  centreOn,
  clamp,
  pointToWorld,
  tileAt,
  tileToWorld,
  toScreen,
  toWorld,
  worldSize,
  worldToTile,
  zoomAt,
} from "./camera.ts";

/** A point given in tile units, in world pixels. */
const world = (px: number, py: number): { x: number; y: number } => pointToWorld(px, py);

describe("camera", () => {
  it("maps between screen and world both ways", () => {
    const view = { x: 100, y: 50, zoom: 2 };
    const w = toWorld(view, 40, 60);
    expect(w).toEqual({ x: 120, y: 80 });
    expect(toScreen(view, w.x, w.y)).toEqual({ x: 40, y: 60 });
    expect(tileAt(view, 40, 60)).toEqual(worldToTile(120, 80));
  });

  it("puts tile (0, 0) wholly on the map and odd rows half a tile to the right", () => {
    expect(tileToWorld(0, 0)).toEqual({ x: TILE / 2, y: CORNER * TILE });
    for (const c of CORNERS) {
      const p = world(c.x, c.y);
      expect(p.x).toBeGreaterThanOrEqual(-1e-9);
      expect(p.y).toBeGreaterThanOrEqual(-1e-9);
    }
    const a = tileToWorld(3, 4);
    const b = tileToWorld(3, 5);
    expect(b.x - a.x).toBeCloseTo(TILE / 2, 9);
    expect(b.y - a.y).toBeCloseTo(ROW * TILE, 9);
    expect(tileToWorld(4, 4).x - a.x).toBeCloseTo(TILE, 9);
  });

  it("finds every tile at its own centre", () => {
    for (let y = -1; y < 7; y++) {
      for (let x = -1; x < 7; x++) {
        const p = tileToWorld(x, y);
        expect(worldToTile(p.x, p.y)).toEqual({ x, y });
      }
    }
  });

  it("tells tiles apart just inside and just outside each corner", () => {
    for (const [x, y] of [[5, 6], [5, 7]] as const) {
      const c = centre(x, y);
      for (const k of CORNERS) {
        const inside = world(c.x + k.x * 0.97, c.y + k.y * 0.97);
        const outside = world(c.x + k.x * 1.03, c.y + k.y * 1.03);
        expect(worldToTile(inside.x, inside.y)).toEqual({ x, y });
        expect(worldToTile(outside.x, outside.y)).not.toEqual({ x, y });
      }
    }
  });

  it("follows the row shift across the side between two rows", () => {
    // The side between tiles (0, 0) and (1, 0) is upright at x = 0.5 and ends at y = ±CORNER / 2;
    // below that end lies tile (0, 1), whose centre is shifted half a tile right, to x = 0.5.
    const left = world(0.49, 0.2);
    const right = world(0.51, 0.2);
    const below = world(0.5, CORNER / 2 + 0.05);
    expect(worldToTile(left.x, left.y)).toEqual({ x: 0, y: 0 });
    expect(worldToTile(right.x, right.y)).toEqual({ x: 1, y: 0 });
    expect(worldToTile(below.x, below.y)).toEqual({ x: 0, y: 1 });
    // Tile (0, 1) starts at x = 0; left of it there is no tile on the map.
    const inside = world(0.05, ROW);
    expect(worldToTile(inside.x, inside.y)).toEqual({ x: 0, y: 1 });
    const off = world(-0.05, ROW);
    expect(worldToTile(off.x, off.y)).toEqual({ x: -1, y: 1 });
  });

  it("measures the world from the map's extent", () => {
    const e = extent(48, 48);
    expect(worldSize(48, 48)).toEqual({ w: e.width * TILE, h: e.height * TILE });
    // The far corner tile's hexagon ends exactly at the world's edge.
    const last = centre(47, 47);
    expect((last.x + 0.5 + ORIGIN.x) * TILE).toBeCloseTo(e.width * TILE, 9);
    expect((last.y + CORNER + ORIGIN.y) * TILE).toBeCloseTo(e.height * TILE, 9);
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
