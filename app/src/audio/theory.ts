// Pure music logic for the generative score: modes, sections, chords, the melody walk and the
// step sequencer. Nothing here touches Web Audio, so it is unit tested.

import { pedalSafe } from "./pedal.ts";

export type Rand = () => number;

/** Semitone offsets of the seven scale degrees. */
export const MODES = {
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
} as const satisfies Record<string, readonly number[]>;

export type Mode = keyof typeof MODES;

export interface Section {
  /** MIDI note of the tonic, in the pad register (octave 3). */
  readonly root: number;
  readonly mode: Mode;
  /** Scale degrees (0-based) of the chord roots, one chord per entry. */
  readonly progression: readonly number[];
  readonly bpm: number;
  /** Base cutoff of the pad filter, in Hz. */
  readonly brightness: number;
}

/** The moods the score drifts between. Roots stay close so the moves sound like modulations, not cuts. */
export const SECTIONS: readonly Section[] = [
  { root: 57, mode: "dorian", progression: [0, 6, 3, 0], bpm: 66, brightness: 900 }, // A dorian: i VII IV i
  { root: 50, mode: "aeolian", progression: [0, 5, 2, 6], bpm: 64, brightness: 750 }, // D aeolian: i VI III VII
  { root: 53, mode: "lydian", progression: [0, 1, 0, 4], bpm: 60, brightness: 1100 }, // F lydian: I II I V
  { root: 55, mode: "mixolydian", progression: [0, 6, 3, 4], bpm: 68, brightness: 950 }, // G mixolydian: I bVII IV V
  { root: 52, mode: "aeolian", progression: [0, 3, 5, 4], bpm: 62, brightness: 700 }, // E aeolian: i iv VI v
  { root: 52, mode: "phrygian", progression: [0, 1, 0, 6], bpm: 58, brightness: 600 }, // E phrygian: i bII i bvii
];

/** Eighth-note steps per chord: two bars of 4/4. */
export const STEPS_PER_CHORD = 16;

/** The melody walks within these scale degrees (relative to the root an octave up). */
export const MELODY_LOW = 7;
export const MELODY_HIGH = 18;

export function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** MIDI note of a scale degree; degrees past 6 or below 0 wrap into other octaves. */
export function degreeToMidi(section: Section, degree: number): number {
  const mode = MODES[section.mode];
  const octave = Math.floor(degree / 7);
  const index = degree - octave * 7;
  return section.root + 12 * octave + (mode[index] ?? 0);
}

/** An open seventh-chord voicing on a scale degree: root, fifth, seventh, and the third an octave up. */
export function chordMidi(section: Section, degree: number): number[] {
  return [degree, degree + 4, degree + 6, degree + 9].map((d) => degreeToMidi(section, d));
}

/** Seconds per eighth-note step. */
export function stepSeconds(section: Section): number {
  return 60 / section.bpm / 2;
}

/** A random index other than `current`. */
export function pickOther(count: number, current: number, rand: Rand): number {
  if (count <= 1) return 0;
  const n = Math.floor(rand() * (count - 1));
  return n >= current ? n + 1 : n;
}

/**
 * The next melody degree: mostly small steps, sometimes a leap onto a chord tone, always in key
 * and inside the melody range.
 */
export function nextMelodyDegree(prev: number, chordDegree: number, rand: Rand): number {
  let next: number;
  if (rand() < 0.35) {
    // Land on the nearest chord tone (root, third or fifth) in some octave.
    const tones: number[] = [];
    for (let d = MELODY_LOW; d <= MELODY_HIGH; d++) {
      const rel = (((d - chordDegree) % 7) + 7) % 7;
      if (rel === 0 || rel === 2 || rel === 4) tones.push(d);
    }
    tones.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev));
    // Prefer one of the two nearest, so it doesn't always land on the same note.
    next = tones[rand() < 0.6 ? 0 : 1] ?? prev;
  } else {
    const steps = [-2, -1, -1, 1, 1, 2];
    next = prev + (steps[Math.floor(rand() * steps.length)] ?? 1);
  }
  if (next < MELODY_LOW) next = MELODY_LOW + (MELODY_LOW - next);
  if (next > MELODY_HIGH) next = MELODY_HIGH - (next - MELODY_HIGH);
  return Math.min(MELODY_HIGH, Math.max(MELODY_LOW, next));
}

/**
 * The section after `current`. While the drone holds a pedal (`locked`), the score stays on its
 * tonic: it only moves to another section on the same root note, or plays this one again.
 */
export function nextSection(current: number, rand: Rand, locked: boolean): number {
  if (!locked) return pickOther(SECTIONS.length, current, rand);
  const pc = (SECTIONS[current]?.root ?? 0) % 12;
  const same = SECTIONS.flatMap((s, n) => (n !== current && s.root % 12 === pc ? [n] : []));
  if (same.length === 0) return current;
  return rand() < 0.5 ? current : (same[Math.floor(rand() * same.length)] ?? current);
}

export interface ScoreState {
  section: number;
  /** Index into the section's progression. */
  chord: number;
  /** Step within the current chord. */
  step: number;
  /** Completed passes through the progression in this section. */
  passes: number;
  /** Passes to play before moving to another section. */
  passesWanted: number;
  /** Current melody scale degree. */
  melody: number;
  /** Whether the melody plays over the current chord; it rests over some for breathing room. */
  phrase: boolean;
}

export function initialState(rand: Rand): ScoreState {
  return {
    section: Math.floor(rand() * SECTIONS.length),
    chord: 0,
    step: 0,
    passes: 0,
    passesWanted: 1 + Math.floor(rand() * 2),
    melody: MELODY_LOW + 4,
    phrase: false,
  };
}

export interface BassNote {
  readonly midi: number;
  readonly accent: boolean;
}

/** What to start on one step. */
export interface StepPlan {
  readonly section: Section;
  readonly seconds: number;
  /** A new pad chord, lasting `chordSeconds`. */
  readonly pad?: readonly number[];
  readonly chordSeconds: number;
  readonly melody?: number;
  readonly bass?: BassNote;
  /** A soft low thump under high tension. */
  readonly thump?: boolean;
}

export function currentSection(state: ScoreState): Section {
  return SECTIONS[state.section] ?? (SECTIONS[0] as Section);
}

/**
 * Plans the current step and advances the state by one step. `tension` (0..1) brings in a bass
 * pulse that gets busier as it rises, and thins the melody a little. `drone` (0..1) is the weight
 * of the pedal drone: while it sounds the key is held, the melody thins out further, and notes a
 * minor second or tritone above the tonic are moved off it.
 */
export function advance(state: ScoreState, rand: Rand, tension: number, drone = 0): StepPlan {
  const section = currentSection(state);
  const seconds = stepSeconds(section);
  const chordDegree = section.progression[state.chord] ?? 0;
  const step = state.step;
  let pad: number[] | undefined;
  if (step === 0) {
    pad = chordMidi(section, chordDegree);
    state.phrase = rand() < 0.7;
  }

  let melody: number | undefined;
  // No melody on the downbeat of a chord: let the pad speak first.
  if (state.phrase && step >= 2) {
    const chance = (step % 2 === 0 ? 0.3 : 0.1) * (1 - 0.4 * tension) * (1 - 0.7 * drone);
    if (rand() < chance) {
      state.melody = nextMelodyDegree(state.melody, chordDegree, rand);
      melody = degreeToMidi(section, state.melody);
    }
  }

  let bass: BassNote | undefined;
  let thump = false;
  const every = tension >= 0.8 ? 1 : tension >= 0.55 ? 2 : tension >= 0.25 ? 4 : 0;
  if (every > 0 && step % every === 0) {
    // Mostly the chord root, sometimes the fifth on off-beats for movement.
    const fifth = step % 4 !== 0 && rand() < 0.3;
    bass = { midi: degreeToMidi(section, chordDegree + (fifth ? 4 : 0)) - 24, accent: step % 4 === 0 };
    thump = tension >= 0.6 && step % 4 === 0;
  }

  state.step++;
  if (state.step >= STEPS_PER_CHORD) {
    state.step = 0;
    state.chord++;
    if (state.chord >= section.progression.length) {
      state.chord = 0;
      state.passes++;
      if (state.passes >= state.passesWanted) {
        state.section = nextSection(state.section, rand, drone > 0);
        state.passes = 0;
        state.passesWanted = 1 + Math.floor(rand() * 2);
      }
    }
  }

  if (drone > 0) {
    const safe = (midi: number): number => pedalSafe(midi, section.root);
    pad = pad?.map(safe);
    if (melody !== undefined) melody = safe(melody);
    if (bass) bass = { ...bass, midi: safe(bass.midi) };
  }

  return {
    section,
    seconds,
    chordSeconds: seconds * STEPS_PER_CHORD,
    ...(pad ? { pad } : {}),
    ...(melody !== undefined ? { melody } : {}),
    ...(bass ? { bass } : {}),
    ...(thump ? { thump } : {}),
  };
}

/** Seeded generator for tests and reproducible runs (mulberry32). */
export function seeded(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
