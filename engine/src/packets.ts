// Energy: income, and the packets that carry it from the lander to whatever asks for it.

import { BOOST, boosts, packetSpeed } from "./grid.ts";
import { harvestIncome } from "./harvest.ts";
import { span, tileOf } from "./hex.ts";
import { complete } from "./structures.ts";
import {
  KINDS,
  TICK_HZ,
  find,
  tileIndex,
  type Event,
  type Game,
  type Packet,
  type Purpose,
  type Source,
  type Structure,
} from "./state.ts";

export const LANDER_INCOME = 1;
export const TAP_INCOME = 0.6;
/** Ticks between two dispatches from the lander. */
export const DISPATCH_EVERY = 2;
/** Share of the capacity above which a dispatch sends more than one packet. */
export const SURGE_FROM = 0.75;
/** Packets a dispatch sends on top of the first when the bank is full; it grows evenly from `SURGE_FROM`. */
export const SURGE_PACKETS = 4;

/**
 * Banks energy as far as there is room, and books what was taken to its sources in proportion to `parts`, the
 * sources' shares of `amount` in any unit.
 */
function bank(game: Game, amount: number, parts: Readonly<Partial<Record<Source, number>>>): void {
  const room = game.capacity - game.energy;
  const taken = Math.min(room, amount);
  game.energy += taken;
  game.accIn += taken;
  const sources = Object.keys(parts) as Source[];
  const whole = sources.reduce((sum, source) => sum + (parts[source] ?? 0), 0);
  if (whole <= 0) return;
  const acc = game.flow.accIn;
  for (const source of sources) acc[source] += (taken * (parts[source] ?? 0)) / whole;
}

export function gain(game: Game, amount: number, source: Source): void {
  bank(game, amount, { [source]: amount });
}

export function spend(game: Game, amount: number, purpose: Purpose): void {
  game.energy -= amount;
  game.accOut += amount;
  game.flow.accOut[purpose] += amount;
  game.stats.spent += amount;
}

function stepIncome(game: Game): void {
  const harvest = harvestIncome(game);
  let perSecond = LANDER_INCOME + harvest;
  let taps = 0;
  for (const s of game.structures) {
    if (s.kind === "tap" && s.built && s.active && Number.isFinite(s.dist)) {
      perSecond += TAP_INCOME;
      taps += TAP_INCOME;
    }
  }
  bank(game, perSecond / TICK_HZ, { lander: LANDER_INCOME, pylon: harvest, tap: taps });
  if (game.tick % TICK_HZ === 0) {
    game.rateIn = game.accIn;
    game.rateOut = game.accOut;
    game.accIn = 0;
    game.accOut = 0;
    const flow = game.flow;
    flow.rateIn = { ...flow.accIn };
    flow.rateOut = { ...flow.accOut };
    for (const source of Object.keys(flow.accIn) as Source[]) flow.accIn[source] = 0;
    for (const purpose of Object.keys(flow.accOut) as Purpose[]) flow.accOut[purpose] = 0;
  }
}

/** What a structure is waiting for, if anything. */
function wants(game: Game, s: Structure): Packet["kind"] | undefined {
  if (!s.active || !Number.isFinite(s.dist) || s.kind === "lander") {
    return undefined;
  }
  const def = KINDS[s.kind];
  // Wear leaves fractions, so anything short of full health asks for a packet.
  if (s.health + s.pendingBuild < def.cost) return "build";
  if (s.built && def.store > 0 && s.energy + s.pendingEnergy <= def.store - 1) {
    // An airfield loads its plane on the ground; while the plane is up there is nothing to load.
    if (s.kind === "airfield" && game.planes.some((p) => p.base === s.id)) return undefined;
    return "energy";
  }
  return undefined;
}

function route(game: Game, target: Structure): Structure[] | undefined {
  const path = [target];
  let at = target;
  while (at.id !== game.landerId) {
    const parent = find(game, at.parent);
    if (!parent || path.length > game.structures.length) return undefined;
    path.push(parent);
    at = parent;
  }
  return path.reverse();
}

/** How many packets one dispatch sends: one, and more the fuller the bank is beyond `SURGE_FROM`. */
export function dispatchSize(game: Game): number {
  const share = game.capacity > 0 ? Math.min(1, game.energy / game.capacity) : 0;
  const over = Math.max(0, share - SURGE_FROM) / (1 - SURGE_FROM);
  return 1 + Math.floor(over * SURGE_PACKETS);
}

/** Sends one packet to the next structure in turn that wants one; false when none does. */
function send(game: Game): boolean {
  const n = game.structures.length;
  for (let k = 0; k < n; k++) {
    const s = game.structures[(game.cursor + k) % n];
    if (!s) continue;
    const kind = wants(game, s);
    if (!kind) continue;
    const path = route(game, s);
    if (!path) continue;
    if (kind === "build") s.pendingBuild += 1;
    else s.pendingEnergy += 1;
    game.packets.push({
      id: game.nextId++,
      kind,
      target: s.id,
      ids: path.map((p) => p.id),
      tiles: path.map((p) => tileIndex(game, p.x, p.y)),
      seg: 0,
      t: 0,
      boost: 1,
      boosters: [],
    });
    // A build packet for a finished structure mends it.
    spend(game, 1, kind === "energy" ? "supply" : s.built ? "repair" : "build");
    game.cursor = (game.cursor + k + 1) % n;
    return true;
  }
  return false;
}

function dispatch(game: Game): void {
  game.dispatchWait -= 1;
  if (game.dispatchWait > 0) return;
  // The size is fixed before the first packet leaves, so that spending it does not shrink the dispatch.
  const size = dispatchSize(game);
  for (let sent = 0; sent < size && game.energy >= 1; sent++) {
    if (!send(game)) return;
    game.dispatchWait = DISPATCH_EVERY;
  }
}

function deliver(game: Game, packet: Packet, events: Event[]): void {
  const s = find(game, packet.target);
  if (!s) return;
  const def = KINDS[s.kind];
  if (packet.kind === "build") {
    s.pendingBuild -= 1;
    s.health = Math.min(def.cost, s.health + 1);
    if (!s.built && s.health >= def.cost) complete(game, s, events);
  } else {
    s.pendingEnergy -= 1;
    s.energy = Math.min(def.store, s.energy + 1);
  }
}

function drop(game: Game, packet: Packet): void {
  const s = find(game, packet.target);
  if (!s) return;
  if (packet.kind === "build") s.pendingBuild -= 1;
  else s.pendingEnergy -= 1;
}

function move(game: Game, events: Event[]): void {
  const kept: Packet[] = [];
  const speed = packetSpeed(game);
  for (const p of game.packets) {
    const b = p.tiles[p.seg + 1] ?? 0;
    // Packets run straight from centre to centre, so a segment is as long as the line between them.
    const from = tileOf(game.w, p.tiles[p.seg] ?? 0);
    const to = tileOf(game.w, b);
    const length = span(from.x, from.y, to.x, to.y);
    const fast =
      find(game, p.ids[p.seg] ?? 0)?.kind === "trunk" &&
      find(game, p.ids[p.seg + 1] ?? 0)?.kind === "trunk";
    // At most one node per tick however fast: the step below never carries the overshoot on.
    p.t += (speed * (fast ? 2 : 1) * p.boost) / Math.max(length, 0.01);
    if (p.t < 1) {
      kept.push(p);
      continue;
    }
    p.seg += 1;
    p.t = 0;
    const node = find(game, p.ids[p.seg] ?? 0);
    if (!node || game.occ[b] !== node.id) {
      drop(game, p);
    } else if (p.seg === p.ids.length - 1) {
      deliver(game, p, events);
    } else if (node.built) {
      // A booster speeds up the packets it relays, each one once; the packet's destination does not.
      if (boosts(node) && !p.boosters.includes(node.id)) {
        p.boost *= BOOST;
        p.boosters.push(node.id);
      }
      kept.push(p);
    } else {
      drop(game, p);
    }
  }
  game.packets = kept;
}

/** The lander mends itself straight from the bank. */
function mendLander(game: Game): void {
  if (game.tick % 15 !== 0 || game.energy < 1) return;
  const lander = find(game, game.landerId);
  if (lander && lander.health <= KINDS.lander.cost - 1) {
    lander.health += 1;
    spend(game, 1, "repair");
  }
}

export function stepPackets(game: Game, events: Event[]): void {
  stepIncome(game);
  mendLander(game);
  dispatch(game);
  move(game, events);
}
