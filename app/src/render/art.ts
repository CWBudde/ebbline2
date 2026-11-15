// Code-drawn structures, the stand-in wherever the generated sprites are missing: one flat vector style, on a box of ±1 per tile half-width.

import { Graphics } from "pixi.js";
import type { Kind } from "@ebbline2/engine";

const PLATE = 0x14222a;
const RIM = 0x33505c;
export const COLORS = {
  grid: 0x5fe3ff,
  economy: 0xffc857,
  weapon: 0xff7a45,
  utility: 0xb6f36b,
  cap: 0xf4f7f8,
  silt: 0xff3fa4,
  bad: 0xff5470,
} as const;

export const ACCENT: Record<Kind, number> = {
  lander: COLORS.grid,
  pylon: COLORS.grid,
  trunk: COLORS.grid,
  tap: COLORS.economy,
  cell: COLORS.economy,
  pump: COLORS.economy,
  lance: COLORS.weapon,
  lobber: COLORS.weapon,
  baffle: COLORS.utility,
  interceptor: COLORS.weapon,
  grader: COLORS.utility,
  cap: COLORS.cap,
};

function ngon(g: Graphics, sides: number, radius: number, turn = 0): Graphics {
  const points: number[] = [];
  for (let n = 0; n < sides; n++) {
    const a = turn + (n / sides) * Math.PI * 2;
    points.push(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  return g.poly(points);
}

/** Draws a structure centred on the origin; `u` is half a tile in pixels. */
export function drawStructure(kind: Kind, u: number): Graphics {
  const g = new Graphics();
  const c = ACCENT[kind];
  const line = Math.max(1.5, u * 0.14);
  const plate = (): void => {
    g.roundRect(-u * 0.9, -u * 0.9, u * 1.8, u * 1.8, u * 0.3)
      .fill(PLATE)
      .stroke({ width: line * 0.7, color: RIM });
  };
  switch (kind) {
    case "lander":
      g.roundRect(-u * 2.8, -u * 2.8, u * 5.6, u * 5.6, u * 1.1)
        .fill(PLATE)
        .stroke({ width: line * 1.4, color: RIM });
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
        g.circle(sx * u * 2, sy * u * 2, u * 0.4).fill(RIM);
      }
      ngon(g, 6, u * 1.7, Math.PI / 6).fill(0x0c171c).stroke({ width: line * 1.4, color: c });
      g.circle(0, 0, u * 0.7).fill(c);
      break;
    case "pylon":
      ngon(g, 4, u * 0.75).fill(PLATE).stroke({ width: line, color: c });
      g.circle(0, 0, u * 0.22).fill(c);
      break;
    case "trunk":
      ngon(g, 6, u * 0.9).fill(PLATE).stroke({ width: line, color: c });
      g.circle(0, 0, u * 0.45).stroke({ width: line, color: c });
      g.circle(0, 0, u * 0.15).fill(c);
      break;
    case "tap":
      plate();
      ngon(g, 4, u * 0.6).fill(c);
      ngon(g, 4, u * 0.25).fill(PLATE);
      break;
    case "cell":
      plate();
      for (let n = -1; n <= 1; n++) {
        g.rect(-u * 0.55, n * u * 0.42 - u * 0.14, u * 1.1, u * 0.28).fill(c);
      }
      break;
    case "pump":
      plate();
      g.circle(0, 0, u * 0.62).stroke({ width: line, color: c });
      g.circle(0, 0, u * 0.3).stroke({ width: line, color: c });
      g.circle(0, 0, u * 0.1).fill(c);
      break;
    case "lance":
      plate();
      g.poly([0, -u * 0.7, u * 0.62, u * 0.55, -u * 0.62, u * 0.55]).fill(c);
      g.circle(0, u * 0.15, u * 0.18).fill(PLATE);
      break;
    case "lobber":
      plate();
      g.circle(0, 0, u * 0.62).stroke({ width: line * 1.8, color: c });
      g.circle(0, 0, u * 0.22).fill(c);
      break;
    case "baffle":
      ngon(g, 8, u * 0.9, Math.PI / 8).fill(PLATE).stroke({ width: line, color: c });
      for (let n = -1; n <= 1; n++) {
        g.moveTo(-u * 0.45, n * u * 0.3).lineTo(u * 0.45, n * u * 0.3).stroke({ width: line, color: c });
      }
      break;
    case "interceptor":
      plate();
      g.moveTo(-u * 0.55, -u * 0.55).lineTo(u * 0.55, u * 0.55).stroke({ width: line * 1.4, color: c });
      g.moveTo(u * 0.55, -u * 0.55).lineTo(-u * 0.55, u * 0.55).stroke({ width: line * 1.4, color: c });
      g.circle(0, 0, u * 0.24).fill(0xfff27a);
      break;
    case "grader":
      plate();
      g.poly([-u * 0.6, u * 0.1, 0, -u * 0.5, u * 0.6, u * 0.1]).stroke({ width: line * 1.3, color: c });
      g.rect(-u * 0.6, u * 0.4, u * 1.2, u * 0.2).fill(c);
      break;
    case "cap":
      g.circle(0, 0, u * 0.95).fill(PLATE).stroke({ width: line * 1.6, color: c });
      g.circle(0, 0, u * 0.5).fill(0x0c171c).stroke({ width: line, color: c });
      for (let n = 0; n < 4; n++) {
        const a = (n / 4) * Math.PI * 2 + Math.PI / 4;
        g.circle(Math.cos(a) * u * 0.72, Math.sin(a) * u * 0.72, u * 0.1).fill(c);
      }
      break;
  }
  return g;
}
