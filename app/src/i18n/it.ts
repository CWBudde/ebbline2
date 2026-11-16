// Italian interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         la melma               Vent        lo sfiato (gli sfiati)
//   Lode         il filone              Spitter     lo sputatore
//   Glob         il grumo               Grid        la rete
//   Packet       il pacchetto           Tile        la casella
//   Baffle field il campo barriera
//   Structure    la struttura           Energy      l'energia
//   Lander       il lander              Pylon       il pilone
//   Trunk        la dorsale             Tap         l'estrattore
//   Cell         la cella               Pump        la pompa
//   Lance        la lancia              Lobber      il mortaio
//   Baffle       la barriera            Interceptor l'intercettore
//   Grader       la livellatrice        Cap         il tappo
//   to cap       tappare                to seal     sigillare
//   to dismantle smantellare            Mark ground segnare il terreno
//   Campaign     la campagna            Skirmish    la schermaglia
//   Mission      la missione            Seed        il seed
//   Briefing     il briefing            Best (time) il record
//
// Style: informal "tu", short imperatives ("Costruisci", "Piazza", "Scegli"). The game's title
// "Ebbline 2" is never translated. Keys follow an Italian keyboard: Spazio, Canc, Esc, and the
// apostrophe for the key right of 0.

import type { Content, Key } from "./en.ts";

export const it: Record<Key, string> = {
  "meta.description":
    "Ebbline 2: un gioco di difesa contro la marea. La melma sale dagli sfiati; costruisci una rete, respingila e tappali tutti.",

  "title.lede": "La melma sale dagli sfiati. Costruisci una rete, respingila, tappali tutti.",
  "title.continue": "Continua",
  "title.credit": "Un gioco open source con licenza MIT. Grafica creata per questo progetto.",
  "menu.campaign": "Campagna",
  "menu.skirmish": "Schermaglia",
  "menu.help": "Come si gioca",
  "menu.settings": "Impostazioni",
  "common.back": "Indietro",

  "campaign.locked": "Vinci la missione precedente per sbloccare questa.",
  "campaign.best": "Record {time}",
  "campaign.next": "Missione successiva",

  "skirmish.seed": "Seed",
  "skirmish.size": "Dimensioni mappa",
  "skirmish.size.small": "Piccola, due sfiati",
  "skirmish.size.medium": "Media, tre sfiati",
  "skirmish.size.large": "Grande, quattro sfiati",
  "skirmish.difficulty": "Difficoltà",
  "skirmish.difficulty.easy": "Facile, nessuno sputatore",
  "skirmish.difficulty.normal": "Normale, uno sputatore",
  "skirmish.difficulty.hard": "Difficile, due sputatori",
  "skirmish.note":
    "Stesso seed, stesse dimensioni e stessa difficoltà danno sempre la stessa mappa. Quando la partita inizia, la barra degli indirizzi contiene un link alla mappa.",
  "skirmish.start": "Inizia",

  "settings.language": "Lingua",
  "settings.language.auto": "Automatica",
  "settings.volume": "Volume",
  "settings.music": "Sottofondo ambientale",
  "settings.edgeScroll": "Scorri la mappa quando il puntatore tocca il bordo dello schermo",
  "settings.reducedMotion": "Riduci lampi e pulsazioni",

  "help.intro":
    "La melma sgorga dagli _sfiati_ e scorre verso il basso. Logora tutto ciò su cui si posa. Se perdi il lander, perdi la missione. Vinci costruendo un *Tappo* su ogni sfiato.",
  "help.grid.title": "La rete",
  "help.grid.text":
    "L'energia lascia il lander in pacchetti e viaggia lungo i collegamenti della rete. Ogni struttura inoltra i pacchetti e deve trovarsi entro sei caselle da un'altra già costruita; i piloni sono il modo economico per arrivare più lontano. Mentre costruisci, o con un pilone selezionato, l'area raggiunta dalla rete completa è colorata. Un punto rosso indica una struttura che la rete non raggiunge. I piloni raccolgono energia dalle caselle entro tre passi che sono al loro stesso livello e in vista diretta (mostrate come area verde); un terreno più alto o la roccia in mezzo la blocca, e le caselle coperte di melma non rendono nulla.",
  "help.cap.title": "Tappare uno sfiato",
  "help.cap.text":
    "Un tappo si può iniziare solo quando la casella dello sfiato è quasi asciutta, come indica un anello bianco. Mentre è in costruzione tiene chiuso lo sfiato, ma la pressione cresce: se il tappo va perso, esce tutto in un colpo.",
  "help.structures.title": "Strutture",
  "help.controls.title": "Comandi",
  "help.keys.click": "Clic, tocco",
  "help.keys.click.does": "Con uno strumento piazza, altrimenti seleziona",
  "help.keys.drag": "Trascina",
  "help.keys.drag.does": "Con uno strumento piazza una fila o disegna segni, altrimenti sposta la mappa",
  "help.keys.cancel": "Clic destro, Esc",
  "help.keys.cancel.does": "Posa lo strumento, annulla la selezione, apri il menu",
  "help.keys.zoom": "Rotellina, pizzico",
  "help.keys.zoom.does": "Zoom",
  "help.keys.pan": "W A S D, frecce",
  "help.keys.pan.does": "Sposta la mappa",
  "help.keys.slots": "1 a 0, ', ì",
  "help.keys.slots.does": "Scegli una struttura dalla barra di costruzione",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Segna il terreno per le livellatrici",
  "help.keys.pause": "Spazio",
  "help.keys.pause.does": "Pausa",
  // On an Italian keyboard the bracket keys are è and +; comma and full stop do the same.
  "help.keys.speed": ", .",
  "help.keys.speed.does": "Più lento, più veloce",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Spegni o accendi la struttura selezionata",
  "help.keys.dismantle": "Canc",
  "help.keys.dismantle.does": "Smantella la struttura selezionata e recupera metà del costo",
  "help.keys.stats": "T",
  "help.keys.stats.does": "Mostra le statistiche",

  "hud.energy.title": "Energia in riserva, con entrate e uscite dell'ultimo secondo",
  "hud.energy.stats": "Clicca per vedere da dove viene l'energia e dove va.",
  "hud.hold": "Resisti {time}",
  "hud.capped": "Sfiati tappati {capped} / {vents}",
  "hud.pause": "Pausa",
  "hud.paused": "In pausa",
  "hud.pause.title": "Pausa (Spazio)",
  "hud.menu": "Menu",
  "hud.menu.title": "Menu (Esc)",
  "hud.map": "Panoramica mappa",

  "build.label": "Costruisci",
  "build.mark": "Segna",
  "build.mark.cost": "terreno",
  "build.mark.title": "Segna il terreno che le livellatrici devono alzare o abbassare",
  "key.slot11": "'",
  "key.slot12": "ì",
  "key.delete": "Canc",

  "status.offGrid": "Fuori rete: serve una struttura entro sei caselle",
  "status.building": "In costruzione",
  "status.off": "Spenta",
  "status.damaged": "Danneggiata, in riparazione",
  "status.working": "In funzione",

  "info.cost": "{cost} energia",
  "info.range": "Portata {range}",
  "info.rangeMin": "Portata {range}, non più vicino di {min}",
  "info.place": "Clic per piazzare, trascina per una fila. Clic destro o Esc posa lo strumento.",
  "info.health": "Integrità",
  "info.energy": "Energia",
  "info.switchOff": "Spegni",
  "info.switchOn": "Accendi",
  "info.dismantle": "Smantella",
  "info.notes": "Note",
  "info.hide": "Nascondi",
  "info.details": "Dettagli",

  "grade.title": "Segna il terreno",
  "grade.text":
    "Scegli un'altezza obiettivo, poi segna le caselle. Una livellatrice entro otto caselle fa il lavoro.",
  "grade.erase": "Cancella",

  "pause.title": "In pausa",
  "pause.resume": "Riprendi",
  "pause.save": "Salva",
  "pause.briefing": "Briefing",
  "pause.restart": "Ricomincia missione",
  "pause.quit": "Salva ed esci",

  "briefing.mission": "Missione {number} di {total}",
  "briefing.objective": "Obiettivo",
  "briefing.objective.cap.one": "Costruisci un tappo sullo sfiato.",
  "briefing.objective.cap.many": "Costruisci un tappo su ciascuno dei {vents} sfiati.",
  "briefing.objective.survive": "Tieni in piedi il lander per {minutes} minuti, oppure tappa ogni sfiato prima.",
  "briefing.new": "Novità in questa missione",
  "briefing.new.threat": "Nuova minaccia",
  "briefing.new.goal": "Nuovo obiettivo",
  "briefing.tip": "Consiglio",
  "briefing.deploy": "Schierati",
  "briefing.resume": "Torna alla missione",
  "briefing.spitter.name": "Sputatore",
  "briefing.spitter.text":
    "Non si può distruggere. Circa ogni mezzo minuto scaglia un grumo di melma sulla tua rete; un segnale mostra dove cadrà.",
  "briefing.survive.name": "Resisti",
  "briefing.survive.text":
    "È vinta quando il conto alla rovescia in alto si esaurisce e il lander è ancora in piedi. Tappare ogni sfiato la conclude prima, con una vittoria.",

  "tip.pylon":
    "Tieni la catena sul terreno asciutto: un pilone perso nella melma isola tutto ciò che alimentava.",
  "tip.tap":
    "Ogni estrattore aggiunge 0,6 energia al secondo all'unità del lander, ma solo finché la rete lo raggiunge.",
  "tip.lance":
    "Arriva a sette caselle e colpisce solo terreno alla sua altezza o più in basso: mettila sul bordo sopra la melma, non giù nel bacino.",
  "tip.cap":
    "Richiede 60 pacchetti e tiene chiuso lo sfiato solo finché la rete lo raggiunge: prima metti al sicuro la linea fino allo sfiato, poi piazza il tappo.",
  "tip.cell":
    "All'inizio la riserva contiene solo 30 e ciò che entra oltre va perso: qualche cella ti permette di risparmiare per una grande avanzata.",
  "tip.lobber":
    "Spara solo sulle pozze, non sugli strati sottili, e mai più vicino di tre caselle: mettilo dietro il fronte e lascia le zone basse alle lance.",
  "tip.pump":
    "Funziona senza energia ma rende poco, e la melma sulla sua casella la logora: tieni una lancia lì vicino.",
  "tip.trunk":
    "Il collegamento rapido di quattordici caselle richiede una dorsale a entrambe le estremità; con tutto il resto una dorsale si collega come un pilone, entro sei caselle.",
  "tip.booster":
    "Accelera solo i pacchetti che inoltra, non quelli che servono a costruirlo o ripararlo. Mettilo presto su una linea lunga: prima un pacchetto viene accelerato, più a lungo corre veloce.",
  "tip.interceptor":
    "Arriva a nove caselle e spende un'unità di energia per colpo, tre colpi per grumo: mettilo dove le tue strutture sono più fitte.",
  "tip.baffle":
    "Il campo copre quattro caselle intorno e cade nell'istante in cui la barriera resta senza energia: proteggi la linea che la alimenta.",
  "tip.grader":
    "Ogni livello di altezza richiede un secondo e mezzo, e sotto una struttura non si può livellare: segna i tuoi argini prima che arrivi la melma.",
  "tip.spitter":
    "I grumi puntano alla struttura con più strutture vicine entro cinque caselle, quindi sai dove cadrà il prossimo: tieni lì un intercettore.",
  "tip.survive":
    "Spendi per difendere il lander invece che per espanderti: gli sfiati si rafforzano ogni minuto, e gli ultimi minuti sono i più duri.",

  "end.won": "Sfiati sigillati",
  "end.won.survive.title": "Hai resistito",
  "end.lost": "Lander perso",
  "end.won.survive": "Hai tenuto la posizione.",
  "end.won.cap": "La melma si ritira.",
  "end.lost.text": "La melma ha raggiunto il lander.",
  "end.time": "Tempo",
  "end.newBest": "nuovo record",
  "end.spent": "Energia spesa",
  "end.built": "Strutture costruite",
  "end.destroyed": "Strutture perse",
  "end.removed": "Melma rimossa",
  "end.next": "Prossima: {name}",
  "end.again": "Gioca ancora",
  "end.retry": "Riprova",
  "end.menu": "Menu principale",

  "stats.title": "Statistiche",
  "stats.empty": "I grafici si riempiono durante la missione.",
  "stats.silt": "Melma",
  "stats.silt.volume": "Melma sulla mappa",
  "stats.silt.flooded": "Caselle allagate",
  "stats.silt.removed": "Melma rimossa al secondo",
  "stats.energy": "Energia",
  "stats.energy.flow": "Flusso al secondo",
  "stats.energy.in": "Entrate",
  "stats.energy.out": "Uscite",
  "stats.energy.bank": "In riserva",
  "stats.energy.stored": "Accumulata",
  "stats.energy.capacity": "Capacità",
  "stats.vents": "Sfiati aperti",
  "stats.structures": "Strutture",
  "stats.structures.standing": "Esistenti",
  "stats.structures.lost": "Perse finora",
  "stats.peak": "Picco di melma",
  "stats.peak.at": "a {time}",
  "stats.capped": "Sfiati tappati",
  "stats.net": "Energia netta al secondo, in media",
  "stats.energy.sources": "Entrate per fonte",
  "stats.energy.purposes": "Uscite per scopo",
  "stats.spend.build": "Costruzione",
  "stats.spend.repair": "Riparazione",
  "stats.spend.supply": "Funzionamento",
  "stats.now": "Ora",
  "stats.rate": "{rate}/s",

  "notice.unreadable": "Impossibile leggere questo salvataggio.",
  "notice.saved": "Partita salvata.",
  "notice.noStorage": "In questo browser non è possibile salvare.",

  "place.locked": "Non è disponibile in questa missione.",
  "place.outside": "È fuori dalla mappa.",
  "place.rock": "Sulla roccia non si può costruire.",
  "place.occupied": "Lì c'è già qualcosa.",
  "place.spitter": "Lì c'è uno sputatore.",
  "place.needs vent": "Un tappo va solo su uno sfiato aperto.",
  "place.flooded": "Lì c'è troppa melma. Bruciala prima.",
  "place.vent": "Su uno sfiato può stare solo un tappo.",
  "place.needs lode": "Un estrattore va solo su un filone.",
};

export const itContent: Content = {
  kinds: {
    lander: {
      name: "Lander",
      blurb: "Origine della rete. Se lo perdi, la missione è finita.",
    },
    pylon: { name: "Pilone", blurb: "Estende la rete di sei caselle e raccoglie un po' di energia dal terreno piano che vede alla sua stessa altezza." },
    trunk: {
      name: "Dorsale",
      blurb: "Si collega ad altre dorsali entro quattordici caselle e raddoppia la velocità dei pacchetti.",
    },
    booster: {
      name: "Acceleratore",
      blurb: "Ritrasmette i pacchetti come un pilone, e ogni pacchetto che lo attraversa viaggia poi un quinto più veloce. Gli acceleratori si sommano, ma lo stesso acceleratore non accelera mai due volte un pacchetto. Inoltre ogni acceleratore in funzione rende tutti i pacchetti più veloci del due per cento, ovunque si trovi.",
    },
    tap: { name: "Estrattore", blurb: "Estrae energia costante da un filone. Va solo su un filone." },
    cell: { name: "Cella", blurb: "Immagazzina trenta energia in più." },
    pump: {
      name: "Pompa",
      blurb: "Aspira la melma bassa nei dintorni e ne ricava un po' di energia.",
    },
    lance: { name: "Lancia", blurb: "Brucia la melma una casella alla volta. Non può mirare verso l'alto." },
    lobber: {
      name: "Mortaio",
      blurb: "Scaglia una carica lenta sulla melma più profonda a portata.",
    },
    baffle: {
      name: "Barriera",
      blurb: "Proietta un campo che la melma deve scavalcare come un muro alto due livelli.",
    },
    interceptor: { name: "Intercettore", blurb: "Abbatte i grumi in volo." },
    grader: { name: "Livellatrice", blurb: "Alza o abbassa il terreno segnato, un livello alla volta." },
    cap: {
      name: "Tappo",
      blurb: "Tiene chiuso uno sfiato asciutto mentre viene costruito, poi lo sigilla per sempre.",
    },
  },
  levels: {
    c1: {
      name: "Atterraggio",
      brief: "Uno sfiato, quindici caselle a est e molto più in basso, e la sua pozza si sta già allargando. Porta la rete fin laggiù, bruciane la melma e tappalo.",
      hints: [
        "I piloni sono il modo economico per estendere la rete. Tutto deve stare entro sei caselle da una struttura completata.",
        "Le lance bruciano la melma. Mettile in alto: non possono mirare in salita.",
        "Quando lo sfiato si secca tra un'ondata e l'altra, piazzaci un tappo e tienilo rifornito.",
        "Il lander produce un'energia al secondo e qui non ci sono filoni. Un pilone raccoglie un po' di più dal terreno piano che vede alla sua stessa altezza. Non costruire più del necessario.",
      ],
    },
    c2: {
      name: "Due fronti",
      brief: "Due sfiati, ai lati opposti della tua collina. Sfrutta i filoni per l'energia e mettila da parte per i tappi.",
      hints: [
        "Piazza gli estrattori sui filoni luminosi vicino al lander per guadagnare energia.",
        "La riserva contiene trenta di energia, mezzo tappo. Ogni cella ne aggiunge altri trenta.",
        "Lo sfiato lontano dorme per il primo mezzo minuto, spento e con l'anello fermo. Quando si sveglia è il più forte dei due.",
      ],
    },
    c3: {
      name: "Pozzo",
      brief: "Tre sfiati sgorgano a ondate lente e pesanti, e il bacino sotto si riempie in profondità. I mortai raggiungono le pozze profonde.",
      hints: [
        "I mortai ignorano l'altezza, ma non colpiscono nulla a meno di tre caselle.",
      ],
    },
    c4: {
      name: "Terre lontane",
      brief: "Tre sfiati in tre direzioni, il più vicino a ventinove caselle. Le dorsali portano i pacchetti veloci sulle lunghe distanze.",
      hints: [
        "Le dorsali si collegano fra loro su quattordici caselle e raddoppiano la velocità dei pacchetti.",
        "Un acceleratore ritrasmette come un pilone e rende ogni pacchetto che lo attraversa un quinto più veloce. I pacchetti prendono la via più rapida, quindi qualche acceleratore lungo una linea lunga attira il traffico e lo fa arrivare prima.",
      ],
    },
    c5: {
      name: "Altopiano",
      brief: "Quattro sfiati circondano il tuo tavolato e i filoni sono solo tre. Le pompe raccolgono la melma bassa per ricavarne energia.",
      hints: [
        "Una pompa raggiunge solo la melma a due caselle, quindi deve stare sulla riva, dove anche la melma può raggiungerla.",
      ],
    },
    c6: {
      name: "Piana alluvionale",
      brief: "Sei atterrato in basso, sulla riva di una valle fluviale, con quattro sfiati intorno, uno dei quali vicino. Resisti dieci minuti.",
      hints: [
        "Una barriera alimentata costringe la melma a salire due livelli in più su ogni casella entro quattro caselle da essa.",
        "Scegli Segna, un'altezza e dipingi le caselle; una livellatrice entro otto caselle le alza o le abbassa.",
      ],
    },
    c7: {
      name: "Bombardamento",
      brief: "Tre sputatori scagliano melma sulla tua rete da sud. Gli intercettori abbattono i grumi in volo.",
      hints: [
        "I grumi mirano al tuo gruppo più denso. Un intercettore raggiunge nove caselle e servono tre colpi per grumo.",
      ],
    },
    c8: {
      name: "Spartiacque",
      brief: "Cinque sfiati e tre sputatori tutt'intorno alla vetta. Usa tutto quello che hai.",
      hints: ["Lo sfiato più lontano dorme per cinque minuti, spento e con l'anello fermo."],
    },
    c9: {
      name: "Ferro di cavallo",
      brief: "Tre sfiati potenti in testa a una valle che gira attorno a una cresta e torna giù fino a te. La loro melma è già in arrivo. Tienila lontana dal lander e tappa gli sfiati.",
      hints: [
        "La melma gira l'ansa e risale la valle fino a te. Alza una diga di traverso alla valle con le livellatrici, o trattienila con barriere, pompe e lance.",
        "La rete passa sopra la roccia della cresta. Dalle sue alture le lance arrivano in entrambi i bracci della valle.",
      ],
    },
    c10: {
      name: "Arcipelago",
      brief: "Sei atterrato su un'isola in mezzo a un mare di melma, e quattro sfiati sul fondale continuano a farlo salire. Porta la rete di isola in isola, respingi il mare col fuoco attorno a ogni sfiato e tappalo.",
      hints: [
        "La rete arriva a sei caselle oltre il mare, e quasi tutti i bracci di mare sono più corti. Le dorsali superano quelli larghi.",
        "Il mare è uno solo: ciò che bruci vicino a uno sfiato torna a riempirsi da ogni parte. Le lance in cima alle isole lo dominano tutto.",
      ],
    },
  },
  skirmish: { name: "Schermaglia {seed}", brief: "Tappa ogni sfiato." },
};
