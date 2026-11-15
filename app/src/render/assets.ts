// Where the generated art lives, and which of it is installed. No Pixi and no DOM in here, so the UI
// and the tests can import it freely. Every image is optional: callers fall back when a URL is
// undefined or fails to load.

import { signal } from "@preact/signals";
import type { Kind } from "@ebbline2/engine";

/** Things on the map that have a sprite: every structure and the three natural features. */
export type SpriteKind = Kind | "vent" | "spitter" | "lode";
/** Things with a briefing illustration: the same set; `illustrationUrl` says which are installed. */
export type IllustrationKind = SpriteKind;

/** Folder of the installed art, relative to the page so the site works from any path. */
export const ART_URL = `${import.meta.env.BASE_URL}art/`;

/** Title key art, 16:9 JPEG; the upper left is kept calm for a wordmark. */
export const TITLE_ART_URL = `${ART_URL}title.jpg`;

/** Flat background the illustrations were composited on; a card of this colour shows no box. */
export const ILLUSTRATION_BACKGROUND = "#0b1418";

export const ATLAS_URLS = {
  structures: `${ART_URL}structures.json`,
  features: `${ART_URL}features.json`,
} as const;

export const MATERIAL_URLS = {
  ground: `${ART_URL}ground.jpg`,
  rock: `${ART_URL}rock.jpg`,
} as const;

/** Kinds whose illustration is installed under art/illustrations/. */
const ILLUSTRATED: ReadonlySet<IllustrationKind> = new Set<IllustrationKind>([
  "pylon", "trunk", "tap", "cell", "pump", "lance", "lobber", "baffle", "interceptor", "grader", "cap",
  "spitter", "lander", "vent", "lode",
]);

/** URL of the 320 px three-quarter illustration of a kind, if one is installed. */
export function illustrationUrl(kind: IllustrationKind): string | undefined {
  return ILLUSTRATED.has(kind) ? `${ART_URL}illustrations/${kind}.jpg` : undefined;
}

/**
 * Top-down sprites as PNG data URLs, filled once the renderer has loaded the atlases (or drawn its
 * code fallbacks). Empty until then; reading it in a component re-renders when it fills.
 */
export const spriteUrls = signal<Partial<Record<SpriteKind, string>>>({});

/** Data URL of the top-down map sprite of a kind, once the art has loaded. */
export function spriteUrl(kind: SpriteKind): string | undefined {
  return spriteUrls.value[kind];
}

/** The frame list written next to an atlas PNG by the `sheet` helper. */
export interface AtlasJson {
  image: string;
  size: [number, number];
  cell: number;
  frames: Record<string, { x: number; y: number; w: number; h: number }>;
}

/** Checks the shape of a fetched atlas description. */
export function parseAtlas(value: unknown): AtlasJson | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const v = value as Partial<AtlasJson>;
  if (typeof v.image !== "string" || typeof v.cell !== "number" || v.cell <= 0) return undefined;
  if (typeof v.frames !== "object") return undefined;
  const frames: AtlasJson["frames"] = {};
  for (const [name, f] of Object.entries(v.frames as Record<string, unknown>)) {
    if (typeof f !== "object" || f === null) return undefined;
    const { x, y, w, h } = f as Record<string, unknown>;
    if (typeof x !== "number" || typeof y !== "number" || typeof w !== "number" || typeof h !== "number") {
      return undefined;
    }
    if (w <= 0 || h <= 0) return undefined;
    frames[name] = { x, y, w, h };
  }
  return { image: v.image, size: Array.isArray(v.size) ? v.size : [0, 0], cell: v.cell, frames };
}
