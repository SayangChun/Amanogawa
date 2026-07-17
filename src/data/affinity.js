/**
 * 好感度系统配置（独立于陪伴页）
 * 0–100，星象阶段；本机 localStorage；每日来源上限。
 * 好感页可直接互动；陪伴页的行为也会累计到同一套数值。
 */

export const AFFINITY_MAX = 100;

/** 独立存储，不与陪伴状态混写 */
export const AFFINITY_STORAGE_KEY = "amanogawa-affinity-v1";

/** 旧版写在陪伴 state 里的字段，首次启动时迁移一次 */
export const COMPANION_STORAGE_KEY_LEGACY = "amanogawa-companion-v1";

/** @type {{ min: number, id: string, name: string, short: string, desc: string }[]} */
export const affinityStages = [
  {
    min: 0,
    id: "meet",
    name: "初识的星光",
    short: "初识",
    desc: "还只是擦肩的夜空。多来看看，她会慢慢记住你。",
  },
  {
    min: 12,
    id: "path",
    name: "夜空下的同路人",
    short: "同路",
    desc: "会在同一片星下停一会儿。袖口，或许可以轻轻拽一下。",
  },
  {
    min: 28,
    id: "sleeve",
    name: "愿意牵住的袖口",
    short: "袖口",
    desc: "被当成局外人，已经不行了。她会在意你有没有按时吃饭。",
  },
  {
    min: 48,
    id: "half-star",
    name: "分你一半的星",
    short: "分星",
    desc: "天鹅座 β 可以分你一半。另一半，她还自己留着。",
  },
  {
    min: 68,
    id: "binary",
    name: "不会走散的双星",
    short: "双星",
    desc: "蓝与橙并排。约好了的话，反悔可不行。",
  },
  {
    min: 88,
    id: "milky",
    name: "银河的约定",
    short: "银河",
    desc: "天之川……就是银河。你已经写进她的星图页边了。",
  },
];

/**
 * 加分规则
 * bucket: affinityDaily 字段名
 * group: affinity | companion —— 便于页面分区说明
 */
export const affinityRules = {
  affinityVisit: {
    bucket: "affinityVisit",
    points: 2,
    dailyCap: 2,
    label: "造访好感页",
    group: "affinity",
    hint: "每天第一次打开好感页",
  },
  gesture: {
    bucket: "gesture",
    points: 2,
    dailyCap: 10,
    label: "心意一拍",
    group: "affinity",
    hint: "在好感页对她说一句",
  },
  starGift: {
    bucket: "starGift",
    points: 1,
    dailyCap: 5,
    label: "送一颗小星",
    group: "affinity",
    hint: "把看得见的光分给她",
  },
  companionVisit: {
    bucket: "companionVisit",
    points: 3,
    dailyCap: 3,
    label: "陪伴回访",
    group: "companion",
    hint: "每天第一次进入陪伴页",
  },
  interact: {
    bucket: "interact",
    points: 1,
    dailyCap: 8,
    label: "随口互动",
    group: "companion",
    hint: "陪伴页的一键回应",
  },
  timerDone: {
    bucket: "timer",
    byPreset: { "5": 2, "15": 4, "25": 6 },
    dailyCap: 12,
    label: "一起看星星",
    group: "companion",
    hint: "陪伴页完成一段观星计时",
  },
  dialogueChoice: {
    bucket: "dialogueChoice",
    points: 1,
    dailyCap: 6,
    label: "小对话选项",
    group: "companion",
    hint: "陪伴页分支对话的选择",
  },
  dialogueComplete: {
    bucket: "dialogueComplete",
    points: 4,
    dailyCap: 12,
    label: "聊完一段",
    group: "companion",
    hint: "每个主题首次聊完有额外心意",
  },
  careCheck: {
    bucket: "careCheck",
    points: 1,
    dailyCap: 4,
    label: "每日关心",
    group: "companion",
    hint: "陪伴页勾选通い妻关心清单",
  },
  calmSession: {
    bucket: "calmSession",
    points: 2,
    dailyCap: 4,
    label: "心事安放",
    group: "companion",
    hint: "陪伴页完成一次安放仪式（每日最多计 2 次）",
  },
  /**
   * 生日心意：每年一次，不走日额度（gainAffinity 内特殊处理）
   */
  birthdayGift: {
    bucket: "birthdayGift",
    points: 8,
    dailyCap: 8,
    oncePerYear: true,
    label: "生日心意",
    group: "affinity",
    hint: "1 月 16 日当天的特别回礼（每年一次）",
  },
};

/**
 * 可切换的站点主题（按好感阶段解锁）
 * body[data-theme="..."]
 */
export const affinityThemes = [
  { id: "default", label: "默认夜空", min: 0, desc: "熟悉的深蓝与星尘。" },
  { id: "blue-night", label: "蓝夜", min: 12, desc: "左眼的颜色铺满天幕——冷静、温柔。" },
  { id: "amber-warm", label: "琥珀暖夜", min: 48, desc: "右眼的暖光，像街边一盏只为你留的灯。" },
  { id: "milky-way", label: "银河", min: 88, desc: "蓝与橙并排。天之川就在页边。" },
];

/**
 * 立绘边框皮肤（陪伴 / 好感肖像）
 * 元素 class: portrait-frame--{id}
 */
export const affinityFrames = [
  { id: "none", label: "素框", min: 0, desc: "最初的那一圈夜光。" },
  { id: "soft-ring", label: "柔光环", min: 28, desc: "愿意靠近时，边框会先软下来。" },
  { id: "dual-glow", label: "双色辉", min: 48, desc: "蓝与琥珀同时亮起。" },
  { id: "constellation", label: "星座框", min: 88, desc: "像把约定画进星图。" },
];

/**
 * 阶段里程碑解锁物（好感页展示；部分在陪伴页生效）
 * kind: line | interaction | dialogue | theme | frame | feature
 */
export const stageRewards = [
  {
    stageId: "meet",
    min: 0,
    unlocks: [
      {
        id: "feat-base",
        kind: "feature",
        label: "基础陪伴",
        desc: "时段问候、随口互动、星笺、看星计时与心事安放。",
      },
      {
        id: "feat-calm",
        kind: "feature",
        label: "心事安放",
        desc: "焦虑或内耗时：被接住 → 双星呼吸 → 写进页边抬头。",
      },
      {
        id: "theme-default",
        kind: "theme",
        themeId: "default",
        label: "默认夜空",
        desc: "最初的那片星空。",
      },
    ],
  },
  {
    stageId: "path",
    min: 12,
    unlocks: [
      {
        id: "theme-blue",
        kind: "theme",
        themeId: "blue-night",
        label: "主题 · 蓝夜",
        desc: "同路之后，夜色会偏一点蓝。",
      },
      {
        id: "feat-care",
        kind: "feature",
        label: "通い妻关心清单",
        desc: "吃饭、喝水、休息、抬头看星——她会认真记着。",
      },
      {
        id: "interact-path",
        kind: "interaction",
        interactionId: "walk-home",
        label: "互动 · 一起走回去",
        desc: "陪伴页多一句「一起走回去」。",
      },
    ],
  },
  {
    stageId: "sleeve",
    min: 28,
    unlocks: [
      {
        id: "frame-soft",
        kind: "frame",
        frameId: "soft-ring",
        label: "边框 · 柔光环",
        desc: "肖像外圈变得更软、更近。",
      },
      {
        id: "interact-sleeve",
        kind: "interaction",
        interactionId: "sleeve-hold",
        label: "互动 · 牵一下袖口",
        desc: "人多的时候……可以让我拽一下。",
      },
      {
        id: "line-sleeve",
        kind: "line",
        label: "心意句 · 袖口",
        desc: "好感页与星笺池会多出专属句子。",
      },
    ],
  },
  {
    stageId: "half-star",
    min: 48,
    unlocks: [
      {
        id: "theme-amber",
        kind: "theme",
        themeId: "amber-warm",
        label: "主题 · 琥珀暖夜",
        desc: "分你一半星之后，暖光会多一点。",
      },
      {
        id: "frame-dual",
        kind: "frame",
        frameId: "dual-glow",
        label: "边框 · 双色辉",
        desc: "蓝与橙同时描边。",
      },
      {
        id: "interact-half",
        kind: "interaction",
        interactionId: "share-star",
        label: "互动 · 分你一半的星",
        desc: "把看得见的光递过去。",
      },
      {
        id: "line-half",
        kind: "line",
        label: "心意句 · 分星",
        desc: "「今天的星，分你多一点。」",
      },
    ],
  },
  {
    stageId: "binary",
    min: 68,
    unlocks: [
      {
        id: "dialogue-secret",
        kind: "dialogue",
        dialogueId: "secret-notebook",
        label: "对话 · 记录本页边",
        desc: "一段只对双星开放的小对话。",
      },
      {
        id: "interact-margin",
        kind: "interaction",
        interactionId: "read-margin",
        label: "互动 · 偷看页边",
        desc: "……页边有你的名字。那种，不算数。",
      },
      {
        id: "line-binary",
        kind: "line",
        label: "心意句 · 双星",
        desc: "有你在的圈里，好像就不用假装坚强了。",
      },
    ],
  },
  {
    stageId: "milky",
    min: 88,
    unlocks: [
      {
        id: "theme-milky",
        kind: "theme",
        themeId: "milky-way",
        label: "主题 · 银河",
        desc: "约定写进星图之后的天色。",
      },
      {
        id: "frame-constellation",
        kind: "frame",
        frameId: "constellation",
        label: "边框 · 星座框",
        desc: "像把整条银河轻轻框住。",
      },
      {
        id: "interact-forever",
        kind: "interaction",
        interactionId: "forever-star",
        label: "互动 · 银河的约定",
        desc: "反悔可不行——说好了的话。",
      },
      {
        id: "line-milky",
        kind: "line",
        label: "心意句 · 银河",
        desc: "天气：你在。能见度：很好。",
      },
    ],
  },
];

/** 阶段提升时沙夜的一句（按 stage id） */
export const affinityLevelUpLines = {
  path: "……最近常见到你呢。不是讨厌。只是，会有点在意。",
  sleeve: "袖口的话……可以借你。别走散就好。",
  "half-star": "这颗星……分你一半。另一半，我自己留着。",
  binary: "双星会互相绕着转。……我也想做你身边那颗不会走散的。",
  milky: "约定要收进星图里。……不，收进心里就够了。你已经在了。",
};

/** 达到阶段后解锁的心意句（好感页展示；陪伴星笺池也可混入） */
export const affinityUnlockLines = [
  {
    min: 28,
    id: "aff-sleeve",
    text: "人多的时候……可以让我拽一下袖口吗？我不想走散。",
    mood: "soft",
  },
  {
    min: 48,
    id: "aff-half",
    text: "今天的星，分你多一点。……因为你来得勤。",
    mood: "star",
  },
  {
    min: 68,
    id: "aff-binary",
    text: "有你在的圈里，我好像就不用假装坚强了。",
    mood: "soft",
  },
  {
    min: 88,
    id: "aff-milky",
    text: "天气：你在。能见度：很好。……页边就写这些，够了。",
    mood: "care",
  },
];

/**
 * 好感页专属「心意」互动
 * 点选后随机回复，并走 gesture 加分
 */
export const affinityGestures = [
  {
    id: "look",
    label: "只是看着她",
    hint: "不必说话",
    replies: [
      { text: "……看太久的话，我会先移开视线。不是讨厌，是……会害羞。", mood: "soft" },
      { text: "我的眼睛又不是展品。……你要是觉得温柔，那、那就多看一会儿也行。", mood: "tease" },
      { text: "（轻轻眨眼）……还在吗？那就好。", mood: "soft" },
    ],
  },
  {
    id: "thanks",
    label: "说声谢谢",
    hint: "为她一直在",
    replies: [
      { text: "谢、谢什么。我只是……刚好也在这里而已。", mood: "tease" },
      { text: "被道谢的话，反而有点不好意思。……但会记着的。", mood: "soft" },
      { text: "那就……也谢谢你愿意来。这种话，一天说一次就够。", mood: "care" },
    ],
  },
  {
    id: "miss",
    label: "说想她了",
    hint: "直球一点",
    replies: [
      { text: "……！那种话突然说出口，我会不知道把手放哪。", mood: "soft" },
      { text: "我也……有一点点。数星星的时候，会数到你。", mood: "soft" },
      { text: "想我的话，就早点来。反悔说不想，可不行。", mood: "care" },
    ],
  },
  {
    id: "star",
    label: "分享今晚的星",
    hint: "把夜空讲给她",
    replies: [
      { text: "你看见的那颗，也分我一半好不好？……开玩笑的。真的分也行。", mood: "star" },
      { text: "讲给我听。你的声音，比街灯更适合当观星背景。", mood: "star" },
      { text: "能见度一般也没关系。你愿意说，夜空就算开着。", mood: "soft" },
    ],
  },
  {
    id: "promise",
    label: "约好明天再见",
    hint: "小约定",
    replies: [
      { text: "好。说好了的话……反悔可不行。我会认真记住的。", mood: "care" },
      { text: "约定要收进心里。……页边写不写，随你。", mood: "soft" },
      { text: "嗯。那今晚可以安心一点睡了。", mood: "soft" },
    ],
  },
  {
    id: "protect",
    label: "说不会丢下她",
    hint: "局外人什么的，不行",
    replies: [
      { text: "……是吗。那就好。被当成局外人，可是不行的哦。", mood: "soft" },
      { text: "袖口的话……可以借你。别走散就好。", mood: "care" },
      { text: "说好了哦。反悔的人，晚上看星星要被我念很久。", mood: "tease" },
    ],
  },
];

/** 送星时的回复池 */
export const starGiftReplies = [
  { text: "……一颗就够了。太多的话，我会以为自己在做梦。", mood: "soft" },
  { text: "收到了。不是流星许愿那种，是你亲手递过来的。", mood: "star" },
  { text: "放进记录本里了。……页边，不许偷看。", mood: "tease" },
  { text: "谢谢。作为回礼……再分你一点夜色，好吗？", mood: "care" },
];
