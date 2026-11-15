import { describe, expect, it } from "vitest";
import { apply } from "./commands.ts";
import { CAMPAIGN } from "./levels.ts";
import { SAVE_SCHEMA, fingerprint, load, save } from "./save.ts";
import { step } from "./step.ts";
import { generate } from "./terrain.ts";
import { think } from "./testing/bot.ts";
import { type Game, type LevelDef } from "./state.ts";

// The first mission with spitters, so they are part of the saved state.
const level = CAMPAIGN.find((l) => l.spitters.count > 0) as LevelDef;

function advance(game: Game, ticks: number): void {
  for (let n = 0; n < ticks; n++) {
    if (game.tick % 15 === 0) for (const c of think(game)) apply(game, c);
    step(game);
  }
}

describe("saves", () => {
  it("round-trip the whole state", () => {
    const game = generate(level);
    advance(game, 1500);
    const text = save(game);
    expect((JSON.parse(text) as { schema: number }).schema).toBe(SAVE_SCHEMA);
    const copy = load(text);
    expect(copy).toEqual(game);
    expect(fingerprint(copy)).toBe(fingerprint(game));
  });

  it("continue exactly like the game they were taken from", () => {
    const game = generate(level);
    advance(game, 900);
    const copy = load(save(game));
    advance(game, 900);
    advance(copy, 900);
    expect(fingerprint(copy)).toBe(fingerprint(game));
  });

  it("refuse saves from the square-tile map", () => {
    expect(SAVE_SCHEMA).toBe(3);
    const game = generate(level);
    advance(game, 300);
    for (const schema of [1, 2]) {
      const old = JSON.parse(save(game)) as { schema: number };
      old.schema = schema;
      expect(() => load(JSON.stringify(old))).toThrow(`unsupported save schema ${schema}`);
    }
  });

  it("reject other schemas", () => {
    expect(() => load('{"schema":99}')).toThrow("unsupported save schema 99");
  });
});

describe("determinism", () => {
  it("gives the same game for the same seed and commands", () => {
    const a = generate(level);
    const b = generate(level);
    advance(a, 2400);
    advance(b, 2400);
    expect(fingerprint(a)).toBe(fingerprint(b));
    expect(a.structures.length).toBeGreaterThan(5);
  });
});
