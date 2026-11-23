// Benchmark and behaviour check for the scripted player: `pnpm run bench [flags]`. Run directly from source by
// Node. Without a flag it runs --campaign and --skirmish.
//
//   --campaign      plays every mission once: result, time, structures standing, unused kinds, fingerprint
//   --margin        per mission, bisects the largest factor on the vents' amount (1/16 steps up to 3) still won
//   --sweep         per mission, plays at SWEEP's eleven factors and counts the wins; one game is chaotic, the count
//                   over a range of factors is what tells two versions of the bot apart
//   --skirmish      plays every difficulty and map size, --seeds seeds each (default 10)
//   --fingerprints  prints a fingerprint of every mission and of three skirmish seeds per kind, for determinism
//   --only <id,...> limits --campaign, --margin and --sweep to these missions
//   --seeds <n>     skirmish seeds per difficulty and size

import { CAMPAIGN, skirmish, type Difficulty, type MapSize } from "../levels.ts";
import { fingerprint } from "../save.ts";
import type { Game, Kind, LevelDef } from "../state.ts";
import { generate } from "../terrain.ts";
import { play } from "./bot.ts";

const LIMIT = 50 * 60;
const DIFFICULTIES: readonly Difficulty[] = ["easy", "normal", "hard"];
const SIZES: readonly MapSize[] = ["small", "medium", "large"];

const args = process.argv.slice(2);
const flag = (name: string): boolean => args.includes(`--${name}`);
const option = (name: string): string | undefined => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};

const only = option("only")?.split(",");
const levels = CAMPAIGN.filter((l) => !only || only.includes(l.id));
const seeds = Number(option("seeds") ?? 10);

function campaign(): void {
  for (const level of levels) {
    const game = generate(level);
    const t0 = performance.now();
    const outcome = play(game, LIMIT);
    const wall = Math.round(performance.now() - t0);
    const kinds: Partial<Record<Kind, number>> = {};
    for (const s of game.structures) kinds[s.kind] = (kinds[s.kind] ?? 0) + 1;
    const unused = level.allowed.filter((k) => !kinds[k]);
    console.log(
      [
        level.id,
        level.name,
        outcome.phase,
        `${outcome.seconds}s`,
        `${wall}ms`,
        JSON.stringify(kinds),
        `unused=${unused.join(",")}`,
        fingerprint(game),
      ].join(" | "),
    );
  }
}

function wins(level: LevelDef, f: number): boolean {
  const scaled = { ...level, vents: { ...level.vents, amount: level.vents.amount * f } };
  return play(generate(scaled), LIMIT).phase === "won";
}

function margin(): void {
  for (const level of levels) {
    if (!wins(level, 1)) {
      console.log(`${level.id} margin < 1`);
      continue;
    }
    // Grid of 1/16 steps from 1 to 3: index 0 is known to win; find the last index that wins.
    let lo = 0;
    let hi = 32;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (wins(level, 1 + mid / 16)) lo = mid;
      else hi = mid;
    }
    // If even the top of the grid wins, report it.
    const top = lo === 31 && wins(level, 3) ? 32 : lo;
    console.log(`${level.id} margin ${1 + top / 16}`);
  }
}

/** Factors on the vents' amount the sweep plays each mission at: 7/8 to 3/2 in sixteenths. */
const SWEEP = Array.from({ length: 11 }, (_, k) => 1 + (k - 2) / 16);

function sweep(): void {
  let won = 0;
  for (const level of levels) {
    const factors = SWEEP.filter((f) => wins(level, f));
    won += factors.length;
    console.log(`${level.id} ${factors.length}/${SWEEP.length} won at ${factors.join(" ")}`);
  }
  console.log(`sweep won ${won}/${levels.length * SWEEP.length}`);
}

function result(game: Game): { letter: string; seconds: number; capped: number; total: number } {
  const letter = game.phase === "won" ? "W" : game.phase === "lost" ? "L" : "T";
  return {
    letter,
    seconds: Math.floor(game.tick / 30),
    capped: game.vents.filter((v) => v.capped).length,
    total: game.vents.length,
  };
}

function skirmishes(): void {
  let won = 0;
  let all = 0;
  for (const difficulty of DIFFICULTIES) {
    for (const size of SIZES) {
      const cells: string[] = [];
      for (let seed = 1; seed <= seeds; seed++) {
        const game = generate(skirmish(seed, size, difficulty));
        play(game, LIMIT);
        const r = result(game);
        cells.push(`${r.letter}${r.seconds}(${r.capped}/${r.total})`);
        all += 1;
        if (r.letter === "W") won += 1;
      }
      console.log(`${difficulty} ${size}: ${cells.join(" ")}`);
    }
  }
  console.log(`skirmish won ${won}/${all}`);
}

function fingerprints(): void {
  for (const level of CAMPAIGN) {
    const game = generate(level);
    play(game, LIMIT);
    console.log(`${level.id} ${fingerprint(game)}`);
  }
  for (const difficulty of DIFFICULTIES) {
    for (const size of SIZES) {
      for (let seed = 1; seed <= 3; seed++) {
        const game = generate(skirmish(seed, size, difficulty));
        play(game, LIMIT);
        console.log(`${difficulty}-${size}-${seed} ${fingerprint(game)}`);
      }
    }
  }
}

if (flag("fingerprints")) {
  fingerprints();
} else {
  const any = flag("campaign") || flag("margin") || flag("sweep") || flag("skirmish");
  if (flag("campaign") || !any) campaign();
  if (flag("margin")) margin();
  if (flag("sweep")) sweep();
  if (flag("skirmish") || !any) skirmishes();
}
