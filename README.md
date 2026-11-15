# Ebbline 2

Ebbline 2 is the successor to [Ebbline](https://github.com/CWBudde/Ebbline). It is played on hexagonal tiles and is in early development.

Play it at <https://cwbudde.github.io/ebbline2/>.

A browser strategy game: a survey crew lands on a dead colony world where silt, a dense reactive
fluid, wells up from vents and floods the lowlands. Build a power grid outward from the lander,
push the silt back and cap every vent.

## Development

Requires Node 24 and pnpm (the version pinned in `package.json`, for example through corepack).

```sh
pnpm install
pnpm run dev     # Vite dev server
pnpm run check   # typecheck, lint, tests, production build
pnpm run e2e     # Playwright against the production build
```

- `engine/` holds the simulation: pure TypeScript, deterministic, no DOM and no Node.
- `app/` is the browser front end: Vite, PixiJS for the map, Preact for the DOM UI.

The interface is in English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Russian,
Simplified Chinese and Japanese, and follows the browser's language; the setting can pin any of
them. Each language has one file in `app/src/i18n/` (`de.ts`, `fr.ts`, and so on) that is typed
against the English keys, so a missing translation fails the typecheck, and the unit tests check
that level text, placeholders and markup are complete.

## Art and fonts

The images under `app/public/art/` (structure and feature sprites, ground materials, the title
picture and the briefing illustrations) were generated for this project with an image model. The
style guide and the prompt of every image are in `art/`. Each structure also has a code-drawn
version in `app/src/render/art.ts`, which the game uses if an image fails to load.

The fonts are Big Shoulders and IBM Plex Sans, both under the SIL Open Font License 1.1, bundled
through the `@fontsource-variable` packages and served with the game.

## Origin

Ebbline 2 started from the Ebbline code.

This repository began as a fork of [OpenCreeper](https://github.com/alexanderzeillinger/OpenCreeper)
by Alexander Zeillinger, a 2012/13 Dart game. Ebbline is a new game written from scratch; none of the
old code or assets remain. The old tree is kept under the git tag `legacy-dart`.

## License

The code and the art are under the MIT license, see `LICENSE`. The fonts keep their own license (OFL-1.1).
