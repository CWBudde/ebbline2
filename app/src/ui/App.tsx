import type { Controller } from "../controller.ts";
import { t } from "../i18n/index.ts";
import { Game } from "./Game.tsx";
import { Campaign, Help, Page, SettingsForm, Skirmish, Title } from "./Shell.tsx";

export function App({ c }: { c: Controller }) {
  const screen = c.screen.value;
  return (
    <>
      {screen === "title" && <Title c={c} />}
      {screen === "campaign" && <Campaign c={c} />}
      {screen === "skirmish" && <Skirmish c={c} />}
      {screen === "settings" && <Page c={c} title={t("menu.settings")}><SettingsForm c={c} /></Page>}
      {screen === "help" && <Page c={c} title={t("menu.help")} wide><Help /></Page>}
      {screen === "game" && <Game c={c} />}
      {c.notice.value !== "" && <div class="toast" role="status">{c.notice.value}</div>}
    </>
  );
}
