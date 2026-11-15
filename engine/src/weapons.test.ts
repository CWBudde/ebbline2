import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { densest } from "./spitters.ts";
import { KINDS, find, type Game } from "./state.ts";
import { build, depth, flat, lander, pour, run } from "./testing/fixtures.ts";

/** Pours silt into a one-tile hole, where it stays put. */
function well(game: Game, x: number, y: number, amount: number): void {
  game.height[y * game.w + x] = 0;
  pour(game, x, y, amount);
}

describe("lance", () => {
  it("burns silt in range and spends energy", () => {
    const game = flat(40);
    const l = lander(game);
    const lance = build(game, "lance", l.x + 4, l.y);
    game.height[l.y * game.w + l.x + 8] = 0;
    pour(game, l.x + 8, l.y, 3);
    const events = run(game, 2);
    expect(depth(game, l.x + 8, l.y)).toBeCloseTo(2.2, 5);
    expect(lance.energy).toBeLessThan(KINDS.lance.store);
    expect(events.some((e) => e.kind === "lance")).toBe(true);
  });

  it("cannot aim uphill", () => {
    const game = flat(40);
    const l = lander(game);
    build(game, "lance", l.x + 4, l.y);
    game.height.fill(9, 0, game.w * 5);
    game.height[2 * game.w + l.x + 4] = 6;
    pour(game, l.x + 4, 2, 2);
    run(game, 5);
    expect(depth(game, l.x + 4, 2)).toBe(2);
  });

  it("prefers a deep tile over a thin film nearby", () => {
    const game = flat(40);
    const l = lander(game);
    const lance = build(game, "lance", l.x + 4, l.y);
    game.height.fill(9);
    game.height[lance.y * game.w + lance.x] = 9;
    pour(game, lance.x + 1, lance.y, 0.06);
    pour(game, lance.x + 5, lance.y, 2);
    run(game, 1);
    expect(depth(game, lance.x + 5, lance.y)).toBeCloseTo(1.2, 5);
  });

  it("does nothing without energy", () => {
    const game = flat(40);
    const l = lander(game);
    const lance = build(game, "lance", l.x + 4, l.y);
    lance.energy = 0;
    lance.active = false;
    lance.built = true;
    game.height.fill(9);
    pour(game, lance.x + 3, lance.y, 2);
    run(game, 5);
    expect(depth(game, lance.x + 3, lance.y)).toBe(2);
  });
});

describe("lobber", () => {
  it("shells the deepest silt but nothing closer than three tiles", () => {
    const game = flat(40);
    const l = lander(game);
    const lobber = build(game, "lobber", l.x + 4, l.y);
    well(game, lobber.x + 2, lobber.y, 5);
    well(game, lobber.x + 8, lobber.y, 3);
    const events = run(game, 60);
    expect(depth(game, lobber.x + 2, lobber.y)).toBe(5);
    expect(depth(game, lobber.x + 8, lobber.y)).toBeCloseTo(1.8, 5);
    expect(events).toContainEqual({
      kind: "impact",
      x: lobber.x + 8,
      y: lobber.y,
      radius: 2.5,
    });
  });
});

describe("pump", () => {
  it("skims nearby silt into energy", () => {
    const game = flat(40);
    const l = lander(game);
    const pump = build(game, "pump", l.x + 4, l.y);
    well(game, pump.x + 1, pump.y, 1);
    run(game, 6);
    expect(depth(game, pump.x + 1, pump.y)).toBeCloseTo(0.97, 5);
    expect(game.stats.removed).toBeCloseTo(0.03, 5);
  });
});

describe("grader", () => {
  it("moves marked ground one step at a time toward the mark", () => {
    const game = flat(40, 5);
    const l = lander(game);
    build(game, "grader", l.x + 4, l.y);
    const tile = l.y * game.w + l.x + 7;
    apply(game, { kind: "mark", tiles: [tile], height: 7 });
    expect(game.mark[tile]).toBe(7);
    run(game, 46);
    expect(game.height[tile]).toBe(6);
    run(game, 46);
    expect(game.height[tile]).toBe(7);
    expect(game.mark[tile]).toBe(-1);
  });

  it("ignores marks under structures and marks equal to the ground", () => {
    const game = flat(40, 5);
    const l = lander(game);
    const grader = build(game, "grader", l.x + 4, l.y);
    const own = grader.y * game.w + grader.x;
    apply(game, { kind: "mark", tiles: [own, own + 1], height: 5 });
    expect(game.mark[own + 1]).toBe(-1);
    apply(game, { kind: "mark", tiles: [own], height: 2 });
    run(game, 100);
    expect(game.height[own]).toBe(5);
  });
});

describe("spitters and interceptors", () => {
  function withSpitter() {
    const game = flat(40);
    const l = lander(game);
    build(game, "pylon", l.x + 4, l.y);
    game.spitters.push({ x: 35, y: 35, period: 900, amount: 9, timer: 1 });
    return game;
  }

  it("aims at the densest cluster and splashes silt there", () => {
    const game = withSpitter();
    const hub = densest(game);
    const events = run(game, 1);
    expect(events).toContainEqual({
      kind: "spit",
      x: 35,
      y: 35,
      tx: hub?.x,
      ty: hub?.y,
    });
    const glob = game.globs[0];
    if (!glob) throw new Error("no glob");
    game.height.fill(9);
    run(game, glob.duration);
    expect(game.globs).toEqual([]);
    expect(game.stats.lost + game.structures.length).toBeGreaterThan(0);
    let sum = 0;
    for (const v of game.silt) sum += v;
    expect(sum).toBeCloseTo(9, 3);
  });

  it("loses the glob to an interceptor in range", () => {
    const game = withSpitter();
    const l = lander(game);
    const guard = build(game, "interceptor", l.x + 2, l.y + 3);
    const events = run(game, 400);
    expect(events.some((e) => e.kind === "intercept" && e.kill)).toBe(true);
    expect(events.some((e) => e.kind === "splash")).toBe(false);
    expect(find(game, guard.id)).toBeDefined();
    expect(game.stats.spent).toBeGreaterThanOrEqual(3);
  });
});
