/**
 * 陪伴页文案与配置
 * 问候 / 陪伴句 / 小对话均为气质整理向原创，非游戏剧本逐字摘录。
 * 时段：5–10 晨 · 10–16 午 · 16–20 傍晚 · 20–24 夜 · 0–5 深夜
 */

export const greetings = {
  morning: [
    { text: "早安……你醒得比星星还早一点呢。" },
    { text: "早上好。今天也……要好好吃早餐哦。" },
    { text: "清晨的光有点刺眼呢。不过，能见到你就好。" },
    { text: "嗯……早。我、我刚刚在看窗外的云。" },
  ],
  afternoon: [
    { text: "午安。忙吗？……不忙的话，在这里歇一会儿也好。" },
    { text: "下午了呢。便当……你有好好吃吗？" },
    { text: "阳光有点强。要是晚上能一起看星就好了。" },
    { text: "你来了。我正好……在等你。" },
  ],
  evening: [
    { text: "傍晚了。天色一点点沉下去……像要把星星请出来。" },
    { text: "晚上好。今天也辛苦了。……要不要先坐下来？" },
    { text: "日落之后，世界会安静一点。我喜欢这种时候。" },
    { text: "你回来了。那……今晚也一起抬头看看吧。" },
  ],
  night: [
    { text: "夜深了呢。星星已经排好队了。" },
    { text: "晚上好。今天的夜空……看起来很温柔。" },
    { text: "这么晚还来看我……会开心的，可是也要注意休息哦。" },
    { text: "只要还能一起抬头看夜空，就还不算分开太远。" },
  ],
  late: [
    { text: "……还没睡吗？那就，陪你再坐一会儿。" },
    { text: "深夜的星星特别亮。但你……也不要熬太久哦。" },
    { text: "这个点还醒着，是心事太吵，还是单纯睡不着？" },
    { text: "嘘。夜里说话要轻一点……我会在这里的。" },
  ],
};

/** 陪伴向短句（可与沙夜星语混入随机池） */
export const companionLines = [
  { id: "cl-stay", text: "被当成局外人，可是不行的哦。", mood: "soft" },
  { id: "cl-stars-link", text: "只要还能一起抬头看夜空，就还不算分开太远。", mood: "star" },
  { id: "cl-bento", text: "因为……你会不按时吃饭嘛。", mood: "care" },
  { id: "cl-wait", text: "我没有特意等你。……只是，刚好也在这里而已。", mood: "tease" },
  { id: "cl-record", text: "星星好像在一点点变少。所以至少要把现在看得见的，记下来。", mood: "star" },
  { id: "cl-eyes", text: "……别那样盯着看。我的眼睛，又不是展品。", mood: "soft" },
  { id: "cl-quiet", text: "不说话也可以的。安静地待在一起，也算是在聊天。", mood: "soft" },
  { id: "cl-miss", text: "你不在的时候，我会数路过的流星……虽然大多只是飞机。", mood: "tease" },
  { id: "cl-warm", text: "冷吗？那就再靠近一点点。……只是一点点。", mood: "care" },
  { id: "cl-proud", text: "今天有好好努力的话，就……夸你一下。很棒哦。", mood: "care" },
  { id: "cl-jealous", text: "你刚才是在看别人吗？……没有就好。我、我只是随便问问。", mood: "tease" },
  { id: "cl-albireo", text: "那是我最喜欢的——冬季的天鹅座 β。蓝和橙……像两颗牵着手的星。", mood: "star" },
  { id: "cl-here", text: "不用着急找话题。我在就够了……大概。", mood: "soft" },
  { id: "cl-tomorrow", text: "明天也要见面哦。说好了的话，反悔可不行。", mood: "care" },
  { id: "cl-dark", text: "不用害怕黑暗。夜越暗，星星就越亮。", mood: "star" },
  { id: "cl-share", text: "这颗星……分你一半。另一半，我自己留着。", mood: "soft" },
];

export const timerPresets = [
  { id: "5", minutes: 5, label: "一会儿" },
  { id: "15", minutes: 15, label: "一小段" },
  { id: "25", minutes: 25, label: "认真陪一会" },
];

export const timerDoneLines = [
  "时间到了呢。……谢谢你愿意陪我看这么久。",
  "结束了。不过，星还在天上，你也还在这里。",
  "做得很好。要是累了，就先休息一下吧。",
  "这段夜空，已经记在心里了。下次……还来好吗？",
  "计时停了，但我还在。想再待一会儿也可以。",
];

/**
 * 分支小对话
 * nodes: { id: { speaker, text, choices?: [{ label, next }] } }
 * 无 choices 的节点视为结束。
 */
export const dialogues = [
  {
    id: "stargaze-night",
    title: "今晚的星",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "今晚的能见度还不错。……要不要一起找找天鹅座？",
        choices: [
          { label: "好啊，你带路", next: "n1a" },
          { label: "我只想安静坐着", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "那……先从那一带亮一点的地方开始。别急，眼睛适应黑暗要一点时间。",
        choices: [
          { label: "你经常一个人这样看吗？", next: "n2a" },
          { label: "你的眼睛在夜里也很好看", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "……嗯。那就不说话。只是，别走远了。",
        choices: [
          { label: "（轻轻点头）", next: "n2c" },
          { label: "其实我还是想听你说两句", next: "n2a" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "以前会一个人记星图。后来发现……有人在旁边的时候，夜空会显得更近一点。",
        choices: [{ label: "那今晚就让我陪着", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "……！突、突然说什么呢。那是……天鹅座 β 的颜色，才不是为了给你看的。",
        choices: [{ label: "抱歉，我只是觉得温柔", next: "n3" }],
      },
      n2c: {
        speaker: "沙夜",
        text: "（轻声）……有你在，呼吸好像都顺一点。",
        choices: [{ label: "我也是", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "那就这样吧。今晚的星，我们一起收下。——下次也要来哦。",
      },
    },
  },
  {
    id: "bento-day",
    title: "便当与日常",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "……你中午到底有没有好好吃饭？别用「忘了」这种理由敷衍我。",
        choices: [
          { label: "吃了，真的", next: "n1a" },
          { label: "……被你抓到了", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "是吗。那……下次也记得。不是为了我，是为了你自己。……当然，我也会在意就是了。",
        choices: [
          { label: "你总是这样操心", next: "n2a" },
          { label: "谢谢你一直记得", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "果然。我就说你会这样。……拿去，这是备用的。不要有意见。",
        choices: [
          { label: "你准备得也太周到了", next: "n2a" },
          { label: "通い妻……名不虚传", next: "n2c" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "因为你会乱来啊。放着不管的话，我会……更担心。",
        choices: [{ label: "那我以后会注意的", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "……嗯。被道谢的话，反而有点不好意思。下次，记得主动告诉我你吃了什么。",
        choices: [{ label: "好，约好了", next: "n3" }],
      },
      n2c: {
        speaker: "沙夜",
        text: "那、那个外号禁止再提！……不过，便当你可以收下。",
        choices: [{ label: "好好，我闭嘴吃", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "那就这样。空饭盒……记得还给我。我会在同一时间等你的。",
      },
    },
  },
  {
    id: "heterochromia",
    title: "异色瞳与双星",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "你看我的眼睛时，会觉得奇怪吗？……可以老实说。",
        choices: [
          { label: "一点都不奇怪，很好看", next: "n1a" },
          { label: "最初会留意，但现在只觉得是你", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "……谢谢。以前我会用墨镜藏起来。是有人告诉我，这像天鹅座的双星，我才慢慢敢抬起头。",
        choices: [
          { label: "那个人说得很对", next: "n2a" },
          { label: "现在的你，已经很耀眼了", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "「只觉得是我」……这样的说法，比夸张的赞美更让我安心。",
        choices: [
          { label: "因为那就是你啊", next: "n2a" },
          { label: "蓝与橙都是你的一部分", next: "n2b" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "蓝和橙并排的时候，像两颗不会走散的星。我也希望……和重要的人是这样。",
        choices: [{ label: "我们不会走散的", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "耀眼什么的……太夸张了。不过，如果你愿意继续看着，我就……再努力一点，不躲起来。",
        choices: [{ label: "我会一直看着", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "那就约好了。下次观星的时候，也把这双眼睛……当作夜空的一部分吧。",
      },
    },
  },
];

/** localStorage key */
export const STORAGE_KEY = "amanogawa-companion-v1";
