/**
 * 完整图集数据
 * source: official-art | official-cg | ai
 * 官方图已筛出有沙夜出场的条目，且仅保留全年龄向内容
 */

const O = "./assets/gallery/official";

export const archiveFilters = [
  { id: "all", label: "全部" },
  { id: "official-art", label: "官方立绘" },
  { id: "official-cg", label: "官方 CG" },
  { id: "ai", label: "AI 创作" },
];

/** 首页精选预览（保持轻量） */
export const galleryPreview = [
  {
    id: "portrait",
    title: "主立绘",
    caption: "异色瞳在星光下微微发亮——蓝与橙，像夜空与暖灯。",
    alt: "天之川沙夜 · 主立绘",
    category: "立绘",
    src: `${O}/saya-portrait.png`,
  },
  {
    id: "cg02",
    title: "送饭的午后",
    caption: "提着锅子出现的沙夜，被同学戏称为「通い妻」的日常。",
    alt: "天之川沙夜 · 官方 CG 送饭",
    category: "CG",
    src: `${O}/cg02-full.jpg`,
  },
  {
    id: "uniform",
    title: "制服",
    caption: "静泉女子学园的日常模样。",
    alt: "天之川沙夜 · 制服",
    category: "立绘",
    src: `${O}/saya-uniform.jpg`,
  },
  {
    id: "cg06",
    title: "晴空之下",
    caption: "风把银发扬起，异色瞳映着整片蓝天。",
    alt: "天之川沙夜 · 官方 CG 晴空",
    category: "CG",
    src: `${O}/cg06-full.jpg`,
  },
  {
    id: "coat",
    title: "外套",
    caption: "冬夜里裹着外套的侧影。",
    alt: "天之川沙夜 · 外套",
    category: "立绘",
    src: `${O}/saya-coat.jpg`,
  },
];

/** 图集页完整列表（不含 AI；AI 由文件夹 / 清单动态合并） */
export const officialArchive = [
  {
    id: "art-portrait",
    title: "主立绘",
    caption: "PULLTOP 官方角色立绘。银发异瞳，夜空色的温柔。",
    alt: "天之川沙夜 · 主立绘",
    source: "official-art",
    badge: "官方立绘",
    src: `${O}/saya-portrait.png`,
    thumb: `${O}/saya-portrait.png`,
  },
  {
    id: "art-info",
    title: "角色介绍图",
    caption: "官网角色页用图，像把她轻轻放进星图里。",
    alt: "天之川沙夜 · 角色介绍",
    source: "official-art",
    badge: "官方立绘",
    src: `${O}/saya-info-board.png`,
    thumb: `${O}/saya-info-board.png`,
  },
  {
    id: "art-uniform",
    title: "制服",
    caption: "静泉女子学园的日常装束。",
    alt: "天之川沙夜 · 制服",
    source: "official-art",
    badge: "官方立绘",
    src: `${O}/saya-uniform.jpg`,
    thumb: `${O}/saya-uniform.jpg`,
  },
  {
    id: "art-coat",
    title: "外套",
    caption: "观星归途的温度。",
    alt: "天之川沙夜 · 外套",
    source: "official-art",
    badge: "官方立绘",
    src: `${O}/saya-coat.jpg`,
    thumb: `${O}/saya-coat.jpg`,
  },
  {
    id: "art-child-1",
    title: "幼年 · 其一",
    caption: "转学第一天还想用墨镜藏起眼睛的小沙夜。",
    alt: "天之川沙夜 · 幼年",
    source: "official-art",
    badge: "官方立绘",
    src: `${O}/saya-child1.jpg`,
    thumb: `${O}/saya-child1.jpg`,
  },
  {
    id: "art-child-2",
    title: "幼年 · 其二",
    caption: "与晓斗、光一起看星星的起点。",
    alt: "天之川沙夜 · 幼年回忆",
    source: "official-art",
    badge: "官方立绘",
    src: `${O}/saya-child2.jpg`,
    thumb: `${O}/saya-child2.jpg`,
  },
  {
    id: "art-mv",
    title: "主视觉",
    caption: "游戏官方主视觉。仰望夜空的那一刻。",
    alt: "仰望夜空的星辰 · 主视觉",
    source: "official-art",
    badge: "官方主视觉",
    src: `${O}/mainvisual.jpg`,
    thumb: `${O}/mainvisual.jpg`,
  },
  // 官方 CG：仅全年龄向（已排除 H 场景）
  {
    id: "cg-02",
    title: "送饭的午后",
    caption: "提着锅子出现的沙夜——「通い妻」日常的温柔一幕。",
    alt: "天之川沙夜 · 送饭 CG",
    source: "official-cg",
    badge: "官方 CG",
    src: `${O}/cg02-full.jpg`,
    thumb: `${O}/thum02.png`,
  },
  {
    id: "cg-06",
    title: "晴空之下",
    caption: "校门口的风与蓝天，银发与异色瞳一起发亮。",
    alt: "天之川沙夜 · 晴空 CG",
    source: "official-cg",
    badge: "官方 CG",
    src: `${O}/cg06-full.jpg`,
    thumb: `${O}/thum06.png`,
  },
  {
    id: "cg-10",
    title: "柴犬突击",
    caption: "被小动物扑倒的 Q 版沙夜，可爱到犯规。",
    alt: "天之川沙夜 · Q 版 CG",
    source: "official-cg",
    badge: "官方 CG",
    src: `${O}/cg10-full.jpg`,
    thumb: `${O}/thum10.png`,
  },
  {
    id: "cg-12",
    title: "夜色里的吻",
    caption: "观星之后的温柔约定。全衣浪漫向场景。",
    alt: "天之川沙夜 · 夜色之吻",
    source: "official-cg",
    badge: "官方 CG",
    src: `${O}/cg12-full.jpg`,
    thumb: `${O}/thum12.png`,
  },
];
