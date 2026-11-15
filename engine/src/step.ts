// One tick of the simulation.

import { rebuild } from "./grid.ts";
import { stepPackets } from "./packets.ts";
import { flow, stepVents } from "./silt.ts";
import { stepSpitters } from "./spitters.ts";
import { stepWear } from "./structures.ts";
import { projectBaffles, stepWeapons } from "./weapons.ts";
import { FLOW_EVERY, find, type Event, type Game } from "./state.ts";

function judge(game: Game, events: Event[]): void {
  if (!find(game, game.landerId)) {
    game.phase = "lost";
    events.push({ kind: "lost" });
    return;
  }
  const objective = game.level.objective;
  // With no open vent left there is nothing to hold out against, so capping them all wins any mission.
  const capped = game.vents.length > 0 && game.vents.every((v) => v.capped);
  const won = capped || (objective.kind === "survive" && game.tick >= objective.ticks);
  if (won) {
    game.phase = "won";
    events.push({ kind: "won" });
  }
}

/** Advances the game by one tick and returns what happened. Does nothing once the game is over. */
export function step(game: Game): Event[] {
  const events: Event[] = [];
  if (game.phase !== "playing") return events;
  game.tick += 1;
  if (game.gridDirty) rebuild(game);
  stepVents(game, events);
  stepSpitters(game, events);
  if (game.tick % FLOW_EVERY === 0) {
    projectBaffles(game);
    flow(game);
  }
  stepWeapons(game, events);
  stepWear(game, events);
  if (game.gridDirty) rebuild(game);
  stepPackets(game, events);
  judge(game, events);
  return events;
}
