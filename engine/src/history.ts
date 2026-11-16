// The course of the game for the statistics screen: a few figures sampled at a steady pace.

import { DRY, TICK_HZ, type Game, type History } from "./state.ts";

/** Ticks between two samples at the start of a game: one a second. */
export const HISTORY_EVERY = TICK_HZ;
/**
 * The most samples kept. When a new sample would exceed it, every second sample is dropped and the interval
 * doubles, so a game of any length keeps a bounded history on an even time axis.
 */
export const HISTORY_MAX = 512;

/** The series of a history, every key whose value is an array of samples. */
export const SERIES = [
  "tick",
  "silt",
  "flooded",
  "energy",
  "capacity",
  "rateIn",
  "rateOut",
  "inLander",
  "inPylon",
  "inTap",
  "inPump",
  "outBuild",
  "outRepair",
  "outSupply",
  "vents",
  "structures",
  "lost",
  "removed",
] as const satisfies readonly (keyof History)[];

export function emptyHistory(): History {
  return {
    every: HISTORY_EVERY,
    tick: [],
    silt: [],
    flooded: [],
    energy: [],
    capacity: [],
    rateIn: [],
    rateOut: [],
    inLander: [],
    inPylon: [],
    inTap: [],
    inPump: [],
    outBuild: [],
    outRepair: [],
    outSupply: [],
    vents: [],
    structures: [],
    lost: [],
    removed: [],
  };
}

/** Two decimals are plenty for a graph and keep the save small. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Drops every second sample, keeping the first, and doubles the interval. */
function thin(history: History): void {
  for (const key of SERIES) history[key] = history[key].filter((_, i) => i % 2 === 0);
  history.every *= 2;
}

/** Records the game as it stands now, thinning the history first if it is full. */
export function sample(game: Game): void {
  const history = game.history;
  if (history.tick.length >= HISTORY_MAX) thin(history);
  let silt = 0;
  let flooded = 0;
  for (const depth of game.silt) {
    silt += depth;
    if (depth >= DRY) flooded += 1;
  }
  let structures = 0;
  for (const s of game.structures) if (s.built) structures += 1;
  history.tick.push(game.tick);
  history.silt.push(round(silt));
  history.flooded.push(flooded);
  history.energy.push(round(game.energy));
  history.capacity.push(game.capacity);
  history.rateIn.push(round(game.rateIn));
  history.rateOut.push(round(game.rateOut));
  const flow = game.flow;
  history.inLander.push(round(flow.rateIn.lander));
  history.inPylon.push(round(flow.rateIn.pylon));
  history.inTap.push(round(flow.rateIn.tap));
  history.inPump.push(round(flow.rateIn.pump));
  history.outBuild.push(round(flow.rateOut.build));
  history.outRepair.push(round(flow.rateOut.repair));
  history.outSupply.push(round(flow.rateOut.supply));
  history.vents.push(game.vents.filter((v) => !v.capped).length);
  history.structures.push(structures);
  history.lost.push(game.stats.lost);
  history.removed.push(round(game.stats.removed));
}

/** The last step of a tick: a sample on every `every`-th tick, and one on the tick the game ends. */
export function stepHistory(game: Game): void {
  if (game.tick % game.history.every === 0 || game.phase !== "playing") sample(game);
}
