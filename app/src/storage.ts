// Settings, campaign progress and saves in localStorage. Every access may fail (private windows,
// blocked site data), so the game must work with nothing stored.

import { isLangSetting, type LangSetting } from "./i18n/index.ts";

export interface Settings {
  /** Interface language; `auto` follows the browser. */
  language: LangSetting;
  volume: number;
  music: boolean;
  edgeScroll: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  language: "auto",
  volume: 0.6,
  music: true,
  edgeScroll: false,
  reducedMotion: false,
};

export interface SavedGame {
  /** Level id, for showing the name in the active language; empty in saves older than the field. */
  id: string;
  /** English level name. */
  name: string;
  /** Seconds played. */
  seconds: number;
  /** Wall-clock time of the save, in milliseconds. */
  when: number;
  data: string;
}

export type Backing = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const KEYS = {
  settings: "ebbline2.settings",
  progress: "ebbline2.progress",
  save: "ebbline2.save",
} as const;

export class Store {
  private readonly backing: Backing | null;

  constructor(backing: Backing | null) {
    this.backing = backing;
  }

  private read(key: string): unknown {
    try {
      const text = this.backing?.getItem(key);
      return text == null ? undefined : (JSON.parse(text) as unknown);
    } catch {
      return undefined;
    }
  }

  private write(key: string, value: unknown): boolean {
    try {
      if (!this.backing) return false;
      this.backing.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  settings(): Settings {
    const stored = this.read(KEYS.settings);
    const settings: Settings = { ...DEFAULT_SETTINGS, ...(typeof stored === "object" ? stored : {}) };
    // Settings stored before the language choice existed, or with a language since removed.
    if (!isLangSetting(settings.language)) settings.language = DEFAULT_SETTINGS.language;
    return settings;
  }

  setSettings(settings: Settings): void {
    this.write(KEYS.settings, settings);
  }

  /** Best time in seconds per finished level id. */
  progress(): Record<string, number> {
    const stored = this.read(KEYS.progress);
    return typeof stored === "object" && stored !== null
      ? (stored as Record<string, number>)
      : {};
  }

  /** Records a win and returns whether it is a new best time. */
  recordWin(id: string, seconds: number): boolean {
    const progress = this.progress();
    const best = progress[id];
    if (best !== undefined && best <= seconds) return false;
    progress[id] = seconds;
    this.write(KEYS.progress, progress);
    return true;
  }

  saved(): SavedGame | undefined {
    const stored = this.read(KEYS.save) as Partial<SavedGame> | undefined;
    return stored && typeof stored.data === "string" && typeof stored.name === "string"
      ? { id: typeof stored.id === "string" ? stored.id : "", name: stored.name, seconds: stored.seconds ?? 0, when: stored.when ?? 0, data: stored.data }
      : undefined;
  }

  setSaved(game: SavedGame): boolean {
    return this.write(KEYS.save, game);
  }

  clearSaved(): void {
    try {
      this.backing?.removeItem(KEYS.save);
    } catch {
      // Nothing to clear.
    }
  }
}
