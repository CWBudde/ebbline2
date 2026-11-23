import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { neighbours, within } from "./hex.ts";
import { fingerprint, load, save } from "./save.ts";
import { BALM_FADE, BALM_SPREADS, FLOW_RATE, flow } from "./silt.ts";
import { placeError } from "./structures.ts";
import { FLOW_EVERY, KINDS, type Event, type Game } from "./state.ts";
import { balmAt, build, depth, flat, lander, pour, run, wash } from "./testing/fixtures.ts";
import { LANCE, SPRING } from "./weapons.ts";

/** A single-tile pit at (x, y): ground 0 inside a wall of 9, so whatever is poured into it stays there. */
function well(game: Game, x: number, y: number): void {
  for (const n of neighbours(game.w, game.h, x, y)) game.height[n.y * game.w + n.x] = 9;
  game.height[y * game.w + x] = 0;
}

function sum(values: Float32Array): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

describe("balm", () => {
  it("spreads twice as far as silt in a flow step, less what fades", () => {
    const game = flat(24, 0);
    wash(game, 6, 7, 1);
    pour(game, 16, 16, 1);
    flow(game);
    // Two passes reach the second ring round the balm; the silt only reaches its first.
    within(game.w, game.h, 6, 7, 2, (_i, d, x, y) => {
      if (d === 2) expect(balmAt(game, x, y)).toBeGreaterThan(0);
    });
    within(game.w, game.h, 16, 16, 2, (_i, d, x, y) => {
      if (d === 1) expect(depth(game, x, y)).toBeCloseTo(FLOW_RATE, 6);
      if (d === 2) expect(depth(game, x, y)).toBe(0);
    });
    expect(sum(game.balm)).toBeCloseTo(1 - BALM_FADE, 5);
    expect(BALM_SPREADS).toBe(2);
  });

  it("runs downhill and never up", () => {
    const game = flat(24, 0);
    // Ground falls by a step every column eastward from x = 4.
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) game.height[y * game.w + x] = Math.max(0, 9 - Math.max(0, x - 4));
    }
    wash(game, 6, 10, 10);
    for (let n = 0; n < 20; n++) flow(game);
    let west = 0;
    let total = 0;
    let moment = 0;
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        const b = balmAt(game, x, y);
        if (x < 6) west += b;
        total += b;
        moment += b * x;
      }
    }
    expect(west).toBe(0);
    expect(moment / total).toBeGreaterThan(8);
  });

  it("cancels an equal amount of silt on the same tile, and counts it as removed", () => {
    const game = flat(24, 5);
    well(game, 6, 6);
    pour(game, 6, 6, 2);
    wash(game, 6, 6, 2);
    flow(game);
    expect(depth(game, 6, 6)).toBe(0);
    expect(balmAt(game, 6, 6)).toBe(0);
    expect(game.stats.removed).toBeCloseTo(2, 6);
  });

  it("leaves the excess of the larger amount", () => {
    const game = flat(24, 5);
    well(game, 6, 6);
    pour(game, 6, 6, 3);
    wash(game, 6, 6, 1);
    flow(game);
    expect(depth(game, 6, 6)).toBeCloseTo(2, 6);
    expect(balmAt(game, 6, 6)).toBe(0);
    expect(game.stats.removed).toBeCloseTo(1, 6);
  });

  it("eats into silt on the tiles next to it, so a pool of each does not just stand level", () => {
    const game = flat(24, 9);
    // A walled trough along a row, balm in its west half and silt in its east half, each a step deep.
    for (let x = 4; x < 12; x++) game.height[10 * game.w + x] = 0;
    for (let x = 4; x < 8; x++) wash(game, x, 10, 1);
    for (let x = 8; x < 12; x++) pour(game, x, 10, 1);
    const silt = sum(game.silt);
    for (let n = 0; n < 5; n++) flow(game);
    expect(sum(game.silt)).toBeLessThan(silt);
    // Every grain of silt is either still there or counted as removed.
    expect(sum(game.silt) + game.stats.removed).toBeCloseTo(silt, 4);
  });

  it("fades as it stands, and is mostly gone within two minutes", () => {
    const game = flat(24, 5);
    well(game, 6, 6);
    wash(game, 6, 6, 2);
    flow(game);
    expect(balmAt(game, 6, 6)).toBeCloseTo(2 * (1 - BALM_FADE), 6);
    run(game, 120 * 30);
    expect(balmAt(game, 6, 6)).toBeGreaterThan(0);
    expect(balmAt(game, 6, 6)).toBeLessThan(0.4);
  });

  it("harms nothing and blocks no building", () => {
    const game = flat();
    const l = lander(game);
    const pylon = build(game, "pylon", l.x + 3, l.y);
    wash(game, pylon.x, pylon.y, 3);
    wash(game, l.x + 5, l.y, 3);
    expect(placeError(game, "pylon", l.x + 5, l.y)).toBeNull();
    // Keep it topped up so it stands on the pylon the whole time.
    for (let n = 0; n < 300; n++) {
      wash(game, pylon.x, pylon.y, 3);
      run(game, 1);
    }
    expect(pylon.health).toBe(KINDS.pylon.cost);
    expect(game.structures).toContain(pylon);
  });

  it("is no target for a lance", () => {
    const game = flat();
    const l = lander(game);
    const lance = build(game, "lance", l.x + 3, l.y);
    within(game.w, game.h, lance.x, lance.y, 4, (i, d) => {
      if (d >= 2) game.balm[i] = 2;
    });
    const events = run(game, 60);
    expect(events.some((e) => e.kind === "lance")).toBe(false);
    expect(lance.energy).toBe(KINDS.lance.store);
  });
});

describe("the spring", () => {
  it("pours a gush of balm onto its tile when built, switched on and full, and spends its store", () => {
    const game = flat();
    const l = lander(game);
    const spring = build(game, "spring", l.x + 3, l.y);
    expect(spring.energy).toBe(KINDS.spring.store);
    const events = run(game, 1);
    expect(events).toContainEqual({ kind: "gush", id: spring.id, x: spring.x, y: spring.y });
    expect(balmAt(game, spring.x, spring.y)).toBe(SPRING.amount);
    expect(spring.energy).toBe(0);
  });

  it("asks for energy again and gushes again once it is full and its pause is over", () => {
    const game = flat();
    const l = lander(game);
    build(game, "spring", l.x + 3, l.y);
    game.energy = 30;
    const events = run(game, SPRING.every + 60);
    const gushes = events.filter((e) => e.kind === "gush");
    expect(gushes).toHaveLength(2);
    expect(game.stats.spent).toBeGreaterThanOrEqual(1);
  });

  it("does nothing while switched off, unfinished or empty", () => {
    const game = flat();
    const l = lander(game);
    const off = build(game, "spring", l.x + 3, l.y);
    apply(game, { kind: "toggle", id: off.id });
    apply(game, { kind: "place", structure: "spring", x: l.x - 3, y: l.y });
    const empty = build(game, "spring", l.x, l.y + 4);
    empty.energy = 0;
    // No energy in the bank, so neither the empty nor the unfinished one gets any.
    game.energy = 0;
    const events: Event[] = [];
    for (let n = 0; n < 300; n++) {
      game.energy = 0;
      events.push(...run(game, 1));
    }
    expect(events.some((e) => e.kind === "gush")).toBe(false);
    expect(sum(game.balm)).toBe(0);
    expect(off.energy).toBe(KINDS.spring.store);
  });

  it("works standing in silt: its balm cancels the silt on the spot", () => {
    const game = flat();
    const l = lander(game);
    const spring = build(game, "spring", l.x + 3, l.y);
    pour(game, spring.x, spring.y, 1);
    run(game, FLOW_EVERY);
    expect(depth(game, spring.x, spring.y)).toBe(0);
    expect(game.stats.removed).toBeGreaterThan(0.9);
  });

  // A spring is no bargain: its worth is that balm runs to silt no lance can aim at.
  it("cancels less silt per energy than a lance burns, but a good share of it, when its balm runs down into a pool", () => {
    const game = flat(32, 0);
    const l = lander(game);
    // A ramp from the lander's height eastward down into a wide pool of silt.
    for (let y = 0; y < game.h; y++) {
      for (let x = 15; x < game.w; x++) game.height[y * game.w + x] = x < 20 ? 19 - x : 0;
    }
    for (let y = 0; y < game.h; y++) for (let x = 20; x < game.w; x++) pour(game, x, y, 2);
    const spring = build(game, "spring", l.x + 4, l.y);
    // The bank pays everything, so what is spent goes into the spring.
    for (let n = 0; n < 60 * 30; n++) {
      game.energy = Math.max(game.energy, 10);
      run(game, 1);
    }
    expect(spring.built).toBe(true);
    const perEnergy = game.stats.removed / game.stats.spent;
    const lance = LANCE.removes / LANCE.cost;
    expect(perEnergy).toBeLessThan(lance);
    expect(perEnergy).toBeGreaterThan(lance * 0.4);
  });

  it("keeps its balm in a save, which plays on exactly like the game it was taken from", () => {
    const game = flat();
    const l = lander(game);
    build(game, "spring", l.x + 3, l.y);
    pour(game, l.x + 6, l.y, 4);
    game.energy = 30;
    run(game, 200);
    expect(sum(game.balm)).toBeGreaterThan(0);
    const copy = load(save(game));
    expect(copy).toEqual(game);
    expect(fingerprint(copy)).toBe(fingerprint(game));
    run(game, 300);
    run(copy, 300);
    expect(fingerprint(copy)).toBe(fingerprint(game));
  });
});
