// Harvest: a pylon gathers a little energy from the ground around it that lies at its own height.

import { line, within } from "./hex.ts";
import { DRY, ROCK, type Game, type Structure } from "./state.ts";

/** Steps around a pylon from which it gathers energy. */
export const HARVEST_RANGE = 3;
/** Energy per second that one claimed, dry tile yields. */
export const HARVEST_RATE = 0.006;

/** Whether a pylon gathers energy right now: built, switched on and on the grid. */
function harvests(s: Structure): boolean {
  return s.kind === "pylon" && s.built && s.active && Number.isFinite(s.dist);
}

/** Whether no tile on the line from (x, y) to (tx, ty) rises above `own` or is rock; lower ground does not block. */
function clear(game: Game, x: number, y: number, tx: number, ty: number, own: number, side: 1 | -1): boolean {
  for (const t of line(x, y, tx, ty, side)) {
    if (t.x < 0 || t.y < 0 || t.x >= game.w || t.y >= game.h) return false;
    const ground = game.height[t.y * game.w + t.x] ?? ROCK;
    if (ground === ROCK || ground > own) return false;
  }
  return true;
}

/**
 * Tiles a pylon at (x, y) would claim, given which are already taken: those within HARVEST_RANGE steps whose
 * ground lies exactly at the height of the pylon's own tile and that the pylon can see, with no higher ground or
 * rock on the straight line between. A line that runs along an edge between two tiles counts as clear if it is
 * clear on either side, so the area comes out the same in every direction. Rock never counts.
 */
function claimable(game: Game, x: number, y: number, taken: Uint8Array): number[] {
  const own = game.height[y * game.w + x] ?? ROCK;
  const tiles: number[] = [];
  if (own === ROCK) return tiles;
  within(game.w, game.h, x, y, HARVEST_RANGE, (i, _steps, tx, ty) => {
    if (game.height[i] !== own || taken[i] !== 0) return;
    if (clear(game, x, y, tx, ty, own, 1) || clear(game, x, y, tx, ty, own, -1)) tiles.push(i);
  });
  return tiles;
}

/**
 * Which tiles the pylons claim, worked out from the structures and the terrain alone. A tile goes to at most one
 * pylon: the one placed first (the lowest id) keeps it, so packing pylons together gains nothing.
 */
export function claims(game: Game): Uint8Array<ArrayBuffer> {
  const taken = new Uint8Array(game.w * game.h);
  const pylons = game.structures.filter(harvests).sort((a, b) => a.id - b.id);
  for (const s of pylons) {
    for (const i of claimable(game, s.x, s.y, taken)) taken[i] = 1;
  }
  return taken;
}

/** Brings game.harvest up to date and bumps game.harvestRev if it changed. */
export function updateHarvest(game: Game): void {
  const next = claims(game);
  const old = game.harvest;
  let same = old.length === next.length;
  for (let i = 0; same && i < next.length; i++) same = old[i] === next[i];
  if (same) return;
  game.harvest = next;
  game.harvestRev += 1;
}

/** Tile indices a pylon placed at (x, y) would newly claim, for the placement preview. */
export function harvestPreview(game: Game, x: number, y: number): number[] {
  if (x < 0 || y < 0 || x >= game.w || y >= game.h) return [];
  return claimable(game, x, y, game.harvest);
}

/**
 * Tile indices the pylons that do not gather yet (still being built, switched off or cut off) would claim once
 * they do, earliest placed first. For showing the area a pylon under construction is going to have.
 */
export function harvestPending(game: Game): number[] {
  const taken = game.harvest.slice();
  const tiles: number[] = [];
  const waiting = game.structures.filter((s) => s.kind === "pylon" && !harvests(s)).sort((a, b) => a.id - b.id);
  for (const s of waiting) {
    for (const i of claimable(game, s.x, s.y, taken)) {
      taken[i] = 1;
      tiles.push(i);
    }
  }
  return tiles;
}

/** Energy per second the claimed tiles yield right now; silt standing on a tile stops its yield. */
export function harvestIncome(game: Game): number {
  let dry = 0;
  const { harvest, silt } = game;
  for (let i = 0; i < harvest.length; i++) {
    if (harvest[i] === 1 && (silt[i] ?? 0) < DRY) dry += 1;
  }
  return dry * HARVEST_RATE;
}
