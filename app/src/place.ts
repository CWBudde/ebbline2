// Rules for placing a row of structures by dragging.

import type { Kind } from "@ebbline2/engine";

/** How far apart a drag spaces structures of a kind, in tiles. */
export function spacing(kind: Kind): number {
  if (kind === "pylon") return 5;
  if (kind === "trunk") return 13;
  return 1;
}

/** Whether a drag that last placed at `last` should place again at (x, y). */
export function dragPlaces(
  kind: Kind,
  last: { x: number; y: number } | undefined,
  x: number,
  y: number,
): boolean {
  return !last || Math.hypot(x - last.x, y - last.y) >= spacing(kind);
}
