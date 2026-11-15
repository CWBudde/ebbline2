import { describe, expect, it } from "vitest";
import { distance, neighbours } from "./hex.ts";
import { FLOW_RATE, flow, pulseAmount, total } from "./silt.ts";
import { ROCK, TICK_HZ } from "./state.ts";
import { addVent, build, depth, flat, lander, pour, run } from "./testing/fixtures.ts";

/** A walled pit: ground 0 inside x,y in 2..5, ground 9 around it. */
function pit() {
  const game = flat(24, 9);
  for (let y = 2; y <= 5; y++) {
    for (let x = 2; x <= 5; x++) game.height[y * game.w + x] = 0;
  }
  return game;
}

describe("silt flow", () => {
  // One even and one odd row, since odd rows reach their neighbours with other column steps.
  for (const [x, y] of [
    [6, 6],
    [6, 7],
  ] as const) {
    it(`spreads evenly to all six neighbours of ${x},${y} and keeps every grain`, () => {
      const game = flat(24, 0);
      pour(game, x, y, 1);
      flow(game);
      const around = neighbours(game.w, game.h, x, y);
      expect(around).toHaveLength(6);
      for (const n of around) expect(depth(game, n.x, n.y)).toBeCloseTo(FLOW_RATE, 6);
      expect(depth(game, x, y)).toBeCloseTo(1 - 6 * FLOW_RATE, 6);
      for (let ty = 0; ty < game.h; ty++) {
        for (let tx = 0; tx < game.w; tx++) {
          if (distance(x, y, tx, ty) > 1) expect(depth(game, tx, ty)).toBe(0);
        }
      }
      expect(total(game)).toBeCloseTo(1, 6);
    });

    it(`never leaves ${x},${y} below zero when it towers over six empty neighbours`, () => {
      const game = flat(24, 0);
      game.height[y * game.w + x] = 9;
      pour(game, x, y, 5);
      flow(game);
      // Each neighbour asks for far more than the tile holds; together they get 6 × 0.13 of it.
      expect(depth(game, x, y)).toBeCloseTo(5 * (1 - 6 * FLOW_RATE), 5);
      expect(depth(game, x, y)).toBeGreaterThan(0);
      for (let n = 0; n < 50; n++) {
        flow(game);
        for (const v of game.silt) expect(v).toBeGreaterThanOrEqual(0);
      }
    });
  }

  it("keeps the total over a step in the open", () => {
    const game = flat(24, 0);
    pour(game, 10, 9, 10);
    pour(game, 11, 9, 3);
    // No film is thin enough to dry up yet, so the step moves silt without losing or gaining any.
    flow(game);
    expect(total(game)).toBeCloseTo(13, 4);
  });

  it("levels out in a closed pit without gaining silt", () => {
    const game = pit();
    pour(game, 2, 2, 16);
    for (let n = 0; n < 400; n++) flow(game);
    // Only the thin leading film dries up on the way; nothing is ever gained.
    const left = total(game);
    expect(left).toBeLessThanOrEqual(16);
    expect(left).toBeGreaterThan(15);
    expect(depth(game, 2, 2)).toBeCloseTo(left / 16, 2);
    expect(depth(game, 5, 5)).toBeCloseTo(left / 16, 2);
    expect(depth(game, 6, 5)).toBe(0);
  });

  it("does not climb ground higher than its surface", () => {
    const game = pit();
    pour(game, 5, 5, 3);
    for (let n = 0; n < 100; n++) flow(game);
    expect(depth(game, 6, 5)).toBe(0);
  });

  it("spills over once it is deep enough", () => {
    const game = flat(24, 0);
    game.height[3 * game.w + 4] = 2;
    pour(game, 3, 3, 3);
    flow(game);
    expect(depth(game, 4, 3)).toBeGreaterThan(0);
  });

  it("never enters rock", () => {
    const game = flat(24, 0);
    game.height[3 * game.w + 4] = ROCK;
    pour(game, 3, 3, 5);
    for (let n = 0; n < 20; n++) flow(game);
    expect(depth(game, 4, 3)).toBe(0);
    expect(depth(game, 2, 3)).toBeGreaterThan(0);
  });

  it("stops at the map edge", () => {
    const game = flat(8, 0);
    game.structures = [];
    pour(game, 0, 0, 64);
    // A corner tile has only two neighbours on the map; nothing leaks through the four that are missing.
    flow(game);
    expect(total(game)).toBeCloseTo(64, 4);
    expect(depth(game, 0, 0)).toBeCloseTo(64 * (1 - 2 * FLOW_RATE), 4);
    for (let n = 0; n < 500; n++) flow(game);
    expect(total(game)).toBeLessThanOrEqual(64);
    expect(total(game)).toBeGreaterThan(63);
  });

  it("dries up films too thin to matter", () => {
    const game = flat(24, 0);
    pour(game, 3, 3, 0.02);
    flow(game);
    expect(total(game)).toBe(0);
  });

  it("is held back by a powered baffle and let through by a spent one", () => {
    const game = flat(24, 5);
    const l = lander(game);
    const b = build(game, "baffle", l.x + 3, l.y);
    pour(game, b.x + 5, b.y, 1.5);
    run(game, 30);
    expect(depth(game, b.x + 4, b.y)).toBe(0);
    b.energy = 0;
    b.active = false;
    run(game, 30);
    expect(depth(game, b.x + 4, b.y)).toBeGreaterThan(0);
  });
});

describe("vents", () => {
  it("pulse on their period", () => {
    const game = flat();
    addVent(game, 3, 3, 2);
    run(game, 29);
    expect(total(game)).toBe(0);
    run(game, 1);
    expect(total(game)).toBeCloseTo(2, 5);
  });

  it("grow stronger with time", () => {
    const game = flat();
    addVent(game, 3, 3, 2);
    const vent = game.vents[0];
    if (!vent) throw new Error("no vent");
    vent.ramp = 0.5;
    expect(pulseAmount(game, vent)).toBe(2);
    game.tick = 2 * 60 * TICK_HZ;
    expect(pulseAmount(game, vent)).toBe(4);
  });
});
