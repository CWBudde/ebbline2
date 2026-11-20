// Everything the player can do, as data. Applying the same commands at the same ticks replays a game.

import { floorCanBeGraded } from "./movingFloor.ts";
import { updateHarvest } from "./harvest.ts";
import { dismantle, place } from "./structures.ts";
import {
  MAX_HEIGHT,
  ROCK,
  find,
  type Event,
  type Game,
  type Kind,
} from "./state.ts";

export type Command =
  | { kind: "place"; structure: Kind; x: number; y: number }
  | { kind: "dismantle"; id: number }
  | { kind: "toggle"; id: number }
  /** Sets the grader target for tiles; a height of -1 clears it. */
  | { kind: "mark"; tiles: number[]; height: number };

export function apply(game: Game, command: Command): Event[] {
  const events: Event[] = [];
  if (game.phase !== "playing") return events;
  switch (command.kind) {
    case "place":
      place(game, command.structure, command.x, command.y, events);
      break;
    case "dismantle":
      dismantle(game, command.id, events);
      break;
    case "toggle": {
      const s = find(game, command.id);
      if (s && s.kind !== "lander") s.active = !s.active;
      // A switched-off pylon gives up its harvest.
      if (s?.kind === "pylon") updateHarvest(game);
      // Routes prefer working boosters, so switching one changes them.
      if (s?.kind === "booster") game.gridDirty = true;
      break;
    }
    case "mark": {
      const height = Math.max(-1, Math.min(MAX_HEIGHT, Math.round(command.height)));
      for (const i of command.tiles) {
        const ground = game.height[i];
        if (ground === undefined || ground === ROCK || !floorCanBeGraded(game, i)) continue;
        game.mark[i] = ground === height ? -1 : height;
      }
      break;
    }
  }
  return events;
}
