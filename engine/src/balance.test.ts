import { describe, expect, it } from "vitest";
import { CAMPAIGN, skirmish, type Difficulty, type MapSize } from "./levels.ts";
import { generate } from "./terrain.ts";
import { play } from "./testing/bot.ts";

/** These play whole missions; the largest takes a few seconds, more on a busy machine. */
const LONG = 60_000;

// Every mission must punish doing nothing and must be winnable by a simple scripted player.
describe.each(CAMPAIGN)("mission $id $name", (level) => {
  it("is lost by a player who does nothing", () => {
    expect(play(generate(level), 60 * 60, false).phase).toBe("lost");
  }, LONG);

  it("is won by the bot within fifty minutes", () => {
    const outcome = play(generate(level), 50 * 60);
    expect(outcome.phase).toBe("won");
  }, LONG);
});

/**
 * Skirmish maps the bot once lost or ran out of time on, each for a reason of its own (springs it kept putting down
 * and giving up, a last pylon it never placed, lances below silt they could not aim at), and three it always won.
 * Skirmish maps are unlike the campaign's, so they catch a change to the bot that only the campaign would let pass.
 */
const SKIRMISHES: readonly (readonly [number, MapSize, Difficulty])[] = [
  [2, "large", "easy"],
  [4, "large", "easy"],
  [9, "medium", "normal"],
  [4, "large", "normal"],
  [6, "large", "hard"],
  [10, "large", "hard"],
  [1, "small", "easy"],
  [6, "small", "normal"],
  [7, "medium", "normal"],
];

describe("skirmish", () => {
  it.each(SKIRMISHES)("seed %i, %s, %s is won by the bot within fifty minutes", (seed, size, difficulty) => {
    const outcome = play(generate(skirmish(seed, size, difficulty)), 50 * 60);
    expect(outcome.phase).toBe("won");
  }, LONG);
});
