// The generative ambient score. A lookahead scheduler plans eighth-note steps from theory.ts and
// starts them at exact AudioContext times; the timer only wakes it up, it never sets timing.

import { Drone } from "./drone.ts";
import { noise, tone, vary, type Graph } from "./graph.ts";
import { droneEngaged, droneWeight } from "./pedal.ts";
import { advance, currentSection, initialState, midiToHz, type ScoreState, type StepPlan } from "./theory.ts";

/** How far ahead steps are scheduled, in seconds. */
const LOOKAHEAD = 0.4;
/** How often the scheduler wakes, in milliseconds. */
const WAKE_MS = 90;
/** Music bus level when on. */
const LEVEL = 0.55;
/** Once faded out, the scheduler stops after this long. */
const STOP_AFTER_MS = 5000;

export class Score {
  private readonly graph: Graph;
  private readonly state: ScoreState;
  private readonly padBus: GainNode;
  private readonly padFilter: BiquadFilterNode;
  private readonly lfo: OscillatorNode;
  private nextTime = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private stopTimer: ReturnType<typeof setTimeout> | undefined;
  private enabled = false;
  private target = 0;
  private tension = 0;
  private brightness = 900;
  private readonly drone: Drone;
  /** Whether the threat drone is in; switched with hysteresis in pedal.ts. */
  private droneOn = false;
  /** Its weight, 0..1; the score holds its key and thins out while it is above 0. */
  private droneWeight = 0;

  constructor(graph: Graph) {
    this.graph = graph;
    this.state = initialState(Math.random);
    const { context } = graph;
    // All pad voices share one slowly breathing lowpass.
    this.padFilter = context.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = this.brightness;
    this.padFilter.Q.value = 0.9;
    this.lfo = context.createOscillator();
    this.lfo.frequency.value = 0.045;
    const depth = context.createGain();
    depth.gain.value = 260;
    this.lfo.connect(depth).connect(this.padFilter.frequency);
    this.lfo.start();
    this.padBus = context.createGain();
    this.padBus.gain.value = 0.9;
    this.padFilter.connect(this.padBus);
    this.padBus.connect(graph.music);
    const send = context.createGain();
    send.gain.value = 0.6;
    this.padBus.connect(send).connect(graph.musicReverb);
    this.drone = new Drone(graph, currentSection(this.state).root);
  }

  /** Turns the music on or off with a slow fade. */
  enable(on: boolean): void {
    const { context, music } = this.graph;
    const now = context.currentTime;
    this.enabled = on;
    music.gain.cancelScheduledValues(now);
    music.gain.setValueAtTime(music.gain.value, now);
    music.gain.setTargetAtTime(on ? LEVEL : 0, now, on ? 1.2 : 0.5);
    clearTimeout(this.stopTimer);
    if (on) {
      this.target = LEVEL;
      if (this.timer === undefined) {
        this.nextTime = now + 0.1;
        this.wake();
      }
    } else {
      this.target = 0;
      this.stopTimer = setTimeout(() => {
        if (this.enabled) return;
        clearTimeout(this.timer);
        this.timer = undefined;
      }, STOP_AFTER_MS);
    }
  }

  /** 0 calm .. 1 desperate. Smoothed, so it can be fed raw readings. */
  setTension(value: number, immediate = false): void {
    const clamped = Math.max(0, Math.min(1, value));
    this.tension = immediate ? clamped : this.tension + (clamped - this.tension) * 0.35;
    this.droneOn = droneEngaged(this.droneOn, this.tension);
    this.droneWeight = droneWeight(this.droneOn, this.tension);
    this.drone.set(this.droneWeight);
    this.updateFilter();
  }

  /** Dips the music under a stinger such as winning or losing. */
  duck(seconds: number): void {
    if (!this.enabled) return;
    const { context, music } = this.graph;
    const now = context.currentTime;
    music.gain.cancelScheduledValues(now);
    music.gain.setValueAtTime(music.gain.value, now);
    music.gain.setTargetAtTime(this.target * 0.25, now, 0.1);
    music.gain.setTargetAtTime(this.target, now + seconds, 1.5);
  }

  /** The pads brighten with the tension, then darken and step back as the drone takes over. */
  private updateFilter(): void {
    const now = this.graph.context.currentTime;
    const w = this.droneWeight;
    const cutoff = (this.brightness + this.tension * 900 * (1 - w)) * (1 - 0.45 * w);
    this.padFilter.frequency.setTargetAtTime(cutoff, now, 2);
    this.padBus.gain.setTargetAtTime(0.9 * (1 - 0.4 * w), now, 2);
  }

  private wake(): void {
    const now = this.graph.context.currentTime;
    // After a stall (a hidden tab, a suspended context) rejoin the clock instead of catching up.
    if (this.nextTime < now - 0.2) this.nextTime = now + 0.05;
    while (this.nextTime < now + LOOKAHEAD) {
      const plan = advance(this.state, Math.random, this.tension, this.droneWeight);
      this.render(plan, this.nextTime);
      this.nextTime += plan.seconds;
    }
    this.timer = setTimeout(() => {
      this.wake();
    }, WAKE_MS);
  }

  private render(plan: StepPlan, at: number): void {
    // The drone holds the tonic of whatever is playing; it only has to move when the key does.
    this.drone.retune(plan.section.root, at);
    if (plan.section.brightness !== this.brightness) {
      this.brightness = plan.section.brightness;
      this.updateFilter();
    }
    if (plan.pad) this.pad(plan.pad, at, plan.chordSeconds);
    // Optional layers give way when many effects are sounding.
    const busy = this.graph.active > 40;
    if (plan.melody !== undefined && !busy) this.bell(plan.melody, at);
    if (plan.bass) this.bass(plan.bass.midi, plan.bass.accent, at);
    if (plan.thump && !busy) this.thump(at);
  }

  /** A chord of slow, detuned saw-and-triangle voices that overlap the next chord as they fade. */
  private pad(notes: readonly number[], at: number, seconds: number): void {
    notes.forEach((midi, n) => {
      const f = midiToHz(midi);
      // Stagger the entries a little so the chord blooms rather than starts.
      const start = at + n * 0.12 + Math.random() * 0.08;
      const level = n === 0 ? 0.05 : 0.035;
      tone(this.graph, {
        at: start,
        f,
        type: "sawtooth",
        detune: 9 + Math.random() * 6,
        gain: level,
        attack: 2.2,
        decay: seconds + 1.6,
        bus: this.padFilter,
      });
      tone(this.graph, {
        at: start,
        f: f * 2,
        type: "triangle",
        gain: level * 0.35,
        attack: 3,
        decay: seconds,
        bus: this.padFilter,
        pan: (n % 2 === 0 ? -1 : 1) * 0.3,
      });
    });
  }

  /** A soft FM-ish bell: a sine with a quiet octave overtone, echoed and reverberated. */
  private bell(midi: number, at: number): void {
    const velocity = 0.6 + Math.random() * 0.4;
    tone(this.graph, {
      at: at + Math.random() * 0.02,
      f: midiToHz(midi) * vary(Math.random, 4),
      type: "sine",
      overtone: 3,
      gain: 0.06 * velocity,
      attack: 0.006,
      decay: 1.8 + Math.random() * 0.8,
      pan: (Math.random() * 2 - 1) * 0.5,
      reverb: 0.5,
      echo: 0.35,
      bus: this.graph.music,
    });
  }

  /** A round bass pluck that grows with the tension. */
  private bass(midi: number, accent: boolean, at: number): void {
    const level = (0.05 + 0.07 * this.tension) * (accent ? 1 : 0.7);
    tone(this.graph, {
      at,
      f: midiToHz(midi),
      type: "triangle",
      overtone: 2,
      gain: level,
      attack: 0.012,
      decay: accent ? 0.55 : 0.32,
      filter: { type: "lowpass", f: 700, to: 160, q: 2 },
      bus: this.graph.music,
    });
  }

  /** A muffled heartbeat thump. */
  private thump(at: number): void {
    tone(this.graph, {
      at,
      f: 82,
      to: 42,
      type: "sine",
      gain: 0.07 * this.tension,
      decay: 0.28,
      bus: this.graph.music,
    });
    noise(this.graph, {
      at,
      gain: 0.015 * this.tension,
      decay: 0.08,
      filter: { type: "lowpass", f: 300 },
      bus: this.graph.music,
    });
  }
}
