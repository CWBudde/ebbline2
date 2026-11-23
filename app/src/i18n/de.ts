// German interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         der Schlick            Vent        der Schlot (die Schlote)
//   Lode         die Ader               Spitter     der Speier
//   Glob         der Klumpen            Grid        das Netz
//   Packet       das Paket              Tile        das Feld
//   Baffle field das Sperrfeld
//   Structure    das Gebäude            Energy      die Energie
//   Lander       der Lander             Pylon       der Pylon (die Pylonen)
//   Trunk        die Trasse             Tap         der Zapfer
//   Cell         der Speicher           Pump        die Pumpe
//   Lance        die Lanze              Lobber      der Werfer
//   Baffle       die Sperre             Interceptor der Abfänger
//   Grader       der Planierer          Cap         die Kappe
//   to cap       verschließen           to seal     versiegeln
//   to dismantle abreißen               Mark ground Boden markieren
//   Campaign     die Kampagne           Skirmish    das Gefecht
//   Mission      die Mission            Seed        der Seed
//   Briefing     der Auftrag            Best (time) die Bestzeit
//
// Style: informal "du", short imperatives ("Bau", "Setz", "Wähl"), no "Sie". The game's title
// "Ebbline 2" is never translated. Keys follow a German keyboard: Leertaste, Entf, Esc, and ß for the
// key right of 0.

import type { Content, Key } from "./en.ts";

export const de: Record<Key, string> = {
  "meta.description":
    "Ebbline 2: ein Verteidigungsspiel gegen die Flut. Schlick steigt aus den Schloten; bau ein Netz, dräng ihn zurück und verschließ sie alle.",

  "title.lede": "Aus den Schloten steigt Schlick. Bau ein Netz, dräng ihn zurück und verschließ sie alle.",
  "title.continue": "Fortsetzen",
  "title.credit": "Ein Open-Source-Spiel unter der MIT-Lizenz. Grafik eigens für dieses Projekt erstellt.",
  "menu.campaign": "Kampagne",
  "menu.skirmish": "Gefecht",
  "menu.help": "Spielanleitung",
  "menu.settings": "Einstellungen",
  "common.back": "Zurück",

  "campaign.locked": "Gewinn die Mission davor, um diese freizuschalten.",
  "campaign.best": "Bestzeit {time}",
  "campaign.next": "Nächste Mission",

  "skirmish.seed": "Seed",
  "skirmish.size": "Kartengröße",
  "skirmish.size.small": "Klein, zwei Schlote",
  "skirmish.size.medium": "Mittel, drei Schlote",
  "skirmish.size.large": "Groß, vier Schlote",
  "skirmish.difficulty": "Schwierigkeit",
  "skirmish.difficulty.easy": "Leicht, keine Speier",
  "skirmish.difficulty.normal": "Normal, ein Speier",
  "skirmish.difficulty.hard": "Schwer, zwei Speier",
  "skirmish.note":
    "Gleicher Seed, gleiche Größe und gleiche Schwierigkeit ergeben immer dieselbe Karte. Sobald das Spiel läuft, steht in der Adresszeile ein Link dorthin.",
  "skirmish.start": "Starten",

  "settings.language": "Sprache",
  "settings.language.auto": "Automatisch",
  "settings.volume": "Lautstärke",
  "settings.music": "Hintergrundklang",
  "settings.edgeScroll": "Karte verschieben, wenn der Zeiger den Bildschirmrand berührt",
  "settings.reducedMotion": "Aufblitzen und Pulsieren verringern",

  "help.intro":
    "Schlick quillt aus _Schloten_ und fließt bergab. Er zersetzt alles, worauf er steht. Geht der Lander verloren, ist die Mission verloren. Du gewinnst, indem du auf jeden Schlot eine *Kappe* baust.",
  "help.grid.title": "Das Netz",
  "help.grid.text":
    "Energie verlässt den Lander in Paketen und wandert über die Leitungen des Netzes. Nur der Lander, Pylonen, Trassen und Beschleuniger leiten Pakete weiter, und jedes Gebäude muss höchstens sechs Felder von einem fertigen unter ihnen entfernt stehen; Pylonen sind der günstige Weg, weiter zu reichen. Ein roter Punkt markiert ein Gebäude, das das Netz nicht erreicht. Pylonen sammeln Energie von Feldern in bis zu drei Schritten Entfernung, die auf ihrer eigenen Höhe liegen und direkt sichtbar sind (als grüne Fläche dargestellt); höheres Gelände oder Fels dazwischen blockiert das, und mit Schlick bedeckte Felder liefern nichts.",
  "help.cap.title": "Einen Schlot verschließen",
  "help.cap.text":
    "Eine Kappe lässt sich erst beginnen, wenn das Feld des Schlots fast trocken ist; das zeigt ein weißer Ring. Im Bau hält sie den Schlot zu, doch der Druck steigt: Geht die Kappe verloren, bricht alles auf einmal hervor.",
  "help.structures.title": "Gebäude",
  "help.controls.title": "Steuerung",
  "help.keys.click": "Klick, Tippen",
  "help.keys.click.does": "Mit Werkzeug setzen, sonst auswählen",
  "help.keys.drag": "Ziehen",
  "help.keys.drag.does": "Mit Werkzeug eine Reihe setzen oder Markierungen malen, sonst die Karte verschieben",
  "help.keys.cancel": "Rechtsklick, Esc",
  "help.keys.cancel.does": "Werkzeug weglegen, Auswahl aufheben, Menü öffnen",
  "help.keys.zoom": "Mausrad, Finger spreizen",
  "help.keys.zoom.does": "Zoomen",
  "help.keys.pan": "W A S D, Pfeiltasten",
  "help.keys.pan.does": "Karte verschieben",
  "help.keys.slots": "1 bis 0, ß, ´",
  "help.keys.slots.does": "Gebäude aus der Bauleiste wählen",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Boden für Planierer markieren",
  "help.keys.pause": "Leertaste",
  "help.keys.pause.does": "Pause",
  // On a German keyboard the bracket keys are Ü and +; comma and full stop do the same.
  "help.keys.speed": ", .",
  "help.keys.speed.does": "Langsamer, schneller",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Ausgewähltes Gebäude aus- oder einschalten",
  "help.keys.dismantle": "Entf",
  "help.keys.dismantle.does": "Ausgewähltes Gebäude abreißen; die Hälfte der Kosten gibt es zurück",
  "help.keys.stats": "T",
  "help.keys.stats.does": "Statistik anzeigen",

  "hud.energy.title": "Energie im Vorrat sowie Zufluss und Verbrauch der letzten Sekunde",
  "hud.energy.stats": "Klick zeigt, woher die Energie kommt und wohin sie geht.",
  "hud.hold": "Noch {time} halten",
  "hud.capped": "Schlote verschlossen {capped} / {vents}",
  "hud.pause": "Pause",
  "hud.paused": "Pausiert",
  "hud.pause.title": "Pause (Leertaste)",
  "hud.menu": "Menü",
  "hud.menu.title": "Menü (Esc)",
  "hud.map": "Kartenübersicht",

  "build.label": "Bauen",
  "build.mark": "Markieren",
  "build.mark.cost": "Boden",
  "build.mark.title": "Boden markieren, den Planierer heben oder senken sollen",
  "key.slot11": "ß",
  "key.slot12": "´",
  "key.slot13": "#",
  "key.slot14": "Ä",
  "key.delete": "Entf",

  "status.offGrid": "Nicht am Netz: braucht einen fertigen Pylon in höchstens sechs Feldern Entfernung",
  "status.building": "Im Bau",
  "status.off": "Abgeschaltet",
  "status.damaged": "Beschädigt, wird repariert",
  "status.working": "In Betrieb",
  "status.loading": "Das Flugzeug wird geladen",
  "status.inFlight": "Flugzeug fliegt hinaus",
  "status.bombing": "Flugzeug bombardiert",
  "status.returning": "Flugzeug kehrt zurück",
  "status.waitingEnergy": "Wartet auf Energie",

  "info.cost": "{cost} Energie",
  "info.range": "Reichweite {range}",
  "info.rangeMin": "Reichweite {range}, nicht näher als {min}",
  "info.place": "Klick setzt, Ziehen baut eine Reihe. Rechtsklick oder Esc legt das Werkzeug weg.",
  "info.health": "Zustand",
  "info.energy": "Energie",
  "info.switchOff": "Abschalten",
  "info.switchOn": "Einschalten",
  "info.dismantle": "Abreißen",
  "info.notes": "Hinweise",
  "info.hide": "Ausblenden",
  "info.details": "Details",

  "grade.title": "Boden markieren",
  "grade.text":
    "Wähl eine Zielhöhe und markier dann die Felder. Ein Planierer in höchstens acht Feldern Entfernung erledigt die Arbeit.",
  "grade.moving":
    "Ein Teil des Bodens hebt und senkt sich hier und lässt sich nicht markieren: Darüber wird der Rahmen rot.",
  "grade.erase": "Löschen",

  "pause.title": "Pausiert",
  "pause.resume": "Weiter",
  "pause.save": "Speichern",
  "pause.briefing": "Auftrag",
  "pause.restart": "Mission neu starten",
  "pause.quit": "Speichern und beenden",

  "briefing.mission": "Mission {number} von {total}",
  "briefing.objective": "Ziel",
  "briefing.objective.cap.one": "Bau eine Kappe auf den Schlot.",
  "briefing.objective.cap.many": "Bau auf jeden der {vents} Schlote eine Kappe.",
  "briefing.objective.survive": "Sorg dafür, dass der Lander {minutes} Minuten übersteht, oder verschließe vorher jeden Schlot mit einer Kappe.",
  "briefing.new": "Neu in dieser Mission",
  "briefing.new.threat": "Neue Bedrohung",
  "briefing.new.goal": "Neues Ziel",
  "briefing.tip": "Tipp",
  "briefing.deploy": "Einsatz starten",
  "briefing.resume": "Zurück zur Mission",
  "briefing.spitter.name": "Speier",
  "briefing.spitter.text":
    "Lässt sich nicht zerstören. Etwa jede halbe Minute schleudert er einen Klumpen Schlick auf dein Netz; eine Markierung zeigt, wo er einschlägt.",
  "briefing.survive.name": "Durchhalten",
  "briefing.survive.text":
    "Sie ist gewonnen, wenn der Countdown oben abgelaufen ist und der Lander noch steht. Eine Kappe auf jedem Schlot beendet sie früher, als Sieg.",

  "tip.pylon":
    "Führ die Kette über trockenen Boden: Geht ein Pylon im Schlick verloren, ist alles abgeschnitten, was über ihn versorgt wurde.",
  "tip.tap":
    "Jeder Zapfer bringt 0,6 Energie pro Sekunde, zusätzlich zu der einen des Landers, aber nur, solange das Netz ihn erreicht.",
  "tip.lance":
    "Sie reicht sieben Felder weit und trifft nur Boden auf ihrer Höhe oder darunter. Stell sie also an den Rand über dem Schlick, nicht unten ins Becken.",
  "tip.cap":
    "Sie braucht 60 Pakete und hält den Schlot nur zu, solange das Netz sie erreicht: Sichere erst die Leitung zum Schlot, dann setz die Kappe.",
  "tip.cell":
    "Anfangs fasst der Vorrat nur 30, und was darüber hinaus hereinkommt, verfällt: Mit ein paar Speichern sparst du für einen großen Vorstoß.",
  "tip.lobber":
    "Er feuert nur auf Becken, nicht auf dünne Schichten, und nie näher als drei Felder: Stell ihn hinter die Front und überlass das Flache den Lanzen.",
  "tip.pump":
    "Sie läuft ohne Energie, bringt aber wenig ein, und Schlick auf ihrem eigenen Feld zersetzt sie: Stell eine Lanze in die Nähe.",
  "tip.trunk":
    "Die schnelle Verbindung über vierzehn Felder braucht an beiden Enden eine Trasse; mit allem anderen verbindet sie sich wie ein Pylon, über höchstens sechs Felder.",
  "tip.booster":
    "Er beschleunigt nur die Pakete, die er weitergibt, nicht die, die ihn bauen oder reparieren. Setz ihn früh an eine lange Leitung: Je eher ein Paket beschleunigt wird, desto länger läuft es schneller.",
  "tip.interceptor":
    "Er reicht neun Felder weit und braucht pro Schuss eine Einheit Energie, drei Schüsse pro Klumpen: Stell ihn dorthin, wo deine Gebäude am dichtesten stehen.",
  "tip.baffle":
    "Das Sperrfeld reicht vier Felder weit und fällt in dem Moment zusammen, in dem der Sperre die Energie ausgeht. Schütz also die Leitung, die sie versorgt.",
  "tip.grader":
    "Jede Höhenstufe dauert anderthalb Sekunden, und unter Gebäuden lässt sich nichts planieren: Markier deine Deiche, bevor der Schlick da ist.",
  "tip.spitter":
    "Klumpen zielen auf das Gebäude, um das in höchstens fünf Feldern Entfernung die meisten anderen stehen. Du weißt also, wo der nächste einschlägt: Stell dort einen Abfänger hin.",
  "tip.survive":
    "Steck die Energie in die Verteidigung rund um den Lander statt in die Ausdehnung: Die Schlote werden jede Minute stärker, die letzten Minuten sind die härtesten.",
  "tip.airfield":
    "Das Flugzeug fliegt immer den schlimmsten Schlick der ganzen Karte an, egal wo dein Netz steht. Schalte das Flugfeld aus, um es zu Hause zu halten.",
  "tip.spring":
    "Eine Quelle hilft nur dort, wo ihr Balsam bergab in den Schlick fließen kann. Bau sie oberhalb des Ufers, nicht mittendrin.",

  "end.won": "Schlote versiegelt",
  "end.won.survive.title": "Durchgehalten",
  "end.lost": "Lander verloren",
  "end.won.survive": "Du hast die Stellung gehalten.",
  "end.won.cap": "Der Schlick zieht sich zurück.",
  "end.lost.text": "Der Schlick hat den Lander erreicht.",
  "end.time": "Zeit",
  "end.newBest": "neue Bestzeit",
  "end.spent": "Energie verbraucht",
  "end.built": "Gebäude gebaut",
  "end.destroyed": "Gebäude verloren",
  "end.removed": "Schlick beseitigt",
  "end.next": "Weiter: {name}",
  "end.again": "Noch einmal",
  "end.retry": "Neuer Versuch",
  "end.menu": "Hauptmenü",

  "stats.title": "Statistik",
  "stats.empty": "Die Diagramme füllen sich im Lauf der Mission.",
  "stats.silt": "Schlick",
  "stats.silt.volume": "Schlick auf der Karte",
  "stats.silt.flooded": "Überflutete Felder",
  "stats.silt.removed": "Schlick entfernt pro Sekunde",
  "stats.energy": "Energie",
  "stats.energy.flow": "Fluss pro Sekunde",
  "stats.energy.in": "Einnahmen",
  "stats.energy.out": "Ausgaben",
  "stats.energy.bank": "Im Vorrat",
  "stats.energy.stored": "Gespeichert",
  "stats.energy.capacity": "Kapazität",
  "stats.vents": "Offene Schlote",
  "stats.structures": "Gebäude",
  "stats.structures.standing": "Bestehend",
  "stats.structures.lost": "Bisher verloren",
  "stats.peak": "Schlick-Spitze",
  "stats.peak.at": "bei {time}",
  "stats.capped": "Schlote verschlossen",
  "stats.net": "Netto-Energie pro Sekunde, im Schnitt",
  "stats.energy.sources": "Einnahmen nach Quelle",
  "stats.energy.purposes": "Ausgaben nach Zweck",
  "stats.spend.build": "Bau",
  "stats.spend.repair": "Reparatur",
  "stats.spend.supply": "Betrieb",
  "stats.now": "Jetzt",
  "stats.rate": "{rate}/s",

  "notice.unreadable": "Dieser Spielstand ließ sich nicht lesen.",
  "notice.saved": "Spiel gespeichert.",
  "notice.noStorage": "Speichern ist in diesem Browser nicht möglich.",

  "place.locked": "Das gibt es in dieser Mission nicht.",
  "place.outside": "Das liegt außerhalb der Karte.",
  "place.rock": "Auf Fels lässt sich nichts bauen.",
  "place.occupied": "Da steht schon etwas.",
  "place.spitter": "Da sitzt ein Speier.",
  "place.needs vent": "Eine Kappe passt nur auf einen offenen Schlot.",
  "place.flooded": "Dort steht zu viel Schlick. Brenn ihn erst weg.",
  "place.vent": "Auf einem Schlot kann nur eine Kappe stehen.",
  "place.needs lode": "Ein Zapfer passt nur auf eine Ader.",
};

export const deContent: Content = {
  kinds: {
    lander: {
      name: "Lander",
      blurb: "Ausgangspunkt des Netzes. Geht er verloren, ist die Mission vorbei.",
    },
    pylon: { name: "Pylon", blurb: "Erweitert das Netz um sechs Felder und sammelt etwas Energie vom ebenen Boden, den er auf seiner eigenen Höhe sehen kann." },
    trunk: {
      name: "Trasse",
      blurb: "Verbindet sich über vierzehn Felder mit anderen Trassen und verdoppelt das Tempo der Pakete.",
    },
    booster: {
      name: "Beschleuniger",
      blurb: "Leitet Pakete wie ein Pylon weiter, und jedes Paket, das ihn passiert, ist danach ein Fünftel schneller. Beschleuniger wirken zusammen, aber derselbe beschleunigt ein Paket nur einmal. Jeder arbeitende Beschleuniger macht außerdem alle Pakete um zwei Prozent schneller, egal wo er steht.",
    },
    tap: { name: "Zapfer", blurb: "Zieht stetig Energie aus einer Ader. Passt nur auf eine Ader." },
    cell: { name: "Speicher", blurb: "Fasst dreißig Energie zusätzlich. Mit jedem Speicher schickt der Lander ein Paket mehr auf einmal los, und noch mehr, wenn der Vorrat fast voll ist." },
    pump: {
      name: "Pumpe",
      blurb: "Schöpft flachen Schlick in der Nähe ab und gewinnt daraus etwas Energie.",
    },
    lance: { name: "Lanze", blurb: "Brennt Schlick Feld für Feld weg. Kann nicht bergauf zielen." },
    lobber: {
      name: "Werfer",
      blurb: "Schleudert eine langsame Ladung auf den tiefsten Schlick in Reichweite.",
    },
    baffle: {
      name: "Sperre",
      blurb: "Erzeugt ein Sperrfeld, das Schlick wie eine zwei Stufen hohe Mauer überwinden muss.",
    },
    interceptor: { name: "Abfänger", blurb: "Schießt Klumpen im Flug ab." },
    grader: { name: "Planierer", blurb: "Hebt oder senkt markierten Boden, Stufe für Stufe." },
    cap: {
      name: "Kappe",
      blurb: "Hält einen trockenen Schlot zu, solange sie gebaut wird, und versiegelt ihn dann endgültig.",
    },
    airfield: { name: "Flugfeld", blurb: "Lädt ein Flugzeug mit dreißig Energie. Ist es voll, fliegt das Flugzeug zum tiefsten Schlick der Karte, bombardiert ihn und kehrt zum erneuten Laden zurück." },
    spring: { name: "Quelle", blurb: "Verwandelt Energie in Balsam, eine hellblaue Flüssigkeit, die bergab fließt und Schlick auslöscht, wo beide aufeinandertreffen. Bau sie über dem Schlick, nicht darin." },
  },
  levels: {
    c1: {
      name: "Landung",
      brief: "Ein Schlot, fünfzehn Felder östlich und weit unter dir, und sein Becken breitet sich schon aus. Führ das Netz zu ihm hinunter, brenn ihn trocken und verschließ ihn.",
      hints: [
        "Nur Pylonen erweitern das Netz: Alles muss höchstens sechs Felder vom Lander oder einem fertigen Pylon entfernt stehen.",
        "Lanzen brennen Schlick weg. Stell sie auf Anhöhen: Bergauf können sie nicht zielen.",
        "Läuft der Schlot zwischen zwei Schüben trocken, setz eine Kappe darauf und halt sie versorgt.",
        "Der Lander liefert eine Energie pro Sekunde, und hier gibt es keine Adern. Ein Pylon sammelt etwas mehr vom ebenen Boden, den er auf seiner eigenen Höhe sehen kann. Bau nicht mehr als nötig.",
      ],
    },
    c2: {
      name: "Zwei Fronten",
      brief: "Zwei Schlote, auf entgegengesetzten Seiten deines Hügels. Zapf die Adern an und spar die Energie für die Kappen.",
      hints: [
        "Setz Zapfer auf die leuchtenden Adern beim Lander, um Energie zu gewinnen.",
        "Der Vorrat fasst dreißig Energie, eine halbe Kappe. Jeder Speicher bringt dreißig dazu.",
        "Der ferne Schlot schläft die erste halbe Minute, matt und mit ruhendem Ring. Wenn er erwacht, ist er der stärkere der beiden.",
      ],
    },
    c3: {
      name: "Senke",
      brief: "Drei Schlote speien in langsamen, schweren Schüben, und das Becken darunter läuft tief voll. Werfer erreichen die tiefen Tümpel.",
      hints: [
        "Werfer ignorieren Höhenunterschiede, treffen aber nichts, was näher als drei Felder liegt.",
      ],
    },
    c4: {
      name: "Weites Land",
      brief: "Drei Schlote in drei Richtungen, der nächste neunundzwanzig Felder entfernt. Trassen bringen Pakete schnell über große Lücken.",
      hints: [
        "Trassen verbinden sich untereinander über vierzehn Felder und verdoppeln das Tempo der Pakete.",
        "Ein Beschleuniger leitet Pakete wie ein Pylon weiter und macht jedes, das ihn passiert, um ein Fünftel schneller. Pakete nehmen den schnellsten Weg, also ziehen ein paar Beschleuniger entlang einer langen Leitung den Verkehr an und bringen ihn früher ans Ziel.",
      ],
    },
    c5: {
      name: "Hochebene",
      brief: "Vier Schlote umringen deinen Tafelberg, und es gibt nur drei Adern. Pumpen schöpfen flachen Schlick ab und machen daraus Energie.",
      hints: [
        "Eine Pumpe erreicht nur Schlick zwei Felder weit, also muss sie am Ufer stehen, wo der Schlick auch sie erreicht.",
      ],
    },
    c6: {
      name: "Flussaue",
      brief: "Du bist tief unten gelandet, am Ufer eines Flusstals, mit vier Schloten ringsum, einer davon ganz in der Nähe. Halt zehn Minuten durch.",
      hints: [
        "Eine versorgte Sperre zwingt den Schlick, auf jedem Feld bis vier Felder von ihr zwei Stufen mehr zu steigen.",
        "Wähl „Markieren“, such eine Höhe aus und markier die Felder; ein Planierer höchstens acht Felder entfernt hebt oder senkt sie.",
      ],
    },
    c7: {
      name: "Dauerfeuer",
      brief: "Drei Speier schleudern Schlick aus Süden auf dein Netz. Abfänger schießen die Klumpen im Flug ab.",
      hints: [
        "Klumpen zielen auf deine dichteste Gebäudegruppe. Ein Abfänger reicht neun Felder weit und braucht drei Treffer pro Klumpen.",
      ],
    },
    c8: {
      name: "Wasserscheide",
      brief: "Fünf Schlote und drei Speier rings um den Gipfel. Setz alles ein, was du hast.",
      hints: ["Der fernste Schlot schläft fünf Minuten lang, matt und mit ruhendem Ring."],
    },
    c9: {
      name: "Hufeisen",
      brief: "Drei starke Schlote am Kopf eines Tals, das sich um einen Grat biegt und zu dir zurückkommt. Ihr Schlick ist schon unterwegs. Halt ihn vom Lander fern und verschließ die Schlote.",
      hints: [
        "Der Schlick kommt um die Biegung und das Tal herauf zu dir. Schütte mit Planierern einen Damm quer durchs Tal auf oder halt ihn mit Sperren, Pumpen und Lanzen zurück.",
        "Das Netz reicht über den Fels auf dem Grat. Von seinen Höhen reichen Lanzen hinab in beide Arme des Tals.",
      ],
    },
    c10: {
      name: "Archipel",
      brief: "Du bist auf einer Insel in einem Meer aus Schlick gelandet, und vier Schlote auf seinem Grund lassen es weiter steigen. Spring mit dem Netz von Insel zu Insel, brenn das Meer um jeden Schlot zurück und verschließ ihn.",
      hints: [
        "Das Netz reicht sechs Felder weit über das Meer, und die meisten Meerengen sind schmaler. Trassen überbrücken die breiten.",
        "Das Meer ist ein einziges: Was du an einem Schlot wegbrennst, fließt von überall her nach. Lanzen auf den Inselhöhen blicken auf alles hinab.",
        "Das Flugzeug eines Flugfelds erreicht die ganze Karte: Jedes Mal, wenn es geladen ist, bombardiert es die tiefste Stelle des Meeres.",
      ],
    },
    c11: {
      name: "Wandernde Terrassen",
      brief: "Der Boden um den Landeplatz hebt und senkt sich in Stufen und lenkt den Schlick um. Nutze den festen Ring am Lander und verschließ die Schlote.",
      hints: [
        "Das Landeplateau hebt sich als Ganzes. Planierer können auf dem festen Ring direkt daneben arbeiten.",
        "Achte nach jeder Verschiebung darauf, wohin der Schlick fließt, bevor du auf den äußeren Terrassen baust.",
      ],
    },
    c12: {
      name: "Wandernde Untiefen",
      brief: "Der Schlick strömt schon um die Biegung auf deine Landzunge zu. Zieh das Netz über die Inseln und verschließ die Schlote stromaufwärts.",
      hints: [
        "Die Landzunge und die Inselkuppen bieten festen Grund für Relais und Waffen.",
        "Zwei Untiefen heben und senken sich zu verschiedenen Zeiten. Achte darauf, durch welche Rinnen der Schlick fließt.",
      ],
    },
    c13: {
      name: "Atlantis",
      brief: "Du bist auf dem Scheitel einer großen Insel gelandet, und die Insel geht unter. Vier Schlote am Meeresboden lassen das Meer steigen, während das Land sinkt. Verschließ sie, bevor der Schlick sich über deinem Lander schließt.",
      hints: [
        "Die Insel sinkt Stufe um Stufe, ein Achtel nach dem anderen rundherum. Das Ufer geht zuerst unter, der Scheitel zuletzt.",
        "Planierer können gesunkenen Boden wieder heben, und ein erhöhter Rand hält das Meer eine Weile zurück. Er sinkt aber mit dem Rest weiter.",
        "Was du tief baust, steht bald im Schlick. Setz Lanzen und Relais auf hohen Grund und stoß früh zu den Schloten vor.",
      ],
    },
    c14: {
      name: "Deich",
      brief: "Du bist in einem weiten, flachen Becken gelandet. Ein schmaler Deich hält ein randvolles Meer aus Schlick zurück, und die vier Schlote draußen lassen es weiter steigen. Wo der Deich am niedrigsten ist, läuft es schon über. Halte den Wall und verschließ die Schlote dahinter.",
      hints: [
        "Der Deich ist hier der hohe Grund: Lanzen auf seiner Krone blicken auf das Meer draußen und auf das Becken drinnen hinab.",
        "Drei Scharten im Deich liegen auf Höhe des Meeres. Was die Schlote nachliefern, läuft durch sie ins Becken. Planierer können sie erhöhen.",
        "Das Becken füllt sich von den Scharten her zum Lander hin. Brenn weg, was durchkommt, bevor es sich ausbreitet.",
      ],
    },
    c15: {
      name: "Hang",
      brief: "Du bist nahe der Spitze eines langen Hangs gelandet. Unter dir hat ein weites Meer aus Schlick das tiefere Land überflutet und steigt auf den Lander zu. Quellen erzeugen Balsam, der bergab fließt und Schlick auslöscht, wo er ihn trifft. Bau sie am Hang, lass den Balsam ins Meer laufen und verschließ die Schlote ganz unten.",
      hints: [
        "Balsam fließt wie Schlick. Eine Quelle knapp oberhalb des Ufers gießt ihn direkt ins Meer; eine in einer Mulde füllt nur die Mulde.",
        "Die Rinnen tragen den Balsam in Strömen den Hang hinab. Setz Quellen an ihre Köpfe.",
        "Balsam verschwindet, wenn er stillsteht. Lass die Quellen laufen und drück das Ufer den Hang hinunter, bis die Schlote trocken genug zum Verschließen sind.",
      ],
    },
    c16: {
      name: "Caldera",
      brief: "Du bist auf einer Insel in einem Kratersee aus Schlick gelandet, und ein Schlot im See füllt ihn weiter. Jenseits des Kraterrands liegen vier weitere Schlote im Tiefland und erwachen einer nach dem anderen. Überquere den See, nimm den Rand ein und verschließ jeden Schlot.",
      hints: [
        "Der Seeschlot liegt direkt an der Insel. Brenn den See um ihn zurück, bevor er aufs Ufer steigt.",
        "Pylone reichen sechs Felder weit, also spring von Inselchen zu Inselchen über den See. Zwei Trassen, eine an jedem Ufer, überbrücken ihn in einem Zug.",
        "Drei Scharten im Rand liegen eine Stufe über dem See. Steigt draußen der Schlick, läuft er durch sie herein. Planierer können sie erhöhen.",
        "Die Schlote draußen ruhen anfangs und erwachen einer nach dem anderen, der fernste zuletzt und am stärksten.",
      ],
    },
  },
  skirmish: { name: "Gefecht {seed}", brief: "Verschließ jeden Schlot." },
};
