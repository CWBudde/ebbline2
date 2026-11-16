// French interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         la vase                Vent        l'évent (m.)
//   Lode         le filon               Spitter     le cracheur
//   Glob         la boule               Grid        le réseau
//   Packet       le paquet              Tile        la case
//   Baffle field le champ de barrage
//   Structure    le bâtiment            Energy      l'énergie
//   Lander       l'atterrisseur         Pylon       le Pylône
//   Trunk        l'Artère (f.)          Tap         l'Extracteur
//   Cell         la Batterie            Pump        la Pompe
//   Lance        la Lance               Lobber      le Mortier
//   Baffle       la Barrière            Interceptor l'Intercepteur
//   Grader       la Niveleuse           Cap         le Bouchon
//   to cap       boucher                to seal     sceller
//   to dismantle démanteler             Mark ground marquer le terrain
//   Campaign     la campagne            Skirmish    l'escarmouche
//   Mission      la mission             Seed        la graine
//   Briefing     le briefing            Best (time) le record
//
// Style: informal "tu", short imperatives ("Construis", "Place", "Choisis"). Structure names are
// capitalised in running text, as in English. Non-breaking spaces before : ; ! ? as French
// typography wants. The game's title "Ebbline 2" is never translated. Keys follow an AZERTY
// keyboard: Z Q S D, Espace, Suppr, and ) for the key right of 0.

import type { Content, Key } from "./en.ts";

export const fr: Record<Key, string> = {
  "meta.description":
    "Ebbline 2 : un jeu de défense contre la marée. La vase monte des évents ; construis un réseau, repousse-la et bouche-les tous.",

  "title.lede": "La vase monte des évents. Construis un réseau, repousse-la, bouche-les tous.",
  "title.continue": "Continuer",
  "title.credit": "Un jeu open source sous licence MIT. Graphismes créés pour ce projet.",
  "menu.campaign": "Campagne",
  "menu.skirmish": "Escarmouche",
  "menu.help": "Comment jouer",
  "menu.settings": "Options",
  "common.back": "Retour",

  "campaign.locked": "Gagne la mission précédente pour débloquer celle-ci.",
  "campaign.best": "Record {time}",
  "campaign.next": "Mission suivante",

  "skirmish.seed": "Graine",
  "skirmish.size": "Taille de la carte",
  "skirmish.size.small": "Petite, deux évents",
  "skirmish.size.medium": "Moyenne, trois évents",
  "skirmish.size.large": "Grande, quatre évents",
  "skirmish.difficulty": "Difficulté",
  "skirmish.difficulty.easy": "Facile, aucun cracheur",
  "skirmish.difficulty.normal": "Normale, un cracheur",
  "skirmish.difficulty.hard": "Difficile, deux cracheurs",
  "skirmish.note":
    "La même graine, la même taille et la même difficulté donnent toujours la même carte. Une fois la partie lancée, la barre d'adresse contient un lien vers elle.",
  "skirmish.start": "Lancer",

  "settings.language": "Langue",
  "settings.language.auto": "Automatique",
  "settings.volume": "Volume",
  "settings.music": "Fond sonore",
  "settings.edgeScroll": "Faire défiler quand le pointeur touche le bord de l'écran",
  "settings.reducedMotion": "Réduire les flashs et les pulsations",

  "help.intro":
    "La vase jaillit des _évents_ et s'écoule vers le bas. Elle ronge tout ce qu'elle recouvre. Si tu perds l'atterrisseur, la mission est perdue. Pour gagner, construis un *Bouchon* sur chaque évent.",
  "help.grid.title": "Le réseau",
  "help.grid.text":
    "L'énergie quitte l'atterrisseur sous forme de paquets et circule le long des liaisons du réseau. Seuls l'atterrisseur, les Pylônes, les Artères et les Accélérateurs relaient les paquets : chaque bâtiment doit donc se trouver à six cases au plus de l'un d'eux déjà achevé ; les Pylônes sont le moyen économique d'aller plus loin. Un point rouge signale un bâtiment hors de portée du réseau. Les Pylônes récoltent l'énergie des cases situées à trois pas au plus, à leur propre niveau et en vue directe (zone verte) ; un terrain plus haut ou un rocher entre les deux bloque la récolte, et les cases couvertes de vase ne donnent rien.",
  "help.cap.title": "Boucher un évent",
  "help.cap.text":
    "On ne peut commencer un Bouchon que lorsque la case de l'évent est presque sèche, ce qu'indique un anneau blanc. Pendant sa construction, il maintient l'évent fermé, mais la pression monte : si le Bouchon est perdu, tout jaillit d'un coup.",
  "help.structures.title": "Bâtiments",
  "help.controls.title": "Commandes",
  "help.keys.click": "Clic, toucher",
  "help.keys.click.does": "Placer avec un outil, sinon sélectionner",
  "help.keys.drag": "Glisser",
  "help.keys.drag.does": "Placer une rangée ou peindre des marques avec un outil, sinon déplacer la carte",
  "help.keys.cancel": "Clic droit, Échap",
  "help.keys.cancel.does": "Ranger l'outil, désélectionner, ouvrir le menu",
  "help.keys.zoom": "Molette, pincer",
  "help.keys.zoom.does": "Zoomer",
  "help.keys.pan": "Z Q S D, flèches",
  "help.keys.pan.does": "Déplacer la carte",
  "help.keys.slots": "1 à 0, ), =",
  "help.keys.slots.does": "Choisir un bâtiment dans la barre de construction",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Marquer le terrain pour les Niveleuses",
  "help.keys.pause": "Espace",
  "help.keys.pause.does": "Pause",
  // On AZERTY the bracket keys are ^ and $; the keys at the comma and full stop positions also work.
  "help.keys.speed": "^ $",
  "help.keys.speed.does": "Plus lent, plus rapide",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Éteindre ou allumer le bâtiment sélectionné",
  "help.keys.dismantle": "Suppr",
  "help.keys.dismantle.does": "Démanteler le bâtiment sélectionné pour la moitié de son coût",
  "help.keys.stats": "T",
  "help.keys.stats.does": "Afficher les statistiques",

  "hud.energy.title": "Énergie en réserve, et ce qui est entré et sorti au cours de la dernière seconde",
  "hud.energy.stats": "Clique pour voir d'où vient l'énergie et où elle va.",
  "hud.hold": "Tenir {time}",
  "hud.capped": "Évents bouchés {capped} / {vents}",
  "hud.pause": "Pause",
  "hud.paused": "En pause",
  "hud.pause.title": "Pause (Espace)",
  "hud.menu": "Menu",
  "hud.menu.title": "Menu (Échap)",
  "hud.map": "Vue d'ensemble",

  "build.label": "Construire",
  "build.mark": "Marquer",
  "build.mark.cost": "terrain",
  "build.mark.title": "Marquer le terrain que les Niveleuses doivent élever ou abaisser",
  "key.slot11": ")",
  "key.slot12": "=",
  "key.delete": "Suppr",

  "status.offGrid": "Hors réseau : il faut un Pylône achevé à six cases au plus",
  "status.building": "En construction",
  "status.off": "Éteint",
  "status.damaged": "Endommagé, en réparation",
  "status.working": "En service",

  "info.cost": "{cost} énergie",
  "info.range": "Portée {range}",
  "info.rangeMin": "Portée {range}, pas plus près que {min}",
  "info.place": "Clique pour placer, glisse pour une rangée. Clic droit ou Échap pour ranger l'outil.",
  "info.health": "État",
  "info.energy": "Énergie",
  "info.switchOff": "Éteindre",
  "info.switchOn": "Allumer",
  "info.dismantle": "Démanteler",
  "info.notes": "Conseils",
  "info.hide": "Masquer",
  "info.details": "Détails",

  "grade.title": "Marquer le terrain",
  "grade.text":
    "Choisis une hauteur cible, puis peins les cases. Une Niveleuse à huit cases au plus fait le travail.",
  "grade.erase": "Effacer",

  "pause.title": "En pause",
  "pause.resume": "Reprendre",
  "pause.save": "Sauvegarder",
  "pause.briefing": "Briefing",
  "pause.restart": "Recommencer",
  "pause.quit": "Sauver et quitter",

  "briefing.mission": "Mission {number} sur {total}",
  "briefing.objective": "Objectif",
  "briefing.objective.cap.one": "Construis un Bouchon sur l'évent.",
  "briefing.objective.cap.many": "Construis un Bouchon sur chacun des {vents} évents.",
  "briefing.objective.survive": "Garde l'atterrisseur debout pendant {minutes} minutes, ou bouche chaque évent avant.",
  "briefing.new": "Nouveau dans cette mission",
  "briefing.new.threat": "Nouvelle menace",
  "briefing.new.goal": "Nouvel objectif",
  "briefing.tip": "Conseil",
  "briefing.deploy": "Déployer",
  "briefing.resume": "Retour à la mission",
  "briefing.spitter.name": "Cracheur",
  "briefing.spitter.text":
    "Indestructible. Toutes les trente secondes environ, il projette une boule de vase sur ton réseau ; un marqueur indique où elle va tomber.",
  "briefing.survive.name": "Tenir bon",
  "briefing.survive.text":
    "Elle est gagnée quand le compte à rebours en haut arrive à zéro et que l'atterrisseur tient encore. Boucher chaque évent la termine plus tôt, par une victoire.",

  "tip.pylon":
    "Garde la chaîne sur un sol sec : un Pylône perdu dans la vase coupe tout ce qu'il alimentait.",
  "tip.tap":
    "Chaque Extracteur ajoute 0,6 énergie par seconde au 1 de l'atterrisseur, mais seulement tant que le réseau l'atteint.",
  "tip.lance":
    "Elle porte à sept cases et ne touche que le sol à sa hauteur ou plus bas : place-la sur le rebord au-dessus de la vase, pas au fond du bassin.",
  "tip.cap":
    "Il faut 60 paquets, et il ne retient l'évent que tant que le réseau l'atteint : sécurise d'abord la ligne jusqu'à l'évent, puis place le Bouchon.",
  "tip.cell":
    "La réserve ne contient d'abord que 30, et tout surplus est perdu : quelques Batteries te permettent d'épargner pour une grande offensive.",
  "tip.lobber":
    "Il ne tire que sur les nappes, pas sur les couches fines, et jamais à moins de trois cases : place-le derrière le front et laisse les hauts-fonds aux Lances.",
  "tip.pump":
    "Elle fonctionne sans énergie mais rapporte peu, et la vase sur sa propre case la ronge : garde une Lance à proximité.",
  "tip.trunk":
    "La liaison rapide sur quatorze cases exige une Artère à chaque bout ; avec tout le reste, une Artère se relie comme un Pylône, à six cases au plus.",
  "tip.booster":
    "Il n'accélère que les paquets qu'il transmet, pas ceux qui servent à le construire ou à le réparer. Place-le tôt sur une longue ligne : plus un paquet est accéléré tôt, plus longtemps il file vite.",
  "tip.interceptor":
    "Il porte à neuf cases et dépense une énergie par tir, trois tirs par boule : place-le là où tes bâtiments sont le plus serrés.",
  "tip.baffle":
    "Le champ couvre quatre cases autour d'elle et tombe dès que la Barrière manque d'énergie : protège la ligne qui l'alimente.",
  "tip.grader":
    "Chaque niveau de hauteur prend une seconde et demie, et rien ne peut être nivelé sous un bâtiment : marque tes digues avant que la vase n'arrive.",
  "tip.spitter":
    "Les boules visent le bâtiment entouré du plus grand nombre d'autres à cinq cases, tu sais donc où tombera la prochaine : places-y un Intercepteur.",
  "tip.survive":
    "Investis dans la défense autour de l'atterrisseur plutôt que dans l'expansion : les évents se renforcent chaque minute, les dernières sont les plus dures.",

  "end.won": "Évents scellés",
  "end.won.survive.title": "Tenu bon",
  "end.lost": "Atterrisseur perdu",
  "end.won.survive": "Tu as tenu la ligne.",
  "end.won.cap": "La vase se retire.",
  "end.lost.text": "La vase a atteint l'atterrisseur.",
  "end.time": "Temps",
  "end.newBest": "nouveau record",
  "end.spent": "Énergie dépensée",
  "end.built": "Bâtiments construits",
  "end.destroyed": "Bâtiments perdus",
  "end.removed": "Vase éliminée",
  "end.next": "Suivante : {name}",
  "end.again": "Rejouer",
  "end.retry": "Réessayer",
  "end.menu": "Menu principal",

  "stats.title": "Statistiques",
  "stats.empty": "Les graphiques se remplissent au fil de la mission.",
  "stats.silt": "Vase",
  "stats.silt.volume": "Vase sur la carte",
  "stats.silt.flooded": "Cases inondées",
  "stats.silt.removed": "Vase retirée par seconde",
  "stats.energy": "Énergie",
  "stats.energy.flow": "Flux par seconde",
  "stats.energy.in": "Revenus",
  "stats.energy.out": "Dépenses",
  "stats.energy.bank": "En réserve",
  "stats.energy.stored": "Stockée",
  "stats.energy.capacity": "Capacité",
  "stats.vents": "Évents ouverts",
  "stats.structures": "Bâtiments",
  "stats.structures.standing": "En place",
  "stats.structures.lost": "Perdus jusqu'ici",
  "stats.peak": "Pic de vase",
  "stats.peak.at": "à {time}",
  "stats.capped": "Évents bouchés",
  "stats.net": "Énergie nette par seconde, en moyenne",
  "stats.energy.sources": "Revenus par source",
  "stats.energy.purposes": "Dépenses par usage",
  "stats.spend.build": "Construction",
  "stats.spend.repair": "Réparation",
  "stats.spend.supply": "Fonctionnement",
  "stats.now": "Actuel",
  "stats.rate": "{rate}/s",

  "notice.unreadable": "Impossible de lire cette sauvegarde.",
  "notice.saved": "Partie sauvegardée.",
  "notice.noStorage": "La sauvegarde n'est pas possible dans ce navigateur.",

  "place.locked": "Ce n'est pas disponible dans cette mission.",
  "place.outside": "C'est hors de la carte.",
  "place.rock": "On ne peut rien construire sur la roche.",
  "place.occupied": "Il y a déjà quelque chose ici.",
  "place.spitter": "Un cracheur se trouve ici.",
  "place.needs vent": "Un Bouchon ne va que sur un évent ouvert.",
  "place.flooded": "Trop de vase ici. Brûle-la d'abord.",
  "place.vent": "Seul un Bouchon peut se trouver sur un évent.",
  "place.needs lode": "Un Extracteur ne va que sur un filon.",
};

export const frContent: Content = {
  kinds: {
    lander: {
      name: "Atterrisseur",
      blurb: "Point de départ du réseau. S'il est perdu, la mission est terminée.",
    },
    pylon: { name: "Pylône", blurb: "Étend le réseau de six cases et récolte un peu d'énergie sur le sol plat qu'il voit à sa propre hauteur." },
    trunk: {
      name: "Artère",
      blurb: "Se relie aux autres Artères sur quatorze cases et double la vitesse des paquets.",
    },
    booster: {
      name: "Accélérateur",
      blurb: "Relaie les paquets comme un Pylône, et chaque paquet qui le traverse va ensuite un cinquième plus vite. Les Accélérateurs se cumulent, mais un même Accélérateur n'accélère jamais deux fois le même paquet. De plus, chaque Accélérateur en service rend tous les paquets deux pour cent plus rapides, où qu'il se trouve.",
    },
    tap: { name: "Extracteur", blurb: "Tire une énergie régulière d'un filon. Ne va que sur un filon." },
    cell: { name: "Batterie", blurb: "Stocke trente énergie de plus." },
    pump: {
      name: "Pompe",
      blurb: "Écrème la vase peu profonde à proximité et en tire un peu d'énergie.",
    },
    lance: { name: "Lance", blurb: "Brûle la vase case par case. Ne peut pas viser vers le haut." },
    lobber: {
      name: "Mortier",
      blurb: "Projette une charge lente sur la vase la plus profonde à portée.",
    },
    baffle: {
      name: "Barrière",
      blurb: "Projette un champ que la vase doit franchir comme un mur de deux niveaux.",
    },
    interceptor: { name: "Intercepteur", blurb: "Abat les boules en vol." },
    grader: { name: "Niveleuse", blurb: "Élève ou abaisse le terrain marqué, niveau par niveau." },
    cap: {
      name: "Bouchon",
      blurb: "Retient un évent sec pendant sa construction, puis le scelle pour de bon.",
    },
  },
  levels: {
    c1: {
      name: "Atterrissage",
      brief: "Un évent, à quinze cases à l'est et bien en contrebas, dont la mare s'étend déjà. Descends le réseau jusqu'à lui, assèche-le au feu et bouche-le.",
      hints: [
        "Seuls les Pylônes étendent le réseau : tout doit se trouver à six cases au plus de l'atterrisseur ou d'un Pylône achevé.",
        "Les Lances brûlent la vase. Place-les en hauteur : elles ne peuvent pas viser vers le haut.",
        "Quand l'évent s'assèche entre deux poussées, place un Bouchon dessus et garde-le alimenté.",
        "L'atterrisseur produit une énergie par seconde, et il n'y a pas de filons ici. Un Pylône récolte un peu plus sur le sol plat qu'il voit à sa propre hauteur. Ne construis pas plus que nécessaire.",
      ],
    },
    c2: {
      name: "Deux fronts",
      brief: "Deux évents, de part et d'autre de ta colline. Exploite les filons pour l'énergie et mets-la en réserve pour les Bouchons.",
      hints: [
        "Place des Extracteurs sur les filons lumineux près de l'atterrisseur pour gagner de l'énergie.",
        "La réserve contient trente d'énergie, soit la moitié d'un Bouchon. Chaque Batterie en ajoute trente.",
        "L'évent éloigné dort pendant la première demi-minute, terne, l'anneau immobile. À son réveil, c'est le plus fort des deux.",
      ],
    },
    c3: {
      name: "Gouffre",
      brief: "Trois évents crachent par poussées lentes et lourdes, et le bassin en contrebas se remplit en profondeur. Les Mortiers atteignent les poches profondes.",
      hints: [
        "Les Mortiers ignorent la hauteur, mais ne touchent rien à moins de trois cases.",
      ],
    },
    c4: {
      name: "Confins",
      brief: "Trois évents dans trois directions, le plus proche à vingt-neuf cases. Les Artères portent les paquets vite par-dessus les grands vides.",
      hints: [
        "Les Artères se relient entre elles sur quatorze cases et doublent la vitesse des paquets.",
        "Un Accélérateur relaie comme un Pylône et rend chaque paquet qui le traverse un cinquième plus rapide. Les paquets prennent le chemin le plus rapide, donc quelques Accélérateurs le long d'une longue ligne attirent le trafic et l'amènent plus tôt à destination.",
      ],
    },
    c5: {
      name: "Haut plateau",
      brief: "Quatre évents encerclent ton plateau, et il n'y a que trois filons. Les Pompes écument la vase peu profonde pour en tirer de l'énergie.",
      hints: [
        "Une Pompe n'atteint que la vase à deux cases, elle doit donc se tenir au bord, là où la vase peut aussi l'atteindre.",
      ],
    },
    c6: {
      name: "Plaine inondable",
      brief: "Tu t'es posé en contrebas, sur la berge d'une vallée fluviale, avec quatre évents autour de toi, dont un tout proche. Tiens dix minutes.",
      hints: [
        "Une Barrière alimentée force la vase à gravir deux niveaux de plus sur chaque case à quatre cases ou moins d'elle.",
        "Choisis Marquer, une hauteur, puis peins des cases ; une Niveleuse à huit cases au plus les relève ou les abaisse.",
      ],
    },
    c7: {
      name: "Pilonnage",
      brief: "Trois cracheurs envoient de la vase sur ton réseau depuis le sud. Les Intercepteurs abattent les boules en plein vol.",
      hints: [
        "Les boules visent ta grappe la plus dense. Un Intercepteur porte à neuf cases et demande trois tirs par boule.",
      ],
    },
    c8: {
      name: "Bassin versant",
      brief: "Cinq évents et trois cracheurs tout autour du sommet. Sers-toi de tout ce que tu as.",
      hints: ["L'évent le plus éloigné dort pendant cinq minutes, terne, l'anneau immobile."],
    },
    c9: {
      name: "Fer à cheval",
      brief: "Trois évents puissants à la tête d'une vallée qui contourne une crête et redescend vers toi. Leur vase est déjà en route. Tiens-la loin de l'atterrisseur et bouche les évents.",
      hints: [
        "La vase passe le coude et remonte la vallée jusqu'à toi. Élève une digue en travers de la vallée avec des Niveleuses, ou retiens-la avec des Barrières, des Pompes et des Lances.",
        "Le réseau passe par-dessus la roche de la crête. Depuis ses hauteurs, les Lances atteignent les deux bras de la vallée.",
      ],
    },
    c10: {
      name: "Archipel",
      brief: "Tu t'es posé sur une île au milieu d'une mer de vase, et quatre évents sur son fond la font monter sans cesse. Fais passer le réseau d'île en île, repousse la mer au feu autour de chaque évent et bouche-le.",
      hints: [
        "Le réseau porte à six cases par-dessus la mer, et la plupart des détroits sont moins larges. Les Artères franchissent les plus grands.",
        "La mer ne fait qu'un : ce que tu brûles près d'un évent revient de partout ailleurs. Les Lances au sommet des îles dominent toute la mer.",
      ],
    },
  },
  skirmish: { name: "Escarmouche {seed}", brief: "Bouche chaque évent." },
};
