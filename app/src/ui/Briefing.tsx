// The briefing shown before a campaign mission: what to do, and one card per thing that is new.

import { useEffect, useRef, useState } from "preact/hooks";
import { KINDS, type Kind } from "@ebbline2/engine";
import { briefingPlan, type Goal, type Subject } from "../briefing.ts";
import type { Controller } from "../controller.ts";
import { kindBlurb, kindName, levelBrief, levelName, num, t } from "../i18n/index.ts";
import { ILLUSTRATION_BACKGROUND, illustrationUrl, spriteUrl } from "../render/assets.ts";
import type { Runtime } from "../runtime.ts";
import "./briefing.css";

interface Source {
  readonly url: string;
  /** A small top-down sprite, shown small and crisp instead of filling the frame. */
  readonly sprite: boolean;
}

/**
 * The pictures to try for a card, best first. This is the one place that chooses a card's image:
 * the generated illustration, then the top-down sprite the build bar uses. Holding out has no
 * picture and gets a drawn glyph.
 */
function pictures(subject: Subject, icons: Partial<Record<Kind, string>>): readonly Source[] {
  if (subject === "survive") return [];
  const sources: Source[] = [];
  const illustration = illustrationUrl(subject);
  if (illustration !== undefined) sources.push({ url: illustration, sprite: false });
  const sprite = subject === "spitter" ? spriteUrl("spitter") : icons[subject];
  if (sprite !== undefined) sources.push({ url: sprite, sprite: true });
  return sources;
}

/** Shows the first picture that loads; an image that fails gives way to the next one. */
function Picture({ sources }: { sources: readonly Source[] }) {
  const [failed, setFailed] = useState<readonly string[]>([]);
  const source = sources.find((s) => !failed.includes(s.url));
  return (
    <div class="briefing-picture" style={{ background: ILLUSTRATION_BACKGROUND }}>
      {source ? (
        <img
          key={source.url}
          class={source.sprite ? "sprite" : undefined}
          src={source.url}
          alt=""
          onError={() => { setFailed([...failed, source.url]); }}
        />
      ) : (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="26" r="15" />
          <path d="M24 17v9l6 4M20 6h8M24 6v5" />
        </svg>
      )}
    </div>
  );
}

function Card({ c, subject }: { c: Controller; subject: Subject }) {
  const sources = pictures(subject, c.icons.value);
  if (subject === "spitter" || subject === "survive") {
    return (
      <li class={`briefing-card ${subject}`} data-subject={subject}>
        <Picture sources={sources} />
        <div class="briefing-text">
          <h3>{t(`briefing.${subject}.name`)}</h3>
          <p class="briefing-meta">
            <span class="badge">{t(subject === "spitter" ? "briefing.new.threat" : "briefing.new.goal")}</span>
          </p>
          <p>{t(`briefing.${subject}.text`)}</p>
          <p class="briefing-tip"><strong>{t("briefing.tip")}</strong> {t(`tip.${subject}`)}</p>
        </div>
      </li>
    );
  }
  const def = KINDS[subject];
  return (
    <li class="briefing-card" data-subject={subject}>
      <Picture sources={sources} />
      <div class="briefing-text">
        <h3>{kindName(subject)}</h3>
        <p class="briefing-meta">
          <span class="cost">{t("info.cost", { cost: num(def.cost) })}</span>
          {def.range > 0 && (
            <span>
              {def.minRange > 0
                ? t("info.rangeMin", { range: num(def.range), min: num(def.minRange) })
                : t("info.range", { range: num(def.range) })}
            </span>
          )}
        </p>
        <p>{kindBlurb(subject)}</p>
        <p class="briefing-tip"><strong>{t("briefing.tip")}</strong> {t(`tip.${subject}`)}</p>
      </div>
    </li>
  );
}

function goalText(goal: Goal): string {
  if (goal.kind === "survive") {
    return t("briefing.objective.survive", { minutes: num(goal.minutes, Number.isInteger(goal.minutes) ? 0 : 1) });
  }
  return goal.vents === 1
    ? t("briefing.objective.cap.one")
    : t("briefing.objective.cap.many", { vents: num(goal.vents) });
}

export function Briefing({ c, rt }: { c: Controller; rt: Runtime }) {
  const button = useRef<HTMLButtonElement>(null);
  const plan = briefingPlan(rt.game.level.id);
  // Before the first tick the mission has not begun; later the same page is a reminder.
  const begun = rt.game.tick > 0;
  useEffect(() => {
    button.current?.focus();
    // Enter and Space deploy unless the focus is on something else that uses them, such as the
    // scrolling card list. A key still held from the click that opened the
    // briefing must not close it again, so repeats are swallowed. The map's own key handler was
    // registered earlier and has already ignored this event, because an overlay is open.
    const key = (e: KeyboardEvent): void => {
      if (e.code !== "Enter" && e.code !== "NumpadEnter" && e.code !== "Space") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target !== document.body && e.target !== button.current) return;
      e.preventDefault();
      if (!e.repeat) c.deploy();
    };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); };
  }, [c]);
  if (!plan) return null;
  const level = plan.level;
  return (
    <div class={c.still.value ? "veil briefing-veil still" : "veil briefing-veil"}>
      <section
        class="briefing"
        role="dialog"
        aria-modal="true"
        aria-labelledby="briefing-title"
        data-testid="briefing"
      >
        <header class="briefing-head">
          <p class="briefing-eyebrow">{t("briefing.mission", { number: num(plan.number), total: num(plan.total) })}</p>
          <h2 id="briefing-title">{levelName(level)}</h2>
          <p class="briefing-brief">{levelBrief(level)}</p>
          <p class="briefing-goal" data-testid="briefing-goal">
            <strong>{t("briefing.objective")}</strong> {goalText(plan.goal)}
          </p>
        </header>
        {plan.subjects.length > 0 && (
          <div class="briefing-body" tabIndex={0} role="group" aria-label={t("briefing.new")}>
            <h3 class="briefing-label" aria-hidden="true">{t("briefing.new")}</h3>
            <ul class={plan.subjects.length === 1 ? "briefing-cards single" : "briefing-cards"}>
              {plan.subjects.map((subject) => <Card key={subject} c={c} subject={subject} />)}
            </ul>
          </div>
        )}
        <footer class="briefing-foot">
          <button ref={button} class="btn primary" data-testid="deploy" onClick={() => { c.deploy(); }}>
            {begun ? t("briefing.resume") : t("briefing.deploy")}
          </button>
        </footer>
      </section>
    </div>
  );
}
