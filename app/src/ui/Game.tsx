// Everything drawn over the map while a game runs.

import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  AIRFIELD,
  BUILDABLE,
  KINDS,
  TICK_HZ,
  find,
  footprint,
  hasMovingGround,
  planeOf,
  type Game,
  type Kind,
  type Structure,
} from "@ebbline2/engine";
import { TILE, worldSize, worldToTile } from "../camera.ts";
import type { Controller } from "../controller.ts";
import { groundColor, groundOf } from "../render/terrain.ts";
import { SPEEDS, type Hud, type Runtime } from "../runtime.ts";
import { clock, kindBlurb, kindName, levelBrief, levelHints, levelName, num, t } from "../i18n/index.ts";
import { ILLUSTRATION_BACKGROUND, illustrationUrl } from "../render/assets.ts";
import { Briefing } from "./Briefing.tsx";
import { BackButton, Cost, Help, Icon, SettingsForm, Sheet } from "./Shell.tsx";
import { Stats } from "./Stats.tsx";

/** The key shown on a build slot; the eleventh to fourteenth are named by the language's keyboard. */
function slotLabel(slot: number): string {
  if (slot < 10) return String((slot + 1) % 10);
  if (slot === 10) return t("key.slot11");
  if (slot === 11) return t("key.slot12");
  return slot === 12 ? t("key.slot13") : t("key.slot14");
}

function TopBar({ c, rt }: { c: Controller; rt: Runtime }) {
  const hud = rt.hud.value;
  const share = hud.capacity > 0 ? Math.min(1, hud.energy / hud.capacity) : 0;
  const net = hud.rateIn - hud.rateOut;
  return (
    <header class="topbar">
      {/* The whole readout opens the statistics at the energy section. */}
      <button
        type="button"
        class="tb-left"
        title={`${t("hud.energy.title")}\n${t("hud.energy.stats")}`}
        onClick={() => { c.openStats("none", "energy"); }}
      >
        <div class="energy">
          <Icon name="bolt" />
          <span class="amount" data-testid="energy">{num(Math.floor(hud.energy))} / {num(hud.capacity)}</span>
          {/* Scaled, not resized: the bar changes ten times a second and must not cause layout. */}
          <div class="meter"><div style={{ transform: `scaleX(${share.toFixed(3)})` }} /></div>
        </div>
        <span class={net < 0 ? "rate minus" : "rate"}>
          <span class="in">+{num(hud.rateIn, 1)}</span>{" "}
          <span class="out">−{num(hud.rateOut, 1)}</span>
        </span>
      </button>
      <div class="tb-mid">
        <div class="goal" data-testid="goal">
          {hud.remaining >= 0
            ? t("hud.hold", { time: clock(hud.remaining) })
            : t("hud.capped", { capped: num(hud.capped), vents: num(hud.vents) })}
        </div>
        <div class="time" data-testid="time">{clock(hud.seconds)}</div>
      </div>
      <div class="speeds">
        <button
          class={rt.paused.value ? "chip on" : "chip"}
          aria-pressed={rt.paused.value}
          title={t("hud.pause.title")}
          onClick={() => { rt.paused.value = !rt.paused.value; }}
        >
          <Icon name="pause" />
          <span class="label">{rt.paused.value ? t("hud.paused") : t("hud.pause")}</span>
        </button>
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            class={rt.speed.value === speed ? "chip on" : "chip"}
            aria-pressed={rt.speed.value === speed}
            onClick={() => { rt.speed.value = speed; }}
          >
            {speed}×
          </button>
        ))}
        <span class="gap" />
        <button class="chip" title={t("hud.menu.title")} onClick={() => { c.toggleMenu(); }}>
          <Icon name="menu" />
          <span class="label">{t("hud.menu")}</span>
        </button>
      </div>
    </header>
  );
}

function BuildBar({ c, rt }: { c: Controller; rt: Runtime }) {
  const tool = rt.tool.value;
  const allowed = rt.game.level.allowed;
  const icons = c.icons.value;
  const pick = (kind: Kind) => (): void => {
    c.sound.click();
    rt.selected.value = 0;
    rt.tool.value =
      tool.kind === "build" && tool.structure === kind ? { kind: "none" } : { kind: "build", structure: kind };
  };
  return (
    <nav class="buildbar" aria-label={t("build.label")}>
      {BUILDABLE.map((kind, slot) =>
        allowed.includes(kind) ? (
          <button
            key={kind}
            class={tool.kind === "build" && tool.structure === kind ? "slot on" : "slot"}
            aria-pressed={tool.kind === "build" && tool.structure === kind}
            data-kind={kind}
            title={kindBlurb(kind)}
            onClick={pick(kind)}
          >
            {icons[kind] !== undefined ? <img src={icons[kind]} alt="" /> : <span class="swatch" />}
            <span class="name">{kindName(kind)}</span>
            <Cost value={KINDS[kind].cost} />
            <kbd>{slotLabel(slot)}</kbd>
          </button>
        ) : null,
      )}
      {allowed.includes("grader") && (
        <button
          class={tool.kind === "grade" ? "slot on" : "slot"}
          aria-pressed={tool.kind === "grade"}
          title={t("build.mark.title")}
          onClick={() => {
            c.sound.click();
            rt.tool.value = tool.kind === "grade" ? { kind: "none" } : { kind: "grade", height: 9 };
          }}
        >
          <span class="swatch mark" />
          <span class="name">{t("build.mark")}</span>
          <span class="cost">{t("build.mark.cost")}</span>
          <kbd>G</kbd>
        </button>
      )}
    </nav>
  );
}

/** The width below which the style sheet switches to the phone layout. */
const PHONE = "(max-width: 720px)";

/** What a structure is doing, and how urgent that is. */
function status(game: Game, s: Structure): { text: string; tone: "good" | "warn" | "bad" | "" } {
  if (!Number.isFinite(s.dist)) return { text: t("status.offGrid"), tone: "bad" };
  if (!s.built) return { text: t("status.building"), tone: "warn" };
  if (!s.active) return { text: t("status.off"), tone: "" };
  if (s.health < KINDS[s.kind].cost) return { text: t("status.damaged"), tone: "warn" };
  if (s.kind === "airfield") {
    // An airfield is working when its plane is: in the air, or on the ground being loaded.
    const plane = planeOf(game, s.id);
    if (plane?.leg === "back") return { text: t("status.returning"), tone: "good" };
    if (plane) {
      return { text: t(plane.bombs < AIRFIELD.bombs ? "status.bombing" : "status.inFlight"), tone: "good" };
    }
    if (s.energy < KINDS.airfield.store) return { text: t("status.loading"), tone: "good" };
  }
  // A spring pours only from a full store; until the grid has filled it, it waits.
  if (s.kind === "spring" && s.energy < KINDS.spring.store) return { text: t("status.waitingEnergy"), tone: "warn" };
  return { text: t("status.working"), tone: "good" };
}

/** The illustration of a structure, or its map sprite when the illustration is missing. */
function Thumb({ c, kind }: { c: Controller; kind: Kind }) {
  const [failed, setFailed] = useState(false);
  const picture = failed ? undefined : illustrationUrl(kind);
  const sprite = c.icons.value[kind];
  if (picture === undefined && sprite === undefined) return null;
  return (
    <div class="thumb" style={{ background: ILLUSTRATION_BACKGROUND }}>
      {picture !== undefined
        ? <img src={picture} alt="" onError={() => { setFailed(true); }} />
        : <img class="sprite" src={sprite} alt="" />}
    </div>
  );
}

function Gauge({ label, value, max, digits, energy }: {
  label: string;
  value: number;
  max: number;
  digits: number;
  energy?: boolean;
}) {
  const share = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div>
      <dt>{label}</dt>
      <dd>{num(value, digits)} / {num(max)}</dd>
      <div class={energy === true ? "bar energy-bar" : "bar"}>
        <div style={{ transform: `scaleX(${share.toFixed(3)})` }} />
      </div>
    </div>
  );
}

/**
 * Whether the description of a kind is unfolded. A phone shows it the first time only: after that the
 * panel would just cover the map. The component must be keyed so that the state belongs to one subject.
 */
function useFirstLook(c: Controller, kind: Kind): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(() => !(window.matchMedia(PHONE).matches && c.seen.value.has(kind)));
  useEffect(() => {
    if (open) c.markSeen(kind);
  }, [c, kind, open]);
  return [open, setOpen];
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button class="chip info-x" aria-label={t("info.hide")} title={t("info.hide")} onClick={onClick}>
      <Icon name="close" />
    </button>
  );
}

/** The structure in hand. Closed, only its name and price are left. */
function BuildInfo({ c, kind }: { c: Controller; kind: Kind }) {
  const [open, setOpen] = useFirstLook(c, kind);
  const def = KINDS[kind];
  if (!open) {
    return (
      <aside class="info closed">
        <div class="info-top">
          <h3>{kindName(kind)}</h3>
          <Cost value={def.cost} />
          <button class="chip" aria-expanded={false} onClick={() => { setOpen(true); }}>
            {t("info.details")}
          </button>
        </div>
      </aside>
    );
  }
  return (
    <aside class="info closable">
      <CloseButton onClick={() => { setOpen(false); }} />
      <div class="info-head">
        <Thumb key={kind} c={c} kind={kind} />
        <div>
          <h3>{kindName(kind)}</h3>
          <p class="info-meta">
            <Cost value={def.cost} />
            {def.range > 0 && (
              <span>
                {def.minRange > 0
                  ? t("info.rangeMin", { range: num(def.range), min: num(def.minRange) })
                  : t("info.range", { range: num(def.range) })}
              </span>
            )}
          </p>
        </div>
      </div>
      <p>{kindBlurb(kind)}</p>
      <p class="dim">{t("info.place")}</p>
    </aside>
  );
}

/** The selected structure: its state and what can be done with it. Closing it drops the selection. */
function SelectedInfo({ c, rt, selected }: { c: Controller; rt: Runtime; selected: Structure }) {
  const [open] = useFirstLook(c, selected.kind);
  const def = KINDS[selected.kind];
  const state = status(rt.game, selected);
  return (
    <aside class="info closable">
      <CloseButton onClick={() => { rt.selected.value = 0; }} />
      <div class="info-head">
        <Thumb key={selected.kind} c={c} kind={selected.kind} />
        <div>
          <h3>{kindName(selected.kind)}</h3>
          <p class={`status ${state.tone}`.trimEnd()}>{state.text}</p>
        </div>
      </div>
      {open && <p>{kindBlurb(selected.kind)}</p>}
      <dl class="gauges">
        <Gauge label={t("info.health")} value={Math.ceil(selected.health)} max={def.cost} digits={0} />
        {def.store > 0 && (
          <Gauge label={t("info.energy")} value={selected.energy} max={def.store} digits={1} energy />
        )}
      </dl>
      {selected.kind !== "lander" && (
        <div class="actions">
          <button class="chip" onClick={() => { rt.act({ kind: "toggle", id: selected.id }); }}>
            {selected.active ? t("info.switchOff") : t("info.switchOn")} <kbd>X</kbd>
          </button>
          <button class="chip danger" onClick={() => { rt.act({ kind: "dismantle", id: selected.id }); }}>
            {t("info.dismantle")} <kbd>{t("key.delete")}</kbd>
          </button>
        </div>
      )}
    </aside>
  );
}

/** `hud` is passed only so that the panel refreshes with it, ten times a second. */
function Info({ c, rt }: { c: Controller; rt: Runtime; hud: Hud }) {
  // On a phone the notes would cover the lander, and the briefing has just shown them.
  const [open, setOpen] = useState(() => !window.matchMedia(PHONE).matches);
  const tool = rt.tool.value;
  const level = rt.game.level;
  const selected = find(rt.game, rt.selected.value);
  if (tool.kind === "build") return <BuildInfo key={tool.structure} c={c} kind={tool.structure} />;
  if (tool.kind === "grade") {
    return (
      <aside class="info">
        <h3>{t("grade.title")}</h3>
        <p>{t("grade.text")}</p>
        {hasMovingGround(level) && <p>{t("grade.moving")}</p>}
        <div class="heights">
          {Array.from({ length: 10 }, (_, height) => (
            <button
              key={height}
              class={tool.height === height ? "chip on" : "chip"}
              aria-pressed={tool.height === height}
              onClick={() => { rt.tool.value = { kind: "grade", height }; }}
            >
              {height}
            </button>
          ))}
          <button
            class={tool.height === -1 ? "chip erase on" : "chip erase"}
            aria-pressed={tool.height === -1}
            onClick={() => { rt.tool.value = { kind: "grade", height: -1 }; }}
          >
            {t("grade.erase")}
          </button>
        </div>
      </aside>
    );
  }
  if (selected) return <SelectedInfo key={selected.id} c={c} rt={rt} selected={selected} />;
  // The level's own notes. Closed, only the title bar is left; the notes stay in the document.
  return (
    <aside class={open ? "info" : "info closed"}>
      <div class="info-top">
        <h3>{levelName(level)}</h3>
        <button class="chip" aria-expanded={open} onClick={() => { setOpen(!open); }}>
          {open ? t("info.hide") : t("info.notes")}
        </button>
      </div>
      <div class="info-notes" hidden={!open}>
        <p>{levelBrief(level)}</p>
        {level.hints.length > 0 && (
          <ul class="hints">
            {levelHints(level).map((hint) => <li key={hint}>{hint}</li>)}
          </ul>
        )}
      </div>
    </aside>
  );
}

/** Which tile each minimap pixel shows, or -1 off the map; `res` is minimap pixels per tile. */
function minimapLayout(w: number, h: number, res: number): { width: number; height: number; tiles: Int32Array } {
  const world = worldSize(w, h);
  const width = Math.ceil((world.w / TILE) * res);
  const height = Math.ceil((world.h / TILE) * res);
  const tiles = new Int32Array(width * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const t = worldToTile(((px + 0.5) * TILE) / res, ((py + 0.5) * TILE) / res);
      tiles[py * width + px] = t.x >= 0 && t.y >= 0 && t.x < w && t.y < h ? t.y * w + t.x : -1;
    }
  }
  return { width, height, tiles };
}

function Minimap({ c, rt }: { c: Controller; rt: Runtime }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hud = rt.hud.value;
  const game = rt.game;
  // CSS pixels per tile; the canvas has twice as many, so the hexagons and their row shift still show.
  const scale = Math.max(1, Math.floor(160 / game.w));
  const res = scale * 2;
  const layout = useMemo(() => minimapLayout(game.w, game.h, res), [game, res]);
  const colours = useMemo(() => new Uint32Array(game.w * game.h), [game]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    // One colour per tile as little-endian RGBA, then one look-up per pixel.
    const rgba = (r: number, g: number, b: number): number => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
    const ground = groundOf(game);
    for (let i = 0; i < colours.length; i++) {
      const depth = game.silt[i] ?? 0;
      const balm = game.balm[i] ?? 0;
      const h = game.height[i] ?? -1;
      // Silt in magenta over balm in balm blue over the ground.
      const [r, g, b] =
        depth >= 0.05 ? [255, 63, 164] : balm >= 0.05 ? [154, 212, 255] : h < 0 ? [15, 14, 13] : groundColor(h, ground);
      colours[i] = rgba(r, g, b);
    }
    const structure = rgba(95, 227, 255);
    for (const s of game.structures) {
      for (const i of footprint(game, s.kind, s.x, s.y)) colours[i] = structure;
    }
    const image = ctx.createImageData(layout.width, layout.height);
    const pixels = new Uint32Array(image.data.buffer);
    for (let p = 0; p < pixels.length; p++) {
      const tile = layout.tiles[p] ?? -1;
      pixels[p] = tile < 0 ? 0 : (colours[tile] ?? 0);
    }
    ctx.putImageData(image, 0, 0);
    // The minimap is the world scaled down, so the view's rectangle maps straight across.
    const size = c.screenSize();
    const k = res / TILE;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(c.view.x * k, c.view.y * k, (size.w / c.view.zoom) * k, (size.h / c.view.zoom) * k);
  }, [hud, game, c, layout, colours, res]);
  const jump = (e: PointerEvent): void => {
    if (e.buttons === 0 && e.type !== "pointerdown") return;
    const box = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * layout.width;
    const py = ((e.clientY - box.top) / box.height) * layout.height;
    c.lookAt((px * TILE) / res, (py * TILE) / res);
  };
  return (
    <figure class="minimap-frame">
      <canvas
        ref={ref}
        class="minimap"
        width={layout.width}
        height={layout.height}
        style={{ width: `${String(layout.width / 2)}px`, height: `${String(layout.height / 2)}px`, imageRendering: "auto" }}
        aria-label={t("hud.map")}
        onPointerDown={jump}
        onPointerMove={jump}
      />
    </figure>
  );
}

function PauseMenu({ c }: { c: Controller }) {
  const overlay = c.overlay.value;
  const back = (): void => {
    c.overlay.value = "menu";
  };
  if (overlay === "help") {
    return (
      <div class="veil">
        <Sheet title={t("menu.help")} class="wide" foot={<BackButton onClick={back} />}><Help /></Sheet>
      </div>
    );
  }
  if (overlay === "settings") {
    return (
      <div class="veil">
        <Sheet title={t("menu.settings")} foot={<BackButton onClick={back} />}><SettingsForm c={c} /></Sheet>
      </div>
    );
  }
  return (
    <div class="veil">
      <Sheet title={t("pause.title")} class="pause">
        <div class="stack">
          <button class="btn primary" onClick={() => { c.toggleMenu(); }}>{t("pause.resume")}</button>
          <button class="btn" onClick={() => { c.saveNow(true); }}>{t("pause.save")}</button>
          <button class="btn" onClick={() => { c.openStats("menu"); }}>{t("stats.title")}</button>
          <button class="btn" onClick={() => { c.overlay.value = "help"; }}>{t("menu.help")}</button>
          <button class="btn" onClick={() => { c.overlay.value = "settings"; }}>{t("menu.settings")}</button>
          {c.hasBriefing() && <button class="btn" onClick={() => { c.openBriefing(); }}>{t("pause.briefing")}</button>}
          <hr />
          <button class="btn danger" onClick={() => { c.restart(); }}>{t("pause.restart")}</button>
          <button class="btn" onClick={() => { c.quit(); }}>{t("pause.quit")}</button>
        </div>
      </Sheet>
    </div>
  );
}

function EndScreen({ c, rt }: { c: Controller; rt: Runtime }) {
  const won = rt.phase.value === "won";
  const stats = rt.game.stats;
  const next = won ? c.nextLevel() : undefined;
  const time = clock(Math.floor(rt.game.tick / TICK_HZ));
  const survived = rt.game.level.objective.kind === "survive";
  return (
    <div class="veil">
      <section class={won ? "sheet result won" : "sheet result lost"} data-testid="end">
        <header class="sheet-head">
          <p class="kicker">{levelName(rt.game.level)}</p>
          <h2>{won ? t(survived ? "end.won.survive.title" : "end.won") : t("end.lost")}</h2>
          <p class="lede">
            {won
              ? survived ? t("end.won.survive") : t("end.won.cap")
              : t("end.lost.text")}
          </p>
        </header>
        <div class="sheet-body">
          <p class="result-time">
            <span class="label">{t("end.time")}</span>
            {c.newBest.value && <span class="badge">{t("end.newBest")}</span>}
            <span class="value">{time}</span>
          </p>
          <dl class="stats">
            <div><dt>{t("end.spent")}</dt><dd>{num(Math.round(stats.spent))}</dd></div>
            <div><dt>{t("end.removed")}</dt><dd>{num(Math.round(stats.removed))}</dd></div>
            <div><dt>{t("end.built")}</dt><dd>{num(stats.built)}</dd></div>
            <div><dt>{t("end.destroyed")}</dt><dd>{num(stats.lost)}</dd></div>
          </dl>
          <div class="stack">
            {next && <button class="btn primary" onClick={() => { c.start(next); }}>{t("end.next", { name: levelName(next) })}</button>}
            <button class={next ? "btn" : "btn primary"} onClick={() => { c.restart(); }}>{won ? t("end.again") : t("end.retry")}</button>
            <button class="btn" onClick={() => { c.openStats("none"); }}>{t("stats.title")}</button>
            <button class="btn quiet" onClick={() => { c.quit(); }}>{t("end.menu")}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Game({ c }: { c: Controller }) {
  const rt = c.runtime.value;
  if (!rt) return null;
  const over = rt.phase.value !== "playing";
  const overlay = c.overlay.value;
  return (
    <div class="hud">
      {/* While a dialog is open the controls behind it take neither focus nor clicks. */}
      <div class="hud-live" inert={over || overlay !== "none"}>
        <TopBar c={c} rt={rt} />
        <div class="side">
          <Info c={c} rt={rt} hud={rt.hud.value} />
          <Minimap c={c} rt={rt} />
        </div>
        <BuildBar c={c} rt={rt} />
      </div>
      {/* The statistics open over the result screen as well as over a running game. */}
      {overlay === "stats" && <Stats c={c} rt={rt} />}
      {over && overlay !== "stats" && <EndScreen c={c} rt={rt} />}
      {!over && overlay === "briefing" && <Briefing key={rt.game.level.id} c={c} rt={rt} />}
      {!over && overlay !== "none" && overlay !== "briefing" && overlay !== "stats" && <PauseMenu c={c} />}
    </div>
  );
}

