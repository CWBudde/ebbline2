// Seeded PRNG (mulberry32). The state lives in the game so that saves and replays stay deterministic.

export interface RngState {
  rng: number;
}

/** Returns a float in [0, 1) and advances the state. */
export function next(state: RngState): number {
  state.rng = (state.rng + 0x6d2b79f5) | 0;
  let t = state.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Returns an integer in [0, n). */
export function int(state: RngState, n: number): number {
  return Math.floor(next(state) * n);
}
