import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { total } from "./silt.ts";
import { placeError } from "./structures.ts";
import { structureAt } from "./state.ts";
import { addVent, depth, flat, lander, pour, run } from "./testing/fixtures.ts";

function setup() {
  const game = flat(40);
  const l = lander(game);
  addVent(game, l.x + 5, l.y, 2);
  game.capacity = 500;
  game.energy = 500;
  return { game, x: l.x + 5, y: l.y };
}

describe("cap", () => {
  it("cannot start on a flooded vent", () => {
    const { game, x, y } = setup();
    pour(game, x, y, 1);
    expect(placeError(game, "cap", x, y)).toBe("flooded");
    pour(game, x, y, 0.2);
    expect(placeError(game, "cap", x, y)).toBeNull();
  });

  it("clamps the vent while it is built, then seals it and wins", () => {
    const { game, x, y } = setup();
    apply(game, { kind: "place", structure: "cap", x, y });
    const events = run(game, 400);
    expect(depth(game, x, y)).toBe(0);
    expect(structureAt(game, x, y)?.built).toBe(true);
    expect(game.vents[0]?.capped).toBe(true);
    expect(game.phase).toBe("won");
    expect(events).toContainEqual({ kind: "capped", x, y });
    expect(events).toContainEqual({ kind: "won" });
  });

  it("lets the held pressure burst out when the cap is given up", () => {
    const { game, x, y } = setup();
    game.energy = 0;
    game.capacity = 0;
    apply(game, { kind: "place", structure: "cap", x, y });
    run(game, 95);
    const cap = structureAt(game, x, y);
    expect(game.vents[0]?.pressure).toBe(6);
    expect(depth(game, x, y)).toBe(0);
    apply(game, { kind: "dismantle", id: cap?.id ?? 0 });
    const events = run(game, 1);
    expect(events).toContainEqual({ kind: "burst", x, y });
    expect(total(game)).toBeCloseTo(6, 5);
  });

  it("does not clamp when the grid does not reach it", () => {
    const game = flat(40);
    addVent(game, 30, 30, 2);
    apply(game, { kind: "place", structure: "cap", x: 30, y: 30 });
    run(game, 31);
    expect(game.vents[0]?.pressure).toBe(0);
  });

  it("wins a survival mission by lasting", () => {
    const game = flat(40);
    game.level = { ...game.level, objective: { kind: "survive", ticks: 90 } };
    run(game, 89);
    expect(game.phase).toBe("playing");
    run(game, 1);
    expect(game.phase).toBe("won");
  });

  it("wins a survival mission early once every vent is capped", () => {
    const game = flat(40);
    game.level = { ...game.level, objective: { kind: "survive", ticks: 100000 } };
    addVent(game, 30, 30, 2);
    const vent = game.vents[0];
    if (!vent) throw new Error("no vent");
    run(game, 1);
    expect(game.phase).toBe("playing");
    vent.capped = true;
    run(game, 1);
    expect(game.phase).toBe("won");
  });
});
