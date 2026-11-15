// What a mission briefing contains. Pure: the component in ui/Briefing.tsx only lays it out.

import { CAMPAIGN, TICK_HZ, introduced, type Kind, type LevelDef } from "@ebbline2/engine";

export type Buildable = Exclude<Kind, "lander">;
/** Something a briefing explains on a card of its own. */
export type Subject = Buildable | "spitter" | "survive";

export type Goal =
  | { readonly kind: "cap"; readonly vents: number }
  | { readonly kind: "survive"; readonly minutes: number };

export interface BriefingPlan {
  readonly level: LevelDef;
  /** Position in the campaign, counted from one. */
  readonly number: number;
  readonly total: number;
  readonly goal: Goal;
  /** What is new, a new threat or objective first, then the structures that answer it. */
  readonly subjects: readonly Subject[];
}

/** The briefing of a campaign mission; a level outside the campaign has none. */
export function briefingPlan(levelId: string): BriefingPlan | undefined {
  const index = CAMPAIGN.findIndex((l) => l.id === levelId);
  const level = CAMPAIGN[index];
  if (!level) return undefined;
  const fresh = introduced(levelId);
  const subjects: Subject[] = [];
  if (fresh.survive) subjects.push("survive");
  if (fresh.spitters) subjects.push("spitter");
  for (const kind of fresh.structures) {
    if (kind !== "lander") subjects.push(kind);
  }
  const objective = level.objective;
  return {
    level,
    number: index + 1,
    total: CAMPAIGN.length,
    goal:
      objective.kind === "survive"
        ? { kind: "survive", minutes: objective.ticks / TICK_HZ / 60 }
        : { kind: "cap", vents: level.vents.count },
    subjects,
  };
}
