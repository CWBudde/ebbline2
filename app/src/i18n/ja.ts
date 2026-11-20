// Japanese interface text. Typed against the English keys: a missing or extra key fails typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         泥                    Vent        噴出口
//   Lode         鉱脈                  Spitter     スピッター
//   Glob         泥塊                  Grid        グリッド
//   Packet       パケット              Tile        マス
//   Baffle field 防壁フィールド
//   Structure    施設                  Energy      エネルギー
//   Lander       ランダー              Pylon       パイロン
//   Trunk        トランク              Tap         タップ
//   Cell         セル                  Pump        ポンプ
//   Lance        ランス                Lobber      ロバー
//   Baffle       バッフル              Interceptor インターセプター
//   Grader       グレーダー            Cap         キャップ
//   to cap       塞ぐ                  to seal     封印する
//   to dismantle 解体する              Mark ground 地面をマーク
//   Campaign     キャンペーン          Skirmish    スカーミッシュ
//   Mission      ミッション            Seed        シード
//   Briefing     ブリーフィング        Best (time) ベスト
//
// Style: です/ます in sentences, nouns or plain verbs on buttons and labels, full-width
// punctuation (、。：「」). Structure names are katakana loanwords. The game's title "Ebbline 2" is
// never translated. Keys follow a JIS keyboard: the speed keys are comma and full stop, because the
// bracket keys sit elsewhere there.

import type { Content, Key } from "./en.ts";

export const ja: Record<Key, string> = {
  "meta.description":
    "Ebbline 2：流体防衛ゲーム。噴出口から泥があふれ出します。グリッドを築いて押し返し、すべての噴出口を塞ぎましょう。",

  "title.lede": "噴出口から泥があふれ出しています。グリッドを築いて押し返し、すべて塞ぎましょう。",
  "title.continue": "続きから",
  "title.credit": "MIT ライセンスのオープンソースゲームです。アートはこのプロジェクトのために制作しました。",
  "menu.campaign": "キャンペーン",
  "menu.skirmish": "スカーミッシュ",
  "menu.help": "遊び方",
  "menu.settings": "設定",
  "common.back": "戻る",

  "campaign.locked": "前のミッションをクリアすると解放されます。",
  "campaign.best": "ベスト {time}",
  "campaign.next": "次のミッション",

  "skirmish.seed": "シード",
  "skirmish.size": "マップサイズ",
  "skirmish.size.small": "小：噴出口 2 つ",
  "skirmish.size.medium": "中：噴出口 3 つ",
  "skirmish.size.large": "大：噴出口 4 つ",
  "skirmish.difficulty": "難易度",
  "skirmish.difficulty.easy": "やさしい：スピッターなし",
  "skirmish.difficulty.normal": "ふつう：スピッター 1 体",
  "skirmish.difficulty.hard": "むずかしい：スピッター 2 体",
  "skirmish.note":
    "シード、サイズ、難易度が同じなら、必ず同じマップになります。ゲームが始まると、アドレスバーにそのマップへのリンクが入ります。",
  "skirmish.start": "開始",

  "settings.language": "言語",
  "settings.language.auto": "自動",
  "settings.volume": "音量",
  "settings.music": "環境音",
  "settings.edgeScroll": "ポインターが画面端に触れたらスクロール",
  "settings.reducedMotion": "点滅と脈動を減らす",

  "help.intro":
    "泥は_噴出口_からわき出し、低いほうへ流れます。泥に覆われたものは少しずつ削られます。ランダーを失うとミッション失敗です。すべての噴出口に*キャップ*を建てれば勝利です。",
  "help.grid.title": "グリッド",
  "help.grid.text":
    "エネルギーはパケットとしてランダーから送り出され、グリッドの接続を伝って進みます。パケットを中継するのはランダー、パイロン、トランク、ブースターだけで、どの施設もそのうち完成したものから 6 マス以内に置く必要があります。遠くへ伸ばすにはパイロンが安上がりです。赤い点は、グリッドが届いていない施設を示します。パイロンは、3 歩以内にあって自分と同じ高さにあり、直接見通せるマスからエネルギーを集めます（緑の範囲で表示）。間に高い地形や岩があると遮られ、泥に覆われたマスからは何も得られません。",
  "help.cap.title": "噴出口を塞ぐ",
  "help.cap.text":
    "キャップは、噴出口のマスがほぼ乾いたとき（白い輪が目印）にだけ建設を始められます。建設中は噴出口を押さえますが、圧力はたまり続けます。キャップを失うと、たまった泥が一気に噴き出します。",
  "help.structures.title": "施設",
  "help.controls.title": "操作",
  "help.keys.click": "クリック、タップ",
  "help.keys.click.does": "ツール選択中は配置、それ以外は選択",
  "help.keys.drag": "ドラッグ",
  "help.keys.drag.does": "ツール選択中は一列に配置またはマークを塗る、それ以外はマップを移動",
  "help.keys.cancel": "右クリック、Esc",
  "help.keys.cancel.does": "ツールを解除、選択を解除、メニューを開く",
  "help.keys.zoom": "ホイール、ピンチ",
  "help.keys.zoom.does": "ズーム",
  "help.keys.pan": "W A S D、矢印キー",
  "help.keys.pan.does": "マップを移動",
  "help.keys.slots": "1〜0、-、^",
  "help.keys.slots.does": "建設バーから施設を選ぶ",
  "help.keys.mark": "G",
  "help.keys.mark.does": "グレーダー用に地面をマーク",
  "help.keys.pause": "スペース",
  "help.keys.pause.does": "一時停止",
  "help.keys.speed": ", .",
  "help.keys.speed.does": "遅く、速く",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "選択中の施設をオフ／オン",
  "help.keys.dismantle": "Delete",
  "help.keys.dismantle.does": "選択中の施設を解体し、コストの半分を回収",
  "help.keys.stats": "T",
  "help.keys.stats.does": "統計を表示",

  "hud.energy.title": "蓄えたエネルギーと、直前 1 秒間の収入と支出",
  "hud.energy.stats": "クリックすると、エネルギーの入手元と使い道が見られます。",
  "hud.hold": "あと {time} 耐える",
  "hud.capped": "塞いだ噴出口 {capped} / {vents}",
  "hud.pause": "一時停止",
  "hud.paused": "一時停止中",
  "hud.pause.title": "一時停止（スペース）",
  "hud.menu": "メニュー",
  "hud.menu.title": "メニュー（Esc）",
  "hud.map": "マップ全体",

  "build.label": "建設",
  "build.mark": "マーク",
  "build.mark.cost": "地面",
  "build.mark.title": "グレーダーに上げ下げさせる地面をマーク",
  "key.slot11": "-",
  "key.slot12": "^",
  "key.delete": "Del",

  "status.offGrid": "グリッド外：6 マス以内に完成したパイロンが必要です",
  "status.building": "建設中",
  "status.off": "オフ",
  "status.damaged": "損傷、修理中",
  "status.working": "稼働中",

  "info.cost": "エネルギー {cost}",
  "info.range": "射程 {range}",
  "info.rangeMin": "射程 {range}、最短 {min}",
  "info.place": "クリックで配置、ドラッグで一列に配置。右クリックか Esc で解除。",
  "info.health": "耐久",
  "info.energy": "エネルギー",
  "info.switchOff": "オフにする",
  "info.switchOn": "オンにする",
  "info.dismantle": "解体",
  "info.notes": "ヒント",
  "info.hide": "隠す",
  "info.details": "詳細",

  "grade.title": "地面をマーク",
  "grade.text": "目標の高さを選んでから、マスを塗ってください。8 マス以内のグレーダーが作業します。",
  "grade.moving": "ここでは一部の地面が上下するため、マークできません。その上では枠が赤くなります。",
  "grade.erase": "消去",

  "pause.title": "一時停止中",
  "pause.resume": "再開",
  "pause.save": "保存",
  "pause.briefing": "ブリーフィング",
  "pause.restart": "リスタート",
  "pause.quit": "保存して終了",

  "briefing.mission": "ミッション {number} / {total}",
  "briefing.objective": "目標",
  "briefing.objective.cap.one": "噴出口にキャップを建てる。",
  "briefing.objective.cap.many": "{vents} か所の噴出口すべてにキャップを建てる。",
  "briefing.objective.survive": "ランダーを {minutes} 分間守り抜くか、それまでにすべての噴出口を塞ぐ。",
  "briefing.new": "このミッションの新要素",
  "briefing.new.threat": "新たな脅威",
  "briefing.new.goal": "新たな目標",
  "briefing.tip": "ヒント",
  "briefing.deploy": "出撃",
  "briefing.resume": "ミッションに戻る",
  "briefing.spitter.name": "スピッター",
  "briefing.spitter.text":
    "破壊できません。約 30 秒ごとにグリッドへ泥塊を撃ち込んできます。着弾地点はマーカーで示されます。",
  "briefing.survive.name": "耐え抜け",
  "briefing.survive.text":
    "上部のカウントダウンが終わったとき、ランダーが無事なら勝利です。すべての噴出口を塞ぐと、勝利として早期に終了します。",

  "tip.pylon": "パイロンの列は乾いた地面に通しましょう。パイロンが泥に飲まれると、そこから給電していたものがすべて切り離されます。",
  "tip.tap": "タップ 1 基につき、ランダーの毎秒 1 に加えて 0.6 のエネルギーが入ります。ただし、グリッドが届いている間だけです。",
  "tip.lance":
    "射程は 7 マスで、自分と同じ高さか低い地面にしか当たりません。盆地の底ではなく、泥を見下ろす縁に置きましょう。",
  "tip.cap": "パケットが 60 必要で、グリッドが届いている間しか噴出口を押さえられません。先に噴出口までの線を確保してから、キャップを置きましょう。",
  "tip.cell": "最初の蓄えは 30 までで、それを超えた収入は失われます。セルをいくつか建てれば、大きな攻勢に向けて貯められます。",
  "tip.lobber": "撃つのは深いたまりだけで、薄い層は狙わず、3 マス以内にも撃ちません。前線の後ろに置き、浅瀬はランスに任せましょう。",
  "tip.pump": "エネルギーなしで動きますが、稼ぎは少なく、自分のマスの泥で削られます。近くにランスを置きましょう。",
  "tip.trunk": "14 マスの高速接続には両端にトランクが必要です。ほかの施設とは、パイロンと同じく 6 マス以内でつながります。",
  "tip.booster":
    "加速するのは、ブースターが中継するパケットだけです。ブースターを建てたり修理したりするパケットは加速されません。長いラインの手前に置きましょう。パケットは早く加速されるほど、長く速く走れます。",
  "tip.interceptor": "射程は 9 マスで、1 発ごとにエネルギーを 1 消費し、泥塊 1 つに 3 発必要です。施設がいちばん密集している場所に置きましょう。",
  "tip.baffle": "フィールドは周囲 4 マスを覆い、バッフルのエネルギーが切れた瞬間に消えます。給電線を守りましょう。",
  "tip.grader": "高さ 1 段ごとに 1.5 秒かかり、施設の下は整地できません。泥が来る前に堤防をマークしておきましょう。",
  "tip.spitter": "泥塊は、周囲 5 マス以内にほかの施設がいちばん多い施設を狙います。次の着弾地点は読めるので、そこにインターセプターを置きましょう。",
  "tip.survive": "拡張よりもランダー周辺の防御にエネルギーを回しましょう。噴出口は毎分強くなるので、最後の数分がいちばん厳しくなります。",

  "end.won": "噴出口を封印",
  "end.won.survive.title": "耐え抜いた",
  "end.lost": "ランダー喪失",
  "end.won.survive": "持ちこたえました。",
  "end.won.cap": "泥が引いていきます。",
  "end.lost.text": "泥がランダーに達しました。",
  "end.time": "タイム",
  "end.newBest": "ベスト更新",
  "end.spent": "使ったエネルギー",
  "end.built": "建てた施設",
  "end.destroyed": "失った施設",
  "end.removed": "除去した泥",
  "end.next": "次へ：{name}",
  "end.again": "もう一度",
  "end.retry": "リトライ",
  "end.menu": "メインメニュー",

  "stats.title": "統計",
  "stats.empty": "グラフはミッションの進行に合わせて埋まっていきます。",
  "stats.silt": "泥",
  "stats.silt.volume": "マップ上の泥",
  "stats.silt.flooded": "浸水したマス",
  "stats.silt.removed": "1 秒あたりの除去量",
  "stats.energy": "エネルギー",
  "stats.energy.flow": "1 秒あたりの流れ",
  "stats.energy.in": "収入",
  "stats.energy.out": "支出",
  "stats.energy.bank": "蓄え",
  "stats.energy.stored": "貯蔵",
  "stats.energy.capacity": "容量",
  "stats.vents": "開いた噴出口",
  "stats.structures": "施設",
  "stats.structures.standing": "現存",
  "stats.structures.lost": "ここまでの喪失",
  "stats.peak": "泥のピーク",
  "stats.peak.at": "{time} 時点",
  "stats.capped": "塞いだ噴出口",
  "stats.net": "1 秒あたりの平均純エネルギー",
  "stats.energy.sources": "入手元別の収入",
  "stats.energy.purposes": "用途別の支出",
  "stats.spend.build": "建設",
  "stats.spend.repair": "修理",
  "stats.spend.supply": "稼働",
  "stats.now": "現在",
  "stats.rate": "{rate}/秒",

  "notice.unreadable": "このセーブデータは読み込めませんでした。",
  "notice.saved": "保存しました。",
  "notice.noStorage": "このブラウザーでは保存できません。",

  "place.locked": "このミッションでは使えません。",
  "place.outside": "マップの外です。",
  "place.rock": "岩の上には建てられません。",
  "place.occupied": "すでに何かがあります。",
  "place.spitter": "そこにはスピッターがいます。",
  "place.needs vent": "キャップは開いた噴出口にしか置けません。",
  "place.flooded": "泥が多すぎます。先に焼き払ってください。",
  "place.vent": "噴出口に置けるのはキャップだけです。",
  "place.needs lode": "タップは鉱脈の上にしか置けません。",
};

export const jaContent: Content = {
  kinds: {
    lander: { name: "ランダー", blurb: "グリッドの起点。失うとミッション終了です。" },
    pylon: { name: "パイロン", blurb: "グリッドを 6 マス広げ、自分と同じ高さで見渡せる平地から少しエネルギーを集めます。" },
    trunk: { name: "トランク", blurb: "14 マス以内のトランク同士をつなぎ、パケットの速度を 2 倍にします。" },
    booster: {
      name: "ブースター",
      blurb: "パイロンと同じくパケットを中継し、通過したパケットはその後 1.2 倍の速さ（5 分の 1 増し）で進みます。ブースター同士の効果は重なりますが、同じブースターが同じパケットを加速するのは 1 回だけです。さらに、稼働中のブースターは 1 基ごとに、置かれた場所に関係なくすべてのパケットを 2 % 速くします。",
    },
    tap: { name: "タップ", blurb: "鉱脈から安定してエネルギーを引き出します。鉱脈の上にしか置けません。" },
    cell: { name: "セル", blurb: "エネルギーを 30 多く蓄えます。" },
    pump: { name: "ポンプ", blurb: "近くの浅い泥をくみ取り、わずかなエネルギーに変えます。" },
    lance: { name: "ランス", blurb: "泥を 1 マスずつ焼き払います。上り坂には撃てません。" },
    lobber: { name: "ロバー", blurb: "射程内でいちばん深い泥に、遅い弾を撃ち込みます。" },
    baffle: { name: "バッフル", blurb: "泥が 2 段の壁のように乗り越えなければならないフィールドを張ります。" },
    interceptor: { name: "インターセプター", blurb: "飛んでくる泥塊を撃ち落とします。" },
    grader: { name: "グレーダー", blurb: "マークした地面を 1 段ずつ上げ下げします。" },
    cap: { name: "キャップ", blurb: "建設中は乾いた噴出口を押さえ、完成すると完全に封印します。" },
  },
  levels: {
    c1: {
      name: "着陸",
      brief: "噴出口が 1 つ、東に 15 マス、はるか下にあり、その溜まりはすでに広がりつつあります。グリッドを下ろして近づき、泥を焼き払ってキャップをかぶせましょう。",
      hints: [
        "グリッドを延ばせるのはパイロンだけです。すべての施設は、ランダーか完成したパイロンから 6 マス以内に置く必要があります。",
        "ランスは泥を焼き払います。高所に置きましょう。上り方向には狙えません。",
        "噴出が途切れて噴出口が乾いたら、キャップを置いて給電を保ちましょう。",
        "ランダーは毎秒 1 のエネルギーを生みますが、ここに鉱脈はありません。パイロンは、自分と同じ高さで見渡せる平地から少しだけ多くエネルギーを集めます。必要以上に建てないこと。",
      ],
    },
    c2: {
      name: "二つの前線",
      brief: "噴出口が 2 つ、丘の反対側に 1 つずつ。鉱脈からエネルギーを引き出し、キャップのために蓄えましょう。",
      hints: [
        "ランダー近くの光る鉱脈にタップを置いて、エネルギーを稼ぎましょう。",
        "蓄えは 30 まで、キャップ半分ぶんです。セルを建てるたびに 30 増えます。",
        "遠いほうの噴出口は最初の 30 秒間は眠っていて、色がくすみ、輪も動きません。目を覚ますと、2 つのうち強いほうになります。",
      ],
    },
    c3: {
      name: "すり鉢",
      brief: "噴出口が 3 つ、ゆっくり重い脈動で噴き出し、下の盆地は深く埋まります。ロバーなら深いたまりに届きます。",
      hints: [
        "ロバーは高低差を無視しますが、3 マス以内は撃てません。",
      ],
    },
    c4: {
      name: "遠き果て",
      brief: "噴出口は 3 方向に 1 つずつ、最も近いものでも 29 マス先です。トランクなら、遠い隙間もパケットが素早く渡れます。",
      hints: [
        "トランク同士は 14 マス離れても結べ、パケットの速度が 2 倍になります。",
        "ブースターはパイロンと同じくパケットを中継し、通過するパケットを 5 分の 1 速くします。パケットは最も速い経路を通るので、長いラインにいくつか置くと流れが集まり、早く届きます。",
      ],
    },
    c5: {
      name: "台地",
      brief: "噴出口 4 つが高台を取り囲み、鉱脈は 3 つしかありません。ポンプは浅い泥をすくってエネルギーに変えます。",
      hints: [
        "ポンプが届くのは 2 マス先の泥だけ。泥も届く岸辺に置くしかありません。",
      ],
    },
    c6: {
      name: "氾濫原",
      brief: "低地の川谷の岸に降り立ち、周囲を噴出口 4 つに囲まれ、そのうち 1 つはすぐ近くです。10 分間耐え抜きましょう。",
      hints: [
        "給電中のバッフルは、4 マス以内のすべてのマスで泥が 2 段余計に登らないと進めないようにします。",
        "「マーク」を選び、高さを決めてマスを塗ります。8 マス以内のグレーダーが上げ下げします。",
      ],
    },
    c7: {
      name: "砲撃",
      brief: "スピッター 3 基が南からグリッドへ泥を投げ込んできます。インターセプターなら泥塊を空中で撃ち落とせます。",
      hints: [
        "泥塊は最も密集した施設群を狙います。インターセプターは 9 マス届き、泥塊 1 つにつき 3 発必要です。",
      ],
    },
    c8: {
      name: "分水嶺",
      brief: "山頂をぐるりと囲む噴出口 5 つとスピッター 3 基。持てるすべてを使いましょう。",
      hints: ["いちばん遠い噴出口は 5 分間眠っています。色がくすみ、輪も動きません。"],
    },
    c9: {
      name: "馬蹄",
      brief: "尾根を回り込んでこちらへ戻ってくる谷、その谷頭に強力な噴出口が 3 つ。泥はもう回り込んできています。ランダーを泥から守り、噴出口を塞ぎましょう。",
      hints: [
        "泥は曲がり角を回り、谷を上ってこちらへ来ます。グレーダーで谷を横切る堤を築くか、バッフル、ポンプ、ランスで食い止めましょう。",
        "グリッドは尾根の岩を越えて届きます。尾根の高所からなら、ランスは谷の両側に届きます。",
      ],
    },
    c10: {
      name: "群島",
      brief: "ランダーは泥の海に浮かぶ島に降りました。海底の噴出口 4 つが海面を押し上げ続けています。グリッドを島から島へ渡し、各噴出口の周りの泥を焼き払ってキャップをかぶせましょう。",
      hints: [
        "グリッドは海の上でも 6 マス先まで届き、ほとんどの海峡はそれより狭いです。広い海峡はトランクで渡りましょう。",
        "海はひとつながりです。噴出口のそばで焼き払っても、ほかのあらゆる所から泥が流れ込みます。島の頂上に置いたランスなら、海全体を見下ろせます。",
      ],
    },
    c11: {
      name: "動く段丘",
      brief: "着陸地点の周りで地面が段々にせり上がり、泥の流れが変わる。着陸機そばの動かない環状地帯を足場に、噴出口を封鎖しよう。",
      hints: [
        "着陸台地は一体となってせり上がる。整地機はすぐ外側の動かない環状地帯で作業できる。",
        "外側の段丘に建設する前に、地形が変わるたびに泥がどこへ流れるか確かめよう。",
      ],
    },
    c12: {
      name: "動く浅瀬",
      brief: "泥はすでに湾曲部を回り込み、着陸地点の岬へ向かっている。島伝いにグリッドを延ばし、上流の噴出口を封鎖しよう。",
      hints: [
        "岬と島の高台は中継設備や兵器を置くための安定した足場だ。",
        "二つの浅瀬が異なるタイミングで隆起と沈降を繰り返す。泥がどの水路を通るか観察しよう。",
      ],
    },
  },
  skirmish: { name: "スカーミッシュ {seed}", brief: "すべての噴出口を塞ぐ。" },
};
