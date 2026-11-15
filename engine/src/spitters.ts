// Spitters lob globs of silt at the densest part of the player's grid.

import { distance, span, within } from "./hex.ts";
import { ROCK, type Event, type Game, type Structure } from "./state.ts";

/**
 * A glob splashes onto every tile within `radius` steps and shares its amount between them, so the volume it
 * lands does not depend on the radius.
 */
export const GLOB = { hp: 3, ticksPerTile: 5, warning: 60, radius: 1 } as const;
/** Structures within this many steps of each other count as one cluster. */
const CLUSTER = 5;

/** The structure with the most neighbours; the first such one on a tie. */
export function densest(game: Game): Structure | undefined {
  let best: Structure | undefined;
  let bestCount = -1;
  for (const s of game.structures) {
    let count = 0;
    for (const o of game.structures) {
      if (distance(s.x, s.y, o.x, o.y) <= CLUSTER) count += 1;
    }
    if (count > bestCount) {
      best = s;
      bestCount = count;
    }
  }
  return best;
}

export function stepSpitters(game: Game, events: Event[]): void {
  for (const spitter of game.spitters) {
    spitter.timer -= 1;
    if (spitter.timer > 0) continue;
    spitter.timer = spitter.period;
    const target = densest(game);
    if (!target) continue;
    // Globs fly in a straight line, so the flight time follows the distance between the centres.
    const flight = span(spitter.x, spitter.y, target.x, target.y);
    game.globs.push({
      id: game.nextId++,
      sx: spitter.x,
      sy: spitter.y,
      tx: target.x,
      ty: target.y,
      t: 0,
      duration: Math.round(flight * GLOB.ticksPerTile) + GLOB.warning,
      amount: spitter.amount,
      hp: GLOB.hp,
    });
    events.push({
      kind: "spit",
      x: spitter.x,
      y: spitter.y,
      tx: target.x,
      ty: target.y,
    });
  }
  const kept = [];
  for (const glob of game.globs) {
    glob.t += 1;
    if (glob.t < glob.duration) {
      kept.push(glob);
      continue;
    }
    const tiles: number[] = [];
    within(game.w, game.h, glob.tx, glob.ty, GLOB.radius, (i) => {
      if (game.height[i] !== ROCK) tiles.push(i);
    });
    for (const i of tiles) {
      game.silt[i] = (game.silt[i] ?? 0) + glob.amount / tiles.length;
    }
    events.push({ kind: "splash", x: glob.tx, y: glob.ty });
  }
  game.globs = kept;
}
