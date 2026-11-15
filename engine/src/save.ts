// Saves: versioned JSON with the tile arrays packed as base64.

import { type Game } from "./state.ts";

/** 2: every built structure relays packets, so the derived grid of a schema 1 save is stale. */
export const SAVE_SCHEMA = 2;
/** Older schemas that load can still read; their derived grid state is rebuilt on the next step. */
const STALE_GRID_SCHEMAS: readonly number[] = [1];

type Packed = { [K in keyof Game]: Game[K] extends ArrayBufferView ? string : Game[K] };

const ARRAYS = {
  height: Int8Array,
  silt: Float32Array,
  siltNext: Float32Array,
  lode: Uint8Array,
  mark: Int8Array,
  occ: Int32Array,
  baffle: Uint8Array,
} as const;

function pack(view: ArrayBufferView): string {
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  let text = "";
  for (const b of bytes) text += String.fromCharCode(b);
  return btoa(text);
}

function unpack(text: string): ArrayBuffer {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

export function save(game: Game): string {
  const packed: Record<string, unknown> = { ...game };
  for (const key of Object.keys(ARRAYS) as (keyof typeof ARRAYS)[]) {
    packed[key] = pack(game[key]);
  }
  // Infinity does not survive JSON; a cut-off structure is stored as -1.
  packed["structures"] = game.structures.map((s) => ({
    ...s,
    dist: Number.isFinite(s.dist) ? s.dist : -1,
  }));
  return JSON.stringify({ schema: SAVE_SCHEMA, game: packed });
}

export function load(text: string): Game {
  const data = JSON.parse(text) as { schema?: number; game?: Packed };
  const stale = data.schema !== undefined && STALE_GRID_SCHEMAS.includes(data.schema);
  if ((data.schema !== SAVE_SCHEMA && !stale) || !data.game) {
    throw new Error(`unsupported save schema ${String(data.schema)}`);
  }
  const packed = data.game;
  const game = {
    ...packed,
    height: new Int8Array(unpack(packed.height)),
    silt: new Float32Array(unpack(packed.silt)),
    siltNext: new Float32Array(unpack(packed.siltNext)),
    lode: new Uint8Array(unpack(packed.lode)),
    mark: new Int8Array(unpack(packed.mark)),
    occ: new Int32Array(unpack(packed.occ)),
    baffle: new Uint8Array(unpack(packed.baffle)),
  } satisfies Game;
  for (const s of game.structures) {
    if (s.dist < 0) s.dist = Infinity;
  }
  // The routing rules changed since this save; recompute links, distances and parents.
  if (stale) game.gridDirty = true;
  return game;
}

/** A short fingerprint of the whole state, for determinism checks. */
export function fingerprint(game: Game): string {
  const text = save(game);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
