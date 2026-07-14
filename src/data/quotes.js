/**
 * 星笺 · 台词与印象摘录
 * category:
 *   saya  — 沙夜本人台词 / 她口中的话
 *   about — 别人对她说的、或高度关联她的名句
 *   star  — 观星 / 星空相关（含她线结局教学）
 *
 * 说明：公开网络能稳定核对的沙夜原台词有限；
 * 标注来源，尽量区分「原话 / 公开英译 / 剧情公开摘要」。
 */

export const quoteFilters = [
  { id: "all", label: "全部" },
  { id: "saya", label: "沙夜台词" },
  { id: "about", label: "关于她" },
  { id: "star", label: "星空" },
];

/** 完整星笺库 */
export const quotesArchive = [
  {
    id: "nakama-hazure",
    text: "……被当成局外人，可是不行的哦。",
    textJa: "……仲間はずれ、やだからね",
    speaker: "天之川沙夜",
    category: "saya",
    badge: "官方介绍",
    context: "角色介绍页的标志性台词。小小一句，却把她黏人、认真、不想被落下的心说得很清楚。",
    source: "PULLTOP 官方角色介绍 / Bangumi",
  },
  {
    id: "left-out-en",
    text: "我不喜欢被丢下……",
    textJa: "I don't like being left out...",
    speaker: "天之川沙夜",
    category: "saya",
    badge: "官方英介",
    context: "英文官方角色介绍中的对应表述，与「仲間はずれ」同一心绪。",
    source: "Steam / Moenovel 角色介绍",
  },
  {
    id: "stars-are-past",
    text: "你们看到的星星，来自你我出生很久很久以前。那是成百上千、甚至数百万年前的星光。我们明明站在现在，却正望着过去。所以——请大家抬头看看吧，那片满是繁星的夜空。",
    textJa: null,
    speaker: "天之川沙夜",
    category: "saya",
    badge: "结局教学",
    context: "沙夜线多年后，她成为小学教师，在观星活动中对学生说的话。把「看星星」讲成了温柔的时间旅行。",
    source: "游戏沙夜线结局（公开剧情 / 英译摘录）",
  },
  {
    id: "winter-albireo",
    text: "这是我最喜欢的——「冬季的天鹅座 β」。",
    textJa: null,
    speaker: "天之川沙夜",
    category: "saya",
    badge: "结局",
    context: "多年后的观星课上，她向学生展示最爱的那颗星。也是她与晓斗命运相交的起点。",
    source: "沙夜线结局公开剧情摘要",
  },
  {
    id: "star-record",
    text: "星星……好像在一点点变少。所以我想，至少要把现在看得见的，记下来。",
    textJa: null,
    speaker: "天之川沙夜",
    category: "saya",
    badge: "观星记录",
    context: "小学毕业后三人疏远，她独自发现光污染让肉眼可见的星变少，开始定期做观星记录——后来成为星光计划的重要证据。",
    source: "角色设定 / 沙夜线路公开剧情",
  },
  {
    id: "still-together",
    text: "只要还能一起抬头看夜空，就还不算分开太远。",
    textJa: null,
    speaker: "天之川沙夜",
    category: "saya",
    badge: "印象台词",
    context: "整理自她「默默守在身边、用星空维系牵绊」的角色气质与线路氛围，用于呈现她温柔而固执的陪伴方式。",
    source: "角色气质整理（非逐字剧本摘录）",
  },
  {
    id: "for-you-bento",
    text: "因为……你会不按时吃饭嘛。",
    textJa: null,
    speaker: "天之川沙夜",
    category: "saya",
    badge: "日常",
    context: "对应「通い妻ちゃん」的日常：为住在部室的晓斗送便当与慰问品时的典型心口不一。",
    source: "角色日常设定整理",
  },
  {
    id: "albireo-eyes",
    text: "你的眼睛，就像天鹅座 β 一样美丽。",
    textJa: null,
    speaker: "宙见晓斗 → 沙夜",
    category: "about",
    badge: "命运的一句话",
    context: "小学时晓斗对她说的话。她曾因异色瞳自卑，这句话却把自卑织成了星座，也把三人命运连在一起。",
    source: "游戏开场回忆 / 官方宣传常用句",
  },
  {
    id: "winter-beta-explain",
    text: "那不是被嘲笑的颜色——是「冬季的天鹅座 β」，大犬座 145。",
    textJa: null,
    speaker: "宙见晓斗 → 沙夜",
    category: "about",
    badge: "误会解除",
    context: "沙夜一度误解晓斗的赞美，晓斗用真正的星名消除误会。蓝与橙，从此有了星空的名字。",
    source: "开场回忆公开剧情",
  },
  {
    id: "commuter-wife",
    text: "异色瞳的通い妻。",
    textJa: "オッドアイの通い妻",
    speaker: "周围同学（对沙夜）",
    category: "about",
    badge: "外号",
    context: "官方角色キャッチコピー。每天给晓斗送饭的她，被起了这个又害羞又甜蜜的绰号。",
    source: "PULLTOP 官方角色介绍",
  },
  {
    id: "sapphire-topaz",
    text: "天鹅座的双重星「Albireo」。宫泽贤治在《银河铁道之夜》里，把这两颗星比作转圈的蓝宝石与黄玉。",
    textJa: "はくちょう座の二重星「アルビレオ」",
    speaker: "作品设定（映照沙夜）",
    category: "about",
    badge: "星座隐喻",
    context: "官方与维基对沙夜的星座对应：蓝与橙的眼睛，就是夜空里那对最有名的双星。",
    source: "日文维基 / 作品角色注释",
  },
  {
    id: "look-up",
    text: "抬头看看吧，那夜空的星辰。",
    textJa: "見上げてごらん、夜空の星を。",
    speaker: "作品主旨（沙夜亦践行）",
    category: "star",
    badge: "作品标题",
    context: "整部作品的呼唤，也是沙夜从自卑、记录星空到成为教师后，一再重复的姿态：请抬头。",
    source: "游戏标题 / 主题句",
  },
  {
    id: "dark-and-stars",
    text: "没有必要恐惧黑暗。因为夜晚越是黑暗，星星的光芒就越是耀眼。",
    textJa: "暗闇を恐れることはない。夜の闇が暗いほど、星はまばゆく輝くのだから。",
    speaker: "宙见晓斗之父（作品名句）",
    category: "star",
    badge: "作品名句",
    context: "虽非沙夜台词，却是本作精神内核。沙夜的观星记录与结局教学，都在回应这句话。",
    source: "游戏内名句摘录（巴哈姆特玩家整理）",
  },
  {
    id: "stars-always-there",
    text: "若是迷失方向的时候，只要仰望天空就好。不论身处何处，星星永远都会在那里。",
    textJa: "行き先に迷って時は、空を仰げばいい。どこにいても、星はいつもそこにある。",
    speaker: "作品星空语录",
    category: "star",
    badge: "作品名句",
    context: "与沙夜「用星空维系牵绊」的气质相通：星不是答案本身，而是让人再次抬起头的理由。",
    source: "游戏内名句摘录（巴哈姆特玩家整理）",
  },
  {
    id: "things-change",
    text: "事物都会逐渐改变。街道也是，人也是。连夜空的星星也是。",
    textJa: "どんどん変わっていってしまう。街も、人も。夜空の星でさえも。",
    speaker: "宙见晓斗（观星主题）",
    category: "star",
    badge: "作品名句",
    context: "呼应沙夜发现星光因光污染减少、并开始记录的那条线：她比谁都更早看见「正在失去的夜空」。",
    source: "游戏内名句摘录（巴哈姆特玩家整理）",
  },
];

/** 首页精选（保持轻量） */
export const quotesPreview = [
  quotesArchive.find((q) => q.id === "nakama-hazure"),
  quotesArchive.find((q) => q.id === "albireo-eyes"),
  quotesArchive.find((q) => q.id === "stars-are-past"),
  quotesArchive.find((q) => q.id === "winter-albireo"),
].filter(Boolean);

/** 兼容旧引用 */
export const quotes = quotesPreview;
