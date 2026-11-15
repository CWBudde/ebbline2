// All sound is synthesised with Web Audio; nothing is loaded. The context starts on the first input,
// as browsers require. The signal chain lives in audio/graph.ts and the generative score in
// audio/music.ts; this file maps game events to effects.

import type { Event } from "@ebbline2/engine";
import { createGraph, noise, tone, vary, type Graph, type NoiseOptions, type ToneOptions } from "./audio/graph.ts";
import { Score } from "./audio/music.ts";
import type { Settings } from "./storage.ts";

/** Voices beyond which optional effects are dropped. */
const MAX_VOICES = 56;

export class Sound {
  private graph: Graph | undefined;
  private score: Score | undefined;
  private settings: Settings;
  private readonly last = new Map<string, number>();

  constructor(settings: Settings) {
    this.settings = settings;
  }

  /** Call from a user gesture. */
  unlock(): void {
    if (this.graph) {
      void this.graph.context.resume();
      return;
    }
    let context: AudioContext;
    try {
      context = new AudioContext({ latencyHint: "interactive" });
    } catch {
      return;
    }
    this.graph = createGraph(context);
    this.graph.master.gain.value = 0;
    this.score = new Score(this.graph);
    this.apply(this.settings);
  }

  apply(settings: Settings): void {
    this.settings = settings;
    if (!this.graph || !this.score) return;
    const now = this.graph.context.currentTime;
    this.graph.master.gain.setTargetAtTime(settings.volume, now, 0.05);
    this.score.enable(settings.music);
  }

  /** How threatened the player is, 0..1; the music brings in a pulse as it rises. */
  setTension(value: number, immediate = false): void {
    this.score?.setTension(value, immediate);
  }

  /** Lets a sound through at most once per interval, and not when the mix is crowded. */
  private due(key: string, seconds: number, optional = true): boolean {
    const graph = this.graph;
    if (!graph) return false;
    if (optional && graph.active > MAX_VOICES) return false;
    const now = graph.context.currentTime;
    if (now - (this.last.get(key) ?? -1) < seconds) return false;
    this.last.set(key, now);
    return true;
  }

  /** Start time with a few milliseconds of jitter, so repeated sounds don't phase. */
  private at(delay = 0): number {
    return (this.graph?.context.currentTime ?? 0) + 0.005 + delay + Math.random() * 0.012;
  }

  private tone(options: Omit<ToneOptions, "at"> & { delay?: number; cents?: number }): void {
    if (!this.graph) return;
    const { delay, cents = 25, ...rest } = options;
    const k = vary(Math.random, cents);
    tone(this.graph, {
      ...rest,
      at: this.at(delay),
      f: rest.f * k,
      ...(rest.to !== undefined ? { to: rest.to * k } : {}),
      gain: rest.gain * (0.85 + Math.random() * 0.3),
      pan: rest.pan ?? (Math.random() * 2 - 1) * 0.25,
    });
  }

  private noise(options: Omit<NoiseOptions, "at"> & { delay?: number }): void {
    if (!this.graph) return;
    const { delay, ...rest } = options;
    const k = vary(Math.random, 150);
    noise(this.graph, {
      ...rest,
      at: this.at(delay),
      filter: {
        ...rest.filter,
        f: rest.filter.f * k,
        ...(rest.filter.to !== undefined ? { to: rest.filter.to * k } : {}),
      },
      gain: rest.gain * (0.85 + Math.random() * 0.3),
      pan: rest.pan ?? (Math.random() * 2 - 1) * 0.3,
    });
  }

  click(): void {
    if (!this.due("click", 0.03, false)) return;
    this.tone({ f: 1250, to: 950, type: "triangle", gain: 0.05, decay: 0.045, overtone: 2, cents: 30, pan: 0 });
  }

  deny(): void {
    if (!this.due("deny", 0.15, false)) return;
    const filter = { type: "lowpass", f: 1100, to: 280 } as const;
    this.tone({ f: 150, type: "square", detune: 14, gain: 0.06, decay: 0.12, filter, cents: 10, pan: 0 });
    this.tone({ f: 118, type: "square", detune: 14, gain: 0.05, decay: 0.14, filter, cents: 10, pan: 0, delay: 0.08 });
  }

  play(event: Event): void {
    if (!this.graph) return;
    switch (event.kind) {
      case "placed":
        if (!this.due("placed", 0.05)) break;
        this.tone({ f: 540, to: 430, type: "triangle", gain: 0.08, decay: 0.07, overtone: 3 });
        this.noise({ gain: 0.03, decay: 0.03, filter: { type: "highpass", f: 2500 } });
        break;
      case "built":
        if (!this.due("built", 0.1)) break;
        this.tone({ f: 659, type: "triangle", gain: 0.07, decay: 0.22, overtone: 2, reverb: 0.25, cents: 12 });
        this.tone({ f: 988, type: "sine", gain: 0.06, decay: 0.35, overtone: 3, reverb: 0.3, cents: 12, delay: 0.07 });
        break;
      case "lance":
        if (!this.due("lance", 0.09)) break;
        this.tone({
          f: 1500,
          to: 480,
          type: "sawtooth",
          detune: 18,
          gain: 0.028,
          decay: 0.09,
          filter: { type: "bandpass", f: 3200, to: 900, q: 2 },
          cents: 60,
        });
        this.noise({ gain: 0.012, decay: 0.05, filter: { type: "highpass", f: 4000 } });
        break;
      case "lob":
        if (!this.due("lob", 0.1)) break;
        this.tone({ f: 170, to: 55, type: "sine", gain: 0.13, decay: 0.24, cents: 50 });
        this.noise({ gain: 0.05, decay: 0.1, filter: { type: "lowpass", f: 700 } });
        break;
      case "impact":
        if (!this.due("impact", 0.1)) break;
        this.noise({ gain: 0.16, decay: 0.4, filter: { type: "lowpass", f: 1400, to: 180 }, reverb: 0.3 });
        this.tone({ f: 95, to: 40, type: "sine", gain: 0.12, decay: 0.3, cents: 60 });
        break;
      case "destroyed":
        if (!this.due("destroyed", 0.1, false)) break;
        this.noise({ gain: 0.2, decay: 0.75, filter: { type: "lowpass", f: 1000, to: 140 }, reverb: 0.45 });
        this.tone({
          f: 115,
          to: 36,
          type: "sawtooth",
          detune: 20,
          gain: 0.07,
          decay: 0.5,
          filter: { type: "lowpass", f: 900, to: 120 },
          reverb: 0.3,
        });
        this.tone({ f: 62, to: 30, type: "sine", gain: 0.12, decay: 0.45 });
        break;
      case "dismantled":
        if (!this.due("dismantled", 0.06)) break;
        this.tone({ f: 340, to: 160, type: "triangle", gain: 0.07, decay: 0.12, overtone: 2 });
        this.noise({ gain: 0.03, decay: 0.06, filter: { type: "bandpass", f: 1600, q: 1.5 }, delay: 0.03 });
        break;
      case "pulse":
        if (!this.due("pulse", 0.4)) break;
        this.tone({ f: 70, to: 48, type: "sine", gain: 0.05, attack: 0.04, decay: 0.4, cents: 80 });
        this.noise({ gain: 0.03, attack: 0.03, decay: 0.3, filter: { type: "lowpass", f: 380, to: 160 } });
        break;
      case "spit":
        if (!this.due("spit", 0.15, false)) break;
        // A warning: a bright double blip, then the wet launch.
        this.tone({ f: 880, type: "square", gain: 0.035, decay: 0.1, filter: { type: "lowpass", f: 3000 }, cents: 15 });
        this.tone({
          f: 740,
          type: "square",
          gain: 0.035,
          decay: 0.12,
          filter: { type: "lowpass", f: 3000 },
          cents: 15,
          delay: 0.18,
        });
        this.noise({ gain: 0.05, attack: 0.02, decay: 0.15, filter: { type: "bandpass", f: 900, to: 2400, q: 2 } });
        break;
      case "splash":
      case "burst":
        if (!this.due(event.kind, 0.12)) break;
        this.noise({
          gain: event.kind === "burst" ? 0.18 : 0.15,
          attack: 0.01,
          decay: 0.5,
          filter: { type: "bandpass", f: 900, to: 260, q: 1.4 },
          reverb: 0.3,
        });
        this.tone({ f: event.kind === "burst" ? 150 : 210, to: 70, type: "sine", gain: 0.09, decay: 0.25, cents: 80 });
        break;
      case "intercept":
        if (event.kill) {
          if (!this.due("kill", 0.05, false)) break;
          this.tone({ f: 1250, to: 300, type: "triangle", detune: 12, gain: 0.09, decay: 0.2, reverb: 0.2 });
          this.noise({ gain: 0.04, decay: 0.08, filter: { type: "highpass", f: 3500 } });
        } else if (this.due("intercept", 0.1)) {
          this.tone({ f: 1800, type: "square", gain: 0.03, decay: 0.04, filter: { type: "lowpass", f: 5000 }, cents: 80 });
        }
        break;
      case "graded":
        if (!this.due("graded", 0.3)) break;
        this.noise({ gain: 0.025, attack: 0.02, decay: 0.12, filter: { type: "bandpass", f: 500, q: 2 } });
        break;
      case "capped":
        this.chime([392, 523, 659, 784], 0.09, 0.08);
        break;
      case "won":
        this.score?.duck(4);
        this.chime([523, 659, 784, 1047], 0.14, 0.1, 0.4);
        // A held major chord under the arpeggio.
        for (const f of [262, 330, 392]) {
          this.tone({
            f,
            type: "sawtooth",
            detune: 12,
            gain: 0.025,
            attack: 0.6,
            decay: 2.6,
            filter: { type: "lowpass", f: 1800, to: 500 },
            reverb: 0.5,
            cents: 3,
            delay: 0.4,
          });
        }
        break;
      case "lost":
        this.score?.duck(5);
        [330, 262, 196, 131].forEach((f, n) => {
          this.tone({
            f,
            to: f * 0.94,
            type: "sawtooth",
            detune: 16,
            gain: 0.06,
            decay: 0.7,
            filter: { type: "lowpass", f: 1600, to: 300 },
            reverb: 0.45,
            cents: 4,
            delay: n * 0.22,
          });
        });
        this.tone({ f: 55, type: "sine", gain: 0.08, attack: 0.3, decay: 2.2, delay: 0.66, cents: 0 });
        break;
      default:
        break;
    }
  }

  /** A rising arpeggio of bell tones. */
  private chime(notes: readonly number[], spacing: number, gain: number, delay = 0): void {
    notes.forEach((f, n) => {
      this.tone({
        f,
        type: "triangle",
        overtone: 3,
        gain,
        decay: 0.6,
        reverb: 0.4,
        echo: 0.15,
        cents: 4,
        delay: delay + n * spacing,
        pan: (n / (notes.length - 1) - 0.5) * 0.6,
      });
    });
  }
}
