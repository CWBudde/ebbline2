// Turkish interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         balçık                 Vent        baca (bacalar)
//   Lode         damar                  Spitter     püskürtücü
//   Glob         topak                  Grid        şebeke
//   Packet       paket                  Tile        karo
//   Baffle field bariyer alanı
//   Structure    yapı                   Energy      enerji
//   Lander       iniş aracı             Pylon       Direk
//   Trunk        Ana Hat                Booster     Hızlandırıcı
//   Tap          Sondaj                 Cell        Batarya
//   Pump         Pompa                  Lance       Mızrak
//   Lobber       Havan                  Baffle      Bariyer
//   Interceptor  Önleyici               Grader      Greyder
//   Cap          Kapak
//   to cap       kapatmak               to seal     mühürlemek
//   to dismantle sökmek                 Mark ground zemini işaretlemek
//   Campaign     Kampanya               Skirmish    Çatışma
//   Mission      görev                  Seed        tohum
//   Briefing     brifing                Best (time) en iyi
//
// Style: informal "sen", short imperatives ("Kur", "Yerleştir", "Seç"), no "siz". Structure names
// are capitalised as in English. The game's title "Ebbline 2" is never translated. Keys follow a
// Turkish Q keyboard: Boşluk, * and - for the two keys right of 0, Ğ and Ü where a US keyboard has
// the brackets.

import type { Content, Key } from "./en.ts";

export const tr: Record<Key, string> = {
  "meta.description":
    "Ebbline 2: akışkana karşı bir savunma oyunu. Bacalardan balçık yükseliyor; bir şebeke kur, balçığı geri püskürt ve bacaların hepsini kapat.",

  "title.lede": "Bacalardan balçık yükseliyor. Bir şebeke kur, onu geri püskürt, hepsini kapat.",
  "title.continue": "Devam et",
  "title.credit": "MIT lisanslı, açık kaynaklı bir oyun. Görseller bu proje için hazırlandı.",
  "menu.campaign": "Kampanya",
  "menu.skirmish": "Çatışma",
  "menu.help": "Nasıl oynanır",
  "menu.settings": "Ayarlar",
  "common.back": "Geri",

  "campaign.locked": "Bunu açmak için bir önceki görevi kazan.",
  "campaign.best": "En iyi {time}",
  "campaign.next": "Sonraki görev",

  "skirmish.seed": "Tohum",
  "skirmish.size": "Harita boyutu",
  "skirmish.size.small": "Küçük, iki baca",
  "skirmish.size.medium": "Orta, üç baca",
  "skirmish.size.large": "Büyük, dört baca",
  "skirmish.difficulty": "Zorluk",
  "skirmish.difficulty.easy": "Kolay, püskürtücü yok",
  "skirmish.difficulty.normal": "Normal, bir püskürtücü",
  "skirmish.difficulty.hard": "Zor, iki püskürtücü",
  "skirmish.note":
    "Aynı tohum, boyut ve zorluk her zaman aynı haritayı verir. Oyun başlayınca adres çubuğunda bu haritanın bağlantısı durur.",
  "skirmish.start": "Başla",

  "settings.language": "Dil",
  "settings.language.auto": "Otomatik",
  "settings.volume": "Ses düzeyi",
  "settings.music": "Ortam sesi",
  "settings.edgeScroll": "İmleç ekranın kenarına değince haritayı kaydır",
  "settings.reducedMotion": "Parlamaları ve titreşimleri azalt",

  "help.intro":
    "Balçık _bacalardan_ fışkırır ve yokuş aşağı akar. Üzerinde durduğu her şeyi aşındırır. İniş aracını kaybedersen görev kaybedilir. Her bacanın üzerine bir *Kapak* kurarak kazanırsın.",
  "help.grid.title": "Şebeke",
  "help.grid.text":
    "Enerji iniş aracından paketler hâlinde çıkar ve şebekenin bağlantıları boyunca ilerler. Paketleri yalnızca iniş aracı, Direkler, Ana Hatlar ve Hızlandırıcılar iletir; bu yüzden her yapı, bunlardan tamamlanmış birine en fazla altı karo uzakta durmalıdır. Daha uzağa ulaşmanın ucuz yolu Direklerdir. Kırmızı nokta, şebekenin ulaşmadığı bir yapıyı gösterir. Direkler, üç adım içindeki, kendi seviyelerinde olan ve doğrudan gördükleri karolardan enerji toplar (yeşil alan olarak gösterilir); aradaki daha yüksek zemin ya da kaya bunu engeller, balçıkla kaplı karolar ise hiçbir şey vermez.",
  "help.cap.title": "Bir bacayı kapatmak",
  "help.cap.text":
    "Bir Kapağa ancak baca karosu neredeyse kuruyken başlanabilir; bunu beyaz bir halka gösterir. İnşa sürerken Kapak bacayı kapalı tutar ama basınç birikir: Kapak kaybedilirse hepsi birden dışarı fışkırır.",
  "help.structures.title": "Yapılar",
  "help.controls.title": "Kontroller",
  "help.keys.click": "Tıklama, dokunma",
  "help.keys.click.does": "Araç seçiliyse yerleştir, değilse seç",
  "help.keys.drag": "Sürükleme",
  "help.keys.drag.does": "Araç seçiliyse bir sıra yerleştir ya da işaret boya, değilse haritayı kaydır",
  "help.keys.cancel": "Sağ tık, Esc",
  "help.keys.cancel.does": "Aracı bırak, seçimi kaldır, menüyü aç",
  "help.keys.zoom": "Tekerlek, iki parmak",
  "help.keys.zoom.does": "Yakınlaştır, uzaklaştır",
  "help.keys.pan": "W A S D, ok tuşları",
  "help.keys.pan.does": "Haritayı kaydır",
  "help.keys.slots": "1'den 0'a, *, -",
  "help.keys.slots.does": "İnşa çubuğundan bir yapı seç",
  "help.keys.mark": "G",
  "help.keys.mark.does": "Greyderler için zemini işaretle",
  "help.keys.pause": "Boşluk",
  "help.keys.pause.does": "Duraklat",
  // On a Turkish Q keyboard the bracket keys are Ğ and Ü.
  "help.keys.speed": "Ğ Ü",
  "help.keys.speed.does": "Yavaşlat, hızlandır",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "Seçili yapıyı kapat ya da aç",
  "help.keys.dismantle": "Delete",
  "help.keys.dismantle.does": "Seçili yapıyı maliyetinin yarısı karşılığında sök",
  "help.keys.stats": "T",
  "help.keys.stats.does": "İstatistikleri göster",

  "hud.energy.title": "Depodaki enerji ve son saniyede gelen ve giden miktar",
  "hud.energy.stats": "Enerjinin nereden gelip nereye gittiğini görmek için tıkla.",
  "hud.hold": "Dayan: {time}",
  "hud.capped": "Kapatılan baca {capped} / {vents}",
  "hud.pause": "Duraklat",
  "hud.paused": "Duraklatıldı",
  "hud.pause.title": "Duraklat (Boşluk)",
  "hud.menu": "Menü",
  "hud.menu.title": "Menü (Esc)",
  "hud.map": "Harita görünümü",

  "build.label": "İnşa",
  "build.mark": "İşaretle",
  "build.mark.cost": "zemin",
  "build.mark.title": "Greyderlerin yükselteceği ya da alçaltacağı zemini işaretle",
  "key.slot11": "*",
  "key.slot12": "-",
  "key.slot13": ",",
  "key.delete": "Del",

  "status.offGrid": "Şebeke dışında: altı karo içinde tamamlanmış bir Direk gerekiyor",
  "status.building": "İnşa ediliyor",
  "status.off": "Kapalı",
  "status.damaged": "Hasarlı, onarılıyor",
  "status.working": "Çalışıyor",
  "status.loading": "Uçak yükleniyor",
  "status.inFlight": "Uçak hedefe gidiyor",
  "status.bombing": "Uçak bombalıyor",
  "status.returning": "Uçak geri dönüyor",

  "info.cost": "{cost} enerji",
  "info.range": "Menzil {range}",
  "info.rangeMin": "Menzil {range}, {min} karodan yakına değil",
  "info.place": "Yerleştirmek için tıkla, sıra için sürükle. Sağ tık ya da Esc aracı bırakır.",
  "info.health": "Sağlamlık",
  "info.energy": "Enerji",
  "info.switchOff": "Kapat",
  "info.switchOn": "Aç",
  "info.dismantle": "Sök",
  "info.notes": "Notlar",
  "info.hide": "Gizle",
  "info.details": "Ayrıntılar",

  "grade.title": "Zemini işaretle",
  "grade.text": "Bir hedef yükseklik seç, sonra karoları boya. Sekiz karo içindeki bir Greyder işi yapar.",
  "grade.moving": "Buradaki zeminin bir kısmı yükselip alçalır ve işaretlenemez: üzerinde çerçeve kırmızıya döner.",
  "grade.erase": "Sil",

  "pause.title": "Duraklatıldı",
  "pause.resume": "Devam et",
  "pause.save": "Kaydet",
  "pause.briefing": "Brifing",
  "pause.restart": "Görevi yeniden başlat",
  "pause.quit": "Kaydet ve çık",

  "briefing.mission": "Görev {number} / {total}",
  "briefing.objective": "Hedef",
  "briefing.objective.cap.one": "Bacanın üzerine bir Kapak kur.",
  "briefing.objective.cap.many": "{vents} bacanın her birinin üzerine bir Kapak kur.",
  "briefing.objective.survive": "İniş aracını {minutes} dakika ayakta tut ya da süre dolmadan her bacayı kapat.",
  "briefing.new": "Bu görevde yeni",
  "briefing.new.threat": "Yeni tehdit",
  "briefing.new.goal": "Yeni hedef",
  "briefing.tip": "İpucu",
  "briefing.deploy": "Göreve başla",
  "briefing.resume": "Göreve dön",
  "briefing.spitter.name": "Püskürtücü",
  "briefing.spitter.text":
    "Yok edilemez. Yaklaşık her yarım dakikada şebekene bir balçık topağı fırlatır; nereye düşeceğini bir işaret gösterir.",
  "briefing.survive.name": "Dayan",
  "briefing.survive.text":
    "Üstteki geri sayım bittiğinde iniş aracı hâlâ ayaktaysa görev kazanılır. Her bacayı kapatmak görevi erkenden, zaferle bitirir.",

  "tip.pylon": "Zinciri kuru zeminde tut: balçığa kaptırılan bir Direk, üzerinden beslenen her şeyi şebekeden koparır.",
  "tip.tap": "Her Sondaj, iniş aracının 1 enerjisine saniyede 0,6 enerji ekler, ama yalnızca şebeke ona ulaştığı sürece.",
  "tip.lance":
    "Yedi karo uzağa erişir ve kendi yüksekliğindeki ya da daha alçaktaki zemini vurur; bu yüzden onu aşağıya, havzanın içine değil, balçığın üstündeki kenara koy.",
  "tip.cap":
    "60 paket ister ve bacayı yalnızca şebeke ona ulaştığı sürece kapalı tutar: önce bacaya giden hattı sağlama al, sonra Kapağı yerleştir.",
  "tip.cell":
    "Depo başta yalnızca 30 alır ve bunu aşan gelir boşa gider: birkaç Batarya, büyük bir hamle için biriktirmeni sağlar.",
  "tip.lobber":
    "Yalnızca birikintilere ateş eder, ince tabakalara etmez, üç karodan yakına da asla: onu cephenin gerisine kur, sığ yerleri Mızraklara bırak.",
  "tip.pump":
    "Enerjisiz çalışır ama az kazandırır, kendi karosundaki balçık da onu aşındırır: yakınında bir Mızrak bulundur.",
  "tip.trunk":
    "On dört karoluk hızlı bağlantı için iki uçta da bir Ana Hat gerekir; bir Ana Hat başka her şeye Direk gibi, altı karo içinde bağlanır.",
  "tip.booster":
    "Yalnızca ilettiği paketleri hızlandırır, kendisini inşa eden ya da onaran paketleri değil. Onu uzun bir hattın başına koy: bir paket ne kadar erken hızlanırsa o kadar uzun süre hızlı gider.",
  "tip.interceptor":
    "Dokuz karo uzağa erişir ve atış başına bir enerji harcar, her topak için üç atış: onu yapılarının en sık durduğu yere yerleştir.",
  "tip.baffle":
    "Alan, çevresindeki dört karoyu kaplar ve Bariyerin enerjisi bittiği anda çöker; bu yüzden onu besleyen hattı koru.",
  "tip.grader":
    "Her yükseklik basamağı bir buçuk saniye sürer ve bir yapının altındaki zemin düzenlenemez: setlerini balçık gelmeden işaretle.",
  "tip.spitter":
    "Topaklar, beş karo içinde en çok komşusu olan yapıyı hedef alır; yani bir sonrakinin nereye düşeceğini bilirsin: orada bir Önleyici bulundur.",
  "tip.survive":
    "Enerjini uzağa erişmeye değil, iniş aracının çevresindeki savunmaya harca: bacalar her dakika güçlenir, bu yüzden en zoru son dakikalardır.",
  "tip.airfield":
    "Uçak, şebekeniz nerede olursa olsun, haritanın tamamındaki en kötü balçığa gider. Evde kalması için Hava Alanı'nı kapat.",

  "end.won": "Bacalar mühürlendi",
  "end.won.survive.title": "Dayandın",
  "end.lost": "İniş aracı kaybedildi",
  "end.won.survive": "Hattı tuttun.",
  "end.won.cap": "Balçık çekiliyor.",
  "end.lost.text": "Balçık iniş aracına ulaştı.",
  "end.time": "Süre",
  "end.newBest": "yeni rekor",
  "end.spent": "Harcanan enerji",
  "end.built": "Kurulan yapılar",
  "end.destroyed": "Kaybedilen yapılar",
  "end.removed": "Temizlenen balçık",
  "end.next": "Sıradaki: {name}",
  "end.again": "Tekrar oyna",
  "end.retry": "Tekrar dene",
  "end.menu": "Ana menü",

  "stats.title": "İstatistikler",
  "stats.empty": "Grafikler görev ilerledikçe dolar.",
  "stats.silt": "Balçık",
  "stats.silt.volume": "Haritadaki balçık",
  "stats.silt.flooded": "Balçık altındaki karolar",
  "stats.silt.removed": "Saniyede temizlenen balçık",
  "stats.energy": "Enerji",
  "stats.energy.flow": "Saniyelik akış",
  "stats.energy.in": "Gelir",
  "stats.energy.out": "Gider",
  "stats.energy.bank": "Depoda",
  "stats.energy.stored": "Depolanan",
  "stats.energy.capacity": "Kapasite",
  "stats.vents": "Açık bacalar",
  "stats.structures": "Yapılar",
  "stats.structures.standing": "Ayakta",
  "stats.structures.lost": "Şimdiye dek kaybedilen",
  "stats.peak": "En yüksek balçık",
  "stats.peak.at": "{time} anında",
  "stats.capped": "Kapatılan bacalar",
  "stats.net": "Saniyelik net enerji, ortalama",
  "stats.energy.sources": "Kaynağa göre gelir",
  "stats.energy.purposes": "Amaca göre gider",
  "stats.spend.build": "İnşaat",
  "stats.spend.repair": "Onarım",
  "stats.spend.supply": "İşletme",
  "stats.now": "Şimdi",
  "stats.rate": "{rate}/sn",

  "notice.unreadable": "Bu kayıt okunamadı.",
  "notice.saved": "Oyun kaydedildi.",
  "notice.noStorage": "Bu tarayıcıda kaydetme kullanılamıyor.",

  "place.locked": "Bu, bu görevde kullanılamaz.",
  "place.outside": "Orası haritanın dışında.",
  "place.rock": "Kayanın üzerine hiçbir şey kurulamaz.",
  "place.occupied": "Orada zaten bir şey duruyor.",
  "place.spitter": "Orada bir püskürtücü var.",
  "place.needs vent": "Kapak yalnızca açık bir bacaya oturur.",
  "place.flooded": "Orada çok fazla balçık var. Önce onu yak.",
  "place.vent": "Bir bacanın üzerinde yalnızca Kapak durabilir.",
  "place.needs lode": "Sondaj yalnızca bir damara oturur.",
};

export const trContent: Content = {
  kinds: {
    lander: {
      name: "İniş aracı",
      blurb: "Şebekenin kökü. Onu kaybedersen görev biter.",
    },
    pylon: {
      name: "Direk",
      blurb: "Şebekeyi altı karo uzatır ve kendi yüksekliğinde görebildiği düz zeminden biraz enerji toplar.",
    },
    trunk: {
      name: "Ana Hat",
      blurb: "On dört karo içindeki diğer Ana Hatlara bağlanır ve paketlerin hızını ikiye katlar.",
    },
    booster: {
      name: "Hızlandırıcı",
      blurb: "Paketleri Direk gibi iletir ve ilettiği her paket o andan sonra beşte bir daha hızlı gider. Hızlandırıcıların etkisi birikir, ama her biri bir paketi yalnızca bir kez hızlandırır. Çalışan her Hızlandırıcı ayrıca, nerede durursa dursun, bütün paketleri yüzde iki hızlandırır.",
    },
    tap: { name: "Sondaj", blurb: "Bir damardan sürekli enerji çeker. Yalnızca bir damara oturur." },
    cell: { name: "Batarya", blurb: "Otuz enerji daha depolar." },
    pump: {
      name: "Pompa",
      blurb: "Yakındaki sığ balçığı sıyırır ve onu biraz enerjiye çevirir.",
    },
    lance: { name: "Mızrak", blurb: "Balçığı karo karo yakar. Yokuş yukarı nişan alamaz." },
    lobber: {
      name: "Havan",
      blurb: "Menzilindeki en derin balçığa ağır ağır giden bir mermi fırlatır.",
    },
    baffle: {
      name: "Bariyer",
      blurb: "Balçığın iki basamaklık bir duvar gibi tırmanmak zorunda kaldığı bir alan oluşturur.",
    },
    interceptor: { name: "Önleyici", blurb: "Topakları havadayken vurur." },
    grader: { name: "Greyder", blurb: "İşaretli zemini basamak basamak yükseltir ya da alçaltır." },
    cap: {
      name: "Kapak",
      blurb: "Kuru bir bacayı inşa sürerken kapalı tutar, sonra onu kalıcı olarak mühürler.",
    },
    airfield: { name: "Hava Alanı", blurb: "Bir uçağa otuz enerji yükler. Dolunca uçak haritadaki en derin balçığa uçar, onu bombalar ve yeniden yüklenmek için döner." },
  },
  levels: {
    c1: {
      name: "İniş",
      brief: "Tek bir baca, on beş karo doğuda ve çok aşağında; birikintisi şimdiden yayılıyor. Şebekeyi ona kadar indir, onu kurut ve kapat.",
      hints: [
        "Şebekeyi yalnızca Direkler uzatır: Her şey, iniş aracına ya da tamamlanmış bir Direğe en fazla altı karo uzakta durmalıdır.",
        "Mızraklar balçığı yakar. Onları yüksek zemine koy: yokuş yukarı nişan alamazlar.",
        "Baca iki atım arasında kuruduğunda üzerine bir Kapak yerleştir ve onu beslemeyi sürdür.",
        "İniş aracı saniyede bir enerji üretir ve burada hiç damar yok. Bir Direk, kendi yüksekliğinde görebildiği düz zeminden biraz daha toplar. Gerektiğinden fazlasını kurma.",
      ],
    },
    c2: {
      name: "İki Cephe",
      brief: "Tepenin karşılıklı iki yanında iki baca. Enerji için damarlara Sondaj kur ve enerjiyi Kapaklar için biriktir.",
      hints: [
        "Enerji kazanmak için iniş aracının yakınındaki parlayan damarlara Sondaj yerleştir.",
        "Depo otuz enerji alır, yani yarım Kapak. Her Batarya otuz daha ekler.",
        "Uzaktaki baca ilk yarım dakika boyunca uykudadır; mattır ve halkası durgundur. Uyandığında ikisinin güçlü olanı odur.",
      ],
    },
    c3: {
      name: "Çukur",
      brief: "Üç baca yavaş, ağır atımlarla fışkırıyor ve aşağıdaki havza derin doluyor. Havanlar derin birikintilere erişir.",
      hints: ["Havanlar yüksekliği umursamaz ama üç karodan yakındaki hiçbir şeyi vuramaz."],
    },
    c4: {
      name: "Uzak Diyarlar",
      brief: "Üç ayrı yönde üç baca, en yakını yirmi dokuz karo ötede. Ana Hatlar paketleri uzun boşlukların üzerinden hızla taşır.",
      hints: [
        "Ana Hatlar birbirine on dört karo öteden bağlanır ve paketlerin hızını ikiye katlar.",
        "Bir Hızlandırıcı paketleri Direk gibi iletir ve ilettiği her paketi beşte bir hızlandırır. Paketler en hızlı yolu seçer; bu yüzden uzun bir hat boyunca dizilen birkaç Hızlandırıcı trafiği üzerine çeker ve hedefe daha çabuk ulaştırır.",
      ],
    },
    c5: {
      name: "Plato",
      brief: "Dört baca düzlüğünü çepeçevre sarıyor ve yalnızca üç damar var. Pompalar sığ balçığı sıyırıp enerjiye çevirir.",
      hints: [
        "Bir Pompa yalnızca iki karo ötedeki balçığa erişir; bu yüzden kıyıda, balçığın ona da ulaşabildiği yerde durmak zorundadır.",
      ],
    },
    c6: {
      name: "Taşkın Ovası",
      brief: "Alçağa, bir nehir vadisinin kıyısına indin; çevrende dört baca var ve biri çok yakın. On dakika dayan.",
      hints: [
        "Enerji alan bir Bariyer, dört karo içindeki her karoda balçığı iki basamak fazla tırmanmak zorunda bırakır.",
        "“İşaretle”yi seç, bir yükseklik belirle ve karoları boya; sekiz karo içindeki bir Greyder onları yükseltir ya da alçaltır.",
      ],
    },
    c7: {
      name: "Baraj Ateşi",
      brief: "Üç püskürtücü güneyden şebekene balçık fırlatıyor. Önleyiciler topakları havadayken vurur.",
      hints: [
        "Topaklar yapılarının en sık durduğu yeri hedef alır. Bir Önleyici dokuz karo uzağa erişir ve her topak için üç isabet ister.",
      ],
    },
    c8: {
      name: "Su Bölümü",
      brief: "Zirvenin dört bir yanında beş baca ve üç püskürtücü. Elindeki her şeyi kullan.",
      hints: ["En uzaktaki baca beş dakika boyunca uykudadır; mattır ve halkası durgundur."],
    },
    c9: {
      name: "At Nalı",
      brief: "Bir sırtın çevresinden dolanıp sana geri dönen bir vadinin başında üç güçlü baca. Balçıkları çoktan yola çıktı. Onu iniş aracından uzak tut ve bacaları kapat.",
      hints: [
        "Balçık dirsekten dönüp vadiden yukarı sana gelir. Greyderlerle vadiyi boydan boya kesen bir set yükselt ya da onu Bariyerler, Pompalar ve Mızraklarla durdur.",
        "Şebeke sırttaki kayanın üzerinden uzanır. Oradaki yüksek zeminden Mızraklar vadinin iki koluna da yetişir.",
      ],
    },
    c10: {
      name: "Takımadalar",
      brief: "Bir balçık denizinin ortasında bir adaya indin ve dibindeki dört baca onu yükseltmeyi sürdürüyor. Şebekeyi adadan adaya taşı, her bacanın çevresinde denizi yakarak geri püskürt ve bacayı kapat.",
      hints: [
        "Şebeke denizin üzerinden altı karo öteye uzanır ve boğazların çoğu bundan dardır. Geniş olanları Ana Hatlar aşar.",
        "Deniz tek parçadır: bir bacanın yanında yaktığın balçık her yerden geri akar. Ada tepelerindeki Mızraklar denizin tamamına yukarıdan bakar.",
        "Bir Hava Alanı'nın uçağı haritanın tamamına yetişir: her yüklendiğinde denizin en derin yerini bombalar.",
      ],
    },
    c11: {
      name: "Hareketli Teraslar",
      brief: "İniş alanının çevresindeki zemin basamaklar hâlinde yükselip milin yönünü değiştiriyor. İniş aracının yanındaki sabit halkadan ilerleyip bacaları kapat.",
      hints: [
        "İniş platosu tek parça hâlinde yükselir. Tesviye araçları çevresindeki sabit halkada çalışabilir.",
        "Her değişimden sonra dış teraslarda inşaata başlamadan önce milin nereye aktığına bak.",
      ],
    },
    c12: {
      name: "Hareketli Sığlıklar",
      brief: "Mil çoktan kıvrımı dönüp bulunduğun buruna doğru akıyor. Ağı adalar üzerinden ilerlet ve kanalın yukarısındaki bacaları kapat.",
      hints: [
        "Burun ve adaların tepeleri aktarıcılar ve silahlar için sağlam zemin sunar.",
        "İki sığlık farklı zamanlarda yükselip alçalır. Milin hangi kanallara yöneldiğini izle.",
      ],
    },
    c13: {
      name: "Atlantis",
      brief: "Büyük bir adanın tepesine indin ve ada batıyor. Deniz tabanındaki dört baca, kara çökerken denizi yükseltmeye devam ediyor. Mil iniş aracının üstünü kapatmadan onları kapat.",
      hints: [
        "Ada basamak basamak batıyor, sekizde biri ardından sekizde biri, çepeçevre. Kıyı ilk, tepe en son sulara gömülür.",
        "Greyderler batan zemini yeniden yükseltebilir, yükseltilmiş bir kenar denizi bir süre uzak tutar. Ama o da geri kalanla birlikte batmaya devam eder.",
        "Alçağa kurduğun şey yakında milin içinde kalır. Mızrakları ve aktarıcıları yüksek zemine koy, bacalara erkenden doğru ilerle.",
      ],
    },
  },
  skirmish: { name: "Çatışma {seed}", brief: "Her bacayı kapat." },
};
