// The tiles the finished power grid reaches: where a structure can stand and be supplied now.

import { LINK_RANGE, within, type Game } from "@ebbline2/engine";

/** A key that changes whenever the built structures of the grid do. */
export function coverageKey(game: Game): string {
  let key = "";
  for (const s of game.structures) {
    if (s.built) key += `${String(s.id)}:${String(s.x)},${String(s.y)};`;
  }
  return key;
}

/** One byte per tile: 1 where a built structure is within link range. */
export function gridCoverage(game: Game): Uint8Array {
  const covered = new Uint8Array(game.w * game.h);
  for (const s of game.structures) {
    if (!s.built) continue;
    // The same measure the engine links by: steps between the centre tiles.
    within(game.w, game.h, s.x, s.y, LINK_RANGE, (i) => {
      covered[i] = 1;
    });
  }
  return covered;
}
