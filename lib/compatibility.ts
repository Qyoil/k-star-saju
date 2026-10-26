// lib/compatibility.ts
// 유저 vs 최애(Bias) 1:1 심층 궁합 계산 + 4대 분석 텍스트 (EN / 한국어 / 中文)
//
// ■ 계산 원리 (일간 = Day Master 중심, lib/saju.ts 의 calcSaju 사용)
//   1) 천간합(天干合): 두 일간의 차이가 5  -> 최고 궁합 (甲己 乙庚 丙辛 丁壬 戊癸)
//   2) 같은 일간 / 같은 오행(음양만 다름) -> 거울·쌍둥이 관계
//   3) 상생(相生): 木→火→土→金→水→木  (내가 상대를 살리는지, 상대가 나를 살리는지)
//   4) 상극(相剋): 木→土→水→火→金→木  (내가 누르는지, 상대가 나를 누르는지)
//   5) 천간충(天干沖): 甲庚 乙辛 丙壬 丁癸 -> 가장 강한 긴장
//   6) 오행 보완: 두 사람의 오행 밸런스에서 서로의 부족한 기운을 채워 주면 가산점
//   점수는 "관계 유형 기본점 + 오행 보완 + 주력 오행 관계 + 음양 대비"로 정해지는 결정적 값입니다 (같은 입력 = 같은 결과). 튜닝값: SCORE_TUNING
//
// ■ 주의: 재미·자기성찰용 콘텐츠입니다. 실제 인간관계나 아티스트 본인의 성향을 단정하지 않습니다.
//   생년월일은 공개 프로필 기준, 출생 시각·지지(地支)는 반영하지 않는 간이 계산입니다.
import { calcSaju, ELEMENT_CHAR, ELEMENT_ORDER, STEM_ELEMENT, type BirthInput, type Element, type Lang } from "./saju";
import { ELEMENT_EMOJI, ELEMENT_NAME, STEMS, fill } from "./i18n";

export type Relation = "union" | "same" | "sibling" | "feeds" | "fed" | "controls" | "controlled" | "clash";
export type SectionId = "chemistry" | "romance" | "shadow" | "remedy";

export interface BiasInput {
  name: string;
  birth: BirthInput;
}

export interface PersonView {
  name: string;
  birth: BirthInput;
  stemIndex: number;
  stemChar: string; // 丁
  element: Element;
  dominant: Element; // 오행 밸런스에서 가장 큰 기운
  yin: boolean;
  nature: string;
  tag: string;
  balance: { element: Element; pct: number }[];
}

export interface ReportSection {
  id: SectionId;
  no: string; // "01"
  title: string;
  headline: string;
  teaser: string; // 잠금 상태에서 보여 주는 궁금증 유발 한 줄 (챕터 1은 빈 문자열)
  paragraphs: string[];
  bullets: string[];
}

export interface CompatReport {
  lang: Lang;
  relation: Relation;
  relationLabel: string;
  score: number; // 케미 점수 %
  verdict: string; // 점수 등급 이름
  you: PersonView;
  bias: PersonView;
  sections: ReportSection[];
  remedy: { element: Element; label: string; emoji: string; color: string; direction: string; numbers: string };
  disclaimer: string;
}

/* ------------------------------------------------------------------ */
/* 계산                                                                */
/* ------------------------------------------------------------------ */

const COMBINE_ELEMENT: Element[] = ["earth", "metal", "water", "wood", "fire"]; // 천간 % 5

const idx = (e: Element) => ELEMENT_ORDER.indexOf(e);
/** a 가 b 를 생(生)하는가: 木→火→土→金→水→木 */
const generates = (a: Element, b: Element) => (idx(a) + 1) % 5 === idx(b);
/** a 가 b 를 극(剋)하는가: 木→土→水→火→金→木 */
const controlsEl = (a: Element, b: Element) => (idx(a) + 2) % 5 === idx(b);

export function relationOf(a: number, b: number): Relation {
  const ea = STEM_ELEMENT[a];
  const eb = STEM_ELEMENT[b];
  if (((a - b + 10) % 10) === 5) return "union";
  if (a === b) return "same";
  if (ea === eb) return "sibling";
  if (Math.abs(a - b) === 6 && Math.min(a, b) <= 3) return "clash";
  if (generates(ea, eb)) return "feeds";
  if (generates(eb, ea)) return "fed";
  if (controlsEl(ea, eb)) return "controls";
  return "controlled";
}

/**
 * 점수 튜닝값 (한 곳에서만 조절). 목표 분포(무작위 유저 × 48명 로스터 기준):
 *   90% 이상 15~20% · 75~89% 약 50% · 60~74% 약 25% · 50~59% 5~10%
 * 점수 = 관계 기본점 + 오행 보완(0..fitMax) + 주력 오행 관계(-2..+2) + 음양 대비(+yy)  -> 50..98 로 제한
 */
export const SCORE_TUNING = {
  base: { union: 88, fed: 76, feeds: 72, sibling: 70, same: 66, controls: 63, controlled: 58, clash: 47 } as Record<Relation, number>,
  fitW: { union: 0.9, fed: 1.25, feeds: 1, sibling: 1, same: 1, controls: 0.8, controlled: 0.8, clash: 0.6 } as Record<Relation, number>, // 관계별 보완 가중치
  fitMax: 12, //  오행 보완 최대 가산점
  fitDiv: 11, //  클수록 보완 가산이 인색해짐
  lackBelow: 18, // 이 % 미만이면 "부족한 오행"
  yy: 1, //     음양이 다를 때 가산점
  min: 50,
  max: 98,
};

function pctMap(bal: { element: Element; pct: number }[]): Record<Element, number> {
  const m: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const b of bal) m[b.element] = b.pct;
  return m;
}

function viewOf(name: string, birth: BirthInput): PersonView {
  const r = calcSaju(birth);
  return {
    name,
    birth,
    stemIndex: r.dayStem,
    stemChar: STEMS[r.dayStem].char,
    element: r.element,
    dominant: r.dominant,
    yin: r.yin,
    nature: "",
    tag: "",
    balance: r.balance,
  };
}

/** 가장 부족한 오행(두 사람 평균 기준) */
function weakestElement(a: PersonView, b: PersonView): Element {
  const ma = pctMap(a.balance);
  const mb = pctMap(b.balance);
  let best: Element = ELEMENT_ORDER[0];
  let bestV = Infinity;
  for (const e of ELEMENT_ORDER) {
    const v = ma[e] + mb[e];
    if (v < bestV) {
      bestV = v;
      best = e;
    }
  }
  return best;
}

/** 서로의 부족한 기운을 채워 주는 정도 (0..fitMax) */
function complementBonus(a: PersonView, b: PersonView): number {
  const T = SCORE_TUNING;
  const ma = pctMap(a.balance);
  const mb = pctMap(b.balance);
  let sum = 0;
  for (const e of ELEMENT_ORDER) {
    sum += Math.max(0, T.lackBelow - ma[e]) * mb[e]; // 내가 부족한 오행을 상대가 얼마나 갖고 있나
    sum += Math.max(0, T.lackBelow - mb[e]) * ma[e];
  }
  return Math.min(T.fitMax, Math.round(sum / (T.fitDiv * 10)));
}

/** 두 사람의 "주력 오행"끼리의 관계: 상생 +2, 같음 +1, 상극 -2 */
function dominantTerm(a: PersonView, b: PersonView): number {
  if (generates(a.dominant, b.dominant) || generates(b.dominant, a.dominant)) return 2;
  if (a.dominant === b.dominant) return 1;
  if (controlsEl(a.dominant, b.dominant) || controlsEl(b.dominant, a.dominant)) return -2;
  return 0;
}

export function computeScore(you: PersonView, bias: PersonView, relation: Relation): number {
  const T = SCORE_TUNING;
  const yy = you.stemIndex % 2 !== bias.stemIndex % 2 ? T.yy : 0;
  const fit = Math.round(complementBonus(you, bias) * T.fitW[relation]);
  const raw = T.base[relation] + fit + dominantTerm(you, bias) + yy;
  return Math.max(T.min, Math.min(T.max, raw));
}

/** 생년월일 두 개만으로 관계 유형과 점수를 계산 (시뮬레이션·테스트용) */
export function scoreBetween(a: BirthInput, b: BirthInput): { relation: Relation; score: number } {
  const x = viewOf("", a);
  const y = viewOf("", b);
  const relation = relationOf(x.stemIndex, y.stemIndex);
  return { relation, score: computeScore(x, y, relation) };
}

/* ------------------------------------------------------------------ */
/* 문구 (3개 국어)                                                      */
/* ------------------------------------------------------------------ */

type L3 = Record<Lang, string>;

const REL: Record<Relation, { label: L3; chem: L3; attract: L3; tension: L3; fix: L3 }> = {
  union: {
    label: { en: "Heavenly Union · 天干合", ko: "천간합 · 하늘이 맺어준 짝", zh: "天干合 · 天作之合" },
    chem: {
      en: "{uStem} and {bStem} form the classic stem-combination pair: two opposite energies that fuse into a third, {combine}. Your “{uNature}” and {bias}'s “{bNature}” don't compete; they complete each other. It is the strongest bond this system recognises.",
      ko: "{uStem}와(과) {bStem}은(는) 천간합으로 묶이는 대표적인 짝이에요. 서로 반대인 두 기운이 만나 제3의 기운, {combine}(으)로 합쳐집니다. 당신의 '{uNature}' 기운과 {bias}의 '{bNature}' 기운은 부딪히지 않고 서로를 완성해요. 이 체계에서 가장 강한 인연으로 봅니다.",
      zh: "{uStem}与{bStem}是天干相合的典型组合：两种相反的能量融合成第三种气，{combine}。你的“{uNature}”与{bias}的“{bNature}”不是对抗，而是互相成全，是这套体系里最强的缘分。",
    },
    attract: {
      en: "The pull feels like recognition more than attraction. {bias} carries what you quietly lack, and you hold what they have been looking for. Conversation, silence, even taste in small things feel unusually in sync.",
      ko: "끌림이 설렘이라기보다 '알아봄'에 가까워요. {bias}은(는) 당신에게 조용히 부족한 것을 갖고 있고, 당신은 그쪽이 찾던 것을 갖고 있어요. 대화도, 침묵도, 사소한 취향도 이상하게 잘 맞아요.",
      zh: "这种吸引更像是“认出彼此”，而不只是心动。{bias}拥有你默默缺少的东西，你也拥有对方一直在找的。聊天、沉默、甚至小小的喜好都出奇地同频。",
    },
    tension: {
      en: "A union can turn into a bubble. You may both idealise the connection and skip the unglamorous parts, like saying clearly what you need. Destiny is a strong start, not a guarantee.",
      ko: "합이 강하면 둘만의 세계에 갇히기 쉬워요. 관계를 이상화하다가 필요한 걸 분명히 말하는 평범한 일을 건너뛸 수 있어요. 운명은 좋은 출발일 뿐, 보장은 아니에요.",
      zh: "合得太好，容易变成只有两个人的泡泡。你们可能把关系理想化，而略过“把需求说清楚”这类不浪漫的小事。缘分是好的开始，不是保证。",
    },
    fix: {
      en: "Tend the shared {combine} energy together: it is the third element your pairing creates.",
      ko: "두 사람이 함께 만들어 내는 제3의 기운, {combine}을(를) 같이 가꿔 보세요.",
      zh: "一起滋养你们合化出的第三种气：{combine}。",
    },
  },
  same: {
    label: { en: "Mirror Stems · 比肩", ko: "같은 일간 · 거울 같은 사이", zh: "同日主 · 镜像之缘" },
    chem: {
      en: "You and {bias} share the very same Day Master, {uStem}: “{uNature}”. It is like meeting your own reflection, instantly familiar and effortlessly understood.",
      ko: "당신과 {bias}은(는) 일간이 똑같이 {uStem}, '{uNature}'이에요. 거울 속 나를 만나는 것처럼 처음부터 익숙하고 설명 없이도 이해가 돼요.",
      zh: "你和{bias}的日主完全相同，都是{uStem}：“{uNature}”。就像遇见镜中的自己，一见如故，不必多说也懂。",
    },
    attract: {
      en: "Attraction comes from being seen. You recognise your own habits, humour and pace in {bias}, which feels safe and a little thrilling.",
      ko: "끌림의 이유는 '이해받는 느낌'이에요. {bias}에게서 내 습관, 유머, 속도를 발견하고, 그게 안전하면서 조금 짜릿해요.",
      zh: "吸引力来自“被看见”。你在{bias}身上认出自己的习惯、幽默和节奏，既安心又有点让人心跳。",
    },
    tension: {
      en: "Two identical energies compete for the same space. You share blind spots and the same stubborn streak, so nobody balances the other.",
      ko: "똑같은 기운 둘이 같은 자리를 두고 겨루기 쉬워요. 맹점도 고집도 같아서, 서로를 균형 잡아 줄 사람이 없어요.",
      zh: "两股相同的能量容易抢同一块地盘。盲点和倔强都一样，谁也平衡不了谁。",
    },
    fix: {
      en: "Borrow the missing element from outside the pair (see below) so you stop repeating the same pattern.",
      ko: "둘 다 부족한 기운은 관계 밖에서 빌려 오세요(아래 참고). 같은 패턴을 반복하지 않게 돼요.",
      zh: "把你们共同缺少的五行从关系之外“借”来（见下文），就不会重复同一种模式。",
    },
  },
  sibling: {
    label: { en: "Twin Flames · 同行", ko: "같은 오행 · 쌍둥이 불꽃", zh: "同五行 · 双生之焰" },
    chem: {
      en: "{uStem} and {bStem} are both {uEl}, one yin and one yang: the same nature in two volumes. Your “{uNature}” meets {bias}'s “{bNature}”.",
      ko: "{uStem}와(과) {bStem}은(는) 둘 다 {uEl}이고 음양만 달라요. 같은 본성을 다른 볼륨으로 표현하는 사이예요. 당신의 '{uNature}' 기운과 {bias}의 '{bNature}' 기운이 만납니다.",
      zh: "{uStem}与{bStem}同属{uEl}，只是一阴一阳：同样的本性，不同的音量。你的“{uNature}”遇见{bias}的“{bNature}”。",
    },
    attract: {
      en: "Like siblings in spirit: shared values and instincts, different ways of showing them. You feel instantly on the same team.",
      ko: "마음이 통하는 형제자매 같은 끌림이에요. 가치관과 본능은 같고 표현 방식만 달라서, 처음부터 같은 팀처럼 느껴져요.",
      zh: "像心灵上的兄弟姐妹：价值观与直觉相近，只是表达方式不同，一开始就像在同一支队伍。",
    },
    tension: {
      en: "Friendly rivalry is the risk. You can end up comparing yourselves, or feel doubly hurt when the other mirrors your weak spot.",
      ko: "선의의 경쟁이 비교로 변하기 쉬워요. 상대가 내 약점을 그대로 비춰 줄 때 두 배로 아플 수 있어요.",
      zh: "风险在于良性竞争变成互相比较；对方照出你的弱点时，会加倍刺痛。",
    },
    fix: {
      en: "Celebrate the differences in style out loud; they are what keeps the bond fresh.",
      ko: "표현 방식의 차이를 일부러 칭찬해 주세요. 그 차이가 관계를 신선하게 지켜 줘요.",
      zh: "有意识地夸奖彼此风格的差异，那正是让关系保持新鲜的地方。",
    },
  },
  feeds: {
    label: { en: "You Nourish Them · 相生", ko: "내가 살려 주는 상생", zh: "我生彼 · 相生" },
    chem: {
      en: "{uEl} feeds {bEl}: your “{uNature}” naturally fuels {bias}'s “{bNature}”. Energy flows from you to them, and it flows easily.",
      ko: "{uEl}이(가) {bEl}을(를) 살려 주는 상생이에요. 당신의 '{uNature}' 기운이 {bias}의 '{bNature}' 기운에 자연스럽게 힘을 실어 줘요. 에너지가 당신에게서 그쪽으로 막힘없이 흘러요.",
      zh: "{uEl}生{bEl}：你的“{uNature}”自然地滋养着{bias}的“{bNature}”，能量从你流向对方，毫不费力。",
    },
    attract: {
      en: "You are their warm base: around you {bias} shines brighter, and you feel needed in the best way. The attraction is care that turns into devotion.",
      ko: "당신은 그 사람의 따뜻한 베이스캠프예요. 곁에 있으면 {bias}이(가) 더 빛나고, 당신은 좋은 의미로 '필요한 사람'이 된 기분이 들어요. 돌봄이 헌신으로 번지는 끌림이에요.",
      zh: "你是对方温暖的大本营：在你身边{bias}更闪耀，你也感到被需要。这是从照顾发展成投入的吸引。",
    },
    tension: {
      en: "Giving can drain you. {bias} may take your support for granted, and you may over-give before asking for anything back.",
      ko: "주기만 하다 지칠 수 있어요. {bias}이(가) 당신의 지지를 당연하게 여길 수 있고, 당신은 돌려받길 말하기도 전에 먼저 다 줘 버리기 쉬워요.",
      zh: "一直付出会让你耗竭。{bias}可能把你的支持视作理所当然，而你也容易在开口要回报前就先给光了。",
    },
    fix: {
      en: "Set one small thing you ask for in return. Balanced flow keeps the nourishment alive.",
      ko: "돌려받고 싶은 작은 것 하나를 정해 두세요. 균형 잡힌 흐름이 상생을 오래가게 해요.",
      zh: "定下一件你想要的小小回报。双向的流动才能让滋养长久。",
    },
  },
  fed: {
    label: { en: "They Nourish You · 相生", ko: "상대가 살려 주는 상생", zh: "彼生我 · 相生" },
    chem: {
      en: "{bEl} feeds {uEl}: {bias}'s “{bNature}” refuels your “{uNature}”. Energy flows toward you, so being near them leaves you more yourself.",
      ko: "{bEl}이(가) {uEl}을(를) 살려 주는 상생이에요. {bias}의 '{bNature}' 기운이 당신의 '{uNature}' 기운을 채워 줘요. 에너지가 당신 쪽으로 흘러서, 곁에 있으면 더 나다워져요.",
      zh: "{bEl}生{uEl}：{bias}的“{bNature}”为你的“{uNature}”补充能量。能量流向你，靠近对方会让你更像自己。",
    },
    attract: {
      en: "They make you feel supported and inspired. Their presence turns your energy up, so the pull is a mix of comfort and motivation.",
      ko: "그 사람 덕분에 든든하고 영감을 받는 기분이에요. 존재만으로 내 에너지가 올라가서, 편안함과 동기부여가 섞인 끌림이에요.",
      zh: "对方让你感到被支持、被激励，仅仅存在就让你能量升高，吸引里混着安心和动力。",
    },
    tension: {
      en: "It is easy to lean too hard. You may rely on {bias} for your mood, and they may feel unseen for what they give.",
      ko: "기대는 게 지나쳐지기 쉬워요. 기분을 {bias}에게 의존하게 되고, 그쪽은 자신이 주는 것을 알아봐 주지 않는다고 느낄 수 있어요.",
      zh: "很容易依赖过头：你的情绪可能系在{bias}身上，而对方会觉得自己的付出没被看见。",
    },
    fix: {
      en: "Say thank you in specific words. Being nourished works best when it is acknowledged.",
      ko: "고마움을 구체적인 말로 표현하세요. 받는 쪽이 알아줄 때 상생이 가장 잘 돌아요.",
      zh: "把感谢说得具体一点。被滋养的一方懂得回应，相生才转得顺。",
    },
  },
  controls: {
    label: { en: "You Set the Pace · 相剋", ko: "내가 이끄는 상극", zh: "我克彼 · 相剋" },
    chem: {
      en: "{uEl} governs {bEl}: your “{uNature}” shapes the rhythm around {bias}'s “{bNature}”. It is a dynamic of direction rather than flow, which creates strong, focused chemistry.",
      ko: "{uEl}이(가) {bEl}을(를) 다스리는 상극이에요. 당신의 '{uNature}' 기운이 {bias}의 '{bNature}' 기운 주위의 리듬을 정해요. 흐름보다 방향성이 있는 관계라 집중되고 강한 케미가 생겨요.",
      zh: "{uEl}克{bEl}：你的“{uNature}”决定了{bias}的“{bNature}”周围的节奏。这是“方向感”多过“流动”的关系，化学反应集中而强烈。",
    },
    attract: {
      en: "{bias} is drawn to your confidence and clarity, and you enjoy the challenge of understanding someone who won't be easily steered. Magnetic, a bit competitive.",
      ko: "{bias}은(는) 당신의 확신과 분명함에 끌리고, 당신은 쉽게 휘둘리지 않는 사람을 이해해 가는 도전을 즐겨요. 자석처럼 끌리고 살짝 경쟁적이에요.",
      zh: "{bias}被你的笃定与清晰吸引，你也享受理解一个不易被左右的人的挑战。有磁力，也带点较劲。",
    },
    tension: {
      en: "You can steer too hard without noticing. {bias} may feel managed or corrected, and pull away or push back.",
      ko: "본인도 모르게 너무 세게 이끌 수 있어요. {bias}이(가) 관리당하거나 지적받는 느낌을 받으면 거리를 두거나 되받아칠 수 있어요.",
      zh: "你可能在不知不觉中带得太用力。{bias}若觉得被管、被纠正，会后退或反击。",
    },
    fix: {
      en: "Ask before advising. One genuine question lowers the pressure more than any compliment.",
      ko: "조언하기 전에 먼저 물어보세요. 진심 어린 질문 하나가 어떤 칭찬보다 부담을 낮춰 줘요.",
      zh: "给建议之前先问一句。一个真诚的问题比任何夸奖都更能减压。",
    },
  },
  controlled: {
    label: { en: "They Challenge You · 相剋", ko: "상대가 자극하는 상극", zh: "彼克我 · 相剋" },
    chem: {
      en: "{bEl} governs {uEl}: {bias}'s “{bNature}” presses on, and sharpens, your “{uNature}”. It is high-contrast chemistry that keeps you alert.",
      ko: "{bEl}이(가) {uEl}을(를) 다스리는 상극이에요. {bias}의 '{bNature}' 기운이 당신의 '{uNature}' 기운을 자극하고 다듬어요. 대비가 큰 케미라 늘 깨어 있게 만들어요.",
      zh: "{bEl}克{uEl}：{bias}的“{bNature}”在压迫也在打磨你的“{uNature}”。这是对比强烈的化学反应，让你保持清醒。",
    },
    attract: {
      en: "The thrill is being seen and tested at once. {bias} brings an intensity you can't ignore, and you grow when you rise to it.",
      ko: "'알아봐 주면서 동시에 시험받는' 짜릿함이에요. {bias}은(는) 무시할 수 없는 강도를 갖고 있고, 거기에 맞춰 올라설 때 당신이 자라요.",
      zh: "刺激在于既被看见又被考验。{bias}带来无法忽视的强度，你回应它时就会成长。",
    },
    tension: {
      en: "You may feel judged or pressured, even when nothing was meant. Guard your own pace and say when it is too much.",
      ko: "의도가 없었는데도 평가받거나 압박받는 기분이 들 수 있어요. 내 속도를 지키고, 벅찰 땐 벅차다고 말하세요.",
      zh: "即使对方没有恶意，你也可能觉得被评判、被施压。守住自己的节奏，吃不消时要说出来。",
    },
    fix: {
      en: "Treat the friction as training, not a verdict. Protect one area where you are fully yourself.",
      ko: "마찰을 '판결'이 아니라 '훈련'으로 보세요. 온전히 나다울 수 있는 영역 하나는 지켜 두세요.",
      zh: "把摩擦当作训练，而不是判决。留一块完全属于自己的地方。",
    },
  },
  clash: {
    label: { en: "Polar Opposites · 天干沖", ko: "천간충 · 정반대의 극", zh: "天干冲 · 两极相对" },
    chem: {
      en: "{uStem} and {bStem} sit on opposite poles: the same polarity with controlling elements. It is the highest-voltage pairing in the chart, “{uNature}” against “{bNature}”.",
      ko: "{uStem}와(과) {bStem}은(는) 정반대 극에 있는 천간충이에요. 같은 음양에 서로 극하는 오행이라, 차트에서 전압이 가장 높은 조합이에요. '{uNature}' 대 '{bNature}'.",
      zh: "{uStem}与{bStem}位于相对的两极，即同阴阳又相克，是盘面上电压最高的组合：“{uNature}”对“{bNature}”。",
    },
    attract: {
      en: "Opposites that can't look away. The attraction is electric because neither of you is easy to predict.",
      ko: "정반대인데 서로 눈을 못 떼는 사이예요. 둘 다 예측이 안 되는 사람이라 끌림이 전기처럼 짜릿해요.",
      zh: "完全相反却移不开视线。两人都难以预测，所以吸引像电流一样刺激。",
    },
    tension: {
      en: "Fireworks both ways: big disagreements, then big make-ups. You need space and a shared rule for cooling down, otherwise small things spark large fights.",
      ko: "좋을 때도 싸울 때도 불꽃이 튀어요. 크게 부딪히고 크게 화해하는 패턴이라, 거리 두기와 식히는 규칙이 없으면 사소한 일이 큰 싸움이 돼요.",
      zh: "好的时候和吵的时候都火花四溅：大吵大和。若没有留白和“降温规则”，小事也会点燃大战。",
    },
    fix: {
      en: "Agree on a cooling-off phrase before you need it, and give each other space without keeping score.",
      ko: "필요해지기 전에 '잠깐 쉬자' 같은 신호를 미리 정해 두고, 점수를 매기지 않고 서로에게 공간을 주세요.",
      zh: "在需要之前约定好“先冷静一下”的暗号，给彼此空间，也不要记账。",
    },
  },
};

const LOVE: Record<Element, { give: L3; friction: L3; remedy: { color: L3; direction: L3; numbers: string; ritual: L3 } }> = {
  wood: {
    give: {
      en: "steady encouragement and long-term loyalty, helping the other grow",
      ko: "꾸준한 응원과 오래가는 의리로 상대가 자라도록 돕는 방식",
      zh: "用持续的鼓励与长久的忠诚，帮助对方成长",
    },
    friction: {
      en: "stubbornness about their own direction",
      ko: "자기 방향에 대한 고집",
      zh: "对自己方向的固执",
    },
    remedy: {
      color: { en: "Green, teal", ko: "초록, 청록", zh: "绿色、青色" },
      direction: { en: "East", ko: "동쪽", zh: "东方" },
      numbers: "3 · 8",
      ritual: {
        en: "Morning light and green: take a walk together, keep a plant, or plan something that grows over time.",
        ko: "아침 햇빛과 초록: 함께 산책하고, 식물을 키우고, 시간이 지날수록 자라는 계획을 세워 보세요.",
        zh: "晨光与绿意：一起散步、养一盆植物，或定一个会随时间成长的计划。",
      },
    },
  },
  fire: {
    give: {
      en: "bold, visible affection: compliments, surprises and big gestures",
      ko: "칭찬, 서프라이즈, 큰 표현처럼 눈에 보이는 열정적인 애정 표현",
      zh: "大方外露的爱意：夸奖、惊喜与盛大的表达",
    },
    friction: {
      en: "quick temper and burning out fast",
      ko: "욱하는 성질과 금방 타 버리는 에너지",
      zh: "急脾气与容易燃尽",
    },
    remedy: {
      color: { en: "Red, coral, warm pink", ko: "빨강, 코랄, 따뜻한 핑크", zh: "红色、珊瑚色、暖粉" },
      direction: { en: "South", ko: "남쪽", zh: "南方" },
      numbers: "2 · 7",
      ritual: {
        en: "Warm light and movement: dance or sing together, light a candle in the evening, or share a high-energy playlist.",
        ko: "따뜻한 빛과 움직임: 같이 춤추고 노래하고, 저녁에 캔들을 켜거나 에너지 넘치는 플레이리스트를 공유해 보세요.",
        zh: "暖光与律动：一起跳舞唱歌，傍晚点一支蜡烛，或分享一份高能歌单。",
      },
    },
  },
  earth: {
    give: {
      en: "dependable care: remembering details and always showing up",
      ko: "디테일을 기억하고 늘 곁에 나타나 주는 믿음직한 돌봄",
      zh: "可靠的照顾：记得细节，始终出现",
    },
    friction: {
      en: "slowness to change and quiet grudges",
      ko: "변화에 느린 점과 말없이 쌓아 두는 서운함",
      zh: "不愿改变，以及默默积压的委屈",
    },
    remedy: {
      color: { en: "Yellow, beige, camel", ko: "노랑, 베이지, 카멜", zh: "黄色、米色、驼色" },
      direction: { en: "Center · home", ko: "중앙 · 집", zh: "中央 · 家" },
      numbers: "5 · 10",
      ritual: {
        en: "Grounding rituals: cook or share a meal, tidy a shared space, and keep one steady weekly routine.",
        ko: "안정감을 주는 의식: 같이 밥을 해 먹고, 공간을 정돈하고, 매주 변하지 않는 루틴 하나를 만들어 보세요.",
        zh: "安定的小仪式：一起做饭或吃饭，整理共享空间，保留一个每周不变的习惯。",
      },
    },
  },
  metal: {
    give: {
      en: "precise, high-standard devotion: quality time and honest feedback",
      ko: "퀄리티 타임과 솔직한 피드백으로 보여 주는 정확하고 기준 높은 헌신",
      zh: "精准、高标准的投入：高质量陪伴与坦诚的反馈",
    },
    friction: {
      en: "reserved manner and cutting words",
      ko: "속을 잘 안 보여 주는 태도와 날 선 말투",
      zh: "含蓄冷淡，以及话说得锋利",
    },
    remedy: {
      color: { en: "White, silver, gold", ko: "흰색, 은색, 금색", zh: "白色、银色、金色" },
      direction: { en: "West", ko: "서쪽", zh: "西方" },
      numbers: "4 · 9",
      ritual: {
        en: "Clarity and polish: declutter, wear something metallic, and set clear, kind boundaries together.",
        ko: "정리와 광택: 물건을 비우고, 금속 소재 액세서리를 착용하고, 서로 다정하고 분명한 경계를 정해 보세요.",
        zh: "清爽与光泽：断舍离，戴一件金属饰品，一起定下清晰而温柔的界线。",
      },
    },
  },
  water: {
    give: {
      en: "intuitive, emotionally deep attention and late-night talks",
      ko: "직감적이고 감정이 깊은 관심, 새벽까지 이어지는 대화",
      zh: "直觉敏锐、情感深邃的关注，和深夜长谈",
    },
    friction: {
      en: "mood tides and going quiet to avoid conflict",
      ko: "감정의 밀물과 썰물, 갈등을 피해 입을 닫는 습관",
      zh: "情绪的潮起潮落，以及为躲冲突而沉默",
    },
    remedy: {
      color: { en: "Black, navy, deep blue", ko: "검정, 네이비, 딥블루", zh: "黑色、藏青、深蓝" },
      direction: { en: "North", ko: "북쪽", zh: "北方" },
      numbers: "1 · 6",
      ritual: {
        en: "Flow and reflection: drink more water, take a night walk, or write down what you feel before you talk about it.",
        ko: "흐름과 성찰: 물을 더 마시고, 밤 산책을 하고, 말하기 전에 감정을 글로 적어 보세요.",
        zh: "流动与沉淀：多喝水，夜里散步，开口之前先把感受写下来。",
      },
    },
  },
};

const T: Record<
  Lang,
  {
    titles: Record<SectionId, string>;
    you: string;
    tiers: [string, string, string, string, string];
    chemHead: string;
    romanceHead: string;
    shadowHead: string;
    remedyHead: string;
    teasers: Record<SectionId, string>;
    stemLine: string;
    giveLine: string;
    giveLineYou: string;
    watchLine: string;
    watchLineYou: string;
    remedyIntro: string;
    colorB: string;
    dirB: string;
    numB: string;
    doB: string;
    avoidB: string;
    avoid: Record<Element, string>;
    disclaimer: string;
  }
> = {
  en: {
    titles: {
      chemistry: "Cosmic Chemistry",
      romance: "Romance Dynamic",
      shadow: "Shadow & Tension",
      remedy: "Saju Remedy",
    },
    you: "You",
    tiers: ["Destined Alchemy", "Magnetic Harmony", "Warm Resonance", "Slow Burn", "Spark & Friction"],
    chemHead: "Your souls vibrate at {score}%: {verdict}",
    romanceHead: "How love moves between {you} and {bias}",
    shadowHead: "Where the friction lives",
    remedyHead: "Feed the {el} to strengthen the bond",
    teasers: {
      chemistry: "",
      romance: "What really pulls you and {bias} together, and the love language each of you speaks without saying a word…",
      shadow: "The one habit that could quietly create distance between you and {bias}, and how to defuse it before it grows…",
      remedy: "Your pair's lucky color, direction and numbers, plus a small ritual that makes the bond stronger…",
    },
    stemLine: "{uStem} ({uTag}) × {bStem} ({bTag})",
    giveLine: "{name} shows love through {style}.",
    giveLineYou: "You show love through {style}.",
    watchLine: "Watch for: {name}'s {fric}.",
    watchLineYou: "Watch for: your {fric}.",
    remedyIntro:
      "Across both charts, {el} is the quietest element, so it is the one that most helps this pairing. Weaving it into your routines is the simplest way to steady the connection.",
    colorB: "Lucky colors: {v}",
    dirB: "Lucky direction: {v}",
    numB: "Lucky numbers: {v}",
    doB: "Ritual: {v}",
    avoidB: "Go easy on: {v}",
    avoid: {
      wood: "rigid plans that leave no room to bend",
      fire: "late-night arguments when you are tired",
      earth: "swallowing feelings until they pile up",
      metal: "sharp criticism sent in a hurry",
      water: "long silences with no explanation",
    },
    disclaimer:
      "For entertainment and self-reflection only. This report is based on the publicly listed birth date and a simplified Day Master reading (no birth time or branches). It does not describe the real personality of any artist or predict a real relationship.",
  },
  ko: {
    titles: {
      chemistry: "코스믹 케미",
      romance: "애정 다이내믹",
      shadow: "그림자 & 텐션",
      remedy: "사주 처방",
    },
    you: "당신",
    tiers: ["운명적 연금술", "자석 같은 하모니", "따뜻한 공명", "천천히 타오르는 불", "스파크 & 마찰"],
    chemHead: "두 영혼의 주파수 {score}%: {verdict}",
    romanceHead: "{you}와(과) {bias} 사이에 사랑이 흐르는 방식",
    shadowHead: "마찰이 숨어 있는 곳",
    remedyHead: "{el}의 기운을 채우면 인연이 단단해져요",
    teasers: {
      chemistry: "",
      romance: "당신과 {bias}을(를) 끌어당기는 진짜 이유, 그리고 서로가 말없이 쓰는 사랑의 언어는…",
      shadow: "{bias}와(과) 당신 사이에 조용히 거리를 만들 수 있는 단 하나의 습관, 그리고 커지기 전에 푸는 법…",
      remedy: "두 사람만의 행운의 색·방향·숫자, 그리고 인연을 단단하게 하는 작은 의식…",
    },
    stemLine: "{uStem}({uTag}) × {bStem}({bTag})",
    giveLine: "{name}의 애정 표현: {style}",
    giveLineYou: "{name}의 애정 표현: {style}",
    watchLine: "주의: {name}의 {fric}",
    watchLineYou: "주의: {name}의 {fric}",
    remedyIntro:
      "두 사람의 사주를 합치면 {el} 기운이 가장 조용해요. 그래서 이 조합에는 {el}을(를) 채우는 것이 가장 큰 도움이 돼요. 일상 루틴에 살짝 녹여 보는 게 가장 쉬운 방법이에요.",
    colorB: "행운의 색: {v}",
    dirB: "행운의 방향: {v}",
    numB: "행운의 숫자: {v}",
    doB: "실천: {v}",
    avoidB: "조심할 것: {v}",
    avoid: {
      wood: "굽힐 여지 없는 빡빡한 계획",
      fire: "피곤할 때 밤늦게 하는 말다툼",
      earth: "감정을 삼키다 쌓아 두기",
      metal: "급하게 보낸 날 선 지적",
      water: "설명 없이 길어지는 침묵",
    },
    disclaimer:
      "재미와 자기성찰을 위한 콘텐츠예요. 공개된 생년월일과 간이 일간 풀이(출생 시각·지지 미반영)를 바탕으로 하며, 아티스트 본인의 실제 성격이나 실제 관계의 결과를 말해 주지 않아요.",
  },
  zh: {
    titles: {
      chemistry: "宇宙化学反应",
      romance: "恋爱动态",
      shadow: "阴影与张力",
      remedy: "八字开运",
    },
    you: "你",
    tiers: ["命定炼金术", "磁石般的和谐", "温暖的共鸣", "慢热之火", "火花与摩擦"],
    chemHead: "灵魂频率契合 {score}%：{verdict}",
    romanceHead: "爱在{you}与{bias}之间如何流动",
    shadowHead: "摩擦藏在哪里",
    remedyHead: "补足{el}之气，让缘分更稳固",
    teasers: {
      chemistry: "",
      romance: "真正把你和{bias}吸引到一起的力量，以及你们各自不言而喻的爱之语言…",
      shadow: "可能悄悄拉开你与{bias}距离的那一个习惯，以及在它变大之前化解的方法…",
      remedy: "属于你们的幸运色、方位、数字，以及让缘分更稳固的小仪式…",
    },
    stemLine: "{uStem}（{uTag}）× {bStem}（{bTag}）",
    giveLine: "{name}表达爱的方式是：{style}。",
    giveLineYou: "{name}表达爱的方式是：{style}。",
    watchLine: "留意：{name}的{fric}。",
    watchLineYou: "留意：{name}的{fric}。",
    remedyIntro:
      "把两人的命盘合在一起看，{el}是最安静的五行，所以补足{el}对这段缘分帮助最大。最简单的做法，是把它悄悄融进日常习惯。",
    colorB: "幸运色：{v}",
    dirB: "幸运方位：{v}",
    numB: "幸运数字：{v}",
    doB: "小仪式：{v}",
    avoidB: "尽量避免：{v}",
    avoid: {
      wood: "毫无弹性的死板计划",
      fire: "疲惫时的深夜争吵",
      earth: "把情绪咽下去越积越多",
      metal: "匆忙发出的尖锐批评",
      water: "不加解释的长时间沉默",
    },
    disclaimer:
      "仅供娱乐与自我探索。本报告基于公开的出生日期与简化的日主解读（未计入出生时辰与地支），不代表任何艺人的真实性格，也不预测真实的人际关系。",
  },
};

const NUM = ["01", "02", "03", "04"];

/* 한국어 조사 자동 선택: "{bias}은(는)" -> "뷔는" / "정국은" */
const HANJA_BATCHIM = "木金"; // 목, 금 = 받침 있음 (火 화, 土 토, 水 수 = 없음)
function hasBatchim(ch: string): boolean {
  const c = ch.charCodeAt(0);
  if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0;
  if (HANJA_BATCHIM.includes(ch)) return true;
  if (/[0136-8]/.test(ch)) return true; // 영, 일, 삼, 육, 칠, 팔
  return /[lmngkpbLMNGKPB]/.test(ch); // 영문 이름: 끝소리가 받침으로 나는 글자
}
function isRieul(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 === 8;
}
const JOSA: Record<string, [string, string]> = {
  "은(는)": ["은", "는"],
  "이(가)": ["이", "가"],
  "을(를)": ["을", "를"],
  "와(과)": ["과", "와"],
  "(으)로": ["으로", "로"],
};
export function josa(text: string): string {
  return text.replace(
    /([가-힣A-Za-z0-9木火土金水])(\([一-鿿]\))?(은\(는\)|이\(가\)|을\(를\)|와\(과\)|\(으\)로)/g,
    (_m, ch: string, han: string | undefined, j: string) => `${ch}${han ?? ""}${JOSA[j][hasBatchim(ch) && !(j === "(으)로" && isRieul(ch)) ? 0 : 1]}`,
  );
}

function tierIndex(score: number): number {
  return score >= 92 ? 0 : score >= 85 ? 1 : score >= 78 ? 2 : score >= 70 ? 3 : 4;
}

/* ------------------------------------------------------------------ */
/* 메인 함수                                                            */
/* ------------------------------------------------------------------ */

export function buildReport(userBirth: BirthInput, bias: BiasInput, lang: Lang): CompatReport {
  const t = T[lang];
  const F = (tpl: string, vars: Record<string, string | number>) => (lang === "ko" ? josa(fill(tpl, vars)) : fill(tpl, vars));
  const you = viewOf(t.you, userBirth);
  const bs = viewOf(bias.name, bias.birth);
  for (const p of [you, bs]) {
    p.nature = STEMS[p.stemIndex].nature[lang];
    p.tag = STEMS[p.stemIndex].tag[lang];
  }

  const relation = relationOf(you.stemIndex, bs.stemIndex);
  const score = computeScore(you, bs, relation);
  const verdict = t.tiers[tierIndex(score)];

  const weak = weakestElement(you, bs);
  const combine = COMBINE_ELEMENT[you.stemIndex % 5];
  const elName = (e: Element) => ELEMENT_NAME[lang][e];
  const stemName = (p: PersonView) => `${p.stemChar}${ELEMENT_CHAR[STEM_ELEMENT[p.stemIndex]]}`;

  const v = {
    bias: bs.name,
    you: you.name,
    score,
    verdict,
    uStem: stemName(you),
    bStem: stemName(bs),
    uTag: you.tag,
    bTag: bs.tag,
    uNature: you.nature,
    bNature: bs.nature,
    uEl: elName(you.element),
    bEl: elName(bs.element),
    combine: elName(combine),
    el: elName(weak),
  };

  const R = REL[relation];
  const uLove = LOVE[you.element];
  const bLove = LOVE[bs.element];
  const rem = LOVE[weak].remedy;

  const sections: ReportSection[] = [
    {
      id: "chemistry",
      no: NUM[0],
      title: t.titles.chemistry,
      headline: F(t.chemHead, v),
      teaser: "",
      paragraphs: [F(R.chem[lang], v)],
      bullets: [F(t.stemLine, v), R.label[lang]],
    },
    {
      id: "romance",
      no: NUM[1],
      title: t.titles.romance,
      headline: F(t.romanceHead, v),
      teaser: F(t.teasers.romance, v),
      paragraphs: [F(R.attract[lang], v)],
      bullets: [
        F(t.giveLineYou, { name: you.name, style: uLove.give[lang] }),
        F(t.giveLine, { name: bs.name, style: bLove.give[lang] }),
      ],
    },
    {
      id: "shadow",
      no: NUM[2],
      title: t.titles.shadow,
      headline: t.shadowHead,
      teaser: F(t.teasers.shadow, v),
      paragraphs: [F(R.tension[lang], v)],
      bullets: [
        F(t.watchLineYou, { name: you.name, fric: uLove.friction[lang] }),
        F(t.watchLine, { name: bs.name, fric: bLove.friction[lang] }),
      ],
    },
    {
      id: "remedy",
      no: NUM[3],
      title: t.titles.remedy,
      headline: F(t.remedyHead, v),
      teaser: F(t.teasers.remedy, v),
      paragraphs: [F(t.remedyIntro, v), F(R.fix[lang], v)],
      bullets: [
        F(t.doB, { v: rem.ritual[lang] }),
        F(t.avoidB, { v: t.avoid[weak] }),
      ],
    },
  ];

  return {
    lang,
    relation,
    relationLabel: R.label[lang],
    score,
    verdict,
    you,
    bias: bs,
    sections,
    remedy: {
      element: weak,
      label: elName(weak),
      emoji: ELEMENT_EMOJI[weak],
      color: rem.color[lang],
      direction: rem.direction[lang],
      numbers: rem.numbers,
    },
    disclaimer: t.disclaimer,
  };
}

/* ------------------------------------------------------------------ */
/* 입력 검증 (직접 입력 최애)                                             */
/* ------------------------------------------------------------------ */

/** 'YYYY-MM-DD' -> BirthInput. 실제 존재하는 날짜(1900~오늘)만 허용, 아니면 null */
export function parseBirthString(v: string | null | undefined): BirthInput | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((v ?? "").trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  if (year < 1900 || d.getTime() > Date.now()) return null;
  return { year, month, day };
}

/** 이름 정리: 앞뒤 공백 제거, 제어문자 제거, 공백 정리, 최대 40자. 비면 null */
export function cleanBiasName(v: string | null | undefined): string | null {
  const s = (v ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  return s.length > 0 ? s : null;
}
