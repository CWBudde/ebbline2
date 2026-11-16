import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { HISTORY_EVERY, HISTORY_MAX, SERIES } from "./history.ts";
import { CAMPAIGN } from "./levels.ts";
import { fingerprint, load, save } from "./save.ts";
import { step } from "./step.ts";
import { generate } from "./terrain.ts";
import { addVent, build, flat, run } from "./testing/fixtures.ts";
import { think } from "./testing/bot.ts";
import { DRY, PURPOSES, SOURCES, TICK_HZ, type Game, type History, type LevelDef } from "./state.ts";

const level = CAMPAIGN.find((l) => l.spitters.count > 0) as LevelDef;

function advance(game: Game, ticks: number): void {
  for (let n = 0; n < ticks; n++) {
    if (game.tick % 15 === 0) for (const c of think(game)) apply(game, c);
    step(game);
  }
}

function lengths(history: History): number[] {
  return SERIES.map((key) => history[key].length);
}

describe("history", () => {
  it("starts with a sample at tick 0 and takes one a second", () => {
    const game = flat();
    expect(HISTORY_EVERY).toBe(TICK_HZ);
    expect(game.history.tick).toEqual([0]);
    run(game, TICK_HZ - 1);
    expect(game.history.tick).toEqual([0]);
    run(game, 1);
    expect(game.history.tick).toEqual([0, TICK_HZ]);
    run(game, 10 * TICK_HZ);
    expect(game.history.tick).toEqual(Array.from({ length: 12 }, (_, i) => i * TICK_HZ));
    expect(new Set(lengths(game.history))).toEqual(new Set([12]));
  });

  it("thins out a full history: bounded, first sample kept, even spacing, interval doubled", () => {
    const game = flat();
    const every = game.history.every;
    // Exactly full: HISTORY_MAX samples from tick 0 on.
    run(game, (HISTORY_MAX - 1) * every);
    expect(game.history.tick).toHaveLength(HISTORY_MAX);
    expect(game.history.every).toBe(every);
    // The next sample halves the history and joins it at the doubled interval.
    run(game, every);
    expect(game.history.every).toBe(2 * every);
    expect(game.history.tick).toHaveLength(HISTORY_MAX / 2 + 1);
    expect(game.history.tick[0]).toBe(0);
    expect(game.history.tick.at(-1)).toBe(game.tick);
    game.history.tick.forEach((tick, i) => {
      expect(tick).toBe(i * 2 * every);
    });
    expect(new Set(lengths(game.history))).toEqual(new Set([HISTORY_MAX / 2 + 1]));
    // Nothing between the doubled ticks any more.
    run(game, every);
    expect(game.history.tick).toHaveLength(HISTORY_MAX / 2 + 1);
    run(game, every);
    expect(game.history.tick).toHaveLength(HISTORY_MAX / 2 + 2);
  });

  it("stays bounded over a long game", () => {
    const game = flat(24);
    run(game, 3 * HISTORY_MAX * HISTORY_EVERY + 7);
    expect(game.history.tick.length).toBeLessThanOrEqual(HISTORY_MAX);
    expect(game.history.every).toBe(4 * HISTORY_EVERY);
    expect(game.history.tick[0]).toBe(0);
    const ticks = game.history.tick;
    for (let i = 1; i < ticks.length; i++) {
      expect((ticks[i] ?? 0) - (ticks[i - 1] ?? 0)).toBe(game.history.every);
    }
  });

  it("records the state at the sampled tick", () => {
    const game = flat();
    addVent(game, 4, 4, 3);
    addVent(game, 20, 4, 3);
    const vent = game.vents[1];
    if (vent) vent.capped = true;
    build(game, "pylon", 15, 12);
    build(game, "cell", 9, 12);
    game.stats.lost = 2;
    game.stats.removed = 7.25;
    run(game, 3 * TICK_HZ);
    const h = game.history;
    const last = h.tick.length - 1;
    expect(h.tick[last]).toBe(game.tick);
    let silt = 0;
    let flooded = 0;
    for (const depth of game.silt) {
      silt += depth;
      if (depth >= DRY) flooded += 1;
    }
    expect(silt).toBeGreaterThan(0);
    expect(h.silt[last]).toBeCloseTo(silt, 1);
    expect(h.flooded[last]).toBe(flooded);
    expect(flooded).toBeGreaterThan(0);
    expect(h.energy[last]).toBeCloseTo(game.energy, 1);
    expect(h.capacity[last]).toBe(game.capacity);
    expect(h.rateIn[last]).toBeCloseTo(game.rateIn, 1);
    expect(h.rateOut[last]).toBeCloseTo(game.rateOut, 1);
    expect(game.rateIn).toBeGreaterThan(0);
    expect(h.vents[last]).toBe(1);
    expect(h.structures[last]).toBe(game.structures.filter((s) => s.built).length);
    expect(h.structures[last]).toBe(3);
    expect(h.lost[last]).toBe(2);
    expect(h.removed[last]).toBeCloseTo(game.stats.removed, 2);
  });

  it("takes a last sample on the tick the game ends", () => {
    const game = flat();
    addVent(game, 4, 4);
    const vent = game.vents[0];
    run(game, 45);
    if (vent) vent.capped = true;
    run(game, 1);
    expect(game.phase).toBe("won");
    expect(game.history.tick).toEqual([0, TICK_HZ, 46]);
    expect(game.history.vents.at(-1)).toBe(0);
    run(game, TICK_HZ);
    expect(game.history.tick).toHaveLength(3);
  });

  it("splits income by source and spending by purpose, adding up to the totals", () => {
    const game = flat();
    addVent(game, 6, 6, 3);
    build(game, "pylon", 16, 12);
    build(game, "pump", 7, 7);
    game.lode[12 * game.w + 8] = 1;
    build(game, "tap", 8, 12);
    build(game, "lance", 9, 9);
    game.capacity = 1000;
    // A structure under construction, one that needs repair, and energy for the lance.
    apply(game, { kind: "place", structure: "cell", x: 15, y: 14 });
    const pylon = game.structures.find((s) => s.kind === "pylon");
    if (pylon) pylon.health = 1;
    const seen = new Set<string>();
    for (let second = 0; second < 20; second++) {
      run(game, TICK_HZ);
      const flow = game.flow;
      const income = SOURCES.reduce((sum, source) => sum + flow.rateIn[source], 0);
      const spending = PURPOSES.reduce((sum, purpose) => sum + flow.rateOut[purpose], 0);
      expect(income).toBeCloseTo(game.rateIn, 9);
      expect(spending).toBeCloseTo(game.rateOut, 9);
      for (const source of SOURCES) if (flow.rateIn[source] > 0) seen.add(source);
      for (const purpose of PURPOSES) if (flow.rateOut[purpose] > 0) seen.add(purpose);
      const h = game.history;
      const last = h.tick.length - 1;
      expect((h.inLander[last] ?? 0) + (h.inPylon[last] ?? 0) + (h.inTap[last] ?? 0) + (h.inPump[last] ?? 0))
        .toBeCloseTo(h.rateIn[last] ?? 0, 1);
      expect((h.outBuild[last] ?? 0) + (h.outRepair[last] ?? 0) + (h.outSupply[last] ?? 0))
        .toBeCloseTo(h.rateOut[last] ?? 0, 1);
    }
    expect([...seen].sort()).toEqual([...SOURCES, ...PURPOSES].sort());
  });

  it("books only what fits in the bank", () => {
    const game = flat();
    game.energy = game.capacity;
    run(game, 2 * TICK_HZ);
    expect(game.rateIn).toBe(0);
    for (const source of SOURCES) expect(game.flow.rateIn[source]).toBe(0);
  });

  it("survives a save and load", () => {
    const game = generate(level);
    advance(game, 1500);
    expect(game.history.tick.length).toBeGreaterThan(40);
    const copy = load(save(game));
    expect(copy.history).toEqual(game.history);
    advance(game, 600);
    advance(copy, 600);
    expect(copy.history).toEqual(game.history);
  });

  it("is the same for two identical runs", () => {
    const a = generate(level);
    const b = generate(level);
    advance(a, 2400);
    advance(b, 2400);
    expect(a.history).toEqual(b.history);
    expect(fingerprint(a)).toBe(fingerprint(b));
  });
});
