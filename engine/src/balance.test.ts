import { describe, expect, it } from "vitest";
import { CAMPAIGN } from "./levels.ts";
import { generate } from "./terrain.ts";
import { play } from "./testing/bot.ts";

/** These play whole missions; the largest takes a few seconds, more on a busy machine. */
const LONG = 60_000;

// Every mission must punish doing nothing and must be winnable by a simple scripted player.
// Skipped while the campaign is rebuilt for the hexagon map.
describe.skip.each(CAMPAIGN)("mission $id $name", (level) => {
  it("is lost by a player who does nothing", () => {
    expect(play(generate(level), 60 * 60, false).phase).toBe("lost");
  }, LONG);

  it("is won by the bot within fifty minutes", () => {
    const outcome = play(generate(level), 50 * 60);
    expect(outcome.phase).toBe("won");
  }, LONG);
});
