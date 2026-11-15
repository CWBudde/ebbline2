// Silt: flow over the terrain and the vents that feed it.

import {
  CAP_DRY,
  ROCK,
  TICK_HZ,
  find,
  tileIndex,
  type Event,
  type Game,
  type Structure,
  type Vent,
} from "./state.ts";

/** Share of a level difference that moves to one neighbour per flow step. */
export const FLOW_RATE = 0.2;
/** Films thinner than this dry up. */
export const FILM = 0.01;

/**
 * One flow step. Every tile gives part of its surface-level difference to each lower neighbour,
 * computed from the state before the step and applied to a second buffer.
 */
export function flow(game: Game): void {
  const { w, h, height, baffle } = game;
  const from = game.silt;
  const to = game.siltNext;
  to.set(from);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const depth = from[i] as number;
      if (depth <= 0) continue;
      const level = (height[i] as number) + (baffle[i] as number) + depth;
      for (let n = 0; n < 4; n++) {
        let j: number;
        if (n === 0) {
          if (x + 1 >= w) continue;
          j = i + 1;
        } else if (n === 1) {
          if (x === 0) continue;
          j = i - 1;
        } else if (n === 2) {
          if (y + 1 >= h) continue;
          j = i + w;
        } else {
          if (y === 0) continue;
          j = i - w;
        }
        const ground = height[j] as number;
        if (ground === ROCK) continue;
        const other = ground + (baffle[j] as number) + (from[j] as number);
        if (level <= other) continue;
        const moved = Math.min(level - other, depth) * FLOW_RATE;
        to[i] = (to[i] as number) - moved;
        to[j] = (to[j] as number) + moved;
      }
    }
  }
  for (let i = 0; i < to.length; i++) {
    if ((to[i] as number) < FILM) to[i] = 0;
  }
  game.silt = to;
  game.siltNext = from;
}

/** The unfinished, connected cap that is clamping a vent, if any. */
function clamp(game: Game, vent: Vent): Structure | undefined {
  const id = game.occ[tileIndex(game, vent.x, vent.y)] ?? 0;
  if (id === 0) return undefined;
  const s = find(game, id);
  return s && s.kind === "cap" && !s.built && Number.isFinite(s.dist)
    ? s
    : undefined;
}

/** What a vent gives per pulse right now. */
export function pulseAmount(game: Game, vent: Vent): number {
  return vent.amount * (1 + (vent.ramp * game.tick) / (TICK_HZ * 60));
}

export function stepVents(game: Game, events: Event[]): void {
  for (const vent of game.vents) {
    if (vent.capped) continue;
    const i = tileIndex(game, vent.x, vent.y);
    const held = clamp(game, vent);
    if (!held && vent.pressure > 0) {
      game.silt[i] = (game.silt[i] ?? 0) + vent.pressure;
      vent.pressure = 0;
      events.push({ kind: "burst", x: vent.x, y: vent.y });
    }
    vent.timer -= 1;
    if (vent.timer > 0) continue;
    vent.timer = vent.period;
    const amount = pulseAmount(game, vent);
    if (held) {
      vent.pressure += amount;
    } else {
      game.silt[i] = (game.silt[i] ?? 0) + amount;
      events.push({ kind: "pulse", x: vent.x, y: vent.y });
    }
  }
}

/** Whether a cap may be started on this vent now. */
export function ventDry(game: Game, vent: Vent): boolean {
  return (game.silt[tileIndex(game, vent.x, vent.y)] ?? 0) < CAP_DRY;
}

/** Total silt on the map. */
export function total(game: Game): number {
  let sum = 0;
  for (const v of game.silt) sum += v;
  return sum;
}
