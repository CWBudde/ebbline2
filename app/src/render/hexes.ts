// Hexagon shapes in world pixels for the map renderer: single tiles, and the outlines of sets of tiles.

import { CORNERS, DIRECTIONS, distance, neighbour, within } from "@ebbline2/engine";
import { TILE, tileToWorld } from "../camera.ts";

/** The corners of a tile's hexagon in world pixels, as a flat list for Graphics.poly; `scale` shrinks it about its centre. */
export function hexPoints(x: number, y: number, scale = 1): number[] {
  const c = tileToWorld(x, y);
  const points: number[] = [];
  for (const k of CORNERS) points.push(c.x + k.x * TILE * scale, c.y + k.y * TILE * scale);
  return points;
}

/**
 * The boundary of a set of tiles as closed polygons in world pixels (flat lists for Graphics.poly). Each side of a
 * member that faces a non-member is part of it; the sides run clockwise around their own tile, so they chain end to
 * start. `inSet` must be false off the map.
 */
export function outline(
  members: Iterable<{ x: number; y: number }>,
  inSet: (x: number, y: number) => boolean,
): number[][] {
  // A hexagon corner is shared by three tiles, so a boundary corner has exactly one side leaving it.
  const next = new Map<string, { x: number; y: number; key: string }>();
  const key = (px: number, py: number): string => `${String(Math.round(px * 8))},${String(Math.round(py * 8))}`;
  for (const t of members) {
    const c = tileToWorld(t.x, t.y);
    for (let d = 0; d < DIRECTIONS; d++) {
      const n = neighbour(t.x, t.y, d);
      if (inSet(n.x, n.y)) continue;
      const a = CORNERS[d];
      const b = CORNERS[(d + 1) % DIRECTIONS];
      if (!a || !b) continue;
      const bx = c.x + b.x * TILE;
      const by = c.y + b.y * TILE;
      next.set(key(c.x + a.x * TILE, c.y + a.y * TILE), { x: bx, y: by, key: key(bx, by) });
    }
  }
  const loops: number[][] = [];
  for (const start of [...next.keys()]) {
    let side = next.get(start);
    if (!side) continue;
    const loop: number[] = [];
    let at = start;
    while (side) {
      next.delete(at);
      loop.push(side.x, side.y);
      at = side.key;
      side = next.get(at);
    }
    if (loop.length >= 6) loops.push(loop);
  }
  return loops;
}

const areas = new Map<string, number[][]>();

/** The outline of every map tile within `radius` steps of (cx, cy); cached, as previews redraw it every frame. */
export function areaOutline(w: number, h: number, cx: number, cy: number, radius: number): number[][] {
  const id = `${String(w)}:${String(h)}:${String(cx)}:${String(cy)}:${String(radius)}`;
  const cached = areas.get(id);
  if (cached) return cached;
  const members: { x: number; y: number }[] = [];
  within(w, h, cx, cy, radius, (_i, _d, x, y) => members.push({ x, y }));
  const reach = Math.floor(radius);
  const loops = outline(
    members,
    (x, y) => x >= 0 && y >= 0 && x < w && y < h && distance(cx, cy, x, y) <= reach,
  );
  if (areas.size > 64) areas.clear();
  areas.set(id, loops);
  return loops;
}
