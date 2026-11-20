// Ground that moves. With `movingFloor`, waves of rising ground travel outward from the lander, over the terrain
// the level generated; on the shoal bend, two shoals in the channel rise and sink in turn. Every SHIFT_EVERY ticks
// each moving tile goes up or down by the change in its lift, so the silt on it rises and falls with it.

import { centre, distance, ROW, tileOf, type Point, type Tile } from "./hex.ts";
import { find, MAX_HEIGHT, ROCK, TICK_HZ, type Game, type LevelDef } from "./state.ts";

/** Rings round the lander that rise and sink as one piece with it. */
const PLATEAU_RADIUS = 3;
/** The ring between the plateau and the first wave, which never moves and is the only ground graders can work. */
const STEADY_RING = PLATEAU_RADIUS + 1;
const SHIFT_EVERY = 8 * TICK_HZ;
/** Lift in steps above a tile's own ground, shift by shift. */
const CYCLE = [0, 1, 2, 2, 1, 0] as const;
const RISE = 2;

/** Whether any ground on this level moves. */
export function hasMovingGround(level: LevelDef): boolean {
  return level.movingFloor === true || level.landform === "shoal-bend";
}

/** The shoal bend is authored facing down; it is widened across, its left arm stretched, and turned clockwise. */
const ACROSS = 1.36;
const LEFT = 1.2;

/** Where a point of the authored layout lies on the map. */
export function rotateBend(p: Point, width: number): Point {
  const middleY = (width * ROW) / 2;
  const offset = middleY - p.y;
  return { x: width / 2 + offset * (offset < 0 ? LEFT : 1), y: middleY + (p.x - width / 2) * ACROSS };
}

/** Where a point of the map lies in the authored layout. */
export function unrotateBend(p: Point, width: number): Point {
  const middleY = (width * ROW) / 2;
  const offset = p.x - width / 2;
  return { x: width / 2 + (p.y - middleY) / ACROSS, y: middleY - offset / (offset < 0 ? LEFT : 1) };
}

// Each shoal is an overlapping pair of elliptic lobes in the authored layout: centre x, y and radii, as fractions of
// the map's width. Their different footprints and phases leave several paths round the islands.
const SHOALS = [
  [
    [0.65, 0.468, 0.046, 0.032],
    [0.621, 0.494, 0.044, 0.028],
  ],
  [
    [0.318, 0.444, 0.029, 0.051],
    [0.344, 0.485, 0.036, 0.022],
  ],
] as const;

/** The shoal a tile belongs to, or -1. */
function shoalAt(width: number, i: number): number {
  const { x, y } = tileOf(width, i);
  const p = unrotateBend(centre(x, y), width);
  return SHOALS.findIndex((lobes) =>
    lobes.some(([cx, cy, rx, ry]) => ((p.x / width - cx) / rx) ** 2 + ((p.y / width - cy) / ry) ** 2 < 1),
  );
}

/**
 * How many shifts a tile lags behind the cycle, or undefined where the ground stands still. The plateau leads,
 * then the waves follow two rings at a time; the second shoal lags the first by one shift.
 */
function lag(level: LevelDef, width: number, home: Tile, i: number): number | undefined {
  if (level.landform === "shoal-bend") {
    const shoal = shoalAt(width, i);
    return shoal < 0 ? undefined : shoal;
  }
  if (level.movingFloor !== true) return undefined;
  const { x, y } = tileOf(width, i);
  const ring = distance(home.x, home.y, x, y);
  if (ring === STEADY_RING) return undefined;
  return ring <= PLATEAU_RADIUS ? 0 : Math.floor((ring - STEADY_RING - 1) / 2);
}

function lift(phase: number, lag: number): number {
  const n = CYCLE.length;
  return CYCLE[(((phase - lag) % n) + n) % n] ?? 0;
}

/**
 * Makes the generated ground ready to move, leaving room for the full rise: a moving floor squeezes the whole map's
 * relief below it and levels the plateau to the lander's ground; shoals are only lowered where they stand too high.
 * Then the lift of the first phase is added. Rock never moves.
 */
export function prepareMovingGround(height: Int8Array, width: number, level: LevelDef, home: Tile): void {
  if (!hasMovingGround(level)) return;
  const room = MAX_HEIGHT - RISE;
  const floor = level.movingFloor === true;
  const lower = (ground: number): number =>
    floor ? Math.round((Math.max(0, ground) * room) / MAX_HEIGHT) : Math.min(ground, room);
  const plateau = lower(height[home.y * width + home.x] ?? 0);
  height.forEach((ground, i) => {
    if (ground === ROCK) return;
    const late = lag(level, width, home, i);
    if (late === undefined) {
      if (floor) height[i] = lower(ground);
      return;
    }
    const { x, y } = tileOf(width, i);
    const base = floor && distance(home.x, home.y, x, y) <= PLATEAU_RADIUS ? plateau : lower(ground);
    height[i] = base + lift(0, late);
  });
}

/** Whether graders may work this tile: only ground that never moves. */
export function floorCanBeGraded(game: Game, i: number): boolean {
  if (!hasMovingGround(game.level)) return true;
  const home = find(game, game.landerId);
  return home !== undefined && lag(game.level, game.w, home, i) === undefined;
}

/** Moves the ground when a shift is due; the phase follows from the tick, so a loaded save carries on in step. */
export function stepMovingFloor(game: Game): boolean {
  if (!hasMovingGround(game.level) || game.tick % SHIFT_EVERY !== 0) return false;
  const home = find(game, game.landerId);
  if (!home) return false;
  const phase = game.tick / SHIFT_EVERY;
  game.height.forEach((ground, i) => {
    const late = ground === ROCK ? undefined : lag(game.level, game.w, home, i);
    if (late !== undefined) game.height[i] = ground + lift(phase, late) - lift(phase - 1, late);
  });
  game.gridDirty = true;
  return true;
}
