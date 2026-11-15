// Portuguese interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Brazilian Portuguese (pt-BR, the larger gaming audience), kept plain enough that readers in
// Portugal follow it without effort: no slang, no gerund-heavy phrasing where a short verb does.
//
// Glossary (decide once, use everywhere):
//
//   Silt         o lodo                 Vent        a fenda (as fendas)
//   Lode         o veio                 Spitter     o cuspidor
//   Glob         a bolota               Grid        a rede
//   Packet       o pacote               Tile        a casa
//   Baffle field o campo de barreira
//   Structure    a estrutura            Energy      a energia
//   Lander       o módulo de pouso      Pylon       a torre
//   Trunk        o tronco               Tap         o extrator
//   Cell         a bateria              Pump        a bomba
//   Lance        a lança                Lobber      o morteiro
//   Baffle       a barreira             Interceptor o interceptor
//   Grader       a niveladora           Cap         a tampa
//   to cap       tampar                 to seal     selar
//   to dismantle desmontar              Mark ground marcar terreno
//   Campaign     a campanha             Skirmish    a escaramuça
//   Mission      a missão               Seed        a seed
//   Briefing     o briefing             Best (time) o recorde
//
// Style: informal "você", short imperatives ("Construa", "Coloque", "Escolha"). The game's title
// "Ebbline 2" is never translated. Keys follow a Brazilian ABNT2 keyboard: Espaço, Del, Esc, and the
// hyphen for the key right of 0.

import type { Content, Key } from "./en.ts";

export const pt: Record<Key, string> = {
  "meta.description":
    "Ebbline 2: um jogo de defesa contra a maré. O lodo sobe das fendas; construa uma rede, empurre-o de volta e tampe todas.",

  "title.lede": "O lodo está subindo das fendas. Construa uma rede, empurre-o de volta, tampe todas.",
  "title.continue": "Continuar",
  "title.credit": "Um jogo de código aberto sob a licença MIT. Arte feita para este projeto.",
  "menu.campaign": "Campanha",
  "menu.skirmish": "Escaramuça",
  "menu.help": "Como jogar",
  "menu.settings": "Opções",
  "common.back": "Voltar",

  "campaign.locked": "Vença a missão anterior para desbloquear esta.",
  "campaign.best": "Recorde {time}",
  "campaign.next": "Próxima missão",

  "skirmish.seed": "Seed",
  "skirmish.size": "Tamanho do mapa",
  "skirmish.size.small": "Pequeno, duas fendas",
  "skirmish.size.medium": "Médio, três fendas",
  "skirmish.size.large": "Grande, quatro fendas",
  "skirmish.difficulty": "Dificuldade",
  "skirmish.difficulty.easy": "Fácil, sem cuspidores",
  "skirmish.difficulty.normal": "Normal, um cuspidor",
  "skirmish.difficulty.hard": "Difícil, dois cuspidores",
  "skirmish.note":
    "A mesma seed, tamanho e dificuldade sempre geram o mesmo mapa. Quando a partida começa, a barra de endereço guarda um link para ele.",
  "skirmish.start": "Iniciar",

  "settings.language": "Idioma",
  "settings.language.auto": "Automático",
  "settings.volume": "Volume",
  "settings.music": "Som ambiente",
  "settings.edgeScroll": "Mover o mapa quando o ponteiro tocar a borda da tela",
  "settings.reducedMotion": "Reduzir clarões e pulsações",

  "help.intro":
    "O lodo brota das _fendas_ e escorre morro abaixo. Ele desgasta tudo sobre o que se acumula. Perca o módulo de pouso e a missão está perdida. Vença construindo uma *Tampa* em cada fenda.",
  "help.grid.title": "A rede",
  "help.grid.text":
    "A energia sai do módulo de pouso em pacotes e percorre as ligações da rede. Toda estrutura repassa os pacotes e precisa ficar a até seis casas de outra já construída; as torres são o jeito barato de ir mais longe. Enquanto você constrói, ou com uma torre selecionada, a área que a rede pronta alcança fica colorida. Um ponto vermelho marca uma estrutura que a rede não alcança. As torres colhem energia das casas a até três passos que estão no mesmo nível e à vista direta (mostradas como uma área verde); terreno mais alto ou rocha no meio bloqueia isso, e casas cobertas de lodo não rendem nada.",
  "help.cap.title": "Tampar uma fenda",
  "help.cap.text":
    "Uma tampa só pode ser iniciada quando a casa da fenda está quase seca, o que um anel branco indica. Durante a construção ela mantém a fenda fechada, mas a pressão aumenta: se a tampa for perdida, tudo sai de uma vez.",
  "help.structures.title": "Estruturas",
  "help.controls.title": "Controles",
  "help.keys.click": "Clique, toque",
  "help.keys.click.does": "Com uma ferramenta, coloca; sem ela, seleciona",
  "help.keys.drag": "Arrastar",
  "help.keys.drag.does": "Com uma ferramenta, coloca uma fileira ou pinta marcas; sem ela, move o mapa",
  "help.keys.cancel": "Botão direito, Esc",
  "help.keys.cancel.does": "Guarda a ferramenta, cancela a seleção, abre o menu",
  "help.keys.zoom": "Roda do mouse, pinça",
  "help.keys.zoom.does": "Zoom",
  "help.keys.pan": "W A S D, setas",
  "help.keys.pan.does": "Move o mapa",
  "help.keys.slots": "1 a 0, -",
  "help.keys.slots.does": "Escolhe uma estrutura da barra de construção",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Marca terreno para as niveladoras",
  "help.keys.pause": "Espaço",
  "help.keys.pause.does": "Pausa",
  // On an ABNT2 keyboard the bracket keys sit right of P and Ç; comma and full stop do the same.
  "help.keys.speed": ", .",
  "help.keys.speed.does": "Mais lento, mais rápido",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Desliga ou liga a estrutura selecionada",
  "help.keys.dismantle": "Del",
  "help.keys.dismantle.does": "Desmonta a estrutura selecionada e devolve metade do custo",

  "hud.energy.title": "Energia em reserva, e o que entrou e saiu no último segundo",
  "hud.hold": "Resista {time}",
  "hud.capped": "Fendas tampadas {capped} / {vents}",
  "hud.pause": "Pausar",
  "hud.paused": "Pausado",
  "hud.pause.title": "Pausar (Espaço)",
  "hud.menu": "Menu",
  "hud.menu.title": "Menu (Esc)",
  "hud.map": "Visão geral do mapa",

  "build.label": "Construir",
  "build.mark": "Marcar",
  "build.mark.cost": "terreno",
  "build.mark.title": "Marcar terreno para as niveladoras elevarem ou rebaixarem",
  "key.slot11": "-",
  "key.delete": "Del",

  "status.offGrid": "Fora da rede: precisa de uma estrutura a até seis casas",
  "status.building": "Em construção",
  "status.off": "Desligada",
  "status.damaged": "Danificada, em reparo",
  "status.working": "Em funcionamento",

  "info.cost": "{cost} de energia",
  "info.range": "Alcance {range}",
  "info.rangeMin": "Alcance {range}, no mínimo {min}",
  "info.place": "Clique para colocar, arraste para uma fileira. Botão direito ou Esc guarda a ferramenta.",
  "info.health": "Integridade",
  "info.energy": "Energia",
  "info.switchOff": "Desligar",
  "info.switchOn": "Ligar",
  "info.dismantle": "Desmontar",
  "info.notes": "Dicas",
  "info.hide": "Ocultar",

  "grade.title": "Marcar terreno",
  "grade.text":
    "Escolha uma altura alvo e pinte as casas. Uma niveladora a até oito casas faz o trabalho.",
  "grade.erase": "Apagar",

  "pause.title": "Pausado",
  "pause.resume": "Continuar",
  "pause.save": "Salvar",
  "pause.briefing": "Briefing",
  "pause.restart": "Reiniciar missão",
  "pause.quit": "Salvar e sair",

  "briefing.mission": "Missão {number} de {total}",
  "briefing.objective": "Objetivo",
  "briefing.objective.cap.one": "Construa uma tampa na fenda.",
  "briefing.objective.cap.many": "Construa uma tampa em cada uma das {vents} fendas.",
  "briefing.objective.survive": "Mantenha o módulo de pouso de pé por {minutes} minutos, ou tampe todas as fendas antes disso.",
  "briefing.new": "Novo nesta missão",
  "briefing.new.threat": "Nova ameaça",
  "briefing.new.goal": "Novo objetivo",
  "briefing.tip": "Dica",
  "briefing.deploy": "Iniciar",
  "briefing.resume": "Voltar à missão",
  "briefing.spitter.name": "Cuspidor",
  "briefing.spitter.text":
    "Não pode ser destruído. Mais ou menos a cada meio minuto ele lança uma bolota de lodo na sua rede; uma marca mostra onde ela vai cair.",
  "briefing.survive.name": "Resistir",
  "briefing.survive.text":
    "Ela é vencida quando a contagem regressiva no topo termina e o módulo de pouso ainda está de pé. Tampar todas as fendas a encerra antes, com vitória.",

  "tip.pylon":
    "Mantenha a corrente em terreno seco: uma torre perdida para o lodo corta tudo o que era abastecido por ela.",
  "tip.tap":
    "Cada extrator soma 0,6 de energia por segundo à 1 do módulo de pouso, mas só enquanto a rede o alcança.",
  "tip.lance":
    "Ela alcança sete casas e só atinge terreno na mesma altura ou abaixo, então coloque-a na borda acima do lodo, não lá embaixo na bacia.",
  "tip.cap":
    "Ela consome 60 pacotes e só segura a fenda enquanto a rede a alcança: proteja primeiro a linha até a fenda, depois coloque a tampa.",
  "tip.cell":
    "No início a reserva guarda só 30, e o que entra além disso se perde: algumas baterias deixam você poupar para um grande avanço.",
  "tip.lobber":
    "Ele só atira em poças, não em camadas finas, e nunca a menos de três casas: coloque-o atrás da frente e deixe o lodo raso para as lanças.",
  "tip.pump":
    "Ela funciona sem energia, mas rende pouco, e lodo na própria casa a desgasta: mantenha uma lança por perto.",
  "tip.trunk":
    "A ligação rápida de quatorze casas precisa de um tronco em cada ponta; com todo o resto um tronco se liga como uma torre, a até seis casas.",
  "tip.interceptor":
    "Ele alcança nove casas e gasta uma de energia por tiro, três tiros por bolota: coloque-o onde suas estruturas estão mais próximas.",
  "tip.baffle":
    "O campo cobre quatro casas ao redor e cai no instante em que a barreira fica sem energia, então proteja a linha que a abastece.",
  "tip.grader":
    "Cada nível de altura leva um segundo e meio, e nada pode ser nivelado sob uma estrutura: marque seus diques antes de o lodo chegar.",
  "tip.spitter":
    "As bolotas miram a estrutura com mais vizinhas a até cinco casas, então você sabe onde a próxima vai cair: mantenha um interceptor ali.",
  "tip.survive":
    "Gaste na defesa ao redor do módulo de pouso em vez de expandir: as fendas ficam mais fortes a cada minuto, e os últimos minutos são os mais duros.",

  "end.won": "Fendas seladas",
  "end.won.survive.title": "Você resistiu",
  "end.lost": "Módulo perdido",
  "end.won.survive": "Você manteve a posição.",
  "end.won.cap": "O lodo está recuando.",
  "end.lost.text": "O lodo alcançou o módulo de pouso.",
  "end.time": "Tempo",
  "end.newBest": "novo recorde",
  "end.spent": "Energia gasta",
  "end.built": "Estruturas construídas",
  "end.destroyed": "Estruturas perdidas",
  "end.removed": "Lodo removido",
  "end.next": "Próxima: {name}",
  "end.again": "Jogar de novo",
  "end.retry": "Tentar de novo",
  "end.menu": "Menu principal",

  "notice.unreadable": "Não foi possível ler esse jogo salvo.",
  "notice.saved": "Jogo salvo.",
  "notice.noStorage": "Não é possível salvar neste navegador.",

  "place.locked": "Isso não está disponível nesta missão.",
  "place.outside": "Isso está fora do mapa.",
  "place.rock": "Não dá para construir sobre rocha.",
  "place.occupied": "Já tem algo aí.",
  "place.spitter": "Tem um cuspidor aí.",
  "place.needs vent": "Uma tampa só cabe numa fenda aberta.",
  "place.flooded": "Tem lodo demais aí. Queime-o primeiro.",
  "place.vent": "Só uma tampa pode ficar sobre uma fenda.",
  "place.needs lode": "Um extrator só cabe num veio.",
};

export const ptContent: Content = {
  kinds: {
    lander: {
      name: "Módulo de pouso",
      blurb: "Origem da rede. Se ele for perdido, a missão acaba.",
    },
    pylon: { name: "Torre", blurb: "Estende a rede em seis casas e colhe um pouco de energia do terreno plano que enxerga na sua própria altura." },
    trunk: {
      name: "Tronco",
      blurb: "Liga-se a outros troncos a até quatorze casas e dobra a velocidade dos pacotes.",
    },
    tap: { name: "Extrator", blurb: "Tira energia constante de um veio. Só cabe num veio." },
    cell: { name: "Bateria", blurb: "Armazena trinta de energia a mais." },
    pump: {
      name: "Bomba",
      blurb: "Suga o lodo raso por perto e o transforma em um pouco de energia.",
    },
    lance: { name: "Lança", blurb: "Queima o lodo uma casa por vez. Não mira morro acima." },
    lobber: {
      name: "Morteiro",
      blurb: "Lança uma carga lenta no lodo mais fundo ao alcance.",
    },
    baffle: {
      name: "Barreira",
      blurb: "Projeta um campo que o lodo precisa escalar como um muro de dois níveis.",
    },
    interceptor: { name: "Interceptor", blurb: "Derruba bolotas em pleno voo." },
    grader: { name: "Niveladora", blurb: "Eleva ou rebaixa o terreno marcado, um nível por vez." },
    cap: {
      name: "Tampa",
      blurb: "Segura uma fenda seca enquanto é construída e depois a sela para sempre.",
    },
  },
  levels: {
    c1: {
      name: "Pouso",
      brief: "Uma fenda, quinze casas a leste e bem abaixo de você, e a poça dela já está se espalhando. Leve a rede até ela, queime o lodo e tampe-a.",
      hints: [
        "As torres são o jeito barato de estender a rede. Tudo deve ficar a até seis casas de uma estrutura concluída.",
        "As lanças queimam o lodo. Ponha-as em terreno alto: elas não miram morro acima.",
        "Quando a fenda secar entre os pulsos, coloque uma tampa nela e mantenha-a abastecida.",
        "O módulo de pouso gera uma energia por segundo, e aqui não há veios. Uma torre colhe um pouco mais do terreno plano que enxerga na sua própria altura. Não construa mais que o necessário.",
      ],
    },
    c2: {
      name: "Duas frentes",
      brief: "Duas fendas, em lados opostos da sua colina. Explore os veios por energia e guarde-a para as tampas.",
      hints: [
        "Coloque extratores nos veios luminosos perto do módulo de pouso para ganhar energia.",
        "A reserva guarda trinta de energia, meia tampa. Cada bateria acrescenta mais trinta.",
      ],
    },
    c3: {
      name: "Sumidouro",
      brief: "Três fendas jorram em pulsos lentos e pesados, e a bacia lá embaixo enche fundo. Os morteiros alcançam as poças profundas.",
      hints: [
        "Os morteiros ignoram a altura, mas não acertam nada a menos de três casas.",
      ],
    },
    c4: {
      name: "Confins",
      brief: "Três fendas em três direções, a mais próxima a vinte e nove casas. Os troncos levam pacotes rápido por grandes distâncias.",
      hints: [
        "Os troncos se ligam entre si a catorze casas e dobram a velocidade dos pacotes.",
      ],
    },
    c5: {
      name: "Planalto",
      brief: "Quatro fendas cercam o seu planalto, e há só três veios. As bombas sugam o lodo raso para tirar energia.",
      hints: [
        "Uma bomba só alcança lodo a duas casas, então ela precisa ficar na margem, onde o lodo também pode alcançá-la.",
      ],
    },
    c6: {
      name: "Várzea",
      brief: "Você pousou embaixo, na margem de um vale de rio, com quatro fendas ao redor, uma delas bem perto. Aguente dez minutos.",
      hints: [
        "Uma barreira alimentada faz o lodo subir dois níveis a mais em cada casa a até quatro casas dela.",
        "Escolha Marcar, uma altura e pinte casas; uma niveladora a até oito casas as eleva ou rebaixa.",
      ],
    },
    c7: {
      name: "Bombardeio",
      brief: "Três cuspidores lançam lodo contra a sua rede vindo do sul. Os interceptores derrubam as bolotas em pleno voo.",
      hints: [
        "As bolotas miram o seu grupo mais denso. Um interceptor alcança nove casas e precisa de três acertos por bolota.",
      ],
    },
    c8: {
      name: "Divisor de águas",
      brief: "Cinco fendas e três cuspidores em volta do pico. Use tudo o que tem.",
      hints: [],
    },
  },
  skirmish: { name: "Escaramuça {seed}", brief: "Tampe todas as fendas." },
};
