// The campaign, and skirmish levels made from a seed.

import { TICK_HZ, type Kind, type LevelDef } from "./state.ts";

const BASIC: readonly Kind[] = ["pylon", "tap", "lance", "cap"];
const EVERYTHING: readonly Kind[] = [
  ...BASIC,
  "cell",
  "lobber",
  "pump",
  "trunk",
  "interceptor",
  "baffle",
  "grader",
];

export const CAMPAIGN: readonly LevelDef[] = [
  {
    id: "c1",
    name: "First Light",
    brief: "Two sluggish vents. Tap the lodes, walk the grid downhill and cap them.",
    seed: 1101,
    size: 40,
    vents: { count: 2, period: 60, amount: 4.5, ramp: 0.12 },
    spitters: { count: 0, period: 0, amount: 0 },
    lodes: 5,
    allowed: BASIC,
    objective: { kind: "cap" },
    hints: [
      "Place Taps on the glowing lodes near the lander to earn energy.",
      "Pylons are the cheap way to extend the grid. Everything must stand within six tiles of a built structure.",
      "Lances burn silt away. Put them on high ground: they cannot aim uphill.",
      "When the vent runs dry between pulses, place a Cap on it and keep it supplied.",
    ],
  },
  {
    id: "c2",
    name: "Reservoir",
    brief: "Three vents. Cells bank energy for the push; Lobbers reach deep pools.",
    seed: 2207,
    size: 48,
    vents: { count: 3, period: 45, amount: 6.5, ramp: 0.15 },
    spitters: { count: 0, period: 0, amount: 0 },
    lodes: 6,
    allowed: [...BASIC, "cell", "lobber"],
    objective: { kind: "cap" },
    hints: ["Lobbers ignore height but cannot hit anything closer than three tiles."],
  },
  {
    id: "c3",
    name: "Skimmers",
    brief: "Lodes are scarce here. Pumps turn the shallows into energy, at a risk.",
    seed: 3313,
    size: 48,
    vents: { count: 3, period: 55, amount: 7, ramp: 0.15 },
    spitters: { count: 0, period: 0, amount: 0 },
    lodes: 3,
    allowed: [...BASIC, "cell", "lobber", "pump"],
    objective: { kind: "cap" },
    hints: ["A Pump works only on silt within two tiles, so it lives on the front line."],
  },
  {
    id: "c4",
    name: "Long Haul",
    brief: "Three vents, all far away. Trunks carry packets fast over long gaps.",
    seed: 4421,
    size: 64,
    vents: { count: 3, period: 40, amount: 8.5, ramp: 0.15 },
    spitters: { count: 0, period: 0, amount: 0 },
    lodes: 7,
    allowed: [...BASIC, "cell", "lobber", "pump", "trunk"],
    objective: { kind: "cap" },
    hints: ["Trunks link to each other over fourteen tiles and double packet speed."],
  },
  {
    id: "c5",
    name: "Incoming",
    brief: "A spitter has found you. Watch for the landing marker and shoot the globs down.",
    seed: 5531,
    size: 56,
    vents: { count: 3, period: 55, amount: 8.5, ramp: 0.15 },
    spitters: { count: 1, period: 660, amount: 14 },
    lodes: 7,
    allowed: [...BASIC, "cell", "lobber", "pump", "trunk", "interceptor"],
    objective: { kind: "cap" },
    hints: ["Globs aim at your densest cluster. Interceptors need three hits per glob."],
  },
  {
    id: "c6",
    name: "Breakwater",
    brief: "You are down in the basin and the vents are out of reach. Hold out for ten minutes.",
    seed: 6641,
    size: 56,
    vents: { count: 4, period: 60, amount: 14, ramp: 0.22 },
    spitters: { count: 0, period: 0, amount: 0 },
    lodes: 7,
    lowStart: true,
    allowed: [...BASIC, "cell", "lobber", "pump", "trunk", "interceptor", "baffle"],
    objective: { kind: "survive", ticks: 10 * 60 * TICK_HZ },
    hints: ["A powered Baffle makes silt climb two extra steps: a dam across a valley."],
  },
  {
    id: "c7",
    name: "Earthworks",
    brief: "Five vents and broken ground. Graders raise dykes and cut ramps.",
    seed: 7753,
    size: 64,
    vents: { count: 5, period: 60, amount: 6.5, ramp: 0.14 },
    spitters: { count: 1, period: 780, amount: 11 },
    lodes: 8,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: ["Select Mark, pick a height and paint tiles; a Grader in range does the work."],
  },
  {
    id: "c8",
    name: "Ebbline",
    brief: "Six vents, three spitters, everything you have. Turn the tide.",
    seed: 8867,
    size: 80,
    vents: { count: 6, period: 60, amount: 5, ramp: 0.15 },
    spitters: { count: 3, period: 720, amount: 12 },
    lodes: 10,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: [],
  },
  // Act two: nothing new to build, only harder ground.
  {
    id: "c9",
    name: "Crossfire",
    brief: "Three spitters circle a small basin. Spread out so no single glob can break you.",
    seed: 9173,
    size: 56,
    vents: { count: 3, period: 60, amount: 8, ramp: 0.15 },
    spitters: { count: 3, period: 660, amount: 14 },
    lodes: 5,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: ["Globs aim at your densest cluster, so a sprawling grid spreads the damage."],
  },
  {
    id: "c10",
    name: "Dry Country",
    brief: "Few lodes and five hungry vents. Make every packet count.",
    seed: 9281,
    size: 56,
    vents: { count: 5, period: 60, amount: 6.3, ramp: 0.13 },
    spitters: { count: 0, period: 0, amount: 0 },
    lodes: 5,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: ["When the lodes run out, Pumps on the front line pay for the push."],
  },
  {
    id: "c11",
    name: "Hailstorm",
    brief: "Two spitters fire fast and often. Cover the grid before you push.",
    seed: 9601,
    size: 64,
    vents: { count: 4, period: 55, amount: 5.5, ramp: 0.13 },
    spitters: { count: 2, period: 540, amount: 12 },
    lodes: 8,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: [],
  },
  {
    id: "c12",
    name: "Undertow",
    brief: "Four vents, a spitter and no high ground. Hold out for fifteen minutes.",
    seed: 9391,
    size: 64,
    vents: { count: 4, period: 60, amount: 11, ramp: 0.16 },
    spitters: { count: 1, period: 600, amount: 13 },
    lodes: 8,
    lowStart: true,
    allowed: EVERYTHING,
    objective: { kind: "survive", ticks: 15 * 60 * TICK_HZ },
    hints: ["Find the valleys that lead to the lander and dam each one with a Baffle."],
  },
  {
    id: "c13",
    name: "Delta",
    brief: "Five vents spread across a wide delta. Trunks and Cells keep a long front supplied.",
    seed: 9629,
    size: 72,
    vents: { count: 5, period: 55, amount: 7, ramp: 0.13 },
    spitters: { count: 3, period: 780, amount: 13 },
    lodes: 8,
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: [],
  },
  {
    id: "c14",
    name: "Spring Tide",
    brief: "The highest tide yet: four vents and three spitters. Finish what you started.",
    seed: 9533,
    size: 80,
    vents: { count: 4, period: 60, amount: 7, ramp: 0.13 },
    spitters: { count: 3, period: 720, amount: 14 },
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
