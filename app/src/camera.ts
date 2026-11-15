// The view onto the map: screen = (world - view) * zoom.

/** World pixels per tile. */
export const TILE = 24;
export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 3;

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

export function toWorld(view: View, sx: number, sy: number): { x: number; y: number } {
  return { x: view.x + sx / view.zoom, y: view.y + sy / view.zoom };
}

export function toScreen(view: View, wx: number, wy: number): { x: number; y: number } {
  return { x: (wx - view.x) * view.zoom, y: (wy - view.y) * view.zoom };
}

/** The tile under a screen position; it may lie outside the map. */
export function tileAt(view: View, sx: number, sy: number): { x: number; y: number } {
  const p = toWorld(view, sx, sy);
  return { x: Math.floor(p.x / TILE), y: Math.floor(p.y / TILE) };
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
