// The game state: plain data only, so it can be saved and structured-cloned.

export const TICK_HZ = 30;
/** Silt flows on every FLOW_EVERY-th tick. */
export const FLOW_EVERY = 6;
/** Terrain height of impassable rock. */
export const ROCK = -1;
export const MAX_HEIGHT = 9;
/** Silt below this depth does not block building or hurt structures. */
export const DRY = 0.05;
/** A vent tile shallower than this can take a cap. */
export const CAP_DRY = 0.3;
export const LINK_RANGE = 6;
export const TRUNK_RANGE = 14;

export type Kind =
  | "lander"
  | "pylon"
  | "trunk"
  | "tap"
  | "cell"
  | "pump"
  | "lance"
  | "lobber"
  | "baffle"
  | "interceptor"
  | "grader"
  | "cap";

export interface KindDef {
  readonly name: string;
  /** Energy packets needed to build; also the structure's full health. */
  readonly cost: number;
  /** Energy the structure can hold for its own work; 0 if it needs none. */
  readonly store: number;
  /** Working radius in tiles; 0 if none. */
  readonly range: number;
  readonly minRange: number;
  /** Footprint edge length in tiles. */
  readonly size: 1 | 3;
  /** Footprint: the structure covers every tile within this many steps of its centre tile. */
  readonly radius: 0 | 1;
  readonly blurb: string;
}

export const KINDS: Readonly<Record<Kind, KindDef>> = {
  lander: {
    name: "Lander",
    cost: 40,
    store: 0,
    range: 0,
    minRange: 0,
    size: 3,
    radius: 1,
    blurb: "Root of the grid. Lose it and the mission is over.",
  },
  pylon: {
    name: "Pylon",
    cost: 3,
    store: 0,
    range: 0,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Extends the grid by six tiles.",
  },
  trunk: {
    name: "Trunk",
    cost: 12,
    store: 0,
    range: 0,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Links to other trunks over fourteen tiles and doubles packet speed.",
  },
  tap: {
    name: "Tap",
    cost: 8,
    store: 0,
    range: 0,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Draws steady energy from a lode. Only fits on a lode.",
  },
  cell: {
    name: "Cell",
    cost: 10,
    store: 0,
    range: 0,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Stores thirty more energy.",
  },
  pump: {
    name: "Pump",
    cost: 12,
    store: 0,
    range: 2,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Skims shallow silt nearby and turns it into a little energy.",
  },
  lance: {
    name: "Lance",
    cost: 15,
    store: 4,
    range: 7,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Burns silt off one tile at a time. Cannot aim uphill.",
  },
  lobber: {
    name: "Lobber",
    cost: 30,
    store: 6,
    range: 11,
    minRange: 3,
    size: 1,
    radius: 0,
    blurb: "Lobs a slow charge at the deepest silt in range.",
  },
  baffle: {
    name: "Baffle",
    cost: 25,
    store: 8,
    range: 4,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Projects a field that silt must climb like a two-step wall.",
  },
  interceptor: {
    name: "Interceptor",
    cost: 20,
    store: 6,
    range: 9,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Shoots down globs in flight.",
  },
  grader: {
    name: "Grader",
    cost: 20,
    store: 6,
    range: 8,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Raises or lowers marked ground, one step at a time.",
  },
  cap: {
    name: "Cap",
    cost: 60,
    store: 0,
    range: 0,
    minRange: 0,
    size: 1,
    radius: 0,
    blurb: "Clamps a dry vent while it is built, then seals it for good.",
  },
};

/** Kinds the player can place, in build-bar order. */
export const BUILDABLE: readonly Kind[] = [
  "pylon",
  "tap",
  "lance",
  "cell",
  "lobber",
  "pump",
  "trunk",
  "baffle",
  "interceptor",
  "grader",
  "cap",
];

export interface Structure {
  id: number;
  kind: Kind;
  /** Centre tile. */
  x: number;
  y: number;
  /** Rises with build packets up to the cost; silt wears it down. */
  health: number;
  built: boolean;
  active: boolean;
  energy: number;
  /** Packets under way to this structure. */
  pendingBuild: number;
  pendingEnergy: number;
  cooldown: number;
  progress: number;
  /** Tile index the structure last worked on, or -1. */
  target: number;
  /** Grid cost to the lander; Infinity when cut off. */
  dist: number;
  /** Id of the next structure toward the lander, or 0. */
  parent: number;
}

export interface Vent {
  x: number;
  y: number;
  /** Ticks between pulses. */
  period: number;
  /** Silt per pulse at mission start. */
  amount: number;
  /** Growth of the amount per minute, as a fraction. */
  ramp: number;
  timer: number;
  capped: boolean;
  /** Silt held back by a cap under construction; bursts out if the cap is lost. */
  pressure: number;
}

export interface Spitter {
  x: number;
  y: number;
  period: number;
  amount: number;
  timer: number;
}

export interface Glob {
  id: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  t: number;
  duration: number;
  amount: number;
  hp: number;
}

export interface Shell {
  id: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  t: number;
  duration: number;
}

export interface Packet {
  id: number;
  kind: "build" | "energy";
  target: number;
  /** Structure ids from the lander to the target. */
  ids: number[];
  /** Their centre tile indices. */
  tiles: number[];
  /** Index of the node the packet last left. */
  seg: number;
  /** Progress along the current segment, 0..1. */
  t: number;
}

export type Objective =
  | { readonly kind: "cap" }
  | { readonly kind: "survive"; readonly ticks: number };

export interface LevelDef {
  readonly id: string;
  readonly name: string;
  readonly brief: string;
  readonly seed: number;
  readonly size: number;
  readonly vents: {
    readonly count: number;
    readonly period: number;
    readonly amount: number;
    readonly ramp: number;
  };
  readonly spitters: {
    readonly count: number;
    readonly period: number;
    readonly amount: number;
  };
  readonly lodes: number;
  /** Puts the lander on middling ground instead of the heights. */
  readonly lowStart?: boolean;
  readonly allowed: readonly Kind[];
  readonly objective: Objective;
  readonly hints: readonly string[];
}

export interface Stats {
  spent: number;
  built: number;
  lost: number;
  removed: number;
}

export type Phase = "playing" | "won" | "lost";

export interface Game {
  level: LevelDef;
  w: number;
  h: number;
  tick: number;
  rng: number;
  phase: Phase;
  height: Int8Array;
  silt: Float32Array;
  /** Scratch buffer for the flow step. */
  siltNext: Float32Array;
  lode: Uint8Array;
  /** Grader target height per tile, or -1. */
  mark: Int8Array;
  /** Structure id per tile, or 0. */
  occ: Int32Array;
  /** Extra flow height from baffle fields. */
  baffle: Uint8Array;
  structures: Structure[];
  packets: Packet[];
  shells: Shell[];
  globs: Glob[];
  vents: Vent[];
  spitters: Spitter[];
  nextId: number;
  energy: number;
  capacity: number;
  landerId: number;
  /** Pairs of structure ids, for drawing. */
  links: number[];
  gridDirty: boolean;
  /** Round-robin position of the packet dispatcher. */
  cursor: number;
  dispatchWait: number;
  stats: Stats;
  /** Energy gained and spent over the last full second. */
  rateIn: number;
  rateOut: number;
  accIn: number;
  accOut: number;
}

export type Event =
  | { kind: "placed"; id: number }
  | { kind: "built"; id: number }
  | { kind: "destroyed"; structure: Kind; x: number; y: number }
  | { kind: "dismantled"; x: number; y: number }
  | { kind: "lance"; id: number; x: number; y: number }
  | { kind: "lob"; x: number; y: number }
  | { kind: "impact"; x: number; y: number; radius: number }
  | { kind: "pulse"; x: number; y: number }
  | { kind: "burst"; x: number; y: number }
  | { kind: "spit"; x: number; y: number; tx: number; ty: number }
  | { kind: "splash"; x: number; y: number }
  | { kind: "intercept"; id: number; x: number; y: number; kill: boolean }
  | { kind: "graded"; tile: number }
  | { kind: "capped"; x: number; y: number }
  | { kind: "won" }
  | { kind: "lost" };

export function tileIndex(game: Game, x: number, y: number): number {
  return y * game.w + x;
}

export function inBounds(game: Game, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < game.w && y < game.h;
}

export function find(game: Game, id: number): Structure | undefined {
  return game.structures.find((s) => s.id === id);
}

/** The structure standing on a tile, if any. */
export function structureAt(
  game: Game,
  x: number,
  y: number,
): Structure | undefined {
  if (!inBounds(game, x, y)) return undefined;
  const id = game.occ[tileIndex(game, x, y)] ?? 0;
  return id === 0 ? undefined : find(game, id);
}

export function ventAt(game: Game, x: number, y: number): Vent | undefined {
  return game.vents.find((v) => v.x === x && v.y === y);
}

/** Whole seconds played. */
export function seconds(game: Game): number {
  return Math.floor(game.tick / TICK_HZ);
}
