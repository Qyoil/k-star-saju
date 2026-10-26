// lib/idols.ts
// 무료 결과에서 자동 매칭되는 "사주 기반 소울메이트" 명단.
// 키 = 짝(partner) 천간 인덱스 (甲=0, 乙=1, 丙=2, 丁=3, 戊=4, 己=5, 庚=6, 辛=7, 壬=8, 癸=9)
// 예) 사용자가 丁(3)이면 짝은 壬(8) -> BTS V
//
// 주의: 이 배정은 서비스용 "재미 매칭"이며 아티스트의 실제 생년월일 풀이가 아닙니다.
// 여기만 고치면 전체 화면에 반영되니, 원하는 아이돌로 자유롭게 바꾸세요.
import type { Lang } from './saju';

export const SOULMATES: Record<number, Record<Lang, string>> = {
  0: { en: 'Stray Kids Bang Chan', ko: '스트레이 키즈 방찬', zh: 'Stray Kids Bang Chan' },
  1: { en: 'aespa Karina', ko: '에스파 카리나', zh: 'aespa Karina' },
  2: { en: 'BLACKPINK Jennie', ko: '블랙핑크 제니', zh: 'BLACKPINK Jennie' },
  3: { en: 'BTS Jungkook', ko: 'BTS 정국', zh: 'BTS Jungkook' },
  4: { en: 'SEVENTEEN Mingyu', ko: '세븐틴 민규', zh: 'SEVENTEEN Mingyu' },
  5: { en: 'TWICE Tzuyu', ko: '트와이스 쯔위', zh: 'TWICE Tzuyu' },
  6: { en: 'BTS Jimin', ko: 'BTS 지민', zh: 'BTS Jimin' },
  7: { en: 'IVE Wonyoung', ko: '아이브 장원영', zh: 'IVE Wonyoung' },
  8: { en: 'BTS V (Taehyung)', ko: 'BTS 뷔 (태형)', zh: 'BTS V (Taehyung)' },
  9: { en: 'BLACKPINK Lisa', ko: '블랙핑크 리사', zh: 'BLACKPINK Lisa' },
};

// X(트위터) 게시물에 붙는 해시태그. 팬덤이 실제로 쓰는 태그로 바꾸세요. (# 기호는 빼고 적습니다)
export const SOULMATE_TAG: Record<number, string> = {
  0: 'StrayKids',
  1: 'aespa',
  2: 'BLACKPINK',
  3: 'BTS',
  4: 'SEVENTEEN',
  5: 'TWICE',
  6: 'BTS',
  7: 'IVE',
  8: 'BTS',
  9: 'BLACKPINK',
};
