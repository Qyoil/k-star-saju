// lib/i18n.ts
// EN | 한국어 | 中文 문구 전부. 문구를 고치고 싶으면 이 파일만 수정하세요.
// {a} 같은 자리표시는 fill() 함수가 실제 값으로 바꿔 줍니다.
import type { Element, Lang } from './saju';
import { ELEMENT_CHAR, STEM_ELEMENT } from './saju';

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

// ---------- 화면 공통 문구 ----------
const en = {
  sample: 'Sample result',
  heroEyebrow: 'Your birth element',
  balTitle: 'Five-element balance',
  fire: 'Fire 火',
  water: 'Water 水',
  earth: 'Earth 土',
  wood: 'Wood 木',
  metal: 'Metal 金',
  tagDominant: 'Dominant',
  tagLucky: 'Lucky',
  balNote: '{dom} is strongest in your chart, and {lucky} is your lucky element. Bring more {lucky} into your routine to feel balanced.',
  matchEyebrow: 'Your fated K-pop soulmate',
  matchEnergy: 'Matched energy: {title} · {tag}',
  matchLabel: 'Destined Alchemy',
  subSpark: 'Spark',
  subHarmony: 'Harmony',
  subGrowth: 'Growth',
  matchWhy: 'In the classics, {a} + {b} combine and transform into {c}. That is your lucky element, so this match scores high.',
  matchDisclaimer: "An energy match for fun. It is not a reading of the artist's real birth chart.",
  shareTitle: 'Your story card',
  shareSub: 'A 9:16 card made for Instagram, TikTok and X.',
  shareIg: 'Share to Instagram Story',
  shareX: 'Post to X',
  saveCard: 'Save Card',
  saved: 'Saved to your downloads. Use it as a TikTok background or keep it in your photos.',
  shared: 'Shared!',
  shareHint: 'On your phone, pick Instagram in the share sheet, then choose Story. On a computer, the card downloads and a preview opens.',
  openPreview: 'Open card preview',
  tweet: 'My K-Pop Soulmate is {idol} ({score}% Compatibility)! Find yours 🔮 {url} #KStarSaju #{tag}',
  copyCaption: 'Copy caption',
  copied: 'Copied',
  copyManual: 'Select the text below and copy it.',
  modalHint: 'Press and hold the image to save it. On a computer, right-click it.',
  modalSave: 'Save image',
  close: 'Close',
  cardAlt: 'Story card preview: {title}, matched with {idol} at {score} percent',
  caption: "My saju says I'm {title} {emoji} and my K-pop soulmate is {idol}: {score}% Destined Alchemy ✨ #KStarSaju #Saju #KPop",
  payTag: 'Deep report',
  payTitle: 'Read your 1:1 saju match report with your Bias',
  pay1: 'Pick any Bias yourself and get a 1:1 element breakdown',
  pay2: 'Chemistry and love-luck timeline for the next 12 months',
  pay3: 'Lucky days and colors for concerts and fan signs',
  pay4: 'A shareable summary card of your match',
  lockedTitle: 'Chapter 1 · Where your {a} meets their {b}',
  lockedBody: 'The first sign of chemistry shows up in how quickly you both go quiet when something matters. Your {a} and their {b} answer each other in a way that is easy to miss and hard to forget.',
  lockedLabel: 'Unlocks after purchase',
  oneTime: 'One-time payment',
  payCta: 'Unlock for $3.99',
  payNotReady: 'Checkout is not connected yet. Add NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL to .env.local.',
  footer: "For entertainment only. Emblems are original artwork and use no one's likeness. Not affiliated with any artist or agency.",
  simplified: 'Year and month pillars use a simplified calendar. Birth time is not used yet.',
} as const;
export type UIKey = keyof typeof en;

const ko: Record<UIKey, string> = {
  sample: '샘플 결과',
  heroEyebrow: '나의 타고난 오행',
  balTitle: '오행 밸런스',
  fire: '화 火',
  water: '수 水',
  earth: '토 土',
  wood: '목 木',
  metal: '금 金',
  tagDominant: '가장 강함',
  tagLucky: '행운 원소',
  balNote: '사주에서 {dom} 기운이 가장 강해요. 행운 원소는 {lucky} 기운이에요. 일상에 {lucky} 기운을 더하면 균형이 잡혀요.',
  matchEyebrow: '사주가 고른 K-POP 소울메이트',
  matchEnergy: '매칭 에너지: {title} · {tag}',
  matchLabel: '운명의 연금술',
  subSpark: '케미',
  subHarmony: '안정감',
  subGrowth: '성장',
  matchWhy: '고전의 천간합(天干合) 공식: {a} + {b} → {c}. 변한 {c} 기운은 당신의 행운 원소라서 이 궁합 점수가 높게 나왔어요.',
  matchDisclaimer: '재미로 보는 에너지 매칭이에요. 아티스트의 실제 사주를 풀이한 것이 아니에요.',
  shareTitle: '스토리 카드',
  shareSub: '인스타·틱톡·X에 바로 올릴 수 있는 9:16 카드예요.',
  shareIg: 'Share to Instagram Story',
  shareX: 'Post to X',
  saveCard: 'Save Card',
  saved: '다운로드에 저장했어요. 틱톡 배경이나 앨범 소장용으로 쓰세요.',
  shared: '공유했어요!',
  shareHint: '휴대폰에서는 공유 창에서 인스타그램을 고른 뒤 스토리를 선택하세요. PC에서는 카드가 저장되고 미리보기가 열려요.',
  openPreview: '카드 미리보기 열기',
  tweet: '내 K-POP 소울메이트는 {idol} (궁합 {score}%)! 너의 소울메이트는? 🔮 {url} #KStarSaju #{tag}',
  copyCaption: '캡션 복사',
  copied: '복사됨',
  copyManual: '아래 문구를 선택해서 복사하세요.',
  modalHint: '이미지를 길게 눌러 저장하세요. PC에서는 우클릭하세요.',
  modalSave: '이미지 저장',
  close: '닫기',
  cardAlt: '스토리 카드 미리보기: {title}, {idol}와(과) 궁합 {score}%',
  caption: '내 사주는 {title} {emoji} K-POP 소울메이트는 {idol}, 궁합 {score}% 운명의 연금술 ✨ #KStarSaju #사주 #KPOP',
  payTag: '심층 리포트',
  payTitle: '내 최애(Bias)와의 1:1 심층 사주 궁합 리포트 열람하기',
  pay1: '원하는 최애(Bias)를 직접 골라 오행 1:1 분석',
  pay2: '앞으로 12개월 케미·연애운 타임라인',
  pay3: '콘서트·팬싸인회 길일과 행운 컬러',
  pay4: '공유용 궁합 요약 카드 제공',
  lockedTitle: '챕터 1 · 당신의 {a}이(가) 상대의 {b}을(를) 만나는 곳',
  lockedBody: '케미의 첫 신호는 중요한 순간에 두 사람이 얼마나 빨리 조용해지는지에서 드러나요. 당신의 {a}과(와) 상대의 {b}은(는) 놓치기 쉽지만 잊기는 어려운 방식으로 서로에게 답해요.',
  lockedLabel: '구매 후 열람 가능',
  oneTime: '1회 결제',
  payCta: '$3.99로 열람하기',
  payNotReady: '결제가 아직 연결되지 않았어요. .env.local에 NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL을 추가하세요.',
  footer: '재미로 보는 콘텐츠예요. 엠블럼은 자체 제작 그래픽이며 실존 인물의 초상을 사용하지 않아요. 어떤 아티스트·소속사와도 관계가 없어요.',
  simplified: '연주·월주는 간이 절기 기준으로 계산하며, 태어난 시각은 아직 반영하지 않아요.',
};

const zh: Record<UIKey, string> = {
  sample: '示例结果',
  heroEyebrow: '你的出生五行',
  balTitle: '五行平衡',
  fire: '火',
  water: '水',
  earth: '土',
  wood: '木',
  metal: '金',
  tagDominant: '最旺',
  tagLucky: '喜用',
  balNote: '你的命盘中{dom}最旺,喜用五行是{lucky}。日常多接触{lucky}的能量,会更平衡。',
  matchEyebrow: '命盘选中的 K-POP 灵魂伴侣',
  matchEnergy: '匹配能量:{title} · {tag}',
  matchLabel: '命定的炼金术',
  subSpark: '心动',
  subHarmony: '默契',
  subGrowth: '成长',
  matchWhy: '古典命理的天干相合:{a} + {b} → {c}。合化出的{c}是你的喜用五行,所以这组匹配分数很高。',
  matchDisclaimer: '这是供娱乐的能量匹配,并非对艺人真实生辰八字的解读。',
  shareTitle: '故事卡片',
  shareSub: '9:16 比例,可直接发到 Instagram、TikTok 和 X。',
  shareIg: 'Share to Instagram Story',
  shareX: 'Post to X',
  saveCard: 'Save Card',
  saved: '已保存到下载。可作为 TikTok 背景或留在相册收藏。',
  shared: '已分享!',
  shareHint: '手机上请在分享面板选择 Instagram,再选择快拍(Story)。电脑上会下载卡片并打开预览。',
  openPreview: '打开卡片预览',
  tweet: '我的K-POP灵魂伴侣是{idol}(契合度{score}%)!来找找你的 🔮 {url} #KStarSaju #{tag}',
  copyCaption: '复制文案',
  copied: '已复制',
  copyManual: '请选中下方文字并复制。',
  modalHint: '长按图片即可保存。电脑端请右键点击图片。',
  modalSave: '保存图片',
  close: '关闭',
  cardAlt: '故事卡片预览:{title},与{idol}契合度 {score}%',
  caption: '我的八字是{title} {emoji} K-POP灵魂伴侣是{idol},契合度{score}% 命定的炼金术 ✨ #KStarSaju #八字 #KPOP',
  payTag: '深度报告',
  payTitle: '解锁你与本命(Bias)的 1 对 1 深度八字合盘报告',
  pay1: '自选本命,获得五行 1 对 1 分析',
  pay2: '未来 12 个月的默契与恋爱运时间线',
  pay3: '演唱会、粉丝见面会的吉日与幸运色',
  pay4: '附赠可分享的合盘摘要卡',
  lockedTitle: '第 1 章 · 你的{a}遇见对方的{b}',
  lockedBody: '默契的第一个信号,出现在重要时刻你们两人多快安静下来。你的{a}与对方的{b}彼此呼应,容易被忽略,却很难忘记。',
  lockedLabel: '购买后解锁',
  oneTime: '一次性付款',
  payCta: '$3.99 立即解锁',
  payNotReady: '支付尚未接入。请在 .env.local 中添加 NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL。',
  footer: '仅供娱乐。徽章为原创图形,未使用任何人的肖像。与任何艺人或经纪公司无关。',
  simplified: '年柱与月柱采用简化节气计算,暂未使用出生时辰。',
};

export const UI: Record<Lang, Record<UIKey, string>> = { en, ko, zh };

// ---------- 오행 이름 (문장 안에서 쓰는 형태) ----------
export const ELEMENT_NAME: Record<Lang, Record<Element, string>> = {
  en: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
  ko: { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' },
  zh: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
};
const ELEMENT_KO_WORD: Record<Element, string> = { wood: '나무', fire: '불', earth: '흙', metal: '쇠', water: '물' };
export const ELEMENT_EMOJI: Record<Element, string> = { wood: '🌿', fire: '🔥', earth: '⛰️', metal: '🪙', water: '💧' };

// ---------- 천간 10종 ----------
interface StemInfo {
  char: string;
  py: string; // 영문 표기(병음)
  ko: string; // 한글 표기
  nature: Record<Lang, string>; // 한 줄 이미지
  tag: Record<Lang, string>; // 짧은 별칭
  traits: Record<Lang, [string, string, string]>;
  summary: Record<Lang, string>;
}

export const STEMS: StemInfo[] = [
  {
    char: '甲', py: 'Jia', ko: '갑목',
    nature: { en: 'A pine reaching straight for the sky', ko: '하늘로 곧게 뻗는 큰 나무', zh: '直指苍穹的参天大树' },
    tag: { en: 'Towering Pine', ko: '우뚝 선 소나무', zh: '参天古松' },
    traits: { en: ['Born leader', 'Upright', 'Slow to bend'], ko: ['타고난 리더', '곧은 심지', '쉽게 굽지 않는'], zh: ['天生领袖', '正直', '不易弯折'] },
    summary: {
      en: "You grow in one direction and don't bend easily. People follow you because you say what you mean. Under pressure you can turn stubborn, so ask for a second opinion.",
      ko: '한 방향으로 곧게 자라고 쉽게 굽히지 않아요. 말과 행동이 같아서 사람들이 따르지만, 압박이 오면 고집이 세질 수 있으니 한 번쯤 다른 의견을 들어 보세요.',
      zh: '你认准一个方向就笔直生长,不轻易弯折。言行一致让人愿意追随你,但压力大时容易固执,不妨多听一句别人的意见。',
    },
  },
  {
    char: '乙', py: 'Yi', ko: '을목',
    nature: { en: 'A vine that bends with the wind and never breaks', ko: '바람에 휘어도 꺾이지 않는 덩굴과 꽃', zh: '随风而弯却不折的藤与花' },
    tag: { en: 'Wild Vine', ko: '들꽃 덩굴', zh: '野藤花' },
    traits: { en: ['Graceful', 'Adaptable', 'Quietly tough'], ko: ['우아한', '적응력 있는', '은근히 강한'], zh: ['优雅', '适应力强', '柔中带刚'] },
    summary: {
      en: 'You bend, wrap around obstacles and still reach the light. You look gentle and are tougher than anyone expects. Learn to say no, because you adapt so well that people forget to ask what you want.',
      ko: '장애물을 휘감고 돌아서도 결국 빛에 닿는 사람이에요. 겉은 부드럽지만 속은 누구보다 질겨요. 너무 잘 맞춰 주다 보니 정작 원하는 걸 묻는 사람이 없으니, 거절하는 연습이 필요해요.',
      zh: '你能绕过障碍,依然朝着光生长。外表柔和,内心比谁都坚韧。你太会迁就,别人常忘了问你想要什么,要学会说不。',
    },
  },
  {
    char: '丙', py: 'Bing', ko: '병화',
    nature: { en: 'The midday sun that warms everyone', ko: '모두를 데우는 한낮의 태양', zh: '温暖众人的正午骄阳' },
    tag: { en: 'Midday Sun', ko: '한낮의 태양', zh: '正午骄阳' },
    traits: { en: ['Warm-hearted', 'Magnetic', 'Born to shine'], ko: ['따뜻한 마음', '끌어당기는 매력', '빛나는 존재'], zh: ['热心肠', '有磁场', '天生闪耀'] },
    summary: {
      en: 'You walk in and the room gets warmer. Generous, open and a little dramatic, you want everyone to have a good time. You burn bright and fast, so plan real rest before you crash.',
      ko: '당신이 들어오면 분위기가 한층 따뜻해져요. 아낌없고 솔직하고 조금은 드라마틱해서, 모두가 즐겁기를 바라죠. 밝고 빠르게 타오르는 만큼 지치기 전에 진짜 휴식을 계획하세요.',
      zh: '你一进场,气氛就暖起来。慷慨、坦率、有点戏剧化,希望每个人都开心。你燃得又亮又快,在耗尽之前要安排真正的休息。',
    },
  },
  {
    char: '丁', py: 'Ding', ko: '정화',
    nature: { en: 'The flame of a candle and the glow of the moon', ko: '촛불과 달빛의 불꽃', zh: '烛火与月光之火' },
    tag: { en: 'Candle & Moon', ko: '촛불과 달빛', zh: '烛火月光' },
    traits: { en: ['Quietly intense', 'Fiercely loyal', 'Brightest in the dark'], ko: ['고요하지만 강렬한', '한번 주면 끝까지', '어둠 속에서 더 빛나는'], zh: ['安静而炽烈', '认定就忠诚到底', '越黑暗越闪耀'] },
    summary: {
      en: 'You are the small flame people lean toward at night. You read the room before you speak and you remember everything. Your warmth goes to a few people, on purpose. You run low when nothing feeds the flame, so you need rest and the right company.',
      ko: '당신은 밤에 사람들이 가까이 다가오는 작은 불꽃이에요. 말하기 전에 분위기를 먼저 읽고, 모든 걸 기억해요. 따뜻함은 소수의 사람에게만 일부러 건네요. 불꽃을 키워 줄 땔감이 없으면 쉽게 지치니, 휴식과 맞는 사람이 필요해요.',
      zh: '你是夜里让人想靠近的那簇小火焰。开口之前先读懂气氛,什么都记得。你的温暖只会有意地交给少数人。没有柴火时你容易耗尽,所以需要休息和对的人。',
    },
  },
  {
    char: '戊', py: 'Wu', ko: '무토',
    nature: { en: 'A great mountain that holds its ground', ko: '묵묵히 제자리를 지키는 큰 산', zh: '岿然不动的巍峨大山' },
    tag: { en: 'Great Mountain', ko: '큰 산', zh: '巍峨大山' },
    traits: { en: ['Dependable', 'Grounded', 'Quietly strong'], ko: ['믿음직한', '중심이 단단한', '조용히 강한'], zh: ['可靠', '脚踏实地', '沉静有力'] },
    summary: {
      en: 'You are the one people lean on. Calm, steady and slow to panic, you hold a group together without announcing it. You change your mind slowly, so give yourself room to try something new.',
      ko: '사람들이 기대는 든든한 사람이에요. 침착하고 쉽게 당황하지 않아서, 말없이 모임의 중심을 잡아 줘요. 마음을 바꾸는 데 시간이 걸리니 새로운 시도를 할 여유를 스스로에게 주세요.',
      zh: '你是别人可以依靠的人。沉稳,不易慌乱,不动声色就能稳住一个团体。你转变想法很慢,给自己留出尝试新事物的余地。',
    },
  },
  {
    char: '己', py: 'Ji', ko: '기토',
    nature: { en: 'A fertile field that grows what you plant', ko: '씨앗을 키워 내는 비옥한 들판', zh: '孕育种子的沃野良田' },
    tag: { en: 'Fertile Field', ko: '비옥한 들판', zh: '沃野良田' },
    traits: { en: ['Nurturing', 'Practical', 'Observant'], ko: ['보살피는', '현실적인', '세심한'], zh: ['懂照顾', '务实', '观察入微'] },
    summary: {
      en: "You quietly help things grow, from friendships to side projects. Patient and practical, you notice what others need before they ask. Don't absorb everyone's worries. Keep some of that care for yourself.",
      ko: '우정이든 사이드 프로젝트든 조용히 키워 내는 사람이에요. 인내심 있고 현실적이라 상대가 말하기 전에 필요한 걸 알아차려요. 모두의 걱정을 다 떠안지 말고 그 돌봄을 스스로에게도 나눠 주세요.',
      zh: '无论友情还是副业,你都在默默培育它们成长。耐心务实,总在别人开口前就察觉需求。别把所有人的烦恼都揽在身上,把这份照顾也留一些给自己。',
    },
  },
  {
    char: '庚', py: 'Geng', ko: '경금',
    nature: { en: 'Raw iron waiting to be forged', ko: '단련을 기다리는 강철', zh: '等待淬炼的原铁' },
    tag: { en: 'Raw Iron', ko: '날것의 강철', zh: '未淬之铁' },
    traits: { en: ['Decisive', 'Honest', 'Fearless'], ko: ['결단력 있는', '솔직한', '겁 없는'], zh: ['果断', '坦率', '无所畏惧'] },
    summary: {
      en: 'You are direct, decisive and built for hard things. You respect people who keep their word and lose patience with those who do not. Your edge cuts both ways, so soften it with the people you love.',
      ko: '직선적이고 결단력 있어서 어려운 일에 강해요. 약속을 지키는 사람을 존중하고 그렇지 않은 사람에겐 금방 인내심을 잃죠. 날카로움은 양날의 검이니 아끼는 사람에게는 한 김 식혀 주세요.',
      zh: '你直接果断,天生适合做难事。你尊重守信的人,对食言的人很快失去耐心。你的锋芒是双刃剑,对在乎的人请收敛一些。',
    },
  },
  {
    char: '辛', py: 'Xin', ko: '신금',
    nature: { en: 'A jewel that shines once it is polished', ko: '다듬어질수록 빛나는 보석', zh: '越琢磨越闪耀的宝石' },
    tag: { en: 'Polished Jewel', ko: '빛나는 보석', zh: '琢磨宝石' },
    traits: { en: ['Refined', 'Perfectionist', 'Eye for detail'], ko: ['세련된', '완벽주의', '디테일에 강한'], zh: ['精致', '完美主义', '眼光独到'] },
    summary: {
      en: 'You have taste, standards and a sharp eye for detail. You shine most when you are seen for your craft, not your noise. You can be hard on yourself, so remember that being polished is not the same as being flawed.',
      ko: '안목과 기준이 높고 디테일을 보는 눈이 날카로워요. 소란이 아니라 실력으로 인정받을 때 가장 빛나죠. 스스로에게 엄격한 편이니, 다듬어지는 과정이 결점은 아니라는 걸 기억하세요.',
      zh: '你有品味、有标准,对细节眼光敏锐。靠实力而不是喧闹被看见时,你最闪耀。你对自己要求很严,请记得打磨不等于有缺陷。',
    },
  },
  {
    char: '壬', py: 'Ren', ko: '임수',
    nature: { en: 'The wide ocean under the moon', ko: '달빛 아래 넓은 바다', zh: '月光下辽阔的海' },
    tag: { en: 'Moonlit Ocean', ko: '달빛 아래 바다', zh: '月下之海' },
    traits: { en: ['Free-spirited', 'Deep thinker', 'Adaptable'], ko: ['자유로운 영혼', '깊이 있는', '유연한'], zh: ['自由灵魂', '思想深邃', '灵活'] },
    summary: {
      en: 'You are wide, deep and always moving. Curious and free, you can fit into any crowd and still keep your own current. Your mood runs with the tide, so build a few anchors, like a routine you love.',
      ko: '넓고 깊고 늘 흐르는 사람이에요. 호기심 많고 자유로워서 어떤 무리에도 맞추면서 자기만의 물결을 지켜요. 기분이 조수처럼 오르내리니 좋아하는 루틴 같은 닻을 몇 개 만들어 두세요.',
      zh: '你宽广、深邃、永远在流动。好奇又自由,能融入任何人群却保有自己的水流。情绪像潮汐起伏,不妨建立几个让自己安定的锚点,比如喜欢的日常节奏。',
    },
  },
  {
    char: '癸', py: 'Gui', ko: '계수',
    nature: { en: 'Quiet rain and morning dew', ko: '조용한 비와 새벽 이슬', zh: '静静的雨与清晨的露' },
    tag: { en: 'Morning Dew', ko: '새벽 이슬', zh: '晨露细雨' },
    traits: { en: ['Intuitive', 'Gentle', 'Hard to fool'], ko: ['직관적인', '부드러운', '쉽게 속지 않는'], zh: ['直觉敏锐', '温柔', '难被蒙蔽'] },
    summary: {
      en: 'You sense moods before anyone says a word. Gentle, intuitive and hard to fool, you give your best in small, close circles. Protect your energy from crowds that drain you.',
      ko: '아무도 말하지 않아도 분위기를 읽는 사람이에요. 부드럽고 직관적이며 쉽게 속지 않고, 작고 가까운 모임에서 가장 좋은 모습이 나와요. 기를 빼앗는 자리에서는 에너지를 지키세요.',
      zh: '别人还没开口,你就感受到气氛。温柔、直觉敏锐、不易被骗,在小而亲近的圈子里状态最好。要保护自己的能量,远离耗人的场合。',
    },
  },
];

// ---------- 이름 만들기 ----------
const YIN_YANG: Record<Lang, [string, string]> = { en: ['Yang', 'Yin'], ko: ['양', '음'], zh: ['阳', '阴'] };

/** 히어로/스토리카드 제목. 예) Yin Fire / 정화 · 음의 불 / 丁火 · 阴火 */
export function heroTitle(stem: number, lang: Lang): string {
  const el = STEM_ELEMENT[stem];
  const yy = YIN_YANG[lang][stem % 2];
  if (lang === 'en') return `${yy} ${ELEMENT_NAME.en[el]}`;
  if (lang === 'ko') return `${STEMS[stem].ko} · ${yy}의 ${ELEMENT_KO_WORD[el]}`;
  return `${STEMS[stem].char}${ELEMENT_CHAR[el]} · ${yy}${ELEMENT_CHAR[el]}`;
}

/** 문장 속 짧은 이름. 예) Yang Water / 임수(壬水) / 壬水 */
export function shortTitle(stem: number, lang: Lang): string {
  const el = STEM_ELEMENT[stem];
  if (lang === 'en') return `${YIN_YANG.en[stem % 2]} ${ELEMENT_NAME.en[el]}`;
  if (lang === 'ko') return `${STEMS[stem].ko}(${STEMS[stem].char}${ELEMENT_CHAR[el]})`;
  return `${STEMS[stem].char}${ELEMENT_CHAR[el]}`;
}

/** 합 공식에 쓰는 이름. 예) Ding Fire / 정화 / 丁火 */
export function formulaName(stem: number, lang: Lang): string {
  const el = STEM_ELEMENT[stem];
  if (lang === 'en') return `${STEMS[stem].py} ${ELEMENT_NAME.en[el]}`;
  if (lang === 'ko') return STEMS[stem].ko;
  return `${STEMS[stem].char}${ELEMENT_CHAR[el]}`;
}
