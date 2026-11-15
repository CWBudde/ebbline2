import { describe, expect, it } from "vitest";
import { CAMPAIGN, find, generate, type LevelDef } from "@ebbline2/engine";
import { siltTension } from "./tension.ts";

function fresh() {
  const game = generate(CAMPAIGN[0] as LevelDef);
  game.silt.fill(0);
  return game;
}

describe("silt tension", () => {
  it("is calm on a dry map", () => {
    expect(siltTension(fresh())).toBe(0);
  });

  it("rises as silt nears the lander", () => {
    const game = fresh();
    const lander = find(game, game.landerId);
    if (!lander) throw new Error("no lander");
    const at = (dx: number): number => {
      game.silt.fill(0);
      const x = Math.min(game.w - 1, lander.x + dx);
      game.silt[lander.y * game.w + x] = 2;
      return siltTension(game);
    };
    expect(at(20)).toBeLessThan(at(8));
    expect(at(8)).toBeLessThan(at(2));
    expect(at(2)).toBeLessThanOrEqual(1);
  });

  it("rises with coverage and is zero once the game is over", () => {
    const game = fresh();
    game.silt.fill(1);
    expect(siltTension(game)).toBe(1);
    game.phase = "lost";
    expect(siltTension(game)).toBe(0);
  });
});
