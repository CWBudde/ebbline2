import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BUILDABLE } from "@ebbline2/engine";
import {
  ART_URL,
  TITLE_ART_URL,
  TITLE_LAYER_URLS,
  illustrationUrl,
  parseAtlas,
  spriteUrl,
  spriteUrls,
  type SpriteKind,
} from "./assets.ts";

const ART = fileURLToPath(new URL("../../public/art/", import.meta.url));
/** Kinds with no generated art yet: the map, the build bar and the briefing show their code drawing. */
const DRAWN_ONLY: readonly SpriteKind[] = ["booster"];
const ALL: readonly SpriteKind[] = ["lander", ...BUILDABLE, "vent", "spitter", "lode"];
const KINDS = ALL.filter((kind) => !DRAWN_ONLY.includes(kind));
/** The file behind an art URL. */
const file = (url: string): string => ART + url.slice(ART_URL.length);

describe("installed art", () => {
  it("has every illustration the helper promises", () => {
    for (const kind of KINDS) {
      const url = illustrationUrl(kind);
      if (url !== undefined) expect(existsSync(file(url)), url).toBe(true);
    }
    for (const kind of [...BUILDABLE, "spitter"] as const) {
      if (!DRAWN_ONLY.includes(kind)) expect(illustrationUrl(kind), kind).toBeDefined();
    }
  });

  it("has the title art and its layers", () => {
    for (const url of [TITLE_ART_URL, ...Object.values(TITLE_LAYER_URLS)]) expect(existsSync(file(url)), url).toBe(true);
  });

  it("has an atlas frame inside the sheet for every map piece", () => {
    const frames = new Set<string>();
    for (const name of ["structures", "features"]) {
      const atlas = parseAtlas(JSON.parse(readFileSync(`${ART}${name}.json`, "utf8")));
      expect(atlas).toBeDefined();
      if (!atlas) continue;
      expect(existsSync(ART + atlas.image)).toBe(true);
      for (const [kind, f] of Object.entries(atlas.frames)) {
        frames.add(kind);
        expect(f.x + f.w).toBeLessThanOrEqual(atlas.size[0]);
        expect(f.y + f.h).toBeLessThanOrEqual(atlas.size[1]);
      }
    }
    for (const kind of KINDS) expect(frames.has(kind), kind).toBe(true);
  });
});

describe("parseAtlas", () => {
  it("rejects malformed descriptions", () => {
    expect(parseAtlas(null)).toBeUndefined();
    expect(parseAtlas({ image: "a.png", cell: 0, frames: {} })).toBeUndefined();
    expect(parseAtlas({ image: "a.png", cell: 128, frames: { pylon: { x: 0, y: 0, w: "1", h: 1 } } })).toBeUndefined();
    expect(parseAtlas({ image: "a.png", cell: 128, frames: { pylon: { x: 0, y: 0, w: 0, h: 1 } } })).toBeUndefined();
  });

  it("accepts the helper's output", () => {
    const atlas = parseAtlas({
      image: "a.png",
      size: [128, 128],
      cell: 128,
      frames: { pylon: { x: 0, y: 0, w: 128, h: 128 } },
    });
    expect(atlas?.frames.pylon).toEqual({ x: 0, y: 0, w: 128, h: 128 });
  });
});

describe("spriteUrl", () => {
  it("follows the signal the renderer fills", () => {
    expect(spriteUrl("pylon")).toBeUndefined();
    spriteUrls.value = { pylon: "data:image/png;base64,AAAA" };
    expect(spriteUrl("pylon")).toBe("data:image/png;base64,AAAA");
    spriteUrls.value = {};
  });
});
