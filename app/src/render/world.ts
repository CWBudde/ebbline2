// Draws the map: baked ground, the silt texture, structure and feature sprites and a per-frame overlay.

import { CanvasSource, Container, Graphics, Sprite, Texture, type Application } from "pixi.js";
import {
  BUILDABLE,
  KINDS,
  LINK_RANGE,
  globAt,
  linksAt,
  placeError,
  ventDry,
  type Game,
  type Structure,
} from "@ebbline2/engine";
import { TILE, type View } from "../camera.ts";
import type { Runtime } from "../runtime.ts";
import { ACCENT, COLORS, drawStructure } from "./art.ts";
import { spriteUrls, type SpriteKind } from "./assets.ts";
import { coverageKey, gridCoverage } from "./coverage.ts";
import { loadArt, type Art, type SpriteArt } from "./sprites.ts";
import { BAKE, SILT_SUB, bakeTerrain, paintSilt, rebakeTile, type Materials } from "./terrain.ts";

const centre = (tile: number): number => (tile + 0.5) * TILE;

/** Share of its footprint a sprite fills; the atlas stores every piece at the same size. */
const FIT: Partial<Record<SpriteKind, number>> = {
  pylon: 0.82,
  vent: 1.5,
  spitter: 1.7,
  lode: 1.05,
};

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
  /** The tiles the built grid reaches, shown while building and for a selected structure. */
  private readonly coverage = new Graphics();
  private coverageKey = "";
  private readonly under = new Graphics();
  private readonly sprites = new Container();
  private readonly ghost = new Sprite();
  private readonly over = new Graphics();
  private readonly textures = new Map<SpriteKind, SpriteArt>();
  private readonly byId = new Map<number, Sprite>();
  private readonly ventSprites: Sprite[] = [];
  private readonly spitterSprites = new Map<number, Sprite>();
  private materials: Materials = {};
  private groundCanvas: HTMLCanvasElement | undefined;
  private siltCanvas: HTMLCanvasElement | undefined;
  private siltImage: ImageData | undefined;
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
      drawing.destroy();
    }
    this.ghost.anchor.set(0.5);
    this.ghost.alpha = 0.55;
    this.world.addChild(
      this.ground,
      this.lodes,
      this.features,
      this.silt,
      this.vents,
      this.coverage,
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
    for (const [kind, sprite] of art.sprites) this.textures.set(kind, sprite);
    this.materials = art.materials;
    spriteUrls.value = { ...spriteUrls.value, ...art.urls };
    if (this.game) this.load(this.game);
  }

  private place(sprite: Sprite, kind: SpriteKind, x: number, y: number): void {
    const art = this.textures.get(kind);
    sprite.texture = art?.texture ?? Texture.EMPTY;
    sprite.anchor.set(0.5);
    sprite.scale.set(((art ? TILE / art.perTile : 1) * (FIT[kind] ?? 1)));
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
    this.coverage.clear();
    this.coverageKey = "";
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
    this.siltCanvas = document.createElement("canvas");
    this.siltCanvas.width = game.w * SILT_SUB;
    this.siltCanvas.height = game.h * SILT_SUB;
    this.siltImage = new ImageData(game.w * SILT_SUB, game.h * SILT_SUB);
    this.silt.texture.destroy(true);
    this.silt.texture = Texture.from(this.siltCanvas);
    this.silt.texture.source.scaleMode = "linear";
    this.silt.scale.set(TILE / SILT_SUB);
    this.features.clear();
    const lodeArt = this.textures.has("lode");
    for (let i = 0; i < game.lode.length; i++) {
      if (game.lode[i] !== 1) continue;
      const x = centre(i % game.w);
      const y = centre(Math.floor(i / game.w));
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
        this.place(sprite, "vent", centre(vent.x), centre(vent.y));
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
        this.place(sprite, s.kind, centre(s.x), centre(s.y));
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
      if (sprite) sprite.tint = vent.capped ? 0x56666c : 0xffffff;
    });
    if (!this.textures.has("spitter")) return;
    const seen = new Set<number>();
    for (const spitter of game.spitters) {
      const key = spitter.y * game.w + spitter.x;
      seen.add(key);
      if (this.spitterSprites.has(key)) continue;
      const sprite = new Sprite();
      this.place(sprite, "spitter", centre(spitter.x), centre(spitter.y));
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

    if (rt.regraded.length > 0 && this.groundCanvas) {
      for (const tile of rt.regraded) rebakeTile(this.groundCanvas, game, tile);
      rt.regraded = [];
      this.ground.texture.source.update();
    }
    // The silt is repainted when it has flowed and, unless motion is reduced, a few times a second
    // in between so that its surface shimmers.
    const flowed = this.paintedTick !== game.tick;
    const due = !calm && !held && !rt.paused.value && now - this.paintedAt >= SHIMMER_MS;
    if ((flowed || due) && this.siltCanvas && this.siltImage) {
      this.paintedTick = game.tick;
      this.paintedAt = now;
      paintSilt(this.siltImage, game.silt, game.w, game.h, calm ? 0 : now / 700);
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
      under
        .moveTo(centre(a.x), centre(a.y))
        .lineTo(centre(b.x), centre(b.y))
        .stroke({ width: Math.max(1.5, 2 * px), color: COLORS.grid, alpha: live ? 0.55 : 0.2 });
    }
    for (const s of game.structures) {
      if (s.kind === "baffle" && s.built && s.active && s.energy > 0) {
        under
          .circle(centre(s.x), centre(s.y), (KINDS.baffle.range + 0.5) * TILE)
          .fill({ color: COLORS.utility, alpha: 0.07 })
          .stroke({ width: 2 * px, color: COLORS.utility, alpha: 0.35 });
      }
    }
    for (let i = 0; i < game.mark.length; i++) {
      const mark = game.mark[i] ?? -1;
      if (mark < 0) continue;
      const raise = mark > (game.height[i] ?? 0);
      const x = (i % game.w) * TILE;
      const y = Math.floor(i / game.w) * TILE;
      under
        .rect(x + 2, y + 2, TILE - 4, TILE - 4)
        .fill({ color: raise ? COLORS.utility : COLORS.grid, alpha: 0.22 })
        .stroke({ width: 1.5, color: raise ? COLORS.utility : COLORS.grid, alpha: 0.9 });
    }
    const ventArt = this.ventSprites.length > 0;
    for (const vent of game.vents) {
      if (vent.capped) continue;
      const x = centre(vent.x);
      const y = centre(vent.y);
      const dry = ventDry(game, vent);
      if (ventArt) {
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
        const x = centre(spitter.x);
        const y = centre(spitter.y);
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
      const x = centre(s.x);
      const y = centre(s.y);
      const half = (def.size * TILE) / 2;
      if (s.built && s.active && s.target >= 0 && def.range > 0 && s.kind !== "baffle" && s.kind !== "pump") {
        // The sprites have no front; a pip on the rim shows where the structure is working.
        const tx = centre(s.target % game.w) - x;
        const ty = centre(Math.floor(s.target / game.w)) - y;
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
        const top = y + half - 5 - row * 4;
        over.rect(x - half + 2, top, (half * 2 - 4), 3).fill({ color: 0x000000, alpha: 0.6 });
        over.rect(x - half + 2, top, (half * 2 - 4) * Math.max(0, Math.min(1, share)), 3).fill(color);
      };
      if (s.health < def.cost) bar(0, s.health / def.cost, s.built ? COLORS.bad : 0xffffff);
      if (s.built && def.store > 0 && s.energy < def.store * 0.75) {
        bar(s.health < def.cost ? 1 : 0, s.energy / def.store, COLORS.economy);
      }
      if (!Number.isFinite(s.dist) && pulse > 0.4) {
        over.circle(x + half - 4, y - half + 4, 4).fill(COLORS.bad);
      }
    }
    for (const p of game.packets) {
      const a = p.tiles[p.seg] ?? 0;
      const b = p.tiles[p.seg + 1] ?? a;
      const ax = centre(a % game.w);
      const ay = centre(Math.floor(a / game.w));
      const bx = centre(b % game.w);
      const by = centre(Math.floor(b / game.w));
      over
        .circle(ax + (bx - ax) * p.t, ay + (by - ay) * p.t, 3.2)
        .fill(p.kind === "build" ? 0xe9fbff : COLORS.economy);
    }
    for (const shell of game.shells) {
      const f = shell.t / shell.duration;
      const span = Math.hypot(shell.tx - shell.sx, shell.ty - shell.sy);
      const x = centre(shell.sx + (shell.tx - shell.sx) * f);
      const y = centre(shell.sy + (shell.ty - shell.sy) * f);
      const lift = Math.sin(Math.PI * f) * span * TILE * 0.3;
      over.circle(x, y, 3).fill({ color: 0x000000, alpha: 0.35 });
      over.circle(x, y - lift, 4.5).fill(COLORS.weapon);
    }
    for (const glob of game.globs) {
      const p = globAt(glob);
      const tx = centre(glob.tx);
      const ty = centre(glob.ty);
      over.circle(tx, ty, TILE * (1.6 + 0.3 * pulse)).stroke({ width: 2.5, color: COLORS.bad, alpha: 0.9 });
      over.moveTo(tx - 8, ty).lineTo(tx + 8, ty).moveTo(tx, ty - 8).lineTo(tx, ty + 8).stroke({ width: 2, color: COLORS.bad });
      over.circle(centre(p.x), centre(p.y), TILE * (0.3 + 0.12 * glob.hp)).fill(COLORS.silt).stroke({ width: 2, color: 0xffd0ea });
    }
    for (const fx of rt.fx) {
      const f = fx.age / fx.life;
      const x = centre(fx.x);
      const y = centre(fx.y);
      if (fx.kind === "beam") {
        over.moveTo(x, y).lineTo(centre(fx.x2), centre(fx.y2)).stroke({ width: 2.5, color: fx.color, alpha: 1 - f });
        over.circle(centre(fx.x2), centre(fx.y2), 4 + 6 * f).fill({ color: fx.color, alpha: 0.6 * (1 - f) });
      } else if (fx.kind === "ring") {
        over.circle(x, y, fx.radius * TILE * (calm ? 1 : 0.3 + 0.7 * f)).stroke({ width: 3, color: fx.color, alpha: 1 - f });
      } else if (!calm) {
        over.circle(x, y, fx.radius * TILE).fill({ color: fx.color, alpha: 0.5 * (1 - f) });
      }
    }

    const selected = byId.get(rt.selected.value);
    if (selected) {
      const def = KINDS[selected.kind];
      const x = centre(selected.x);
      const y = centre(selected.y);
      over.circle(x, y, def.size * TILE * 0.72).stroke({ width: 2, color: 0xffffff });
      if (def.range > 0) this.range(over, x, y, def.range, def.minRange, ACCENT[selected.kind]);
    }

    const tool = rt.tool.value;
    const hover = rt.hover;
    this.coverage.visible =
      tool.kind === "build" || (tool.kind === "none" && selected !== undefined);
    if (this.coverage.visible) this.drawCoverage(game);
    this.ghost.visible = false;
    if (hover && tool.kind === "build") {
      const def = KINDS[tool.structure];
      const error = placeError(game, tool.structure, hover.x, hover.y);
      const x = centre(hover.x);
      const y = centre(hover.y);
      // The same links the engine creates once the structure is placed.
      const links = linksAt(game, tool.structure, hover.x, hover.y);
      const linked = links.length > 0;
      for (const s of links) {
        over.moveTo(x, y).lineTo(centre(s.x), centre(s.y)).stroke({ width: 2, color: COLORS.grid, alpha: 0.5 });
      }
      const ok = error === null && linked;
      this.ghost.visible = true;
      this.place(this.ghost, tool.structure, x, y);
      this.ghost.tint = error === null ? 0xffffff : COLORS.bad;
      over.rect(hover.x * TILE, hover.y * TILE, TILE, TILE).stroke({
        width: 2,
        color: ok ? COLORS.utility : error === null ? COLORS.economy : COLORS.bad,
      });
      if (def.range > 0) this.range(over, x, y, def.range, def.minRange, ACCENT[tool.structure]);
      else this.range(over, x, y, LINK_RANGE, 0, COLORS.grid);
    } else if (hover && tool.kind === "grade") {
      over.rect(hover.x * TILE, hover.y * TILE, TILE, TILE).stroke({ width: 2, color: COLORS.utility });
    }
  }

  /** Tints the tiles within reach of the grid and outlines their edge; redrawn only when the grid changes. */
  private drawCoverage(game: Game): void {
    const key = coverageKey(game);
    if (key === this.coverageKey) return;
    this.coverageKey = key;
    const covered = gridCoverage(game);
    const g = this.coverage.clear();
    const at = (x: number, y: number): boolean =>
      x >= 0 && y >= 0 && x < game.w && y < game.h && covered[y * game.w + x] === 1;
    // The area, as one run of tiles per row.
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        if (!at(x, y)) continue;
        let end = x;
        while (at(end + 1, y)) end++;
        g.rect(x * TILE, y * TILE, (end - x + 1) * TILE, TILE);
        x = end;
      }
    }
    g.fill({ color: COLORS.grid, alpha: 0.08 });
    // The edge: every side of a covered tile that faces an uncovered one.
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        if (!at(x, y)) continue;
        const l = x * TILE;
        const t = y * TILE;
        if (!at(x, y - 1)) g.moveTo(l, t).lineTo(l + TILE, t);
        if (!at(x, y + 1)) g.moveTo(l, t + TILE).lineTo(l + TILE, t + TILE);
        if (!at(x - 1, y)) g.moveTo(l, t).lineTo(l, t + TILE);
        if (!at(x + 1, y)) g.moveTo(l + TILE, t).lineTo(l + TILE, t + TILE);
      }
    }
    g.stroke({ width: 1, color: COLORS.grid, alpha: 0.2 });
  }

  private range(g: Graphics, x: number, y: number, range: number, min: number, color: number): void {
    g.circle(x, y, (range + 0.5) * TILE)
      .fill({ color, alpha: 0.05 })
      .stroke({ width: 2, color, alpha: 0.6 });
    if (min > 0) g.circle(x, y, min * TILE).stroke({ width: 1.5, color, alpha: 0.4 });
  }
}
