// Energy: income, and the packets that carry it from the lander to whatever asks for it.

import { PACKET_SPEED } from "./grid.ts";
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
  type Structure,
} from "./state.ts";

export const LANDER_INCOME = 1;
export const TAP_INCOME = 0.6;
/** Ticks between two packets leaving the lander. */
export const DISPATCH_EVERY = 2;

export function gain(game: Game, amount: number): void {
  const room = game.capacity - game.energy;
  const taken = Math.min(room, amount);
  game.energy += taken;
  game.accIn += taken;
}

function spend(game: Game, amount: number): void {
  game.energy -= amount;
  game.accOut += amount;
  game.stats.spent += amount;
}

function stepIncome(game: Game): void {
  let perSecond = LANDER_INCOME + harvestIncome(game);
  for (const s of game.structures) {
    if (s.kind === "tap" && s.built && s.active && Number.isFinite(s.dist)) {
      perSecond += TAP_INCOME;
    }
  }
  gain(game, perSecond / TICK_HZ);
  if (game.tick % TICK_HZ === 0) {
    game.rateIn = game.accIn;
    game.rateOut = game.accOut;
    game.accIn = 0;
    game.accOut = 0;
  }
}

/** What a structure is waiting for, if anything. */
function wants(s: Structure): Packet["kind"] | undefined {
  if (!s.active || !Number.isFinite(s.dist) || s.kind === "lander") {
    return undefined;
  }
  const def = KINDS[s.kind];
  // Wear leaves fractions, so anything short of full health asks for a packet.
  if (s.health + s.pendingBuild < def.cost) return "build";
  if (s.built && def.store > 0 && s.energy + s.pendingEnergy <= def.store - 1) {
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

function dispatch(game: Game): void {
  game.dispatchWait -= 1;
  if (game.dispatchWait > 0 || game.energy < 1) return;
  const n = game.structures.length;
  for (let k = 0; k < n; k++) {
    const s = game.structures[(game.cursor + k) % n];
    if (!s) continue;
    const kind = wants(s);
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
    });
    spend(game, 1);
    game.cursor = (game.cursor + k + 1) % n;
    game.dispatchWait = DISPATCH_EVERY;
    return;
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
  for (const p of game.packets) {
    const b = p.tiles[p.seg + 1] ?? 0;
    // Packets run straight from centre to centre, so a segment is as long as the line between them.
    const from = tileOf(game.w, p.tiles[p.seg] ?? 0);
    const to = tileOf(game.w, b);
    const length = span(from.x, from.y, to.x, to.y);
    const fast =
      find(game, p.ids[p.seg] ?? 0)?.kind === "trunk" &&
      find(game, p.ids[p.seg + 1] ?? 0)?.kind === "trunk";
    p.t += (PACKET_SPEED * (fast ? 2 : 1)) / Math.max(length, 0.01);
    if (p.t < 1) {
      kept.push(p);
      continue;
    }
    p.seg += 1;
    p.t = 0;
    if (game.occ[b] !== p.ids[p.seg]) {
      drop(game, p);
    } else if (p.seg === p.ids.length - 1) {
      deliver(game, p, events);
    } else if (find(game, p.ids[p.seg] ?? 0)?.built) {
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
    spend(game, 1);
  }
}

export function stepPackets(game: Game, events: Event[]): void {
  stepIncome(game);
  mendLander(game);
  dispatch(game);
  move(game, events);
}
