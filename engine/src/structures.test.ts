import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { disc, distance, tileOf, within } from "./hex.ts";
import { placeError, stepWear } from "./structures.ts";
import { KINDS, ROCK, find, footprint, structureAt, type Event } from "./state.ts";
import { addVent, build, flat, lander, pour, run } from "./testing/fixtures.ts";
import { generate } from "./terrain.ts";
import { CAMPAIGN } from "./levels.ts";

describe("placing", () => {
  it("names what is in the way", () => {
    const game = flat(40);
    const l = lander(game);
    game.height[2 * game.w + 2] = ROCK;
    game.lode[4 * game.w + 4] = 1;
    pour(game, 6, 6, 0.2);
    addVent(game, 8, 8);
    game.spitters.push({ x: 9, y: 9, period: 900, amount: 5, timer: 900 });
    expect(placeError(game, "pylon", -1, 0)).toBe("outside");
    expect(placeError(game, "pylon", 2, 2)).toBe("rock");
    expect(placeError(game, "pylon", l.x + 1, l.y)).toBe("occupied");
    expect(placeError(game, "pylon", 6, 6)).toBe("flooded");
    expect(placeError(game, "pylon", 8, 8)).toBe("vent");
    expect(placeError(game, "pylon", 9, 9)).toBe("spitter");
    expect(placeError(game, "tap", 5, 5)).toBe("needs lode");
    expect(placeError(game, "tap", 4, 4)).toBeNull();
    expect(placeError(game, "cap", 5, 5)).toBe("needs vent");
    expect(placeError(game, "cap", 8, 8)).toBeNull();
    expect(placeError(game, "lander", 5, 5)).toBe("locked");
  });

  it("refuses kinds the level does not allow", () => {
    const game = flat(40);
    game.level = { ...game.level, allowed: ["pylon"] };
    expect(placeError(game, "lance", 5, 5)).toBe("locked");
    apply(game, { kind: "place", structure: "lance", x: 5, y: 5 });
    expect(structureAt(game, 5, 5)).toBeUndefined();
  });
});

describe("the lander", () => {
  // The fixture's lander stands on an even row; a generated one may stand on either.
  const games = [flat(40), ...CAMPAIGN.slice(0, 4).map((level) => generate(level))];

  it("covers its tile and the six around it", () => {
    for (const game of games) {
      const l = lander(game);
      const tiles = footprint(game, "lander", l.x, l.y);
      expect(tiles).toHaveLength(7);
      for (let i = 0; i < game.occ.length; i++) {
        const own = tiles.includes(i);
        expect(game.occ[i] === l.id).toBe(own);
        const t = tileOf(game.w, i);
        if (own) expect(distance(l.x, l.y, t.x, t.y)).toBeLessThanOrEqual(1);
      }
    }
  });

  it("refuses a structure on each of its seven tiles and allows one right beside them", () => {
    for (const game of games) {
      const l = lander(game);
      game.silt.fill(0);
      game.height.fill(5);
      within(game.w, game.h, l.x, l.y, 2, (_i, steps, x, y) => {
        expect(structureAt(game, x, y)?.id === l.id).toBe(steps <= 1);
        expect(placeError(game, "pylon", x, y)).toBe(steps <= 1 ? "occupied" : null);
      });
    }
  });

  it("wears down from silt on any one of its tiles", () => {
    for (const t of disc(12, 12, 1)) {
      const game = flat(40);
      const l = lander(game);
      pour(game, t.x, t.y, 1);
      stepWear(game, []);
      expect(l.health).toBeCloseTo(KINDS.lander.cost - 1 * 0.03, 6);
    }
    // Silt one step beyond the footprint does not touch it.
    const game = flat(40);
    const l = lander(game);
    within(game.w, game.h, l.x, l.y, 2, (i, steps) => {
      if (steps === 2) game.silt[i] = 3;
    });
    stepWear(game, []);
    expect(l.health).toBe(KINDS.lander.cost);
  });
});

describe("building", () => {
  it("is paid for packet by packet", () => {
    const game = flat(40);
    const l = lander(game);
    apply(game, { kind: "place", structure: "pylon", x: l.x + 4, y: l.y });
    const pylon = structureAt(game, l.x + 4, l.y);
    expect(pylon?.built).toBe(false);
    run(game, 90);
    expect(pylon?.built).toBe(true);
    expect(game.stats.spent).toBe(KINDS.pylon.cost);
  });

  it("never reaches a structure off the grid", () => {
    const game = flat(40);
    const l = lander(game);
    apply(game, { kind: "place", structure: "pylon", x: l.x + 9, y: l.y });
    run(game, 300);
    expect(structureAt(game, l.x + 9, l.y)?.health).toBe(0);
    expect(game.stats.spent).toBe(0);
  });

  it("finishes a structure that wear has left a fraction short", () => {
    const game = flat(40);
    const l = lander(game);
    apply(game, { kind: "place", structure: "pylon", x: l.x + 4, y: l.y });
    const pylon = structureAt(game, l.x + 4, l.y);
    if (!pylon) throw new Error("no pylon");
    pylon.health = KINDS.pylon.cost - 0.1;
    run(game, 60);
    expect(pylon.built).toBe(true);
  });

  it("keeps weapons supplied with energy", () => {
    const game = flat(40);
    const l = lander(game);
    const lance = build(game, "lance", l.x + 4, l.y);
    lance.energy = 0;
    run(game, 150);
    expect(lance.energy).toBe(KINDS.lance.store);
  });

  it("stores more energy with every finished cell", () => {
    const game = flat(40);
    const l = lander(game);
    const before = game.capacity;
    const cell = build(game, "cell", l.x + 3, l.y);
    expect(game.capacity).toBe(before + 30);
    apply(game, { kind: "dismantle", id: cell.id });
    expect(game.capacity).toBe(before);
  });

  it("earns from a connected tap", () => {
    const game = flat(40);
    const l = lander(game);
    game.energy = 0;
    run(game, 300);
    const alone = game.energy;
    game.energy = 0;
    game.lode[l.y * game.w + l.x + 3] = 1;
    build(game, "tap", l.x + 3, l.y);
    run(game, 300);
    expect(game.energy).toBeGreaterThan(alone + 5);
  });

  it("returns half the energy on dismantling, and never the lander", () => {
    const game = flat(40);
    const l = lander(game);
    const lobber = build(game, "lobber", l.x + 3, l.y);
    game.energy = 0;
    apply(game, { kind: "dismantle", id: lobber.id });
    expect(game.energy).toBe(15);
    expect(find(game, lobber.id)).toBeUndefined();
    apply(game, { kind: "dismantle", id: l.id });
    expect(find(game, l.id)).toBeDefined();
  });

  it("stops supplying a structure that is switched off", () => {
    const game = flat(40);
    const l = lander(game);
    const lance = build(game, "lance", l.x + 4, l.y);
    lance.energy = 0;
    apply(game, { kind: "toggle", id: lance.id });
    run(game, 150);
    expect(lance.energy).toBe(0);
  });
});

describe("wear", () => {
  it("destroys a structure standing in silt", () => {
    const game = flat(40);
    const l = lander(game);
    const pylon = build(game, "pylon", l.x + 9, l.y);
    game.height[pylon.y * game.w + pylon.x] = 0;
    pour(game, pylon.x, pylon.y, 4);
    const events = run(game, 60);
    expect(find(game, pylon.id)).toBeUndefined();
    expect(events).toContainEqual({
      kind: "destroyed",
      structure: "pylon",
      x: pylon.x,
      y: pylon.y,
    });
    expect(game.stats.lost).toBe(1);
  });

  it("ends the mission when the lander is lost", () => {
    const game = flat(40);
    const l = lander(game);
    game.height.fill(9);
    // Only one outer tile of the footprint is flooded; that is enough.
    const t = disc(l.x, l.y, 1)[0] ?? { x: 0, y: 0 };
    game.height[t.y * game.w + t.x] = 0;
    pour(game, t.x, t.y, 8);
    game.energy = 0;
    const events: Event[] = run(game, 600);
    expect(game.phase).toBe("lost");
    expect(events).toContainEqual({ kind: "lost" });
    expect(events).toContainEqual({ kind: "destroyed", structure: "lander", x: l.x, y: l.y });
    // Its whole footprint is free again.
    expect([...game.occ].every((id) => id === 0)).toBe(true);
    expect(run(game, 10)).toEqual([]);
  });
});
