// English interface text, and the source of the keys: every other language file must define
// exactly these.
//
// Placeholders are named, as in "Best {time}". In the help text, *word* is set bold and _word_ in
// the silt colour.
//
// The English names and descriptions of structures and the names, briefs and hints of levels are
// not here: they live with the data in the engine (`KINDS`, `CAMPAIGN`, `skirmish()`), and other
// languages translate them by id in a `Content` table.

import type { Kind } from "@ebbline2/engine";

export const en = {
  "meta.description":
    "Ebbline 2: a fluid-defence game. Silt rises from the vents; build a grid, push it back and cap them all.",

  "title.lede": "Silt is rising from the vents. Build a grid, push it back, cap them all.",
  "title.continue": "Continue",
  "title.credit": "An open-source game under the MIT licence. Art made for this project.",
  "menu.campaign": "Campaign",
  "menu.skirmish": "Skirmish",
  "menu.help": "How to play",
  "menu.settings": "Settings",
  "common.back": "Back",

  "campaign.locked": "Win the mission before this one to unlock it.",
  "campaign.best": "Best {time}",
  "campaign.next": "Next mission",

  "skirmish.seed": "Seed",
  "skirmish.size": "Map size",
  "skirmish.size.small": "Small, two vents",
  "skirmish.size.medium": "Medium, three vents",
  "skirmish.size.large": "Large, four vents",
  "skirmish.difficulty": "Difficulty",
  "skirmish.difficulty.easy": "Easy, no spitters",
  "skirmish.difficulty.normal": "Normal, one spitter",
  "skirmish.difficulty.hard": "Hard, two spitters",
  "skirmish.note":
    "The same seed, size and difficulty always give the same map. The address bar holds a link to it once the game starts.",
  "skirmish.start": "Start",

  "settings.language": "Language",
  "settings.language.auto": "Automatic",
  "settings.volume": "Volume",
  "settings.music": "Ambient drone",
  "settings.edgeScroll": "Scroll when the pointer touches the screen edge",
  "settings.reducedMotion": "Reduce flashes and pulsing",

  "help.intro":
    "Silt wells up from _vents_ and flows downhill. It wears down anything it stands on. Lose the lander and the mission is lost. Win by building a *Cap* on every vent.",
  "help.grid.title": "The grid",
  "help.grid.text":
    "Energy leaves the lander as packets and travels along grid links. Every structure passes packets on, and each must stand within six tiles of a built one; Pylons are the cheap way to reach further. While you build, or with a Pylon selected, the area the finished grid reaches is tinted. A red dot marks a structure the grid does not reach. Pylons collect energy from the tiles within three steps that are on their own level and in direct view (shown as a green area); higher ground or rock in between blocks it, and silt-covered tiles yield nothing.",
  "help.cap.title": "Capping a vent",
  "help.cap.text":
    "A Cap can only be started when the vent tile is nearly dry, shown by a white ring. While it is being built it holds the vent shut, but the pressure builds up: if the Cap is lost, all of it bursts out at once.",
  "help.structures.title": "Structures",
  "help.controls.title": "Controls",
  "help.keys.click": "Click, tap",
  "help.keys.click.does": "Place with a tool, otherwise select",
  "help.keys.drag": "Drag",
  "help.keys.drag.does": "Place a row or paint marks with a tool, otherwise move the map",
  "help.keys.cancel": "Right click, Esc",
  "help.keys.cancel.does": "Put the tool away, deselect, open the menu",
  "help.keys.zoom": "Wheel, pinch",
  "help.keys.zoom.does": "Zoom",
  "help.keys.pan": "W A S D, arrows",
  "help.keys.pan.does": "Move the map",
  "help.keys.slots": "1 to 0, −",
  "help.keys.slots.does": "Pick a structure from the build bar",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Mark ground for Graders",
  "help.keys.pause": "Space",
  "help.keys.pause.does": "Pause",
  "help.keys.speed": "[ ]",
  "help.keys.speed.does": "Slower, faster",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Switch the selected structure off or on",
  "help.keys.dismantle": "Delete",
  "help.keys.dismantle.does": "Dismantle the selected structure for half its cost",

  "hud.energy.title": "Energy in the bank, and what came in and went out over the last second",
  "hud.hold": "Hold {time}",
  "hud.capped": "Vents capped {capped} / {vents}",
  "hud.pause": "Pause",
  "hud.paused": "Paused",
  "hud.pause.title": "Pause (Space)",
  "hud.menu": "Menu",
  "hud.menu.title": "Menu (Esc)",
  "hud.map": "Map overview",

  "build.label": "Build",
  "build.mark": "Mark",
  "build.mark.cost": "ground",
  "build.mark.title": "Mark ground for Graders to raise or lower",
  /** The key right of 0, which picks the eleventh slot. */
  "key.slot11": "−",
  "key.delete": "Del",

  "status.offGrid": "Off the grid: needs a structure within six tiles",
  "status.building": "Under construction",
  "status.off": "Switched off",
  "status.damaged": "Damaged, repairing",
  "status.working": "Working",

  "info.cost": "{cost} energy",
  "info.range": "Range {range}",
  "info.rangeMin": "Range {range}, not closer than {min}",
  "info.place": "Click to place, drag for a row. Right click or Esc puts it away.",
  "info.health": "Health",
  "info.energy": "Energy",
  "info.switchOff": "Switch off",
  "info.switchOn": "Switch on",
  "info.dismantle": "Dismantle",
  "info.notes": "Notes",
  "info.hide": "Hide",

  "grade.title": "Mark ground",
  "grade.text": "Pick a target height, then paint tiles. A Grader within eight tiles does the work.",
  "grade.erase": "Erase",

  "pause.title": "Paused",
  "pause.resume": "Resume",
  "pause.save": "Save",
  "pause.briefing": "Briefing",
  "pause.restart": "Restart mission",
  "pause.quit": "Save and quit",

  "briefing.mission": "Mission {number} of {total}",
  "briefing.objective": "Objective",
  "briefing.objective.cap.one": "Build a Cap on the vent.",
  "briefing.objective.cap.many": "Build a Cap on each of the {vents} vents.",
  "briefing.objective.survive": "Keep the lander standing for {minutes} minutes, or cap every vent before that.",
  "briefing.new": "New in this mission",
  "briefing.new.threat": "New threat",
  "briefing.new.goal": "New objective",
  "briefing.tip": "Tip",
  "briefing.deploy": "Deploy",
  "briefing.resume": "Back to the mission",
  "briefing.spitter.name": "Spitter",
  "briefing.spitter.text":
    "Cannot be destroyed. About every half minute it lobs a glob of silt at your grid; a marker shows where it will land.",
  "briefing.survive.name": "Hold out",
  "briefing.survive.text":
    "It is won when the countdown at the top runs out and the lander still stands. Capping every vent ends it early, as a win.",

  // One practical tip per briefing card: every buildable structure, the spitter and holding out.
  "tip.pylon": "Keep the chain on dry ground: a Pylon lost to silt cuts off everything that was fed through it.",
  "tip.tap": "Each Tap adds 0.6 energy per second to the lander's 1, but only while the grid reaches it.",
  "tip.lance":
    "It reaches seven tiles and hits ground at its own height or lower, so put it on the rim above the silt, not down in the basin.",
  "tip.cap":
    "It takes 60 packets and clamps the vent only while the grid reaches it: secure the line to the vent first, then place the Cap.",
  "tip.cell":
    "The bank holds only 30 at first and income beyond that is lost: a few Cells let you save up for a big push.",
  "tip.lobber":
    "It only fires at pools, not at thin films, and never closer than three tiles: set it behind the front and leave the shallows to Lances.",
  "tip.pump":
    "It runs without energy but earns little, and silt on its own tile wears it down: keep a Lance close by.",
  "tip.trunk":
    "The fast fourteen-tile link needs a Trunk at both ends; to anything else a Trunk links like a Pylon, within six tiles.",
  "tip.interceptor":
    "It reaches nine tiles and spends one energy per shot, three shots per glob: place it where your structures stand closest together.",
  "tip.baffle":
    "The field covers four tiles around it and drops the moment the Baffle runs out of energy, so protect the line that feeds it.",
  "tip.grader":
    "Each step of height takes a second and a half, and nothing can be graded under a structure: mark your dykes before the silt arrives.",
  "tip.spitter":
    "Globs aim at the structure with the most others within five tiles, so you know where the next one lands: keep an Interceptor there.",
  "tip.survive":
    "Spend on defence around the lander rather than on reach: the vents grow stronger every minute, so the last minutes are the hardest.",

  "end.won": "Vents sealed",
  "end.won.survive.title": "Held out",
  "end.lost": "Lander lost",
  "end.won.survive": "You held the line.",
  "end.won.cap": "The silt is ebbing away.",
  "end.lost.text": "The silt reached the lander.",
  "end.time": "Time",
  /** A badge beside the time; the first letter is capitalised by the style sheet. */
  "end.newBest": "new best",
  "end.spent": "Energy spent",
  "end.built": "Structures built",
  "end.destroyed": "Structures lost",
  "end.removed": "Silt removed",
  "end.next": "Next: {name}",
  "end.again": "Play again",
  "end.retry": "Try again",
  "end.menu": "Main menu",

  "notice.unreadable": "That save could not be read.",
  "notice.saved": "Game saved.",
  "notice.noStorage": "Saving is not available in this browser.",

  // One per `PlaceError` code of the engine; `placeErrorText` relies on the key pattern.
  "place.locked": "That is not available in this mission.",
  "place.outside": "That is outside the map.",
  "place.rock": "Nothing can be built on rock.",
  "place.occupied": "Something already stands there.",
  "place.spitter": "A spitter sits there.",
  "place.needs vent": "A Cap only fits on an open vent.",
  "place.flooded": "Too much silt there. Burn it away first.",
  "place.vent": "Only a Cap can stand on a vent.",
  "place.needs lode": "A Tap only fits on a lode.",
} as const;

export type Key = keyof typeof en;

export interface LevelText {
  readonly name: string;
  readonly brief: string;
  /** One per hint of the level, in the same order. */
  readonly hints: readonly string[];
}

/** A language's translation of the text that the engine data carries in English. */
export interface Content {
  readonly kinds: Readonly<Record<Kind, { readonly name: string; readonly blurb: string }>>;
  /** By campaign level id. */
  readonly levels: Readonly<Record<string, LevelText>>;
  /** For any skirmish level; the name takes `{seed}`. */
  readonly skirmish: { readonly name: string; readonly brief: string };
}
