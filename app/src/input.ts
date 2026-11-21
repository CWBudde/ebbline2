// Pointer, touch, wheel and keyboard input for the map.

import { BUILDABLE, placeError, structureAt, type Game, type PlaceError } from "@ebbline2/engine";
import { clamp, tileAt, worldSize, zoomAt, type View } from "./camera.ts";
import { dragPlaces } from "./place.ts";
import { SPEEDS, type Runtime } from "./runtime.ts";

export interface InputHost {
  readonly view: View;
  runtime(): Runtime | undefined;
  /** Opens or closes the pause menu. */
  menu(): void;
  /** Opens or closes the statistics. */
  stats(): void;
  /** Whether a menu covers the map; the map then takes no input. */
  overlayOpen(): boolean;
  /** Feedback for a refused placement, with the reason if the engine gave one. */
  deny(why?: PlaceError): void;
  edgeScroll(): boolean;
}

const DRAG_START = 5;
const PAN_KEYS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
  KeyW: [0, -1],
  KeyS: [0, 1],
};
const SLOT_KEYS = [
  "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6",
  "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backslash", "Quote",
] as const;

interface Press {
  x: number;
  y: number;
  button: number;
  moved: boolean;
  /** Last tile a dragged row placed on. */
  last: { x: number; y: number } | undefined;
}

export class Input {
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private readonly held = new Set<string>();
  private press: Press | undefined;
  private pinch = 0;
  private pointer: { x: number; y: number } | undefined;
  private readonly abort = new AbortController();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly host: InputHost,
  ) {
    const options = { signal: this.abort.signal };
    canvas.addEventListener("pointerdown", (e) => { this.down(e); }, options);
    canvas.addEventListener("pointermove", (e) => { this.move(e); }, options);
    canvas.addEventListener("pointerup", (e) => { this.up(e); }, options);
    canvas.addEventListener("pointercancel", (e) => { this.up(e); }, options);
    canvas.addEventListener("pointerleave", () => { this.leave(); }, options);
    canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); }, options);
    canvas.addEventListener("wheel", (e) => { this.wheel(e); }, { ...options, passive: false });
    window.addEventListener("keydown", (e) => { this.key(e); }, options);
    window.addEventListener("keyup", (e) => { this.held.delete(e.code); }, options);
    window.addEventListener("blur", () => { this.held.clear(); }, options);
  }

  dispose(): void {
    this.abort.abort();
  }

  private at(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const box = this.canvas.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  }

  private clampView(game: Game): void {
    const box = this.canvas.getBoundingClientRect();
    clamp(this.host.view, worldSize(game.w, game.h), { w: box.width, h: box.height });
  }

  private setHover(rt: Runtime, p: { x: number; y: number } | undefined): void {
    this.pointer = p;
    rt.hover = p ? tileAt(this.host.view, p.x, p.y) : undefined;
  }

  private down(e: PointerEvent): void {
    const rt = this.host.runtime();
    if (!rt) return;
    const p = this.at(e);
    this.canvas.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, p);
    if (this.pointers.size === 2) {
      // A second finger turns the gesture into a pinch.
      this.press = undefined;
      const [a, b] = [...this.pointers.values()];
      this.pinch = a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
      return;
    }
    this.press = { x: p.x, y: p.y, button: e.button, moved: false, last: undefined };
    this.setHover(rt, p);
    if (e.button === 0 && rt.tool.value.kind !== "none") this.useTool(rt, this.press, true);
  }

  /** Applies the build or grade tool at the hovered tile. */
  private useTool(rt: Runtime, press: Press, first: boolean): void {
    const tool = rt.tool.value;
    const tile = rt.hover;
    if (!tile || tool.kind === "none") return;
    if (tool.kind === "grade") {
      if (tile.x < 0 || tile.y < 0 || tile.x >= rt.game.w || tile.y >= rt.game.h) return;
      rt.act({ kind: "mark", tiles: [tile.y * rt.game.w + tile.x], height: tool.height });
      return;
    }
    if (!dragPlaces(tool.structure, press.last, tile.x, tile.y)) return;
    const events = rt.act({ kind: "place", structure: tool.structure, x: tile.x, y: tile.y });
    if (events.some((ev) => ev.kind === "placed")) press.last = tile;
    else if (first) this.host.deny(placeError(rt.game, tool.structure, tile.x, tile.y) ?? undefined);
  }

  private move(e: PointerEvent): void {
    const rt = this.host.runtime();
    if (!rt) return;
    const p = this.at(e);
    const before = this.pointers.get(e.pointerId);
    if (before) this.pointers.set(e.pointerId, p);
    if (this.pointers.size >= 2 && before) {
      const [a, b] = [...this.pointers.values()];
      if (!a || !b) return;
      const view = this.host.view;
      view.x -= (p.x - before.x) / 2 / view.zoom;
      view.y -= (p.y - before.y) / 2 / view.zoom;
      const spread = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinch > 0 && spread > 0) {
        zoomAt(view, (a.x + b.x) / 2, (a.y + b.y) / 2, spread / this.pinch);
      }
      this.pinch = spread;
      this.clampView(rt.game);
      return;
    }
    this.setHover(rt, p);
    const press = this.press;
    if (!press || !before) return;
    if (!press.moved && Math.hypot(p.x - press.x, p.y - press.y) < DRAG_START) return;
    press.moved = true;
    if (press.button === 0 && rt.tool.value.kind !== "none") {
      this.useTool(rt, press, false);
      return;
    }
    const view = this.host.view;
    view.x -= (p.x - before.x) / view.zoom;
    view.y -= (p.y - before.y) / view.zoom;
    this.clampView(rt.game);
  }

  private up(e: PointerEvent): void {
    const rt = this.host.runtime();
    const press = this.press;
    this.pointers.delete(e.pointerId);
    this.press = undefined;
    if (!rt || !press || this.pointers.size > 0) return;
    if (e.pointerType === "touch") this.setHover(rt, undefined);
    if (press.moved) return;
    if (press.button === 2) {
      rt.cancel();
      return;
    }
    if (press.button !== 0 || rt.tool.value.kind !== "none") return;
    const tile = tileAt(this.host.view, press.x, press.y);
    rt.selected.value = structureAt(rt.game, tile.x, tile.y)?.id ?? 0;
  }

  private leave(): void {
    const rt = this.host.runtime();
    if (rt && !this.press) this.setHover(rt, undefined);
  }

  private wheel(e: WheelEvent): void {
    const rt = this.host.runtime();
    if (!rt) return;
    e.preventDefault();
    const p = this.at(e);
    zoomAt(this.host.view, p.x, p.y, Math.exp(-e.deltaY * 0.0015));
    this.clampView(rt.game);
    this.setHover(rt, p);
  }

  private key(e: KeyboardEvent): void {
    if (e.code === "Escape" && this.host.overlayOpen()) {
      this.host.menu();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    // The statistics open over the game and its result alike, and the same key closes them.
    if (e.code === "KeyT") {
      if (!e.repeat) this.host.stats();
      return;
    }
    const rt = this.host.runtime();
    if (!rt) return;
    if (e.code in PAN_KEYS) {
      this.held.add(e.code);
      e.preventDefault();
      return;
    }
    if (e.repeat) return;
    const slot = SLOT_KEYS.indexOf(e.code as (typeof SLOT_KEYS)[number]);
    const kind = slot >= 0 ? BUILDABLE[slot] : undefined;
    if (kind) {
      if (rt.game.level.allowed.includes(kind)) rt.tool.value = { kind: "build", structure: kind };
      else this.host.deny("locked");
      return;
    }
    switch (e.code) {
      case "Space":
        e.preventDefault();
        rt.paused.value = !rt.paused.value;
        break;
      case "Escape":
        if (!rt.cancel()) this.host.menu();
        break;
      case "BracketRight":
      case "Period":
        rt.speed.value = SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(rt.speed.value as 1) + 1)] ?? 1;
        break;
      case "BracketLeft":
      case "Comma":
        rt.speed.value = SPEEDS[Math.max(0, SPEEDS.indexOf(rt.speed.value as 1) - 1)] ?? 1;
        break;
      case "Delete":
      case "Backspace":
        if (rt.selected.value !== 0) rt.act({ kind: "dismantle", id: rt.selected.value });
        break;
      case "KeyX":
        if (rt.selected.value !== 0) rt.act({ kind: "toggle", id: rt.selected.value });
        break;
      case "KeyG":
        if (rt.game.level.allowed.includes("grader")) rt.tool.value = { kind: "grade", height: 9 };
        break;
      default:
        break;
    }
  }

  /** Per-frame panning from held keys and, if enabled, the pointer at the screen edge. */
  frame(elapsedMs: number): void {
    const rt = this.host.runtime();
    if (!rt) return;
    let dx = 0;
    let dy = 0;
    for (const code of this.held) {
      const dir = PAN_KEYS[code];
      if (dir) {
        dx += dir[0];
        dy += dir[1];
      }
    }
    const p = this.pointer;
    if (p && this.host.edgeScroll() && !this.press) {
      const box = this.canvas.getBoundingClientRect();
      if (p.x < 12) dx -= 1;
      if (p.x > box.width - 12) dx += 1;
      if (p.y < 12) dy -= 1;
      if (p.y > box.height - 12) dy += 1;
    }
    if (dx === 0 && dy === 0) return;
    const view = this.host.view;
    const distance = (elapsedMs * 0.9) / view.zoom;
    view.x += dx * distance;
    view.y += dy * distance;
    this.clampView(rt.game);
    if (p) this.setHover(rt, p);
  }
}
