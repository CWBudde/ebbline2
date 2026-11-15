// The view onto the map: screen = (world - view) * zoom. World pixels are tile units (see the engine's
// hex.ts) scaled by TILE and shifted by ORIGIN, so that the whole map lies at non-negative positions.

import { CORNER, centre, extent, tileAtPoint, type Point, type Tile } from "@ebbline2/engine";

/** World pixels between the centres of two touching tiles. */
export const TILE = 24;
export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 3;

/**
 * Where the centre of tile (0, 0) sits in the world, in tile units: half a tile in and one corner down, so that
 * its hexagon touches the top and left edges of the world instead of hanging off them.
 */
export const ORIGIN: Readonly<Point> = { x: 0.5, y: CORNER };

export interface View {
  /** World position of the screen's top-left corner. */
  x: number;
  y: number;
  zoom: number;
}

export interface Size {
  w: number;
  h: number;
}

/** A position in tile units (as the engine's centre() and globAt() give them) in world pixels. */
export function pointToWorld(px: number, py: number): Point {
  return { x: (px + ORIGIN.x) * TILE, y: (py + ORIGIN.y) * TILE };
}

/** The centre of a tile in world pixels. */
export function tileToWorld(x: number, y: number): Point {
  const c = centre(x, y);
  return pointToWorld(c.x, c.y);
}

/** The tile whose hexagon holds a world point; it may lie outside the map. */
export function worldToTile(wx: number, wy: number): Tile {
  return tileAtPoint(wx / TILE - ORIGIN.x, wy / TILE - ORIGIN.y);
}

/** The world size of a w × h map in pixels, edge to edge. */
export function worldSize(w: number, h: number): Size {
  const e = extent(w, h);
  return { w: e.width * TILE, h: e.height * TILE };
}

export function toWorld(view: View, sx: number, sy: number): { x: number; y: number } {
  return { x: view.x + sx / view.zoom, y: view.y + sy / view.zoom };
}

export function toScreen(view: View, wx: number, wy: number): { x: number; y: number } {
  return { x: (wx - view.x) * view.zoom, y: (wy - view.y) * view.zoom };
}

/** The tile under a screen position; it may lie outside the map. */
export function tileAt(view: View, sx: number, sy: number): Tile {
  const p = toWorld(view, sx, sy);
  return worldToTile(p.x, p.y);
}

/** Zooms by a factor while the world point under (sx, sy) stays put. */
export function zoomAt(view: View, sx: number, sy: number, factor: number): void {
  const anchor = toWorld(view, sx, sy);
  view.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom * factor));
  view.x = anchor.x - sx / view.zoom;
  view.y = anchor.y - sy / view.zoom;
}

/** Keeps the middle of the screen over the map. */
export function clamp(view: View, world: Size, screen: Size): void {
  const halfW = screen.w / view.zoom / 2;
  const halfH = screen.h / view.zoom / 2;
  view.x = Math.min(world.w - halfW, Math.max(-halfW, view.x));
  view.y = Math.min(world.h - halfH, Math.max(-halfH, view.y));
}

/** Centres the view on a world point. */
export function centreOn(view: View, screen: Size, wx: number, wy: number): void {
  view.x = wx - screen.w / view.zoom / 2;
  view.y = wy - screen.h / view.zoom / 2;
}
