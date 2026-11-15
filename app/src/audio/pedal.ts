// Pure logic for the threat drone: when it comes in, how heavy it is, which note it holds, and how
// the score keeps out of its way. The drone is a pedal tone on the tonic of whatever the score is
// playing, so it always sits under the harmony instead of against it. Nothing here touches Web
// Audio, so it is unit tested.

/** Smoothed tension at which the drone comes in. */
export const DRONE_ON = 0.35;
/** It only leaves again once the tension has fallen below this, so hovering doesn't toggle it. */
export const DRONE_OFF = 0.22;
/** Weight the drone enters with; it grows from there towards 1 as the tension rises. */
export const DRONE_FLOOR = 0.3;

/** Lowest MIDI note of the drone's fundamental: E1, 41.2 Hz. Twelve notes up to D#2, 77.8 Hz. */
export const DRONE_LOW = 28;

/** Whether the drone sounds, given whether it did and the current tension (a Schmitt trigger). */
export function droneEngaged(was: boolean, tension: number): boolean {
  return was ? tension >= DRONE_OFF : tension >= DRONE_ON;
}

/**
 * How heavy the drone is, 0 (silent) .. 1 (full threat). It enters at DRONE_FLOOR and eases up to 1
 * as the tension climbs from DRONE_OFF to 1; below DRONE_OFF it holds the floor until it disengages.
 */
export function droneWeight(engaged: boolean, tension: number): number {
  if (!engaged) return 0;
  const t = Math.max(0, Math.min(1, (tension - DRONE_OFF) / (1 - DRONE_OFF)));
  const eased = t * t * (3 - 2 * t);
  return DRONE_FLOOR + (1 - DRONE_FLOOR) * eased;
}

/** The pedal for a key: its tonic in the lowest octave whose fundamental lies in 41–78 Hz. */
export function droneMidi(root: number): number {
  return DRONE_LOW + ((((root - DRONE_LOW) % 12) + 12) % 12);
}

/** How the drone's voices are set at a weight. Levels are linear gains on the music bus. */
export interface DroneMix {
  /** Overall level of the drone. */
  readonly gain: number;
  /** Lowpass cutoff in Hz, before the slow sweep. */
  readonly cutoff: number;
  /** How far the slow sweep moves the cutoff, in Hz. */
  readonly sweep: number;
  readonly q: number;
  /** Level of the two extra voices detuned around the root, which thicken and beat. */
  readonly thick: number;
  /** Level of the sine an octave below the fundamental. */
  readonly sub: number;
}

/** Peak level of the drone at full weight. */
export const DRONE_LEVEL = 0.12;

/** Maps the weight onto the drone's voices: at the floor it is the old quiet drone, then it opens up. */
export function droneMix(weight: number): DroneMix {
  const w = Math.max(0, Math.min(1, weight));
  if (w === 0) return { gain: 0, cutoff: 350, sweep: 150, q: 0.7, thick: 0, sub: 0 };
  // 0 at the floor, 1 at full weight.
  const grow = Math.max(0, (w - DRONE_FLOOR) / (1 - DRONE_FLOOR));
  return {
    gain: DRONE_LEVEL * (0.45 + 0.55 * w),
    cutoff: 450 + 1100 * grow * grow,
    sweep: 250 + 350 * grow,
    q: 0.8 + 3.2 * grow,
    thick: 0.8 * grow,
    sub: 0.15 + 0.85 * grow,
  };
}

/**
 * Moves a note off the two intervals that grate against a pedal: the minor second above it goes
 * down to the root, the tritone up to the fifth. Everything else is left alone.
 */
export function pedalSafe(midi: number, root: number): number {
  const interval = (((midi - root) % 12) + 12) % 12;
  if (interval === 1) return midi - 1;
  if (interval === 6) return midi + 1;
  return midi;
}
