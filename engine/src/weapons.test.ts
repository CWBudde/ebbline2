import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { centre, distance, neighbour, span, type Tile } from "./hex.ts";
import { GLOB, densest, stepSpitters } from "./spitters.ts";
import { KINDS, find, type Event, type Game } from "./state.ts";
import { build, depth, flat, lander, pour, run } from "./testing/fixtures.ts";
import { LOBBER, globAt } from "./weapons.ts";

/** The tile reached by walking `count` steps from (x, y) in each of the given directions in turn. */
function walk(x: number, y: number, ...legs: (readonly [direction: number, count: number])[]): Tile {
  let at = { x, y };
  for (const [direction, count] of legs) {
    for (let n = 0; n < count; n++) at = neighbour(at.x, at.y, direction);
  }
  return at;
}

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
    const lance = build(game, "lance", l.x + 4, l.y);
    game.height[lance.y * game.w + lance.x] = 2;
    // Three steps off across the row shift, one higher than the lance, and too shallow to spill over the rim.
    const up = walk(lance.x, lance.y, [1, 3]);
    game.height[up.y * game.w + up.x] = 3;
    pour(game, up.x, up.y, 2);
    run(game, 40);
    expect(depth(game, up.x, up.y)).toBe(2);
    game.height[up.y * game.w + up.x] = 2;
    run(game, 15);
    expect(depth(game, up.x, up.y)).toBeCloseTo(1.2, 5);
  });

  // Range counts steps: seven along any of the six directions, or bending once, is in reach; eight is not.
  for (const legs of [[[0, 7]], [[1, 7]], [[2, 7]], [[4, 7]], [[0, 4], [1, 3]], [[5, 3], [4, 4]]] as const) {
    it(`reaches exactly seven steps, walking ${legs.map(([d, n]) => `${n}×${d}`).join(" then ")}`, () => {
      const game = flat(40);
      const l = lander(game);
      const lance = build(game, "lance", l.x + 4, l.y + 3);
      game.height.fill(9);
      const edge = walk(lance.x, lance.y, ...legs);
      const beyond = walk(edge.x, edge.y, [legs[legs.length - 1]?.[0] ?? 0, 1]);
      expect(distance(lance.x, lance.y, edge.x, edge.y)).toBe(7);
      expect(distance(lance.x, lance.y, beyond.x, beyond.y)).toBe(8);
      well(game, beyond.x, beyond.y, 2);
      run(game, 20);
      expect(depth(game, beyond.x, beyond.y)).toBe(2);
      // The two tiles touch, so the first is filled in before the second is tried.
      game.height[beyond.y * game.w + beyond.x] = 9;
      pour(game, beyond.x, beyond.y, 0);
      well(game, edge.x, edge.y, 2);
      run(game, 15);
      expect(depth(game, edge.x, edge.y)).toBeCloseTo(1.2, 5);
    });
  }

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
  it("shells the deepest silt but nothing closer than three steps", () => {
    const game = flat(40);
    const l = lander(game);
    const lobber = build(game, "lobber", l.x + 4, l.y);
    well(game, lobber.x + 2, lobber.y, 5);
    well(game, lobber.x + 8, lobber.y, 3);
    const events = run(game, 60);
    expect(depth(game, lobber.x + 2, lobber.y)).toBe(5);
    expect(depth(game, lobber.x + 8, lobber.y)).toBeCloseTo(3 - LOBBER.removes, 5);
    expect(events).toContainEqual({
      kind: "impact",
      x: lobber.x + 8,
      y: lobber.y,
      radius: 2,
    });
  });

  it("flies as long as the straight line between the centres", () => {
    const game = flat(40);
    const l = lander(game);
    const lobber = build(game, "lobber", l.x + 4, l.y);
    const target = walk(lobber.x, lobber.y, [1, 5], [0, 2]);
    well(game, target.x, target.y, 3);
    run(game, 1);
    const shell = game.shells[0];
    if (!shell) throw new Error("no shell");
    expect({ x: shell.tx, y: shell.ty }).toEqual(target);
    expect(shell.duration).toBe(Math.round(span(lobber.x, lobber.y, target.x, target.y) * 2.5) + 10);
  });

  it("blasts every tile within two steps, less with each step", () => {
    const game = flat(40);
    game.silt.fill(5);
    // Odd row, so the blast straddles the row shift.
    const at = { x: 30, y: 25 };
    game.shells.push({ id: 99, sx: 20, sy: 25, tx: at.x, ty: at.y, t: 9, duration: 10 });
    const events = run(game, 1);
    expect(events).toContainEqual({ kind: "impact", x: at.x, y: at.y, radius: 2 });
    let hit = 0;
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        const d = distance(at.x, at.y, x, y);
        const left = d <= 2 ? 5 - LOBBER.removes * (1 - d / 3) : 5;
        expect(depth(game, x, y)).toBeCloseTo(left, 5);
        if (d <= 2) hit += 1;
      }
    }
    expect(hit).toBe(19);
    // About the 13 silt the square blast of radius 2.5 took.
    expect(game.stats.removed).toBeCloseTo(13.05, 3);
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

  it("reaches two steps in every direction and no further", () => {
    const game = flat(40);
    const l = lander(game);
    const pump = build(game, "pump", l.x + 4, l.y + 5);
    const reached: Tile[] = [];
    const missed: Tile[] = [];
    for (let d = 0; d < 6; d++) {
      reached.push(walk(pump.x, pump.y, [d, 2]));
      missed.push(walk(pump.x, pump.y, [d, 3]));
    }
    for (const t of [...reached, ...missed]) well(game, t.x, t.y, 1);
    run(game, 6);
    for (const t of reached) expect(depth(game, t.x, t.y)).toBeCloseTo(0.97, 5);
    for (const t of missed) expect(depth(game, t.x, t.y)).toBe(1);
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

  it("flies a glob in a straight line from centre to centre", () => {
    const glob = { sx: 3, sy: 4, tx: 10, ty: 9, t: 0, duration: 40 };
    expect(globAt(glob)).toEqual(centre(3, 4));
    const a = centre(3, 4);
    const b = centre(10, 9);
    const mid = globAt({ ...glob, t: 20 });
    expect(mid.x).toBeCloseTo((a.x + b.x) / 2, 10);
    expect(mid.y).toBeCloseTo((a.y + b.y) / 2, 10);
    const end = globAt({ ...glob, t: 40 });
    expect(end.x).toBeCloseTo(b.x, 10);
    expect(end.y).toBeCloseTo(b.y, 10);
  });

  it("times a glob's flight by the straight line to its target", () => {
    const game = withSpitter();
    const hub = densest(game);
    if (!hub) throw new Error("no hub");
    run(game, 1);
    const glob = game.globs[0];
    if (!glob) throw new Error("no glob");
    const flight = span(35, 35, hub.x, hub.y);
    expect(glob.duration).toBe(Math.round(flight * GLOB.ticksPerTile) + GLOB.warning);
  });

  it("splashes a glob evenly onto its tile and the six around it", () => {
    const game = flat(40);
    // Odd row, so the splash straddles the row shift.
    const at = { x: 20, y: 21 };
    game.globs.push({ id: 99, sx: 5, sy: 5, tx: at.x, ty: at.y, t: 9, duration: 10, amount: 7, hp: 3 });
    const events: Event[] = [];
    stepSpitters(game, events);
    expect(events).toContainEqual({ kind: "splash", x: at.x, y: at.y });
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        expect(depth(game, x, y)).toBeCloseTo(distance(at.x, at.y, x, y) <= 1 ? 1 : 0, 6);
      }
    }
  });

  it("counts a cluster by steps", () => {
    const game = flat(40);
    game.structures = [];
    game.occ.fill(0);
    // Four pylons five steps apart in a line across the row shift: the inner two each see three.
    const tiles = [0, 1, 2, 3].map((n) => walk(4, 4, [1, 5 * n]));
    const pylons = tiles.map((t) => build(game, "pylon", t.x, t.y));
    expect(densest(game)).toBe(pylons[1]);
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
