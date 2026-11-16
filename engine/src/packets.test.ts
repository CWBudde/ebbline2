import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { DISPATCH_EVERY, SURGE_FROM, SURGE_PACKETS, dispatchSize } from "./packets.ts";
import { flat, lander, run } from "./testing/fixtures.ts";

/** A game with building sites around the lander that ask for more packets than a short run can send. */
function sites(energy: number) {
  const game = flat(40);
  const l = lander(game);
  game.capacity = 1000;
  game.energy = energy;
  for (const [dx, dy] of [
    [3, 0],
    [-3, 0],
    [0, 3],
    [0, -3],
  ] as const) {
    apply(game, { kind: "place", structure: "cell", x: l.x + dx, y: l.y + dy });
  }
  expect(game.structures.length).toBe(5);
  return game;
}

describe("dispatch", () => {
  it("sends one packet at a time while the bank is not well filled", () => {
    const game = flat();
    game.capacity = 200;
    for (const share of [0, 0.25, SURGE_FROM]) {
      game.energy = share * game.capacity;
      expect(dispatchSize(game)).toBe(1);
    }
  });

  it("sends more packets at once the fuller the bank is", () => {
    const game = flat();
    game.capacity = 200;
    game.energy = game.capacity * (SURGE_FROM + (1 - SURGE_FROM) / 2);
    expect(dispatchSize(game)).toBe(1 + SURGE_PACKETS / 2);
    game.energy = 200;
    expect(dispatchSize(game)).toBe(1 + SURGE_PACKETS);
    game.capacity = 0;
    expect(dispatchSize(game)).toBe(1);
  });

  it("drains a full bank faster than a low one", () => {
    const ticks = 5 * DISPATCH_EVERY;
    const low = sites(500);
    run(low, ticks);
    expect(low.stats.spent).toBe(5);
    const full = sites(1000);
    run(full, ticks);
    // The bank empties as it sends, so the later dispatches are a little smaller than the first.
    expect(full.stats.spent).toBeGreaterThanOrEqual(5 * SURGE_PACKETS);
  });

  it("never asks for more than a structure needs", () => {
    const game = sites(1000);
    run(game, 600);
    expect(game.packets.length).toBe(0);
    for (const s of game.structures) {
      expect(s.pendingBuild).toBe(0);
      expect(s.built).toBe(true);
    }
  });
});
