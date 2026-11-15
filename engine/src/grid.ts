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

export function isTrunkLink(a: Structure, b: Structure): boolean {
  return a.kind === "trunk" && b.kind === "trunk";
}

/**
 * Length of the link between two structures in steps, or 0 if they do not link.
 * Any two structures within LINK_RANGE steps link; two trunks link over TRUNK_RANGE.
 */
export function linkLength(a: Structure, b: Structure): number {
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
 * Every built structure relays packets onward; an unfinished one can only be the end of a route.
 */
export function rebuild(game: Game): void {
  const nodes = game.structures;
  for (const s of nodes) {
    s.dist = s.id === game.landerId ? 0 : Infinity;
    s.parent = 0;
  }
  const open = new Set(nodes);
  for (;;) {
    let u: Structure | undefined;
    for (const s of open) {
      if (!u || s.dist < u.dist) u = s;
    }
    if (!u || !Number.isFinite(u.dist)) break;
    open.delete(u);
    if (!u.built) continue;
    for (const v of open) {
      const length = linkLength(u, v);
      if (length === 0) continue;
      const cost = u.dist + (isTrunkLink(u, v) ? length / 2 : length);
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
