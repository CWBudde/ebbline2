// What the scripted player knows when it thinks: the game and everything it derives from it once per move. All of
// it is read from the game and none of it changes while the bot decides.

import { linkLength, relays } from "../../grid.ts";
import { harvestIncome } from "../../harvest.ts";
import { tileOf, type Tile } from "../../hex.ts";
import { LANDER_INCOME, TAP_INCOME } from "../../packets.ts";
import { densest } from "../../spitters.ts";
import { LANCE, LOBBER, SPRING } from "../../weapons.ts";
import { KINDS, MAX_HEIGHT, TICK_HZ, type Game, type Kind, type Structure } from "../../state.ts";
import { dike, DIKE, steps } from "./sites.ts";

/** Energy per second a lance or lobber burns while it fires without pause. */
const LANCE_UPKEEP = (LANCE.cost * TICK_HZ) / LANCE.every;
export const LOBBER_UPKEEP = (LOBBER.cost * TICK_HZ) / LOBBER.every;
/** Energy per second a spring burns: it fills its store and pours it out as often as it may, silt or not. */
export const SPRING_UPKEEP = (KINDS.spring.store * TICK_HZ) / SPRING.every;

export interface View {
  game: Game;
  /** Whether the level lets the player build this kind. */
  allowed: (kind: Kind) => boolean;
  all: Structure[];
  /** How many structures of a kind stand or are planned. */
  count: (kind: Kind) => number;
  /** How many structures of a kind lie within r steps of p. */
  near: (kind: Kind, p: Tile, r: number) => number;
  onGrid: Structure[];
  /** The relays on the grid; it reaches on only from them, so they are its front. */
  nodes: Structure[];
  /** The relay on the grid nearest to p. */
  closest: (p: Tile) => Structure | undefined;
  /** What the weapons burn when they fire without pause, against what comes in. */
  income: number;
  /** Energy per second the weapons that found something to fire at last time burn, and the springs. */
  upkeep: number;
  /** Whether a structure is on the grid or waits for a relay that is still unfinished. */
  joined: (s: Structure) => boolean;
  /** Structures that wait to be finished and are not cut off. */
  backlog: number;
  home: Structure | undefined;
  /** Indices of the dike round the lander, when holding out and a dike can be raised. */
  ring: number[] | undefined;
  /** Whether a weapon here stands safe: anywhere without a dike, else inside it or on its finished crest. */
  behind: (q: Tile) => boolean;
  /** The densest cluster of structures against globs. */
  hub: Structure | undefined;
  /** How many interceptors cover the hub. */
  cover: number;
  /** The tiles of the dike that are not yet at the top height. */
  low: number[];
  /** Tiles of lodes that nothing stands on, in index order. */
  lodes: Tile[];
}

/** Builds the view of a game. */
export function view(game: Game): View {
  const allowed = (kind: Kind): boolean => game.level.allowed.includes(kind);
  const all = game.structures;
  const count = (kind: Kind): number => all.filter((s) => s.kind === kind).length;
  const near = (kind: Kind, p: Tile, r: number): number =>
    all.filter((s) => s.kind === kind && steps(s, p) <= r).length;
  const onGrid = all.filter((s) => Number.isFinite(s.dist));
  // The grid reaches on only from its relays, so they are its front.
  const nodes = onGrid.filter((s) => relays(s.kind));
  const closest = (p: Tile): Structure | undefined => {
    let best: Structure | undefined;
    for (const c of nodes) {
      if (!best || steps(c, p) < steps(best, p)) best = c;
    }
    return best;
  };
  // What the weapons burn when they fire without pause, against what comes in.
  const income =
    LANDER_INCOME +
    all.filter((s) => s.kind === "tap" && s.built).length * TAP_INCOME +
    harvestIncome(game);
  // Only weapons that found something to fire at last time burn energy; a spring pours whatever lies below it.
  const firing = (kind: Kind): number => all.filter((s) => s.kind === kind && s.built && s.target >= 0).length;
  const springs = all.filter((s) => s.kind === "spring" && s.built).length;
  const upkeep = firing("lance") * LANCE_UPKEEP + firing("lobber") * LOBBER_UPKEEP + springs * SPRING_UPKEEP;
  // A structure placed by a relay that is still unfinished waits for it: it is not on the grid yet, nor cut off.
  const joined = (s: Structure): boolean =>
    Number.isFinite(s.dist) || nodes.some((r) => !r.built && linkLength(r, s) > 0);
  const backlog = all.filter((s) => !s.built && s.kind !== "cap" && joined(s)).length;

  const home = all.find((s) => s.kind === "lander");
  // Holding out, the bot digs in behind a dike, where it can raise one.
  const ring = home && game.level.objective.kind === "survive" && allowed("grader") ? dike(game, home) : undefined;
  const behind = (q: Tile): boolean => {
    if (!ring || !home) return true;
    const d = steps(q, home);
    return d < DIKE || (d === DIKE && (game.height[q.y * game.w + q.x] ?? 0) >= MAX_HEIGHT);
  };
  const hub = allowed("interceptor") && game.spitters.length > 0 ? densest(game) : undefined;
  const cover = hub ? near("interceptor", hub, 6) : 2;
  const low = ring?.filter((i) => (game.height[i] ?? 0) < MAX_HEIGHT) ?? [];
  const lodes: Tile[] = [];
  for (let i = 0; i < game.lode.length; i++) {
    if (game.lode[i] === 1 && game.occ[i] === 0) lodes.push(tileOf(game.w, i));
  }

  return { game, allowed, all, count, near, onGrid, nodes, closest, income, upkeep, joined, backlog, home, ring, behind, hub, cover, low, lodes };
}
