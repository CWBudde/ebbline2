// The scripted player's decisions, one phase each, in the order of urgency. A phase returns the commands to act
// on, `[]` to stop thinking for this turn, or undefined to leave the decision to the next phase.

import type { Command } from "../../commands.ts";
import { span, tileOf, within, type Tile } from "../../hex.ts";
import { harvestPreview } from "../../harvest.ts";
import { TAP_INCOME } from "../../packets.ts";
import { placeError, WEAR } from "../../structures.ts";
import { AIRFIELD, LOBBER, SPRING } from "../../weapons.ts";
import { CAP_DRY, DRY, KINDS, LINK_RANGE, MAX_HEIGHT, TICK_HZ } from "../../state.ts";
import {
  aimable,
  crestPump,
  deepArea,
  deepest,
  DIKE,
  fits,
  gap,
  harvestSite,
  marked,
  heading,
  order,
  overlook,
  nearest,
  PUMP_WET,
  pumpSite,
  reaches,
  runoff,
  siltAbove,
  siltAround,
  site,
  steps,
  toward,
  walk,
  want,
  wetNear,
} from "./sites.ts";
import { LOBBER_UPKEEP, SPRING_UPKEEP, type View } from "./view.ts";

export type Phase = (v: View) => Command[] | undefined;

/** Graders at work at once, on the dike or on gaps in a rim. */
const GRADERS = 2;

/** Pumps the bot puts by standing silt at first; one more joins every minute. */
const PUMPS = 2;

/** Seconds a level's vents have flowed before landing for its silt to count as standing, like a sea. */
const STANDING_FLOOD = 90;

/** Springs the bot keeps pouring at first; one more joins every minute, up to SPRINGS_MOST. */
const SPRINGS = 2;
const SPRINGS_MOST = 8;
/** Steps balm may run downhill from a spring before it has to reach silt. */
const SPRING_REACH = 6;
/**
 * Silt that has to stand within SPRING_POOL_REACH steps of where the balm meets it before a spring is worth its
 * cost and upkeep: a gush's worth of standing silt, not a film that the next lance shot clears.
 */
const SPRING_POOL = 30;
const SPRING_POOL_REACH = 4;
/**
 * A spring keeps pouring while this much silt is left within SPRING_KEEP steps of it, which takes in the pool it was
 * put down for. Its own balm clears the silt just in front of it, which soon comes back; only when the silt round
 * it is gone for good is it given up.
 */
const SPRING_LEFT = 5;
const SPRING_KEEP = 10;
/** Seconds between two looks for a new spring's site. */
const SPRING_LOOK = 5;
/**
 * Height a new spring has to stand above the silt's surface where its balm meets it, so that silt rising there does
 * not drown it before it is built.
 */
const SPRING_DROP = 1;
/** Share of a spring's balm that reaches the silt; the rest fades on the way down. */
const SPRING_REACHES = 0.5;
/**
 * Whether a spring cancels more silt per energy than a lobber burns: both serve silt the lances cannot aim at, and
 * a spring that does less than a lobber for its upkeep is not worth its far higher cost.
 */
const SPRINGS_PAY = (SPRING.amount / KINDS.spring.store) * SPRING_REACHES > lobberYield();

/** Silt one energy of lobber shots takes: each tile of the blast loses less the further it lies from the centre. */
function lobberYield(): number {
  let share = 1;
  for (let d = 1; d <= LOBBER.radius; d++) share += 6 * d * (1 - d / (LOBBER.radius + 1));
  return (LOBBER.removes * share) / LOBBER.cost;
}

/** Steps from the front within which lances count as its own. */
const FRONT = 7;
/** Most lances the push keeps by the front, however long it takes. */
const WAVE_MOST = 40;
/** Idle lances at the front beyond half of them, before the push calls it stalled. */
const STALL_SLACK = 2;
/** Length of the route from the lander, in steps, beyond which the push walks the grid on with boosters. */
const BOOST_FROM = 20;
/** Tiles a pylon on the walk would claim below which it gathers too little to beat a booster's speed. */
const BOOST_HARVEST = 8;
/** Seconds between two sorties that the spare income has to pay for before an airfield goes down. */
const SORTIE = 30;
/**
 * Share of the bank that has to be full before the bot lays down an airfield: it costs most of a full bank, and
 * early on that energy does more as weapons and harvest.
 */
const AIRFIELD_BANK = 0.9;
/** Shares of the bank above which the airfield is switched on, and below which it is switched off again. */
const AIRFIELD_HIGH = 0.6;
const AIRFIELD_LOW = 0.25;
/** Silt the deepest area out of reach has to hold for a sortie to be worth it: a few lobber blasts' worth. */
const AIRFIELD_WORTH = 60;
/** Seconds between two looks for silt out of reach that calls for an airfield. */
const AIRFIELD_LOOK = 5;
/** Steps from the lander within which the airfield goes, and how far from silt it has to stand. */
const AIRFIELD_NEAR = 6;
const AIRFIELD_DRY = 3;
/** Share of the bank above which the bot starts something new while earlier work is still on its way. */
const PIPELINE_BANK = 0.9;
/** Tiles a harvest pylon has to claim when the bank is well filled and nothing else waits for it. */
const SPARE_HARVEST = 5;
/** Silt a lobber has to have in reach to be worth putting down. */
const LOBBER_WORTH = 2;

/** Steps from the lander within which weapons are its guard and never given up for being idle. */
const IDLE_HOME = 8;
/** Steps beyond a weapon's range that have to be dry before it counts as idle for good. */
const IDLE_MARGIN = 3;
/** Steps beyond a weapon's range within which an open vent keeps it standing. */
const IDLE_VENT = 6;
/** Share of the bank below which idle weapons are taken down: above it, most of the refund would run over. */
const IDLE_BANK = 0.8;

/**
 * 0. Give up structures the grid no longer reaches, taps drowned too deep to pay for their mending, pylons in silt
 * that nothing hangs on, and weapons left idle for good.
 */
export const giveUp: Phase = (v) => {
  const { game, all } = v;
  const stranded = all.find((s) => !v.joined(s) && s.kind !== "lander" && game.tick > 30);
  if (stranded && !game.gridDirty) {
    return [{ kind: "dismantle", id: stranded.id }];
  }

  // A tap standing so deep in silt that mending it costs more than it brings in is given up; the lode is tapped
  // again once it runs dry.
  const sunk = all.find(
    (s) => s.kind === "tap" && s.built && (game.silt[s.y * game.w + s.x] ?? 0) * WEAR * TICK_HZ > TAP_INCOME,
  );
  if (sunk) return [{ kind: "dismantle", id: sunk.id }];

  // A pylon standing in silt asks for a packet to mend every scratch, which costs far more than the little it
  // gathers; one that no structure's packets pass through is given up, unless it holds the grid by an open vent.
  const drowned = all.find(
    (s) =>
      s.kind === "pylon" &&
      s.built &&
      (game.silt[s.y * game.w + s.x] ?? 0) >= DRY &&
      !all.some((o) => o.parent === s.id) &&
      !game.vents.some((x) => !x.capped && steps(s, x) <= LINK_RANGE),
  );
  if (drowned) return [{ kind: "dismantle", id: drowned.id }];

  // A lance or lobber left behind once the silt round it is gone and no open vent is near stands idle for good;
  // taking it down returns half its cost to the push. The lander's guard stays, and so does every weapon while the
  // bot only has to hold out.
  const { home } = v;
  if (game.level.objective.kind !== "survive" && game.energy < game.capacity * IDLE_BANK) {
    const idle = all.find(
      (s) =>
        (s.kind === "lance" || s.kind === "lobber") &&
        s.built &&
        s.target < 0 &&
        (!home || steps(s, home) > IDLE_HOME) &&
        !wetNear(game, s, KINDS[s.kind].range + IDLE_MARGIN) &&
        !game.vents.some((x) => !x.capped && steps(s, x) <= KINDS[s.kind].range + IDLE_VENT),
    );
    if (idle) return [{ kind: "dismantle", id: idle.id }];
  }
  return undefined;
};

/**
 * 1. Cap a vent as soon as it and the ring around it can take one: an unfinished cap clamps the vent, so from
 * then on the pool only shrinks, but silt flowing back over the cap would wear it away.
 */
export const capVents: Phase = (v) => {
  const { game } = v;
  for (const vent of game.vents) {
    if (vent.capped || placeError(game, "cap", vent.x, vent.y) !== null || !reaches(game, "cap", vent.x, vent.y)) {
      continue;
    }
    if (deepest(game, vent, 1) < CAP_DRY * 0.6 && siltAround(game, vent, 2) < 2) return order("cap", vent);
  }
  return undefined;
};

// 2. Emergencies come before saving up: placing costs nothing, and silt that lands by the lander, from a glob
// or a flood, wears everything there down and eats the energy in repairs, so waiting only makes it worse.

/** Cover the densest cluster against globs with a first interceptor, if none stands by it yet. */
export const interceptFirst: Phase = (v) => {
  const { game, hub, cover, backlog } = v;
  if (hub && cover === 0 && backlog < 3) {
    const move = want(game, "interceptor", hub, 4, nearest(game, hub));
    if (move) return move;
  }
  return undefined;
};

/**
 * Landed below a sea held off by higher ground, whatever spills over runs down to the lander: silt closing in
 * calls for lances round it, the more the longer it keeps coming. Where the land sinks, pushing to the vents
 * does better.
 */
export const guardLander: Phase = (v) => {
  const { game, home, backlog } = v;
  const guard = !home ? 0 : wetNear(game, home, 4) ? 3 : 0;
  const below =
    home !== undefined &&
    game.level.sinking === undefined &&
    (game.height[home.y * game.w + home.x] ?? 0) < (game.level.sea ?? 0);
  const siege = home && below && wetNear(game, home, 8) ? Math.min(8, 2 + Math.floor(game.tick / (60 * TICK_HZ))) : 0;
  if (home && v.near("lance", home, 6) < Math.max(guard, siege) && backlog < 3) {
    const move = want(game, "lance", home, 6, (q) => (v.behind(q) ? overlook(game, q) - steps(q, home) : -Infinity));
    if (move) return move;
  }
  return undefined;
};

/** Energy in the bank before a grader is ordered: less than its cost, which a bank without cells cannot hold. */
const GRADER_BANK = 20;

/** Marking the dike costs nothing, so it comes first; the graders go back once it stands to its full height. */
export const dikeMarks: Phase = (v) => {
  const { game, all, ring, low } = v;
  if (ring) {
    const unmarked = low.filter((i) => (game.mark[i] ?? -1) < 0 && game.occ[i] === 0);
    if (unmarked.length > 0) return [{ kind: "mark", tiles: unmarked, height: MAX_HEIGHT }];
    const grader = all.find((s) => s.kind === "grader");
    if (low.length === 0 && grader) return [{ kind: "dismantle", id: grader.id }];
  }
  return undefined;
};

/**
 * Where the lander lies below standing silt held off by higher ground, the lowest gap in that ground is marked to be
 * raised above the silt's surface, one gap after another while the silt stands near their top; graders by the gaps
 * raise them and are given up once nothing marked is left in their reach.
 */
export const gapMarks: Phase = (v) => {
  const { game, all, home, ring } = v;
  if (ring || !home || !v.allowed("grader")) return undefined;
  const low = gap(game, home);
  if (low) return [{ kind: "mark", tiles: low.tiles, height: low.height }];
  const idle = all.find((s) => s.kind === "grader" && s.built && !marked(game, s, KINDS.grader.range));
  if (idle) return [{ kind: "dismantle", id: idle.id }];
  return undefined;
};

/** Saves up while work waits to be finished or the bank is nearly empty. */
export const gate: Phase = (v) => {
  if (v.backlog >= 3 || v.game.energy < 3) return [];
  return undefined;
};

/** Graders stand well inside the dike, by the lander, where they reach all of it. */
export const graders: Phase = (v) => {
  const { game, home, low, backlog } = v;
  if (home && low.length > 0 && v.count("grader") < GRADERS && game.energy >= GRADER_BANK && backlog === 0) {
    const move = want(game, "grader", home, DIKE - 2, (q, i) => -steps(q, home) * 0.1 + (game.height[i] ?? 0) * 0.01);
    if (move) return move;
  }
  return undefined;
};

/** A grader by every marked gap no grader reaches yet, as close to it as the grid allows. */
export const gapGraders: Phase = (v) => {
  const { game, all, ring, backlog } = v;
  if (ring || backlog > 0 || game.energy < GRADER_BANK) return undefined;
  const graders = all.filter((s) => s.kind === "grader");
  if (graders.length >= GRADERS) return undefined;
  for (let i = 0; i < game.mark.length; i++) {
    if ((game.mark[i] ?? -1) < 0) continue;
    const p = tileOf(game.w, i);
    if (graders.some((s) => steps(s, p) <= KINDS.grader.range)) continue;
    const move = want(game, "grader", p, KINDS.grader.range - 1, nearest(game, p));
    if (move) return move;
  }
  return undefined;
};

/** 3. Tap every lode the grid reaches. */
export const taps: Phase = (v) => {
  for (const lode of v.lodes) {
    if (fits(v.game, "tap", lode)) return order("tap", lode);
  }
  return undefined;
};

/**
 * Where silt stands from the start, in a sea or a long flood, pumps by it skim it and pay for themselves within
 * half a minute. Elsewhere the lances burn it off before a pump earns its cost back.
 */
export const pumps: Phase = (v) => {
  const { game } = v;
  const standing = game.level.sea !== undefined || (game.level.flood ?? 0) >= STANDING_FLOOD;
  const pumpsDue = PUMPS + Math.floor(game.tick / (60 * TICK_HZ));
  if (standing && v.allowed("pump") && game.energy >= KINDS.pump.cost && v.count("pump") < pumpsDue) {
    const p = pumpSite(game, v.nodes, PUMP_WET);
    if (p) return order("pump", p);
  }
  return undefined;
};

/** Walk pylons to the nearest dry lode. */
export const lodeWalk: Phase = (v) => {
  const { game, lodes, closest } = v;
  lodes.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  // Lodes on islands stand by the shore, so over a sea a dry ring round the lode has to do.
  const lode = lodes.find((p) => !wetNear(game, p, game.level.sea === undefined ? 2 : 1));
  if (lode && v.backlog === 0 && steps(lode, closest(lode) ?? lode) < 20) {
    const p = walk(v, lode);
    if (p) return order("pylon", p);
  }
  return undefined;
};

/**
 * Waits for the unfinished structures before it starts anything new, unless the bank is nearly full: then the
 * packets for them are already on their way, and out along a long line waiting for them to arrive only lets the
 * income run over a full bank.
 */
export const backlogGate: Phase = (v) => {
  if (v.backlog > 0 && v.game.energy < v.game.capacity * PIPELINE_BANK) return [];
  return undefined;
};

/** 4. Pylons on open flats near the lander for their harvest: early on, a few of them pay for themselves many times over. */
export const earlyHarvest: Phase = (v) => {
  if (v.game.tick < TICK_HZ * 30 && v.count("pylon") < 3) {
    const p = harvestSite(v);
    if (p) return order("pylon", p);
  }
  return undefined;
};

/** Two cells once three taps stand, near the lander. */
export const cells: Phase = (v) => {
  const { game, home } = v;
  if (v.allowed("cell") && v.count("tap") >= 3 && v.count("cell") < 2) {
    const by = home && { x: home.x + 2, y: home.y + 2 };
    const move = by && want(game, "cell", by, 3, nearest(game, by));
    if (move) return move;
  }
  return undefined;
};

/**
 * 4b. Springs pour balm down the slope into the silt: just above the shore, where it runs into the silt within a
 * few steps, falls steeply and spreads over few tiles on the way, as down a gully, and meets the silt near the
 * vent the push goes for. Only standing silt is worth a spring, and only as many as the income pays to keep
 * pouring, and only while a spring does more per energy than a lobber; a spring is given up once the silt below it
 * is gone for good.
 */
export const springs: Phase = (v) => {
  const { game, all, nodes, closest } = v;
  const open = game.vents.filter((x) => !x.capped);
  open.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  const target = open[0];
  if (SPRINGS_PAY && v.allowed("spring") && target) {
    const placed = all.filter((s) => s.kind === "spring");
    const idle = placed.find((s) => s.built && siltAround(game, s, SPRING_KEEP) < SPRING_LEFT);
    if (idle) return [{ kind: "dismantle", id: idle.id }];
    const due = Math.min(SPRINGS_MOST, SPRINGS + Math.floor(game.tick / (60 * TICK_HZ)));
    // Weighing every tile in reach is slow, so the bot looks for a new site only every few seconds.
    const look = game.tick % (SPRING_LOOK * TICK_HZ) === 0;
    if (look && placed.length < due && game.energy >= KINDS.spring.cost && v.upkeep + SPRING_UPKEEP <= v.income) {
      let best: Tile | undefined;
      let bestScore = -Infinity;
      // The relays' reaches overlap; a tile is weighed once, where it is first met.
      const seen = new Set<number>();
      for (const r of nodes) {
        if (!r.built) continue;
        within(game.w, game.h, r.x, r.y, LINK_RANGE, (i, _d, x, y) => {
          if (seen.has(i)) return;
          seen.add(i);
          const p = { x, y };
          if (placed.some((s) => steps(s, p) < 3) || !fits(game, "spring", p)) return;
          const run = runoff(game, p, SPRING_REACH);
          if (!run || run.drop < SPRING_DROP || siltAround(game, run.at, SPRING_POOL_REACH) < SPRING_POOL) return;
          const score = -run.steps - run.spread * 0.05 + run.drop * 0.5 - steps(run.at, target) * 0.2;
          if (score > bestScore) {
            best = p;
            bestScore = score;
          }
        });
      }
      if (best) return order("spring", best);
    }
  }
  return undefined;
};

/**
 * 4c. An airfield on high, dry ground by the lander once the bank is nearly full, the income left after the weapons
 * loads a sortie about every SORTIE seconds, and deep silt stands where no lance or lobber reaches it, as in a sea or
 * a pool on higher ground: its plane bombs the most silt on the whole map, wherever that is.
 */
export const airfield: Phase = (v) => {
  const { game, home, all } = v;
  // The plane loads as fast as packets come and takes off as soon as it is full, which would take all the spare
  // energy and more; so it flies only on what the bank holds beyond the push's needs.
  const field = all.find((s) => s.kind === "airfield");
  if (field) {
    const share = game.energy / game.capacity;
    if (field.built && (field.active ? share < AIRFIELD_LOW : share >= AIRFIELD_HIGH)) {
      return [{ kind: "toggle", id: field.id }];
    }
    return undefined;
  }
  if (!home || !v.allowed("airfield") || game.energy < game.capacity * AIRFIELD_BANK) return undefined;
  if (v.income - v.upkeep < (KINDS.airfield.store + AIRFIELD.fuel) / SORTIE) return undefined;
  // Weighing the whole map is slow, so the bot looks only every few seconds.
  if (game.tick % (AIRFIELD_LOOK * TICK_HZ) !== 0) return undefined;
  const target = deepArea(game, AIRFIELD.area);
  if (!target || target.silt < AIRFIELD_WORTH) return undefined;
  const covered = all.some(
    (s) =>
      (s.kind === "lance" && steps(s, target.at) <= KINDS.lance.range) ||
      (s.kind === "lobber" && steps(s, target.at) <= KINDS.lobber.range),
  );
  if (covered) return undefined;
  return want(game, "airfield", home, AIRFIELD_NEAR, (q, i) =>
    wetNear(game, q, AIRFIELD_DRY) ? -Infinity : (game.height[i] ?? 0) - steps(q, home) * 0.3,
  );
};

/** 5. Cover the densest cluster against globs with a second interceptor. */
export const secondInterceptor: Phase = (v) => {
  const { game, hub } = v;
  if (hub && v.count("interceptor") < 10 && v.cover < 2 && game.energy >= 12) {
    const move = want(game, "interceptor", hub, 6, nearest(game, hub));
    if (move) return move;
  }
  return undefined;
};

/**
 * 6. With nothing to cap, ring the lander with weapons close in: further out they would burn energy on silt
 * that is no threat yet.
 */
export const holdOut: Phase = (v) => {
  const { game, home, ring } = v;
  if (game.level.objective.kind === "survive" && home) {
    if (game.energy < 12) return [];
    // Silt rising against the dike feeds pumps on its crest, which pay for the lances once the lodes outside drown.
    const pump = ring && v.allowed("pump") ? crestPump(game, ring) : undefined;
    if (pump) return order("pump", pump);
    // Posts spread round the lander at golden-angle steps, so the ring closes evenly as it grows.
    const posts = 3 + Math.floor(game.tick / (40 * TICK_HZ));
    const post = heading(home, v.count("lance") * 2.4, 4);
    if (v.count("lance") < posts * 2) {
      // Behind a dike, lances go wherever they overlook the most silt; its crest overlooks everything.
      const move = ring
        ? want(game, "lance", home, DIKE, (q) => (v.behind(q) ? overlook(game, q) : -Infinity))
        : want(game, "lance", post, 3, nearest(game, post));
      if (move) return move;
    }
    if (v.allowed("lobber") && v.count("lobber") < posts) {
      const move = ring
        ? want(game, "lobber", post, 3, (q) => (steps(q, home) < DIKE ? -span(post.x, post.y, q.x, q.y) : -Infinity))
        : want(game, "lobber", post, 3, nearest(game, post));
      if (move) return move;
    }
    return [];
  }
  return undefined;
};

/** 7. Push toward the nearest open vent. */
export const push: Phase = (v) => {
  const { game, closest } = v;
  const vents = game.vents.filter((x) => !x.capped);
  vents.sort((a, b) => steps(a, closest(a) ?? a) - steps(b, closest(b) ?? b));
  const vent = vents[0];
  const front = vent && closest(vent);
  if (!vent || !front || game.energy < 12) return [];
  const gap = steps(front, vent);
  // The cap needs a relay within link range of the vent; the vent's pulses drown low ground, so the last pylon goes
  // as high as it can.
  const last = (q: Tile, i: number): number => (game.height[i] ?? 0) - steps(q, vent) * 0.1;
  if (!reaches(game, "cap", vent.x, vent.y)) {
    // Once a dry tile for it is on the grid, that pylon comes before any further weapon: it costs little, and
    // without it the cap waits however many lances stand by.
    const p = site(game, "pylon", vent, LINK_RANGE, last);
    if (p) return order("pylon", p);
  }
  const contested = wetNear(game, front, KINDS.lance.range);
  if (contested || gap <= LINK_RANGE + 2) {
    // The longer the push takes, the more firepower the bot commits.
    const flush = game.energy >= game.capacity * 0.8;
    const base = 4 + Math.floor(game.tick / (90 * TICK_HZ));
    // A full bank doubles the push rather than throwing everything at it, which starved the harvest.
    const wave = Math.min(WAVE_MOST, flush ? 2 * base : base);
    // Lances at the front that find nothing to aim at while silt stands by it face silt on higher ground: more of
    // them would idle too. Where most of the silt by the front stands on ground above it, lances there only burn
    // the films that run down from it. Either way lobbers, which lob over any height, go first.
    const lances = v.all.filter((s) => s.kind === "lance" && s.built && steps(s, front) <= FRONT);
    const stalled = contested && lances.filter((s) => s.target < 0).length * 2 > lances.length + STALL_SLACK;
    const above = siltAbove(game, front, FRONT);
    const uphill = contested && above > siltAround(game, front, FRONT) - above;
    const lobbers = v.near("lobber", front, 8);
    const lobber = (): Command[] | undefined =>
      v.allowed("lobber") && v.upkeep + LOBBER_UPKEEP <= v.income
        ? want(game, "lobber", toward(front, vent, -1), 5, (q) => {
            const silt = siltAround(game, q, KINDS.lobber.range, KINDS.lobber.minRange);
            return silt > LOBBER_WORTH ? silt : -Infinity;
          })
        : undefined;
    if ((stalled || uphill) && lobbers < wave) {
      const move = lobber();
      if (move) return move;
    }
    if (!stalled && v.near("lance", front, FRONT) < wave) {
      // Out ahead of the front toward the vent; where silt has drowned that, round the front along the shore. Only
      // tiles that overlook silt the lance can aim at will do.
      const score = (q: Tile): number => (aimable(game, q) > 0 ? overlook(game, q) - steps(q, vent) * 0.6 : -Infinity);
      const move = want(game, "lance", toward(front, vent, 3), 5, score) ?? want(game, "lance", front, LINK_RANGE + 2, score);
      if (move) return move;
    }
    if (lobbers < Math.min(wave, v.near("lance", front, FRONT)) / 2) {
      const move = lobber();
      if (move) return move;
    }
  }
  // Spare energy goes into more harvest.
  if (game.energy >= game.capacity * 0.6) {
    const p = harvestSite(v);
    if (p) return order("pylon", p);
  }
  if (gap > LINK_RANGE - 1) {
    const p = site(game, "pylon", vent, LINK_RANGE, last);
    if (p) return order("pylon", p);
    const q = walk(v, vent);
    // Far out along the line, where a pylon would gather little, a booster speeds the packets to the front instead.
    if (q && v.allowed("booster") && front.dist >= BOOST_FROM && harvestPreview(game, q.x, q.y).length < BOOST_HARVEST) {
      return order("booster", q);
    }
    if (q) return order("pylon", q);
  }
  // With nothing else to spend a well-filled bank on, a pylon that claims fewer tiles, anywhere on the grid, still
  // pays for itself many times over before the game ends.
  if (game.energy >= game.capacity * 0.6) {
    const p = harvestSite(v, SPARE_HARVEST, Infinity);
    if (p) return order("pylon", p);
  }
  return [];
};

/** Every phase in order of urgency; the first one that returns something decides. */
export const PHASES: readonly Phase[] = [
  giveUp,
  capVents,
  interceptFirst,
  guardLander,
  dikeMarks,
  gapMarks,
  gate,
  graders,
  gapGraders,
  taps,
  pumps,
  lodeWalk,
  backlogGate,
  earlyHarvest,
  cells,
  springs,
  airfield,
  secondInterceptor,
  holdOut,
  push,
];
