import { describe, expect, it } from "vitest";
import { CAMPAIGN, LINK_RANGE, apply, find, generate, reaches } from "@ebbline2/engine";
import { coverageKey, gridCoverage } from "./coverage.ts";

const level = CAMPAIGN[0];
if (!level) throw new Error("no campaign");

describe("gridCoverage", () => {
  it("agrees with the engine about every tile a structure could link from", () => {
    const game = generate(level);
    const covered = gridCoverage(game);
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        // A structure's own tile is covered, though nothing can link from where it stands.
        if (game.structures.some((s) => s.x === x && s.y === y)) continue;
        expect(covered[y * game.w + x] === 1, `${String(x)},${String(y)}`).toBe(reaches(game, "lance", x, y));
      }
    }
  });

  it("grows, and changes its key, only once a planned pylon is built", () => {
    const game = generate(level);
    const lander = find(game, game.landerId);
    if (!lander) throw new Error("no lander");
    const before = gridCoverage(game).reduce((sum, v) => sum + v, 0);
    const key = coverageKey(game);
    let placed = false;
    for (let d = LINK_RANGE; d >= 2 && !placed; d--) {
      for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]] as const) {
        const events = apply(game, { kind: "place", structure: "pylon", x: lander.x + dx, y: lander.y + dy });
        if (events.some((e) => e.kind === "placed")) {
          placed = true;
          break;
        }
      }
    }
    expect(placed).toBe(true);
    expect(coverageKey(game)).toBe(key);
    expect(gridCoverage(game).reduce((sum, v) => sum + v, 0)).toBe(before);
    for (const s of game.structures) s.built = true;
    expect(coverageKey(game)).not.toBe(key);
    expect(gridCoverage(game).reduce((sum, v) => sum + v, 0)).toBeGreaterThan(before);
  });
});
