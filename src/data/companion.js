/**
 * 陪伴页文案与配置
 * 问候 / 陪伴句 / 小对话 / 随口互动均为气质整理向原创，非游戏剧本逐字摘录。
 * 语气：省略号与迟疑、心口不一、黏人、送饭、异色瞳、观星、小醋意。
 * 时段：5–10 晨 · 10–16 午 · 16–20 傍晚 · 20–24 夜 · 0–5 深夜
 */

export const greetings = {
  morning: [
    { text: "早安……你醒得比星星还早一点呢。" },
    { text: "早上好。今天也……要好好吃早餐哦。" },
    { text: "清晨的光有点刺眼呢。不过，能见到你就好。" },
    { text: "嗯……早。我、我刚刚在看窗外的云。" },
    { text: "早。……头发还乱着也没关系。先跟你说一声就好。" },
    { text: "新的一天。说好的约定……你还记得吧？" },
    { text: "晨星已经收起来了。那就，换我来接你一会儿。" },
  ],
  afternoon: [
    { text: "午安。忙吗？……不忙的话，在这里歇一会儿也好。" },
    { text: "下午了呢。便当……你有好好吃吗？" },
    { text: "阳光有点强。要是晚上能一起看星就好了。" },
    { text: "你来了。我正好……在等你。" },
    { text: "午后容易犯困。……靠一会儿也行，我不会笑你。" },
    { text: "茶还温着。不是特意泡的，是……刚好多倒了一杯。" },
    { text: "作业还是工作？……都要劳逸结合。这是优等生的忠告。" },
  ],
  evening: [
    { text: "傍晚了。天色一点点沉下去……像要把星星请出来。" },
    { text: "晚上好。今天也辛苦了。……要不要先坐下来？" },
    { text: "日落之后，世界会安静一点。我喜欢这种时候。" },
    { text: "你回来了。那……今晚也一起抬头看看吧。" },
    { text: "晚饭吃了吗？……回答之前请先想清楚，我会听语气的。" },
    { text: "路灯亮了。星星还在害羞，我们可以先聊两句。" },
    { text: "傍晚的风有点凉。……袖子，借你挽一下也可以。" },
  ],
  night: [
    { text: "夜深了呢。星星已经排好队了。" },
    { text: "晚上好。今天的夜空……看起来很温柔。" },
    { text: "这么晚还来看我……会开心的，可是也要注意休息哦。" },
    { text: "只要还能一起抬头看夜空，就还不算分开太远。" },
    { text: "能见度不错。……今晚把天鹅座 β 分你一半，好不好？" },
    { text: "夜空很安静。你要是愿意，我可以把今天的星记念给你听。" },
    { text: "别急着找话题。坐下来，星会自己说话的。" },
  ],
  late: [
    { text: "……还没睡吗？那就，陪你再坐一会儿。" },
    { text: "深夜的星星特别亮。但你……也不要熬太久哦。" },
    { text: "这个点还醒着，是心事太吵，还是单纯睡不着？" },
    { text: "嘘。夜里说话要轻一点……我会在这里的。" },
    { text: "再晚的话，我会开始担心。先喝口水，好吗？" },
    { text: "……我可以陪到你眼皮变重。但明天的你，也要好好在。" },
    { text: "深夜适合说真心话。不过你不说，我也不会逼你。" },
  ],
};

/** 陪伴向短句（可与沙夜星笺混入随机池） */
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
  { id: "cl-nickname", text: "「通い妻」什么的……禁止再叫。便当我会照样送来。", mood: "tease" },
  { id: "cl-sleeve", text: "人多的时候……可以让我拽一下袖口吗？我不想走散。", mood: "soft" },
  { id: "cl-cloud", text: "今天云太厚了也没关系。你在的话，抬头是灰的也算数。", mood: "star" },
  { id: "cl-honest", text: "第一秒想说没关系，第二秒想说不要走。……你听到的是第几秒？", mood: "soft" },
  { id: "cl-scold", text: "笨蛋。……这种时候该说「谢谢沙夜」，不是傻笑。", mood: "tease" },
  { id: "cl-half-lie", text: "才没有在等。……风舒服，多坐了一会儿而已。", mood: "tease" },
  { id: "cl-name", text: "天之川……就是银河。所以我的名字，好像天生就该抬头。", mood: "star" },
  { id: "cl-rest", text: "先睡吧。星会等你的……我替你看一会儿。", mood: "care" },
  { id: "cl-double", text: "双星会互相绕着转。……我也想做你身边那颗不会走散的。", mood: "soft" },
  { id: "cl-rain", text: "下雨就改成听雨。观星可以改期，「在一起」不行。", mood: "care" },
  { id: "cl-praise", text: "被你夸奖的话……眼睛会湿。是风太大了，才不是别的。", mood: "soft" },
  { id: "cl-secret", text: "记录本页边有你的名字。……那种，不算数。不许笑。", mood: "tease" },
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
  "嗯。……安静地陪着，比说很多话更让我安心。",
  "时间走得比流星还快。可是你的位置，我记住了。",
  "辛苦了。作为奖励……再分你一颗小星，好吗？",
];

/**
 * 随口互动：点一下，沙夜回一句（随机池）
 * mood: soft | care | tease | star
 */
export const interactions = [
  {
    id: "hello",
    label: "打个招呼",
    hint: "普通地问声好",
    replies: [
      { text: "……嗯。你来了。我、我有好好在这里等着。", mood: "soft" },
      { text: "你好。……这种时候该笑一下吗？有点紧张。", mood: "soft" },
      { text: "嗨。……才没有因为你突然说话而吓到。", mood: "tease" },
      { text: "嗯，我在听。继续说也可以，不说也没关系。", mood: "soft" },
    ],
  },
  {
    id: "miss",
    label: "说想你了",
    hint: "直球一点",
    replies: [
      { text: "……！那、那种话突然说出口，我会不知道把手放哪。", mood: "soft" },
      { text: "我也……有一点点。数星星的时候，会数到你。", mood: "soft" },
      { text: "想我的话，就早点来。反悔说不想，可不行。", mood: "care" },
      { text: "……听得到。所以，再靠近一点也可以。", mood: "soft" },
    ],
  },
  {
    id: "hungry",
    label: "说肚子饿了",
    hint: "通い妻模式启动",
    replies: [
      { text: "果然。……我就说你会这样。便当在这儿，不要客气。", mood: "care" },
      { text: "不按时吃饭的坏习惯……唉。先吃，训话等会儿。", mood: "care" },
      { text: "空着肚子看星星会看不清。这是科学。——大概。", mood: "tease" },
      { text: "备用的还有一份。不是为你准备的，是份量多了。", mood: "tease" },
    ],
  },
  {
    id: "tired",
    label: "说好累",
    hint: "想被轻轻接住",
    replies: [
      { text: "那就靠过来。……肩膀借你。星我替你看着。", mood: "care" },
      { text: "累了就休息。强撑的脸，我一眼就看得出来。", mood: "care" },
      { text: "……辛苦了。这句话，我想认真说给你听。", mood: "soft" },
      { text: "闭上眼也可以。我还在，不会变成局外人的。", mood: "soft" },
    ],
  },
  {
    id: "star-ask",
    label: "问今晚的星",
    hint: "请她当向导",
    replies: [
      { text: "先看那一带亮一点的。适应黑暗要一点时间……别急。", mood: "star" },
      { text: "今晚的主角是天鹅座 β。蓝和橙，并排的时候最好看。", mood: "star" },
      { text: "街灯有点吵呢。……我们小声一点，星才肯出来。", mood: "star" },
      { text: "找到的话要告诉我。我想看你抬起头时的表情。", mood: "star" },
    ],
  },
  {
    id: "praise-eyes",
    label: "夸她的眼睛",
    hint: "蓝与橙",
    replies: [
      { text: "……突、突然说什么呢。那是双星的颜色，才不是展品。", mood: "tease" },
      { text: "以前会想藏起来。被你说好看的话……可以再勇敢一点。", mood: "soft" },
      { text: "风好大。……眼睛湿了只是因为风。绝对是。", mood: "soft" },
      { text: "谢谢。……比「奇怪」这种词，好听一万倍。", mood: "soft" },
    ],
  },
  {
    id: "tease-wife",
    label: "叫通い妻",
    hint: "危险发言",
    replies: [
      { text: "那、那个称呼禁止！……便当可以收，外号不行。", mood: "tease" },
      { text: "再叫的话，午饭……不，还是会送。但我会鼓着脸。", mood: "tease" },
      { text: "同学乱起的。……你不要跟着起哄。", mood: "tease" },
      { text: "哼。……你要是再说一次，我就坐到你旁边，看你还敢不敢。", mood: "tease" },
    ],
  },
  {
    id: "jealous",
    label: "假装看别人",
    hint: "轻轻试探醋意",
    replies: [
      { text: "刚才……你是在看谁？没有就好。我只是确认一下。", mood: "tease" },
      { text: "……视线可以还给我吗？星很多，可是我只有一个。", mood: "soft" },
      { text: "开、开玩笑的对吧？……真的的话，我会有一点点不高兴。", mood: "tease" },
      { text: "可以看星，可以看夜空。……别人的话，尽量少一点。", mood: "soft" },
    ],
  },
  {
    id: "promise",
    label: "约明天再见",
    hint: "立下小约定",
    replies: [
      { text: "好。说好了的话……反悔可不行。我会认真记住的。", mood: "care" },
      { text: "明天同一时间。……校门口，还是这里？你选。", mood: "care" },
      { text: "约定要收进星图里。……开玩笑的。收进心里就够了。", mood: "soft" },
      { text: "嗯。那今晚可以安心一点睡了。", mood: "soft" },
    ],
  },
  {
    id: "silent",
    label: "只想安静待着",
    hint: "不说话也可以",
    replies: [
      { text: "……嗯。那就不说话。只是，别走远了。", mood: "soft" },
      { text: "安静也算聊天。你的呼吸声，听得很清楚。", mood: "soft" },
      { text: "好。我把今晚的星，默默记下来。……你也在记录里。", mood: "star" },
      { text: "（轻轻点头）……有你在，就够了。", mood: "soft" },
    ],
  },
  {
    id: "sorry",
    label: "说声抱歉",
    hint: "迟到或失约",
    replies: [
      { text: "……下次早一点就好。被丢下的感觉，我不喜欢。", mood: "soft" },
      { text: "道歉收到了。作为交换，明天要好好吃饭。成交？", mood: "care" },
      { text: "没关系。——第一秒是这样说的。第二秒其实有点失落。", mood: "soft" },
      { text: "手伸出来。……不是罚你，是确认你还在。", mood: "care" },
    ],
  },
  {
    id: "goodnight",
    label: "道晚安",
    hint: "准备离开时",
    replies: [
      { text: "晚安。……明天见。说短一点，不然舍不得松手。", mood: "soft" },
      { text: "睡吧。星会等你，我也会。……在你心里的位置。", mood: "care" },
      { text: "晚安。做个不会掉进黑暗的梦，好吗？", mood: "star" },
      { text: "……去吧。但别变成「再也不见」。那种，不行。", mood: "soft" },
    ],
  },
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
  {
    id: "left-out",
    title: "不要丢下我",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "……今天大家好像都聚在一起说话。我站在旁边的时候，你会注意到吗？",
        choices: [
          { label: "当然，我一直看着你", next: "n1a" },
          { label: "抱歉，刚才没及时把你拉进来", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "……是吗。那就好。被当成局外人，可是不行的哦。连你也把我落下的话，我会……真的不开心。",
        choices: [
          { label: "不会把你落下的", next: "n2a" },
          { label: "那以后手牵紧一点？", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "道、道歉的话……收到了。不是要你时刻盯着我。只是，偶尔回头看一眼，我就安心很多。",
        choices: [
          { label: "我会更注意的", next: "n2a" },
          { label: "其实你一直都在我视线里", next: "n2b" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "说好了哦。约定要认真。……反悔的人，晚上看星星要被我念很久。",
        choices: [{ label: "我不怕被你念", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "牵手什么的……太、太直接了。不过，袖口的话……可以借我拽一下。",
        choices: [{ label: "袖口随时给你", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "……谢谢。有你在的圈里，我好像就不用假装坚强了。",
      },
    },
  },
  {
    id: "jealous-little",
    title: "一点点醋意",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "你刚才……跟别人笑得很开心呢。我、我没有在监视。只是路过。",
        choices: [
          { label: "那是普通同学，别多想", next: "n1a" },
          { label: "吃醋了？（笑）", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "普通……就好。不是不让你交朋友。只是，笑成那样的时候，也可以分我一点眼神吗？",
        choices: [
          { label: "你的份额最多", next: "n2a" },
          { label: "那我现在只看着你", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "才、才没有！……有一点点的话，也是因为你太迟钝了。",
        choices: [
          { label: "对不起，是我不好", next: "n2a" },
          { label: "那我的目光加倍补给你", next: "n2b" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "……哼。知道就好。星很多，可是我的耐心……没有那么多。",
        choices: [{ label: "以后会先看你", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "加倍……太夸张了。正常地看着我就够。……真的。",
        choices: [{ label: "好，正常地、认真地看你", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "那、那就这样。今晚的星，也不许分给别人看太久哦。……开玩笑的。大概。",
      },
    },
  },
  {
    id: "star-notebook",
    title: "观星记录本",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "这本记录……不要随便翻。里面是星的事。……也有一点点别的。",
        choices: [
          { label: "我想看你认真记下的星", next: "n1a" },
          { label: "「别的」是什么？", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "……可以。看星的那几页。页边的字……请当它不存在。",
        choices: [
          { label: "我保证只看星图", next: "n2a" },
          { label: "页边如果写着我，我会很高兴", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "就、就是随手涂鸦！日期、天气、心情……还有谁在旁边之类的。不是情书。",
        choices: [
          { label: "听起来很珍贵", next: "n2a" },
          { label: "原来我也被记录过吗？", next: "n2b" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "星星在变少。至少要把现在看得见的留下来。……你也是，我想留下来的那种。",
        choices: [{ label: "我会一直在你的记录里", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "……有几次。写得很小。那种，绝对不算数。——你要是笑，我就收回去。",
        choices: [{ label: "我不笑，我收下", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "那……今天这一页，也把你写进去吧。天气：你在。能见度：很好。",
      },
    },
  },
  {
    id: "rainy-day",
    title: "下雨的夜晚",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "下起来了呢。……观星是看不成了。你还要撑伞回去吗？",
        choices: [
          { label: "一起听雨也好", next: "n1a" },
          { label: "伞只有一把的话……", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "听雨……也可以。计划可以改，陪在你身边这件事……不要改。",
        choices: [
          { label: "说得很像约定", next: "n2a" },
          { label: "那今晚就听雨到停", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "那就靠近一点。肩膀湿了的话，我会觉得是我没照顾好。……别多想，是责任感。",
        choices: [
          { label: "责任感说得很可爱", next: "n2a" },
          { label: "那我紧一点", next: "n2b" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "可、可爱什么的……雨声太大了，我没听清。再、再说一遍也不许。",
        choices: [{ label: "好好，听雨", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "……嗯。雨停之前，星在云上面等着。我们也在这里等着就好。",
        choices: [{ label: "等到雨停，也等到下次晴夜", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "那就这样。雨声当背景音。……你的体温，当主旋律。才、才不是情话。",
      },
    },
  },
  {
    id: "late-worry",
    title: "深夜未归",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "这么晚了还在外面……是忙，还是睡不着？老实说。",
        choices: [
          { label: "有点睡不着，想找你", next: "n1a" },
          { label: "忙完了，顺路来看看", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "……那就坐下。心事可以慢慢说，不说的话，我也陪着。只是，不要一个人熬到天亮。",
        choices: [
          { label: "有你在就好多了", next: "n2a" },
          { label: "能握一下手吗？", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "顺路……也好。忙完还记得来，我会……高兴的。下次早一点，我少担心一点。",
        choices: [
          { label: "让你担心了，抱歉", next: "n2a" },
          { label: "下次用消息报平安", next: "n2b" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "嗯。深夜的星很亮，可是人要是累坏了……亮也没用。你比星重要一点。一点点。",
        choices: [{ label: "这句话我收下了", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "手……可以。握紧一点也没关系。确认你还温热的，我才能放心去睡。",
        choices: [{ label: "那我们都早点休息", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "那就……再坐五分钟。五分钟后，必须说晚安。这是沙夜的强制观护。",
      },
    },
  },
  {
    id: "winter-near",
    title: "冬天靠近一点",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "冬天最好。……天鹅座 β 会更清楚。还有，你比较容易冷。",
        choices: [
          { label: "所以你会靠近我？", next: "n1a" },
          { label: "那我的围巾借你", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "才不是因为想靠近！是……取暖效率的问题。科学。",
        choices: [
          { label: "科学说得很好", next: "n2a" },
          { label: "那科学允许我搂住你吗？", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "围巾……谢谢。上面有你的味道呢。……我、我是说洗涤剂。",
        choices: [
          { label: "戴着挺合适的", next: "n2a" },
          { label: "那明天也戴着来见我", next: "n2b" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "……你老是这样接话。我会当真的。当真的话，责任要你负。",
        choices: [{ label: "我负得起", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "搂什么的……至少先问星星同不同意。——开玩笑的。你可以……轻轻的。",
        choices: [{ label: "轻轻的，像落星一样", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "哈——白气像小小星云。……傻话。和你在一起，就会想说傻话。",
      },
    },
  },
  {
    id: "clubroom",
    title: "天文部室",
    start: "n0",
    nodes: {
      n0: {
        speaker: "沙夜",
        text: "部室又乱了。……我帮你收拾一点。不是在意你，是看不下去。",
        choices: [
          { label: "谢谢你总是来", next: "n1a" },
          { label: "别收拾我的星图草稿！", next: "n1b" },
        ],
      },
      n1a: {
        speaker: "沙夜",
        text: "谢、谢什么。便当和毛巾是顺手。你要是再把杯子乱放，我就……每天来监督。",
        choices: [
          { label: "听起来很像同居预告", next: "n2a" },
          { label: "那我改，别生气", next: "n2b" },
        ],
      },
      n1b: {
        speaker: "沙夜",
        text: "星图我认得出来。会单独叠好。……上面的咖啡渍，是你的杰作吗？",
        choices: [
          { label: "……是我不小心", next: "n2b" },
          { label: "那是灵感的痕迹", next: "n2a" },
        ],
      },
      n2a: {
        speaker: "沙夜",
        text: "同居什么的……禁止提前剧透！……不过，把这里整理得像能生活的样子，我不讨厌。",
        choices: [{ label: "有你在才像生活", next: "n3" }],
      },
      n2b: {
        speaker: "沙夜",
        text: "知道就好。乱来的人，要被优等生念叨——这是规矩。",
        choices: [{ label: "我接受沙夜的规矩", next: "n3" }],
      },
      n3: {
        speaker: "沙夜",
        text: "窗户打开一点。……晚上风进来的时候，星味会浓一点。你也是。才不是说你有味道。",
      },
    },
  },
];

/** localStorage key */
export const STORAGE_KEY = "amanogawa-companion-v1";
