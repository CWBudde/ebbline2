import { afterEach, describe, expect, it } from "vitest";
import { BUILDABLE, CAMPAIGN, KINDS, skirmish, type Kind, type PlaceError } from "@ebbline2/engine";
import { deContent } from "./de.ts";
import { en, type Content, type Key } from "./en.ts";
import {
  CONTENT,
  LANGUAGES,
  TEXT,
  type Lang,
  clock,
  detect,
  fill,
  kindBlurb,
  kindName,
  lang,
  levelBrief,
  levelHints,
  levelName,
  num,
  placeErrorText,
  setLanguage,
  t,
} from "./index.ts";

const KEYS = Object.keys(en) as Key[];
const PLACE_ERRORS: Record<PlaceError, true> = {
  locked: true,
  outside: true,
  rock: true,
  occupied: true,
  flooded: true,
  "needs lode": true,
  "needs vent": true,
  vent: true,
  spitter: true,
};

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1] ?? "").sort();
}

afterEach(() => {
  lang.value = "en";
});

/** Every language besides English, which is the source. */
const OTHERS = LANGUAGES.map((l) => l.id).filter((id): id is Exclude<Lang, "en"> => id !== "en");

function contentOf(id: Lang): Content {
  const content = CONTENT[id];
  if (!content) throw new Error(`no content for ${id}`);
  return content;
}

describe("dictionaries", () => {
  it("covers every language that the setting offers", () => {
    expect(Object.keys(TEXT).sort()).toEqual(LANGUAGES.map((l) => l.id).sort());
    expect(Object.keys(CONTENT).sort()).toEqual([...OTHERS].sort());
    expect(new Set(LANGUAGES.map((l) => l.name)).size).toBe(LANGUAGES.length);
  });

  describe.each(OTHERS)("%s", (id) => {
    const text = TEXT[id];
    const content = contentOf(id);

    it("has the same keys as English, none of them empty", () => {
      expect(Object.keys(text).sort()).toEqual([...KEYS].sort());
      for (const key of KEYS) expect(text[key].trim(), key).not.toBe("");
    });

    it("uses the same placeholders and marks as English", () => {
      for (const key of KEYS) {
        expect(placeholders(text[key]), key).toEqual(placeholders(en[key]));
        for (const mark of [/\*[^*]+\*/g, /_[^_]+_/g]) {
          expect(text[key].match(mark)?.length ?? 0, key).toBe(en[key].match(mark)?.length ?? 0);
        }
      }
      expect(placeholders(content.skirmish.name)).toEqual(["seed"]);
      expect(placeholders(content.skirmish.brief)).toEqual([]);
    });

    it("has text for every campaign level and each of its hints", () => {
      expect(Object.keys(content.levels).sort()).toEqual(CAMPAIGN.map((l) => l.id).sort());
      for (const level of CAMPAIGN) {
        const lt = content.levels[level.id];
        expect(lt?.name.trim(), level.id).toBeTruthy();
        expect(lt?.brief.trim(), level.id).toBeTruthy();
        expect(lt?.brief, level.id).not.toBe(level.brief);
        expect(lt?.hints.length, level.id).toBe(level.hints.length);
        level.hints.forEach((hint, i) => {
          expect(lt?.hints[i]?.trim(), `${level.id} hint ${i}`).toBeTruthy();
          expect(lt?.hints[i], `${level.id} hint ${i}`).not.toBe(hint);
        });
      }
    });

    it("has a name and description for every structure kind", () => {
      const kinds = Object.keys(KINDS) as Kind[];
      expect(Object.keys(content.kinds).sort()).toEqual([...kinds].sort());
      for (const kind of kinds) {
        expect(content.kinds[kind].name.trim(), kind).not.toBe("");
        expect(content.kinds[kind].blurb.trim(), kind).not.toBe("");
        expect(content.kinds[kind].blurb, kind).not.toBe(KINDS[kind].blurb);
      }
      expect(BUILDABLE.every((kind) => kind in content.kinds)).toBe(true);
    });

    it("has its own text for every placement error", () => {
      for (const code of Object.keys(PLACE_ERRORS) as PlaceError[]) {
        const english = placeErrorText(code);
        lang.value = id;
        const translated = placeErrorText(code);
        lang.value = "en";
        expect(english.trim(), code).not.toBe("");
        expect(translated.trim(), code).not.toBe("");
        expect(translated, code).not.toBe(english);
      }
    });

    it("formats numbers with Latin digits and times as minutes:seconds", () => {
      lang.value = id;
      expect(num(12345).replace(/\D/g, "")).toBe("12345");
      expect(num(0.5, 1)).toMatch(/^0[.,]5$/);
      expect(clock(247)).toBe("4:07");
      expect(clock(3600)).toBe("60:00");
    });
  });
});

describe("language", () => {
  it("takes the first supported language the browser lists, else English", () => {
    expect(detect("auto", ["de-AT", "en"])).toBe("de");
    expect(detect("auto", ["sv", "en-GB"])).toBe("en");
    expect(detect("auto", ["sv"])).toBe("en");
    expect(detect("auto", ["fr-CA", "en"])).toBe("fr");
    expect(detect("auto", ["pt-BR"])).toBe("pt");
    expect(detect("auto", ["zh-CN", "en"])).toBe("zh");
    expect(detect("auto", ["ko", "ja-JP"])).toBe("ja");
    expect(detect("auto", [])).toBe("en");
    expect(detect("auto", ["DE"])).toBe("de");
    // "den" is not German: only the primary subtag counts.
    expect(detect("auto", ["den", "de"])).toBe("de");
  });

  it("lets an explicit setting win over the browser", () => {
    expect(detect("en", ["de-DE", "de"])).toBe("en");
    expect(detect("de", ["en-US"])).toBe("de");
  });

  it("switches every lookup with the signal", () => {
    setLanguage("de");
    expect(lang.value).toBe("de");
    expect(t("menu.settings")).toBe("Einstellungen");
    expect(t("campaign.best", { time: "1:05" })).toBe("Bestzeit 1:05");
    expect(kindName("cap")).toBe("Kappe");
    setLanguage("en");
    expect(t("menu.settings")).toBe("Settings");
    expect(kindName("cap")).toBe("Cap");
    expect(kindBlurb("cap")).toBe(KINDS.cap.blurb);
  });

  it("fills named placeholders and leaves unknown ones alone", () => {
    expect(fill("{a} of {b}, {c}", { a: 1, b: "two" })).toBe("1 of two, {c}");
  });

  it("formats numbers and times for the language", () => {
    expect(num(1.25, 1)).toBe("1.3");
    expect(num(12345)).toBe("12,345");
    expect(clock(247)).toBe("4:07");
    expect(clock(3600)).toBe("60:00");
    lang.value = "de";
    expect(num(0.5, 1)).toBe("0,5");
    expect(num(12345)).toBe("12.345");
    expect(clock(247)).toBe("4:07");
    lang.value = "fr";
    expect(num(12345)).toBe("12\u202f345");
    expect(num(0.5, 1)).toBe("0,5");
    lang.value = "ru";
    expect(num(12345)).toBe("12\u00a0345");
    lang.value = "ja";
    expect(num(12345)).toBe("12,345");
  });
});

describe("level text", () => {
  const first = CAMPAIGN[0];
  if (!first) throw new Error("no campaign");

  it("is the engine's own text in English", () => {
    expect(levelName(first)).toBe(first.name);
    expect(levelBrief(first)).toBe(first.brief);
    expect(levelHints(first)).toEqual(first.hints);
    expect(levelName(skirmish(42, "small", "easy"))).toBe("Skirmish 42");
  });

  it("is looked up by id in German", () => {
    lang.value = "de";
    expect(levelName(first)).toBe("Landung");
    expect(levelBrief(first)).toBe(deContent.levels["c1"]?.brief);
    expect(levelHints(first)).toEqual(deContent.levels["c1"]?.hints);
    const level = skirmish(-7, "large", "hard");
    expect(levelName(level)).toBe("Gefecht -7");
    expect(levelBrief(level)).toBe("Verschließ jeden Schlot.");
    expect(levelHints(level)).toEqual([]);
  });

  it("names a saved game by its id, and an old save by its stored name", () => {
    lang.value = "de";
    expect(levelName({ id: "c2", name: "Two Fronts" })).toBe("Zwei Fronten");
    expect(levelName({ id: "c4", name: "Far Reaches" })).toBe("Weites Land");
    expect(levelName({ id: "", name: "Far Reaches" })).toBe("Far Reaches");
  });
});
