// Draws the map: baked ground, the silt texture, structure and feature sprites and a per-frame overlay.

import { CanvasSource, Container, Graphics, Sprite, Texture, type Application } from "pixi.js";
import {
  BOOST,
  BUILDABLE,
  KINDS,
  ROW,
  floorCanBeGraded,
  globAt,
  harvestPending,
  harvestPreview,
  linksAt,
  placeError,
  span,
  tileOf,
  ventAsleep,
  ventDry,
  type Game,
  type Structure,
} from "@ebbline2/engine";
import { TILE, pointToWorld, tileToWorld, type View } from "../camera.ts";
import type { Runtime } from "../runtime.ts";
import { ACCENT, COLORS, drawStructure } from "./art.ts";
import { spriteUrls, type SpriteKind } from "./assets.ts";
import { areaOutline, hatch, hexPoints, outline } from "./hexes.ts";
import { loadArt, type Art, type SpriteArt } from "./sprites.ts";
import {
  BAKE,
  SILT_SUB,
  bakeTerrain,
  paintSilt,
  rebakeTile,
  repaintTerrain,
  siltLayout,
  type Materials,
  type SiltLayout,
} from "./terrain.ts";

/** The centre of the tile at a map index, in world pixels. */
const at = (game: Game, i: number): { x: number; y: number } => {
  const t = tileOf(game.w, i);
  return tileToWorld(t.x, t.y);
};

/**
 * How large an atlas sprite is drawn, in tiles across its cell. The atlas tool fits each piece's longer side
 * to 120 of a 128 px cell (376 of 384 for the lander). A structure is a pointy-top hexagonal plate, so its
 * 120 px are the corner-to-corner height: 1.18 × 120/128 = 1.106 tiles of the hexagon's 1.155 (96 %), and its
 * width (0.86 of the height) 0.95 of the tile, a margin of about 0.05 tile all round. The lander is the
 * seven-hexagon flower, its 376 px the 3-tile width: 0.99 × 376/128 = 2.91 tiles across and 2.79 of the
 * flower's 2.89 high, the same margin. The natural features may spill over.
 */
const FIT: Partial<Record<SpriteKind, number>> = {
  lander: 0.99,
  vent: 1.5,
  spitter: 1.7,
  lode: 1.1,
};
const DEFAULT_FIT = 1.18;

/** Milliseconds between silt repaints while it shimmers. */
const SHIMMER_MS = 80;

export class Renderer {
  readonly world = new Container();
  /** Settles once the generated art has loaded, or has failed to. */
  readonly ready: Promise<void>;
  private readonly ground = new Sprite();
  private readonly silt = new Sprite();
  private readonly lodes = new Container();
  private readonly features = new Graphics();
  private readonly vents = new Container();
  /** The tiles the pylons collect energy from, shaded green. Under the silt, which hides what it drowns. */
  private readonly harvest = new Graphics();
  private harvestRev = -1;
  private harvestKey = "";
  private readonly under = new Graphics();
  private readonly sprites = new Container();
  private readonly ghost = new Sprite();
  private readonly over = new Graphics();
  private readonly textures = new Map<SpriteKind, SpriteArt>();
  /** Kinds still shown by their code drawing, which is already sized for its hexagon. */
  private readonly drawn = new Set<SpriteKind>();
  private readonly byId = new Map<number, Sprite>();
  private readonly ventSprites: Sprite[] = [];
  private readonly spitterSprites = new Map<number, Sprite>();
  private materials: Materials = {};
  private groundCanvas: HTMLCanvasElement | undefined;
  private siltCanvas: HTMLCanvasElement | undefined;
  private siltImage: ImageData | undefined;
  private siltLayout: SiltLayout | undefined;
  private game: Game | undefined;
  private paintedTick = -1;
  private paintedAt = 0;

  constructor(app: Application) {
    // The code-drawn pieces come first and stay for whatever the art does not cover.
    for (const kind of ["lander", ...BUILDABLE] as const) {
      const drawing = drawStructure(kind, TILE);
      this.textures.set(kind, {
        texture: app.renderer.generateTexture({ target: drawing, resolution: 1, antialias: true }),
        perTile: TILE * 2,
      });
      this.drawn.add(kind);
      drawing.destroy();
    }
    this.ghost.anchor.set(0.5);
    this.ghost.alpha = 0.55;
    this.world.addChild(
      this.ground,
      this.lodes,
      this.features,
      this.harvest,
      this.silt,
      this.vents,
      this.under,
      this.sprites,
      this.ghost,
      this.over,
    );
    app.stage.addChild(this.world);
    this.ready = loadArt()
      .then((art) => {
        this.adopt(art);
      })
      .catch(() => undefined);
  }

  /** Takes over the loaded art and redraws the running game with it. */
  private adopt(art: Art): void {
    for (const [kind, sprite] of art.sprites) {
      this.textures.set(kind, sprite);
      this.drawn.delete(kind);
    }
    this.materials = art.materials;
    spriteUrls.value = { ...spriteUrls.value, ...art.urls };
    if (this.game) this.load(this.game);
  }

  private place(sprite: Sprite, kind: SpriteKind, x: number, y: number): void {
    const art = this.textures.get(kind);
    sprite.texture = art?.texture ?? Texture.EMPTY;
    sprite.anchor.set(0.5);
    const fit = this.drawn.has(kind) ? 1 : (FIT[kind] ?? DEFAULT_FIT);
    sprite.scale.set((art ? TILE / art.perTile : 1) * fit);
    sprite.position.set(x, y);
  }

  /** Switches to a new game, or to none. */
  load(game: Game | undefined): void {
    this.game = game;
    this.world.visible = game !== undefined;
    for (const sprite of this.byId.values()) sprite.destroy();
    this.byId.clear();
    for (const sprite of this.lodes.removeChildren()) sprite.destroy();
    for (const sprite of this.vents.removeChildren()) sprite.destroy();
    this.ventSprites.length = 0;
    this.spitterSprites.clear();
    this.paintedTick = -1;
    this.harvest.clear();
    this.harvestRev = -1;
    this.harvestKey = "";
    if (!game) return;
    this.groundCanvas = bakeTerrain(game, this.materials);
    this.ground.texture.destroy(true);
    // The ground is shown smaller than it is baked when zoomed out: mipmaps keep its texture calm.
    this.ground.texture = new Texture({
      source: new CanvasSource({
        resource: this.groundCanvas,
        autoGenerateMipmaps: true,
        scaleMode: "linear",
        mipmapFilter: "linear",
      }),
    });
    this.ground.scale.set(TILE / BAKE);
    const layout = siltLayout(game.w, game.h);
    this.siltLayout = layout;
    this.siltCanvas = document.createElement("canvas");
    this.siltCanvas.width = layout.width;
    this.siltCanvas.height = layout.height;
    this.siltImage = new ImageData(layout.width, layout.height);
    this.silt.texture.destroy(true);
    this.silt.texture = Texture.from(this.siltCanvas);
    this.silt.texture.source.scaleMode = "linear";
    this.silt.scale.set(TILE / SILT_SUB);
    this.features.clear();
    const lodeArt = this.textures.has("lode");
    for (let i = 0; i < game.lode.length; i++) {
      if (game.lode[i] !== 1) continue;
      const { x, y } = at(game, i);
      if (lodeArt) {
        const sprite = new Sprite();
        this.place(sprite, "lode", x, y);
        this.lodes.addChild(sprite);
        continue;
      }
      const r = TILE * 0.42;
      this.features
        .poly([x, y - r, x + r, y, x, y + r, x - r, y])
        .fill({ color: COLORS.economy, alpha: 0.28 })
        .stroke({ width: 2, color: COLORS.economy, alpha: 0.9 });
      this.features.circle(x, y, TILE * 0.1).fill(COLORS.economy);
    }
    if (this.textures.has("vent")) {
      for (const vent of game.vents) {
        const sprite = new Sprite();
        const c = tileToWorld(vent.x, vent.y);
        this.place(sprite, "vent", c.x, c.y);
        this.vents.addChild(sprite);
        this.ventSprites.push(sprite);
      }
    }
  }

  private syncSprites(game: Game): void {
    const alive = new Set<number>();
    for (const s of game.structures) {
      alive.add(s.id);
      let sprite = this.byId.get(s.id);
      if (!sprite) {
        sprite = new Sprite();
        const c = tileToWorld(s.x, s.y);
        this.place(sprite, s.kind, c.x, c.y);
        this.sprites.addChild(sprite);
        this.byId.set(s.id, sprite);
      }
      sprite.alpha = s.built ? 1 : 0.4 + 0.3 * (s.health / KINDS[s.kind].cost);
      sprite.tint = s.active ? 0xffffff : 0x7d8a90;
    }
    for (const [id, sprite] of this.byId) {
      if (alive.has(id)) continue;
      sprite.destroy();
      this.byId.delete(id);
    }
    game.vents.forEach((vent, n) => {
      const sprite = this.ventSprites[n];
      if (sprite) sprite.tint = vent.capped ? 0x56666c : ventAsleep(game, vent) ? 0x8a979c : 0xffffff;
    });
    if (!this.textures.has("spitter")) return;
    const seen = new Set<number>();
    for (const spitter of game.spitters) {
      const key = spitter.y * game.w + spitter.x;
      seen.add(key);
      if (this.spitterSprites.has(key)) continue;
      const sprite = new Sprite();
      const c = tileToWorld(spitter.x, spitter.y);
      this.place(sprite, "spitter", c.x, c.y);
      this.vents.addChild(sprite);
      this.spitterSprites.set(key, sprite);
    }
    for (const [key, sprite] of this.spitterSprites) {
      if (seen.has(key)) continue;
      sprite.destroy();
      this.spitterSprites.delete(key);
    }
  }

  frame(rt: Runtime, view: View, now: number, calm: boolean, held: boolean): void {
    const game = this.game;
    if (!game || game !== rt.game) return;
    this.world.scale.set(view.zoom);
    this.world.position.set(-view.x * view.zoom, -view.y * view.zoom);
    const px = 1 / view.zoom;

    if ((rt.floorMoved || rt.regraded.length > 0) && this.groundCanvas) {
      if (rt.floorMoved) repaintTerrain(this.groundCanvas, game);
      else for (const tile of rt.regraded) rebakeTile(this.groundCanvas, game, tile);
      rt.floorMoved = false;
      rt.regraded = [];
      this.ground.texture.source.update();
    }
    // The silt is repainted when it has flowed and, unless motion is reduced, a few times a second
    // in between so that its surface shimmers.
    const flowed = this.paintedTick !== game.tick;
    const due = !calm && !held && !rt.paused.value && now - this.paintedAt >= SHIMMER_MS;
    if ((flowed || due) && this.siltCanvas && this.siltImage && this.siltLayout) {
      this.paintedTick = game.tick;
      this.paintedAt = now;
      paintSilt(this.siltImage, game.silt, this.siltLayout, calm ? 0 : now / 700);
      this.siltCanvas.getContext("2d")?.putImageData(this.siltImage, 0, 0);
      this.silt.texture.source.update();
    }
    this.syncSprites(game);

    const byId = new Map<number, Structure>();
    for (const s of game.structures) byId.set(s.id, s);
    const pulse = calm ? 0.5 : 0.5 + 0.5 * Math.sin(now / 300);

    // Below the structures: links, fields and ranges.
    const under = this.under.clear();
    for (let n = 0; n < game.links.length; n += 2) {
      const a = byId.get(game.links[n] ?? 0);
      const b = byId.get(game.links[n + 1] ?? 0);
      if (!a || !b) continue;
      const live = a.built && b.built;
      const pa = tileToWorld(a.x, a.y);
      const pb = tileToWorld(b.x, b.y);
      under
        .moveTo(pa.x, pa.y)
        .lineTo(pb.x, pb.y)
        .stroke({ width: Math.max(1.5, 2 * px), color: COLORS.grid, alpha: live ? 0.55 : 0.2 });
    }
    for (const s of game.structures) {
      if (s.kind === "baffle" && s.built && s.active && s.energy > 0) {
        for (const loop of areaOutline(game.w, game.h, s.x, s.y, KINDS.baffle.range)) {
          under
            .poly(loop)
            .fill({ color: COLORS.utility, alpha: 0.07 })
            .stroke({ width: 2 * px, color: COLORS.utility, alpha: 0.35 });
        }
      }
    }
    for (let i = 0; i < game.mark.length; i++) {
      const mark = game.mark[i] ?? -1;
      if (mark < 0) continue;
      const raise = mark > (game.height[i] ?? 0);
      const t = tileOf(game.w, i);
      under
        .poly(hexPoints(t.x, t.y, 0.84))
        .fill({ color: raise ? COLORS.utility : COLORS.grid, alpha: 0.22 })
        .stroke({ width: 1.5, color: raise ? COLORS.utility : COLORS.grid, alpha: 0.9 });
    }
    const ventArt = this.ventSprites.length > 0;
    for (const vent of game.vents) {
      if (vent.capped) continue;
      const { x, y } = tileToWorld(vent.x, vent.y);
      const dry = ventDry(game, vent);
      if (ventAsleep(game, vent)) {
        // Dormant: a still, faint ring instead of the beat.
        under.circle(x, y, TILE * 0.8).stroke({ width: 1.5, color: 0xffffff, alpha: 0.35 });
        if (!ventArt) under.circle(x, y, TILE * 0.25).fill({ color: COLORS.silt, alpha: 0.4 });
      } else if (ventArt) {
        // The sprite is the vent; the ring only shows its beat and whether it can take a cap.
        under.circle(x, y, TILE * (0.8 + 0.22 * pulse)).stroke({
          width: 2,
          color: dry ? 0xffffff : COLORS.silt,
          alpha: dry ? 0.9 : 0.75 - 0.45 * pulse,
        });
      } else {
        under.circle(x, y, TILE * (0.55 + 0.25 * pulse)).stroke({
          width: 3,
          color: dry ? 0xffffff : COLORS.silt,
          alpha: 0.9,
        });
        under.circle(x, y, TILE * 0.25).fill(COLORS.silt);
      }
      if (vent.pressure > 0) {
        under.circle(x, y, TILE * (1 + Math.min(2, vent.pressure / 20))).stroke({
          width: 2,
          color: COLORS.bad,
          alpha: 0.5 + 0.4 * pulse,
        });
      }
    }
    if (!this.textures.has("spitter")) {
      for (const spitter of game.spitters) {
        const { x, y } = tileToWorld(spitter.x, spitter.y);
        const points: number[] = [];
        for (let n = 0; n < 10; n++) {
          const a = (n / 10) * Math.PI * 2;
          const r = TILE * (n % 2 === 0 ? 0.75 : 0.35);
          points.push(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        under.poly(points).fill(0x2a0f24).stroke({ width: 2, color: COLORS.silt });
        under.circle(x, y, TILE * 0.18).fill(COLORS.silt);
      }
    }

    // Above the structures: status, packets, projectiles, effects and the tool preview.
    const over = this.over.clear();
    for (const s of game.structures) {
      const def = KINDS[s.kind];
      const { x, y } = tileToWorld(s.x, s.y);
      // Half the footprint's width, and how far down from the centre the status bars sit inside it.
      const half = (def.radius + 0.5) * TILE;
      const low = (def.radius * ROW + 0.42) * TILE;
      if (s.built && s.active && s.target >= 0 && def.range > 0 && s.kind !== "baffle" && s.kind !== "pump") {
        // The sprites have no front; a pip on the rim shows where the structure is working.
        const target = at(game, s.target);
        const tx = target.x - x;
        const ty = target.y - y;
        const far = Math.hypot(tx, ty);
        if (far > 0) {
          const ux = tx / far;
          const uy = ty / far;
          over
            .moveTo(x + ux * half * 0.5, y + uy * half * 0.5)
            .lineTo(x + ux * half * 0.95, y + uy * half * 0.95)
            .stroke({ width: 2.5, color: 0x0a1216, alpha: 0.9 });
          over.circle(x + ux * half * 0.95, y + uy * half * 0.95, 2.6).fill(0xffffff);
          over.circle(x + ux * half * 0.95, y + uy * half * 0.95, 1.6).fill(ACCENT[s.kind]);
        }
      }
      const bar = (row: number, share: number, color: number): void => {
        const top = y + low - 5 - row * 4;
        const width = 2 * (def.radius > 0 ? TILE : half - 2);
        over.rect(x - width / 2, top, width, 3).fill({ color: 0x000000, alpha: 0.6 });
        over.rect(x - width / 2, top, width * Math.max(0, Math.min(1, share)), 3).fill(color);
      };
      if (s.health < def.cost) bar(0, s.health / def.cost, s.built ? COLORS.bad : 0xffffff);
      if (s.built && def.store > 0 && s.energy < def.store * 0.75) {
        bar(s.health < def.cost ? 1 : 0, s.energy / def.store, COLORS.economy);
      }
      if (!Number.isFinite(s.dist) && pulse > 0.4) {
        over.circle(x + half - 4, y - low + 4, 4).fill(COLORS.bad);
      }
    }
    for (const p of game.packets) {
      // Straight from one structure's centre to the next.
      const a = at(game, p.tiles[p.seg] ?? 0);
      const b = at(game, p.tiles[p.seg + 1] ?? p.tiles[p.seg] ?? 0);
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;
      const color = p.kind === "build" ? 0xe9fbff : COLORS.economy;
      if (p.boost > 1) {
        // A boosted packet draws a short tail and a faint glow, growing with its boost up to three boosters.
        const strength = Math.min(1, Math.log(p.boost) / Math.log(BOOST ** 3));
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        const tail = Math.min(TILE * (0.4 + 0.8 * strength), length * p.t);
        if (tail > 0.5) {
          const ux = (b.x - a.x) / length;
          const uy = (b.y - a.y) / length;
          over
            .moveTo(x - ux * tail, y - uy * tail)
            .lineTo(x, y)
            .stroke({ width: 2.2, color, alpha: 0.25 + 0.25 * strength, cap: "round" });
        }
        over.circle(x, y, 3.2 + 1.6 * strength).fill({ color, alpha: 0.2 + 0.15 * strength });
      }
      over.circle(x, y, 3.2).fill(color);
    }
    for (const shell of game.shells) {
      // Shells fly like globs: straight between tile centres, so the engine's globAt places them too.
      const f = shell.t / shell.duration;
      const p = globAt(shell);
      const { x, y } = pointToWorld(p.x, p.y);
      const lift = Math.sin(Math.PI * f) * span(shell.sx, shell.sy, shell.tx, shell.ty) * TILE * 0.3;
      over.circle(x, y, 3).fill({ color: 0x000000, alpha: 0.35 });
      over.circle(x, y - lift, 4.5).fill(COLORS.weapon);
    }
    for (const glob of game.globs) {
      const p = globAt(glob);
      const g = pointToWorld(p.x, p.y);
      const { x: tx, y: ty } = tileToWorld(glob.tx, glob.ty);
      over.circle(tx, ty, TILE * (1.6 + 0.3 * pulse)).stroke({ width: 2.5, color: COLORS.bad, alpha: 0.9 });
      over.moveTo(tx - 8, ty).lineTo(tx + 8, ty).moveTo(tx, ty - 8).lineTo(tx, ty + 8).stroke({ width: 2, color: COLORS.bad });
      over.circle(g.x, g.y, TILE * (0.3 + 0.12 * glob.hp)).fill(COLORS.silt).stroke({ width: 2, color: 0xffd0ea });
    }
    for (const fx of rt.fx) {
      const f = fx.age / fx.life;
      const { x, y } = pointToWorld(fx.x, fx.y);
      if (fx.kind === "beam") {
        const end = pointToWorld(fx.x2, fx.y2);
        over.moveTo(x, y).lineTo(end.x, end.y).stroke({ width: 2.5, color: fx.color, alpha: 1 - f });
        over.circle(end.x, end.y, 4 + 6 * f).fill({ color: fx.color, alpha: 0.6 * (1 - f) });
      } else if (fx.kind === "ring") {
        over.circle(x, y, fx.radius * TILE * (calm ? 1 : 0.3 + 0.7 * f)).stroke({ width: 3, color: fx.color, alpha: 1 - f });
      } else if (!calm) {
        over.circle(x, y, fx.radius * TILE).fill({ color: fx.color, alpha: 0.5 * (1 - f) });
      }
    }

    const selected = byId.get(rt.selected.value);
    if (selected) {
      const def = KINDS[selected.kind];
      const { x, y } = tileToWorld(selected.x, selected.y);
      over.circle(x, y, (def.radius + 0.72) * TILE).stroke({ width: 2, color: 0xffffff });
      if (def.range > 0) this.range(over, game, selected.x, selected.y, def.range, def.minRange, ACCENT[selected.kind]);
    }

    const tool = rt.tool.value;
    const hover = rt.hover;
    this.drawHarvest(game);
    this.ghost.visible = false;
    if (hover && tool.kind === "build") {
      const def = KINDS[tool.structure];
      const error = placeError(game, tool.structure, hover.x, hover.y);
      const { x, y } = tileToWorld(hover.x, hover.y);
      // The same links the engine creates once the structure is placed.
      const links = linksAt(game, tool.structure, hover.x, hover.y);
      const linked = links.length > 0;
      for (const s of links) {
        const to = tileToWorld(s.x, s.y);
        over.moveTo(x, y).lineTo(to.x, to.y).stroke({ width: 2, color: COLORS.grid, alpha: 0.5 });
      }
      const ok = error === null && linked;
      this.ghost.visible = true;
      this.place(this.ghost, tool.structure, x, y);
      this.ghost.tint = error === null ? 0xffffff : COLORS.bad;
      this.footprint(over, game, hover.x, hover.y, def.radius).stroke({
        width: 2,
        color: ok ? COLORS.utility : error === null ? COLORS.economy : COLORS.bad,
      });
      if (def.range > 0) this.range(over, game, hover.x, hover.y, def.range, def.minRange, ACCENT[tool.structure]);
      if (tool.structure === "pylon" && error === null) {
        // What a pylon here would collect from: the free tiles around it on its own level.
        const tiles = harvestPreview(game, hover.x, hover.y);
        for (const i of tiles) {
          const t = tileOf(game.w, i);
          over.poly(hexPoints(t.x, t.y));
        }
        if (tiles.length > 0) {
          // Hatched like the area of a pylon that is placed but not built.
          over.fill({ color: COLORS.harvest, alpha: 0.1 });
          for (const i of tiles) {
            const t = tileOf(game.w, i);
            for (const [x1, y1, x2, y2] of hatch(t.x, t.y, TILE / 3)) over.moveTo(x1, y1).lineTo(x2, y2);
          }
          over.stroke({ width: 1.5, color: COLORS.harvest, alpha: 0.4 });
        }
      }
    } else if (hover && tool.kind === "grade") {
      const canGrade = floorCanBeGraded(game, hover.y * game.w + hover.x);
      over.poly(hexPoints(hover.x, hover.y)).stroke({ width: 2, color: canGrade ? COLORS.utility : COLORS.bad });
    }
  }

  /** Adds the outline of a footprint to the path: one hexagon, or the tiles within `radius` steps. */
  private footprint(g: Graphics, game: Game, x: number, y: number, radius: number): Graphics {
    // A single hexagon is drawn even off the map, so the pointer always shows where it is.
    if (radius === 0) return g.poly(hexPoints(x, y));
    for (const loop of areaOutline(game.w, game.h, x, y, radius)) g.poly(loop);
    return g;
  }

  /** Shades the tiles the pylons collect energy from; redrawn only when the engine says they changed. */
  private drawHarvest(game: Game): void {
    // Pylons that do not gather yet change the picture too, without the engine's area changing.
    let key = "";
    for (const s of game.structures) {
      if (s.kind === "pylon" && !(s.built && s.active && Number.isFinite(s.dist))) key += `${String(s.id)};`;
    }
    if (game.harvestRev === this.harvestRev && key === this.harvestKey) return;
    this.harvestRev = game.harvestRev;
    this.harvestKey = key;
    const claimed = game.harvest;
    const g = this.harvest.clear();
    const inSet = (x: number, y: number): boolean =>
      x >= 0 && y >= 0 && x < game.w && y < game.h && claimed[y * game.w + x] === 1;
    const members: { x: number; y: number }[] = [];
    for (let i = 0; i < claimed.length; i++) {
      if (claimed[i] !== 1) continue;
      const t = tileOf(game.w, i);
      members.push(t);
      g.poly(hexPoints(t.x, t.y));
    }
    if (members.length > 0) {
      g.fill({ color: COLORS.harvest, alpha: 0.22 });
      for (const loop of outline(members, inSet)) g.poly(loop);
      g.stroke({ width: 1.5, color: COLORS.harvest, alpha: 0.45 });
    }
    // What the pylons still under construction are going to collect from: fainter, and hatched.
    const pending = key === "" ? [] : harvestPending(game);
    for (const i of pending) {
      const t = tileOf(game.w, i);
      g.poly(hexPoints(t.x, t.y));
    }
    if (pending.length > 0) {
      g.fill({ color: COLORS.harvest, alpha: 0.1 });
      for (const i of pending) {
        const t = tileOf(game.w, i);
        for (const [x1, y1, x2, y2] of hatch(t.x, t.y, TILE / 3)) g.moveTo(x1, y1).lineTo(x2, y2);
      }
      g.stroke({ width: 1.5, color: COLORS.harvest, alpha: 0.4 });
    }
  }

  /** The tiles within `range` steps of a tile, tinted and outlined; tiles closer than `min` are outlined inside. */
  private range(g: Graphics, game: Game, x: number, y: number, range: number, min: number, color: number): void {
    for (const loop of areaOutline(game.w, game.h, x, y, range)) {
      g.poly(loop).fill({ color, alpha: 0.05 }).stroke({ width: 2, color, alpha: 0.6 });
    }
    if (min > 0) {
      for (const loop of areaOutline(game.w, game.h, x, y, min - 1)) {
        g.poly(loop).stroke({ width: 1.5, color, alpha: 0.4 });
      }
    }
  }
}
