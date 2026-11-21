import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { distance, tileAtPoint, within } from "./hex.ts";
import { fingerprint, load, save } from "./save.ts";
import { KINDS, find, type Event, type Game, type Structure } from "./state.ts";
import { build, depth, flat, lander, pour, run } from "./testing/fixtures.ts";
import { AIRFIELD, planeOf } from "./weapons.ts";

/** Sinks the tiles within `radius` steps of (x, y) to the floor and fills them `amount` deep, so the silt stays. */
function pool(game: Game, x: number, y: number, radius: number, amount: number): void {
  within(game.w, game.h, x, y, radius, (i, _d, tx, ty) => {
    game.height[i] = 0;
    pour(game, tx, ty, amount);
  });
}

function siltAround(game: Game, x: number, y: number, radius: number): number {
  let sum = 0;
  within(game.w, game.h, x, y, radius, (i) => (sum += game.silt[i] ?? 0));
  return sum;
}

/** Steps until an event of the kind turns up; the events up to and including it. */
function until(game: Game, kind: Event["kind"], limit = 2000): Event[] {
  const events: Event[] = [];
  for (let n = 0; n < limit; n++) {
    const now = run(game, 1);
    events.push(...now);
    if (now.some((e) => e.kind === kind)) return events;
  }
  throw new Error(`no ${kind} within ${limit} ticks`);
}

function setup(): { game: Game; field: Structure } {
  const game = flat(48);
  const l = lander(game);
  const field = build(game, "airfield", l.x + 4, l.y);
  return { game, field };
}

describe("airfield", () => {
  it("launches its plane when it is full, built and switched on, and uses up the load", () => {
    const { game, field } = setup();
    pool(game, 36, 36, 1, 2);
    expect(field.energy).toBe(KINDS.airfield.store);
    const events = run(game, 1);
    expect(events).toContainEqual({ kind: "takeoff", id: field.id, x: field.x, y: field.y });
    expect(game.planes).toHaveLength(1);
    expect(planeOf(game, field.id)?.bombs).toBe(AIRFIELD.bombs);
    expect(field.energy).toBe(0);
    // One plane per airfield.
    field.energy = KINDS.airfield.store;
    run(game, 5);
    expect(game.planes).toHaveLength(1);
  });

  it("goes for the area with the most silt on the whole map, not the nearest", () => {
    const { game, field } = setup();
    // A thin film right by the airfield and a deep pool far across the map.
    pool(game, field.x + 3, field.y + 2, 1, 0.4);
    pool(game, 40, 40, 0, 6);
    run(game, 1);
    const plane = planeOf(game, field.id);
    if (!plane) throw new Error("no plane");
    const target = tileAtPoint(plane.tx, plane.ty);
    expect(distance(target.x, target.y, 40, 40)).toBeLessThanOrEqual(AIRFIELD.area);
    expect(field.target).toBe(target.y * game.w + target.x);
  });

  it("bombs the silt round the target", () => {
    const { game } = setup();
    pool(game, 36, 34, 4, 3);
    const before = siltAround(game, 36, 34, 4);
    const events = until(game, "landed");
    const impacts = events.filter((e) => e.kind === "impact");
    expect(impacts).toHaveLength(AIRFIELD.bombs);
    for (const e of impacts) expect(e).toMatchObject({ radius: AIRFIELD.blast });
    // The bombs fall one after another along the run, all on or near the pool.
    for (const e of impacts) expect(distance(e.x, e.y, 36, 34)).toBeLessThanOrEqual(4 + AIRFIELD.run / 2);
    expect(game.stats.removed).toBeGreaterThan(20);
    expect(siltAround(game, 36, 34, 4 + AIRFIELD.blast)).toBeLessThan(before - 20);
  });

  it("comes home, lands and only then loads again", () => {
    const { game, field } = setup();
    // Deep and wide enough that one sortie leaves silt for the next.
    pool(game, 40, 36, 3, 8);
    run(game, 1);
    // No energy goes out to the airfield while its plane is up.
    for (let n = 0; n < 40; n++) {
      run(game, 1);
      expect(field.pendingEnergy).toBe(0);
      expect(field.energy).toBe(0);
    }
    const events = until(game, "landed");
    expect(events).toContainEqual({ kind: "landed", id: field.id });
    expect(game.planes).toHaveLength(0);
    expect(field.target).toBe(-1);
    // Loaded again, it sets off on the next sortie.
    const next = until(game, "takeoff", 1500);
    expect(next.some((e) => e.kind === "landed")).toBe(false);
    expect(game.planes).toHaveLength(1);
  });

  it("keeps the plane on the ground when switched off", () => {
    const { game, field } = setup();
    pool(game, 36, 36, 1, 2);
    apply(game, { kind: "toggle", id: field.id });
    const events = run(game, 60);
    expect(events.some((e) => e.kind === "takeoff")).toBe(false);
    expect(game.planes).toHaveLength(0);
    expect(field.energy).toBe(KINDS.airfield.store);
  });

  it("loses the plane with its airfield", () => {
    const { game, field } = setup();
    pool(game, 40, 40, 1, 2);
    run(game, 10);
    expect(game.planes).toHaveLength(1);
    apply(game, { kind: "dismantle", id: field.id });
    expect(find(game, field.id)).toBeUndefined();
    let events: Event[] = [];
    expect(() => (events = run(game, 300))).not.toThrow();
    expect(game.planes).toHaveLength(0);
    expect(events.some((e) => e.kind === "impact" || e.kind === "landed")).toBe(false);
  });

  it("does not take off over a dry map", () => {
    const { game, field } = setup();
    const events = run(game, 120);
    expect(events.some((e) => e.kind === "takeoff")).toBe(false);
    expect(game.planes).toHaveLength(0);
    expect(field.energy).toBe(KINDS.airfield.store);
    expect(depth(game, 30, 30)).toBe(0);
  });

  it("saves a plane in flight and carries on exactly the same after loading", () => {
    const { game } = setup();
    pool(game, 38, 36, 2, 3);
    run(game, 30);
    expect(game.planes).toHaveLength(1);
    const copy = load(save(game));
    expect(copy).toEqual(game);
    expect(fingerprint(copy)).toBe(fingerprint(game));
    run(game, 200);
    run(copy, 200);
    expect(fingerprint(copy)).toBe(fingerprint(game));
  });
});
