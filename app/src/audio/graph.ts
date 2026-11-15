// The shared signal chain and a small voice toolkit. Every voice cleans up after itself: its
// source stops on a schedule and `onended` disconnects all of its nodes.
//
//   sfx voices ──► sfx bus ─────────────┐
//     └ sends ──► reverb, echo ─────────┤
//   music voices ──► music fader ───────┼──► compressor ──► master (volume) ──► destination
//     └ sends ──► music reverb, echo ──┘ (return through the music fader)

export type Rand = () => number;

export interface Graph {
  readonly context: AudioContext;
  /** Volume, after the limiter. */
  readonly master: GainNode;
  /** Everything feeds this; it keeps stacked events from clipping. */
  readonly mix: AudioNode;
  readonly sfx: GainNode;
  /** The music fader: music voices and the music's own effect returns all pass through it. */
  readonly music: GainNode;
  /** Input of the shared reverb. */
  readonly reverb: GainNode;
  /** Input of the shared tempo-free echo. */
  readonly echo: GainNode;
  /** Reverb input for music voices; it returns through the music fader. */
  readonly musicReverb: GainNode;
  /** Echo input for music voices; it returns through the music fader. */
  readonly musicEcho: GainNode;
  /** One second of white noise, reused by every noise burst. */
  readonly noise: AudioBuffer;
  /** Voices sounding now; new optional sounds are skipped when there are too many. */
  active: number;
}

export function createGraph(context: AudioContext): Graph {
  const master = context.createGain();
  master.connect(context.destination);

  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -12;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  limiter.connect(master);

  const sfx = context.createGain();
  sfx.connect(limiter);
  const music = context.createGain();
  music.gain.value = 0;
  music.connect(limiter);

  const space = impulse(context, 2.6);
  const { reverb, echo } = effects(context, space, limiter);
  // The music has its own returns into the music fader, so muting or ducking it also takes its tails.
  const { reverb: musicReverb, echo: musicEcho } = effects(context, space, music);

  const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  return { context, master, mix: limiter, sfx, music, reverb, echo, musicReverb, musicEcho, noise, active: 0 };
}

/** A reverb and an echo returning into `out`; the echo's repeats also feed the reverb. */
function effects(context: AudioContext, space: AudioBuffer, out: AudioNode): { reverb: GainNode; echo: GainNode } {
  const reverb = context.createGain();
  const convolver = context.createConvolver();
  convolver.buffer = space;
  const wet = context.createGain();
  wet.gain.value = 0.55;
  reverb.connect(convolver).connect(wet).connect(out);

  // A dark echo: each repeat is filtered a little more.
  const echo = context.createGain();
  const delay = context.createDelay(2);
  delay.delayTime.value = 0.43;
  const feedback = context.createGain();
  feedback.gain.value = 0.38;
  const tone = context.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2200;
  echo.connect(delay).connect(tone).connect(feedback).connect(delay);
  const echoOut = context.createGain();
  echoOut.gain.value = 0.5;
  tone.connect(echoOut).connect(out);
  tone.connect(reverb);
  return { reverb, echo };
}

/** A stereo impulse response: decaying noise that darkens as it fades, like a large cave. */
function impulse(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.ceil(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let low = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // One-pole lowpass whose coefficient falls over time, so the tail loses its highs.
      const k = 0.9 - 0.75 * t;
      low += k * (Math.random() * 2 - 1 - low);
      // A short pre-delay, then an exponential decay.
      const pre = i < context.sampleRate * 0.012 ? 0 : 1;
      data[i] = low * pre * (1 - t) ** 2.6;
    }
  }
  return buffer;
}

/** A random pitch factor within ±cents. */
export function vary(rand: Rand, cents: number): number {
  return 2 ** (((rand() * 2 - 1) * cents) / 1200);
}

export interface Filter {
  readonly type: BiquadFilterType;
  readonly f: number;
  /** Sweeps the cutoff to this over the voice's length. */
  readonly to?: number;
  readonly q?: number;
}

export interface VoiceOptions {
  /** Start time in context seconds. */
  readonly at: number;
  readonly gain: number;
  readonly attack?: number;
  /** Time from the peak to silence. */
  readonly decay: number;
  readonly filter?: Filter;
  /** Send level to the reverb. */
  readonly reverb?: number;
  /** Send level to the echo. */
  readonly echo?: number;
  readonly pan?: number;
  /** Bus to play on; the sfx bus by default. */
  readonly bus?: AudioNode;
}

export interface ToneOptions extends VoiceOptions {
  readonly f: number;
  /** Glides the pitch to this over the decay. */
  readonly to?: number;
  readonly type?: OscillatorType;
  /** Adds a second oscillator detuned by this many cents, for width. */
  readonly detune?: number;
  /** Adds a quiet oscillator at this multiple of the pitch. */
  readonly overtone?: number;
}

export interface NoiseOptions extends VoiceOptions {
  readonly filter: Filter;
}

/** Shapes a source through an optional filter, an envelope, a panner and the sends. */
function chain(
  graph: Graph,
  options: VoiceOptions,
  sources: AudioScheduledSourceNode[],
  inputs: AudioNode[],
  offset = 0,
): void {
  const { context } = graph;
  const { at, gain, decay } = options;
  const attack = options.attack ?? 0.004;
  const end = at + attack + decay;
  const nodes: AudioNode[] = [...sources, ...inputs];

  let head: AudioNode;
  const amp = context.createGain();
  nodes.push(amp);
  if (options.filter) {
    const filter = context.createBiquadFilter();
    filter.type = options.filter.type;
    filter.frequency.setValueAtTime(options.filter.f, at);
    if (options.filter.to !== undefined) filter.frequency.exponentialRampToValueAtTime(options.filter.to, end);
    filter.Q.value = options.filter.q ?? 0.7;
    filter.connect(amp);
    nodes.push(filter);
    head = filter;
  } else {
    head = amp;
  }
  for (const input of inputs) input.connect(head);

  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), at + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);

  let out: AudioNode = amp;
  if (options.pan) {
    const panner = context.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, options.pan));
    amp.connect(panner);
    nodes.push(panner);
    out = panner;
  }
  out.connect(options.bus ?? graph.sfx);
  const music = options.bus === graph.music;
  for (const [level, target] of [
    [options.reverb, music ? graph.musicReverb : graph.reverb],
    [options.echo, music ? graph.musicEcho : graph.echo],
  ] as const) {
    if (!level) continue;
    const send = context.createGain();
    send.gain.value = level;
    out.connect(send).connect(target);
    nodes.push(send);
  }

  graph.active++;
  let pending = sources.length;
  for (const source of sources) {
    source.onended = () => {
      if (--pending > 0) return;
      graph.active--;
      for (const node of nodes) node.disconnect();
    };
    if (offset > 0 && source instanceof AudioBufferSourceNode) source.start(at, offset);
    else source.start(at);
    source.stop(end + 0.02);
  }
}

export function tone(graph: Graph, options: ToneOptions): void {
  const { context } = graph;
  const { at, f } = options;
  const end = at + (options.attack ?? 0.004) + options.decay;
  const sources: OscillatorNode[] = [];
  const inputs: AudioNode[] = [];
  const layer = (frequency: number, cents: number, level: number, type: OscillatorType): void => {
    const osc = context.createOscillator();
    osc.type = type;
    osc.detune.value = cents;
    osc.frequency.setValueAtTime(frequency, at);
    if (options.to !== undefined) {
      osc.frequency.exponentialRampToValueAtTime((options.to / f) * frequency, end);
    }
    sources.push(osc);
    if (level === 1) {
      inputs.push(osc);
    } else {
      const g = context.createGain();
      g.gain.value = level;
      osc.connect(g);
      inputs.push(g);
    }
  };
  const type = options.type ?? "triangle";
  if (options.detune) {
    layer(f, -options.detune / 2, 0.7, type);
    layer(f, options.detune / 2, 0.7, type);
  } else {
    layer(f, 0, 1, type);
  }
  if (options.overtone) layer(f * options.overtone, 0, 0.25, "sine");
  chain(graph, options, sources, inputs);
}

export function noise(graph: Graph, options: NoiseOptions): void {
  const source = graph.context.createBufferSource();
  source.buffer = graph.noise;
  source.loop = true;
  // Start at a random point in the shared buffer and at a slightly different rate, so bursts differ.
  source.playbackRate.value = 0.9 + Math.random() * 0.2;
  chain(graph, options, [source], [source], Math.random() * graph.noise.duration * 0.9);
}
