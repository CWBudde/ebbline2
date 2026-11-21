// Polish interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         muł                    Vent        komin (kominy)
//   Lode         żyła                   Spitter     pluwacz
//   Glob         bryła                  Grid        sieć
//   Packet       pakiet                 Tile        pole
//   Baffle field bariera
//   Structure    budowla                Energy      energia
//   Lander       lądownik               Pylon       pylon (pylony)
//   Trunk        magistrala             Tap         odwiert
//   Cell         ogniwo                 Pump        pompa
//   Lance        lanca                  Lobber      miotacz
//   Baffle       zapora                 Interceptor przechwytywacz
//   Grader       równiarka              Cap         pokrywa
//   to cap       zamknąć (pokrywą)      to seal     zapieczętować
//   to dismantle rozebrać               Mark ground oznaczyć teren
//   Campaign     kampania               Skirmish    potyczka
//   Mission      misja                  Seed        ziarno
//   Briefing     odprawa                Best (time) rekord
//
// Style: informal "ty", short imperatives ("Zbuduj", "Postaw", "Wybierz"). The game's title
// "Ebbline 2" is never translated. Counted nouns after a placeholder use forms that read correctly for
// any number (the genitive "energii", the abbreviation "min"). Keys follow the Polish programmer's
// layout, which is the US one: Spacja, Delete, Esc, and - for the key right of 0.

import type { Content, Key } from "./en.ts";

export const pl: Record<Key, string> = {
  "meta.description":
    "Ebbline 2: gra obronna przeciw przypływowi. Z kominów wydobywa się muł; zbuduj sieć, odepchnij go i zamknij wszystkie kominy.",

  "title.lede": "Z kominów wydobywa się muł. Zbuduj sieć, odepchnij go i zamknij je wszystkie.",
  "title.continue": "Kontynuuj",
  "title.credit": "Gra open source na licencji MIT. Grafika stworzona specjalnie dla tego projektu.",
  "menu.campaign": "Kampania",
  "menu.skirmish": "Potyczka",
  "menu.help": "Jak grać",
  "menu.settings": "Ustawienia",
  "common.back": "Wstecz",

  "campaign.locked": "Wygraj poprzednią misję, aby odblokować tę.",
  "campaign.best": "Rekord {time}",
  "campaign.next": "Następna misja",

  "skirmish.seed": "Ziarno",
  "skirmish.size": "Rozmiar mapy",
  "skirmish.size.small": "Mała, dwa kominy",
  "skirmish.size.medium": "Średnia, trzy kominy",
  "skirmish.size.large": "Duża, cztery kominy",
  "skirmish.difficulty": "Trudność",
  "skirmish.difficulty.easy": "Łatwy, bez pluwaczy",
  "skirmish.difficulty.normal": "Normalny, jeden pluwacz",
  "skirmish.difficulty.hard": "Trudny, dwa pluwacze",
  "skirmish.note":
    "To samo ziarno, rozmiar i poziom trudności zawsze dają tę samą mapę. Gdy gra się zacznie, link do niej pojawi się w pasku adresu.",
  "skirmish.start": "Start",

  "settings.language": "Język",
  "settings.language.auto": "Automatycznie",
  "settings.volume": "Głośność",
  "settings.music": "Dźwięk tła",
  "settings.edgeScroll": "Przewijaj mapę, gdy wskaźnik dotknie krawędzi ekranu",
  "settings.reducedMotion": "Ogranicz błyski i pulsowanie",

  "help.intro":
    "Muł wypływa z _kominów_ i spływa w dół. Niszczy wszystko, na czym się znajdzie. Stracisz lądownik, przegrasz misję. Wygrywasz, budując *Pokrywę* na każdym kominie.",
  "help.grid.title": "Sieć",
  "help.grid.text":
    "Energia opuszcza lądownik w pakietach i wędruje połączeniami sieci. Pakiety przekazują dalej tylko lądownik, pylony, magistrale i przyspieszacze, więc każda budowla musi stać najwyżej sześć pól od jednego z nich, już zbudowanego; pylony to tani sposób, by sięgnąć dalej. Czerwona kropka oznacza budowlę, do której sieć nie sięga. Pylony zbierają energię z pól oddalonych najwyżej o trzy kroki, leżących na ich własnym poziomie i widocznych bezpośrednio (pokazane jako zielony obszar); wyższy teren lub skała pomiędzy blokuje zbieranie, a pola pokryte mułem nic nie dają.",
  "help.cap.title": "Zamykanie komina",
  "help.cap.text":
    "Pokrywę można zacząć dopiero, gdy pole komina jest prawie suche; pokazuje to biały pierścień. W trakcie budowy trzyma komin zamknięty, ale ciśnienie rośnie: jeśli pokrywa zostanie zniszczona, wszystko wybucha naraz.",
  "help.structures.title": "Budowle",
  "help.controls.title": "Sterowanie",
  "help.keys.click": "Klik, dotyk",
  "help.keys.click.does": "Z narzędziem postaw, w przeciwnym razie zaznacz",
  "help.keys.drag": "Przeciągnij",
  "help.keys.drag.does": "Z narzędziem postaw rząd lub maluj oznaczenia, w przeciwnym razie przesuń mapę",
  "help.keys.cancel": "Prawy klik, Esc",
  "help.keys.cancel.does": "Odłóż narzędzie, odznacz, otwórz menu",
  "help.keys.zoom": "Kółko, uszczypnięcie",
  "help.keys.zoom.does": "Powiększ",
  "help.keys.pan": "W A S D, strzałki",
  "help.keys.pan.does": "Przesuń mapę",
  "help.keys.slots": "1 do 0, -, =",
  "help.keys.slots.does": "Wybierz budowlę z paska budowy",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Oznacz teren dla równiarek",
  "help.keys.pause": "Spacja",
  "help.keys.pause.does": "Pauza",
  "help.keys.speed": "[ ]",
  "help.keys.speed.does": "Wolniej, szybciej",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Wyłącz lub włącz wybraną budowlę",
  "help.keys.dismantle": "Delete",
  "help.keys.dismantle.does": "Rozbierz wybraną budowlę i odzyskaj połowę kosztu",
  "help.keys.stats": "T",
  "help.keys.stats.does": "Pokaż statystyki",

  "hud.energy.title": "Energia w zapasie oraz przychód i zużycie w ostatniej sekundzie",
  "hud.energy.stats": "Kliknij, aby zobaczyć, skąd bierze się energia i dokąd trafia.",
  "hud.hold": "Wytrzymaj {time}",
  "hud.capped": "Zamknięte kominy {capped} / {vents}",
  "hud.pause": "Pauza",
  "hud.paused": "Wstrzymano",
  "hud.pause.title": "Pauza (Spacja)",
  "hud.menu": "Menu",
  "hud.menu.title": "Menu (Esc)",
  "hud.map": "Podgląd mapy",

  "build.label": "Budowa",
  "build.mark": "Oznacz",
  "build.mark.cost": "teren",
  "build.mark.title": "Oznacz teren, który równiarki mają podnieść lub obniżyć",
  "key.slot11": "-",
  "key.slot12": "=",
  "key.slot13": "\\",
  "key.delete": "Del",

  "status.offGrid": "Poza siecią: potrzebny zbudowany pylon w odległości najwyżej sześciu pól",
  "status.building": "W budowie",
  "status.off": "Wyłączona",
  "status.damaged": "Uszkodzona, w naprawie",
  "status.working": "Działa",
  "status.loading": "Ładowanie samolotu",
  "status.inFlight": "Samolot leci do celu",
  "status.bombing": "Samolot bombarduje",
  "status.returning": "Samolot wraca",

  "info.cost": "{cost} energii",
  "info.range": "Zasięg {range}",
  "info.rangeMin": "Zasięg {range}, nie bliżej niż {min}",
  "info.place": "Kliknij, aby postawić, przeciągnij, by postawić rząd. Prawy klik lub Esc odkłada narzędzie.",
  "info.health": "Stan",
  "info.energy": "Energia",
  "info.switchOff": "Wyłącz",
  "info.switchOn": "Włącz",
  "info.dismantle": "Rozbierz",
  "info.notes": "Wskazówki",
  "info.hide": "Ukryj",
  "info.details": "Szczegóły",

  "grade.title": "Oznacz teren",
  "grade.text": "Wybierz docelową wysokość, potem maluj pola. Równiarka w odległości najwyżej ośmiu pól wykona pracę.",
  "grade.moving": "Część terenu wznosi się tu i opada, więc nie da się jej oznaczyć: nad nią obrys robi się czerwony.",
  "grade.erase": "Wymaż",

  "pause.title": "Wstrzymano",
  "pause.resume": "Wznów",
  "pause.save": "Zapisz",
  "pause.briefing": "Odprawa",
  "pause.restart": "Restartuj misję",
  "pause.quit": "Zapisz i wyjdź",

  "briefing.mission": "Misja {number} z {total}",
  "briefing.objective": "Cel",
  "briefing.objective.cap.one": "Zbuduj pokrywę na kominie.",
  "briefing.objective.cap.many": "Zbuduj pokrywę na każdym z {vents} kominów.",
  "briefing.objective.survive": "Utrzymaj lądownik przez {minutes} min albo wcześniej zamknij każdy komin.",
  "briefing.new": "Nowość w tej misji",
  "briefing.new.threat": "Nowe zagrożenie",
  "briefing.new.goal": "Nowy cel",
  "briefing.tip": "Wskazówka",
  "briefing.deploy": "Do akcji",
  "briefing.resume": "Wróć do misji",
  "briefing.spitter.name": "Pluwacz",
  "briefing.spitter.text":
    "Nie da się go zniszczyć. Mniej więcej co pół minuty ciska bryłę mułu w twoją sieć; znacznik pokazuje, gdzie spadnie.",
  "briefing.survive.name": "Wytrwaj",
  "briefing.survive.text":
    "Wygrywasz, gdy odliczanie u góry dobiegnie końca, a lądownik wciąż stoi. Zamknięcie każdego komina kończy misję wcześniej, zwycięstwem.",

  "tip.pylon":
    "Prowadź łańcuch po suchym terenie: pylon stracony w mule odcina wszystko, co było przez niego zasilane.",
  "tip.tap":
    "Każdy odwiert dodaje 0,6 energii na sekundę do 1 z lądownika, ale tylko dopóki sięga do niego sieć.",
  "tip.lance":
    "Sięga siedem pól i trafia tylko teren na swojej wysokości lub niżej, więc stawiaj ją na krawędzi nad mułem, a nie w dole niecki.",
  "tip.cap":
    "Potrzebuje 60 pakietów i trzyma komin tylko, dopóki sięga do niej sieć: najpierw zabezpiecz linię do komina, potem postaw pokrywę.",
  "tip.cell":
    "Zapas mieści na początku tylko 30, a nadwyżka przepada: kilka ogniw pozwoli ci odłożyć energię na duże natarcie.",
  "tip.lobber":
    "Strzela tylko w rozlewiska, nie w cienkie warstwy, i nigdy bliżej niż na trzy pola: postaw go za linią frontu, a płyciznę zostaw lancom.",
  "tip.pump":
    "Działa bez energii, ale zarabia niewiele, a muł na jej własnym polu ją niszczy: trzymaj w pobliżu lancę.",
  "tip.trunk":
    "Szybkie połączenie na czternaście pól wymaga magistrali na obu końcach; z resztą magistrala łączy się jak pylon, na sześć pól.",
  "tip.booster":
    "Przyspiesza tylko pakiety, które przekazuje dalej, a nie te, które go budują lub naprawiają. Postaw go wcześnie na długiej linii: im wcześniej pakiet zostanie przyspieszony, tym dłużej jedzie szybciej.",
  "tip.interceptor":
    "Sięga dziewięć pól i zużywa jedną energię na strzał, trzy strzały na bryłę: stawiaj go tam, gdzie budowle stoją najgęściej.",
  "tip.baffle":
    "Bariera sięga cztery pola wokół i znika w chwili, gdy zaporze zabraknie energii, więc chroń linię, która ją zasila.",
  "tip.grader":
    "Każdy stopień wysokości trwa półtorej sekundy, a pod budowlami niczego nie da się wyrównać: oznacz wały, zanim dotrze muł.",
  "tip.spitter":
    "Bryły celują w budowlę, wokół której w odległości najwyżej pięciu pól stoi najwięcej innych, więc wiesz, gdzie spadnie następna: postaw tam przechwytywacz.",
  "tip.survive":
    "Wydawaj na obronę wokół lądownika, a nie na zasięg: kominy z każdą minutą są silniejsze, więc ostatnie minuty są najtrudniejsze.",
  "tip.airfield":
    "Samolot zawsze leci na najgorszy muł na całej mapie, niezależnie od tego, dokąd sięga twoja sieć. Wyłącz lotnisko, żeby został w domu.",

  "end.won": "Kominy zapieczętowane",
  "end.won.survive.title": "Obrona utrzymana",
  "end.lost": "Lądownik stracony",
  "end.won.survive": "Pozycja utrzymana.",
  "end.won.cap": "Muł się cofa.",
  "end.lost.text": "Muł dotarł do lądownika.",
  "end.time": "Czas",
  "end.newBest": "nowy rekord",
  "end.spent": "Zużyta energia",
  "end.built": "Zbudowane budowle",
  "end.destroyed": "Stracone budowle",
  "end.removed": "Usunięty muł",
  "end.next": "Dalej: {name}",
  "end.again": "Zagraj ponownie",
  "end.retry": "Spróbuj ponownie",
  "end.menu": "Menu główne",

  "stats.title": "Statystyki",
  "stats.empty": "Wykresy wypełniają się w trakcie misji.",
  "stats.silt": "Muł",
  "stats.silt.volume": "Muł na mapie",
  "stats.silt.flooded": "Zalane pola",
  "stats.silt.removed": "Muł usunięty na sekundę",
  "stats.energy": "Energia",
  "stats.energy.flow": "Przepływ na sekundę",
  "stats.energy.in": "Przychód",
  "stats.energy.out": "Wydatki",
  "stats.energy.bank": "W zapasie",
  "stats.energy.stored": "Zmagazynowana",
  "stats.energy.capacity": "Pojemność",
  "stats.vents": "Otwarte kominy",
  "stats.structures": "Budowle",
  "stats.structures.standing": "Stojące",
  "stats.structures.lost": "Dotąd utracone",
  "stats.peak": "Szczyt mułu",
  "stats.peak.at": "o {time}",
  "stats.capped": "Zamknięte kominy",
  "stats.net": "Energia netto na sekundę, średnio",
  "stats.energy.sources": "Przychód wg źródeł",
  "stats.energy.purposes": "Wydatki wg celu",
  "stats.spend.build": "Budowa",
  "stats.spend.repair": "Naprawa",
  "stats.spend.supply": "Działanie",
  "stats.now": "Teraz",
  "stats.rate": "{rate}/s",

  "notice.unreadable": "Nie udało się odczytać tego zapisu.",
  "notice.saved": "Gra zapisana.",
  "notice.noStorage": "Zapisywanie nie jest dostępne w tej przeglądarce.",

  "place.locked": "To nie jest dostępne w tej misji.",
  "place.outside": "To jest poza mapą.",
  "place.rock": "Na skale nie da się nic zbudować.",
  "place.occupied": "Coś już tam stoi.",
  "place.spitter": "Tam siedzi pluwacz.",
  "place.needs vent": "Pokrywa pasuje tylko na otwarty komin.",
  "place.flooded": "Za dużo tam mułu. Najpierw go wypal.",
  "place.vent": "Na kominie może stać tylko pokrywa.",
  "place.needs lode": "Odwiert pasuje tylko na żyłę.",
};

export const plContent: Content = {
  kinds: {
    lander: {
      name: "Lądownik",
      blurb: "Źródło sieci. Jeśli go stracisz, misja jest skończona.",
    },
    pylon: { name: "Pylon", blurb: "Poszerza sieć o sześć pól i zbiera trochę energii z równego terenu, który widzi na własnej wysokości." },
    trunk: {
      name: "Magistrala",
      blurb: "Łączy się z innymi magistralami na czternaście pól i podwaja prędkość pakietów.",
    },
    booster: {
      name: "Przyspieszacz",
      blurb: "Przekazuje pakiety jak pylon, a każdy pakiet, który przez niego przejdzie, porusza się odtąd o jedną piątą szybciej. Przyspieszacze się sumują, ale ten sam przyspieszacz nigdy nie przyspiesza pakietu dwa razy. Każdy działający przyspieszacz przyspiesza ponadto wszystkie pakiety o dwa procent, gdziekolwiek stoi.",
    },
    tap: { name: "Odwiert", blurb: "Stale czerpie energię z żyły. Pasuje tylko na żyłę." },
    cell: { name: "Ogniwo", blurb: "Mieści trzydzieści dodatkowych jednostek energii." },
    pump: {
      name: "Pompa",
      blurb: "Odsysa płytki muł w pobliżu i zamienia go w odrobinę energii.",
    },
    lance: { name: "Lanca", blurb: "Wypala muł pole po polu. Nie może celować pod górę." },
    lobber: {
      name: "Miotacz",
      blurb: "Ciska powolny ładunek w najgłębszy muł w zasięgu.",
    },
    baffle: {
      name: "Zapora",
      blurb: "Wytwarza barierę, na którą muł musi się wspiąć jak na mur wysoki na dwa stopnie.",
    },
    interceptor: { name: "Przechwytywacz", blurb: "Zestrzeliwuje bryły w locie." },
    grader: { name: "Równiarka", blurb: "Podnosi lub obniża oznaczony teren, stopień po stopniu." },
    cap: {
      name: "Pokrywa",
      blurb: "Trzyma suchy komin zamknięty w trakcie budowy, a potem pieczętuje go na dobre.",
    },
    airfield: { name: "Lotnisko", blurb: "Ładuje samolot trzydziestoma jednostkami energii. Gdy jest pełny, samolot leci do najgłębszego mułu na mapie, bombarduje go i wraca, by załadować się ponownie." },
  },
  levels: {
    c1: {
      name: "Lądowanie",
      brief: "Jeden komin, piętnaście pól na wschód i daleko w dole, a jego kałuża już się rozlewa. Poprowadź sieć w dół, wypal go do sucha i zamknij pokrywą.",
      hints: [
        "Tylko pylony rozszerzają sieć: wszystko musi stać najwyżej sześć pól od lądownika lub ukończonego pylonu.",
        "Lance wypalają muł. Stawiaj je na wzniesieniach: nie mogą celować pod górę.",
        "Gdy komin wysycha między rzutami, postaw na nim pokrywę i dbaj o jej zasilanie.",
        "Lądownik daje jedną energię na sekundę, a żył tu nie ma. Pylon zbiera trochę więcej z równego terenu, który widzi na własnej wysokości. Nie buduj więcej, niż trzeba.",
      ],
    },
    c2: {
      name: "Dwa fronty",
      brief: "Dwa kominy, po przeciwnych stronach twojego wzgórza. Czerp z żył energię i odkładaj ją na pokrywy.",
      hints: [
        "Postaw odwierty na jasnych żyłach przy lądowniku, by zdobywać energię.",
        "Zapas mieści trzydzieści energii, pół pokrywy. Każde ogniwo dodaje kolejne trzydzieści.",
        "Dalszy komin śpi przez pierwsze pół minuty, matowy, z nieruchomym pierścieniem. Po przebudzeniu to silniejszy z dwóch.",
      ],
    },
    c3: {
      name: "Studnia",
      brief: "Trzy kominy tryskają wolnymi, ciężkimi rzutami, a niecka poniżej wypełnia się głęboko. Miotacze sięgają głębokich kałuż.",
      hints: [
        "Miotacze ignorują wysokość, ale nie trafią niczego bliżej niż trzy pola.",
      ],
    },
    c4: {
      name: "Dalekie krańce",
      brief: "Trzy kominy w trzech kierunkach, najbliższy dwadzieścia dziewięć pól stąd. Magistrale szybko niosą pakiety przez duże odstępy.",
      hints: [
        "Magistrale łączą się ze sobą na czternaście pól i podwajają prędkość pakietów.",
        "Przyspieszacz przekazuje pakiety jak pylon i przyspiesza każdy z nich o jedną piątą. Pakiety wybierają najszybszą drogę, więc kilka przyspieszaczy na długiej linii ściąga ruch i szybciej dostarcza go na miejsce.",
      ],
    },
    c5: {
      name: "Wyżyna",
      brief: "Cztery kominy otaczają twój płaskowyż, a żyły są tylko trzy. Pompy zbierają płytki muł na energię.",
      hints: [
        "Pompa sięga tylko mułu w odległości dwóch pól, więc musi stać na brzegu, gdzie muł dosięgnie też jej.",
      ],
    },
    c6: {
      name: "Równina zalewowa",
      brief: "Lądujesz nisko, na brzegu doliny rzeki, a wokół ciebie stoją cztery kominy, jeden całkiem blisko. Wytrzymaj dziesięć minut.",
      hints: [
        "Zasilana zapora każe mułowi wspinać się o dwa stopnie wyżej na każdym polu w odległości czterech pól od niej.",
        "Wybierz Oznacz, wysokość i maluj pola; równiarka w odległości ośmiu pól je podnosi lub obniża.",
      ],
    },
    c7: {
      name: "Ostrzał",
      brief: "Trzy pluwacze ciskają muł w twoją sieć z południa. Przechwytywacze zestrzeliwują bryły w locie.",
      hints: [
        "Bryły celują w twoje najgęstsze skupisko. Przechwytywacz sięga dziewięciu pól i potrzebuje trzech trafień na bryłę.",
      ],
    },
    c8: {
      name: "Dział wodny",
      brief: "Pięć kominów i trzy pluwacze dookoła szczytu. Użyj wszystkiego, co masz.",
      hints: ["Najdalszy komin śpi przez pięć minut, matowy, z nieruchomym pierścieniem."],
    },
    c9: {
      name: "Podkowa",
      brief: "Trzy silne kominy u wylotu doliny, która zakręca wokół grani i wraca do ciebie. Ich muł już tu płynie. Nie dopuść go do lądownika i zamknij kominy.",
      hints: [
        "Muł okrąża zakręt i podchodzi doliną pod ciebie. Usyp równiarkami wał w poprzek doliny albo powstrzymaj go zaporami, pompami i lancami.",
        "Sieć sięga ponad skałą na grani. Z jej wzniesień lance dosięgają obu ramion doliny.",
      ],
    },
    c10: {
      name: "Archipelag",
      brief: "Lądownik stoi na wyspie pośród morza mułu, a cztery kominy na dnie wciąż je podnoszą. Przenoś sieć z wyspy na wyspę, wypalaj morze wokół każdego komina i zamknij go pokrywą.",
      hints: [
        "Sieć sięga sześć pól ponad morzem, a większość cieśnin jest węższa. Magistrale przeskakują nad szerokimi.",
        "Morze jest jedno: to, co wypalisz przy kominie, napływa z powrotem zewsząd. Lance na szczytach wysp widzą pod sobą całe morze.",
        "Samolot z lotniska sięga całej mapy: po każdym załadowaniu bombarduje najgłębszą część morza.",
      ],
    },
    c11: {
      name: "Ruchome tarasy",
      brief: "Teren wokół lądowiska podnosi się tarasami i zmienia bieg mułu. Wykorzystaj stabilny pierścień przy lądowniku, by dotrzeć do ujść i je zamknąć.",
      hints: [
        "Płaskowyż pod lądownikiem podnosi się w całości. Równiarki mogą pracować na otaczającym go stabilnym pierścieniu.",
        "Po każdej zmianie sprawdź, dokąd płynie muł, zanim zaczniesz budować na zewnętrznych tarasach.",
      ],
    },
    c12: {
      name: "Ruchome mielizny",
      brief: "Muł płynie już wokół zakrętu w stronę twojego cypla. Poprowadź sieć przez wyspy i zamknij ujścia w górze kanału.",
      hints: [
        "Cypel i wierzchołki wysp dają stabilne podłoże pod przekaźniki i broń.",
        "Dwie mielizny wznoszą się i opadają w różnym czasie. Obserwuj, którymi odnogami płynie muł.",
      ],
    },
  },
  skirmish: { name: "Potyczka {seed}", brief: "Zamknij każdy komin." },
};
