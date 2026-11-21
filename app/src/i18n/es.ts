// Spanish interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         el limo                Vent        la fumarola
//   Lode         la veta                Spitter     el escupidor
//   Glob         el pegote              Grid        la red
//   Packet       el paquete             Tile        la casilla
//   Baffle field el campo de contención
//   Structure    la estructura          Energy      la energía
//   Lander       el módulo              Pylon       el Pilón
//   Trunk        la Troncal             Tap         el Extractor
//   Cell         la Batería             Pump        la Bomba
//   Lance        la Lanza               Lobber      el Mortero
//   Baffle       la Barrera             Interceptor el Interceptor
//   Grader       la Niveladora          Cap         el Tapón
//   to cap       taponar                to seal     sellar
//   to dismantle desmantelar            Mark ground marcar terreno
//   Campaign     la campaña             Skirmish    la escaramuza
//   Mission      la misión              Seed        la semilla
//   Briefing     las instrucciones      Best (time) el récord
//
// Style: informal "tú", short imperatives ("Construye", "Coloca", "Elige"), neutral Spanish
// without regional slang. Structure names are capitalised in running text, as in English. The
// game's title "Ebbline 2" is never translated. Keys follow a Spanish keyboard: Espacio, Supr, and '
// for the key right of 0.

import type { Content, Key } from "./en.ts";

export const es: Record<Key, string> = {
  "meta.description":
    "Ebbline 2: un juego de defensa contra la marea. El limo brota de las fumarolas; construye una red, hazlo retroceder y tapónalas todas.",

  "title.lede": "El limo brota de las fumarolas. Construye una red, hazlo retroceder, tapónalas todas.",
  "title.continue": "Continuar",
  "title.credit": "Un juego de código abierto bajo licencia MIT. Arte creado para este proyecto.",
  "menu.campaign": "Campaña",
  "menu.skirmish": "Escaramuza",
  "menu.help": "Cómo jugar",
  "menu.settings": "Ajustes",
  "common.back": "Atrás",

  "campaign.locked": "Gana la misión anterior para desbloquear esta.",
  "campaign.best": "Récord {time}",
  "campaign.next": "Siguiente misión",

  "skirmish.seed": "Semilla",
  "skirmish.size": "Tamaño del mapa",
  "skirmish.size.small": "Pequeño, dos fumarolas",
  "skirmish.size.medium": "Mediano, tres fumarolas",
  "skirmish.size.large": "Grande, cuatro fumarolas",
  "skirmish.difficulty": "Dificultad",
  "skirmish.difficulty.easy": "Fácil, sin escupidores",
  "skirmish.difficulty.normal": "Normal, un escupidor",
  "skirmish.difficulty.hard": "Difícil, dos escupidores",
  "skirmish.note":
    "La misma semilla, tamaño y dificultad dan siempre el mismo mapa. Cuando empieza la partida, la barra de direcciones contiene un enlace a él.",
  "skirmish.start": "Empezar",

  "settings.language": "Idioma",
  "settings.language.auto": "Automático",
  "settings.volume": "Volumen",
  "settings.music": "Sonido ambiental",
  "settings.edgeScroll": "Desplazar el mapa cuando el puntero toca el borde de la pantalla",
  "settings.reducedMotion": "Reducir destellos y pulsaciones",

  "help.intro":
    "El limo brota de las _fumarolas_ y fluye cuesta abajo. Desgasta todo lo que cubre. Si pierdes el módulo, pierdes la misión. Para ganar, construye un *Tapón* sobre cada fumarola.",
  "help.grid.title": "La red",
  "help.grid.text":
    "La energía sale del módulo en paquetes y viaja por los enlaces de la red. Solo el módulo, los Pilones, las Troncales y los Aceleradores transmiten los paquetes, así que cada estructura debe estar a seis casillas como máximo de uno de ellos ya construido; los Pilones son la forma barata de llegar más lejos. Un punto rojo marca una estructura que la red no alcanza. Los Pilones recogen energía de las casillas a tres pasos o menos que están a su mismo nivel y a la vista directa (se muestran como un área verde); el terreno más alto o la roca de por medio lo bloquea, y las casillas cubiertas de limo no rinden nada.",
  "help.cap.title": "Taponar una fumarola",
  "help.cap.text":
    "Un Tapón solo puede empezarse cuando la casilla de la fumarola está casi seca, lo que indica un anillo blanco. Mientras se construye mantiene la fumarola cerrada, pero la presión aumenta: si se pierde el Tapón, todo sale de golpe.",
  "help.structures.title": "Estructuras",
  "help.controls.title": "Controles",
  "help.keys.click": "Clic, toque",
  "help.keys.click.does": "Colocar con una herramienta; si no, seleccionar",
  "help.keys.drag": "Arrastrar",
  "help.keys.drag.does": "Colocar una fila o pintar marcas con una herramienta; si no, mover el mapa",
  "help.keys.cancel": "Clic derecho, Esc",
  "help.keys.cancel.does": "Guardar la herramienta, deseleccionar, abrir el menú",
  "help.keys.zoom": "Rueda, pellizcar",
  "help.keys.zoom.does": "Zoom",
  "help.keys.pan": "W A S D, flechas",
  "help.keys.pan.does": "Mover el mapa",
  "help.keys.slots": "1 a 0, ', ¡",
  "help.keys.slots.does": "Elegir una estructura de la barra de construcción",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Marcar terreno para las Niveladoras",
  "help.keys.pause": "Espacio",
  "help.keys.pause.does": "Pausa",
  // On a Spanish keyboard the bracket keys are ` and +; comma and full stop do the same.
  "help.keys.speed": ", .",
  "help.keys.speed.does": "Más lento, más rápido",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Apagar o encender la estructura seleccionada",
  "help.keys.dismantle": "Supr",
  "help.keys.dismantle.does": "Desmantelar la estructura seleccionada por la mitad de su coste",
  "help.keys.stats": "T",
  "help.keys.stats.does": "Mostrar las estadísticas",

  "hud.energy.title": "Energía en reserva, y lo que entró y salió en el último segundo",
  "hud.energy.stats": "Haz clic para ver de dónde viene la energía y adónde va.",
  "hud.hold": "Resiste {time}",
  "hud.capped": "Fumarolas taponadas {capped} / {vents}",
  "hud.pause": "Pausa",
  "hud.paused": "En pausa",
  "hud.pause.title": "Pausa (Espacio)",
  "hud.menu": "Menú",
  "hud.menu.title": "Menú (Esc)",
  "hud.map": "Vista del mapa",

  "build.label": "Construir",
  "build.mark": "Marcar",
  "build.mark.cost": "terreno",
  "build.mark.title": "Marcar terreno para que las Niveladoras lo suban o lo bajen",
  "key.slot11": "'",
  "key.slot12": "¡",
  "key.slot13": "ç",
  "key.slot14": "´",
  "key.delete": "Supr",

  "status.offGrid": "Fuera de la red: necesita un Pilón terminado a seis casillas como máximo",
  "status.building": "En construcción",
  "status.off": "Apagada",
  "status.damaged": "Dañada, en reparación",
  "status.working": "En funcionamiento",
  "status.loading": "Cargando el avión",
  "status.inFlight": "Avión de camino al objetivo",
  "status.bombing": "Avión bombardeando",
  "status.returning": "Avión de regreso",
  "status.waitingEnergy": "Esperando energía",

  "info.cost": "{cost} de energía",
  "info.range": "Alcance {range}",
  "info.rangeMin": "Alcance {range}, no a menos de {min}",
  "info.place": "Haz clic para colocar, arrastra para una fila. Clic derecho o Esc para guardarla.",
  "info.health": "Estado",
  "info.energy": "Energía",
  "info.switchOff": "Apagar",
  "info.switchOn": "Encender",
  "info.dismantle": "Desmantelar",
  "info.notes": "Notas",
  "info.hide": "Ocultar",
  "info.details": "Detalles",

  "grade.title": "Marcar terreno",
  "grade.text":
    "Elige una altura objetivo y luego pinta casillas. Una Niveladora a ocho casillas como máximo hace el trabajo.",
  "grade.moving": "Aquí parte del terreno sube y baja, y no se puede marcar: sobre él, el contorno se vuelve rojo.",
  "grade.erase": "Borrar",

  "pause.title": "En pausa",
  "pause.resume": "Reanudar",
  "pause.save": "Guardar",
  "pause.briefing": "Instrucciones",
  "pause.restart": "Reiniciar misión",
  "pause.quit": "Guardar y salir",

  "briefing.mission": "Misión {number} de {total}",
  "briefing.objective": "Objetivo",
  "briefing.objective.cap.one": "Construye un Tapón sobre la fumarola.",
  "briefing.objective.cap.many": "Construye un Tapón sobre cada una de las {vents} fumarolas.",
  "briefing.objective.survive": "Mantén el módulo en pie durante {minutes} minutos, o tapona todas las fumarolas antes.",
  "briefing.new": "Novedades de esta misión",
  "briefing.new.threat": "Nueva amenaza",
  "briefing.new.goal": "Nuevo objetivo",
  "briefing.tip": "Consejo",
  "briefing.deploy": "Desplegar",
  "briefing.resume": "Volver a la misión",
  "briefing.spitter.name": "Escupidor",
  "briefing.spitter.text":
    "No se puede destruir. Más o menos cada medio minuto lanza un pegote de limo contra tu red; un marcador indica dónde caerá.",
  "briefing.survive.name": "Resistir",
  "briefing.survive.text":
    "Se gana cuando la cuenta atrás de arriba llega a cero y el módulo sigue en pie. Taponar todas las fumarolas la termina antes, con victoria.",

  "tip.pylon":
    "Mantén la cadena en terreno seco: un Pilón perdido en el limo deja sin suministro todo lo que dependía de él.",
  "tip.tap":
    "Cada Extractor añade 0,6 de energía por segundo al 1 del módulo, pero solo mientras la red lo alcance.",
  "tip.lance":
    "Alcanza siete casillas y solo da en terreno a su altura o más bajo, así que ponla en el borde sobre el limo, no abajo en la cuenca.",
  "tip.cap":
    "Necesita 60 paquetes y solo retiene la fumarola mientras la red lo alcance: asegura primero la línea hasta la fumarola y luego coloca el Tapón.",
  "tip.cell":
    "Al principio la reserva solo guarda 30 y lo que entre de más se pierde: unas cuantas Baterías te permiten ahorrar para un gran avance.",
  "tip.lobber":
    "Solo dispara a charcos, no a capas finas, y nunca a menos de tres casillas: ponlo detrás del frente y deja lo poco profundo a las Lanzas.",
  "tip.pump":
    "Funciona sin energía pero rinde poco, y el limo sobre su propia casilla la desgasta: ten una Lanza cerca.",
  "tip.trunk":
    "El enlace rápido de catorce casillas necesita una Troncal en cada extremo; con todo lo demás, una Troncal se enlaza como un Pilón, a seis casillas como máximo.",
  "tip.booster":
    "Solo acelera los paquetes que reenvía, no los que lo construyen o lo reparan. Ponlo pronto en una línea larga: cuanto antes se acelera un paquete, más tiempo corre más rápido.",
  "tip.interceptor":
    "Alcanza nueve casillas y gasta una de energía por disparo, tres disparos por pegote: ponlo donde tus estructuras estén más juntas.",
  "tip.baffle":
    "El campo cubre cuatro casillas a su alrededor y cae en cuanto la Barrera se queda sin energía, así que protege la línea que la alimenta.",
  "tip.grader":
    "Cada nivel de altura tarda segundo y medio, y no se puede nivelar bajo una estructura: marca tus diques antes de que llegue el limo.",
  "tip.spitter":
    "Los pegotes apuntan a la estructura con más vecinas a cinco casillas, así que sabes dónde caerá el próximo: pon ahí un Interceptor.",
  "tip.survive":
    "Gasta en defensa alrededor del módulo en lugar de expandirte: las fumarolas se refuerzan cada minuto y los últimos son los más duros.",
  "tip.airfield":
    "El avión siempre va a por el peor limo de todo el mapa, esté donde esté tu red. Apaga el Aeródromo para que se quede en casa.",
  "tip.spring":
    "Un Manantial solo ayuda donde su bálsamo puede correr cuesta abajo hacia el limo. Constrúyelo por encima de la orilla, no dentro de ella.",

  "end.won": "Fumarolas selladas",
  "end.won.survive.title": "Resistido",
  "end.lost": "Módulo perdido",
  "end.won.survive": "Has resistido.",
  "end.won.cap": "El limo se retira.",
  "end.lost.text": "El limo alcanzó el módulo.",
  "end.time": "Tiempo",
  "end.newBest": "nuevo récord",
  "end.spent": "Energía gastada",
  "end.built": "Estructuras construidas",
  "end.destroyed": "Estructuras perdidas",
  "end.removed": "Limo eliminado",
  "end.next": "Siguiente: {name}",
  "end.again": "Jugar otra vez",
  "end.retry": "Reintentar",
  "end.menu": "Menú principal",

  "stats.title": "Estadísticas",
  "stats.empty": "Los gráficos se rellenan a medida que avanza la misión.",
  "stats.silt": "Limo",
  "stats.silt.volume": "Limo en el mapa",
  "stats.silt.flooded": "Casillas inundadas",
  "stats.silt.removed": "Limo retirado por segundo",
  "stats.energy": "Energía",
  "stats.energy.flow": "Flujo por segundo",
  "stats.energy.in": "Ingresos",
  "stats.energy.out": "Gastos",
  "stats.energy.bank": "En reserva",
  "stats.energy.stored": "Almacenada",
  "stats.energy.capacity": "Capacidad",
  "stats.vents": "Fumarolas abiertas",
  "stats.structures": "Estructuras",
  "stats.structures.standing": "En pie",
  "stats.structures.lost": "Perdidas hasta ahora",
  "stats.peak": "Pico de limo",
  "stats.peak.at": "en {time}",
  "stats.capped": "Fumarolas taponadas",
  "stats.net": "Energía neta por segundo, de media",
  "stats.energy.sources": "Ingresos por origen",
  "stats.energy.purposes": "Gastos por finalidad",
  "stats.spend.build": "Construcción",
  "stats.spend.repair": "Reparación",
  "stats.spend.supply": "Funcionamiento",
  "stats.now": "Ahora",
  "stats.rate": "{rate}/s",

  "notice.unreadable": "No se pudo leer esa partida guardada.",
  "notice.saved": "Partida guardada.",
  "notice.noStorage": "No se puede guardar en este navegador.",

  "place.locked": "Eso no está disponible en esta misión.",
  "place.outside": "Eso está fuera del mapa.",
  "place.rock": "No se puede construir sobre roca.",
  "place.occupied": "Ahí ya hay algo.",
  "place.spitter": "Ahí hay un escupidor.",
  "place.needs vent": "Un Tapón solo cabe en una fumarola abierta.",
  "place.flooded": "Hay demasiado limo ahí. Quémalo primero.",
  "place.vent": "Sobre una fumarola solo puede haber un Tapón.",
  "place.needs lode": "Un Extractor solo cabe en una veta.",
};

export const esContent: Content = {
  kinds: {
    lander: {
      name: "Módulo",
      blurb: "Origen de la red. Si lo pierdes, se acaba la misión.",
    },
    pylon: { name: "Pilón", blurb: "Amplía la red en seis casillas y recoge algo de energía del terreno llano que ve a su propia altura." },
    trunk: {
      name: "Troncal",
      blurb: "Se enlaza con otras Troncales a catorce casillas y duplica la velocidad de los paquetes.",
    },
    booster: {
      name: "Acelerador",
      blurb: "Retransmite paquetes como un Pilón, y cada paquete que pasa por él viaja después un quinto más rápido. Los Aceleradores se acumulan, pero el mismo Acelerador nunca acelera un paquete dos veces. Además, cada Acelerador en funcionamiento hace todos los paquetes un dos por ciento más rápidos, esté donde esté.",
    },
    tap: { name: "Extractor", blurb: "Extrae energía constante de una veta. Solo cabe en una veta." },
    cell: { name: "Batería", blurb: "Almacena treinta de energía más. Cada Batería también permite al módulo enviar un paquete más a la vez, y aún más cuando la reserva está casi llena." },
    pump: {
      name: "Bomba",
      blurb: "Recoge el limo poco profundo cercano y lo convierte en un poco de energía.",
    },
    lance: { name: "Lanza", blurb: "Quema el limo casilla a casilla. No puede apuntar cuesta arriba." },
    lobber: {
      name: "Mortero",
      blurb: "Lanza una carga lenta contra el limo más profundo a su alcance.",
    },
    baffle: {
      name: "Barrera",
      blurb: "Proyecta un campo que el limo debe superar como un muro de dos niveles.",
    },
    interceptor: { name: "Interceptor", blurb: "Derriba pegotes en vuelo." },
    grader: { name: "Niveladora", blurb: "Sube o baja el terreno marcado, nivel a nivel." },
    cap: {
      name: "Tapón",
      blurb: "Retiene una fumarola seca mientras se construye y después la sella para siempre.",
    },
    airfield: { name: "Aeródromo", blurb: "Carga un avión con treinta de energía. Cuando está lleno, el avión vuela hasta el limo más profundo del mapa, lo bombardea y vuelve para cargar de nuevo." },
    spring: { name: "Manantial", blurb: "Convierte energía en bálsamo, un fluido azul claro que corre cuesta abajo y anula el limo donde ambos se encuentran. Constrúyelo por encima del limo, no en él." },
  },
  levels: {
    c1: {
      name: "Aterrizaje",
      brief: "Una fumarola, quince casillas al este y muy por debajo de ti, cuya charca ya se está extendiendo. Baja la red hasta ella, sécala a fuego y tapónala.",
      hints: [
        "Solo los Pilones extienden la red: todo debe estar a seis casillas como máximo del módulo o de un Pilón terminado.",
        "Las Lanzas queman el limo. Ponlas en terreno alto: no pueden apuntar cuesta arriba.",
        "Cuando la fumarola se seque entre pulsos, coloca un Tapón encima y mantenlo abastecido.",
        "El módulo produce una energía por segundo y aquí no hay vetas. Un Pilón recoge algo más del terreno llano que ve a su propia altura. No construyas más de lo necesario.",
      ],
    },
    c2: {
      name: "Dos frentes",
      brief: "Dos fumarolas, a lados opuestos de tu colina. Aprovecha las vetas para sacar energía y guárdala para los Tapones.",
      hints: [
        "Coloca Extractores en las vetas luminosas cerca del módulo para ganar energía.",
        "La reserva guarda treinta de energía, medio Tapón. Cada Batería añade treinta más.",
        "La fumarola lejana duerme durante el primer medio minuto, apagada y con el anillo quieto. Cuando despierta, es la más fuerte de las dos.",
      ],
    },
    c3: {
      name: "Sumidero",
      brief: "Tres fumarolas brotan en pulsos lentos y pesados, y la cuenca de abajo se llena hondo. Los Morteros alcanzan las charcas profundas.",
      hints: [
        "Los Morteros ignoran la altura, pero no aciertan a nada a menos de tres casillas.",
      ],
    },
    c4: {
      name: "Confines",
      brief: "Tres fumarolas en tres direcciones, la más cercana a veintinueve casillas. Las Troncales llevan los paquetes rápido por grandes distancias.",
      hints: [
        "Las Troncales se enlazan entre sí a catorce casillas y duplican la velocidad de los paquetes.",
        "Un Acelerador retransmite como un Pilón y hace cada paquete que pasa por él un quinto más rápido. Los paquetes toman el camino más rápido, así que unos cuantos Aceleradores a lo largo de una línea larga atraen el tráfico y lo hacen llegar antes.",
      ],
    },
    c5: {
      name: "Meseta",
      brief: "Cuatro fumarolas rodean tu meseta y solo hay tres vetas. Las Bombas recogen limo somero para sacar energía.",
      hints: [
        "Una Bomba solo alcanza limo a dos casillas, así que debe estar en la orilla, donde el limo también puede alcanzarla.",
      ],
    },
    c6: {
      name: "Llanura aluvial",
      brief: "Aterrizaste abajo, en la orilla de un valle fluvial, con cuatro fumarolas a tu alrededor, una de ellas muy cerca. Aguanta diez minutos.",
      hints: [
        "Una Barrera con energía obliga al limo a subir dos niveles más en cada casilla a cuatro casillas o menos de ella.",
        "Elige Marcar, escoge una altura y pinta casillas; una Niveladora a ocho casillas como máximo las sube o las baja.",
      ],
    },
    c7: {
      name: "Bombardeo",
      brief: "Tres escupidores lanzan limo contra tu red desde el sur. Los Interceptores derriban los pegotes en pleno vuelo.",
      hints: [
        "Los pegotes apuntan a tu grupo más denso. Un Interceptor alcanza nueve casillas y necesita tres impactos por pegote.",
      ],
    },
    c8: {
      name: "Divisoria",
      brief: "Cinco fumarolas y tres escupidores alrededor del pico. Usa todo lo que tienes.",
      hints: ["La fumarola más lejana duerme durante cinco minutos, apagada y con el anillo quieto."],
    },
    c9: {
      name: "Herradura",
      brief: "Tres fumarolas fuertes en la cabecera de un valle que rodea una cresta y vuelve hasta ti. Su limo ya viene de camino. Mantenlo lejos del módulo y tapona las fumarolas.",
      hints: [
        "El limo rodea la curva y sube por el valle hasta ti. Levanta un dique de lado a lado del valle con Niveladoras, o frénalo con Barreras, Bombas y Lanzas.",
        "La red llega por encima de la roca de la cresta. Desde su terreno alto, las Lanzas alcanzan los dos brazos del valle.",
      ],
    },
    c10: {
      name: "Archipiélago",
      brief: "Has aterrizado en una isla en medio de un mar de limo, y cuatro fumarolas en su fondo lo hacen subir sin parar. Lleva la red de isla en isla, haz retroceder el mar a fuego en torno a cada fumarola y tapónala.",
      hints: [
        "La red alcanza seis casillas por encima del mar, y casi todos los estrechos son más angostos. Las Troncales cruzan los anchos.",
        "El mar es uno solo: lo que quemas junto a una fumarola se vuelve a llenar desde todas partes. Las Lanzas en lo alto de las islas lo dominan entero.",
        "El avión de un Aeródromo alcanza todo el mapa: cada vez que se carga, bombardea la parte más profunda del mar.",
      ],
    },
    c11: {
      name: "Terrazas móviles",
      brief: "El terreno se alza por terrazas alrededor de la zona de aterrizaje y desvía el limo. Avanza desde el anillo estable junto al módulo y sella los respiraderos.",
      hints: [
        "La meseta de aterrizaje se eleva en bloque. Las niveladoras pueden trabajar en el anillo estable que la rodea.",
        "Tras cada cambio, fíjate por dónde corre el limo antes de construir en las terrazas exteriores.",
      ],
    },
    c12: {
      name: "Bajos móviles",
      brief: "El limo ya rodea la curva hacia tu promontorio. Extiende la red de isla en isla y sella los respiraderos aguas arriba.",
      hints: [
        "El promontorio y las cimas de las islas ofrecen terreno firme para relés y armas.",
        "Dos bajos suben y bajan en momentos distintos. Observa qué canales toma el limo.",
      ],
    },
    c13: {
      name: "Atlántida",
      brief: "Has aterrizado en la cima de una gran isla, y la isla se hunde. Cuatro fumarolas del lecho marino hacen subir el mar mientras la tierra se hunde. Séllalas antes de que el limo se cierre sobre tu módulo.",
      hints: [
        "La isla se hunde un nivel cada vez, un octavo tras otro, todo alrededor. La orilla se hunde primero, la cima la última.",
        "Las niveladoras pueden volver a elevar el terreno hundido, y un borde elevado contiene el mar durante un tiempo. Pero sigue hundiéndose con el resto.",
        "Lo que construyas abajo pronto estará en el limo. Pon lanzas y relés en terreno alto y avanza pronto hacia los respiraderos.",
      ],
    },
    c14: {
      name: "Dique",
      brief: "Has aterrizado en una cuenca ancha y baja. Un dique estrecho contiene un mar de limo lleno hasta el borde, y las cuatro fumarolas de fuera lo hacen subir. Donde el dique es más bajo ya se desborda. Defiende el muro y sella las fumarolas al otro lado.",
      hints: [
        "Aquí el terreno alto es el dique: las lanzas en su cresta dominan el mar de fuera y la cuenca de dentro.",
        "Tres brechas del dique están a la altura del mar. Todo lo que añaden las fumarolas se derrama por ellas hacia la cuenca. Las niveladoras pueden elevarlas.",
        "La cuenca se llena desde las brechas hacia tu módulo. Quema lo que entra antes de que se extienda.",
      ],
    },
    c15: {
      name: "Ladera",
      brief: "Has bajado cerca de la cima de una larga ladera. Debajo de ti, un ancho mar de limo ha inundado las tierras bajas y sube hacia el módulo. Los Manantiales producen bálsamo, que corre cuesta abajo y anula el limo donde lo encuentra. Constrúyelos en la ladera, deja que el bálsamo corra hasta el mar y sella las fumarolas del fondo.",
      hints: [
        "El bálsamo fluye como el limo. Un Manantial justo encima de la orilla lo vierte directo al mar; uno en una hondonada solo llena la hondonada.",
        "Las barrancas llevan el bálsamo ladera abajo en corrientes. Pon Manantiales en sus cabeceras.",
        "El bálsamo se disipa cuando está quieto. Mantén los Manantiales en marcha y empuja la orilla ladera abajo hasta que las fumarolas estén lo bastante secas para sellarlas.",
      ],
    },
  },
  skirmish: { name: "Escaramuza {seed}", brief: "Tapona cada fumarola." },
};
