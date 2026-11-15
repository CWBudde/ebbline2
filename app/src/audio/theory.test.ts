import { describe, expect, it } from "vitest";
import {
  MELODY_HIGH,
  MELODY_LOW,
  MODES,
  SECTIONS,
  STEPS_PER_CHORD,
  advance,
  chordMidi,
  degreeToMidi,
  initialState,
  midiToHz,
  nextMelodyDegree,
  pickOther,
  seeded,
  type Section,
} from "./theory.ts";

const aDorian: Section = { root: 57, mode: "dorian", progression: [0, 6, 3, 0], bpm: 60, brightness: 900 };

/** Pitch classes of a section's scale. */
function scale(section: Section): Set<number> {
  return new Set(MODES[section.mode].map((s) => (section.root + s) % 12));
}

describe("scale degrees", () => {
  it("tunes A4 to 440 Hz", () => {
    expect(midiToHz(69)).toBeCloseTo(440);
    expect(midiToHz(57)).toBeCloseTo(220);
  });

  it("wraps degrees into other octaves", () => {
    expect(degreeToMidi(aDorian, 0)).toBe(57);
    expect(degreeToMidi(aDorian, 5)).toBe(57 + 9); // the raised sixth of dorian
    expect(degreeToMidi(aDorian, 7)).toBe(69);
    expect(degreeToMidi(aDorian, -1)).toBe(55);
  });

  it("voices chords from the mode", () => {
    // A minor seventh, opened up: A E G C.
    expect(chordMidi(aDorian, 0)).toEqual([57, 64, 67, 72]);
    for (const section of SECTIONS) {
      const pcs = scale(section);
      for (const degree of section.progression) {
        for (const note of chordMidi(section, degree)) expect(pcs.has(note % 12)).toBe(true);
      }
    }
  });
});

describe("melody walk", () => {
  it("stays in range and moves", () => {
    const rand = seeded(7);
    let degree = MELODY_LOW + 3;
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      degree = nextMelodyDegree(degree, i % 7, rand);
      expect(degree).toBeGreaterThanOrEqual(MELODY_LOW);
      expect(degree).toBeLessThanOrEqual(MELODY_HIGH);
      expect(Number.isInteger(degree)).toBe(true);
      seen.add(degree);
    }
    expect(seen.size).toBeGreaterThan(6);
  });
});

describe("pickOther", () => {
  it("never repeats the current choice", () => {
    const rand = seeded(3);
    for (let i = 0; i < 200; i++) {
      const n = pickOther(5, 2, rand);
      expect(n).not.toBe(2);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(5);
    }
    expect(pickOther(1, 0, rand)).toBe(0);
  });
});

describe("sequencer", () => {
  it("starts a pad chord every chord and keeps every note in key", () => {
    const rand = seeded(11);
    const state = initialState(rand);
    let pads = 0;
    for (let i = 0; i < STEPS_PER_CHORD * 40; i++) {
      const plan = advance(state, rand, 0.5);
      if (i % STEPS_PER_CHORD === 0) expect(plan.pad).toBeDefined();
      else expect(plan.pad).toBeUndefined();
      if (plan.pad) pads++;
      const pcs = scale(plan.section);
      for (const note of [...(plan.pad ?? []), plan.melody, plan.bass?.midi]) {
        if (note !== undefined) expect(pcs.has(note % 12)).toBe(true);
      }
    }
    expect(pads).toBe(40);
  });

  it("moves between sections over time", () => {
    const rand = seeded(5);
    const state = initialState(rand);
    const sections = new Set<number>();
    // Fifty progressions' worth of steps.
    for (let i = 0; i < STEPS_PER_CHORD * 4 * 50; i++) {
      sections.add(state.section);
      advance(state, rand, 0);
    }
    expect(sections.size).toBeGreaterThanOrEqual(4);
  });

  it("brings in a busier bass as tension rises", () => {
    const count = (tension: number): number => {
      const rand = seeded(9);
      const state = initialState(rand);
      let bass = 0;
      for (let i = 0; i < STEPS_PER_CHORD * 8; i++) if (advance(state, rand, tension).bass) bass++;
      return bass;
    };
    expect(count(0)).toBe(0);
    expect(count(0.3)).toBeGreaterThan(0);
    expect(count(0.6)).toBeGreaterThan(count(0.3));
    expect(count(0.9)).toBeGreaterThan(count(0.6));
  });

  it("plays a sparse melody", () => {
    const rand = seeded(21);
    const state = initialState(rand);
    const steps = STEPS_PER_CHORD * 32;
    let notes = 0;
    for (let i = 0; i < steps; i++) if (advance(state, rand, 0).melody !== undefined) notes++;
    expect(notes).toBeGreaterThan(steps * 0.05);
    expect(notes).toBeLessThan(steps * 0.3);
  });
});
