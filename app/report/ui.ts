// app/report/ui.ts
// 최애 선택 화면 + 심층 리포트 화면의 UI 문구 (EN / 한국어 / 中文) 와 주소 만들기 도우미
import type { BirthInput, Lang } from "../../lib/saju";

export interface UiText {
  pickerKicker: string;
  pickerTitle: string;
  pickerSub: string; // {n} = 명단 인원
  tabQuick: string;
  tabCustom: string;
  boy: string;
  girl: string;
  customHelp: string;
  nameLabel: string;
  namePh: string;
  birthLabel: string;
  birthHint: string;
  submit: string;
  pending: string;
  errName: string;
  errDate: string;
  errInvalid: string;
  langLabel: string;
  // viewer
  kicker: string;
  coverTitle: string;
  you: string;
  dayMaster: string;
  balance: string;
  born: string;
  chemistry: string;
  print: string;
  change: string;
  back: string;
  luckyColor: string;
  luckyDir: string;
  luckyNum: string;
  footer: string;
  lockedTag: string;
  lockedTitle: string;
  unlockCta: string; // {idol} {price}
  testNote: string;
  unlockedTag: string;
}

export const UI: Record<Lang, UiText> = {
  en: {
    pickerKicker: "1:1 DEEP COMPATIBILITY",
    pickerTitle: "Choose your Bias",
    pickerSub: "Tap one of {n} top idols, or enter any idol's birthday yourself.",
    tabQuick: "Quick Pick",
    tabCustom: "Custom Bias",
    boy: "Boy Groups",
    girl: "Girl Groups",
    customHelp: "Can't find your bias? Type their name and birthday and we'll read the chart.",
    nameLabel: "Idol name",
    namePh: "e.g. Jungkook, Karina, Wonyoung",
    birthLabel: "Birth date (YYYY-MM-DD)",
    birthHint: "Use the idol's publicly listed birthday.",
    submit: "Open my report →",
    pending: "Opening your report…",
    errName: "Please enter your bias's name.",
    errDate: "Enter a real date, like 1997-09-01 (1900 to today).",
    errInvalid: "We couldn't read that selection. Please choose again.",
    langLabel: "Language",
    kicker: "K-STAR SAJU · 1:1 COMPATIBILITY REPORT",
    coverTitle: "The Bias Report",
    you: "You",
    dayMaster: "Day Master",
    balance: "Five elements",
    born: "Born",
    chemistry: "Chemistry",
    print: "Print / Save PDF",
    change: "Change Bias",
    back: "Back to my result",
    luckyColor: "Color",
    luckyDir: "Direction",
    luckyNum: "Numbers",
    footer: "K-Star Saju · for entertainment only",
    lockedTag: "Locked",
    lockedTitle: "3 chapters are waiting for you",
    unlockCta: "Unlock Full Secrets with {idol} for {price}",
    testNote: "Test mode · no payment is taken yet",
    unlockedTag: "Unlocked",
  },
  ko: {
    pickerKicker: "1:1 심층 궁합",
    pickerTitle: "나의 최애를 골라 주세요",
    pickerSub: "톱티어 아이돌 {n}명 중에서 고르거나, 아이돌의 생일을 직접 입력하세요.",
    tabQuick: "빠른 선택",
    tabCustom: "직접 입력",
    boy: "보이 그룹",
    girl: "걸 그룹",
    customHelp: "최애가 목록에 없나요? 이름과 생일을 입력하면 바로 풀이해 드려요.",
    nameLabel: "아이돌 이름",
    namePh: "예: 정국, 카리나, 장원영",
    birthLabel: "생년월일 (YYYY-MM-DD)",
    birthHint: "공개된 아이돌의 생일을 입력해 주세요.",
    submit: "내 리포트 열기 →",
    pending: "리포트를 여는 중…",
    errName: "최애의 이름을 입력해 주세요.",
    errDate: "1997-09-01 처럼 실제 날짜를 입력해 주세요 (1900년~오늘).",
    errInvalid: "선택한 정보를 읽지 못했어요. 다시 골라 주세요.",
    langLabel: "언어",
    kicker: "K-STAR SAJU · 1:1 궁합 리포트",
    coverTitle: "최애 궁합 리포트",
    you: "당신",
    dayMaster: "일간",
    balance: "오행 밸런스",
    born: "생년월일",
    chemistry: "케미",
    print: "인쇄 / PDF 저장",
    change: "다른 최애 고르기",
    back: "내 결과로 돌아가기",
    luckyColor: "색",
    luckyDir: "방향",
    luckyNum: "숫자",
    footer: "K-Star Saju · 재미로만 즐겨 주세요",
    lockedTag: "잠김",
    lockedTitle: "3개의 챕터가 기다리고 있어요",
    unlockCta: "{idol}와(과)의 비밀 전체 열기 · {price}",
    testNote: "테스트 모드 · 아직 결제는 진행되지 않아요",
    unlockedTag: "열림",
  },
  zh: {
    pickerKicker: "1对1深度契合",
    pickerTitle: "选择你的本命爱豆",
    pickerSub: "从{n}位顶级爱豆中一键选择，或自己输入任何爱豆的生日。",
    tabQuick: "快速选择",
    tabCustom: "自定义输入",
    boy: "男团",
    girl: "女团",
    customHelp: "名单里没有你的本命？输入名字和生日，我们来为你解读。",
    nameLabel: "爱豆名字",
    namePh: "例如：田柾国、Karina、张元英",
    birthLabel: "出生日期（YYYY-MM-DD）",
    birthHint: "请填写爱豆公开的生日。",
    submit: "打开我的报告 →",
    pending: "正在打开报告…",
    errName: "请输入本命的名字。",
    errDate: "请输入真实日期，如 1997-09-01（1900年至今天）。",
    errInvalid: "无法读取该选择，请重新选择。",
    langLabel: "语言",
    kicker: "K-STAR SAJU · 1对1契合报告",
    coverTitle: "本命契合报告",
    you: "你",
    dayMaster: "日主",
    balance: "五行分布",
    born: "出生",
    chemistry: "契合度",
    print: "打印 / 保存PDF",
    change: "换一位本命",
    back: "返回我的结果",
    luckyColor: "颜色",
    luckyDir: "方位",
    luckyNum: "数字",
    footer: "K-Star Saju · 仅供娱乐",
    lockedTag: "已锁定",
    lockedTitle: "还有3个章节等你解锁",
    unlockCta: "解锁与{idol}的全部秘密 · {price}",
    testNote: "测试模式 · 目前不会扣款",
    unlockedTag: "已解锁",
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** /report?y=&m=&d=&lang=  (최애를 아직 안 골랐을 때 = 선택 화면) */
export function reportBase(user: BirthInput, lang: Lang): string {
  return `/report?y=${user.year}&m=${user.month}&d=${user.day}&lang=${lang}`;
}

/** 목록에서 고른 최애 */
export function reportHrefIdol(user: BirthInput, lang: Lang, id: string): string {
  return `${reportBase(user, lang)}&b=${encodeURIComponent(id)}`;
}

/** 직접 입력한 최애 */
export function reportHrefCustom(user: BirthInput, lang: Lang, name: string, b: BirthInput): string {
  return `${reportBase(user, lang)}&bn=${encodeURIComponent(name)}&bd=${b.year}-${pad(b.month)}-${pad(b.day)}`;
}

export function resultBackHref(user: BirthInput, lang: Lang): string {
  return `/result?y=${user.year}&m=${user.month}&d=${user.day}&lang=${lang}`;
}
