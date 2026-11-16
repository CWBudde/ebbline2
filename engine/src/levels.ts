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
  "booster",
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

// Seeds were picked by looking at the maps they make. The numbers were tuned with the scripted player in
// balance.test.ts until it only just wins: from c3 on, an eighth to a quarter more silt from the vents beats it,
// and c1 and c2 leave it a little more room. Each mission is hard in its own way: c1 starves you of energy, c2 wakes
// a second, stronger vent behind you, c3 is already flooded deep, c4 is distance against a fast ramp, c5 is many
// fronts round a mesa, c6 is a vent on your doorstep while the clock runs, c7 is a barrage from one side and c8
// is all of it at once. c9 sends a flood round a valley bend to the lander's door while you go for its source.
// c10 starts in a sea that already stands deep, to be burnt back from island to island.
export const CAMPAIGN: readonly LevelDef[] = [
  {
    // A ridge above a long valley with the vent at its bottom, its pool already spreading. No lodes: the lander's
    // own trickle and what pylons gather have to do.
    id: "c1",
    name: "Landfall",
    brief: "One vent, fifteen tiles east and far below you, and its pool is already spreading. Walk the grid down to it, burn it dry and cap it.",
    seed: 131,
    size: 32,
    vents: { count: 1, period: 60, amount: 14, ramp: 0.25 },
    spitters: NO_SPITTERS,
    lodes: 0,
    flood: 60,
    ground: "earth",
    allowed: upTo("cap"),
    objective: { kind: "cap" },
    hints: [
      "Only Pylons extend the grid: everything must stand within six tiles of the lander or a built Pylon.",
      "Lances burn silt away. Put them on high ground: they cannot aim uphill.",
      "When the vent runs dry between pulses, place a Cap on it and keep it supplied.",
      "The lander makes one energy a second, and there are no lodes here. A pylon gathers a little more from the level ground it can see at its own height. Do not build more than you need.",
    ],
  },
  {
    // A stepped hill between a wide plain to the north-west and a trough to the south-east, a vent in each. The
    // far one sleeps for the first half minute, then wakes half as strong again as the near one.
    id: "c2",
    name: "Two Fronts",
    brief: "Two vents, on opposite sides of your hill. Tap the lodes for energy and bank it for the Caps.",
    seed: 2145,
    size: 40,
    vents: { count: 2, period: 60, amount: 11, ramp: 0.2, each: [{}, { amount: 1.5, delay: 30 }] },
    spitters: NO_SPITTERS,
    lodes: 6,
    landform: "terraces",
    ground: "sand",
    allowed: upTo("cell"),
    objective: { kind: "cap" },
    hints: [
      "Place Taps on the glowing lodes near the lander to earn energy.",
      "The bank holds thirty energy, half a Cap. Each Cell adds thirty more.",
      "The far vent lies dormant for the first half minute, dull and with a still ring. When it wakes it is the stronger of the two.",
    ],
  },
  {
    // A rim round a deep basin that takes all three vents, and has been filling for two minutes when you land.
    id: "c3",
    name: "Sump",
    brief: "Three vents gush in slow, heavy pulses, and the basin below fills deep. Lobbers reach the deep pools.",
    seed: 3161,
    size: 48,
    vents: { count: 3, period: 150, amount: 35, ramp: 0.15 },
    spitters: NO_SPITTERS,
    lodes: 6,
    landform: "basin",
    flood: 120,
    ground: "slate",
    allowed: upTo("lobber"),
    objective: { kind: "cap" },
    hints: ["Lobbers ignore height but cannot hit anything closer than three tiles."],
  },
  {
    // Open, rockless country with the vents spread to three far edges: the nearest spits small and often, the
    // furthest rarely but heavily.
    id: "c4",
    name: "Far Reaches",
    brief: "Three vents in three directions, the nearest twenty-nine tiles out. Trunks carry packets fast over long gaps.",
    seed: 4109,
    size: 64,
    vents: {
      count: 3,
      period: 50,
      amount: 9,
      ramp: 0.25,
      each: [{ period: 30, amount: 0.7 }, {}, { period: 120, amount: 2.5 }],
    },
    spitters: NO_SPITTERS,
    lodes: 8,
    ground: "sand",
    allowed: upTo("booster"),
    objective: { kind: "cap" },
    hints: [
      "Trunks link to each other over fourteen tiles and double packet speed.",
      "A Booster relays like a Pylon and speeds up every packet it passes on by a fifth. Packets take the quickest way, so a few Boosters along a long line draw the traffic and get it there sooner.",
    ],
  },
  {
    // A high mesa with lowlands on every side; the third lode lies far out across them.
    id: "c5",
    name: "Tableland",
    brief: "Four vents ring your mesa, and there are only three lodes. Pumps skim shallow silt for energy.",
    seed: 5064,
    size: 48,
    vents: { count: 4, period: 60, amount: 13, ramp: 0.18 },
    spitters: NO_SPITTERS,
    lodes: 3,
    landform: "mesa",
    ground: "earth",
    allowed: upTo("pump"),
    objective: { kind: "cap" },
    hints: ["A Pump only reaches silt two tiles away, so it has to stand at the shore, where the silt can reach it too."],
  },
  {
    // Low ground on the bank of a river valley that runs north to south, with heights to the east. The nearest
    // vent lies in the valley right below the lander; it gives half as much as the others. Long before the ten
    // minutes are up the silt stands higher than the lander all round, so holding out takes a dike: the scripted
    // player raises one with graders and runs pumps on its crest.
    id: "c6",
    name: "Floodplain",
    brief: "You came down low, on the bank of a river valley, with four vents around you and one of them close. Hold out for ten minutes.",
    seed: 6078,
    size: 56,
    vents: { count: 4, period: 60, amount: 26, ramp: 0.2, near: 10, each: [{ amount: 0.5 }] },
    spitters: NO_SPITTERS,
    lodes: 6,
    lowStart: true,
    ground: "slate",
    allowed: upTo("grader"),
    objective: { kind: "survive", ticks: 10 * 60 * TICK_HZ },
    hints: [
      "A powered Baffle makes silt climb two extra steps on every tile within four tiles of it.",
      "Select Mark, pick a height and paint tiles; a Grader within eight tiles raises or lowers them.",
    ],
  },
  {
    // Winding channels carry the silt; all three spitters sit to the south, so the globs come from one side.
    id: "c7",
    name: "Barrage",
    brief: "Three spitters lob silt at your grid from the south. Interceptors shoot the globs down in flight.",
    seed: 7132,
    size: 56,
    vents: { count: 3, period: 60, amount: 9.5, ramp: 0.15 },
    spitters: { count: 3, period: 360, amount: 16 },
    lodes: 7,
    landform: "channels",
    ground: "ash",
    allowed: upTo("interceptor"),
    objective: { kind: "cap" },
    hints: ["Globs aim at your densest cluster. An Interceptor reaches nine tiles and needs three hits per glob."],
  },
  {
    // A central peak with vents and spitters on every side, already flowing. One vent is stronger than the rest,
    // and the furthest wakes only after five minutes.
    id: "c8",
    name: "Watershed",
    brief: "Five vents and three spitters all around the peak. Use everything you have.",
    seed: 8360,
    size: 72,
    vents: {
      count: 5,
      period: 60,
      amount: 8.75,
      ramp: 0.15,
      each: [{}, {}, { amount: 1.6 }, {}, { amount: 1.3, delay: 300 }],
    },
    spitters: { count: 3, period: 420, amount: 16 },
    lodes: 9,
    flood: 60,
    ground: "ash",
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: ["The furthest vent lies dormant for five minutes, dull and with a still ring."],
  },
  {
    // A wide valley bent into a U round a high spur. The vents sit at the head of the east arm; the floor falls
    // all the way round the bend to the end of the west arm, where the lander came down, so everything the vents
    // give ends up at the lander unless it is stopped. The vents have run for a minute and a half when you land:
    // their arm stands deep, the bend is full and the stream reaches the lander about ninety seconds later. The
    // scripted player holds it off with lances by the lander while it crosses the spur and burns down the vents' arm
    // from the rim; a human can as well raise a dike across the arm below the lander.
    id: "c9",
    name: "Horseshoe",
    brief: "Three strong vents at the head of a valley that bends round a ridge and comes back down to you. Their silt is already on its way round. Keep it off the lander and cap the vents.",
    seed: 9001,
    size: 48,
    vents: { count: 3, period: 60, amount: 14, ramp: 0.2 },
    spitters: NO_SPITTERS,
    lodes: 8,
    landform: "horseshoe",
    rock: 0.06,
    flood: 90,
    ground: "earth",
    allowed: upTo("grader"),
    objective: { kind: "cap" },
    hints: [
      "The silt comes round the bend and up the valley to you. Raise a dike across the valley with Graders, or hold it back with Baffles, Pumps and Lances.",
      "The grid reaches over the rock on the ridge. From its high ground, Lances reach down into both arms of the valley.",
    ],
  },
  {
    // Twenty steep islands of much the same size in a sea that stands two to four deep over the floor. The lander
    // is on one of middling size in the south-east; the vents lie on the sea floor to the west and north, and two
    // spitters on far islands keep the globs coming, slowly.
    id: "c10",
    name: "Archipelago",
    brief: "You came down on an island in a sea of silt, and four vents on its floor keep it rising. Hop the grid from island to island, burn the sea back from each vent and cap it.",
    seed: 10017,
    size: 64,
    vents: { count: 4, period: 60, amount: 8.25, ramp: 0.15 },
    spitters: { count: 2, period: 840, amount: 10 },
    lodes: 9,
    landform: "archipelago",
    sea: 4,
    ground: "sand",
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: [
      "The grid reaches six tiles across the sea, and most straits are narrower. Trunks span the wide ones.",
      "The sea is all one: what you burn by a vent flows back from everywhere else. Lances on the island tops look down on all of it.",
    ],
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
  easy: { period: 60, amount: 6, ramp: 0.15, spitters: 0 },
  normal: { period: 60, amount: 8, ramp: 0.18, spitters: 1 },
  hard: { period: 60, amount: 9.5, ramp: 0.2, spitters: 2 },
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
