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
    "Energie verlaat de lander in pakketten en reist over de verbindingen van het net. Alleen de lander, pylonen, hoofdlijnen en versnellers sturen pakketten door, dus elk gebouw moet binnen zes vakken staan van een van hen die voltooid is; pylonen zijn de goedkope manier om verder te reiken. Een rode stip markeert een gebouw dat het net niet bereikt. Pylonen vangen energie op van vakken binnen drie stappen die op hun eigen niveau liggen en direct zichtbaar zijn (getoond als een groen gebied); hoger terrein of rots ertussen blokkeert dat, en met slib bedekte vakken leveren niets op.",
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
  "help.keys.slots": "1 t/m 0, -, =",
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
  "help.keys.stats": "T",
  "help.keys.stats.does": "Statistieken tonen",

  "hud.energy.title": "Energie in voorraad, en wat er de laatste seconde binnenkwam en uitging",
  "hud.energy.stats": "Klik om te zien waar de energie vandaan komt en waar ze heen gaat.",
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
  "key.slot12": "=",
  "key.slot13": "\\",
  "key.delete": "Del",

  "status.offGrid": "Niet op het net: heeft een voltooide pyloon binnen zes vakken nodig",
  "status.building": "In aanbouw",
  "status.off": "Uitgeschakeld",
  "status.damaged": "Beschadigd, wordt hersteld",
  "status.working": "In bedrijf",
  "status.loading": "Vliegtuig wordt geladen",
  "status.inFlight": "Vliegtuig onderweg naar het doel",
  "status.bombing": "Vliegtuig bombardeert",
  "status.returning": "Vliegtuig keert terug",

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
  "info.details": "Details",

  "grade.title": "Grond markeren",
  "grade.text": "Kies een doelhoogte en schilder dan vakken. Een egaliseerder binnen acht vakken doet het werk.",
  "grade.moving":
    "Een deel van de grond rijst en zakt hier en kan niet worden gemarkeerd: de rand wordt daarboven rood.",
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
  "tip.booster":
    "Hij versnelt alleen de pakketten die hij doorgeeft, niet die waarmee hij wordt gebouwd of gerepareerd. Zet hem vroeg op een lange lijn: hoe eerder een pakket wordt versneld, hoe langer het sneller reist.",
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
  "tip.airfield":
    "Het vliegtuig gaat altijd voor het ergste slib van de hele kaart, waar je net ook staat. Zet het vliegveld uit om het thuis te houden.",

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

  "stats.title": "Statistieken",
  "stats.empty": "De grafieken vullen zich naarmate de missie vordert.",
  "stats.silt": "Slib",
  "stats.silt.volume": "Slib op de kaart",
  "stats.silt.flooded": "Overstroomde vakken",
  "stats.silt.removed": "Slib verwijderd per seconde",
  "stats.energy": "Energie",
  "stats.energy.flow": "Stroom per seconde",
  "stats.energy.in": "Inkomsten",
  "stats.energy.out": "Uitgaven",
  "stats.energy.bank": "In voorraad",
  "stats.energy.stored": "Opgeslagen",
  "stats.energy.capacity": "Capaciteit",
  "stats.vents": "Open bronnen",
  "stats.structures": "Gebouwen",
  "stats.structures.standing": "Overeind",
  "stats.structures.lost": "Tot nu toe verloren",
  "stats.peak": "Slibpiek",
  "stats.peak.at": "op {time}",
  "stats.capped": "Bronnen afgedopt",
  "stats.net": "Netto-energie per seconde, gemiddeld",
  "stats.energy.sources": "Inkomsten per bron",
  "stats.energy.purposes": "Uitgaven per doel",
  "stats.spend.build": "Bouw",
  "stats.spend.repair": "Herstel",
  "stats.spend.supply": "Bedrijf",
  "stats.now": "Nu",
  "stats.rate": "{rate}/s",

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
    booster: {
      name: "Versneller",
      blurb: "Geeft pakketten door zoals een pyloon, en elk pakket dat erlangs komt gaat daarna een vijfde sneller. Versnellers stapelen, maar dezelfde versneller versnelt een pakket nooit twee keer. Elke werkende versneller maakt bovendien alle pakketten twee procent sneller, waar hij ook staat.",
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
    airfield: { name: "Vliegveld", blurb: "Laadt een vliegtuig met dertig energie. Als het vol is, vliegt het vliegtuig naar het diepste slib van de kaart, bombardeert het en komt terug om opnieuw te laden." },
  },
  levels: {
    c1: {
      name: "Landing",
      brief: "Eén bron, vijftien vakken oostwaarts en ver onder je, en zijn poel breidt zich al uit. Leid het net naar beneden, brand de bron droog en doe er een dop op.",
      hints: [
        "Alleen pylonen verlengen het net: alles moet binnen zes vakken van de lander of een voltooide pyloon staan.",
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
        "De verre bron slaapt de eerste halve minuut, dof en met een stilstaande ring. Eenmaal wakker is het de sterkste van de twee.",
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
        "Een versneller geeft door zoals een pyloon en maakt elk pakket dat erlangs komt een vijfde sneller. Pakketten nemen de snelste weg, dus een paar versnellers langs een lange lijn trekken het verkeer aan en brengen het eerder op bestemming.",
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
      hints: ["De verste bron slaapt vijf minuten, dof en met een stilstaande ring."],
    },
    c9: {
      name: "Hoefijzer",
      brief: "Drie sterke bronnen aan het begin van een dal dat om een kam buigt en naar jou terugkomt. Hun slib is al onderweg. Houd het weg van de lander en dop de bronnen af.",
      hints: [
        "Het slib komt om de bocht en het dal op naar jou toe. Werp met egaliseerders een dijk dwars door het dal op, of houd het tegen met keringen, pompen en lansen.",
        "Het net reikt over de rots op de kam. Vanaf de hoogte daar reiken lansen tot in beide armen van het dal.",
      ],
    },
    c10: {
      name: "Archipel",
      brief: "Je bent geland op een eiland in een zee van slib, en vier bronnen op de bodem laten die blijven stijgen. Spring met het net van eiland naar eiland, brand de zee rond elke bron terug en doe er een dop op.",
      hints: [
        "Het net reikt zes vakken ver over de zee, en de meeste zeestraten zijn smaller. Hoofdlijnen overbruggen de brede.",
        "De zee is één geheel: wat je bij een bron wegbrandt, stroomt van overal weer aan. Lansen op de eilandtoppen kijken over de hele zee uit.",
        "Het vliegtuig van een vliegveld bereikt de hele kaart: elke keer dat het geladen is, bombardeert het het diepste deel van de zee.",
      ],
    },
    c11: {
      name: "Schuivende terrassen",
      brief: "De grond rond de landingsplek komt trapsgewijs omhoog en leidt het slib om. Gebruik de vaste ring bij de lander om op te rukken en de bronnen af te sluiten.",
      hints: [
        "Het landingsplateau stijgt als één geheel. Egaliseerders kunnen op de vaste ring eromheen werken.",
        "Kijk na elke verschuiving waar het slib heen stroomt voordat je op de buitenste terrassen bouwt.",
      ],
    },
    c12: {
      name: "Bewegende ondiepten",
      brief: "Het slib stroomt al om de bocht naar je landtong. Breid het net via de eilanden uit en sluit de bronnen stroomopwaarts af.",
      hints: [
        "De landtong en de eilandtoppen bieden vaste grond voor relais en wapens.",
        "Twee ondiepten komen op verschillende momenten omhoog en zakken weer. Let op welke geulen het slib neemt.",
      ],
    },
  },
  skirmish: { name: "Gevecht {seed}", brief: "Dop elke bron af." },
};
