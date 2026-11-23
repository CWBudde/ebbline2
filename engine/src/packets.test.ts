import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { DISPATCH_EVERY, SURGE_FROM, SURGE_PACKETS, dispatchSize } from "./packets.ts";
import { BASE_CAPACITY } from "./terrain.ts";
import { KINDS } from "./state.ts";
import { build, flat, lander, run } from "./testing/fixtures.ts";

/** A game with building sites around the lander that ask for more packets than a short run can send. */
function sites(energy: number) {
  const game = flat(40);
  const l = lander(game);
  game.capacity = BASE_CAPACITY;
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
  it("sends one packet at a time from a lander alone while the bank is not well filled", () => {
    const game = flat();
    game.capacity = BASE_CAPACITY;
    for (const share of [0, 0.25, SURGE_FROM]) {
      game.energy = share * game.capacity;
      expect(dispatchSize(game)).toBe(1);
    }
  });

  it("sends one more packet at a time for every Cell, however low the bank", () => {
    const game = flat();
    for (const cells of [1, 2, 5]) {
      game.capacity = BASE_CAPACITY * (1 + cells);
      for (const share of [0, 0.5, SURGE_FROM]) {
        game.energy = share * game.capacity;
        expect(dispatchSize(game)).toBe(1 + cells);
      }
    }
  });

  it("sends more packets at once the fuller the bank is", () => {
    const game = flat();
    game.capacity = BASE_CAPACITY;
    game.energy = game.capacity * (SURGE_FROM + (1 - SURGE_FROM) / 2);
    expect(dispatchSize(game)).toBe(1 + SURGE_PACKETS / 2);
    game.energy = game.capacity;
    expect(dispatchSize(game)).toBe(1 + SURGE_PACKETS);
    game.capacity = 0;
    expect(dispatchSize(game)).toBe(1);
  });

  it("surges more the more the bank holds", () => {
    const game = flat();
    for (const cells of [0, 1, 3]) {
      game.capacity = BASE_CAPACITY * (1 + cells);
      game.energy = game.capacity;
      expect(dispatchSize(game)).toBe((1 + cells) * (1 + SURGE_PACKETS));
    }
  });

  it("drains a full bank faster than a low one", () => {
    const ticks = 5 * DISPATCH_EVERY;
    const low = sites(BASE_CAPACITY / 2);
    run(low, ticks);
    expect(low.stats.spent).toBe(5);
    const full = sites(BASE_CAPACITY);
    run(full, ticks);
    // The bank empties as it sends, so the later dispatches are smaller than the first, which surges in full.
    expect(full.stats.spent).toBeGreaterThanOrEqual(1 + SURGE_PACKETS + 4);
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

  it("mends a finished structure only once a whole point of health is missing", () => {
    const game = flat();
    const l = lander(game);
    const cell = build(game, "cell", l.x + 3, l.y);
    game.energy = 20;
    const spent = game.stats.spent;
    // A scratch is left alone: a packet for it would cost a whole energy.
    cell.health = KINDS.cell.cost - 0.4;
    run(game, 300);
    expect(game.stats.spent).toBe(spent);
    expect(cell.health).toBe(KINDS.cell.cost - 0.4);
    // With more than a point gone, one packet mends one point and the rest waits.
    cell.health = KINDS.cell.cost - 1.4;
    run(game, 300);
    expect(game.stats.spent).toBe(spent + 1);
    expect(cell.health).toBeCloseTo(KINDS.cell.cost - 0.4);
  });

  it("builds an unfinished structure to full health even when wear left a fraction", () => {
    const game = flat();
    const l = lander(game);
    game.energy = 20;
    apply(game, { kind: "place", structure: "cell", x: l.x + 3, y: l.y });
    const cell = game.structures.find((s) => s.kind === "cell");
    if (!cell) throw new Error("no cell");
    run(game, 14);
    expect(cell.built).toBe(false);
    expect(cell.health).toBeGreaterThanOrEqual(1);
    cell.health -= 0.5;
    run(game, 600);
    expect(cell.built).toBe(true);
    expect(cell.health).toBe(KINDS.cell.cost);
  });
});
