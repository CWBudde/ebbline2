import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { BOOST, linksAt, rebuild } from "./grid.ts";
import { BUILDABLE, KINDS, type Game, type Kind, type Structure } from "./state.ts";
import { addVent, build, flat, lander, run } from "./testing/fixtures.ts";

/** Where each test drops the structure under test. */
const AT = { x: 16, y: 14 };

interface Scene {
  game: Game;
  lander: Structure;
  /** Two pylons in range of AT, one of them unfinished. */
  near: Structure;
  planned: Structure;
  /** A pylon just out of range of AT. */
  far: Structure;
  /** A trunk in ordinary range of AT, and one only a trunk can reach. */
  trunk: Structure;
  farTrunk: Structure;
  /** A lance next to AT. */
  lance: Structure;
}

function scene(): Scene {
  const game = flat(48);
  const l = lander(game);
  const near = build(game, "pylon", 17, 11);
  apply(game, { kind: "place", structure: "pylon", x: 20, y: 17 });
  const planned = game.structures[game.structures.length - 1] as Structure;
  const far = build(game, "pylon", 23, 14);
  const trunk = build(game, "trunk", 14, 17);
  const farTrunk = build(game, "trunk", 16, 27);
  const lance = build(game, "lance", 17, 15);
  // The tile under test can take a tap or a cap as well as anything else.
  game.lode[AT.y * game.w + AT.x] = 1;
  rebuild(game);
  return { game, lander: l, near, planned, far, trunk, farTrunk, lance };
}

/** Places a structure the way the player does, unfinished. */
function drop(game: Game, kind: Kind, x = AT.x, y = AT.y): Structure {
  if (kind === "cap") addVent(game, x, y);
  if (kind === "tap") game.lode[y * game.w + x] = 1;
  apply(game, { kind: "place", structure: kind, x, y });
  const s = game.structures[game.structures.length - 1];
  if (!s || s.kind !== kind) throw new Error(`could not place ${kind}`);
  rebuild(game);
  return s;
}

/** Ids the engine linked to a structure, sorted. */
function linkedIds(game: Game, id: number): number[] {
  const ids: number[] = [];
  for (let n = 0; n < game.links.length; n += 2) {
    if (game.links[n] === id) ids.push(game.links[n + 1] ?? 0);
    if (game.links[n + 1] === id) ids.push(game.links[n] ?? 0);
  }
  return ids.sort((a, b) => a - b);
}

function ids(list: readonly Structure[]): number[] {
  return list.map((s) => s.id).sort((a, b) => a - b);
}

describe("links after placement", () => {
  for (const kind of BUILDABLE) {
    it(`gives a ${kind} the links the preview showed`, () => {
      const sc = scene();
      const preview = linksAt(sc.game, kind, AT.x, AT.y);
      const s = drop(sc.game, kind);
      expect(linkedIds(sc.game, s.id)).toEqual(ids(preview));
      // A structure already standing gets the same answer.
      expect(ids(linksAt(sc.game, kind, AT.x, AT.y, s.id))).toEqual(ids(preview));

      // Every kind links to everything within six tiles, built or planned, not just the nearest;
      // only a trunk reaches the trunk fourteen tiles away.
      const expected = [sc.lander, sc.near, sc.planned, sc.trunk, sc.lance];
      if (kind === "trunk") expected.push(sc.farTrunk);
      expect(linkedIds(sc.game, s.id)).toEqual(ids(expected));
      expect(linkedIds(sc.game, s.id)).not.toContain(sc.far.id);
    });
  }

  it("draws exactly the links the preview of each structure promises", () => {
    const sc = scene();
    drop(sc.game, "cell");
    const { game } = sc;
    const fromPreview = new Set<string>();
    for (const s of game.structures) {
      for (const t of linksAt(game, s.kind, s.x, s.y, s.id)) {
        fromPreview.add([s.id, t.id].sort((a, b) => a - b).join("-"));
      }
    }
    const drawn = new Set<string>();
    for (let n = 0; n < game.links.length; n += 2) {
      const pair = [game.links[n] ?? 0, game.links[n + 1] ?? 0];
      drawn.add(pair.sort((a, b) => a - b).join("-"));
    }
    expect(drawn.size).toBe(game.links.length / 2);
    expect([...drawn].sort()).toEqual([...fromPreview].sort());
  });
});

describe("relaying", () => {
  // The relay stands 5 tiles from the lander; the target 5 tiles further on, 10 from the lander.
  for (const kind of BUILDABLE) {
    it(`routes packets through a built ${kind}`, () => {
      const game = flat(40);
      const l = lander(game);
      if (kind === "cap") addVent(game, l.x + 5, l.y);
      if (kind === "tap") game.lode[l.y * game.w + l.x + 5] = 1;
      const relay = build(game, kind, l.x + 5, l.y);
      const target = drop(game, "lance", l.x + 10, l.y);
      expect(target.parent).toBe(relay.id);
      // Past a booster, packets run a fifth faster, so the far leg takes less time.
      expect(target.dist).toBe(kind === "booster" ? 5 + 5 / BOOST : 10);
    });
  }

  it("does not route through a structure that is still unfinished", () => {
    const game = flat(40);
    const l = lander(game);
    drop(game, "cell", l.x + 5, l.y);
    const target = drop(game, "lance", l.x + 10, l.y);
    expect(target.dist).toBe(Infinity);
  });

  for (const kind of ["cell", "tap"] as const) {
    it(`delivers packets to a structure whose only path runs through a ${kind}`, () => {
      const game = flat(40);
      const l = lander(game);
      const relay = drop(game, kind, l.x + 5, l.y);
      const target = drop(game, "lance", l.x + 10, l.y);
      expect(target.dist).toBe(Infinity);
      let seen = false;
      for (let t = 0; t < 120 * 30 && !target.built; t++) {
        run(game, 1);
        seen ||= game.packets.some((p) => p.target === target.id && p.ids.includes(relay.id));
      }
      expect(relay.built).toBe(true);
      expect(seen).toBe(true);
      expect(target.built).toBe(true);
      expect(target.health).toBe(KINDS.lance.cost);
    });
  }
});
