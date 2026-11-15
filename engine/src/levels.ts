// The campaign, and skirmish levels made from a seed.

import { TICK_HZ, type Kind, type LevelDef } from "./state.ts";

/** Every structure the player can build, in the order the campaign brings them in. */
const EVERYTHING: readonly Kind[] = [
  "pylon",
  "lance",
  "cap",
  "tap",
  "cell",
  "lobber",
  "trunk",
  "pump",
  "baffle",
  "grader",
  "interceptor",
];

/** What the campaign allows up to and including `last`. */
function upTo(last: Kind): readonly Kind[] {
  return EVERYTHING.slice(0, EVERYTHING.indexOf(last) + 1);
}

const NO_SPITTERS = { count: 0, period: 0, amount: 0 } as const;

// Seeds were picked by looking at the maps they make; the numbers were tuned with the scripted player in
// balance.test.ts, so that its winning time grows from mission to mission.
export const CAMPAIGN: readonly LevelDef[] = [
  {
    // A ridge above a long valley with the vent at its bottom. No lodes: the lander's own trickle has to do.
    id: "c1",
    name: "Landfall",
    brief: "One sluggish vent, fifteen tiles east and far below you. Walk the grid down to it, burn it dry and cap it.",
    seed: 131,
    size: 32,
    vents: { count: 1, period: 60, amount: 4, ramp: 0.15 },
    spitters: NO_SPITTERS,
    lodes: 0,
    allowed: upTo("cap"),
    objective: { kind: "cap" },
    hints: [
      "Pylons are the cheap way to extend the grid. Everything must stand within six tiles of a built structure.",
      "Lances burn silt away. Put them on high ground: they cannot aim uphill.",
      "When the vent runs dry between pulses, place a Cap on it and keep it supplied.",
      "The lander makes one energy a second, and there are no lodes here. Do not build more than you need.",
    ],
  },
  {
    // A hill between a wide plain to the north-west and a valley to the south-east, a vent in each.
    id: "c2",
    name: "Two Fronts",
    brief: "Two vents, on opposite sides of your hill. Tap the lodes for energy and bank it for the Caps.",
    seed: 2145,
    size: 40,
    vents: { count: 2, period: 60, amount: 10, ramp: 0.15 },
    spitters: NO_SPITTERS,
    lodes: 6,
    allowed: upTo("cell"),
    objective: { kind: "cap" },
    hints: [
      "Place Taps on the glowing lodes near the lander to earn energy.",
      "The bank holds thirty energy, half a Cap. Each Cell adds thirty more.",
    ],
  },
  {
    // A plateau above a deep basin to the north-east that takes two of the vents.
    id: "c3",
    name: "Sump",
    brief: "Three vents gush in slow, heavy pulses, and the basin below fills deep. Lobbers reach the deep pools.",
    seed: 3161,
    size: 48,
    vents: { count: 3, period: 150, amount: 18, ramp: 0.12 },
    spitters: NO_SPITTERS,
    lodes: 6,
    allowed: upTo("lobber"),
    objective: { kind: "cap" },
    hints: ["Lobbers ignore height but cannot hit anything closer than three tiles."],
  },
  {
    // Open, rockless country with the vents spread to three far edges.
    id: "c4",
    name: "Far Reaches",
    brief: "Three vents in three directions, the nearest twenty-nine tiles out. Trunks carry packets fast over long gaps.",
    seed: 4109,
    size: 64,
    vents: { count: 3, period: 50, amount: 7.5, ramp: 0.16 },
    spitters: NO_SPITTERS,
    lodes: 8,
    allowed: upTo("trunk"),
    objective: { kind: "cap" },
    hints: ["Trunks link to each other over fourteen tiles and double packet speed."],
  },
  {
    // A high mesa with lowlands on every side; the third lode lies far out across them.
    id: "c5",
    name: "Tableland",
    brief: "Four vents ring your mesa, and there are only three lodes. Pumps skim shallow silt for energy.",
    seed: 5064,
    size: 48,
    vents: { count: 4, period: 60, amount: 6, ramp: 0.13 },
    spitters: NO_SPITTERS,
    lodes: 3,
    allowed: upTo("pump"),
    objective: { kind: "cap" },
    hints: ["A Pump only reaches silt two tiles away, so it has to stand at the shore, where the silt can reach it too."],
  },
  {
    // Low ground on the bank of a river valley that runs north to south, with heights to the east.
    id: "c6",
    name: "Floodplain",
    brief: "You came down low, on the bank of a river valley, with four vents around you. Hold out for ten minutes.",
    seed: 6078,
    size: 56,
    vents: { count: 4, period: 60, amount: 13, ramp: 0.2 },
    spitters: NO_SPITTERS,
    lodes: 6,
    lowStart: true,
    allowed: upTo("grader"),
    objective: { kind: "survive", ticks: 10 * 60 * TICK_HZ },
    hints: [
      "A powered Baffle makes silt climb two extra steps on every tile within four tiles of it.",
      "Select Mark, pick a height and paint tiles; a Grader within eight tiles raises or lowers them.",
    ],
  },
  {
    // Both spitters sit to the north-west, so the globs come from one side.
    id: "c7",
    name: "Barrage",
    brief: "Two spitters lob silt at your grid from the north-west. Interceptors shoot the globs down in flight.",
    seed: 7132,
    size: 56,
    vents: { count: 3, period: 60, amount: 10, ramp: 0.14 },
    spitters: { count: 2, period: 540, amount: 14 },
    lodes: 7,
    allowed: upTo("interceptor"),
    objective: { kind: "cap" },
    hints: ["Globs aim at your densest cluster. An Interceptor reaches nine tiles and needs three hits per glob."],
  },
  {
    // A central peak with vents and spitters on every side.
    id: "c8",
    name: "Watershed",
    brief: "Five vents and three spitters all around the peak. Use everything you have.",
    seed: 8360,
    size: 72,
    vents: { count: 5, period: 60, amount: 5, ramp: 0.14 },
    spitters: { count: 3, period: 540, amount: 14 },
    lodes: 9,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: [],
  },
];

/** What a campaign mission shows the player for the first time. */
export interface Introduced {
  /** Structures the mission allows that no earlier mission did, in the order the mission lists them. */
  readonly structures: readonly Kind[];
  /** The first mission with a spitter. */
  readonly spitters: boolean;
  /** The first mission that is won by holding out instead of capping. */
  readonly survive: boolean;
}

/**
 * What is new in a campaign mission, worked out from the missions before it. A level that is not
 * part of the campaign introduces nothing.
 */
export function introduced(levelId: string): Introduced {
  const index = CAMPAIGN.findIndex((l) => l.id === levelId);
  const level = CAMPAIGN[index];
  if (!level) return { structures: [], spitters: false, survive: false };
  const earlier = CAMPAIGN.slice(0, index);
  const known = new Set(earlier.flatMap((l) => l.allowed));
  return {
    structures: level.allowed.filter((kind, i, all) => !known.has(kind) && all.indexOf(kind) === i),
    spitters: level.spitters.count > 0 && earlier.every((l) => l.spitters.count === 0),
    survive: level.objective.kind === "survive" && earlier.every((l) => l.objective.kind !== "survive"),
  };
}

export type MapSize = "small" | "medium" | "large";
export type Difficulty = "easy" | "normal" | "hard";

const SIZES: Record<MapSize, { size: number; vents: number; lodes: number }> = {
  small: { size: 48, vents: 2, lodes: 6 },
  medium: { size: 64, vents: 3, lodes: 8 },
  large: { size: 80, vents: 4, lodes: 10 },
};

const DIFFICULTIES: Record<
  Difficulty,
  { period: number; amount: number; ramp: number; spitters: number }
> = {
  easy: { period: 60, amount: 3.5, ramp: 0.1, spitters: 0 },
  normal: { period: 60, amount: 4.5, ramp: 0.12, spitters: 1 },
  hard: { period: 60, amount: 5.5, ramp: 0.16, spitters: 2 },
};

export function skirmish(
  seed: number,
  mapSize: MapSize,
  difficulty: Difficulty,
): LevelDef {
  const map = SIZES[mapSize];
  const level = DIFFICULTIES[difficulty];
  return {
    id: `s-${seed}-${mapSize}-${difficulty}`,
    name: `Skirmish ${seed}`,
    brief: "Cap every vent.",
    seed,
    size: map.size,
    vents: {
      count: map.vents,
      period: level.period,
      amount: level.amount,
      ramp: level.ramp,
    },
    spitters: { count: level.spitters, period: 840, amount: 10 },
    lodes: map.lodes,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: [],
  };
}
