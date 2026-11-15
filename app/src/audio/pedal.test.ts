import { describe, expect, it } from "vitest";
import {
  DRONE_FLOOR,
  DRONE_OFF,
  DRONE_ON,
  droneEngaged,
  droneMidi,
  droneMix,
  droneWeight,
  pedalSafe,
} from "./pedal.ts";
import { MODES, SECTIONS, STEPS_PER_CHORD, advance, initialState, midiToHz, nextSection, seeded } from "./theory.ts";

describe("drone hysteresis", () => {
  it("comes in above DRONE_ON and only leaves below DRONE_OFF", () => {
    expect(DRONE_OFF).toBeLessThan(DRONE_ON);
    expect(droneEngaged(false, 0)).toBe(false);
    expect(droneEngaged(false, DRONE_ON - 0.01)).toBe(false);
    expect(droneEngaged(false, DRONE_ON)).toBe(true);
    expect(droneEngaged(true, DRONE_OFF + 0.01)).toBe(true);
    expect(droneEngaged(true, DRONE_OFF - 0.01)).toBe(false);
  });

  it("does not flap when the tension hovers around the threshold", () => {
    let on = false;
    let changes = 0;
    for (let i = 0; i < 200; i++) {
      const next = droneEngaged(on, DRONE_ON + Math.sin(i) * 0.05);
      if (next !== on) changes++;
      on = next;
    }
    expect(changes).toBe(1);
  });
});

describe("drone weight", () => {
  it("is silent when disengaged and grows with tension", () => {
    expect(droneWeight(false, 1)).toBe(0);
    expect(droneWeight(true, 0)).toBe(DRONE_FLOOR);
    let prev = 0;
    for (let t = DRONE_OFF; t <= 1.0001; t += 0.05) {
      const w = droneWeight(true, t);
      expect(w).toBeGreaterThanOrEqual(prev);
      expect(w).toBeLessThanOrEqual(1);
      prev = w;
    }
    expect(droneWeight(true, 1)).toBeCloseTo(1);
  });

  it("opens the filter and adds voices as the weight rises", () => {
    const silent = droneMix(0);
    const low = droneMix(DRONE_FLOOR);
    const high = droneMix(1);
    expect(silent.gain).toBe(0);
    expect(low.gain).toBeGreaterThan(0);
    expect(high.gain).toBeGreaterThan(low.gain);
    expect(high.cutoff).toBeGreaterThan(low.cutoff);
    expect(high.q).toBeGreaterThan(low.q);
    expect(low.thick).toBe(0);
    expect(high.thick).toBeGreaterThan(0);
    expect(high.sub).toBeGreaterThan(low.sub);
  });
});

describe("drone root", () => {
  it("is the section's tonic in the 41–78 Hz octave", () => {
    for (const section of SECTIONS) {
      const midi = droneMidi(section.root);
      expect(midi % 12).toBe(section.root % 12);
      expect(midiToHz(midi)).toBeGreaterThanOrEqual(41);
      expect(midiToHz(midi)).toBeLessThan(78);
    }
    expect(droneMidi(57)).toBe(33); // A1, 55 Hz, as the old drone
  });

  it("moves notes off the minor second and the tritone", () => {
    expect(pedalSafe(53, 52)).toBe(52); // F over E -> E
    expect(pedalSafe(59, 53)).toBe(60); // B over F -> C
    expect(pedalSafe(64, 52)).toBe(64);
    expect(pedalSafe(55, 52)).toBe(55);
  });
});

describe("score under the drone", () => {
  it("holds its tonic while the drone sounds", () => {
    const rand = seeded(13);
    for (let current = 0; current < SECTIONS.length; current++) {
      for (let i = 0; i < 50; i++) {
        const next = nextSection(current, rand, true);
        expect((SECTIONS[next]?.root ?? -1) % 12).toBe((SECTIONS[current]?.root ?? 0) % 12);
      }
    }
    const state = initialState(rand);
    const root = SECTIONS[state.section]?.root ?? 0;
    for (let i = 0; i < STEPS_PER_CHORD * 4 * 20; i++) {
      const plan = advance(state, rand, 0.8, 0.8);
      expect(plan.section.root % 12).toBe(root % 12);
    }
  });

  it("keeps every note in key and off the b2 and tritone of the pedal", () => {
    for (let s = 0; s < SECTIONS.length; s++) {
      const rand = seeded(100 + s);
      const state = { ...initialState(rand), section: s };
      for (let i = 0; i < STEPS_PER_CHORD * 8; i++) {
        const plan = advance(state, rand, 0.7, 0.6);
        const pcs = new Set(MODES[plan.section.mode].map((x) => (plan.section.root + x) % 12));
        for (const note of [...(plan.pad ?? []), plan.melody, plan.bass?.midi]) {
          if (note === undefined) continue;
          expect(pcs.has(note % 12)).toBe(true);
          const interval = (((note - plan.section.root) % 12) + 12) % 12;
          expect(interval).not.toBe(1);
          expect(interval).not.toBe(6);
        }
      }
    }
  });

  it("thins the melody as the drone takes over", () => {
    const count = (drone: number): number => {
      const rand = seeded(21);
      const state = initialState(rand);
      let notes = 0;
      for (let i = 0; i < STEPS_PER_CHORD * 32; i++) if (advance(state, rand, 0.5, drone).melody !== undefined) notes++;
      return notes;
    };
    expect(count(1)).toBeLessThan(count(0) * 0.6);
  });
});
