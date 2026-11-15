// How threatened the player is, 0..1, for the music. Pure, so it is unit tested.

import { distance, find, type Game } from "@ebbline2/engine";

/** Silt shallower than this doesn't count. */
const WET = 0.1;
/** Silt within this many steps of the lander starts to raise the tension. */
const NEAR = 14;

/** Combines how much of the map is covered with how close the silt is to the lander. */
export function siltTension(game: Game): number {
  if (game.phase !== "playing") return 0;
  const lander = find(game, game.landerId);
  let wet = 0;
  let nearest = Infinity;
  for (let y = 0; y < game.h; y++) {
    for (let x = 0; x < game.w; x++) {
      if ((game.silt[y * game.w + x] ?? 0) < WET) continue;
      wet++;
      if (lander) {
        const d = distance(x, y, lander.x, lander.y);
        if (d < nearest) nearest = d;
      }
    }
  }
  const coverage = Math.min(1, (wet / Math.max(1, game.w * game.h)) * 2.5);
  const proximity = nearest < NEAR ? 1 - nearest / NEAR : 0;
  return Math.min(1, Math.max(coverage, proximity * 0.95));
}
