// Small pure helpers for the statistics charts: scales, tick values and SVG path strings.

export interface Ticks {
  /** The top of the axis: the last tick, at or above the largest value. */
  max: number;
  step: number;
  values: number[];
}

/** A round step that splits `span` into about `count` parts: 1, 2, 2.5 or 5 times a power of ten. */
export function niceStep(span: number, count: number, integer = false): number {
  if (!(span > 0) || !(count > 0)) return 1;
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / magnitude;
  // 2.5 would leave a fraction where only whole numbers make sense.
  const steps = integer && magnitude < 10 ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10];
  const nice = steps.find((s) => norm <= s) ?? 10;
  const step = nice * magnitude;
  return integer ? Math.max(1, Math.round(step)) : step;
}

/** Ticks for an axis from 0 up to at least `max`. A series that never rises above 0 still gets an axis. */
export function axisTicks(max: number, count = 4, integer = false): Ticks {
  const top = Number.isFinite(max) && max > 0 ? max : 1;
  const step = niceStep(top, count, integer);
  const n = Math.max(1, Math.ceil(top / step - 1e-9));
  const values = Array.from({ length: n + 1 }, (_, i) => roundTo(i * step, step));
  return { max: n * step, step, values };
}

/** Removes the float noise of `i * step`, such as 0.30000000000000004. */
function roundTo(value: number, step: number): number {
  const digits = decimals(step);
  return Number(value.toFixed(digits));
}

/** How many decimals a tick label needs to show the step: 0 for 5, 1 for 0.5, 2 for 0.25. */
export function decimals(step: number): number {
  for (let d = 0; d < 6; d++) {
    if (Math.abs(Math.round(step * 10 ** d) - step * 10 ** d) < 1e-6) return d;
  }
  return 6;
}

const TIME_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200];

/** Tick times in seconds for a time axis from 0 to `seconds`, at most `count` steps apart. */
export function timeTicks(seconds: number, count: number): number[] {
  if (!(seconds > 0)) return [0];
  const step = TIME_STEPS.find((s) => seconds / s <= Math.max(1, count)) ?? 3600 * Math.ceil(seconds / count / 3600);
  const n = Math.floor(seconds / step + 1e-9);
  return Array.from({ length: n + 1 }, (_, i) => i * step);
}

/**
 * A linear map from the domain [d0, d1] onto the range [r0, r1]. An empty domain is widened by one, so one
 * sample or a series of equal values still lands at a finite place.
 */
export function linear(d0: number, d1: number, r0: number, r1: number): (value: number) => number {
  const span = d1 - d0 === 0 ? 1 : d1 - d0;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

function coord(value: number): string {
  // One decimal is finer than a pixel; "-0.0" would be noise.
  const text = value.toFixed(1);
  return text === "-0.0" ? "0.0" : text;
}

type Scale = (value: number) => number;

/** The points of a series that can be drawn: both coordinates finite. */
function points(xs: readonly number[], ys: readonly number[], x: Scale, y: Scale): [number, number][] {
  const out: [number, number][] = [];
  const n = Math.min(xs.length, ys.length);
  for (let i = 0; i < n; i++) {
    const px = x(xs[i] ?? NaN);
    const py = y(ys[i] ?? NaN);
    if (Number.isFinite(px) && Number.isFinite(py)) out.push([px, py]);
  }
  return out;
}

/** A polyline through the samples, or "" when there is nothing to draw. */
export function linePath(xs: readonly number[], ys: readonly number[], x: Scale, y: Scale): string {
  return points(xs, ys, x, y)
    .map(([px, py], i) => `${i === 0 ? "M" : "L"}${coord(px)} ${coord(py)}`)
    .join("");
}

/** A step line: each value holds until the next sample, for counts that change in whole steps. */
export function stepPath(xs: readonly number[], ys: readonly number[], x: Scale, y: Scale): string {
  const pts = points(xs, ys, x, y);
  return pts
    .map(([px, py], i) => (i === 0 ? `M${coord(px)} ${coord(py)}` : `H${coord(px)}V${coord(py)}`))
    .join("");
}

/** The area between the polyline and the baseline `base` (a range value), closed; "" with fewer than two samples. */
export function areaPath(xs: readonly number[], ys: readonly number[], x: Scale, y: Scale, base: number): string {
  const pts = points(xs, ys, x, y);
  const first = pts[0];
  const last = pts.at(-1);
  if (!first || !last || pts.length < 2) return "";
  const line = pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${coord(px)} ${coord(py)}`).join("");
  return `${line}L${coord(last[0])} ${coord(base)}L${coord(first[0])} ${coord(base)}Z`;
}

/** A per-second rate from a running total: the change since the sample before, over the time between them. */
export function perSecond(ticks: readonly number[], totals: readonly number[], hz: number): number[] {
  return totals.map((total, i) => {
    if (i === 0) return 0;
    const dt = ((ticks[i] ?? 0) - (ticks[i - 1] ?? 0)) / hz;
    return dt > 0 ? Math.max(0, (total - (totals[i - 1] ?? 0)) / dt) : 0;
  });
}

/** The largest value and its index; -1 for an empty series. */
export function peak(values: readonly number[]): { value: number; index: number } {
  let index = -1;
  let value = 0;
  values.forEach((v, i) => {
    if (index < 0 || v > value) {
      value = v;
      index = i;
    }
  });
  return { value, index };
}

/** The mean of the values, 0 for none. */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Running sums over the series, sample by sample: the top edge of each band of a stacked chart. */
export function stack(series: readonly (readonly number[])[]): number[][] {
  const n = Math.max(0, ...series.map((s) => s.length));
  const sum = new Array<number>(n).fill(0);
  return series.map((s) =>
    sum.map((below, i) => {
      const v = s[i] ?? 0;
      sum[i] = below + (Number.isFinite(v) && v > 0 ? v : 0);
      return sum[i] ?? 0;
    }),
  );
}

/** A band between a lower and an upper edge, closed; "" with fewer than two samples. */
export function bandPath(
  xs: readonly number[],
  lower: readonly number[],
  upper: readonly number[],
  x: Scale,
  y: Scale,
): string {
  const top = points(xs, upper, x, y);
  const bottom = points(xs, lower, x, y);
  if (top.length < 2 || bottom.length !== top.length) return "";
  const forth = top.map(([px, py], i) => `${i === 0 ? "M" : "L"}${coord(px)} ${coord(py)}`).join("");
  const back = bottom.reverse().map(([px, py]) => `L${coord(px)} ${coord(py)}`).join("");
  return `${forth}${back}Z`;
}

/** Each value's share of their sum, 0 to 1; all 0 when the sum is not positive. */
export function shares(values: readonly number[]): number[] {
  const total = values.reduce((sum, v) => sum + Math.max(0, v), 0);
  return values.map((v) => (total > 0 ? Math.max(0, v) / total : 0));
}

/**
 * A moving average over `width` samples centred on each one (fewer at the ends), for rates that jump from second
 * to second. A width of 1 or less returns the values as they are.
 */
export function smooth(values: readonly number[], width: number): number[] {
  const half = Math.floor(Math.max(1, width) / 2);
  if (half === 0) return [...values];
  return values.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(values.length - 1, i + half); j++) {
      const v = values[j] ?? 0;
      if (Number.isFinite(v)) {
        sum += v;
        n += 1;
      }
    }
    return n > 0 ? sum / n : 0;
  });
}
