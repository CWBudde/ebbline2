import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { BOOST, GLOBAL_BOOST, PACKET_SPEED, packetSpeed, rebuild } from "./grid.ts";
import { distance, neighbour } from "./hex.ts";
import { load, save } from "./save.ts";
import { KINDS, tileIndex, type Game, type Packet, type Structure } from "./state.ts";
import { build, flat, lander, run } from "./testing/fixtures.ts";

/** Speed on an ordinary link six tiles long, the spacing used below, with no booster built: progress per tick. */
const BASE = PACKET_SPEED / 6;
/** The same with one and with two working boosters on the map. */
const ONE = BASE * (1 + GLOBAL_BOOST);
const TWO = BASE * (1 + 2 * GLOBAL_BOOST);

/** Places a structure that is not built yet, the way the player does. */
function plan(game: Game, kind: Structure["kind"], x: number, y: number): Structure {
  apply(game, { kind: "place", structure: kind, x, y });
  const s = game.structures.at(-1);
  if (s?.kind !== kind) throw new Error(`cannot place ${kind} at ${x},${y}`);
  return s;
}

interface Trace {
  packet: Packet;
  /** Progress per tick on each segment, by the index of the node the packet last left. */
  rates: number[];
}

/**
 * Runs the game until the first packet sent to `target` has arrived or been dropped, and measures how
 * fast it moved on each segment. `during` runs before every tick once the packet is under way.
 */
function follow(game: Game, target: Structure, during?: (p: Packet) => void): Trace {
  let packet: Packet | undefined;
  const rates: number[] = [];
  let seg = -1;
  let t = 0;
  for (let n = 0; n < 2000; n++) {
    if (packet) during?.(packet);
    run(game, 1);
    packet ??= game.packets.find((p) => p.target === target.id);
    if (!packet) continue;
    if (!game.packets.includes(packet)) return { packet, rates };
    if (packet.seg === seg && packet.t > t) rates[packet.seg] = packet.t - t;
    seg = packet.seg;
    t = packet.t;
  }
  throw new Error("the packet never arrived");
}

/** Sends a hand-made packet along the given structures, as if the dispatcher had. */
function send(game: Game, path: readonly Structure[]): Packet {
  const target = path.at(-1);
  if (!target) throw new Error("empty path");
  const packet: Packet = {
    id: game.nextId++,
    kind: "build",
    target: target.id,
    ids: path.map((s) => s.id),
    tiles: path.map((s) => tileIndex(game, s.x, s.y)),
    seg: 0,
    t: 0,
    boost: 1,
    boosters: [],
  };
  target.pendingBuild += 1;
  game.packets.push(packet);
  return packet;
}

/** Runs until a hand-made packet has arrived or been dropped. */
function finish(game: Game, packet: Packet): void {
  for (let n = 0; n < 2000 && game.packets.includes(packet); n++) run(game, 1);
  if (game.packets.includes(packet)) throw new Error("the packet never arrived");
}

describe("boosters", () => {
  it("speed a packet up by a fifth once it has passed one", () => {
    const game = flat(40);
    const l = lander(game);
    const booster = build(game, "booster", l.x + 6, l.y);
    build(game, "pylon", l.x + 12, l.y);
    const target = plan(game, "lance", l.x + 18, l.y);
    const { packet, rates } = follow(game, target);
    expect(rates[0]).toBeCloseTo(ONE, 9);
    expect(rates[1]).toBeCloseTo(ONE * BOOST, 9);
    expect(rates[2]).toBeCloseTo(ONE * BOOST, 9);
    expect(packet.boost).toBeCloseTo(1.2, 12);
    expect(packet.boosters).toEqual([booster.id]);
  });

  it("stack: two different boosters make a packet 1.44 times as fast", () => {
    const game = flat(40);
    const l = lander(game);
    const a = build(game, "booster", l.x + 6, l.y);
    const b = build(game, "booster", l.x + 12, l.y);
    build(game, "pylon", l.x + 18, l.y);
    const target = plan(game, "lance", l.x + 24, l.y);
    const { packet, rates } = follow(game, target);
    expect(rates[0]).toBeCloseTo(TWO, 9);
    expect(rates[1]).toBeCloseTo(TWO * 1.2, 9);
    expect(rates[2]).toBeCloseTo(TWO * 1.44, 9);
    expect(rates[3]).toBeCloseTo(TWO * 1.44, 9);
    expect(packet.boost).toBeCloseTo(1.44, 12);
    expect(packet.boosters).toEqual([a.id, b.id]);
  });

  it("raise the speed of all packets by a fiftieth each, wherever they stand", () => {
    const game = flat(40);
    const l = lander(game);
    expect(packetSpeed(game)).toBe(PACKET_SPEED);
    // Off the route to the target, on the other side of the lander.
    build(game, "booster", l.x - 6, l.y);
    build(game, "booster", l.x - 6, l.y + 4);
    build(game, "pylon", l.x + 6, l.y);
    const target = plan(game, "lance", l.x + 12, l.y);
    const { packet, rates } = follow(game, target);
    expect(packetSpeed(game)).toBeCloseTo(PACKET_SPEED * (1 + 2 * GLOBAL_BOOST), 12);
    expect(rates[0]).toBeCloseTo(TWO, 9);
    expect(rates[1]).toBeCloseTo(TWO, 9);
    expect(packet.boost).toBe(1);
  });

  it("raise the speed of all packets only while they work", () => {
    const game = flat(40);
    const l = lander(game);
    plan(game, "booster", l.x - 6, l.y);
    const off = build(game, "booster", l.x + 6, l.y);
    run(game, 1);
    expect(packetSpeed(game)).toBeCloseTo(PACKET_SPEED * (1 + GLOBAL_BOOST), 12);
    apply(game, { kind: "toggle", id: off.id });
    run(game, 1);
    expect(packetSpeed(game)).toBe(PACKET_SPEED);
  });

  it("speed a packet up only once each, even if it passes the same one again", () => {
    const game = flat(40);
    const l = lander(game);
    const booster = build(game, "booster", l.x + 6, l.y);
    const pylon = build(game, "pylon", l.x + 12, l.y);
    const target = plan(game, "lance", l.x + 18, l.y);
    const packet = send(game, [l, booster, pylon, booster, target]);
    finish(game, packet);
    expect(packet.seg).toBe(4);
    expect(packet.boost).toBeCloseTo(BOOST, 12);
    expect(packet.boosters).toEqual([booster.id]);
  });

  it("do nothing before they are built", () => {
    const game = flat(40);
    const l = lander(game);
    const booster = plan(game, "booster", l.x + 6, l.y);
    const target = plan(game, "lance", l.x + 12, l.y);
    const packet = send(game, [l, booster, target]);
    finish(game, packet);
    // An unfinished structure relays nothing: the packet is lost there, unboosted.
    expect(packet.seg).toBe(1);
    expect(packet.boost).toBe(1);
    expect(packet.boosters).toEqual([]);
  });

  it("do nothing while switched off", () => {
    const game = flat(40);
    const l = lander(game);
    const booster = build(game, "booster", l.x + 6, l.y);
    build(game, "pylon", l.x + 12, l.y);
    const target = plan(game, "lance", l.x + 18, l.y);
    apply(game, { kind: "toggle", id: booster.id });
    const { packet, rates } = follow(game, target);
    expect(rates[1]).toBeCloseTo(BASE, 9);
    expect(rates[2]).toBeCloseTo(BASE, 9);
    expect(packet.boost).toBe(1);
    expect(packet.boosters).toEqual([]);
  });

  it("do nothing once cut off from the lander", () => {
    const game = flat(40);
    const l = lander(game);
    const pylon = build(game, "pylon", l.x + 6, l.y);
    const booster = build(game, "booster", l.x + 12, l.y);
    const target = plan(game, "lance", l.x + 18, l.y);
    // Once the packet is past the pylon, take the pylon away: the booster ahead is cut off.
    const { packet } = follow(game, target, (p) => {
      if (p.seg === 1 && game.structures.includes(pylon)) apply(game, { kind: "dismantle", id: pylon.id });
    });
    expect(booster.dist).toBe(Infinity);
    expect(packet.seg).toBe(3);
    expect(packet.boost).toBe(1);
    expect(packet.boosters).toEqual([]);
  });

  it("do not speed up a packet that is meant for themselves", () => {
    const game = flat(40);
    const l = lander(game);
    const relay = build(game, "booster", l.x + 6, l.y);
    const damaged = build(game, "booster", l.x + 12, l.y);
    damaged.health = KINDS.booster.cost - 1;
    const { packet } = follow(game, damaged);
    expect(packet.seg).toBe(2);
    expect(damaged.health).toBe(KINDS.booster.cost);
    expect(packet.boost).toBeCloseTo(BOOST, 12);
    expect(packet.boosters).toEqual([relay.id]);
  });

  it("keep a packet's speed and boosters in a save", () => {
    const game = flat(40);
    const l = lander(game);
    const a = build(game, "booster", l.x + 6, l.y);
    const b = build(game, "booster", l.x + 12, l.y);
    build(game, "pylon", l.x + 18, l.y);
    const target = plan(game, "lance", l.x + 24, l.y);
    const taken: { game?: Game } = {};
    follow(game, target, (p) => {
      if (p.seg === 3) taken.game ??= load(save(game));
    });
    const packet = taken.game?.packets.find((p) => p.target === target.id && p.seg === 3);
    expect(packet?.boost).toBeCloseTo(1.44, 12);
    expect(packet?.boosters).toEqual([a.id, b.id]);
  });
});

describe("routes", () => {
  /** Two tiles six steps from both the lander and `far`, twelve steps away: two equally long ways between them. */
  function crossings(game: Game, far: { x: number; y: number }): [{ x: number; y: number }, { x: number; y: number }] {
    const l = lander(game);
    const found: { x: number; y: number }[] = [];
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        if (distance(x, y, l.x, l.y) === 6 && distance(x, y, far.x, far.y) === 6) found.push({ x, y });
      }
    }
    const [first, second] = found;
    if (!first || !second) throw new Error("no two crossings");
    return [first, second];
  }

  it("count a link behind a booster as a fifth quicker", () => {
    const game = flat(40);
    const l = lander(game);
    build(game, "booster", l.x + 6, l.y);
    const target = plan(game, "lance", l.x + 12, l.y);
    rebuild(game);
    expect(target.dist).toBeCloseTo(6 + 6 / BOOST, 12);
  });

  it("run through a working booster rather than an equally long pylon line", () => {
    const game = flat(40);
    const l = lander(game);
    // Six steps one way and six at sixty degrees to it: twelve steps, with several equally short ways there.
    let far = { x: l.x, y: l.y };
    for (let n = 0; n < 12; n++) far = neighbour(far.x, far.y, n < 6 ? 0 : 1);
    expect(distance(l.x, l.y, far.x, far.y)).toBe(12);
    const [p, q] = crossings(game, far);
    // The pylon comes first, so it would win the tie without the booster's head start.
    const pylon = build(game, "pylon", p.x, p.y);
    const booster = build(game, "booster", q.x, q.y);
    const target = plan(game, "lance", far.x, far.y);
    rebuild(game);
    expect(target.parent).toBe(booster.id);
    apply(game, { kind: "toggle", id: booster.id });
    run(game, 1);
    expect(target.parent).toBe(pylon.id);
    expect(target.dist).toBe(12);
  });
});
