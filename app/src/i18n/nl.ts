// Dutch interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         het slib               Vent        de bron (de bronnen)
//   Lode         de ader                Spitter     de spuwer
//   Glob         de klodder             Grid        het net
//   Packet       het pakket             Tile        het vak
//   Baffle field het keerveld
//   Structure    het gebouw             Energy      de energie
//   Lander       de lander              Pylon       de pyloon (de pylonen)
//   Trunk        de hoofdlijn           Tap         de tap
//   Cell         de accu                Pump        de pomp
//   Lance        de lans                Lobber      de werper
//   Baffle       de kering              Interceptor de onderschepper
//   Grader       de egaliseerder        Cap         de dop
//   to cap       afdoppen               to seal     afsluiten
//   to dismantle afbreken               Mark ground grond markeren
//   Campaign     de campagne            Skirmish    het gevecht
//   Mission      de missie              Seed        de seed
//   Briefing     de briefing            Best (time) het record
//
// Style: informal "je", short imperatives ("Bouw", "Zet", "Kies"). The game's title "Ebbline 2" is
// never translated. Keys follow the US layout common in the Netherlands: Spatie, Del, Esc, and -
// for the key right of 0.

import type { Content, Key } from "./en.ts";

export const nl: Record<Key, string> = {
  "meta.description":
    "Ebbline 2: een verdedigingsspel tegen de vloed. Slib welt op uit de bronnen; bouw een net, drijf het terug en dop ze allemaal af.",

  "title.lede": "Uit de bronnen welt slib op. Bouw een net, drijf het terug en dop ze allemaal af.",
  "title.continue": "Doorgaan",
  "title.credit": "Een opensourcespel onder de MIT-licentie. Beelden speciaal voor dit project gemaakt.",
  "menu.campaign": "Campagne",
  "menu.skirmish": "Gevecht",
  "menu.help": "Speluitleg",
  "menu.settings": "Instellingen",
  "common.back": "Terug",

  "campaign.locked": "Win de vorige missie om deze te ontgrendelen.",
  "campaign.best": "Record {time}",
  "campaign.next": "Volgende missie",

  "skirmish.seed": "Seed",
  "skirmish.size": "Kaartgrootte",
  "skirmish.size.small": "Klein, twee bronnen",
  "skirmish.size.medium": "Middel, drie bronnen",
  "skirmish.size.large": "Groot, vier bronnen",
  "skirmish.difficulty": "Moeilijkheid",
  "skirmish.difficulty.easy": "Makkelijk, geen spuwers",
  "skirmish.difficulty.normal": "Normaal, één spuwer",
  "skirmish.difficulty.hard": "Moeilijk, twee spuwers",
  "skirmish.note":
    "Dezelfde seed, grootte en moeilijkheid geven altijd dezelfde kaart. Zodra het spel loopt, staat er een link naartoe in de adresbalk.",
  "skirmish.start": "Starten",

  "settings.language": "Taal",
  "settings.language.auto": "Automatisch",
  "settings.volume": "Volume",
  "settings.music": "Achtergrondgeluid",
  "settings.edgeScroll": "Kaart verschuiven als de aanwijzer de schermrand raakt",
  "settings.reducedMotion": "Flitsen en pulseren beperken",

  "help.intro":
    "Slib welt op uit _bronnen_ en stroomt bergaf. Het tast alles aan waar het op staat. Verlies je de lander, dan is de missie verloren. Je wint door op elke bron een *Dop* te bouwen.",
  "help.grid.title": "Het net",
  "help.grid.text":
    "Energie verlaat de lander in pakketten en reist over de verbindingen van het net. Elk gebouw stuurt pakketten door en moet binnen zes vakken van een voltooid gebouw staan; pylonen zijn de goedkope manier om verder te reiken. Tijdens het bouwen, of als een pyloon geselecteerd is, is het gebied gekleurd dat het voltooide net bereikt. Een rode stip markeert een gebouw dat het net niet bereikt. Pylonen vangen energie op van vakken binnen drie stappen die op hun eigen niveau liggen en direct zichtbaar zijn (getoond als een groen gebied); hoger terrein of rots ertussen blokkeert dat, en met slib bedekte vakken leveren niets op.",
  "help.cap.title": "Een bron afdoppen",
  "help.cap.text":
    "Een dop kan pas beginnen als het vak van de bron bijna droog is; dat toont een witte ring. Tijdens de bouw houdt hij de bron dicht, maar de druk loopt op: gaat de dop verloren, dan barst alles in één keer los.",
  "help.structures.title": "Gebouwen",
  "help.controls.title": "Besturing",
  "help.keys.click": "Klik, tik",
  "help.keys.click.does": "Plaatsen met gereedschap, anders selecteren",
  "help.keys.drag": "Slepen",
  "help.keys.drag.does": "Met gereedschap een rij plaatsen of markeringen schilderen, anders de kaart verschuiven",
  "help.keys.cancel": "Rechtsklik, Esc",
  "help.keys.cancel.does": "Gereedschap wegleggen, selectie opheffen, menu openen",
  "help.keys.zoom": "Scrollwiel, knijpen",
  "help.keys.zoom.does": "Zoomen",
  "help.keys.pan": "W A S D, pijltjes",
  "help.keys.pan.does": "Kaart verschuiven",
  "help.keys.slots": "1 t/m 0, -",
  "help.keys.slots.does": "Gebouw uit de bouwbalk kiezen",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Grond markeren voor egaliseerders",
  "help.keys.pause": "Spatie",
  "help.keys.pause.does": "Pauze",
  "help.keys.speed": "[ ]",
  "help.keys.speed.does": "Langzamer, sneller",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Geselecteerd gebouw uit- of aanzetten",
  "help.keys.dismantle": "Del",
  "help.keys.dismantle.does": "Geselecteerd gebouw afbreken; je krijgt de helft van de kosten terug",

  "hud.energy.title": "Energie in voorraad, en wat er de laatste seconde binnenkwam en uitging",
  "hud.hold": "Nog {time} volhouden",
  "hud.capped": "Bronnen afgedopt {capped} / {vents}",
  "hud.pause": "Pauze",
  "hud.paused": "Gepauzeerd",
  "hud.pause.title": "Pauze (Spatie)",
  "hud.menu": "Menu",
  "hud.menu.title": "Menu (Esc)",
  "hud.map": "Kaartoverzicht",

  "build.label": "Bouwen",
  "build.mark": "Markeren",
  "build.mark.cost": "grond",
  "build.mark.title": "Grond markeren die egaliseerders moeten ophogen of afgraven",
  "key.slot11": "-",
  "key.delete": "Del",

  "status.offGrid": "Niet op het net: heeft een gebouw binnen zes vakken nodig",
  "status.building": "In aanbouw",
  "status.off": "Uitgeschakeld",
  "status.damaged": "Beschadigd, wordt hersteld",
  "status.working": "In bedrijf",

  "info.cost": "{cost} energie",
  "info.range": "Bereik {range}",
  "info.rangeMin": "Bereik {range}, niet dichterbij dan {min}",
  "info.place": "Klik om te plaatsen, sleep voor een rij. Rechtsklik of Esc legt het weg.",
  "info.health": "Staat",
  "info.energy": "Energie",
  "info.switchOff": "Uitzetten",
  "info.switchOn": "Aanzetten",
  "info.dismantle": "Afbreken",
  "info.notes": "Tips",
  "info.hide": "Verbergen",

  "grade.title": "Grond markeren",
  "grade.text": "Kies een doelhoogte en schilder dan vakken. Een egaliseerder binnen acht vakken doet het werk.",
  "grade.erase": "Wissen",

  "pause.title": "Gepauzeerd",
  "pause.resume": "Hervatten",
  "pause.save": "Opslaan",
  "pause.briefing": "Briefing",
  "pause.restart": "Missie herstarten",
  "pause.quit": "Opslaan en stoppen",

  "briefing.mission": "Missie {number} van {total}",
  "briefing.objective": "Doel",
  "briefing.objective.cap.one": "Bouw een dop op de bron.",
  "briefing.objective.cap.many": "Bouw een dop op elk van de {vents} bronnen.",
  "briefing.objective.survive": "Houd de lander {minutes} minuten overeind, of dop elke bron eerder af.",
  "briefing.new": "Nieuw in deze missie",
  "briefing.new.threat": "Nieuwe dreiging",
  "briefing.new.goal": "Nieuw doel",
  "briefing.tip": "Tip",
  "briefing.deploy": "Inzetten",
  "briefing.resume": "Terug naar de missie",
  "briefing.spitter.name": "Spuwer",
  "briefing.spitter.text":
    "Is niet te vernietigen. Ongeveer elke halve minuut slingert hij een klodder slib naar je net; een markering toont waar die neerkomt.",
  "briefing.survive.name": "Volhouden",
  "briefing.survive.text":
    "Je wint als het aftellen bovenaan voorbij is en de lander nog staat. Als je elke bron afdopt, eindigt de missie eerder, als overwinning.",

  "tip.pylon":
    "Houd de keten op droge grond: een pyloon die in het slib verloren gaat, snijdt alles af wat via hem werd gevoed.",
  "tip.tap":
    "Elke tap levert 0,6 energie per seconde bovenop de 1 van de lander, maar alleen zolang het net hem bereikt.",
  "tip.lance":
    "Hij reikt zeven vakken en raakt alleen grond op zijn eigen hoogte of lager: zet hem op de rand boven het slib, niet onderin het bekken.",
  "tip.cap":
    "Hij kost 60 pakketten en houdt de bron alleen dicht zolang het net hem bereikt: beveilig eerst de lijn naar de bron, zet dan de dop.",
  "tip.cell":
    "De voorraad houdt eerst maar 30 vast en wat daarboven binnenkomt, gaat verloren: met een paar accu's spaar je voor een grote opmars.",
  "tip.lobber":
    "Hij vuurt alleen op poelen, niet op dunne laagjes, en nooit dichterbij dan drie vakken: zet hem achter het front en laat het ondiepe aan de lansen.",
  "tip.pump":
    "Hij draait zonder energie maar levert weinig op, en slib op zijn eigen vak tast hem aan: houd een lans in de buurt.",
  "tip.trunk":
    "De snelle verbinding over veertien vakken heeft aan beide kanten een hoofdlijn nodig; met al het andere verbindt een hoofdlijn zich als een pyloon, binnen zes vakken.",
  "tip.interceptor":
    "Hij reikt negen vakken en gebruikt één energie per schot, drie schoten per klodder: zet hem waar je gebouwen het dichtst opeen staan.",
  "tip.baffle":
    "Het keerveld reikt vier vakken rondom en valt weg zodra de kering zonder energie zit: bescherm dus de lijn die hem voedt.",
  "tip.grader":
    "Elke hoogtestap duurt anderhalve seconde, en onder gebouwen valt niets te egaliseren: markeer je dijken voordat het slib er is.",
  "tip.spitter":
    "Klodders mikken op het gebouw met de meeste andere binnen vijf vakken, dus je weet waar de volgende neerkomt: zet daar een onderschepper.",
  "tip.survive":
    "Steek je energie in verdediging rond de lander in plaats van in uitbreiding: de bronnen worden elke minuut sterker, dus de laatste minuten zijn het zwaarst.",

  "end.won": "Bronnen afgesloten",
  "end.won.survive.title": "Volgehouden",
  "end.lost": "Lander verloren",
  "end.won.survive": "Je hebt stand gehouden.",
  "end.won.cap": "Het slib trekt zich terug.",
  "end.lost.text": "Het slib heeft de lander bereikt.",
  "end.time": "Tijd",
  "end.newBest": "nieuw record",
  "end.spent": "Energie verbruikt",
  "end.built": "Gebouwen gebouwd",
  "end.destroyed": "Gebouwen verloren",
  "end.removed": "Slib verwijderd",
  "end.next": "Volgende: {name}",
  "end.again": "Opnieuw spelen",
  "end.retry": "Opnieuw proberen",
  "end.menu": "Hoofdmenu",

  "notice.unreadable": "Dit opgeslagen spel kon niet worden gelezen.",
  "notice.saved": "Spel opgeslagen.",
  "notice.noStorage": "Opslaan is in deze browser niet mogelijk.",

  "place.locked": "Dat is in deze missie niet beschikbaar.",
  "place.outside": "Dat ligt buiten de kaart.",
  "place.rock": "Op rots kun je niets bouwen.",
  "place.occupied": "Daar staat al iets.",
  "place.spitter": "Daar zit een spuwer.",
  "place.needs vent": "Een dop past alleen op een open bron.",
  "place.flooded": "Daar ligt te veel slib. Brand het eerst weg.",
  "place.vent": "Op een bron kan alleen een dop staan.",
  "place.needs lode": "Een tap past alleen op een ader.",
};

export const nlContent: Content = {
  kinds: {
    lander: {
      name: "Lander",
      blurb: "Oorsprong van het net. Gaat hij verloren, dan is de missie voorbij.",
    },
    pylon: { name: "Pyloon", blurb: "Breidt het net zes vakken uit en vangt wat energie op van de vlakke grond die hij op zijn eigen hoogte kan zien." },
    trunk: {
      name: "Hoofdlijn",
      blurb: "Verbindt zich over veertien vakken met andere hoofdlijnen en verdubbelt de snelheid van pakketten.",
    },
    tap: { name: "Tap", blurb: "Tapt gestaag energie uit een ader. Past alleen op een ader." },
    cell: { name: "Accu", blurb: "Slaat dertig energie extra op." },
    pump: {
      name: "Pomp",
      blurb: "Schept ondiep slib in de buurt af en maakt er een beetje energie van.",
    },
    lance: { name: "Lans", blurb: "Brandt slib vak voor vak weg. Kan niet bergop mikken." },
    lobber: {
      name: "Werper",
      blurb: "Slingert een trage lading naar het diepste slib binnen bereik.",
    },
    baffle: {
      name: "Kering",
      blurb: "Wekt een keerveld op dat slib moet beklimmen als een muur van twee treden.",
    },
    interceptor: { name: "Onderschepper", blurb: "Schiet klodders in de lucht neer." },
    grader: { name: "Egaliseerder", blurb: "Hoogt gemarkeerde grond op of graaft hem af, trede voor trede." },
    cap: {
      name: "Dop",
      blurb: "Houdt een droge bron dicht zolang hij gebouwd wordt, en sluit hem daarna voorgoed af.",
    },
  },
  levels: {
    c1: {
      name: "Landing",
      brief: "Eén bron, vijftien vakken oostwaarts en ver onder je, en zijn poel breidt zich al uit. Leid het net naar beneden, brand de bron droog en doe er een dop op.",
      hints: [
        "Pylonen zijn de goedkope manier om het net te verlengen. Alles moet binnen zes vakken van een voltooid gebouw staan.",
        "Lansen branden slib weg. Zet ze op hoge grond: ze kunnen niet bergop richten.",
        "Als de bron tussen twee stoten droogvalt, zet er een dop op en houd die gevoed.",
        "De lander maakt één energie per seconde en hier zijn geen aders. Een pyloon vangt iets meer op van de vlakke grond die hij op zijn eigen hoogte kan zien. Bouw niet meer dan nodig.",
      ],
    },
    c2: {
      name: "Twee fronten",
      brief: "Twee bronnen, aan weerszijden van je heuvel. Tap de aders voor energie en spaar die voor de doppen.",
      hints: [
        "Zet taps op de gloeiende aders bij de lander om energie te verdienen.",
        "De voorraad houdt dertig energie vast, een halve dop. Elke accu voegt er dertig toe.",
      ],
    },
    c3: {
      name: "Zinkput",
      brief: "Drie bronnen stoten traag en zwaar, en het bekken eronder loopt diep vol. Werpers bereiken de diepe plassen.",
      hints: [
        "Werpers trekken zich niets aan van hoogte, maar raken niets dat dichterbij ligt dan drie vakken.",
      ],
    },
    c4: {
      name: "Verre uithoeken",
      brief: "Drie bronnen in drie richtingen, de dichtstbijzijnde negenentwintig vakken weg. Hoofdlijnen brengen pakketten snel over grote afstanden.",
      hints: [
        "Hoofdlijnen verbinden zich onderling over veertien vakken en verdubbelen de pakketsnelheid.",
      ],
    },
    c5: {
      name: "Hoogvlakte",
      brief: "Vier bronnen omringen je plateau, en er zijn maar drie aders. Pompen scheppen ondiep slib af voor energie.",
      hints: [
        "Een pomp reikt maar twee vakken ver, dus hij moet aan de oever staan, waar het slib hem ook kan bereiken.",
      ],
    },
    c6: {
      name: "Uiterwaard",
      brief: "Je bent laag geland, op de oever van een riviervallei, met vier bronnen om je heen, waarvan één dichtbij. Houd tien minuten stand.",
      hints: [
        "Een gevoede kering laat slib op elk vak binnen vier vakken ervan twee treden extra klimmen.",
        "Kies Markeren, een hoogte en schilder vakken; een egaliseerder binnen acht vakken verhoogt of verlaagt ze.",
      ],
    },
    c7: {
      name: "Spervuur",
      brief: "Drie spuwers slingeren slib vanuit het zuiden naar je net. Onderscheppers schieten de klodders in de lucht neer.",
      hints: [
        "Klodders mikken op je dichtste cluster. Een onderschepper reikt negen vakken en heeft drie treffers per klodder nodig.",
      ],
    },
    c8: {
      name: "Waterscheiding",
      brief: "Vijf bronnen en drie spuwers rondom de top. Gebruik alles wat je hebt.",
      hints: [],
    },
  },
  skirmish: { name: "Gevecht {seed}", brief: "Dop elke bron af." },
};
