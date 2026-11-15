// Small hand-made games for rule tests.

import { step } from "../step.ts";
import { complete, place } from "../structures.ts";
import { generate } from "../terrain.ts";
import {
  BUILDABLE,
  KINDS,
  find,
  type Event,
  type Game,
  type Kind,
  type Structure,
} from "../state.ts";

/** A flat, empty map with only the lander on it. Without vents it never ends by itself. */
export function flat(size = 24, ground = 5): Game {
  const game = generate({
    id: "test",
    name: "Test",
    brief: "",
    seed: 7,
    size,
    vents: { count: 0, period: 60, amount: 1, ramp: 0 },
    spitters: { count: 0, period: 0, amount: 0 },
    lodes: 0,
    allowed: BUILDABLE,
    objective: { kind: "cap" },
    hints: [],
  });
  game.height.fill(ground);
  // The lander always stands at 12,12, so tests can use fixed coordinates.
  const base = lander(game);
  base.x = 12;
  base.y = 12;
  game.occ.fill(0);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) game.occ[(12 + dy) * size + 12 + dx] = base.id;
  }
  return game;
}

export function lander(game: Game): Structure {
  const s = find(game, game.landerId);
  if (!s) throw new Error("no lander");
  return s;
}

/** Places a structure and finishes it at once, without packets. */
export function build(game: Game, kind: Kind, x: number, y: number): Structure {
  const events: Event[] = [];
  const s = place(game, kind, x, y, events);
  if (!s) throw new Error(`cannot place ${kind} at ${x},${y}`);
  s.health = KINDS[kind].cost;
  s.energy = KINDS[kind].store;
  complete(game, s, events);
  return s;
}

export function addVent(game: Game, x: number, y: number, amount = 2): void {
  game.vents.push({
    x,
    y,
    period: 30,
    amount,
    ramp: 0,
    timer: 30,
    capped: false,
    pressure: 0,
  });
}

export function run(game: Game, ticks: number): Event[] {
  const events: Event[] = [];
  for (let n = 0; n < ticks; n++) events.push(...step(game));
  return events;
}

export function depth(game: Game, x: number, y: number): number {
  return game.silt[y * game.w + x] ?? 0;
}

export function pour(game: Game, x: number, y: number, amount: number): void {
  game.silt[y * game.w + x] = amount;
}
