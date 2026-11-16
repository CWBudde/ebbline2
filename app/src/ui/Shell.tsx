// Screens outside a running game: title, campaign, skirmish, settings and help.

import { useEffect, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { BUILDABLE, CAMPAIGN, KINDS, skirmish, type Difficulty, type MapSize } from "@ebbline2/engine";
import type { Controller, Screen } from "../controller.ts";
import { TITLE_ART_URL, TITLE_LAYER_URLS, illustrationUrl, spriteUrl } from "../render/assets.ts";
import { startTitleScene } from "../render/titleScene.ts";
import {
  LANGUAGES,
  clock,
  kindBlurb,
  kindName,
  levelBrief,
  levelName,
  num,
  t,
  type LangSetting,
} from "../i18n/index.ts";

/** Renders the two marks a translated text may carry: *bold* and _silt-coloured_. */
function rich(text: string): ComponentChildren {
  return text.split(/(\*[^*]+\*|_[^_]+_)/).map((part, i) => {
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <b key={i}>{part.slice(1, -1)}</b>;
    if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) {
      return <b key={i} class="silt">{part.slice(1, -1)}</b>;
    }
    return part;
  });
}

const SIZES: readonly MapSize[] = ["small", "medium", "large"];
const DIFFICULTIES: readonly Difficulty[] = ["easy", "normal", "hard"];
/** The rows of the controls table: `help.keys.<row>` names the input, `….does` what it does. */
const KEY_ROWS = [
  "click",
  "drag",
  "cancel",
  "zoom",
  "pan",
  "slots",
  "mark",
  "pause",
  "speed",
  "toggle",
  "dismantle",
  "stats",
] as const;

const ICONS = {
  bolt: "M9 1 3 9h4l-1 6 6-8H8z",
  pause: "M5 3v10M11 3v10",
  menu: "M2 4h12M2 8h12M2 12h12",
  lock: "M4 7h8v7H4zM6 7V5a2 2 0 0 1 4 0v2",
  check: "m3 8.5 3.5 3.5L13 4.5",
  back: "M10 3 5 8l5 5",
  next: "m6 3 5 5-5 5",
  close: "m4 4 8 8M12 4l-8 8",
} as const;

/** A small line icon; decorative, the text beside it carries the meaning. */
export function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

/** An energy price, with the bolt of the energy meter. */
export function Cost({ value }: { value: number }) {
  return <span class="cost"><Icon name="bolt" />{num(value)}</span>;
}

/** A panel with a heading, a scrolling body and an optional row of actions. */
export function Sheet(props: {
  title: string;
  class?: string;
  foot?: ComponentChildren;
  children: ComponentChildren;
}) {
  return (
    <section class={props.class !== undefined ? `sheet ${props.class}` : "sheet"}>
      <header class="sheet-head"><h2>{props.title}</h2></header>
      <div class="sheet-body">{props.children}</div>
      {props.foot !== undefined && <footer class="sheet-foot">{props.foot}</footer>}
    </section>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return <button class="btn quiet" onClick={onClick}><Icon name="back" />{t("common.back")}</button>;
}

/** A menu screen on the dimmed key art. `action` goes to the right of the back button. */
export function Page(props: {
  c: Controller;
  title: string;
  wide?: boolean;
  action?: ComponentChildren;
  children: ComponentChildren;
}) {
  const back = (): void => {
    props.c.screen.value = "title";
  };
  return (
    <div class="screen">
      <img class="backdrop" src={TITLE_ART_URL} alt="" />
      <Sheet
        title={props.title}
        {...(props.wide === true ? { class: "wide" } : {})}
        foot={<><BackButton onClick={back} />{props.action}</>}
      >
        {props.children}
      </Sheet>
    </div>
  );
}

/**
 * The moving title backdrop over the still art. It runs once per mount, so a change of motion
 * mode remounts it (see the `key` in `Title`) with a fresh canvas and WebGL context.
 */
function TitleScene({ still }: { still: boolean }) {
  const scene = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (!scene.current) return undefined;
    return startTitleScene(scene.current, TITLE_LAYER_URLS, { still, onReady: () => { setLive(true); } });
  }, [still]);
  return <canvas ref={scene} class={live ? "backdrop scene live" : "backdrop scene"} aria-hidden="true" />;
}

export function Title({ c }: { c: Controller }) {
  const go = (screen: Screen) => (): void => {
    c.sound.click();
    c.screen.value = screen;
  };
  const saved = c.savedLevel.value;
  const still = c.still.value;
  return (
    <div class="screen title">
      <img class="backdrop" src={TITLE_ART_URL} alt="" />
      <TitleScene key={still ? "still" : "moving"} still={still} />
      <div class="title-inner">
        <header class="title-head">
          <h1 class="wordmark">Ebbline 2</h1>
          <p class="lede">{t("title.lede")}</p>
        </header>
        <nav class="title-menu">
          {saved && (
            <button class="btn primary" onClick={() => { c.resume(); }}>
              {t("title.continue")} <small>{levelName(saved)}</small>
            </button>
          )}
          <button class={saved ? "btn" : "btn primary"} onClick={go("campaign")}>{t("menu.campaign")}</button>
          <button class="btn" onClick={go("skirmish")}>{t("menu.skirmish")}</button>
          <button class="btn" onClick={go("help")}>{t("menu.help")}</button>
          <button class="btn" onClick={go("settings")}>{t("menu.settings")}</button>
          <p class="credit">{t("title.credit")}</p>
        </nav>
      </div>
    </div>
  );
}

export function Campaign({ c }: { c: Controller }) {
  const done = c.progress.value;
  // A mission opens once the one before it is won.
  const open = (index: number): boolean =>
    index === 0 || CAMPAIGN[index - 1]?.id === undefined || (CAMPAIGN[index - 1]?.id ?? "") in done;
  // The mission to play next: the first open one that has not been won.
  const next = CAMPAIGN.findIndex((level, index) => open(index) && !(level.id in done));
  return (
    <Page c={c} title={t("menu.campaign")} wide>
      <ol class="missions">
        {CAMPAIGN.map((level, index) => {
          const best = done[level.id];
          const state = best !== undefined ? "done" : index === next ? "next" : "";
          return (
            <li key={level.id}>
              <button
                class={`mission ${state}`.trimEnd()}
                disabled={!open(index)}
                onClick={() => { c.start(level); }}
              >
                <span class="num">{index + 1}</span>
                <span class="what">
                  <strong class="name">{levelName(level)}</strong>
                  <span class="brief">{open(index) ? levelBrief(level) : t("campaign.locked")}</span>
                </span>
                <span class="state">
                  {best !== undefined && <><Icon name="check" />{t("campaign.best", { time: clock(best) })}</>}
                  {index === next && <><Icon name="next" />{t("campaign.next")}</>}
                  {!open(index) && <Icon name="lock" />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Page>
  );
}

export function Skirmish({ c }: { c: Controller }) {
  const [seed, setSeed] = useState(() => String(Math.floor(Math.random() * 100000)));
  const [size, setSize] = useState<MapSize>("medium");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const value = Number(seed);
  const valid = seed.trim() !== "" && Number.isInteger(value);
  return (
    <Page
      c={c}
      title={t("menu.skirmish")}
      action={
        <button
          class="btn primary"
          disabled={!valid}
          onClick={() => { c.start(skirmish(value, size, difficulty)); }}
        >
          {t("skirmish.start")}
        </button>
      }
    >
      <div class="form">
        <label class="field">
          <span>{t("skirmish.seed")}</span>
          <input
            type="text"
            inputMode="numeric"
            value={seed}
            onInput={(e) => { setSeed(e.currentTarget.value); }}
          />
        </label>
        <label class="field">
          <span>{t("skirmish.size")}</span>
          <select value={size} onChange={(e) => { setSize(e.currentTarget.value as MapSize); }}>
            {SIZES.map((id) => <option key={id} value={id}>{t(`skirmish.size.${id}`)}</option>)}
          </select>
        </label>
        <label class="field">
          <span>{t("skirmish.difficulty")}</span>
          <select value={difficulty} onChange={(e) => { setDifficulty(e.currentTarget.value as Difficulty); }}>
            {DIFFICULTIES.map((id) => <option key={id} value={id}>{t(`skirmish.difficulty.${id}`)}</option>)}
          </select>
        </label>
        <p class="note">{t("skirmish.note")}</p>
      </div>
    </Page>
  );
}

export function SettingsForm({ c }: { c: Controller }) {
  const s = c.settings.value;
  return (
    <div class="settings">
      <label class="field">
        <span>{t("settings.language")}</span>
        <select
          value={s.language}
          onChange={(e) => { c.setSettings({ ...s, language: e.currentTarget.value as LangSetting }); }}
        >
          <option value="auto">{t("settings.language.auto")}</option>
          {LANGUAGES.map((l) => <option key={l.id} value={l.id} lang={l.id}>{l.name}</option>)}
        </select>
      </label>
      <label class="field">
        <span>{t("settings.volume")}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={s.volume}
          onInput={(e) => { c.setSettings({ ...s, volume: Number(e.currentTarget.value) }); }}
        />
      </label>
      <div class="checks">
        <label class="check">
          <input type="checkbox" checked={s.music} onChange={(e) => { c.setSettings({ ...s, music: e.currentTarget.checked }); }} />
          <span>{t("settings.music")}</span>
        </label>
        <label class="check">
          <input type="checkbox" checked={s.edgeScroll} onChange={(e) => { c.setSettings({ ...s, edgeScroll: e.currentTarget.checked }); }} />
          <span>{t("settings.edgeScroll")}</span>
        </label>
        <label class="check">
          <input type="checkbox" checked={s.reducedMotion} onChange={(e) => { c.setSettings({ ...s, reducedMotion: e.currentTarget.checked }); }} />
          <span>{t("settings.reducedMotion")}</span>
        </label>
      </div>
    </div>
  );
}

export function Help() {
  return (
    <div class="help">
      <p class="intro">{rich(t("help.intro"))}</p>
      <section>
        <h3>{t("help.grid.title")}</h3>
        <p>{t("help.grid.text")}</p>
      </section>
      <section>
        <h3>{t("help.cap.title")}</h3>
        <p>{t("help.cap.text")}</p>
      </section>
      <section>
        <h3>{t("help.structures.title")}</h3>
        <dl class="roster">
          {BUILDABLE.map((kind) => {
            // A kind without an illustration shows its map sprite instead.
            const picture = illustrationUrl(kind) ?? spriteUrl(kind);
            return (
              <div key={kind}>
                {picture !== undefined && (
                  <img
                    src={picture}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  />
                )}
                <dt>{kindName(kind)} <Cost value={KINDS[kind].cost} /></dt>
                <dd>{kindBlurb(kind)}</dd>
              </div>
            );
          })}
        </dl>
      </section>
      <section>
        <h3>{t("help.controls.title")}</h3>
        <dl class="keys">
          {KEY_ROWS.map((row) => (
            <div key={row}><dt>{t(`help.keys.${row}`)}</dt><dd>{t(`help.keys.${row}.does`)}</dd></div>
          ))}
        </dl>
      </section>
    </div>
  );
}
