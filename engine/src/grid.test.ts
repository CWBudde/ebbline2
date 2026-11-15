import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { linkLength, rebuild } from "./grid.ts";
import { DIRECTIONS, neighbour, span, type Tile } from "./hex.ts";
import { LINK_RANGE, TRUNK_RANGE, type Kind, type Structure } from "./state.ts";
import { build, flat, lander, run } from "./testing/fixtures.ts";

function probe(kind: Kind, at: Tile): Structure {
  return { kind, x: at.x, y: at.y } as Structure;
}

/** The tile reached by walking `count` steps from `from` in each of the given directions in turn. */
function walk(from: Tile, ...legs: (readonly [direction: number, count: number])[]): Tile {
  let at = from;
  for (const [direction, count] of legs) {
    for (let n = 0; n < count; n++) at = neighbour(at.x, at.y, direction);
  }
  return at;
}

describe("link range", () => {
  // From an even and an odd row, so every walk crosses the row shift both ways.
  for (const from of [
    { x: 20, y: 20 },
    { x: 20, y: 21 },
  ]) {
    for (let d = 0; d < DIRECTIONS; d++) {
      it(`links at six steps and not at seven in direction ${d} from ${from.x},${from.y}`, () => {
        const a = probe("pylon", from);
        expect(linkLength(a, probe("lance", walk(from, [d, LINK_RANGE])))).toBe(6);
        expect(linkLength(a, probe("lance", walk(from, [d, LINK_RANGE + 1])))).toBe(0);
        expect(linkLength(a, probe("trunk", walk(from, [d, LINK_RANGE + 1])))).toBe(0);
      });
    }

    it(`counts steps, not straight-line distance, from ${from.x},${from.y}`, () => {
      const a = probe("pylon", from);
      // Seven steps with a bend lie barely six tile units away in a straight line, and still do not link.
      const bent = walk(from, [0, 4], [1, 3]);
      expect(span(from.x, from.y, bent.x, bent.y)).toBeLessThan(6.1);
      expect(linkLength(a, probe("pylon", bent))).toBe(0);
      const inside = walk(from, [5, 3], [4, 3]);
      expect(linkLength(a, probe("pylon", inside))).toBe(6);
    });

    it(`lets two trunks link at fourteen steps and not at fifteen from ${from.x},${from.y}`, () => {
      const a = probe("trunk", from);
      for (const legs of [[[2, 14]], [[3, 7], [4, 7]]] as const) {
        expect(linkLength(a, probe("trunk", walk(from, ...legs)))).toBe(TRUNK_RANGE);
      }
      expect(linkLength(a, probe("trunk", walk(from, [2, 15])))).toBe(0);
      expect(linkLength(a, probe("pylon", walk(from, [2, 14])))).toBe(0);
    });
  }
});

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
