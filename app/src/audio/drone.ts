// The threat drone: the original title-screen pad (sawtooths on root, fifth and octave under a
// slowly sweeping lowpass), brought back as a pedal tone that rises out of the score when the silt
// gets close. pedal.ts decides when and how heavy; this file only turns that into Web Audio.

import type { Graph } from "./graph.ts";
import { droneMix, droneMidi } from "./pedal.ts";
import { midiToHz } from "./theory.ts";

interface Voice {
  readonly osc: OscillatorNode;
  /** Multiple of the fundamental. */
  readonly ratio: number;
}

/** Below this level the drone is inaudible, so it can jump to a new root instead of gliding. */
const SILENT = 0.004;

export class Drone {
  private readonly graph: Graph;
  private readonly bus: GainNode;
  private readonly filter: BiquadFilterNode;
  private readonly depth: GainNode;
  private readonly thick: GainNode;
  private readonly sub: GainNode;
  private readonly voices: Voice[] = [];
  private started = false;
  private midi: number;
  private weight = 0;

  constructor(graph: Graph, root: number) {
    this.graph = graph;
    this.midi = droneMidi(root);
    const { context } = graph;
    this.bus = context.createGain();
    this.bus.gain.value = 0;
    this.bus.connect(graph.music);
    const send = context.createGain();
    send.gain.value = 0.25;
    this.bus.connect(send).connect(graph.musicReverb);

    const mix = droneMix(0);
    this.filter = context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = mix.cutoff;
    this.filter.Q.value = mix.q;
    this.filter.connect(this.bus);
    this.depth = context.createGain();
    this.depth.gain.value = mix.sweep;
    this.thick = context.createGain();
    this.thick.gain.value = 0;
    this.thick.connect(this.filter);
    // The sub octave is a pure sine; it skips the filter.
    this.sub = context.createGain();
    this.sub.gain.value = 0;
    this.sub.connect(this.bus);
  }

  /** Sets how heavy the drone is, 0..1. Rises as a slow swell and fades a little slower. */
  set(weight: number): void {
    if (weight > 0) this.start();
    if (!this.started) return;
    const now = this.graph.context.currentTime;
    const mix = droneMix(weight);
    const rising = weight > this.weight;
    this.weight = weight;
    ramp(this.bus.gain, mix.gain, now, rising ? 6 : 8);
    ramp(this.filter.frequency, mix.cutoff, now, 6);
    ramp(this.filter.Q, mix.q, now, 6);
    ramp(this.depth.gain, mix.sweep, now, 6);
    ramp(this.thick.gain, mix.thick, now, 6);
    ramp(this.sub.gain, mix.sub, now, 6);
  }

  /** Holds the tonic of `root` (any octave) from `at`; glides there if the drone is audible. */
  retune(root: number, at: number): void {
    const midi = droneMidi(root);
    if (midi === this.midi) return;
    this.midi = midi;
    if (!this.started) return;
    const f = midiToHz(midi);
    const silent = this.bus.gain.value < SILENT;
    for (const voice of this.voices) {
      const param = voice.osc.frequency;
      param.cancelScheduledValues(at);
      if (silent) param.setValueAtTime(f * voice.ratio, at);
      else param.setTargetAtTime(f * voice.ratio, at, 1.2);
    }
  }

  /** Builds the oscillators the first time the drone is needed; they run from then on. */
  private start(): void {
    if (this.started) return;
    this.started = true;
    const { context } = this.graph;
    const f = midiToHz(this.midi);
    const lfo = context.createOscillator();
    lfo.frequency.value = 0.05;
    lfo.connect(this.depth).connect(this.filter.frequency);
    lfo.start();
    // The old drone: root, a fifth a hair sharp and an octave a little sharp, so it beats slowly.
    const voice = (ratio: number, cents: number, type: OscillatorType, out: AudioNode): void => {
      const osc = context.createOscillator();
      osc.type = type;
      osc.frequency.value = f * ratio;
      osc.detune.value = cents;
      osc.connect(out);
      osc.start();
      this.voices.push({ osc, ratio });
    };
    voice(1, 0, "sawtooth", this.filter);
    voice(1.5, 2, "sawtooth", this.filter);
    voice(2, 6, "sawtooth", this.filter);
    // Under more pressure: two wide voices around the root, and the sub octave.
    voice(1, -11, "sawtooth", this.thick);
    voice(1, 13, "sawtooth", this.thick);
    voice(0.5, 0, "sine", this.sub);
  }
}

/** Eases a parameter to `value`, about 95 % of the way there after `seconds`, from wherever it is now. */
function ramp(param: AudioParam, value: number, now: number, seconds: number): void {
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.setTargetAtTime(value, now, seconds / 3);
}
