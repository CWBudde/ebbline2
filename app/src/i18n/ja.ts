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
    "エネルギーはパケットとしてランダーから送り出され、グリッドの接続を伝って進みます。どの施設もパケットを中継し、完成した施設から 6 マス以内に置く必要があります。遠くへ伸ばすにはパイロンが安上がりです。建設中やパイロンを選択しているときは、完成したグリッドが届く範囲に色が付きます。赤い点は、グリッドが届いていない施設を示します。",
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
  "help.keys.slots": "1〜0、-",
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

  "hud.energy.title": "蓄えたエネルギーと、直前 1 秒間の収入と支出",
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
  "key.delete": "Del",

  "status.offGrid": "グリッド外：6 マス以内に施設が必要です",
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

  "grade.title": "地面をマーク",
  "grade.text": "目標の高さを選んでから、マスを塗ってください。8 マス以内のグレーダーが作業します。",
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
  "briefing.objective.survive": "ランダーを {minutes} 分間守り抜く。",
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
    "このミッションはキャップでは勝てません。上部のカウントダウンが終わったとき、ランダーが無事なら勝利です。",

  "tip.pylon": "パイロンの列は乾いた地面に通しましょう。パイロンが泥に飲まれると、そこから給電していたものがすべて切り離されます。",
  "tip.tap": "タップ 1 基につき、ランダーの毎秒 1 に加えて 0.6 のエネルギーが入ります。ただし、グリッドが届いている間だけです。",
  "tip.lance":
    "射程は 7 マスで、自分と同じ高さか低い地面にしか当たりません。盆地の底ではなく、泥を見下ろす縁に置きましょう。",
  "tip.cap": "パケットが 60 必要で、グリッドが届いている間しか噴出口を押さえられません。先に噴出口までの線を確保してから、キャップを置きましょう。",
  "tip.cell": "最初の蓄えは 30 までで、それを超えた収入は失われます。セルをいくつか建てれば、大きな攻勢に向けて貯められます。",
  "tip.lobber": "撃つのは深いたまりだけで、薄い層は狙わず、3 マス以内にも撃ちません。前線の後ろに置き、浅瀬はランスに任せましょう。",
  "tip.pump": "エネルギーなしで動きますが、稼ぎは少なく、自分のマスの泥で削られます。近くにランスを置きましょう。",
  "tip.trunk": "14 マスの高速接続には両端にトランクが必要です。ほかの施設とは、パイロンと同じく 6 マス以内でつながります。",
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
    pylon: { name: "パイロン", blurb: "グリッドを 6 マス広げます。" },
    trunk: { name: "トランク", blurb: "14 マス以内のトランク同士をつなぎ、パケットの速度を 2 倍にします。" },
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
      name: "最初の光",
      brief: "動きの鈍い噴出口が 2 つ。鉱脈を押さえ、グリッドを坂の下へ延ばして塞ぎましょう。",
      hints: [
        "ランダー近くの光る鉱脈にタップを置いて、エネルギーを得ましょう。",
        "パイロンはグリッドを安く広げる手段です。すべての施設は完成した施設から 6 マス以内に置く必要があります。",
        "ランスは泥を焼き払います。高台に置きましょう。上り坂には撃てません。",
        "噴出の合間に噴出口が乾いたら、キャップを置いて給電を保ちましょう。",
      ],
    },
    c2: {
      name: "貯水池",
      brief: "噴出口が 3 つ。セルで攻勢のためにエネルギーを蓄え、ロバーで深いたまりを狙います。",
      hints: ["ロバーは高さを無視しますが、3 マス以内には当たりません。"],
    },
    c3: {
      name: "すくい取り",
      brief: "ここは鉱脈が乏しい場所です。ポンプは浅瀬をエネルギーに変えますが、危険も伴います。",
      hints: ["ポンプが働くのは 2 マス以内の泥だけなので、最前線に置くことになります。"],
    },
    c4: {
      name: "長い道のり",
      brief: "噴出口が 3 つ、どれも遠くにあります。トランクなら長い距離もパケットを速く運べます。",
      hints: ["トランク同士は 14 マス以内でつながり、パケットの速度を 2 倍にします。"],
    },
    c5: {
      name: "着弾警報",
      brief: "スピッターに見つかりました。着弾マーカーに注意して、泥塊を撃ち落としましょう。",
      hints: ["泥塊は施設がいちばん密集した場所を狙います。インターセプターは泥塊 1 つに 3 発必要です。"],
    },
    c6: {
      name: "防波堤",
      brief: "あなたは盆地の底にいて、噴出口には手が届きません。10 分間耐え抜きましょう。",
      hints: ["給電中のバッフルは泥にさらに 2 段登らせます。谷をふさぐダムです。"],
    },
    c7: {
      name: "土木工事",
      brief: "噴出口が 5 つ、地形は起伏だらけ。グレーダーで堤防を築き、スロープを掘りましょう。",
      hints: ["「マーク」を選び、高さを決めてマスを塗ります。射程内のグレーダーが作業します。"],
    },
    c8: {
      name: "Ebbline",
      brief: "噴出口 6 つ、スピッター 3 体。持てる力のすべてで、流れを変えましょう。",
      hints: [],
    },
    c9: {
      name: "十字砲火",
      brief: "3 体のスピッターが小さな盆地を囲んでいます。分散して、泥塊 1 発で崩れないようにしましょう。",
      hints: ["泥塊は施設がいちばん密集した場所を狙うので、広く散らしたグリッドなら被害も分散します。"],
    },
    c10: {
      name: "乾いた土地",
      brief: "鉱脈は少なく、飢えた噴出口が 5 つ。パケット 1 つも無駄にできません。",
      hints: ["鉱脈が尽きたら、前線のポンプが攻勢をまかないます。"],
    },
    c11: {
      name: "雹の嵐",
      brief: "2 体のスピッターが速く頻繁に撃ってきます。前進する前にグリッドを守りましょう。",
      hints: [],
    },
    c12: {
      name: "引き波",
      brief: "噴出口 4 つ、スピッター 1 体、高台はありません。15 分間耐え抜きましょう。",
      hints: ["ランダーへ続く谷を見つけ、それぞれをバッフルでせき止めましょう。"],
    },
    c13: {
      name: "デルタ",
      brief: "広いデルタに噴出口が 5 つ散らばっています。トランクとセルで長い前線に供給を保ちましょう。",
      hints: [],
    },
    c14: {
      name: "大潮",
      brief: "これまでで最も高い潮：噴出口 4 つとスピッター 3 体。始めたことを終わらせましょう。",
      hints: [],
    },
  },
  skirmish: { name: "スカーミッシュ {seed}", brief: "すべての噴出口を塞ぐ。" },
};
