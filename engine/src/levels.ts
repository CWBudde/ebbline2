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
  "airfield",
  "spring",
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
// c10 starts in a sea that already stands deep, to be burnt back from island to island. In c11 the ground itself
// moves: waves of it roll outward from the lander and turn the silt this way and that. c12 sends a flood round a
// bend again, now through a channel of islands where two shoals rise and sink. In c13 the land you stand on sinks
// into a deep sea, and the vents have to be capped before the sea closes over the lander. In c14 a thin levee holds a
// brim-full sea off a wide, low basin, and the sea spills in where the levee is lowest. c15 brings the Spring: a sea
// floods the foot of a long slope and climbs it, and balm poured down the slope cancels it.
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
    allowed: upTo("interceptor"),
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
    vents: { count: 4, period: 60, amount: 9.4, ramp: 0.15 },
    spitters: { count: 2, period: 840, amount: 10 },
    lodes: 9,
    landform: "archipelago",
    sea: 4,
    ground: "sand",
    allowed: upTo("airfield"),
    objective: { kind: "cap" },
    hints: [
      "The grid reaches six tiles across the sea, and most straits are narrower. Trunks span the wide ones.",
      "The sea is all one: what you burn by a vent flows back from everywhere else. Lances on the island tops look down on all of it.",
      "An Airfield's plane reaches the whole map: each time it is loaded it bombs the deepest part of the sea.",
    ],
  },
  {
    // Hills with the lander on their heights, a vent ten tiles away and two more beyond. Every eight seconds the
    // plateau under the lander and waves of ground round it rise or sink a step; the waves travel outward and lift
    // the silt on them, so it runs off their crests into the troughs behind. Only the ring between the plateau and
    // the first wave stands still, and it is all the graders can work: raised, it is a dike round the lander.
    id: "c11",
    name: "Shifting Terraces",
    brief: "The floor rises in terraces around your landing site, sending silt down different slopes as it moves. Use the steady ring near the lander to stage your push and cap the vents.",
    seed: 11017,
    size: 48,
    vents: { count: 3, period: 60, amount: 12.65, ramp: 0.15, near: 10 },
    spitters: { count: 2, period: 600, amount: 10 },
    lodes: 8,
    movingFloor: true,
    ground: "slate",
    allowed: upTo("airfield"),
    objective: { kind: "cap" },
    hints: [
      "The landing plateau rises as one piece. Graders can work on the steady ring just outside it.",
      "Watch which way the silt runs after each shift before building on the outer terraces.",
    ],
  },
  {
    // The horseshoe of c9 turned on its side and widened, with steady islands in its channel. The lander stands on a
    // headland at the end of the north arm, the vents at the head of the south arm, and the flood has run for a
    // minute and a half. Two shoals in the channel rise and sink in turn and send the stream round the islands by
    // different ways. The islands carry the grid and the lances across.
    id: "c12",
    name: "Drifting Shoals",
    brief: "Silt is already moving around the bend toward your headland. Extend the grid across the islands and cap the vents upstream.",
    seed: 12017,
    size: 48,
    vents: { count: 3, period: 60, amount: 14.5, ramp: 0.2 },
    spitters: { count: 1, period: 840, amount: 5 },
    lodes: 9,
    landform: "shoal-bend",
    rock: 0.02,
    flood: 90,
    ground: "sand",
    allowed: upTo("airfield"),
    objective: { kind: "cap" },
    hints: [
      "The headland and island tops are steady ground for relays and weapons.",
      "Two shoals rise and sink at different times. Watch which channels the silt takes as they shift.",
    ],
  },
  {
    // One great island in a sea four deep, its crown at the top height and its shore a step above the sea; four
    // small islets lie far out, and two spitters on the high ground. Every eight seconds an eighth of the land goes
    // down a step, the drop running round the island like a clock hand, so the whole island sinks a step every 64
    // seconds and the shore goes under first; the sea reaches the lander after about four minutes. The vents lie on
    // the sea floor round it.
    id: "c13",
    name: "Atlantis",
    brief: "You came down on the crown of a great island, and the island is going under. Four vents on the sea floor keep the sea rising while the land sinks. Cap them before the silt closes over your lander.",
    seed: 13017,
    size: 56,
    vents: { count: 4, period: 60, amount: 14, ramp: 0.15 },
    spitters: { count: 2, period: 840, amount: 8 },
    lodes: 9,
    landform: "atlantis",
    rock: 0.04,
    sea: 4,
    sinking: { every: 64, floor: 2 },
    ground: "slate",
    allowed: upTo("airfield"),
    objective: { kind: "cap" },
    hints: [
      "The island sinks a step at a time, an eighth of it after the other all the way round. The shore goes under first, the crown last.",
      "Graders can raise sinking ground again, and a raised rim holds the sea off for a while. It goes on sinking with the rest.",
      "What you build low will stand in silt soon. Put lances and relays on high ground, and push out to the vents early.",
    ],
  },
  {
    // A wide basin a step or three high, the lander in its middle, ringed by a levee two tiles thick whose crest
    // stands one to three steps above a sea six deep. At three notches the levee is level with the sea, so as soon
    // as the vents raise it the sea spills into the basin. The vents lie on the sea floor outside, and spitters on
    // skerries beyond the levee.
    id: "c14",
    name: "Levee",
    brief: "You came down in a wide, low basin. A thin levee holds back a sea of silt filled to the brim, and the four vents outside keep it rising. Where the levee is lowest it already spills over. Hold the wall and cap the vents beyond it.",
    seed: 14017,
    size: 56,
    vents: { count: 4, period: 60, amount: 9, ramp: 0.15 },
    spitters: { count: 2, period: 840, amount: 8 },
    lodes: 9,
    landform: "levee",
    rock: 0.03,
    sea: 6,
    ground: "earth",
    allowed: upTo("airfield"),
    objective: { kind: "cap" },
    hints: [
      "The levee is the high ground here: lances on its crest look down on the sea outside and on the basin inside.",
      "Three notches in the levee stand level with the sea. Whatever the vents add spills through them into the basin. Graders can raise them.",
      "The basin fills from the notches toward the lander. Burn back what comes through before it spreads.",
    ],
  },
  {
    // A long slope from the top height at the north edge down to the floor at the south edge, with four shallow
    // gullies winding down it. A sea six deep covers three fifths of it and reaches up the gullies; the vents
    // lie on its floor by the south edge, and the lander came down at the top. Balm poured into the gullies' heads
    // runs down them into the sea.
    id: "c15",
    name: "Hillside",
    brief: "You came down near the top of a long slope. Below you, a wide sea of silt has flooded the lower land and is climbing toward the lander. Springs make balm, which runs downhill and cancels silt where it meets it. Build them on the slope, let the balm run into the sea, and cap the vents at the bottom.",
    seed: 15017,
    size: 56,
    vents: { count: 3, period: 60, amount: 20, ramp: 0.15 },
    spitters: { count: 1, period: 840, amount: 8 },
    lodes: 9,
    landform: "slope",
    rock: 0.03,
    sea: 6,
    ground: "earth",
    allowed: EVERYTHING,
    objective: { kind: "cap" },
    hints: [
      "Balm flows like silt. A Spring just above the shore pours it straight into the sea; one in a hollow only fills the hollow.",
      "The gullies carry balm down the slope in streams. Put Springs at their heads.",
      "Balm fades when it stands still. Keep the Springs running and push the shore down the slope until the vents are dry enough to cap.",
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
