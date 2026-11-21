import { describe, expect, it } from "vitest";
import { distance, tileAtPoint, within } from "./hex.ts";
import { CAMPAIGN, introduced, skirmish } from "./levels.ts";
import { floorCanBeGraded, rotateBend, sinkSector } from "./movingFloor.ts";
import { load, save } from "./save.ts";
import { step } from "./step.ts";
import { BUILDABLE, MAX_HEIGHT, ROCK, TICK_HZ, type Game, type LevelDef } from "./state.ts";
import { generate } from "./terrain.ts";
import { lander } from "./testing/fixtures.ts";

describe("introduced", () => {
  it("names what each campaign mission shows for the first time", () => {
    const none = { spitters: false, survive: false };
    expect(CAMPAIGN.map((level) => [level.id, introduced(level.id)])).toEqual([
      ["c1", { structures: ["pylon", "lance", "cap"], ...none }],
      ["c2", { structures: ["tap", "cell"], ...none }],
      ["c3", { structures: ["lobber"], ...none }],
      ["c4", { structures: ["trunk", "booster"], ...none }],
      ["c5", { structures: ["pump"], ...none }],
      ["c6", { structures: ["baffle", "grader"], spitters: false, survive: true }],
      ["c7", { structures: ["interceptor"], spitters: true, survive: false }],
      ["c8", { structures: [], ...none }],
      ["c9", { structures: [], ...none }],
      ["c10", { structures: ["airfield"], ...none }],
      ["c11", { structures: [], ...none }],
      ["c12", { structures: [], ...none }],
      ["c13", { structures: [], ...none }],
      ["c14", { structures: [], ...none }],
      ["c15", { structures: ["spring"], ...none }],
    ]);
  });

  it("introduces every buildable structure exactly once over the campaign", () => {
    const all = CAMPAIGN.flatMap((level) => introduced(level.id).structures);
    expect([...all].sort()).toEqual([...BUILDABLE].sort());
  });

  it("introduces nothing outside the campaign", () => {
    const empty = { structures: [], spitters: false, survive: false };
    expect(introduced(skirmish(7, "small", "hard").id)).toEqual(empty);
    expect(introduced("nope")).toEqual(empty);
  });
});

describe("the campaign", () => {
  it("numbers its missions c1 onwards, which saved progress and the translations key on", () => {
    expect(CAMPAIGN.map((level) => level.id)).toEqual(CAMPAIGN.map((_, i) => `c${i + 1}`));
  });

  it("brings spitters and interceptors in together and ends with everything", () => {
    for (const level of CAMPAIGN) {
      expect(level.allowed.includes("interceptor")).toBe(level.spitters.count > 0);
    }
    expect([...(CAMPAIGN.at(-1)?.allowed ?? [])].sort()).toEqual([...BUILDABLE].sort());
    expect(CAMPAIGN.some((level) => level.objective.kind === "survive")).toBe(true);
  });

  // The briefs count these distances in steps, so they must match the generated maps.
  it.each([
    ["c1", 15],
    ["c4", 29],
  ])("puts the nearest vent of %s %i steps from the lander", (id, steps) => {
    const game = generate(CAMPAIGN.find((level) => level.id === id) as LevelDef);
    const l = lander(game);
    expect(Math.min(...game.vents.map((v) => distance(v.x, v.y, l.x, l.y)))).toBe(steps);
  });
});

describe("moving ground", () => {
  const mission = (id: string): LevelDef => CAMPAIGN.find((level) => level.id === id) as LevelDef;
  const advance = (game: Game, seconds: number): void => {
    for (let i = 0; i < seconds * TICK_HZ; i++) step(game);
  };

  it("leaves the ground of other missions alone", () => {
    const game = generate(mission("c9"));
    const initial = game.height.slice();
    advance(game, 9);
    expect(game.height).toEqual(initial);
    expect(Array.from(game.height.keys()).every((i) => floorCanBeGraded(game, i))).toBe(true);
  });

  it("rolls waves out from a rising plateau over the terrain and keeps the steady ring still", () => {
    const level = mission("c11");
    const game = generate(level);
    const home = lander(game);
    const initial = game.height.slice();
    // The waves move over generated terrain, rock and all, not over a flat map.
    expect(initial).toContain(ROCK);
    expect(new Set(initial.filter((h) => h !== ROCK)).size).toBeGreaterThan(5);

    advance(game, 7);
    expect(game.height).toEqual(initial);
    const still = load(save(game));
    still.level = { ...level, movingFloor: false };
    advance(still, 2);
    advance(game, 2);
    expect(game.silt).not.toEqual(still.silt);

    const plateau = game.height[home.y * game.w + home.x];
    expect(plateau).toBe((initial[home.y * game.w + home.x] ?? 0) + 1);
    within(game.w, game.h, home.x, home.y, 4, (i, ring) => {
      expect(game.height[i]).toBe(ring < 4 ? plateau : initial[i]);
      expect(floorCanBeGraded(game, i)).toBe(ring === 4);
    });
    const outside: boolean[] = [];
    within(game.w, game.h, home.x, home.y, 12, (i, ring) => {
      if (ring > 4) outside.push(game.height[i] !== initial[i]);
    });
    expect(outside).toContain(true);
    expect(outside).toContain(false);

    const resumed = load(save(game));
    advance(game, 19);
    advance(resumed, 19);
    expect(resumed.height).toEqual(game.height);
    expect(resumed.silt).toEqual(game.silt);

    // Rock stays, nothing leaves the range of heights, and a whole cycle brings the ground back.
    for (let shift = 0; shift < 6; shift++) {
      advance(game, 8);
      for (const [i, h] of game.height.entries()) {
        if (initial[i] === ROCK) expect(h).toBe(ROCK);
        else expect(h >= 0 && h <= MAX_HEIGHT).toBe(true);
      }
    }
    // Two whole cycles of six eight-second shifts.
    advance(game, 96 - game.tick / TICK_HZ);
    expect(game.height).toEqual(initial);
  });

  it("floods the bend and moves its shoals out of phase without moving the headland or the islands", () => {
    const level = mission("c12");
    const game = generate(level);
    const home = lander(game);
    const initial = game.height.slice();
    expect(home.x).toBeGreaterThan(game.w / 2);
    expect(home.y).toBeLessThan(game.h / 3);
    expect(game.vents.every((v) => v.x > game.w / 2 && v.y >= (2 * game.h) / 3)).toBe(true);
    const islandTops = [
      [0.363, 0.326],
      [0.404, 0.541],
      [0.558, 0.556],
      [0.681, 0.399],
    ].map(([x = 0, y = 0]) => {
      const p = rotateBend({ x: x * game.w, y: y * game.w }, game.w);
      const tile = tileAtPoint(p.x, p.y);
      return tile.y * game.w + tile.x;
    });
    for (const i of islandTops) {
      expect(game.height[i]).toBeGreaterThanOrEqual(7);
      expect(game.silt[i]).toBe(0);
    }
    expect(game.silt.some((depth) => depth > 0)).toBe(true);
    const raised = (): number[] =>
      Array.from(game.height.keys()).filter((i) => (game.height[i] ?? 0) > (initial[i] ?? 0));

    advance(game, 8);
    const firstShoal = raised();
    expect(firstShoal.length).toBeGreaterThan(1);
    const restored = load(save(game));
    const fixed = load(save(game));
    fixed.level = { ...level, landform: "horseshoe" };
    advance(fixed, 8);
    advance(game, 8);
    expect(game.silt).not.toEqual(fixed.silt);
    advance(restored, 8);
    const secondShoal = raised().filter((i) => !firstShoal.includes(i));
    expect(secondShoal.length).toBeGreaterThan(1);
    for (const i of [...firstShoal, ...secondShoal]) expect(floorCanBeGraded(game, i)).toBe(false);
    for (const i of islandTops) {
      expect(game.height[i]).toBe(initial[i]);
      expect(floorCanBeGraded(game, i)).toBe(true);
    }
    expect(restored.height).toEqual(game.height);
    expect(restored.silt).toEqual(game.silt);
    within(game.w, game.h, home.x, home.y, 3, (i) => {
      expect(game.height[i]).toBe(initial[i]);
    });

    advance(game, 32);
    expect(game.height).toEqual(initial);
  });
});

describe("sinking land", () => {
  const atlantis = CAMPAIGN.find((level) => level.id === "c13") as LevelDef;
  const advance = (game: Game, seconds: number): void => {
    for (let i = 0; i < seconds * TICK_HZ; i++) step(game);
  };

  it("puts the lander on a great island in a sea, with the vents on its floor and spitters ashore", () => {
    const game = generate(atlantis);
    const home = lander(game);
    expect(game.height[home.y * game.w + home.x]).toBeGreaterThanOrEqual(8);
    for (const v of game.vents) expect(game.height[v.y * game.w + v.x]).toBeLessThanOrEqual(2);
    expect(game.spitters).toHaveLength(atlantis.spitters.count);
    for (const s of game.spitters) expect(game.height[s.y * game.w + s.x]).toBeGreaterThan(4);
    // The island: land reachable from the lander over ground above the sea.
    const land = new Set([home.y * game.w + home.x]);
    for (const i of land) {
      within(game.w, game.h, i % game.w, Math.floor(i / game.w), 1, (j) => {
        if ((game.height[j] ?? 0) > 4) land.add(j);
      });
    }
    expect(land.size).toBeGreaterThan(game.w * game.h * 0.2);
  });

  it("lowers one eighth of the land after the other, keeps rock, the sea floor and the lander level, and resumes from a save", () => {
    const game = generate(atlantis);
    const home = lander(game);
    const initial = game.height.slice();
    const sectors = Array.from(initial.keys(), (i) => sinkSector(game, i));
    within(game.w, game.h, home.x, home.y, 1, (i) => {
      expect(sectors[i]).toBe(sectors[home.y * game.w + home.x]);
    });
    expect(new Set(sectors).size).toBe(8);

    const sector = (atlantis.sinking?.every ?? 0) / 8;
    advance(game, sector - 1);
    expect(game.height).toEqual(initial);
    advance(game, 1);
    const first = sectors[initial.findIndex((h, i) => h > 2 && game.height[i] !== h)];
    expect(first).toBeDefined();
    for (const [i, h] of initial.entries()) {
      const sinks = h !== ROCK && h > 2 && sectors[i] === first;
      expect(game.height[i]).toBe(sinks ? h - 1 : h);
    }

    const resumed = load(save(game));
    advance(game, 7 * sector + 1);
    advance(resumed, 7 * sector + 1);
    expect(resumed.height).toEqual(game.height);

    // After a whole round every piece of land is a step lower.
    for (const [i, h] of initial.entries()) {
      expect(game.height[i]).toBe(h === ROCK || h <= 2 ? h : h - 1);
    }
  });
});

describe("the levee", () => {
  const levee = CAMPAIGN.find((level) => level.id === "c14") as LevelDef;

  it("holds the sea off a low, dry basin round the lander with a thin wall, low only at the notches", () => {
    const game = generate(levee);
    const home = lander(game);
    const sea = levee.sea ?? 0;
    expect(game.height[home.y * game.w + home.x]).toBeLessThanOrEqual(3);
    // The basin: everything reachable from the lander over ground below the sea, all of it dry.
    const basin = new Set([home.y * game.w + home.x]);
    for (const i of basin) {
      within(game.w, game.h, i % game.w, Math.floor(i / game.w), 1, (j) => {
        const h = game.height[j] ?? 0;
        if (h !== ROCK && h < sea) basin.add(j);
      });
    }
    expect(basin.size).toBeGreaterThan(game.w * game.h * 0.25);
    for (const i of basin) expect(game.silt[i]).toBe(0);
    // Its rim: the tiles next to the basin that are not part of it. Most stand above the sea, a few level with it,
    // and outside them the sea stands right up to the brim.
    const rim = new Set<number>();
    for (const i of basin) {
      within(game.w, game.h, i % game.w, Math.floor(i / game.w), 1, (j) => {
        if (!basin.has(j) && game.height[j] !== ROCK) rim.add(j);
      });
    }
    const heights = [...rim].map((i) => game.height[i] ?? 0);
    expect(Math.min(...heights)).toBe(sea);
    expect(new Set(heights.filter((h) => h > sea)).size).toBeGreaterThan(1);
    expect(heights.filter((h) => h === sea).length).toBeLessThan(heights.length / 8);
    for (const v of game.vents) {
      expect(basin.has(v.y * game.w + v.x)).toBe(false);
      expect(game.silt[v.y * game.w + v.x]).toBeGreaterThanOrEqual(sea - 2);
    }
    for (const s of game.spitters) expect(game.height[s.y * game.w + s.x]).toBeGreaterThan(sea);
  });

  it("spills over its notches into the basin once the vents raise the sea", () => {
    const game = generate(levee);
    const home = lander(game);
    for (let i = 0; i < 90 * TICK_HZ; i++) step(game);
    let inside = 0;
    within(game.w, game.h, home.x, home.y, 15, (i) => (inside += game.silt[i] ?? 0));
    expect(inside).toBeGreaterThan(0);
  });
});

describe("the slope", () => {
  const slope = CAMPAIGN.find((level) => level.id === "c15") as LevelDef;

  it("rises from a sea along the south edge to the lander near the north edge", () => {
    const game = generate(slope);
    const home = lander(game);
    const sea = slope.sea ?? 0;
    expect(home.y).toBeLessThan(game.h * 0.2);
    expect(game.height[home.y * game.w + home.x]).toBeGreaterThanOrEqual(8);
    const rowMean = (y: number): number => {
      let sum = 0;
      let n = 0;
      for (let x = 0; x < game.w; x++) {
        const h = game.height[y * game.w + x] ?? ROCK;
        if (h === ROCK) continue;
        sum += h;
        n += 1;
      }
      return sum / n;
    };
    // The ground climbs from the foot to the top, band by band.
    const bands = [0, 1, 2, 3].map((b) => {
      let sum = 0;
      for (let y = Math.floor((b * game.h) / 4); y < Math.floor(((b + 1) * game.h) / 4); y++) sum += rowMean(y);
      return sum;
    });
    expect(bands[0]).toBeGreaterThan(bands[1] as number);
    expect(bands[1]).toBeGreaterThan(bands[2] as number);
    expect(bands[2]).toBeGreaterThan(bands[3] as number);
    // The sea covers most of the lower land, from half to three quarters of the map, and none of the top fifth.
    let wet = 0;
    for (let i = 0; i < game.silt.length; i++) {
      if ((game.silt[i] ?? 0) <= 0) continue;
      wet += 1;
      expect(Math.floor(i / game.w)).toBeGreaterThan(game.h / 5);
    }
    expect(wet).toBeGreaterThan(game.w * game.h * 0.5);
    expect(wet).toBeLessThan(game.w * game.h * 0.75);
    // The vents stand deep in it near the foot; lodes and spitters on dry land above it.
    for (const v of game.vents) {
      expect(v.y).toBeGreaterThan(game.h * 0.7);
      expect(game.silt[v.y * game.w + v.x]).toBeGreaterThanOrEqual(sea - 1);
    }
    for (let i = 0; i < game.lode.length; i++) {
      if (game.lode[i] === 1) expect(game.height[i]).toBeGreaterThan(sea);
    }
    for (const s of game.spitters) expect(game.height[s.y * game.w + s.x]).toBeGreaterThan(sea);
  });

  it("has gullies running down it, two steps below the ground beside them", () => {
    const game = generate(slope);
    const at = (x: number, y: number): number => game.height[y * game.w + x] ?? ROCK;
    for (const share of [0.35, 0.5, 0.65]) {
      const y = Math.floor(game.h * share);
      // Runs of tiles at least two steps below ground no more than four tiles to the west and to the east.
      let runs = 0;
      let inside = false;
      for (let x = 0; x < game.w; x++) {
        const h = at(x, y);
        let west = -1;
        let east = -1;
        for (let d = 1; d <= 4; d++) {
          if (x - d >= 0) west = Math.max(west, at(x - d, y));
          if (x + d < game.w) east = Math.max(east, at(x + d, y));
        }
        const low = h !== ROCK && h <= west - 2 && h <= east - 2;
        if (low && !inside) runs += 1;
        inside = low;
      }
      expect(runs).toBeGreaterThanOrEqual(3);
    }
  });
});
