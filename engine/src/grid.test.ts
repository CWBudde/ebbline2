import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { rebuild } from "./grid.ts";
import { build, flat, lander, run } from "./testing/fixtures.ts";

describe("grid", () => {
  it("links structures within six tiles of each other", () => {
    const game = flat(40);
    const l = lander(game);
    const near = build(game, "lance", l.x + 6, l.y);
    const far = build(game, "lance", l.x + 13, l.y);
    rebuild(game);
    expect(near.dist).toBe(6);
    expect(near.parent).toBe(l.id);
    expect(far.dist).toBe(Infinity);
  });

  it("routes through any built structure, not only pylons", () => {
    const game = flat(40);
    const l = lander(game);
    const relay = build(game, "lance", l.x + 5, l.y);
    const beyond = build(game, "lance", l.x + 10, l.y);
    rebuild(game);
    expect(beyond.parent).toBe(relay.id);
    expect(beyond.dist).toBe(10);
  });

  it("does not route through an unfinished pylon", () => {
    const game = flat(40);
    const l = lander(game);
    apply(game, { kind: "place", structure: "pylon", x: l.x + 6, y: l.y });
    const beyond = build(game, "lance", l.x + 11, l.y);
    rebuild(game);
    expect(beyond.dist).toBe(Infinity);
  });

  it("lets trunks span fourteen tiles at half the cost", () => {
    const game = flat(40);
    const l = lander(game);
    const a = build(game, "trunk", l.x + 4, l.y);
    const b = build(game, "trunk", l.x + 18, l.y);
    const c = build(game, "pylon", l.x + 4, l.y + 14);
    rebuild(game);
    expect(b.parent).toBe(a.id);
    expect(b.dist).toBe(4 + 7);
    expect(c.dist).toBe(Infinity);
  });

  it("cuts off what lies behind a dismantled pylon", () => {
    const game = flat(40);
    const l = lander(game);
    const pylon = build(game, "pylon", l.x + 6, l.y);
    const lance = build(game, "lance", l.x + 11, l.y);
    run(game, 1);
    expect(Number.isFinite(lance.dist)).toBe(true);
    apply(game, { kind: "dismantle", id: pylon.id });
    run(game, 1);
    expect(lance.dist).toBe(Infinity);
    expect(game.links).toEqual([]);
  });
});
