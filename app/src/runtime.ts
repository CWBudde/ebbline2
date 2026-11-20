// One running game: the fixed-step loop, the player's tool and selection, and transient effects.

import { signal, type Signal } from "@preact/signals";
import {
  TICK_HZ,
  apply,
  centre,
  seconds,
  step,
  type Command,
  type Event,
  type Game,
  type Kind,
  type Phase,
} from "@ebbline2/engine";

export type Tool =
  | { kind: "none" }
  | { kind: "build"; structure: Kind }
  | { kind: "grade"; height: number };

/** A short-lived visual effect, at positions in tile units (see the engine's centre()); radius in tiles. */
export interface Fx {
  kind: "beam" | "ring" | "flash";
  x: number;
  y: number;
  x2: number;
  y2: number;
  radius: number;
  color: number;
  age: number;
  life: number;
}

export interface Hud {
  energy: number;
  capacity: number;
  rateIn: number;
  rateOut: number;
  seconds: number;
  capped: number;
  vents: number;
  /** Seconds left in a survival mission, or -1. */
  remaining: number;
}

export const SPEEDS = [1, 2, 4] as const;
const STEP_MS = 1000 / TICK_HZ;

export class Runtime {
  readonly tool = signal<Tool>({ kind: "none" });
  readonly selected = signal(0);
  readonly paused = signal(false);
  readonly speed = signal<number>(1);
  readonly phase = signal<Phase>("playing");
  readonly hud: Signal<Hud>;
  /** Tile under the pointer, if any. */
  hover: { x: number; y: number } | undefined;
  fx: Fx[] = [];
  /** Tiles whose ground changed since the renderer last looked. */
  regraded: number[] = [];
  floorMoved = false;
  private acc = 0;
  private sinceHud = 0;

  readonly game: Game;
  private readonly onEvent: (event: Event) => void;

  constructor(game: Game, onEvent: (event: Event) => void) {
    this.game = game;
    this.onEvent = onEvent;
    this.hud = signal(this.snapshot());
    this.phase.value = game.phase;
  }

  private snapshot(): Hud {
    const game = this.game;
    const objective = game.level.objective;
    return {
      energy: game.energy,
      capacity: game.capacity,
      rateIn: game.rateIn,
      rateOut: game.rateOut,
      seconds: seconds(game),
      capped: game.vents.filter((v) => v.capped).length,
      vents: game.vents.length,
      remaining:
        objective.kind === "survive"
          ? Math.max(0, Math.ceil((objective.ticks - game.tick) / TICK_HZ))
          : -1,
    };
  }

  act(command: Command): Event[] {
    const events = apply(this.game, command);
    this.handle(events);
    this.hud.value = this.snapshot();
    return events;
  }

  private spark(fx: Partial<Fx> & Pick<Fx, "kind" | "x" | "y">): void {
    this.fx.push({ x2: 0, y2: 0, radius: 1, color: 0xffffff, age: 0, life: 300, ...fx });
  }

  /** An effect on a tile, placed at the tile's centre. */
  private sparkAt(x: number, y: number, fx: Partial<Fx> & Pick<Fx, "kind">): void {
    const c = centre(x, y);
    this.spark({ ...fx, x: c.x, y: c.y });
  }

  private handle(events: Event[]): void {
    for (const e of events) {
      switch (e.kind) {
        case "lance": {
          const s = this.game.structures.find((o) => o.id === e.id);
          if (s) {
            const end = centre(e.x, e.y);
            this.sparkAt(s.x, s.y, { kind: "beam", x2: end.x, y2: end.y, color: 0xffa25c, life: 140 });
          }
          break;
        }
        case "intercept": {
          const s = this.game.structures.find((o) => o.id === e.id);
          // Where the glob was hit is already a position, not a tile.
          if (s) this.sparkAt(s.x, s.y, { kind: "beam", x2: e.x, y2: e.y, color: 0xfff27a, life: 160 });
          if (e.kill) this.spark({ kind: "ring", x: e.x, y: e.y, radius: 1.5, color: 0xfff27a, life: 400 });
          break;
        }
        case "impact":
          this.sparkAt(e.x, e.y, { kind: "ring", radius: e.radius + 0.5, color: 0xffa25c, life: 450 });
          this.sparkAt(e.x, e.y, { kind: "flash", radius: e.radius, color: 0xffd9a0, life: 180 });
          break;
        case "destroyed":
          this.sparkAt(e.x, e.y, { kind: "ring", radius: 2, color: 0xff5470, life: 600 });
          this.sparkAt(e.x, e.y, { kind: "flash", radius: 1.2, color: 0xff5470, life: 250 });
          break;
        case "built":
        case "placed":
          break;
        case "pulse":
          this.sparkAt(e.x, e.y, { kind: "ring", radius: 1.6, color: 0xff3fa4, life: 700 });
          break;
        case "burst":
        case "splash":
          this.sparkAt(e.x, e.y, { kind: "ring", radius: 3, color: 0xff3fa4, life: 700 });
          break;
        case "capped":
          this.sparkAt(e.x, e.y, { kind: "ring", radius: 5, color: 0xffffff, life: 1200 });
          break;
        case "floorMoved":
          this.floorMoved = true;
          break;
        case "graded":
          this.regraded.push(e.tile);
          break;
        default:
          break;
      }
      this.onEvent(e);
    }
    this.phase.value = this.game.phase;
    if (this.selected.value !== 0 && !this.game.structures.some((s) => s.id === this.selected.value)) {
      this.selected.value = 0;
    }
  }

  private live(): boolean {
    return this.game.phase === "playing";
  }

  /** Advances the game by real time. */
  tick(elapsedMs: number): void {
    for (const fx of this.fx) fx.age += elapsedMs;
    this.fx = this.fx.filter((fx) => fx.age < fx.life);
    if (this.paused.value || !this.live()) return;
    // A long frame (a hidden tab) must not turn into a burst of catch-up steps.
    this.acc = Math.min(this.acc + elapsedMs * this.speed.value, STEP_MS * 12);
    while (this.acc >= STEP_MS && this.live()) {
      this.acc -= STEP_MS;
      this.handle(step(this.game));
    }
    this.sinceHud += elapsedMs;
    if (this.sinceHud >= 100 || !this.live()) {
      this.sinceHud = 0;
      this.hud.value = this.snapshot();
    }
  }

  cancel(): boolean {
    if (this.tool.value.kind !== "none") {
      this.tool.value = { kind: "none" };
      return true;
    }
    if (this.selected.value !== 0) {
      this.selected.value = 0;
      return true;
    }
    return false;
  }
}
