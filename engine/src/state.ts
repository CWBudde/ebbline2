// The game state: plain data only, so it can be saved and structured-cloned.

import { disc } from "./hex.ts";

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
  | "booster"
  | "tap"
  | "cell"
  | "pump"
  | "lance"
  | "lobber"
  | "baffle"
  | "interceptor"
  | "grader"
  | "cap"
  | "airfield"
  | "spring";

export interface KindDef {
  readonly name: string;
  /** Energy packets needed to build; also the structure's full health. */
  readonly cost: number;
  /** Energy the structure can hold for its own work; 0 if it needs none. */
  readonly store: number;
  /** Working radius in steps; 0 if none. */
  readonly range: number;
  readonly minRange: number;
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
    radius: 1,
    blurb: "Root of the grid. Lose it and the mission is over.",
  },
  pylon: {
    name: "Pylon",
    cost: 3,
    store: 0,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Extends the grid by six tiles and gathers a little energy from the level ground it can see at its own height.",
  },
  trunk: {
    name: "Trunk",
    cost: 12,
    store: 0,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Links to other trunks over fourteen tiles and doubles packet speed.",
  },
  booster: {
    name: "Booster",
    cost: 6,
    store: 0,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Relays packets like a pylon, and every packet it passes on runs a fifth faster from then on. Boosters stack, but each one speeds a packet only once. Every working Booster also makes all packets two percent faster, wherever it stands.",
  },
  tap: {
    name: "Tap",
    cost: 8,
    store: 0,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Draws steady energy from a lode. Only fits on a lode.",
  },
  cell: {
    name: "Cell",
    cost: 10,
    store: 0,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Stores thirty more energy. Each Cell also lets the lander send one more packet at a time, and more still when the bank is nearly full.",
  },
  pump: {
    name: "Pump",
    cost: 12,
    store: 0,
    range: 2,
    minRange: 0,
    radius: 0,
    blurb: "Skims shallow silt nearby and turns it into a little energy.",
  },
  lance: {
    name: "Lance",
    cost: 15,
    store: 4,
    range: 7,
    minRange: 0,
    radius: 0,
    blurb: "Burns silt off one tile at a time. Cannot aim uphill.",
  },
  lobber: {
    name: "Lobber",
    cost: 30,
    store: 6,
    range: 11,
    minRange: 3,
    radius: 0,
    blurb: "Lobs a slow charge at the deepest silt in range.",
  },
  baffle: {
    name: "Baffle",
    cost: 25,
    store: 8,
    range: 4,
    minRange: 0,
    radius: 0,
    blurb: "Projects a field that silt must climb like a two-step wall.",
  },
  interceptor: {
    name: "Interceptor",
    cost: 20,
    store: 6,
    range: 9,
    minRange: 0,
    radius: 0,
    blurb: "Shoots down globs in flight.",
  },
  grader: {
    name: "Grader",
    cost: 20,
    store: 6,
    range: 8,
    minRange: 0,
    radius: 0,
    blurb: "Raises or lowers marked ground, one step at a time.",
  },
  cap: {
    name: "Cap",
    cost: 60,
    store: 0,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Clamps a dry vent while it is built, then seals it for good.",
  },
  airfield: {
    name: "Airfield",
    cost: 70,
    store: 30,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Loads a plane with thirty energy. When it is full, the plane flies to the deepest silt on the map, bombs it and comes back to load again.",
  },
  spring: {
    name: "Spring",
    cost: 60,
    store: 1,
    range: 0,
    minRange: 0,
    radius: 0,
    blurb: "Turns energy into balm, a light blue fluid that runs downhill and cancels silt where the two meet. Build it above the silt, not in it.",
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
  "booster",
  "airfield",
  "spring",
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
  /** Grid cost to the lander, in the time a packet takes from there; Infinity when cut off. */
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

/**
 * A glob in flight. sx, sy and tx, ty are tiles (the spitter's and the target's), not positions; globAt() gives
 * the position in between, along the straight line between the two tile centres.
 */
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

/** A lobber shell in flight. Like a glob, sx, sy and tx, ty are tiles; globAt() gives the position in between. */
export interface Shell {
  id: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  t: number;
  duration: number;
}

/**
 * An airfield's plane in the air. Unlike a shell it flies a course of its own, so it keeps its position: x, y and
 * tx, ty are positions in tile units (see centre()), not tiles. Out to the target it holds `heading`, drops its
 * bombs along a short run over the target, then turns and flies straight back to its airfield.
 */
export interface Plane {
  id: number;
  /** Id of the airfield it belongs to. */
  base: number;
  x: number;
  y: number;
  /** Centre of the target tile, picked at takeoff. */
  tx: number;
  ty: number;
  /** Direction of flight in radians, measured like Math.atan2(dy, dx) in tile units (y grows downwards). */
  heading: number;
  leg: "out" | "back";
  /** Bombs still on board. */
  bombs: number;
  /** Distance left to fly before the next bomb drops, in tile units. */
  next: number;
}

export interface Packet {
  id: number;
  kind: "build" | "energy";
  target: number;
  /** Structure ids from the lander to the target. */
  ids: number[];
  /** Their centre tile indices; the packet runs straight between the centres of these tiles. */
  tiles: number[];
  /** Index of the node the packet last left. */
  seg: number;
  /** Progress along the current segment, 0..1. */
  t: number;
  /** Factor on the packet's speed on every link, from the boosters it has passed; 1 for none. */
  boost: number;
  /** Ids of the boosters that have sped the packet up, so that none does it twice. */
  boosters: number[];
}

export type Objective =
  | { readonly kind: "cap" }
  | { readonly kind: "survive"; readonly ticks: number };

/**
 * The overall shape of a map's terrain. "hills" is plain rolling noise; "basin" sinks the middle of the map below
 * a rim; "mesa" lifts the middle above lowlands; "ridges" folds the land into sharp crests over broad valleys;
 * "channels" cuts narrow, winding troughs between broad highlands; "terraces" flattens it into a few wide steps;
 * "horseshoe" carves a wide U-shaped valley round a high spur that falls gently from the
 * vents at the end of one arm to the lander at the end of the other; "archipelago" raises steep islands of
 * similar size out of a low sea floor and puts the lander on one of middling size; "shoal-bend" turns a widened
 * horseshoe on its side, with the lander on a headland in the north-east and the vents in the south, sets steady
 * islands in its channel and two shoals that rise and sink in turn; "atlantis" raises one great island with a high
 * crown in the middle of a low sea floor, and a few small islets far out round it; "levee" sets the lander in a
 * wide, low basin behind a thin ring wall, with the sea standing outside it up to a few low notches in the wall;
 * "slope" tilts the whole map from a high north edge, where the lander stands, down to a low south edge, with
 * shallow gullies running down it.
 */
export type Landform =
  | "hills"
  | "basin"
  | "mesa"
  | "ridges"
  | "channels"
  | "terraces"
  | "horseshoe"
  | "archipelago"
  | "shoal-bend"
  | "atlantis"
  | "levee"
  | "slope";

/** The colour scheme of the ground. Only the renderer reads it. */
export type Ground = "earth" | "slate" | "sand" | "ash";

/** How one vent differs from the level's usual vent. */
export interface VentTweak {
  /** Factor on the level's vent amount. */
  readonly amount?: number;
  /** Ticks between pulses, instead of the level's period. */
  readonly period?: number;
  /** Seconds before the first pulse, on top of the usual stagger: the vent lies dormant until then. */
  readonly delay?: number;
}

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
    /** Puts the first vent this many to two more steps from the lander, instead of far away like the others. */
    readonly near?: number;
    /** Per-vent changes, nearest vent to the lander first; vents beyond the list are left as they are. */
    readonly each?: readonly VentTweak[];
  };
  readonly spitters: {
    readonly count: number;
    readonly period: number;
    readonly amount: number;
  };
  readonly lodes: number;
  /** Puts the lander on middling ground instead of the heights. */
  readonly lowStart?: boolean;
  /**
   * The lander stands on a plateau that rises and sinks, and waves of rising ground travel outward from it over the
   * whole map; only the ring between the plateau and the first wave stands still.
   */
  readonly movingFloor?: boolean;
  /**
   * The land sinks: every `every` seconds each tile above `floor` goes down a step, an eighth of the map after the
   * other round its middle, so the drop runs round like a clock hand. Graders can raise it again.
   */
  readonly sinking?: { readonly every: number; readonly floor: number };
  /** Shape of the terrain; "hills" when absent. */
  readonly landform?: Landform;
  /** Share of the map that is rock, roughly; 0.18 when absent. */
  readonly rock?: number;
  /** Seconds the vents have already been flowing when the player lands, so silt stands on the map at the start. */
  readonly flood?: number;
  /**
   * Height of a sea that stands on the map at the start: every tile below it is covered in silt up to it, and
   * lodes and spitters go on ground above it.
   */
  readonly sea?: number;
  /** Colour scheme of the ground; "earth" when absent. */
  readonly ground?: Ground;
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

/** Where energy comes from: the lander's own output, pylon harvest, taps on lodes and pumps skimming silt. */
export type Source = "lander" | "pylon" | "tap" | "pump";
export const SOURCES: readonly Source[] = ["lander", "pylon", "tap", "pump"];
/**
 * What energy is spent on: building new structures, repairing damaged ones (the lander mends itself from the
 * bank) and supplying built ones with energy for their work.
 */
export type Purpose = "build" | "repair" | "supply";
export const PURPOSES: readonly Purpose[] = ["build", "repair", "supply"];

/** Income by source and spending by purpose; over the last full second they add up to `rateIn` and `rateOut`. */
export interface Flow {
  /** Energy per second over the last full second. */
  rateIn: Record<Source, number>;
  rateOut: Record<Purpose, number>;
  /** Running sums of the current second. */
  accIn: Record<Source, number>;
  accOut: Record<Purpose, number>;
}

/**
 * The course of the game, for the statistics screen: one value per series and sample, a sample every `every`
 * ticks (see history.ts). Every array has the same length.
 */
export interface History {
  /** Ticks between two samples; doubles each time the series are thinned out. */
  every: number;
  /** The tick of each sample. The last one may fall between the regular ticks: the game's final tick. */
  tick: number[];
  /** Silt on the whole map: the sum of the depth of every tile. */
  silt: number[];
  /** Tiles under silt at least `DRY` deep. */
  flooded: number[];
  energy: number[];
  capacity: number[];
  /** Energy gained and spent over the last full second (`Game.rateIn`, `rateOut`), in energy per second. */
  rateIn: number[];
  rateOut: number[];
  /** `rateIn` split by source and `rateOut` by purpose (`Flow`), in energy per second. */
  inLander: number[];
  inPylon: number[];
  inTap: number[];
  inPump: number[];
  outBuild: number[];
  outRepair: number[];
  outSupply: number[];
  /** Vents not capped. */
  vents: number[];
  /** Finished structures standing, the lander included. */
  structures: number[];
  /** Structures lost to silt so far (`Stats.lost`). */
  lost: number[];
  /** Silt removed by lances, lobbers, pumps, planes and balm so far (`Stats.removed`). */
  removed: number[];
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
  /**
   * Depth of balm per tile: the springs' fluid. It flows like silt over the same surface (ground, baffle field,
   * silt and balm together), cancels silt where the two meet and fades as it stands; it harms nothing.
   */
  balm: Float32Array;
  /** Scratch buffer for the flow step. */
  balmNext: Float32Array;
  lode: Uint8Array;
  /** Grader target height per tile, or -1. */
  mark: Int8Array;
  /** Structure id per tile, or 0. */
  occ: Int32Array;
  /** Extra flow height from baffle fields. */
  baffle: Uint8Array;
  /** 1 where a pylon claims the tile for its harvest, whether or not silt covers it; derived, see harvest.ts. */
  harvest: Uint8Array;
  /** Bumped whenever `harvest` changes, so a renderer can redraw the area only then. */
  harvestRev: number;
  structures: Structure[];
  packets: Packet[];
  shells: Shell[];
  planes: Plane[];
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
  flow: Flow;
  history: History;
}

export type Event =
  | { kind: "placed"; id: number }
  | { kind: "built"; id: number }
  | { kind: "destroyed"; structure: Kind; x: number; y: number }
  | { kind: "dismantled"; x: number; y: number }
  | { kind: "lance"; id: number; x: number; y: number }
  | { kind: "lob"; x: number; y: number }
  | { kind: "impact"; x: number; y: number; radius: number }
  /** An airfield's plane left the ground; x, y is the airfield's tile. */
  | { kind: "takeoff"; id: number; x: number; y: number }
  /** A plane came home to its airfield (`id`, the airfield's id). */
  | { kind: "landed"; id: number }
  | { kind: "pulse"; x: number; y: number }
  /** A spring (`id`) poured a gush of balm onto its tile x, y. */
  | { kind: "gush"; id: number; x: number; y: number }
  | { kind: "burst"; x: number; y: number }
  | { kind: "spit"; x: number; y: number; tx: number; ty: number }
  | { kind: "splash"; x: number; y: number }
  /** x, y is where the glob was hit: a position in tile units (see centre()), not a tile. */
  | { kind: "intercept"; id: number; x: number; y: number; kill: boolean }
  | { kind: "graded"; tile: number }
  | { kind: "floorMoved" }
  | { kind: "capped"; x: number; y: number }
  | { kind: "won" }
  | { kind: "lost" };

export function emptyFlow(): Flow {
  const sources = (): Record<Source, number> => ({ lander: 0, pylon: 0, tap: 0, pump: 0 });
  const purposes = (): Record<Purpose, number> => ({ build: 0, repair: 0, supply: 0 });
  return { rateIn: sources(), rateOut: purposes(), accIn: sources(), accOut: purposes() };
}

export function tileIndex(game: Game, x: number, y: number): number {
  return y * game.w + x;
}

export function inBounds(game: Game, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < game.w && y < game.h;
}

export function find(game: Game, id: number): Structure | undefined {
  return game.structures.find((s) => s.id === id);
}

/**
 * Indices of the tiles a structure of this kind covers when centred on (x, y): the centre tile and, for a
 * radius of 1, the six around it. Tiles off the map are left out.
 */
export function footprint(game: Game, kind: Kind, x: number, y: number): number[] {
  const tiles: number[] = [];
  for (const t of disc(x, y, KINDS[kind].radius)) {
    if (inBounds(game, t.x, t.y)) tiles.push(tileIndex(game, t.x, t.y));
  }
  return tiles;
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
