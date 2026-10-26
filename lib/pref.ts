// lib/pref.ts  (새 파일)
// 선호 그룹(?pref=boy|girl|all)에 맞는 소울메이트 아이돌 이름/해시태그를 돌려줍니다.
// 궁합 계산(saju.ts)은 그대로 두고, "짝이 되는 천간(partnerStem)"에 해당하는 아이돌만 그룹별 명단에서 고릅니다.
// 키 = 천간 인덱스 (甲=0, 乙=1, 丙=2, 丁=3, 戊=4, 己=5, 庚=6, 辛=7, 壬=8, 癸=9)
//
// 주의: 재미용 배정이며 아티스트의 실제 생년월일 풀이가 아닙니다. 명단은 자유롭게 바꾸세요.
import { SOULMATES, SOULMATE_TAG } from "./idols";
import type { Lang } from "./saju";

export type Pref = "boy" | "girl" | "all";

export function parsePref(v: string | null | undefined): Pref {
  return v === "boy" || v === "girl" ? v : "all"; // 값이 없거나 이상하면 all (기존 동작 그대로)
}

type Name = Record<Lang, string>;
const n = (en: string, ko: string): Name => ({ en, ko, zh: en });

const BOY: Record<number, { name: Name; tag: string }> = {
  0: { name: n("Stray Kids Bang Chan", "스트레이 키즈 방찬"), tag: "StrayKids" },
  1: { name: n("Stray Kids Hyunjin", "스트레이 키즈 현진"), tag: "StrayKids" },
  2: { name: n("SEVENTEEN Jeonghan", "세븐틴 정한"), tag: "SEVENTEEN" },
  3: { name: n("BTS Jungkook", "BTS 정국"), tag: "BTS" },
  4: { name: n("SEVENTEEN Mingyu", "세븐틴 민규"), tag: "SEVENTEEN" },
  5: { name: n("TXT Soobin", "TXT 수빈"), tag: "TXT" },
  6: { name: n("BTS Jimin", "BTS 지민"), tag: "BTS" },
  7: { name: n("ENHYPEN Sunghoon", "엔하이픈 성훈"), tag: "ENHYPEN" },
  8: { name: n("BTS V (Taehyung)", "BTS 뷔 (태형)"), tag: "BTS" },
  9: { name: n("ATEEZ San", "에이티즈 산"), tag: "ATEEZ" },
};

const GIRL: Record<number, { name: Name; tag: string }> = {
  0: { name: n("ITZY Yuna", "있지 유나"), tag: "ITZY" },
  1: { name: n("aespa Karina", "에스파 카리나"), tag: "aespa" },
  2: { name: n("BLACKPINK Jennie", "블랙핑크 제니"), tag: "BLACKPINK" },
  3: { name: n("TWICE Jihyo", "트와이스 지효"), tag: "TWICE" },
  4: { name: n("(G)I-DLE Miyeon", "(여자)아이들 미연"), tag: "GIDLE" },
  5: { name: n("TWICE Tzuyu", "트와이스 쯔위"), tag: "TWICE" },
  6: { name: n("aespa Winter", "에스파 윈터"), tag: "aespa" },
  7: { name: n("IVE Wonyoung", "아이브 장원영"), tag: "IVE" },
  8: { name: n("BLACKPINK Rosé", "블랙핑크 로제"), tag: "BLACKPINK" },
  9: { name: n("BLACKPINK Lisa", "블랙핑크 리사"), tag: "BLACKPINK" },
};

/** pref=all 이면 기존 혼성 명단(lib/idols.ts)을 그대로 씁니다. */
export function idolName(stem: number, pref: Pref, lang: Lang): string {
  if (pref === "boy") return BOY[stem].name[lang];
  if (pref === "girl") return GIRL[stem].name[lang];
  return SOULMATES[stem][lang];
}

export function idolTag(stem: number, pref: Pref): string {
  if (pref === "boy") return BOY[stem].tag;
  if (pref === "girl") return GIRL[stem].tag;
  return SOULMATE_TAG[stem];
}
