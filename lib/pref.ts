// lib/pref.ts
// 선호 그룹(?pref=boy|girl|all)에 맞는 소울메이트 아이돌 풀(Pool)과 매칭 함수.
//
// ■ 구조
//   - 아이돌마다 "공개된 생년월일(born)"로 일간(Day Master, 甲~癸)을 계산해 stem/element 를 채웁니다.
//     (계산은 lib/saju.ts 의 calcSaju 를 그대로 사용 → 유저 결과와 같은 만세력 기준)
//   - 유저의 짝 천간(result.partnerStem)과 같은 일간을 가진 아이돌 풀에서 1명을 고릅니다.
//   - 같은 일간 풀 안에서는 seed(유저 생일 등)로 자연스럽게 1명을 선출합니다. 같은 생일 = 같은 결과.
//
// ■ ResultView.tsx 호환 (기존 import 그대로 동작)
//   idolName(stem, pref, lang, seed?)  -> 문자열 (seed 생략 시 풀의 첫 번째)
//   idolTag(stem, pref, seed?)         -> "BTS #V"  (트윗 템플릿 "#KStarSaju #{tag}" 에 그대로 들어감)
//   parsePref(v), type Pref
//
// ■ 주의: 재미용 배정입니다. 아티스트의 실제 운세를 풀이한 것이 아니며, 생년월일은 공개 프로필 기준(출생 시각 미반영)입니다.
//   명단·해시태그는 아래 ROSTER 표만 고치면 됩니다. 생년월일을 바꾸면 일간은 자동으로 다시 계산됩니다.
import { calcSaju, type Element, type Lang } from "./saju";

export type Pref = "boy" | "girl" | "all";

export function parsePref(v: string | null | undefined): Pref {
  return v === "boy" || v === "girl" ? v : "all"; // 값이 없거나 이상하면 all
}

export type Gender = "boy" | "girl";
export type StemHan = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";
export type ElementName = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

export interface Idol {
  id: string; //          'bts-v'
  name: string; //        'BTS V'
  nameKo: string; //      'BTS 뷔'
  group: string; //       'BTS'
  gender: Gender;
  born: string; //       공개 프로필 생년월일 'YYYY-MM-DD' (심층 궁합 계산용)
  stem: StemHan; //       일간(천간 한자)
  stemIndex: number; //   0..9 (甲=0 ... 癸=9)
  element: ElementName; // 일간의 오행
  xHashtag: string; //    '#BTS #V'  (X 공유용)
}

const STEM_HAN: StemHan[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ELEMENT_BY_STEM: ElementName[] = [
  "Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water",
];

// 그룹표: [영문 표기(이름 앞에 붙음), 한글 표기, X 그룹 해시태그]
const GROUPS = {
  bts: ["BTS", "BTS", "BTS"],
  svt: ["SEVENTEEN", "세븐틴", "SEVENTEEN"],
  skz: ["Stray Kids", "스트레이 키즈", "StrayKids"],
  txt: ["TXT", "TXT", "TXT"],
  enh: ["ENHYPEN", "엔하이픈", "ENHYPEN"],
  riize: ["RIIZE", "라이즈", "RIIZE"],
  ateez: ["ATEEZ", "에이티즈", "ATEEZ"],
  exo: ["EXO", "EXO", "EXO"],
  bp: ["BLACKPINK", "블랙핑크", "BLACKPINK"],
  aespa: ["aespa", "에스파", "aespa"],
  nj: ["NewJeans", "뉴진스", "NewJeans"],
  ive: ["IVE", "아이브", "IVE"],
  lsf: ["LE SSERAFIM", "르세라핌", "LESSERAFIM"],
  twice: ["TWICE", "트와이스", "TWICE"],
  itzy: ["ITZY", "있지", "ITZY"],
  gidle: ["(G)I-DLE", "(여자)아이들", "GIDLE"],
  rescene: ["RESCENE", "리센느", "RESCENE"],
  illit: ["ILLIT", "아일릿", "ILLIT"],
} as const;
type GroupKey = keyof typeof GROUPS;

// 명단: [성별, 그룹, 영문 활동명, 한글 활동명, 생년월일(공개 프로필), (선택) 해시태그용 멤버 이름]
type Row = [Gender, GroupKey, string, string, string, string?];
const ROSTER: Row[] = [
  // ── 보이그룹 ─────────────────────────────
  ["boy", "bts", "Jin", "진", "1992-12-04"],
  ["boy", "bts", "Suga", "슈가", "1993-03-09"],
  ["boy", "bts", "RM", "RM", "1994-09-12"],
  ["boy", "bts", "Jimin", "지민", "1995-10-13"],
  ["boy", "bts", "V", "뷔", "1995-12-30"],
  ["boy", "bts", "Jungkook", "정국", "1997-09-01"],
  ["boy", "svt", "Jeonghan", "정한", "1995-10-04"],
  ["boy", "svt", "Mingyu", "민규", "1997-04-06"],
  ["boy", "svt", "Hoshi", "호시", "1996-06-15"],
  ["boy", "svt", "Wonwoo", "원우", "1996-07-17"],
  ["boy", "skz", "Bang Chan", "방찬", "1997-10-03", "BangChan"],
  ["boy", "skz", "Hyunjin", "현진", "2000-03-20"],
  ["boy", "skz", "Felix", "필릭스", "2000-09-15"],
  ["boy", "skz", "Seungmin", "승민", "2000-09-22"],
  ["boy", "skz", "I.N", "아이엔", "2001-02-08", "IN"],
  ["boy", "txt", "Soobin", "수빈", "2000-12-05"],
  ["boy", "txt", "Taehyun", "태현", "2002-02-05"],
  ["boy", "enh", "Sunghoon", "성훈", "2002-12-08"],
  ["boy", "enh", "Heeseung", "희승", "2001-10-15"],
  ["boy", "riize", "Sungchan", "성찬", "2001-09-13"],
  ["boy", "riize", "Wonbin", "원빈", "2002-03-02"],
  ["boy", "ateez", "Seonghwa", "성화", "1998-04-03"],
  ["boy", "exo", "Baekhyun", "백현", "1992-05-06"],
  // ── 걸그룹 ─────────────────────────────
  ["girl", "bp", "Jisoo", "지수", "1995-01-03"],
  ["girl", "bp", "Jennie", "제니", "1996-01-16"],
  ["girl", "bp", "Rosé", "로제", "1997-02-11"],
  ["girl", "bp", "Lisa", "리사", "1997-03-27"],
  ["girl", "aespa", "Karina", "카리나", "2000-04-11"],
  ["girl", "aespa", "Giselle", "지젤", "2000-10-30"],
  ["girl", "aespa", "Winter", "윈터", "2001-01-01"],
  ["girl", "aespa", "Ningning", "닝닝", "2002-10-23"],
  ["girl", "nj", "Hanni", "하니", "2004-10-06"],
  ["girl", "nj", "Minji", "민지", "2004-05-07"],
  ["girl", "nj", "Danielle", "다니엘", "2005-04-11"],
  ["girl", "nj", "Haerin", "해린", "2006-05-15"],
  ["girl", "ive", "Wonyoung", "장원영", "2004-08-31"],
  ["girl", "ive", "Yujin", "안유진", "2003-09-01"],
  ["girl", "lsf", "Sakura", "사쿠라", "1998-03-19"],
  ["girl", "lsf", "Kazuha", "카즈하", "2003-08-09"],
  ["girl", "lsf", "Chaewon", "채원", "2000-08-01"],
  ["girl", "lsf", "Eunchae", "은채", "2006-11-10"],
  ["girl", "twice", "Nayeon", "나연", "1995-09-22"],
  ["girl", "twice", "Tzuyu", "쯔위", "1999-06-14"],
  ["girl", "itzy", "Chaeryeong", "채령", "2001-06-05"],
  ["girl", "gidle", "Miyeon", "미연", "1997-01-31"],
  // ── 보너스 루키 ─────────────────────────
  ["girl", "rescene", "Woni", "원이", "2004-05-25"],
  ["girl", "illit", "Minju", "민주", "2004-05-11"],
  ["girl", "illit", "Moka", "모카", "2004-10-08"],
];

/** 해시태그용: 악센트/기호 제거 후 대문자 (Rosé -> ROSE, J-Hope -> JHOPE) */
function tagWord(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

function build(row: Row): Idol {
  const [gender, gk, member, memberKo, born, tagName] = row;
  const [gEn, gKo, gTag] = GROUPS[gk];
  const [y, m, d] = born.split("-").map(Number);
  const stemIndex = calcSaju({ year: y, month: m, day: d }).dayStem; // 일간 자동 계산
  return {
    id: `${gk}-${tagWord(member).toLowerCase()}`,
    name: `${gEn} ${member}`,
    nameKo: `${gKo} ${memberKo}`,
    group: gEn,
    gender,
    born,
    stem: STEM_HAN[stemIndex],
    stemIndex,
    element: ELEMENT_BY_STEM[stemIndex],
    xHashtag: `#${gTag} #${tagName ?? tagWord(member)}`,
  };
}

/** 전체 풀 (보이 + 걸) */
export const IDOLS: Idol[] = ROSTER.map(build);

/** id 로 아이돌 찾기 (심층 리포트에서 사용). 없으면 undefined */
export function findIdol(id: string | null | undefined): Idol | undefined {
  return id ? IDOLS.find((i) => i.id === id) : undefined;
}

function norm(stem: number): number {
  return ((Math.trunc(stem) % 10) + 10) % 10;
}

/** 일간(stem)과 선호(pref)에 맞는 후보 목록 */
export function idolPool(stem: number, pref: Pref): Idol[] {
  const s = norm(stem);
  const pool = IDOLS.filter((i) => i.stemIndex === s && (pref === "all" || i.gender === pref));
  return pool.length > 0 ? pool : IDOLS.filter((i) => i.stemIndex === s); // 비어 있으면 성별 무관 (안전장치)
}

/** 유저 생일로 seed 만들기: seedFromBirth(2003, 5, 14) */
export function seedFromBirth(year: number, month: number, day: number): number {
  return year * 372 + month * 31 + day;
}

/**
 * 같은 일간 풀에서 seed 로 1명을 고릅니다. (같은 seed = 항상 같은 아이돌)
 * seed 를 생략하면 풀의 첫 번째 아이돌.
 */
export function pickIdol(stem: number, pref: Pref, seed = 0): Idol {
  const pool = idolPool(stem, pref);
  const h = Math.imul((Math.trunc(seed) ^ (norm(stem) + 1) * 0x9e3779b1) >>> 0, 2654435761) >>> 0;
  return pool[(h >>> 8) % pool.length] ?? IDOLS[0];
}

/** ResultView 호환: 표시 이름 (en / ko / zh) */
export function idolName(stem: number, pref: Pref, lang: Lang, seed = 0): string {
  const i = pickIdol(stem, pref, seed);
  return lang === "ko" ? i.nameKo : i.name; // 중국어는 영문 표기 사용
}

/** ResultView 호환: 트윗 템플릿 "#KStarSaju #{tag}" 에 들어가는 값. 예: "BTS #V" */
export function idolTag(stem: number, pref: Pref, seed = 0): string {
  return pickIdol(stem, pref, seed).xHashtag.slice(1); // 맨 앞 '#'는 템플릿에 이미 있음
}
