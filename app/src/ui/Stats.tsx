// The statistics screen: the course of the game as graphs over time, from the engine's history.

import type { ComponentChildren, RefObject } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { TICK_HZ, seconds, type Game, type History } from "@ebbline2/engine";
import type { Controller } from "../controller.ts";
import { clock, kindName, levelName, num, percent, t } from "../i18n/index.ts";
import type { Runtime } from "../runtime.ts";
import { BackButton } from "./Shell.tsx";
import {
  areaPath,
  axisTicks,
  bandPath,
  decimals,
  linePath,
  linear,
  mean,
  peak,
  perSecond,
  shares,
  smooth,
  stack,
  stepPath,
  timeTicks,
} from "./chart.ts";

/** A colour of the style sheet. */
type Tone = "silt" | "grid" | "amber" | "lime" | "bad" | "dim";
/** How a band of a stacked chart is filled, so that bands differ by more than colour. */
type Fill = "solid" | "stripes" | "dots" | "cross";

interface Line {
  label: string;
  values: readonly number[];
  tone: Tone;
  dashed?: boolean;
  /** Fills the area under the line. */
  fill?: boolean;
  /** Draws the line in steps, for counts. */
  step?: boolean;
}

interface PanelDef {
  title: string;
  lines: readonly Line[];
  /** Whole numbers only on the value axis. */
  integer?: boolean;
  height: number;
}

interface Band {
  label: string;
  values: readonly number[];
  tone: Tone;
  fill: Fill;
}

/** What the screen shows, read once when it opens: the game is held meanwhile. */
interface Data {
  /** Sample times in seconds. */
  times: number[];
  history: History;
  /** The per-second rates, smoothed: packets leave in bursts, so the raw values jump from second to second. */
  rates: Record<"rateIn" | "rateOut" | "removed" | Source | Purpose, number[]>;
  net: number;
  vents: number;
  seconds: number;
}

type Source = "inLander" | "inPylon" | "inTap" | "inPump";
type Purpose = "outBuild" | "outRepair" | "outSupply";

/** Samples a rate is averaged over: about a fortieth of the time axis, so the smoothing looks the same at any length. */
function window(samples: number): number {
  return Math.max(1, Math.min(15, Math.round(samples / 40)));
}

function read(game: Game): Data {
  // A copy, so that a game resumed behind the screen cannot change what it shows.
  const history = structuredClone(game.history);
  const net = history.rateIn.map((v, i) => v - (history.rateOut[i] ?? 0));
  const w = window(history.tick.length);
  const s = (values: readonly number[]): number[] => smooth(values, w);
  return {
    times: history.tick.map((tick) => tick / TICK_HZ),
    history,
    rates: {
      rateIn: s(history.rateIn),
      rateOut: s(history.rateOut),
      removed: s(perSecond(history.tick, history.removed, TICK_HZ)),
      inLander: s(history.inLander),
      inPylon: s(history.inPylon),
      inTap: s(history.inTap),
      inPump: s(history.inPump),
      outBuild: s(history.outBuild),
      outRepair: s(history.outRepair),
      outSupply: s(history.outSupply),
    },
    // The first sample is taken before anything has flowed.
    net: mean(net.slice(1)),
    vents: game.vents.length,
    seconds: seconds(game),
  };
}

/** A number with its sign, where a value that rounds to zero has none. */
function signed(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
  return `${sign}${num(Math.abs(rounded), digits)}`;
}

/** The width of an element in CSS pixels, kept up to date as it resizes. */
function useWidth(fallback: number): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      setWidth(el.clientWidth);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);
  return [ref, width];
}

/** Rough width of a tick label in the 11px chart font. */
function labelWidth(text: string): number {
  return text.length * 6.6;
}

const PATTERN_ID = "stats-fill";

function patternId(tone: Tone, fill: Fill): string {
  return `${PATTERN_ID}-${tone}-${fill}`;
}

/** The fills of the stacked charts, defined once for every chart and legend swatch on the screen. */
function Patterns({ bands }: { bands: readonly Band[] }) {
  return (
    <svg class="pattern-defs" width="0" height="0" aria-hidden="true">
      <defs>
        {bands.map(({ tone, fill }) => {
          const colour = { fill: `var(--${tone})` };
          const stroke = { stroke: `var(--${tone})` };
          return (
            <pattern key={patternId(tone, fill)} id={patternId(tone, fill)} width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" style={{ ...colour, opacity: fill === "solid" ? 0.55 : 0.16 }} />
              {fill === "stripes" && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6" style={{ ...stroke, strokeWidth: 2 }} />}
              {fill === "dots" && <circle cx="4" cy="4" r="1.7" style={colour} />}
              {fill === "cross" && <path d="M0 4H8M4 0V8" style={{ ...stroke, strokeWidth: 1.4 }} />}
            </pattern>
          );
        })}
      </defs>
    </svg>
  );
}

function Swatch({ line }: { line: Line }) {
  return (
    <svg class="swatch-line" width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
      <path class={`line ${line.tone}${line.dashed === true ? " dashed" : ""}`} d="M1 5H21" />
    </svg>
  );
}

function BandSwatch({ band }: { band: Band }) {
  return (
    <svg class="swatch-band" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0.5" y="0.5" width="15" height="15" fill={`url(#${patternId(band.tone, band.fill)})`} style={{ stroke: `var(--${band.tone})` }} />
    </svg>
  );
}

/** The frame of a chart: value axis with grid lines, time axis, and the plot inside. */
function Frame(props: {
  title: string;
  height: number;
  max: number;
  integer: boolean;
  times: readonly number[];
  draw: (x: (v: number) => number, y: (v: number) => number, base: number) => ComponentChildren;
}) {
  const [ref, width] = useWidth(320);
  const { height, times } = props;
  const top = 8;
  const bottom = 20;
  const end = times.at(-1) ?? 0;
  const ticks = axisTicks(props.max, height < 120 ? 2 : 4, props.integer);
  const digits = decimals(ticks.step);
  const yLabels = ticks.values.map((v) => num(v, digits));
  const left = Math.ceil(Math.max(...yLabels.map(labelWidth))) + 10;
  const right = 14;
  const plotW = Math.max(10, width - left - right);
  const x = linear(0, end, left, left + plotW);
  const y = linear(0, ticks.max, height - bottom, top);
  const xTicks = timeTicks(end, Math.max(2, Math.floor(plotW / 64)));
  return (
    <div ref={ref} class="plot">
      <svg role="img" aria-label={props.title} width={width} height={height} viewBox={`0 0 ${String(width)} ${String(height)}`}>
        <g class="grid-lines">
          {ticks.values.map((v, i) => (
            <g key={v}>
              <line x1={left} x2={left + plotW} y1={y(v)} y2={y(v)} />
              <text x={left - 6} y={y(v)} dy="0.35em" text-anchor="end">{yLabels[i]}</text>
            </g>
          ))}
        </g>
        <g class="time-labels">
          {xTicks.map((s) => {
            const px = x(s);
            // Keep the labels at the ends inside the chart.
            const anchor = px - 14 < left ? "start" : px + 14 > left + plotW ? "end" : "middle";
            return <text key={s} x={px} y={height - 5} text-anchor={anchor}>{clock(s)}</text>;
          })}
        </g>
        {props.draw(x, y, height - bottom)}
      </svg>
    </div>
  );
}

function finiteMax(series: readonly (readonly number[])[]): number {
  let max = 0;
  for (const s of series) for (const v of s) if (Number.isFinite(v) && v > max) max = v;
  return max;
}

function Panel({ def, times, showTitle }: { def: PanelDef; times: readonly number[]; showTitle: boolean }) {
  return (
    <div class="panel">
      {(showTitle || def.lines.length > 1) && (
        <div class="panel-head">
          {showTitle && <h4>{def.title}</h4>}
          {def.lines.length > 1 && (
            <ul class="legend">
              {def.lines.map((line) => <li key={line.label}><Swatch line={line} />{line.label}</li>)}
            </ul>
          )}
        </div>
      )}
      <Frame
        title={def.title}
        height={def.height}
        max={finiteMax(def.lines.map((l) => l.values))}
        integer={def.integer === true}
        times={times}
        draw={(x, y, base) =>
          def.lines.map((line) => {
            const tone = `${line.tone}${line.dashed === true ? " dashed" : ""}`;
            const path = line.step === true ? stepPath(times, line.values, x, y) : linePath(times, line.values, x, y);
            return (
              <g key={line.label}>
                {line.fill === true && <path class={`area ${line.tone}`} d={areaPath(times, line.values, x, y, base)} />}
                {path !== "" && <path class={`line ${tone}`} d={path} />}
              </g>
            );
          })}
      />
    </div>
  );
}

/** A stacked area chart of the parts of a total, with each part's rate and share now as text. */
function StackPanel({ title, bands, times, height }: {
  title: string;
  bands: readonly Band[];
  times: readonly number[];
  height: number;
}) {
  const tops = stack(bands.map((b) => b.values));
  const zero = times.map(() => 0);
  const last = times.length - 1;
  const now = bands.map((b) => Math.max(0, b.values[last] ?? 0));
  const parts = shares(now);
  const total = now.reduce((sum, v) => sum + v, 0);
  return (
    <div class="panel">
      <div class="panel-head"><h4>{title}</h4></div>
      <Frame
        title={title}
        height={height}
        max={finiteMax(tops.slice(-1))}
        integer={false}
        times={times}
        draw={(x, y) =>
          bands.map((band, i) => {
            const upper = tops[i] ?? zero;
            const d = bandPath(times, tops[i - 1] ?? zero, upper, x, y);
            const edge = linePath(times, upper, x, y);
            return (
              <g key={band.label}>
                {d !== "" && <path class="band" d={d} fill={`url(#${patternId(band.tone, band.fill)})`} />}
                {edge !== "" && <path class={`line edge ${band.tone}`} d={edge} />}
              </g>
            );
          })}
      />
      <table class="breakdown">
        <thead>
          <tr><th scope="col"><span class="sr-only">{title}</span></th><th scope="col" colSpan={2}>{t("stats.now")}</th></tr>
        </thead>
        <tbody>
          {/* Top band first, as the chart stacks them. */}
          {bands.map((band, i) => ({ band, i })).reverse().map(({ band, i }) => (
            <tr key={band.label}>
              <th scope="row"><BandSwatch band={band} />{band.label}</th>
              <td>{t("stats.rate", { rate: num(now[i] ?? 0, 1) })}</td>
              <td>{total > 0 ? percent(parts[i] ?? 0) : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}{note !== undefined && <small>{note}</small>}</dd>
    </div>
  );
}

const BIG = 150;
const SMALL = 104;

export function Stats({ c, rt }: { c: Controller; rt: Runtime }) {
  const [data] = useState(() => read(rt.game));
  const bodyRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // Opened from the energy readout: start at the energy section. Only the body scrolls; scrollIntoView would
    // also shift the sheet, which clips its overflow but can still be scrolled.
    const body = bodyRef.current;
    const section = energyRef.current;
    if (c.statsSection !== "energy" || !body || !section) return;
    body.scrollTop += section.getBoundingClientRect().top - body.getBoundingClientRect().top - 8;
  }, [c]);
  const h = data.history;
  const r = data.rates;
  const times = data.times;
  const top = peak(h.silt);
  const capped = data.vents - (h.vents.at(-1) ?? data.vents);
  const lost = h.lost.at(-1) ?? 0;
  const sources: Band[] = [
    { label: kindName("lander"), values: r.inLander, tone: "amber", fill: "solid" },
    { label: kindName("pylon"), values: r.inPylon, tone: "lime", fill: "stripes" },
    { label: kindName("tap"), values: r.inTap, tone: "grid", fill: "dots" },
    { label: kindName("pump"), values: r.inPump, tone: "silt", fill: "cross" },
  ];
  const purposes: Band[] = [
    { label: t("stats.spend.build"), values: r.outBuild, tone: "grid", fill: "solid" },
    { label: t("stats.spend.repair"), values: r.outRepair, tone: "bad", fill: "stripes" },
    { label: t("stats.spend.supply"), values: r.outSupply, tone: "amber", fill: "dots" },
  ];
  const silt: PanelDef[] = [
    { title: t("stats.silt.volume"), height: BIG, lines: [{ label: t("stats.silt.volume"), values: h.silt, tone: "silt", fill: true }] },
    { title: t("stats.silt.flooded"), height: SMALL, integer: true, lines: [{ label: t("stats.silt.flooded"), values: h.flooded, tone: "silt" }] },
    { title: t("stats.silt.removed"), height: SMALL, lines: [{ label: t("stats.silt.removed"), values: r.removed, tone: "amber" }] },
  ];
  const vents: PanelDef = {
    title: t("stats.vents"),
    height: BIG,
    integer: true,
    lines: [{ label: t("stats.vents"), values: h.vents, tone: "silt", step: true }],
  };
  const structures: PanelDef = {
    title: t("stats.structures"),
    height: BIG,
    integer: true,
    lines: [
      { label: t("stats.structures.standing"), values: h.structures, tone: "lime", step: true },
      { label: t("stats.structures.lost"), values: h.lost, tone: "bad", dashed: true, step: true },
    ],
  };
  const flow: PanelDef = {
    title: t("stats.energy.flow"),
    height: BIG,
    lines: [
      // The steadier line is the dashed one: dashes break up a line that jumps.
      { label: t("stats.energy.in"), values: r.rateIn, tone: "lime", dashed: true },
      { label: t("stats.energy.out"), values: r.rateOut, tone: "grid" },
    ],
  };
  const bank: PanelDef = {
    title: t("stats.energy.bank"),
    height: BIG,
    lines: [
      { label: t("stats.energy.stored"), values: h.energy, tone: "amber", fill: true },
      { label: t("stats.energy.capacity"), values: h.capacity, tone: "dim", dashed: true, step: true },
    ],
  };
  return (
    <div class="veil">
      <section class="sheet wide stats-sheet" data-testid="stats">
        <header class="sheet-head stats-head">
          <div>
            <p class="kicker">{levelName(rt.game.level)}</p>
            <h2>{t("stats.title")}</h2>
          </div>
          <p class="stats-time"><span class="label">{t("end.time")}</span> <span class="value">{clock(data.seconds)}</span></p>
        </header>
        <div ref={bodyRef} class="sheet-body">
          <Patterns bands={[...sources, ...purposes]} />
          <dl class="stats stats-summary">
            <Figure
              label={t("stats.peak")}
              value={num(Math.round(top.value))}
              {...(top.value > 0 ? { note: t("stats.peak.at", { time: clock(times[top.index] ?? 0) }) } : {})}
            />
            <Figure label={t("stats.capped")} value={`${num(capped)} / ${num(data.vents)}`} />
            <Figure label={t("end.destroyed")} value={num(lost)} />
            <Figure label={t("stats.net")} value={signed(data.net, 1)} />
          </dl>
          {times.length < 2 && <p class="note">{t("stats.empty")}</p>}
          <div class="charts">
            <section class="chart-card">
              <h3>{t("stats.silt")}</h3>
              {silt.map((def) => <Panel key={def.title} def={def} times={times} showTitle />)}
            </section>
            <div class="chart-column">
              <section class="chart-card">
                <h3>{t("stats.vents")}</h3>
                <Panel def={vents} times={times} showTitle={false} />
              </section>
              <section class="chart-card">
                <h3>{t("stats.structures")}</h3>
                <Panel def={structures} times={times} showTitle={false} />
              </section>
            </div>
            <section ref={energyRef} id="stats-energy" class="chart-card energy-card" data-testid="stats-energy">
              <h3>{t("stats.energy")}</h3>
              <div class="energy-grid">
                <Panel def={flow} times={times} showTitle />
                <Panel def={bank} times={times} showTitle />
                <StackPanel title={t("stats.energy.sources")} bands={sources} times={times} height={BIG} />
                <StackPanel title={t("stats.energy.purposes")} bands={purposes} times={times} height={BIG} />
              </div>
            </section>
          </div>
        </div>
        <footer class="sheet-foot">
          <BackButton onClick={() => { c.closeStats(); }} />
        </footer>
      </section>
    </div>
  );
}
