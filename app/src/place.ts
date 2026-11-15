// Rules for placing a row of structures by dragging.

import { distance, type Kind } from "@ebbline2/engine";

/** How far apart a drag spaces structures of a kind, in steps. */
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
  return !last || distance(last.x, last.y, x, y) >= spacing(kind);
}
