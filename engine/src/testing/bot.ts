// A scripted player. Balance tests use it to show that every mission can be won, and the levels are tuned so
// that it only just wins them: it plays like a careful, competent human.
//
// What it does, in order of urgency: give up cut-off structures, taps drowned too deep to pay for their mending,
// pylons standing in silt that no packets pass through (mending them costs more than they gather) and lances and
// lobbers left idle far from the lander once the silt round them is gone and no open vent is near, cap vents as
// soon as they can take a cap, shoot down globs and guard the lander, mark the lowest gap in a rim that holds
// standing silt off the lander once the silt nears its top and raise it with graders, which it gives up when the
// work is done, put pumps by standing silt where the map starts with a sea or a long flood, tap lodes, put pylons on
// flats for their harvest, set springs where their balm runs down into standing silt, no more than the income keeps
// pouring and only while a spring does more per energy than a lobber, lay down an airfield on dry ground by the
// lander once the bank is full and the most silt on the map lies beyond its lances and lobbers, flying it only on
// what the bank holds beyond the push's needs, then push toward the nearest open vent: the pylon that brings the cap
// into reach goes down as soon as a dry tile for it joins the grid, lances stand on high ground that overlooks silt
// they can aim at, lobbers back them on deep pools and take over where the silt stands higher than the lances can
// aim, and far out along a long line boosters take the place of pylons that would gather little. With nothing left
// to push and a well-filled bank, it puts down pylons that claim fewer tiles anywhere on the grid.
//
// It waits for what it placed to be finished before it starts something new, except when the bank is nearly full:
// then the packets are already on their way, and waiting out their long trip to a far front only lets income run
// over a full bank.
//
// It never builds trunks or baffles. Trunks reach a far vent sooner but give up the harvest of the pylons they
// replace, which cost it more missions than it won; a baffle's drain buys less than lances burning the same energy.
//
// When it only has to hold out, it digs in instead: graders raise a ring of ground round the lander to the top
// height, lances and lobbers stand inside it or on its crest, and pumps on the crest skim the silt that rises
// against it for energy.

import { apply, type Command } from "../commands.ts";
import { step } from "../step.ts";
import { TICK_HZ, type Game } from "../state.ts";
import { PHASES } from "./bot/phases.ts";
import { view } from "./bot/view.ts";

/** Decides the bot's next move; at most one command per call. */
export function think(game: Game): Command[] {
  const v = view(game);
  for (const phase of PHASES) {
    const move = phase(v);
    if (move !== undefined) return move;
  }
  return [];
}

export interface Outcome {
  phase: Game["phase"];
  seconds: number;
  structures: number;
}

/** Plays a game with the bot, or with nobody at all, until it ends or time runs out. */
export function play(game: Game, maxSeconds: number, bot = true): Outcome {
  const limit = maxSeconds * TICK_HZ;
  while (game.phase === "playing" && game.tick < limit) {
    if (bot && game.tick % 15 === 0) {
      for (const command of think(game)) apply(game, command);
    }
    step(game);
  }
  return {
    phase: game.phase,
    seconds: Math.floor(game.tick / TICK_HZ),
    structures: game.structures.length,
  };
}
