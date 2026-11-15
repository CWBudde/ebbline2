// Simplified Chinese interface text. Typed against the English keys: a missing or extra key fails
// typecheck.
//
// Glossary (decide once, use everywhere):
//
//   Silt         淤泥                  Vent        喷口
//   Lode         矿脉                  Spitter     喷吐者
//   Glob         泥团                  Grid        电网
//   Packet       能量包                Tile        格
//   Baffle field 屏障场
//   Structure    建筑                  Energy      能量
//   Lander       着陆舱                Pylon       电塔
//   Trunk        干线塔                Tap         汲取器
//   Cell         储能器                Pump        抽泥泵
//   Lance        灼枪                  Lobber      抛射炮
//   Baffle       屏障                  Interceptor 拦截器
//   Grader       平地机                Cap         封盖
//   to cap       封堵                  to seal     封死
//   to dismantle 拆除                  Mark ground 标记地面
//   Campaign     战役                  Skirmish    遭遇战
//   Mission      任务                  Seed        种子
//   Briefing     任务简报              Best (time) 最佳
//
// Style: short, direct imperatives, full-width punctuation (，。：；“”), no "您". The game's title
// "Ebbline 2" is never translated. Keys follow a US keyboard, the usual layout in mainland China.

import type { Content, Key } from "./en.ts";

export const zh: Record<Key, string> = {
  "meta.description": "Ebbline 2：一款抵御淤泥的塔防游戏。淤泥从喷口涌出；搭建电网，把它逼退，封堵所有喷口。",

  "title.lede": "淤泥正从喷口涌出。搭建电网，把它逼退，封堵所有喷口。",
  "title.continue": "继续",
  "title.credit": "基于 MIT 许可证的开源游戏。美术为本项目专门制作。",
  "menu.campaign": "战役",
  "menu.skirmish": "遭遇战",
  "menu.help": "玩法说明",
  "menu.settings": "设置",
  "common.back": "返回",

  "campaign.locked": "赢得上一个任务即可解锁。",
  "campaign.best": "最佳 {time}",
  "campaign.next": "下一个任务",

  "skirmish.seed": "种子",
  "skirmish.size": "地图大小",
  "skirmish.size.small": "小，两个喷口",
  "skirmish.size.medium": "中，三个喷口",
  "skirmish.size.large": "大，四个喷口",
  "skirmish.difficulty": "难度",
  "skirmish.difficulty.easy": "简单，没有喷吐者",
  "skirmish.difficulty.normal": "普通，一个喷吐者",
  "skirmish.difficulty.hard": "困难，两个喷吐者",
  "skirmish.note": "相同的种子、大小和难度总会生成同一张地图。游戏开始后，地址栏里就是指向它的链接。",
  "skirmish.start": "开始",

  "settings.language": "语言",
  "settings.language.auto": "自动",
  "settings.volume": "音量",
  "settings.music": "环境音",
  "settings.edgeScroll": "指针碰到屏幕边缘时滚动地图",
  "settings.reducedMotion": "减少闪烁和脉动",

  "help.intro":
    "淤泥从_喷口_涌出，向低处流动，会侵蚀它所覆盖的一切。着陆舱被毁，任务即告失败。在每个喷口上建好*封盖*即可获胜。",
  "help.grid.title": "电网",
  "help.grid.text":
    "能量以能量包的形式离开着陆舱，沿电网连线传输。每座建筑都会转送能量包，并且必须位于某座已建成建筑的六格范围内；电塔是向远处延伸的廉价手段。建造时或选中电塔时，建成后电网能覆盖的区域会被着色。红点表示该建筑不在电网覆盖范围内。电塔会从三步范围内、与自身同一高度且视线直达的格子收集能量（以绿色区域显示）；中间有更高的地势或岩石就会被挡住，被淤泥覆盖的格子则毫无产出。",
  "help.cap.title": "封堵喷口",
  "help.cap.text":
    "只有当喷口所在的格子几乎干涸（显示白色圆环）时，才能开始建造封盖。建造期间它会压住喷口，但压力会不断积聚：一旦封盖被毁，积压的淤泥会一次性喷涌而出。",
  "help.structures.title": "建筑",
  "help.controls.title": "操作",
  "help.keys.click": "单击、轻触",
  "help.keys.click.does": "持有工具时放置，否则选择",
  "help.keys.drag": "拖动",
  "help.keys.drag.does": "持有工具时放置一排或涂抹标记，否则移动地图",
  "help.keys.cancel": "右键、Esc",
  "help.keys.cancel.does": "收起工具、取消选择、打开菜单",
  "help.keys.zoom": "滚轮、双指缩放",
  "help.keys.zoom.does": "缩放",
  "help.keys.pan": "W A S D、方向键",
  "help.keys.pan.does": "移动地图",
  "help.keys.slots": "1–0、-、=",
  "help.keys.slots.does": "从建造栏选择建筑",
  "help.keys.mark": "G",
  "help.keys.mark.does": "为平地机标记地面",
  "help.keys.pause": "空格",
  "help.keys.pause.does": "暂停",
  "help.keys.speed": "[ ]",
  "help.keys.speed.does": "减速、加速",
  "help.keys.toggle": "X",
  "help.keys.toggle.does": "关闭或开启选中的建筑",
  "help.keys.dismantle": "Delete",
  "help.keys.dismantle.does": "拆除选中的建筑，返还一半造价",

  "hud.energy.title": "储存的能量，以及过去一秒的流入和消耗",
  "hud.hold": "坚守 {time}",
  "hud.capped": "已封堵喷口 {capped} / {vents}",
  "hud.pause": "暂停",
  "hud.paused": "已暂停",
  "hud.pause.title": "暂停（空格）",
  "hud.menu": "菜单",
  "hud.menu.title": "菜单（Esc）",
  "hud.map": "地图总览",

  "build.label": "建造",
  "build.mark": "标记",
  "build.mark.cost": "地面",
  "build.mark.title": "标记要让平地机抬高或降低的地面",
  "key.slot11": "-",
  "key.slot12": "=",
  "key.delete": "Del",

  "status.offGrid": "未接入电网：六格内需要一座建筑",
  "status.building": "建造中",
  "status.off": "已关闭",
  "status.damaged": "受损，修复中",
  "status.working": "运行中",

  "info.cost": "{cost} 能量",
  "info.range": "射程 {range}",
  "info.rangeMin": "射程 {range}，最近 {min}",
  "info.place": "单击放置，拖动放置一排。右键或 Esc 收起工具。",
  "info.health": "耐久",
  "info.energy": "能量",
  "info.switchOff": "关闭",
  "info.switchOn": "开启",
  "info.dismantle": "拆除",
  "info.notes": "提示",
  "info.hide": "隐藏",
  "info.details": "详情",

  "grade.title": "标记地面",
  "grade.text": "选择目标高度，然后涂抹格子。八格内的平地机会完成施工。",
  "grade.erase": "擦除",

  "pause.title": "已暂停",
  "pause.resume": "继续",
  "pause.save": "保存",
  "pause.briefing": "任务简报",
  "pause.restart": "重新开始任务",
  "pause.quit": "保存并退出",

  "briefing.mission": "任务 {number} / {total}",
  "briefing.objective": "目标",
  "briefing.objective.cap.one": "在喷口上建造封盖。",
  "briefing.objective.cap.many": "在全部 {vents} 个喷口上各建一个封盖。",
  "briefing.objective.survive": "让着陆舱坚持 {minutes} 分钟，或在此之前封堵所有喷口。",
  "briefing.new": "本任务新增",
  "briefing.new.threat": "新威胁",
  "briefing.new.goal": "新目标",
  "briefing.tip": "提示",
  "briefing.deploy": "出发",
  "briefing.resume": "返回任务",
  "briefing.spitter.name": "喷吐者",
  "briefing.spitter.text": "无法摧毁。大约每半分钟向你的电网抛出一团淤泥；落点会有标记提示。",
  "briefing.survive.name": "坚守",
  "briefing.survive.text": "顶部倒计时结束时着陆舱仍然屹立，即为胜利。封堵所有喷口会提前以胜利结束任务。",

  "tip.pylon": "让电塔链保持在干燥地面上：一座电塔被淤泥吞没，经由它供能的一切都会断开。",
  "tip.tap": "每个汲取器在着陆舱每秒 1 点之外再提供 0.6 点能量，但前提是电网能覆盖到它。",
  "tip.lance": "射程七格，只能打到与自身同高或更低的地面，所以要放在淤泥上方的边缘，而不是盆地底部。",
  "tip.cap": "需要 60 个能量包，且只有电网覆盖时才能压住喷口：先保住通往喷口的线路，再放封盖。",
  "tip.cell": "能量储存起初只有 30，超出的收入会白白浪费：建几个储能器，才能为大规模推进攒能量。",
  "tip.lobber": "只攻击积水般的深泥，不打薄层，且三格内不开火：放在前线后方，浅处交给灼枪。",
  "tip.pump": "无需能量即可运行，但收益不高，而且自身格子上的淤泥会侵蚀它：附近放一把灼枪。",
  "tip.trunk": "十四格的快速连接两端都需要干线塔；与其他建筑相连时，它和电塔一样，范围六格。",
  "tip.booster":
    "它只加速由它转发的能量包，不加速用来建造或修复它的能量包。把它建在长线路的前段：能量包越早被加速，以更快速度行进的距离就越长。",
  "tip.interceptor": "射程九格，每发消耗一点能量，每个泥团需三发：放在建筑最密集的地方。",
  "tip.baffle": "屏障场覆盖周围四格，屏障一旦断能便立刻消失，所以要保护为它供能的线路。",
  "tip.grader": "每改变一级高度需要一秒半，建筑下方无法平整：在淤泥到来之前标好你的堤坝。",
  "tip.spitter": "泥团瞄准五格内周围建筑最多的那座建筑，所以你能预判下一发的落点：在那里放一个拦截器。",
  "tip.survive": "把能量花在着陆舱周围的防御上，而不是扩张：喷口每分钟都在变强，最后几分钟最艰难。",

  "end.won": "喷口已封死",
  "end.won.survive.title": "坚守成功",
  "end.lost": "着陆舱被毁",
  "end.won.survive": "你守住了阵地。",
  "end.won.cap": "淤泥正在退去。",
  "end.lost.text": "淤泥吞没了着陆舱。",
  "end.time": "用时",
  "end.newBest": "新纪录",
  "end.spent": "消耗能量",
  "end.built": "建造建筑",
  "end.destroyed": "损失建筑",
  "end.removed": "清除淤泥",
  "end.next": "下一关：{name}",
  "end.again": "再玩一次",
  "end.retry": "重试",
  "end.menu": "主菜单",

  "notice.unreadable": "无法读取该存档。",
  "notice.saved": "游戏已保存。",
  "notice.noStorage": "此浏览器无法保存游戏。",

  "place.locked": "本任务中不可用。",
  "place.outside": "超出地图范围。",
  "place.rock": "岩石上无法建造。",
  "place.occupied": "这里已有东西。",
  "place.spitter": "这里有一个喷吐者。",
  "place.needs vent": "封盖只能放在开放的喷口上。",
  "place.flooded": "这里淤泥太多。先把它烧掉。",
  "place.vent": "喷口上只能放封盖。",
  "place.needs lode": "汲取器只能放在矿脉上。",
};

export const zhContent: Content = {
  kinds: {
    lander: { name: "着陆舱", blurb: "电网的起点。一旦被毁，任务结束。" },
    pylon: { name: "电塔", blurb: "将电网扩展六格，并从它所在高度上看得到的平地收集少量能量。" },
    trunk: { name: "干线塔", blurb: "与十四格内的其他干线塔相连，使能量包速度翻倍。" },
    booster: {
      name: "加速器",
      blurb: "像电塔一样中继能量包，经它转发的能量包此后速度变为 1.2 倍（提高五分之一）。多个加速器效果叠加，但同一个加速器绝不会对同一能量包加速两次。",
    },
    tap: { name: "汲取器", blurb: "从矿脉中持续汲取能量。只能放在矿脉上。" },
    cell: { name: "储能器", blurb: "额外储存三十点能量。" },
    pump: { name: "抽泥泵", blurb: "抽取附近的浅层淤泥，转化为少量能量。" },
    lance: { name: "灼枪", blurb: "逐格烧掉淤泥。无法向上坡瞄准。" },
    lobber: { name: "抛射炮", blurb: "向射程内最深的淤泥抛出一枚慢速弹药。" },
    baffle: { name: "屏障", blurb: "投射屏障场，淤泥必须像翻越两级高墙一样越过它。" },
    interceptor: { name: "拦截器", blurb: "在空中击落泥团。" },
    grader: { name: "平地机", blurb: "逐级抬高或降低已标记的地面。" },
    cap: { name: "封盖", blurb: "建造期间压住干涸的喷口，建成后将其永久封死。" },
  },
  levels: {
    c1: {
      name: "着陆",
      brief: "一个喷口，在东面十五格外，地势低得多，它的淤泥池已经在扩散。把电网铺下去，烧干它，再封盖。",
      hints: [
        "电塔是延伸电网的廉价办法。所有建筑都必须在某座已建成建筑的六格范围内。",
        "灼枪能烧掉淤泥。把它们放在高处：它们不能向上瞄准。",
        "喷口在两次喷涌之间干涸时，在上面放一个封盖，并持续供能。",
        "着陆舱每秒产生一点能量，这里又没有矿脉。电塔能从它所在高度上看得到的平地多收集一点能量。别建超出需要的东西。",
      ],
    },
    c2: {
      name: "两线作战",
      brief: "两个喷口，分在山丘两侧。用汲取器开采矿脉获取能量，攒下来建封盖。",
      hints: [
        "把汲取器放在着陆舱附近发光的矿脉上来获取能量。",
        "能量储存可容纳三十点，相当于半个封盖。每个储能器再加三十。",
      ],
    },
    c3: {
      name: "深坑",
      brief: "三个喷口以缓慢而沉重的脉冲喷涌，下方的盆地会积得很深。抛射炮能打到深处的泥潭。",
      hints: [
        "抛射炮不受高度影响，但打不到三格以内的目标。",
      ],
    },
    c4: {
      name: "远疆",
      brief: "三个喷口分在三个方向，最近的在二十九格外。干线塔能让能量包快速跨越长距离。",
      hints: [
        "干线塔之间可相隔十四格相连，并使能量包速度翻倍。",
        "加速器像电塔一样中继，并使经它转发的每个能量包提速五分之一。能量包总走最快的路线，所以在长线路上建几座加速器，能把流量吸引过来并更快送达。",
      ],
    },
    c5: {
      name: "高原",
      brief: "四个喷口环绕着你的台地，矿脉却只有三处。抽泥泵从浅层淤泥中抽取能量。",
      hints: [
        "抽泥泵只能够到两格内的淤泥，所以要建在岸边，那里淤泥也能够到它。",
      ],
    },
    c6: {
      name: "泛滥平原",
      brief: "你降落在低处，河谷的岸边，四个喷口环绕着你，其中一个离得很近。坚持十分钟。",
      hints: [
        "通电的屏障会让淤泥在其四格范围内的每个格子多爬两级。",
        "选择“标记”，选好高度后涂抹格子；八格内的平地机会把它们抬高或降低。",
      ],
    },
    c7: {
      name: "炮击",
      brief: "三个喷吐者从南面把淤泥抛向你的电网。拦截器能在空中击落泥团。",
      hints: [
        "泥团瞄准你最密集的建筑群。拦截器射程九格，每个泥团需要三次命中。",
      ],
    },
    c8: {
      name: "分水岭",
      brief: "五个喷口和三个喷吐者环绕山峰。用上你的一切。",
      hints: [],
    },
  },
  skirmish: { name: "遭遇战 {seed}", brief: "封堵每一个喷口。" },
};
