// lib/saju.ts
// 생년월일 -> 일간(타고난 오행) / 오행 밸런스 / 소울메이트 궁합 점수를 계산하는 순수 함수 모음.
// 서버(app/result/page.tsx)와 클라이언트 양쪽에서 모두 쓸 수 있도록 브라우저 API를 쓰지 않습니다.
//
// 정확도 메모
// - 일주(일간)는 만세력과 같은 방식(1900-01-01 = 甲戌일 기준)으로 계산합니다.
// - 연주·월주는 절기 날짜를 고정값(입춘 2/4 등)으로 근사한 "간이 계산"입니다. 절기 당일 출생은 1일 오차가 날 수 있어요.
// - 시주(태어난 시각)는 아직 반영하지 않습니다.

export type Lang = 'en' | 'ko' | 'zh';
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export const LANGS: Lang[] = ['en', 'ko', 'zh'];
export const ELEMENT_ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
export const ELEMENT_CHAR: Record<Element, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// 천간(10): 甲乙丙丁戊己庚辛壬癸 -> 오행. 짝수 인덱스 = 양(陽), 홀수 인덱스 = 음(陰)
export const STEM_ELEMENT: Element[] = [
  'wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water',
];
// 지지(12): 子丑寅卯辰巳午未申酉戌亥 -> 오행(본기 기준 단순화)
const BRANCH_ELEMENT: Element[] = [
  'water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water',
];
// 천간합(合化): 甲己->土, 乙庚->金, 丙辛->水, 丁壬->木, 戊癸->火  (인덱스 = 천간 % 5)
const COMBINE_ELEMENT: Element[] = ['earth', 'metal', 'water', 'wood', 'fire'];

export interface BirthInput {
  year: number;
  month: number;
  day: number;
}

export interface SajuResult {
  isSample: boolean;
  birth: BirthInput;
  /** 일간 인덱스 0..9 (甲=0 ... 癸=9) */
  dayStem: number;
  /** 천간합 짝 인덱스 (dayStem + 5) % 10 */
  partnerStem: number;
  /** 일간이 음(陰)이면 true */
  yin: boolean;
  /** 일간의 오행 */
  element: Element;
  /** 천간합으로 변하는 오행 (행운 원소) */
  lucky: Element;
  /** 가장 비중이 큰 오행 */
  dominant: Element;
  /** 오행 비중(%) 내림차순, 합계 100 */
  balance: { element: Element; pct: number }[];
  score: number;
  sparkScore: number;
  harmonyScore: number;
  growthScore: number;
}

/** 입력값이 없을 때 보여주는 샘플. 1993-06-15 = 丁일(음의 불) + 火 43% + 궁합 98% (뷰어 v2 화면과 같은 구성) */
export const SAMPLE_BIRTH: BirthInput = { year: 1993, month: 6, day: 15 };

const mod = (n: number, m: number) => ((n % m) + m) % m;

function isValidDate({ year, month, day }: BirthInput): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1900 || year > 2100) return false;
  const t = new Date(Date.UTC(year, month - 1, day));
  return t.getUTCFullYear() === year && t.getUTCMonth() === month - 1 && t.getUTCDate() === day;
}

/** 1900-01-01(甲戌일)부터 지난 날 수 */
function dayIndex({ year, month, day }: BirthInput): number {
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 1)) / 86400000);
}

// [월, 일, 지지 인덱스]: 해당 절기부터 그 달의 지지가 시작됨 (근사값)
const MONTH_TERMS: [number, number, number][] = [
  [1, 6, 1], [2, 4, 2], [3, 6, 3], [4, 5, 4], [5, 6, 5], [6, 6, 6],
  [7, 7, 7], [8, 8, 8], [9, 8, 9], [10, 8, 10], [11, 7, 11], [12, 7, 0],
];

function monthBranchOf(month: number, day: number): number {
  let branch = 0; // 1/6 이전은 전년 12월 절기(大雪)부터 이어지는 子월
  for (const [m, d, b] of MONTH_TERMS) {
    if (month > m || (month === m && day >= d)) branch = b;
  }
  return branch;
}

function toPercents(weights: Record<Element, number>): Record<Element, number> {
  const total = ELEMENT_ORDER.reduce((s, e) => s + weights[e], 0);
  const raw = ELEMENT_ORDER.map((e) => ({ e, v: (weights[e] / total) * 100 }));
  const out = {} as Record<Element, number>;
  let used = 0;
  for (const r of raw) {
    out[r.e] = Math.floor(r.v);
    used += out[r.e];
  }
  // 가장 큰 소수점부터 1%씩 나눠 합계를 100으로 맞춤
  const order = [...raw].sort((a, b) => (b.v % 1) - (a.v % 1));
  for (let i = 0; used < 100; i++, used++) out[order[i % order.length].e] += 1;
  return out;
}

export function calcSaju(input: BirthInput, isSample = false): SajuResult {
  const n = dayIndex(input);
  const dayStem = mod(n, 10);
  const dayBranch = mod(10 + n, 12);

  // 연주: 입춘(2/4) 이전은 전년도로 계산
  const adjYear = input.month < 2 || (input.month === 2 && input.day < 4) ? input.year - 1 : input.year;
  const yearStem = mod(adjYear - 4, 10);
  const yearBranch = mod(adjYear - 4, 12);

  // 월주: 연간으로 寅월의 천간을 정하고 월 순서만큼 더함
  const monthBranch = monthBranchOf(input.month, input.day);
  const firstMonthStem = [2, 4, 6, 8, 0][yearStem % 5];
  const monthStem = (firstMonthStem + mod(monthBranch - 2, 12)) % 10;

  // 오행 비중: 여섯 글자 + 월지(계절)에 가중치 2
  const w: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  w[STEM_ELEMENT[yearStem]] += 1;
  w[BRANCH_ELEMENT[yearBranch]] += 1;
  w[STEM_ELEMENT[monthStem]] += 1;
  w[BRANCH_ELEMENT[monthBranch]] += 2;
  w[STEM_ELEMENT[dayStem]] += 1;
  w[BRANCH_ELEMENT[dayBranch]] += 1;
  const pct = toPercents(w);
  const balance = ELEMENT_ORDER.map((element) => ({ element, pct: pct[element] })).sort(
    (a, b) => b.pct - a.pct || ELEMENT_ORDER.indexOf(a.element) - ELEMENT_ORDER.indexOf(b.element),
  );

  // 천간합 궁합은 항상 "운명의 짝"이므로 94~99% 사이로 날짜에 따라 고정(새로고침해도 같은 값)
  const score = 94 + mod(n + 5, 6);

  return {
    isSample,
    birth: input,
    dayStem,
    partnerStem: (dayStem + 5) % 10,
    yin: dayStem % 2 === 1,
    element: STEM_ELEMENT[dayStem],
    lucky: COMBINE_ELEMENT[dayStem % 5],
    dominant: balance[0].element,
    balance,
    score,
    sparkScore: Math.min(99, score + 1),
    harmonyScore: score - 2,
    growthScore: score,
  };
}

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** ?y=2000&m=1&d=10 (또는 ?birth=2000-01-10) -> 결과. 값이 없거나 잘못되면 샘플 결과 */
export function resultFromParams(params: Params): SajuResult {
  let y = Number(first(params.y));
  let m = Number(first(params.m));
  let d = Number(first(params.d));
  const birth = first(params.birth);
  if (birth && /^\d{4}-\d{1,2}-\d{1,2}$/.test(birth)) {
    [y, m, d] = birth.split('-').map(Number);
  }
  const input = { year: y, month: m, day: d };
  return isValidDate(input) ? calcSaju(input) : calcSaju(SAMPLE_BIRTH, true);
}

export function parseLang(v: string | string[] | undefined | null): Lang | null {
  const s = Array.isArray(v) ? v[0] : v;
  return s === 'en' || s === 'ko' || s === 'zh' ? s : null;
}

/** Accept-Language 헤더 -> 언어 */
export function langFromHeader(header: string | null | undefined): Lang {
  const h = (header ?? '').toLowerCase();
  if (h.startsWith('ko')) return 'ko';
  if (h.startsWith('zh')) return 'zh';
  return 'en';
}

/** 메인 화면에서 결과 화면으로 넘어갈 때 쓰는 주소 만들기 */
export function resultHref(birth: { year: number; month: number; day: number }, lang?: Lang): string {
  const q = new URLSearchParams({
    y: String(birth.year),
    m: String(birth.month),
    d: String(birth.day),
  });
  if (lang) q.set('lang', lang);
  return `/result?${q.toString()}`;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const formatBirth = (b: BirthInput) => `${b.year}-${pad2(b.month)}-${pad2(b.day)}`;
