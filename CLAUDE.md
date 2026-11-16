# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Ebbline 2 is a browser strategy game on hexagonal tiles: silt rises from vents, the player builds an energy
grid outward from the lander, burns the silt back and caps every vent. `PLAN.md` lists the open work.

## Commands

Node 24 and pnpm (version pinned in `package.json`). The root is a pnpm workspace with two packages,
`engine` (`@ebbline2/engine`) and `app` (`@ebbline2/app`); all scripts run from the root.

```sh
pnpm run dev         # Vite dev server
pnpm run typecheck   # tsc for the root configs, engine and app (no emit anywhere)
pnpm run lint        # eslint, strictTypeChecked, zero warnings allowed
pnpm run test        # vitest, engine and app unit tests
pnpm run build       # production build into build/site
pnpm run check       # typecheck + lint + test + build; what CI runs
pnpm run e2e         # Playwright against build/site (run `pnpm run build` first)
```

Single tests:

```sh
pnpm exec vitest run engine/src/harvest.test.ts
pnpm exec vitest run engine/src/weapons.test.ts -t "name of the test"
pnpm exec playwright test -c app/e2e/playwright.config.ts game.spec.ts --project chromium
```

- `engine/src/balance.test.ts` plays every campaign mission twice and takes many seconds. Leave it out while
  iterating on something unrelated (`pnpm exec vitest run --exclude '**/balance.test.ts'`), but run it after
  any change to rules, constants or levels.
- The e2e suite serves `build/site` under `/ebbline2/` through `app/e2e/server.ts` (as a GitHub Pages project
  site would) and runs each spec in two projects, `chromium` and `phone` (Pixel 7). It pins the locale to
  `en-US` because specs read English text.
- Vite's and Vitest's caches live outside the project (`cachedir.ts`): `$EBBLINE2_VITE_CACHE` or the system
  temp folder.

## Architecture

### Engine (`engine/src`)

The simulation: pure TypeScript, deterministic, no DOM, no Node, no rendering libraries. ESLint enforces this
for everything except tests and `testing/` (`no-restricted-imports`, `no-restricted-globals` in
`eslint.config.js`). The package has no build step; `index.ts` is the public surface and the app imports the
TypeScript source through the workspace link. Something the app needs must be exported there.

- `state.ts`: the `Game` type and all constants. The state is plain data (numbers, arrays, typed arrays per
  tile) so it can be saved and structured-cloned; there are no classes and no methods on it. Structure kinds
  and their numbers are the `KINDS` table.
- `commands.ts`: `apply(game, command)` is the only way player intent enters the game. Commands are data, so
  the same commands at the same ticks replay a game.
- `step.ts`: `step(game)` advances one tick (30 Hz, `TICK_HZ`) in a fixed order: grid rebuild, vents,
  spitters, silt flow (every `FLOW_EVERY`-th tick), weapons, wear, packets, win/loss, history. Both `apply` and
  `step` mutate the game and return `Event[]`, which is how the app learns what happened (sounds, effects).
- `history.ts`: the course of the game for the statistics screen, sampled into `game.history` every
  `history.every` ticks (once a second, doubling whenever `HISTORY_MAX` samples are reached). A new series is a
  key in `History` and `SERIES` plus a line in `sample()`. Income by source and spending by purpose are booked
  in `game.flow` by `gain()` and `spend()` in `packets.ts`.
- `hex.ts`: the only place that knows hexagon geometry. Pointy-top hexagons in odd-r offset coordinates, tiles
  stored at index `y * w + x`, positions in tile units where touching centres are 1 apart. Neighbours,
  distances, discs and picking all go through it; do not hand-roll neighbour offsets elsewhere.
- `rng.ts`: seeded PRNG whose state is a field of the game. Never use `Math.random` or time in the engine.
- `terrain.ts` / `levels.ts`: `generate(level)` builds a game from a `LevelDef`; `CAMPAIGN` holds the ten
  missions and `skirmish()` makes one from seed, size and difficulty.
- `save.ts`: versioned JSON with typed arrays as base64. `load` refuses any schema but the current one, so a
  change to the shape of `Game` means bumping `SAVE_SCHEMA` (with a line in its comment) and adding a new
  typed array to `ARRAYS` and to `load`. `fingerprint` hashes a save for determinism tests.
- Derived state (`harvest`, the grid's `dist`/`parent`/`links`) is recomputed, not trusted: set
  `game.gridDirty` when the grid's shape changes and call `updateHarvest` when pylons change.
- `testing/fixtures.ts` gives rule tests a flat map with the lander at 12,12 and helpers that build
  structures without packets. `testing/bot.ts` is a scripted player; the campaign numbers are tuned so it only
  just wins, which is what `balance.test.ts` asserts (and that doing nothing loses).

### App (`app/src`)

Vite, PixiJS for the map canvas, Preact with signals for the DOM UI on top of it.

- `controller.ts`: the one object that ties everything together (screens, overlays, starting and saving games,
  settings, the frame loop). `main.tsx` puts it on `window.ebbline`, which the e2e specs use to read game
  state and to map tiles to screen positions.
- `runtime.ts`: one running game. It owns the fixed-step loop (accumulator over real time, speed 1/2/4), sends
  commands through `act()`, turns engine events into short-lived effects and publishes a throttled HUD
  snapshot. The UI reads signals; it does not read the `Game` object reactively.
- `input.ts`, `camera.ts`, `place.ts`: pointer and keyboard handling, the view transform (tile units → world
  pixels via `TILE` and `ORIGIN` → screen), and drag-placement spacing.
- `render/`: `world.ts` draws the map (baked terrain, silt texture, sprites, per-frame overlay). Sprites come
  from the atlases in `app/public/art/`; every structure also has a code-drawn version in `art.ts` that is
  used when an image fails to load, so both must exist for a new kind. `assets.ts` knows which art is
  installed and has no Pixi or DOM imports, so the UI and tests can use it.
- `ui/`: Preact components (`Shell.tsx` for menus and pages, `Game.tsx` for the in-game HUD, `Briefing.tsx`,
  `Stats.tsx` for the statistics with SVG charts from the pure helpers in `chart.ts`). The overlays (`Overlay`
  in `controller.ts`: menu, help, settings, briefing, stats) hold the game while open; the statistics also open
  over the result screen, by the key T and from the energy readout (`openStats`).
- `storage.ts`: settings, progress and the save in `localStorage`; every access may fail and the game must
  work with nothing stored.
- `audio/`: generated music and sound, driven by engine events and a silt "tension" reading.

### Text and languages

`app/src/i18n/en.ts` defines the interface keys; the twelve other language files are typed against them, so a
missing key fails the typecheck. The English names and descriptions of structures and the names, briefs and
hints of levels are not in `en.ts`: they live with the data in the engine (`KINDS`, `CAMPAIGN`), and each other
language translates them by id in its `Content` table. `i18n.test.ts` checks that every language has all keys,
the same placeholders and markup, and text for every level, hint, structure kind and placement error. Any new
or changed player-facing text therefore has to be done in all thirteen languages in the same change.

### Adding a structure kind

It touches, at least: `Kind` and `KINDS` in `state.ts`, the campaign order in `levels.ts`, the rules in the
engine, the `Content` table of every language, the code-drawn fallback in `render/art.ts`, and the art under
`app/public/art/`. `assets.test.ts` requires an atlas frame for every kind, and a briefing illustration for
every buildable kind that is not listed in its `DRAWN_ONLY`.

## Art

The images under `app/public/art/` are generated. `art/style.md` (palette, map geometry, prompt preamble) and
`art/direction.md` (the prompt of every image) are the source of truth; update them when an image changes. The
`gfx-imagegen` skill covers generating and installing images.

The title is three layers (`title-bg.jpg`, `title-mid.jpg`, `title-fg.jpg`) that `render/titleScene.ts`
draws with WebGL as one scene seen by a pinhole camera: the silt sea is computed in the shader on a
perspective plane, the islands of `title-mid.jpg` stand on it as upright cards, the sky (with the vent and
its animated plume) comes from `title-bg.jpg`, and the pointer moves the camera for the parallax; `title.jpg` is the same picture flat, for the other
menus and as the fallback. The two cut-out files hold the colour in the upper half and the alpha as grey in
the lower half. Light positions, the layers' row bands, the island boxes (`ISLANDS`) and the vent mouth
(`VENT`, `PLUME`) are constants in `titleScene.ts` and must follow the art.

## Repository

`origin` is `github.com/CWBudde/ebbline2`. `.github/workflows/test.yaml` runs `check` and the e2e suite;
`deploy-pages.yaml` publishes the build to GitHub Pages on every push to `main`, so a push is a release.
`build/` and `.claude/` are git-ignored.
