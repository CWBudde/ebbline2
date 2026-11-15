import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { HARVEST_RANGE, HARVEST_RATE, harvestIncome, harvestPending, harvestPreview } from "./harvest.ts";
import { distance, tileOf, within } from "./hex.ts";
import { load, save } from "./save.ts";
import { ROCK, TICK_HZ, type Event, type Game } from "./state.ts";
import { place } from "./structures.ts";
import { build, flat, lander, pour, run } from "./testing/fixtures.ts";

/** Tiles in a disc of radius HARVEST_RANGE: 1 + 3 + 6 + 9 rings… = 37 for a range of 3. */
const FULL = 1 + 3 * HARVEST_RANGE * (HARVEST_RANGE + 1);

function claimed(game: Game): number[] {
  const tiles: number[] = [];
  game.harvest.forEach((v, i) => {
    if (v === 1) tiles.push(i);
  });
  return tiles;
}

/** A flat map with the lander's ground lifted out of the way, so only the pylons under test harvest. */
function field(): Game {
  const game = flat(40);
  const l = lander(game);
  // The lander stands on a step of its own; pylons are tested on the ground around it.
  within(game.w, game.h, l.x, l.y, 1, (i) => {
    game.height[i] = 9;
  });
  return game;
}

describe("harvest", () => {
  it("claims every tile within range at the pylon's own height", () => {
    const game = field();
    const l = lander(game);
    const p = build(game, "pylon", l.x + 5, l.y);
    run(game, 1);
    const tiles = claimed(game);
    expect(tiles).toHaveLength(FULL);
    for (const i of tiles) {
      const t = tileOf(game.w, i);
      expect(distance(p.x, p.y, t.x, t.y)).toBeLessThanOrEqual(HARVEST_RANGE);
    }
    expect(harvestIncome(game)).toBeCloseTo(FULL * HARVEST_RATE, 9);
  });

  it("only counts ground at exactly the pylon's height, and never rock", () => {
    const game = field();
    const l = lander(game);
    const x = l.x + 5;
    const y = l.y;
    let raised = 0;
    // Only on the outer ring, so the changed tiles hide nothing behind them.
    within(game.w, game.h, x, y, HARVEST_RANGE, (i, steps) => {
      if (steps < HARVEST_RANGE) return;
      if (i % 3 === 0) {
        game.height[i] = 6;
        raised += 1;
      } else if (i % 3 === 1) {
        game.height[i] = ROCK;
        raised += 1;
      }
    });
    build(game, "pylon", x, y);
    run(game, 1);
    expect(claimed(game)).toHaveLength(FULL - raised);
    for (const i of claimed(game)) expect(game.height[i]).toBe(5);
  });

  it("does not see past higher ground, but sees across a dip", () => {
    const game = field();
    const l = lander(game);
    const x = l.x + 5;
    const y = l.y;
    // A ridge one higher, two steps east of the pylon, hides the tile behind it on that line.
    const ridge = y * game.w + x + 2;
    const behind = y * game.w + x + 3;
    game.height[ridge] = 6;
    // A dip two steps west does not hide the tile behind it.
    const dip = y * game.w + x - 2;
    const across = y * game.w + x - 3;
    game.height[dip] = 2;
    build(game, "pylon", x, y);
    run(game, 1);
    expect(game.harvest[ridge]).toBe(0);
    expect(game.harvest[behind]).toBe(0);
    expect(game.harvest[dip]).toBe(0);
    expect(game.harvest[across]).toBe(1);
    // The tiles beside the line still see past the ridge's ends.
    expect(game.harvest[y * game.w + x + 1]).toBe(1);
  });

  it("does not see past rock", () => {
    const game = field();
    const l = lander(game);
    const x = l.x + 5;
    const y = l.y;
    game.height[y * game.w + x - 1] = ROCK;
    build(game, "pylon", x, y);
    run(game, 1);
    expect(game.harvest[y * game.w + x - 1]).toBe(0);
    expect(game.harvest[y * game.w + x - 2]).toBe(0);
    expect(game.harvest[y * game.w + x - 3]).toBe(0);
    expect(game.harvest[y * game.w + x + 3]).toBe(1);
  });

  it("is the same in every direction on open ground", () => {
    const game = field();
    const l = lander(game);
    const p = build(game, "pylon", l.x + 5, l.y);
    run(game, 1);
    // A ring of raised tiles at distance two hides exactly the ring outside it, in every direction alike.
    within(game.w, game.h, p.x, p.y, 2, (i, steps) => {
      if (steps === 2) game.height[i] = 6;
    });
    build(game, "lance", l.x - 4, l.y);
    run(game, 1);
    const area = claimed(game).map((i) => tileOf(game.w, i));
    expect(area).toHaveLength(7);
    for (const t of area) expect(distance(p.x, p.y, t.x, t.y)).toBeLessThanOrEqual(1);
  });

  it("gives a tile to one pylon only, the one placed first", () => {
    const game = field();
    const l = lander(game);
    const first = build(game, "pylon", l.x + 4, l.y);
    run(game, 1);
    const before = claimed(game);
    const preview = harvestPreview(game, l.x + 6, l.y);
    // The two discs overlap, so the second would only add the tiles the first has not claimed.
    expect(preview.length).toBeGreaterThan(0);
    expect(preview.length).toBeLessThan(FULL);
    for (const i of preview) expect(before).not.toContain(i);
    // Six steps from the lander, so it stays on the grid without the first.
    build(game, "pylon", l.x + 6, l.y);
    run(game, 1);
    expect(claimed(game)).toHaveLength(before.length + preview.length);
    // Removing the first pylon hands its overlap to the second.
    apply(game, { kind: "dismantle", id: first.id });
    run(game, 1);
    expect(claimed(game)).toHaveLength(FULL);
  });

  it("yields nothing from tiles under silt while they stay covered", () => {
    const game = field();
    const l = lander(game);
    const p = build(game, "pylon", l.x + 5, l.y);
    run(game, 1);
    const wet = p.y * game.w + p.x + 2;
    pour(game, p.x + 2, p.y, 1);
    // Still claimed, so the area drawn does not flicker, but it brings in nothing.
    expect(game.harvest[wet]).toBe(1);
    expect(harvestIncome(game)).toBeCloseTo((FULL - 1) * HARVEST_RATE, 9);
    game.silt[wet] = 0;
    expect(harvestIncome(game)).toBeCloseTo(FULL * HARVEST_RATE, 9);
  });

  it("needs a built pylon that is on the grid and switched on", () => {
    const game = field();
    const l = lander(game);
    const events: Event[] = [];
    // Placed but not built: nothing yet.
    const p = place(game, "pylon", l.x + 5, l.y, events);
    run(game, 1);
    expect(p).toBeDefined();
    expect(claimed(game)).toHaveLength(0);
    // Built far away, off the grid: nothing either.
    build(game, "pylon", l.x + 20, l.y + 10);
    run(game, 1);
    expect(claimed(game)).toHaveLength(0);
    const on = build(game, "pylon", l.x - 5, l.y);
    run(game, 1);
    expect(claimed(game)).toHaveLength(FULL);
    apply(game, { kind: "toggle", id: on.id });
    expect(claimed(game)).toHaveLength(0);
  });

  it("projects the area of a pylon that is placed but not built yet, without what is already claimed", () => {
    const game = field();
    const l = lander(game);
    expect(harvestPending(game)).toHaveLength(0);
    build(game, "pylon", l.x + 5, l.y);
    run(game, 1);
    const waiting = place(game, "pylon", l.x + 8, l.y, []);
    expect(waiting).toBeDefined();
    const pending = harvestPending(game);
    // The two discs overlap; the built pylon keeps the shared tiles.
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.length).toBeLessThan(FULL);
    for (const i of pending) expect(game.harvest[i]).toBe(0);
    expect(claimed(game)).toHaveLength(FULL);
  });

  it("follows the terrain when a grader changes it", () => {
    const game = field();
    const l = lander(game);
    const p = build(game, "pylon", l.x + 5, l.y);
    const target = p.y * game.w + p.x + 2;
    game.height[target] = 4;
    run(game, 1);
    expect(game.harvest[target]).toBe(0);
    const rev = game.harvestRev;
    build(game, "grader", l.x + 9, l.y + 4);
    apply(game, { kind: "mark", tiles: [target], height: 5 });
    run(game, 3 * TICK_HZ);
    expect(game.height[target]).toBe(5);
    expect(game.harvest[target]).toBe(1);
    expect(game.harvestRev).toBeGreaterThan(rev);
  });

  it("bumps the revision only when the area changes", () => {
    const game = field();
    const l = lander(game);
    run(game, 1);
    const start = game.harvestRev;
    build(game, "pylon", l.x + 5, l.y);
    run(game, 1);
    const after = game.harvestRev;
    expect(after).toBe(start + 1);
    // A lance changes the grid but not the area.
    build(game, "lance", l.x + 5, l.y + 4);
    run(game, 1);
    expect(game.harvestRev).toBe(after);
  });

  it("adds its yield to the energy coming in", () => {
    const game = field();
    const l = lander(game);
    build(game, "pylon", l.x + 5, l.y);
    game.energy = 0;
    game.capacity = 1000;
    run(game, TICK_HZ * 10);
    // The lander's trickle plus the harvest, for ten seconds; the lander's repairs do not apply at full health.
    expect(game.energy).toBeCloseTo(10 * (1 + FULL * HARVEST_RATE), 1);
  });

  it("is worked out again on load rather than read from the save", () => {
    const game = field();
    const l = lander(game);
    build(game, "pylon", l.x + 5, l.y);
    run(game, 1);
    const data = JSON.parse(save(game)) as { game: { harvest: string } };
    data.game.harvest = btoa(String.fromCharCode(...new Uint8Array(game.w * game.h)));
    expect(load(JSON.stringify(data)).harvest).toEqual(game.harvest);
  });
});
