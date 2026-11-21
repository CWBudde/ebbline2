// Silt and balm: flow over the terrain, the vents that feed the silt, and the balm that cancels it.

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
 * Share of the balm on a tile that fades away per flow step: one and a half percent of it every second, so a pool
 * left standing is mostly gone within a minute or two.
 */
export const BALM_FADE = 0.003;

/** Balm is thinner than silt: it spreads this many times per flow step, so it runs downhill and floods faster. */
export const BALM_SPREADS = 2;

/**
 * Moves one fluid for one flow step: every tile gives part of its surface-level difference to each lower
 * neighbour, computed from the state before the step and applied to `to`. The surface stands on the ground, the
 * baffle field, the fluid itself and `other`, the other fluid. The map edge is closed.
 */
function spread(game: Game, from: Float32Array, to: Float32Array, other: Float32Array): void {
  const { w, h, height, baffle } = game;
  to.set(from);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const depth = from[i] as number;
      if (depth <= 0) continue;
      const level = (height[i] as number) + (baffle[i] as number) + depth + (other[i] as number);
      neighbourIndices(w, h, x, y, around);
      for (let n = 0; n < DIRECTIONS; n++) {
        const j = around[n] as number;
        if (j < 0) continue;
        const ground = height[j] as number;
        if (ground === ROCK) continue;
        const surface = ground + (baffle[j] as number) + (from[j] as number) + (other[j] as number);
        if (level <= surface) continue;
        const moved = Math.min(level - surface, depth) * FLOW_RATE;
        to[i] = (to[i] as number) - moved;
        to[j] = (to[j] as number) + moved;
      }
    }
  }
}

/**
 * Share of the lesser of two fluids on neighbouring tiles that cancels out per flow step where balm touches silt.
 * Without it a balm pool and the silt beside it would stand level and leave each other alone. At most a sixth, so
 * no tile gives away more than it holds to its six neighbours.
 */
export const CONTACT = 0.13;

/**
 * Where balm touches silt on a neighbouring tile, part of the lesser of the two cancels out (CONTACT), worked out
 * from the state before the pass. Uses the scratch buffers and swaps them in; returns the silt removed.
 */
function touch(game: Game): number {
  const { w, h } = game;
  const silt = game.silt;
  const balm = game.balm;
  const siltOut = game.siltNext;
  const balmOut = game.balmNext;
  siltOut.set(silt);
  balmOut.set(balm);
  let cancelled = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const b = balm[i] as number;
      if (b <= 0) continue;
      neighbourIndices(w, h, x, y, around);
      for (let n = 0; n < DIRECTIONS; n++) {
        const j = around[n] as number;
        if (j < 0) continue;
        const s = silt[j] as number;
        if (s <= 0) continue;
        const m = Math.min(b, s) * CONTACT;
        siltOut[j] = (siltOut[j] as number) - m;
        balmOut[i] = (balmOut[i] as number) - m;
        cancelled += m;
      }
    }
  }
  game.silt = siltOut;
  game.siltNext = silt;
  game.balm = balmOut;
  game.balmNext = balm;
  return cancelled;
}

/**
 * One flow step: the silt flows, then the balm over the silt as it now stands. Balm cancels silt one for one, on
 * its own tile and, a part per step, on the tiles next to it (see touch). The silt removed counts in
 * `stats.removed`. Then the balm fades a little, and films of either thinner than FILM dry up.
 */
export function flow(game: Game): void {
  spread(game, game.silt, game.siltNext, game.balm);
  const before = game.silt;
  game.silt = game.siltNext;
  game.siltNext = before;
  let cancelled = 0;
  let wet = false;
  for (const b of game.balm) {
    if (b > 0) {
      wet = true;
      break;
    }
  }
  if (wet) {
    for (let pass = 0; pass < BALM_SPREADS; pass++) {
      spread(game, game.balm, game.balmNext, game.silt);
      const old = game.balm;
      game.balm = game.balmNext;
      game.balmNext = old;
    }
    cancelled += touch(game);
  }
  const { silt, balm } = game;
  for (let i = 0; i < silt.length; i++) {
    let s = silt[i] as number;
    if (wet) {
      let b = balm[i] as number;
      if (b > 0) {
        const m = Math.min(s, b);
        s -= m;
        b = (b - m) * (1 - BALM_FADE);
        cancelled += m;
        balm[i] = b < FILM ? 0 : b;
      }
    }
    silt[i] = s < FILM ? 0 : s;
  }
  game.stats.removed += cancelled;
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
