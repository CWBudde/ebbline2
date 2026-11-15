// Placing, losing and dismantling structures, and the wear silt puts on them.

import { disc } from "./hex.ts";
import { BASE_CAPACITY } from "./terrain.ts";
import {
  CAP_DRY,
  DRY,
  KINDS,
  ROCK,
  footprint,
  inBounds,
  tileIndex,
  ventAt,
  type Event,
  type Game,
  type Kind,
  type Structure,
} from "./state.ts";

/** Health lost per tick for each unit of silt depth on the structure. */
export const WEAR = 0.03;
export const CELL_CAPACITY = 30;
/** Share of the delivered energy returned on dismantling. */
export const REFUND = 0.5;

export type PlaceError =
  | "locked"
  | "outside"
  | "rock"
  | "occupied"
  | "flooded"
  | "needs lode"
  | "needs vent"
  | "vent"
  | "spitter";

/** Why a structure cannot go here, or null if it can. */
export function placeError(
  game: Game,
  kind: Kind,
  x: number,
  y: number,
): PlaceError | null {
  if (kind === "lander" || !game.level.allowed.includes(kind)) return "locked";
  // The whole footprint must lie on the map.
  const tiles = footprint(game, kind, x, y);
  if (!inBounds(game, x, y) || tiles.length < disc(x, y, KINDS[kind].radius).length) return "outside";
  if (tiles.some((t) => game.height[t] === ROCK)) return "rock";
  if (tiles.some((t) => game.occ[t] !== 0)) return "occupied";
  const i = tileIndex(game, x, y);
  if (game.spitters.some((s) => s.x === x && s.y === y)) return "spitter";
  const vent = ventAt(game, x, y);
  const depth = game.silt[i] ?? 0;
  if (kind === "cap") {
    if (!vent || vent.capped) return "needs vent";
    return depth < CAP_DRY ? null : "flooded";
  }
  if (vent) return "vent";
  if (depth >= DRY) return "flooded";
  if (kind === "tap" && game.lode[i] !== 1) return "needs lode";
  return null;
}

export function place(
  game: Game,
  kind: Kind,
  x: number,
  y: number,
  events: Event[],
): Structure | undefined {
  if (placeError(game, kind, x, y) !== null) return undefined;
  const s: Structure = {
    id: game.nextId++,
    kind,
    x,
    y,
    health: 0,
    built: false,
    active: true,
    energy: 0,
    pendingBuild: 0,
    pendingEnergy: 0,
    cooldown: 0,
    progress: 0,
    target: -1,
    dist: Infinity,
    parent: 0,
  };
  game.structures.push(s);
  for (const i of footprint(game, kind, x, y)) game.occ[i] = s.id;
  game.gridDirty = true;
  events.push({ kind: "placed", id: s.id });
  return s;
}

export function recountCapacity(game: Game): void {
  const cells = game.structures.filter(
    (s) => s.kind === "cell" && s.built,
  ).length;
  game.capacity = BASE_CAPACITY + cells * CELL_CAPACITY;
  game.energy = Math.min(game.energy, game.capacity);
}

function remove(game: Game, s: Structure): void {
  game.structures = game.structures.filter((o) => o !== s);
  for (const i of footprint(game, s.kind, s.x, s.y)) game.occ[i] = 0;
  const vent = s.kind === "cap" ? ventAt(game, s.x, s.y) : undefined;
  if (vent) vent.capped = false;
  game.gridDirty = true;
  recountCapacity(game);
}

/** Marks a finished structure as built and applies what that changes. */
export function complete(game: Game, s: Structure, events: Event[]): void {
  s.built = true;
  game.stats.built += 1;
  game.gridDirty = true;
  events.push({ kind: "built", id: s.id });
  if (s.kind === "cell") recountCapacity(game);
  if (s.kind === "cap") {
    const vent = ventAt(game, s.x, s.y);
    if (vent) {
      vent.capped = true;
      vent.pressure = 0;
      events.push({ kind: "capped", x: s.x, y: s.y });
    }
  }
}

export function dismantle(game: Game, id: number, events: Event[]): boolean {
  const s = game.structures.find((o) => o.id === id);
  if (!s || s.kind === "lander") return false;
  game.energy = Math.min(
    game.capacity,
    game.energy + Math.floor(s.health * REFUND),
  );
  remove(game, s);
  events.push({ kind: "dismantled", x: s.x, y: s.y });
  return true;
}

/** Silt standing on a structure wears it down; at zero health it is lost. */
export function stepWear(game: Game, events: Event[]): void {
  for (const s of [...game.structures]) {
    let depth = 0;
    // Silt on any tile of the footprint wears the whole structure.
    for (const i of footprint(game, s.kind, s.x, s.y)) {
      depth = Math.max(depth, game.silt[i] ?? 0);
    }
    // A cap is a sealed rig: only silt too deep to start one on harms it.
    if (depth < (s.kind === "cap" ? CAP_DRY : DRY)) continue;
    s.health -= depth * WEAR;
    if (s.health > 0) continue;
    remove(game, s);
    game.stats.lost += 1;
    events.push({ kind: "destroyed", structure: s.kind, x: s.x, y: s.y });
  }
}
