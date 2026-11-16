// The power grid: which structures link, and the cheapest way from the lander to each.

import { updateHarvest } from "./harvest.ts";
import { distance } from "./hex.ts";
import {
  LINK_RANGE,
  TRUNK_RANGE,
  type Game,
  type Structure,
} from "./state.ts";

/**
 * Packet speed in tile units per tick (the centres of touching tiles are one unit apart) on an ordinary link;
 * trunk-to-trunk links run twice as fast.
 */
export const PACKET_SPEED = 0.3;

/** Factor on a packet's speed for each booster that relays it; boosts from different boosters multiply. */
export const BOOST = 1.2;

/** Share by which every working booster on the map raises the speed of all packets; these shares add up. */
export const GLOBAL_BOOST = 0.02;

/**
 * Whether a structure speeds up the packets it relays: a booster that is built, switched on and
 * connected to the lander.
 */
export function boosts(s: Structure): boolean {
  return s.kind === "booster" && s.built && s.active && Number.isFinite(s.dist);
}

/**
 * Packet speed on an ordinary link right now, in tile units per tick: `PACKET_SPEED`, raised by
 * `GLOBAL_BOOST` for every working booster, wherever it stands and whether or not a packet passes it.
 */
export function packetSpeed(game: Game): number {
  let working = 0;
  for (const s of game.structures) {
    if (boosts(s)) working += 1;
  }
  return PACKET_SPEED * (1 + GLOBAL_BOOST * working);
}

export function isTrunkLink(a: Structure, b: Structure): boolean {
  return a.kind === "trunk" && b.kind === "trunk";
}

/**
 * Whether a structure of this kind passes packets on: the lander, pylons, trunks and boosters. Everything
 * else is an end of the grid, so a line cannot be chained through, say, cells or lances.
 */
export function relays(kind: Structure["kind"]): boolean {
  return kind === "lander" || kind === "pylon" || kind === "trunk" || kind === "booster";
}

/**
 * Length of the link between two structures in steps, or 0 if they do not link.
 * A relay links to any structure within LINK_RANGE steps, two trunks link over TRUNK_RANGE, and two
 * structures that are both no relays never link.
 */
export function linkLength(a: Structure, b: Structure): number {
  if (!relays(a.kind) && !relays(b.kind)) return 0;
  const d = distance(a.x, a.y, b.x, b.y);
  return d <= (isTrunkLink(a, b) ? TRUNK_RANGE : LINK_RANGE) ? d : 0;
}

/**
 * The structures a structure of this kind would link to if it stood at (x, y), in
 * game.structures order. The placement preview draws exactly these links, and rebuild()
 * creates exactly these links once the structure is placed, so the two cannot drift apart.
 * `self` is left out, so the same call answers for a structure that is already placed.
 */
export function linksAt(
  game: Game,
  kind: Structure["kind"],
  x: number,
  y: number,
  self = 0,
): Structure[] {
  const probe = { kind, x, y } as Structure;
  return game.structures.filter((s) => s.id !== self && linkLength(probe, s) > 0);
}

/** Whether a structure placed here would link to any built or planned structure. */
export function reaches(game: Game, kind: Structure["kind"], x: number, y: number): boolean {
  return linksAt(game, kind, x, y).length > 0;
}

/**
 * Recomputes every structure's distance and parent toward the lander, and the link list.
 * Every built relay passes packets onward; an unfinished one, like any other structure, can only be the end
 * of a route.
 *
 * The distance is the time a packet takes: a link costs its length, half on a trunk link, divided by
 * the boost a packet has picked up from the boosters on the way there. So routes bend through
 * boosters where that is quicker, and run as before where there are none. What every booster adds to the
 * speed of all packets (`GLOBAL_BOOST`) is left out: it shortens every route alike and changes none.
 */
export function rebuild(game: Game): void {
  const nodes = game.structures;
  for (const s of nodes) {
    s.dist = s.id === game.landerId ? 0 : Infinity;
    s.parent = 0;
  }
  // The boost a packet carries when it leaves each settled relay, by id. The lander's parent is 0.
  const pace = new Map<number, number>();
  const open = new Set(nodes);
  for (;;) {
    let u: Structure | undefined;
    for (const s of open) {
      if (!u || s.dist < u.dist) u = s;
    }
    if (!u || !Number.isFinite(u.dist)) break;
    open.delete(u);
    if (!u.built || !relays(u.kind)) continue;
    const boost = (pace.get(u.parent) ?? 1) * (boosts(u) ? BOOST : 1);
    pace.set(u.id, boost);
    for (const v of open) {
      const length = linkLength(u, v);
      if (length === 0) continue;
      const cost = u.dist + (isTrunkLink(u, v) ? length / 2 : length) / boost;
      if (cost < v.dist) {
        v.dist = cost;
        v.parent = u.id;
      }
    }
  }
  // Every link linksAt() promises, built or not, not only the ones current routes run along.
  const links: number[] = [];
  for (let a = 0; a < nodes.length; a++) {
    const s = nodes[a];
    if (!s) continue;
    for (let b = a + 1; b < nodes.length; b++) {
      const t = nodes[b];
      if (t && linkLength(s, t) > 0) links.push(s.id, t.id);
    }
  }
  game.links = links;
  game.gridDirty = false;
  // Which pylons harvest follows from what is built and connected.
  updateHarvest(game);
}
