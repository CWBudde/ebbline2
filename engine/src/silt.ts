// Silt: flow over the terrain and the vents that feed it.

import { DIRECTIONS, neighbourIndices } from "./hex.ts";
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

/**
 * Share of a level difference that moves to one neighbour per flow step. With six neighbours a tile can give
 * away at most 6 × 0.13 = 0.78 of its depth in one step, so depth never goes negative.
 */
export const FLOW_RATE = 0.13;
/** Films thinner than this dry up. */
export const FILM = 0.01;

// Neighbour indices of the tile being flowed; reused so the whole-map loop does not allocate.
const around = new Int32Array(DIRECTIONS);

/**
 * One flow step. Every tile gives part of its surface-level difference to each lower neighbour,
 * computed from the state before the step and applied to a second buffer. The map edge is closed.
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
      neighbourIndices(w, h, x, y, around);
      for (let n = 0; n < DIRECTIONS; n++) {
        const j = around[n] as number;
        if (j < 0) continue;
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

/** Ticks between the first pulses of one vent and the next, so the vents do not pulse in unison. */
export const VENT_STAGGER = 17;

/** Whether the vent still lies dormant: it has a delay (`VentTweak.delay`) and has not pulsed yet. */
export function ventAsleep(game: Game, vent: Vent): boolean {
  return !vent.capped && vent.timer > vent.period + VENT_STAGGER * game.vents.length;
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
