// The interface language: which one is active, and every lookup of translated text.
//
// All lookups read the `lang` signal, so a component that calls them while rendering is drawn
// again when the language changes.

import { signal } from "@preact/signals";
import { KINDS, type Kind, type PlaceError } from "@ebbline2/engine";
import { de, deContent } from "./de.ts";
import { en, type Content, type Key } from "./en.ts";
import { es, esContent } from "./es.ts";
import { fr, frContent } from "./fr.ts";
import { it, itContent } from "./it.ts";
import { ja, jaContent } from "./ja.ts";
import { nl, nlContent } from "./nl.ts";
import { pl, plContent } from "./pl.ts";
import { pt, ptContent } from "./pt.ts";
import { ru, ruContent } from "./ru.ts";
import { th, thContent } from "./th.ts";
import { tr, trContent } from "./tr.ts";
import { zh, zhContent } from "./zh.ts";

export type { Content, Key, LevelText } from "./en.ts";

export type Lang = "en" | "de" | "fr" | "es" | "it" | "pt" | "nl" | "pl" | "ru" | "tr" | "zh" | "ja" | "th";
export type LangSetting = "auto" | Lang;

/** The choices of the language setting, with each language named in itself. */
export const LANGUAGES: readonly { readonly id: Lang; readonly name: string }[] = [
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
  { id: "fr", name: "Français" },
  { id: "es", name: "Español" },
  { id: "it", name: "Italiano" },
  { id: "pt", name: "Português" },
  { id: "nl", name: "Nederlands" },
  { id: "pl", name: "Polski" },
  { id: "ru", name: "Русский" },
  { id: "tr", name: "Türkçe" },
  { id: "zh", name: "简体中文" },
  { id: "ja", name: "日本語" },
  { id: "th", name: "ไทย" },
];

export const TEXT: Readonly<Record<Lang, Readonly<Record<Key, string>>>> = {
  en, de, fr, es, it, pt, nl, pl, ru, tr, zh, ja, th,
};
/** English content is the engine's own text. */
export const CONTENT: Readonly<Partial<Record<Lang, Content>>> = {
  de: deContent,
  fr: frContent,
  es: esContent,
  it: itContent,
  pt: ptContent,
  nl: nlContent,
  pl: plContent,
  ru: ruContent,
  tr: trContent,
  zh: zhContent,
  ja: jaContent,
  th: thContent,
};

/** The active language. Set it through `setLanguage`. */
export const lang = signal<Lang>("en");

export function isLangSetting(value: unknown): value is LangSetting {
  return value === "auto" || LANGUAGES.some((l) => l.id === value);
}

/** The language for a setting; `auto` takes the first supported one the browser asks for. */
export function detect(setting: LangSetting, languages: readonly string[]): Lang {
  if (setting !== "auto") return setting;
  for (const tag of languages) {
    const primary = tag.toLowerCase().split("-")[0];
    const found = LANGUAGES.find((l) => l.id === primary);
    if (found) return found.id;
  }
  return "en";
}

/** Activates the language for a setting and labels the document with it. */
export function setLanguage(setting: LangSetting): void {
  lang.value = detect(setting, typeof navigator === "undefined" ? [] : navigator.languages);
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang.value;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
}

export type Vars = Readonly<Record<string, string | number>>;

/** Replaces each `{name}` in a text; an unknown name is left as it is. */
export function fill(text: string, vars: Vars): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = vars[name];
    return value === undefined ? whole : String(value);
  });
}

/** The text for a key in the active language. */
export function t(key: Key, vars?: Vars): string {
  const text = TEXT[lang.value][key];
  return vars ? fill(text, vars) : text;
}

const formats = new Map<string, Intl.NumberFormat>();

/** A number in the active locale, with a fixed count of decimals. */
export function num(value: number, decimals = 0): string {
  const id = `${lang.value}/${decimals}`;
  let format = formats.get(id);
  if (!format) {
    format = new Intl.NumberFormat(lang.value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formats.set(id, format);
  }
  return format.format(value);
}

const percents = new Map<string, Intl.NumberFormat>();

/** A share from 0 to 1 as a whole percentage in the active locale, such as 45% or 45 %. */
export function percent(share: number): string {
  let format = percents.get(lang.value);
  if (!format) {
    format = new Intl.NumberFormat(lang.value, { style: "percent", maximumFractionDigits: 0 });
    percents.set(lang.value, format);
  }
  return format.format(share);
}

/** A mission time as minutes and seconds, such as 4:07. */
export function clock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const s = whole % 60;
  return `${num(Math.floor(whole / 60))}:${s < 10 ? num(0) : ""}${num(s)}`;
}

export function kindName(kind: Kind): string {
  return CONTENT[lang.value]?.kinds[kind].name ?? KINDS[kind].name;
}

export function kindBlurb(kind: Kind): string {
  return CONTENT[lang.value]?.kinds[kind].blurb ?? KINDS[kind].blurb;
}

/** What identifies a level and carries its English text; a `LevelDef` fits. */
export interface LevelRef {
  readonly id: string;
  readonly name: string;
  readonly brief?: string;
  readonly hints?: readonly string[];
}

/** The seed of a skirmish level id (`s-<seed>-<size>-<difficulty>`), if it is one. */
function skirmishSeed(id: string): string | undefined {
  return /^s-(-?\d+)-/.exec(id)?.[1];
}

export function levelName(level: LevelRef): string {
  const content = CONTENT[lang.value];
  if (!content) return level.name;
  const seed = skirmishSeed(level.id);
  if (seed !== undefined) return fill(content.skirmish.name, { seed });
  return content.levels[level.id]?.name ?? level.name;
}

export function levelBrief(level: LevelRef): string {
  const content = CONTENT[lang.value];
  if (!content) return level.brief ?? "";
  if (skirmishSeed(level.id) !== undefined) return content.skirmish.brief;
  return content.levels[level.id]?.brief ?? level.brief ?? "";
}

/** The hints of a level; one that has no translation stays English. */
export function levelHints(level: LevelRef): readonly string[] {
  const translated = CONTENT[lang.value]?.levels[level.id]?.hints;
  const hints = level.hints ?? [];
  return translated ? hints.map((hint, i) => translated[i] ?? hint) : hints;
}

/** Why a structure cannot be placed, for a code from the engine's `placeError`. */
export function placeErrorText(code: PlaceError): string {
  return t(`place.${code}`);
}
