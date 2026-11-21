// Loads the generated art for the map. Everything here may fail: a missing or broken file leaves its
// entry out and the renderer draws that piece in code instead.

import { Assets, Rectangle, Texture, type TextureSource } from "pixi.js";
import { ART_URL, ATLAS_URLS, MATERIAL_URLS, parseAtlas, type SpriteKind } from "./assets.ts";
import type { Materials } from "./terrain.ts";

export interface SpriteArt {
  texture: Texture;
  /** Texture pixels per map tile. */
  perTile: number;
}

export interface Art {
  sprites: Map<SpriteKind, SpriteArt>;
  /** The same sprites as PNG data URLs, for the DOM. */
  urls: Partial<Record<SpriteKind, string>>;
  materials: Materials;
}

const KNOWN: ReadonlySet<string> = new Set<SpriteKind>([
  "lander", "pylon", "trunk", "tap", "cell", "pump", "lance", "lobber", "baffle", "interceptor",
  "grader", "cap", "booster", "airfield", "vent", "spitter", "lode",
]);

/** Largest edge of a sprite data URL in pixels. */
const URL_SIZE = 128;

function dataUrl(source: TextureSource, x: number, y: number, w: number, h: number): string | undefined {
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, URL_SIZE / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source.resource as CanvasImageSource, x, y, w, h, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

async function loadAtlas(url: string, art: Art): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const atlas = parseAtlas(await response.json());
    if (!atlas) return;
    // Sprites are shown far smaller than they are stored, so they need mipmaps to stay clean.
    const sheet = await Assets.load<Texture>({
      src: ART_URL + atlas.image,
      data: { autoGenerateMipmaps: true, scaleMode: "linear", mipmapFilter: "linear" },
    });
    const source = sheet.source;
    for (const [name, f] of Object.entries(atlas.frames)) {
      if (!KNOWN.has(name)) continue;
      if (f.x < 0 || f.y < 0 || f.x + f.w > source.pixelWidth || f.y + f.h > source.pixelHeight) continue;
      const kind = name as SpriteKind;
      art.sprites.set(kind, {
        texture: new Texture({ source, frame: new Rectangle(f.x, f.y, f.w, f.h) }),
        perTile: atlas.cell,
      });
      const png = dataUrl(source, f.x, f.y, f.w, f.h);
      if (png !== undefined) art.urls[kind] = png;
    }
  } catch {
    // No atlas: the code-drawn pieces stay.
  }
}

async function loadImage(url: string): Promise<HTMLImageElement | undefined> {
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image.naturalWidth > 0 ? image : undefined;
  } catch {
    return undefined;
  }
}

/** Loads whatever art is installed; never rejects. */
export async function loadArt(): Promise<Art> {
  const art: Art = { sprites: new Map(), urls: {}, materials: {} };
  const [ground, rock] = await Promise.all([
    loadImage(MATERIAL_URLS.ground),
    loadImage(MATERIAL_URLS.rock),
    loadAtlas(ATLAS_URLS.structures, art),
    loadAtlas(ATLAS_URLS.features, art),
  ]);
  art.materials = { ground, rock };
  return art;
}
