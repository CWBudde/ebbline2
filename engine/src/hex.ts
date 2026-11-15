// Hexagon geometry. The only place that knows how tiles touch, how far apart they are and where they sit.
//
// The map is a w × h block of pointy-top hexagons. A tile is addressed by its column x and row y; odd rows sit
// half a tile to the right ("odd-r" offset coordinates), and tiles are stored row by row at index y * w + x.
// Positions are in tile units: the centres of two touching tiles are exactly 1 apart.

/** Distance between two rows of tile centres. */
export const ROW = Math.sqrt(3) / 2;

/** Distance from a tile's centre to each of its corners. */
export const CORNER = 1 / Math.sqrt(3);

export interface Tile {
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * The six directions, clockwise on screen (y grows downwards): east, south-east, south-west, west, north-west,
 * north-east. Direction d points at the angle 60° × d.
 */
export const DIRECTIONS = 6;

/** Column and row steps to the neighbour in each direction; the first table is for even rows, the second for odd. */
const STEPS: readonly (readonly (readonly [number, number])[])[] = [
  [
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
  ],
];

/**
 * The corners of a tile as offsets from its centre, clockwise from the upper right. The side facing direction d
 * runs from corner d to corner (d + 1) % 6.
 */
export const CORNERS: readonly Point[] = Array.from({ length: 6 }, (_, k) => {
  const angle = ((60 * k - 30) * Math.PI) / 180;
  return { x: CORNER * Math.cos(angle), y: CORNER * Math.sin(angle) };
});

/** The tile stored at index i of a map w tiles wide. */
export function tileOf(w: number, i: number): Tile {
  return { x: i % w, y: Math.floor(i / w) };
}

/** The neighbour of (x, y) in the given direction. It may lie outside the map. */
export function neighbour(x: number, y: number, direction: number): Tile {
  const step = STEPS[y & 1]?.[direction] ?? [0, 0];
  return { x: x + step[0], y: y + step[1] };
}

/** The neighbours of (x, y) that lie on a w × h map. */
export function neighbours(w: number, h: number, x: number, y: number): Tile[] {
  const out: Tile[] = [];
  for (let d = 0; d < DIRECTIONS; d++) {
    const n = neighbour(x, y, d);
    if (n.x >= 0 && n.y >= 0 && n.x < w && n.y < h) out.push(n);
  }
  return out;
}

/**
 * Writes the tile index of the neighbour in each direction into `out` (six entries), or -1 where the map ends.
 * For loops that run over the whole map and must not allocate.
 */
export function neighbourIndices(w: number, h: number, x: number, y: number, out: Int32Array): void {
  const steps = STEPS[y & 1] ?? [];
  for (let d = 0; d < DIRECTIONS; d++) {
    const step = steps[d] ?? [0, 0];
    const nx = x + step[0];
    const ny = y + step[1];
    out[d] = nx >= 0 && ny >= 0 && nx < w && ny < h ? ny * w + nx : -1;
  }
}

// Axial coordinates (q, r): r is the row, q runs along it without the half-tile shift. Step counts are simple
// in these, so distance and area scans convert to them and back.
function axialQ(x: number, y: number): number {
  return x - ((y - (y & 1)) >> 1);
}

function offsetX(q: number, r: number): number {
  return q + ((r - (r & 1)) >> 1);
}

/** The number of steps from one tile to another, moving from tile to touching tile. */
export function distance(ax: number, ay: number, bx: number, by: number): number {
  const dq = axialQ(bx, by) - axialQ(ax, ay);
  const dr = by - ay;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

/**
 * Calls fn for every tile of a w × h map at most `radius` steps from (cx, cy), the centre included.
 * A radius with a fraction counts as the whole number below it.
 */
export function within(
  w: number,
  h: number,
  cx: number,
  cy: number,
  radius: number,
  fn: (i: number, steps: number, x: number, y: number) => void,
): void {
  const reach = Math.floor(radius);
  const cq = axialQ(cx, cy);
  for (let dr = -reach; dr <= reach; dr++) {
    const y = cy + dr;
    if (y < 0 || y >= h) continue;
    const from = Math.max(-reach, -dr - reach);
    const to = Math.min(reach, -dr + reach);
    for (let dq = from; dq <= to; dq++) {
      const x = offsetX(cq + dq, y);
      if (x < 0 || x >= w) continue;
      fn(y * w + x, Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)), x, y);
    }
  }
}

/** Every tile at most `radius` steps from (cx, cy), whether or not it lies on a map. */
export function disc(cx: number, cy: number, radius: number): Tile[] {
  const out: Tile[] = [];
  const cq = axialQ(cx, cy);
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dq = Math.max(-radius, -dr - radius); dq <= Math.min(radius, -dr + radius); dq++) {
      out.push({ x: offsetX(cq + dq, cy + dr), y: cy + dr });
    }
  }
  return out;
}

/** The centre of a tile, in tile units. Tile (0, 0) is centred on the origin. */
export function centre(x: number, y: number): Point {
  return { x: x + 0.5 * (y & 1), y: y * ROW };
}

/** The straight-line distance between two tile centres, in tile units. For things that fly or travel. */
export function span(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx + 0.5 * (by & 1) - ax - 0.5 * (ay & 1), (by - ay) * ROW);
}

/** The tile whose hexagon contains the point (px, py), given in tile units. It may lie outside the map. */
export function tileAtPoint(px: number, py: number): Tile {
  const r = py / ROW;
  const q = px - r / 2;
  // Round in cube coordinates and repair the one that moved furthest, so that q + r + s stays 0.
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  // Adding 0 turns a rounded -0 into 0.
  return { x: offsetX(rq, rr), y: rr + 0 };
}

/** The size of a w × h map in tile units, from the left edge of the first tile to the right edge of the last. */
export function extent(w: number, h: number): { width: number; height: number } {
  return { width: w + (h > 1 ? 0.5 : 0), height: (h - 1) * ROW + 2 * CORNER };
}
