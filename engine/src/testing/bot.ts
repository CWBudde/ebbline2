// A simple scripted player. Balance tests use it to show that every mission can be won.

import { apply, type Command } from "../commands.ts";
import { linkLength } from "../grid.ts";
import { densest } from "../spitters.ts";
import { step } from "../step.ts";
import { placeError } from "../structures.ts";
import {
  DRY,
  KINDS,
  LINK_RANGE,
  TICK_HZ,
  type Game,
  type Kind,
  type Structure,
} from "../state.ts";

interface Point {
  x: number;
  y: number;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** The closest tile to a point where the structure fits and joins the grid. */
function spot(
  game: Game,
  kind: Kind,
  near: Point,
  radius: number,
  ok: (p: Point) => boolean = () => true,
): Point | undefined {
  let best: Point | undefined;
  let bestD = Infinity;
  const cx = Math.round(near.x);
  const cy = Math.round(near.y);
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const p = { x, y };
      const d = distance(p, near);
      if (d >= bestD || placeError(game, kind, x, y) !== null) continue;
      if (!reaches(game, kind, x, y) || !ok(p)) continue;
      best = p;
      bestD = d;
    }
  }
  return best;
}

/** Whether a structure placed here would link to a structure that is itself on the grid. */
function reaches(game: Game, kind: Kind, x: number, y: number): boolean {
  const probe = { kind, x, y } as Structure;
  return game.structures.some(
    (s) =>
      Number.isFinite(s.dist) &&
      linkLength(probe, s) > 0,
  );
}

function wetNear(game: Game, p: Point, radius: number): boolean {
  for (let y = p.y - radius; y <= p.y + radius; y++) {
    for (let x = p.x - radius; x <= p.x + radius; x++) {
      if (x < 0 || y < 0 || x >= game.w || y >= game.h) continue;
      if ((game.silt[y * game.w + x] ?? 0) >= DRY) return true;
    }
  }
  return false;
}

function toward(from: Point, to: Point, by: number): Point {
  const d = distance(from, to) || 1;
  return {
    x: from.x + ((to.x - from.x) / d) * by,
    y: from.y + ((to.y - from.y) / d) * by,
  };
}

function order(structure: Kind, p: Point): Command[] {
  return [{ kind: "place", structure, x: p.x, y: p.y }];
}

/** Decides the bot's next move; at most one command per call. */
export function think(game: Game): Command[] {
  const allowed = (kind: Kind): boolean => game.level.allowed.includes(kind);
  const all = game.structures;
  const count = (kind: Kind): number => all.filter((s) => s.kind === kind).length;
  const near = (kind: Kind, p: Point, r: number): number =>
    all.filter((s) => s.kind === kind && distance(s, p) <= r).length;
  const onGrid = all.filter((s) => Number.isFinite(s.dist));
  const closest = (p: Point): Structure | undefined => {
    let best: Structure | undefined;
    for (const c of onGrid) {
      if (!best || distance(c, p) < distance(best, p)) best = c;
    }
    return best;
  };
  const backlog = all.filter(
    (s) => !s.built && s.kind !== "cap" && Number.isFinite(s.dist),
  ).length;

  // 0. Give up structures the grid no longer reaches.
  const stranded = all.find(
    (s) => !Number.isFinite(s.dist) && s.kind !== "lander" && game.tick > 30,
  );
  if (stranded && !game.gridDirty) {
    return [{ kind: "dismantle", id: stranded.id }];
  }

  // 1. Cap any vent that has run dry.
  for (const vent of game.vents) {
    if (
      !vent.capped &&
      placeError(game, "cap", vent.x, vent.y) === null &&
      reaches(game, "cap", vent.x, vent.y)
    ) {
      return order("cap", vent);
    }
  }
  if (backlog >= 3 || game.energy < 3) return [];

  // 2. Tap every lode the grid reaches; walk pylons to the nearest dry one.
  const lodes: Point[] = [];
  for (let i = 0; i < game.lode.length; i++) {
    if (game.lode[i] === 1 && game.occ[i] === 0) {
      lodes.push({ x: i % game.w, y: Math.floor(i / game.w) });
    }
  }
  for (const lode of lodes) {
    if (
      placeError(game, "tap", lode.x, lode.y) === null &&
      reaches(game, "tap", lode.x, lode.y)
    ) {
      return order("tap", lode);
    }
  }
  const walk = (goal: Point): Point | undefined => {
    const from = closest(goal);
    if (!from) return undefined;
    const gap = distance(from, goal);
    const reach = Math.min(LINK_RANGE - 1, Math.max(1, gap - LINK_RANGE + 1));
    return spot(game, "pylon", toward(from, goal, reach), 2, (p) => !wetNear(game, p, 1));
  };
  lodes.sort(
    (a, b) =>
      distance(a, closest(a) ?? a) - distance(b, closest(b) ?? b),
  );
  const lode = lodes.find((p) => !wetNear(game, p, 2));
  if (lode && backlog === 0 && distance(lode, closest(lode) ?? lode) < 20) {
    const p = walk(lode);
    if (p) return order("pylon", p);
  }
  if (backlog > 0) return [];

  if (allowed("cell") && count("tap") >= 3 && count("cell") < 2) {
    const lander = all.find((s) => s.kind === "lander");
    const p = lander && spot(game, "cell", { x: lander.x + 2, y: lander.y + 2 }, 3);
    if (p) return order("cell", p);
  }

  // 3. Cover the densest cluster against globs.
  if (
    allowed("interceptor") &&
    game.spitters.length > 0 &&
    count("interceptor") < 10 &&
    game.energy >= 12
  ) {
    const hub = densest(game);
    const p =
      hub && near("interceptor", hub, 6) < 2
        ? spot(game, "interceptor", hub, 4)
        : undefined;
    if (p) return order("interceptor", p);
  }

  // 4. With nothing to cap, ring the lander with weapons instead.
  const home = all.find((s) => s.kind === "lander");
  if (game.level.objective.kind === "survive" && home) {
    if (game.energy < 12) return [];
    const ring = 3 + Math.floor(game.tick / (40 * TICK_HZ));
    const angle = count("lance") * 2.4;
    const post = { x: home.x + Math.cos(angle) * 4, y: home.y + Math.sin(angle) * 4 };
    if (count("lance") < ring * 2) {
      const p = spot(game, "lance", post, 3);
      if (p) return order("lance", p);
    }
    if (allowed("lobber") && count("lobber") < ring) {
      const p = spot(game, "lobber", post, 3);
      if (p) return order("lobber", p);
    }
    return [];
  }

  // 5. Push toward the nearest open vent.
  const vents = game.vents.filter((v) => !v.capped);
  vents.sort(
    (a, b) => distance(a, closest(a) ?? a) - distance(b, closest(b) ?? b),
  );
  const vent = vents[0];
  const front = vent && closest(vent);
  if (!vent || !front || game.energy < 12) return [];
  const gap = distance(front, vent);
  const contested = wetNear(game, front, KINDS.lance.range - 1);
  if (contested || gap <= LINK_RANGE) {
    const aim = toward(front, vent, 2);
    // The longer the push takes, the more firepower the bot commits.
    const flush = game.energy >= game.capacity * 0.8;
    const wave = flush ? 99 : 4 + Math.floor(game.tick / (90 * TICK_HZ));
    if (near("lance", front, 6) < wave) {
      const p = spot(game, "lance", aim, 4);
      if (p) return order("lance", p);
    }
    if (allowed("lobber") && near("lobber", front, 6) < Math.min(wave, near("lance", front, 6)) / 2) {
      const p = spot(game, "lobber", toward(front, vent, -1), 4);
      if (p) return order("lobber", p);
    }
  }
  if (gap > LINK_RANGE - 1) {
    const p = walk(vent);
    if (p) return order("pylon", p);
  }
  return [];
}

export interface Outcome {
  phase: Game["phase"];
  seconds: number;
  structures: number;
}

/** Plays a game with the bot, or with nobody at all, until it ends or time runs out. */
export function play(game: Game, maxSeconds: number, bot = true): Outcome {
  const limit = maxSeconds * TICK_HZ;
  while (game.phase === "playing" && game.tick < limit) {
    if (bot && game.tick % 15 === 0) {
      for (const command of think(game)) apply(game, command);
    }
    step(game);
  }
  return {
    phase: game.phase,
    seconds: Math.floor(game.tick / TICK_HZ),
    structures: game.structures.length,
  };
}
