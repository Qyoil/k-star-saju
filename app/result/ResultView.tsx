"use client";

// app/result/ResultView.tsx
// 결과 화면 본체 (브라우저에서 동작하는 부분: 언어 전환, 스토리 카드 canvas, 저장 모달, 결제 버튼)
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { emblemSvg, PALETTE } from "../../lib/emblem";
import {
  ELEMENT_EMOJI,
  ELEMENT_NAME,
  STEMS,
  UI,
  fill,
  formulaName,
  heroTitle,
  shortTitle,
} from "../../lib/i18n";
import { CHECKOUT_URL, LIST_PRICE, OFF_PCT, usd } from "../../lib/checkout";
import { idolName, idolTag, seedFromBirth, type Pref } from "../../lib/pref";
import {
  ELEMENT_CHAR,
  STEM_ELEMENT,
  formatBirth,
  type Element,
  type Lang,
  type SajuResult,
} from "../../lib/saju";

/* ------------------------------------------------------------------ */
/* 스토리 카드 (9:16 canvas)                                            */
/* ------------------------------------------------------------------ */

const W = 1080;
const H = 1920;
const FAM = '"Unbounded","Noto Sans KR","Noto Sans SC",sans-serif';
const BODY = '"Noto Sans KR","Noto Sans SC",sans-serif';

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

interface CardData {
  title: string;
  nature: string;
  eyebrow: string;
  idol: string;
  score: number;
  label: string;
  userEl: Element;
  userYin: boolean;
  idolEl: Element;
  idolYin: boolean;
}

function loadImg(svg: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

async function waitFonts(sample: string) {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  const jobs = [
    document.fonts.load("800 60px Unbounded", "Aa98%"),
    document.fonts.load("700 30px 'Noto Sans KR'", sample),
    document.fonts.load("700 30px 'Noto Sans SC'", sample),
  ];
  // 폰트 서버가 느려도 2.5초 뒤에는 그냥 그린다
  await Promise.race([
    Promise.all(jobs).catch(() => undefined),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
}

const rgbOf = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");

function glow(ctx: Ctx, x: number, y: number, r: number, rgb: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function star4(ctx: Ctx, x: number, y: number, s: number, a: number) {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.25, y - s * 0.25);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x + s * 0.25, y + s * 0.25);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s * 0.25, y + s * 0.25);
  ctx.lineTo(x - s, y);
  ctx.lineTo(x - s * 0.25, y - s * 0.25);
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 가운데 정렬 글자. maxWidth 를 넘으면 글자 크기를 줄여서 한 줄에 맞춘다. */
function centerText(
  ctx: Ctx,
  str: string,
  y: number,
  weight: number,
  family: string,
  size: number,
  color: string,
  maxWidth: number,
  track = 0,
  x = W / 2,
) {
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = `${track}px`;
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(str).width > maxWidth && s > 22) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  ctx.fillText(str, x, y);
  ctx.letterSpacing = "0px";
}

async function renderStoryCard(canvas: HTMLCanvasElement, d: CardData, isStale: () => boolean) {
  const ctx = canvas.getContext("2d") as Ctx | null;
  if (!ctx) return;
  const [userImg, idolImg] = await Promise.all([
    loadImg(emblemSvg(d.userEl, d.userYin, "cu", 440)),
    loadImg(emblemSvg(d.idolEl, d.idolYin, "ci", 280)),
    waitFonts(d.title + d.idol + d.label + d.nature + d.eyebrow),
  ]);
  if (isStale()) return; // 그리는 동안 언어가 또 바뀌었으면 이번 그림은 버린다

  const user = PALETTE[d.userEl];
  const mate = PALETTE[d.idolEl];

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#120a30");
  bg.addColorStop(0.5, "#1c1050");
  bg.addColorStop(1, "#0b0620");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  glow(ctx, 540, 570, 470, rgbOf(user.main), 0.26);
  glow(ctx, 290, 1340, 300, rgbOf(mate.main), 0.24);
  glow(ctx, 790, 1340, 270, "255,114,208", 0.13);

  // 별 (항상 같은 위치가 나오도록 고정 시드)
  let seed = 42;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 110; i++) {
    ctx.fillStyle = `rgba(255,255,255,${(rnd() * 0.6 + 0.2).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(rnd() * W, rnd() * H, rnd() * 2 + 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  star4(ctx, 130, 420, 22, 0.8);
  star4(ctx, 960, 1020, 18, 0.7);
  star4(ctx, 900, 280, 14, 0.6);
  star4(ctx, 150, 1620, 16, 0.6);

  ctx.strokeStyle = "rgba(180,160,255,.35)";
  ctx.lineWidth = 2;
  roundRect(ctx, 40, 40, W - 80, H - 80, 64);
  ctx.stroke();

  centerText(ctx, "K-STAR SAJU", 290, 700, FAM, 30, "#f3eeff", 900, 10);
  if (userImg) ctx.drawImage(userImg, 320, 350, 440, 440);
  centerText(ctx, d.title, 885, 800, FAM, 84, "#ffffff", 900);
  centerText(ctx, d.nature, 950, 500, BODY, 38, user.light, 900);

  ctx.strokeStyle = "rgba(180,160,255,.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(380, 1018);
  ctx.lineTo(500, 1018);
  ctx.moveTo(580, 1018);
  ctx.lineTo(700, 1018);
  ctx.stroke();
  star4(ctx, 540, 1018, 14, 0.9);

  centerText(ctx, d.eyebrow.toUpperCase(), 1085, 700, BODY, 26, "#9486cf", 900, 5);
  centerText(ctx, d.idol, 1160, 800, FAM, 58, "#ffffff", 900);

  if (idolImg) ctx.drawImage(idolImg, 150, 1200, 280, 280);

  // 궁합 링 + 점수 (숫자는 링 정중앙)
  const cx = 790;
  const cy = 1340;
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, 125, 0, Math.PI * 2);
  ctx.stroke();
  const ring = ctx.createLinearGradient(cx - 125, cy - 125, cx + 125, cy + 125);
  ring.addColorStop(0, "#ffd27a");
  ring.addColorStop(0.55, "#ff72d0");
  ring.addColorStop(1, "#bfd8ff");
  ctx.strokeStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, 125, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (d.score / 100));
  ctx.stroke();
  centerText(ctx, `${d.score}%`, cy + 26, 800, FAM, 84, "#ffffff", 190, 0, cx);

  centerText(ctx, d.label, 1565, 700, FAM, 44, "#ffd27a", 900);
  centerText(ctx, "#KStarSaju", 1640, 500, BODY, 30, "#b9acea", 900, 2);
}

/* ------------------------------------------------------------------ */
/* 작은 조각들                                                          */
/* ------------------------------------------------------------------ */

function Emblem({
  el,
  yin,
  uid,
  size,
  className,
}: {
  el: Element;
  yin: boolean;
  uid: string;
  size: number;
  className?: string;
}) {
  const html = useMemo(() => emblemSvg(el, yin, uid, size), [el, yin, uid, size]);
  return <div className={`emblem ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

const BTN =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-transparent px-[18px] py-3 text-center text-[15px] font-bold transition-transform active:translate-y-px";

const LANG_LABEL: Record<Lang, string> = { en: "EN", ko: "한국어", zh: "中文" };

const CARD_FILE = "k-star-saju-card.png";

const RETRY: Record<Lang, string> = {
  en: "Test Another Birthday",
  ko: "다른 생년월일로 다시 하기",
  zh: "换个生日再测一次",
};

const BIAS_CTA: Record<Lang, string> = {
  en: "Choose my Bias · Open 1:1 report",
  ko: "내 최애 고르고 1:1 리포트 열기",
  zh: "选择本命 · 打开1对1报告",
};

/* 공유 버튼 아이콘 (인라인 SVG, currentColor 로 버튼 글자색을 따라감) */
function IconInstagram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IconSave() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 화면                                                                 */
/* ------------------------------------------------------------------ */

export default function ResultView({
  result,
  initialLang,
  pref,
}: {
  result: SajuResult;
  initialLang: Lang;
  pref: Pref;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardUrl, setCardUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [manualText, setManualText] = useState<string | null>(null); // 클립보드가 막혔을 때 직접 복사할 문구
  const [status, setStatus] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const modalCaptionRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawToken = useRef(0);
  const drawReady = useRef<Promise<void>>(Promise.resolve());
  const cardFile = useRef<File | null>(null); // 공유용 PNG 파일 (미리 만들어 두어야 탭 한 번에 공유창이 뜸)
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = UI[lang];
  const stem = STEMS[result.dayStem];
  const partnerEl = STEM_ELEMENT[result.partnerStem];
  const partnerYin = result.partnerStem % 2 === 1;
  const seed = seedFromBirth(result.birth.year, result.birth.month, result.birth.day); // 같은 생일 = 같은 아이돌
  const idol = idolName(result.partnerStem, pref, lang, seed);
  const title = heroTitle(result.dayStem, lang);
  const mine = PALETTE[result.element];
  const mate = PALETTE[partnerEl];

  const caption = fill(t.caption, {
    title: shortTitle(result.dayStem, lang),
    emoji: ELEMENT_EMOJI[result.element],
    idol,
    score: result.score,
  });

  /* 언어 바꾸기: 화면 + <html lang> + 쿠키(다음 방문, 서버 렌더링용) */
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
  }, [lang]);

  function chooseLang(next: Lang) {
    setLang(next);
    setCopied(false);
    document.cookie = `kss-lang=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  /* 스토리 카드 그리기 (언어·결과가 바뀔 때마다 다시) */
  const cardData = useMemo<CardData>(
    () => ({
      title: heroTitle(result.dayStem, lang),
      nature: STEMS[result.dayStem].nature[lang],
      eyebrow: UI[lang].matchEyebrow,
      idol: idolName(result.partnerStem, pref, lang, seed),
      score: result.score,
      label: UI[lang].matchLabel,
      userEl: result.element,
      userYin: result.yin,
      idolEl: STEM_ELEMENT[result.partnerStem],
      idolYin: result.partnerStem % 2 === 1,
    }),
    [result, lang, pref, seed],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const run = ++drawToken.current;
    cardFile.current = null;
    drawReady.current = renderStoryCard(canvas, cardData, () => run !== drawToken.current).then(
      () =>
        new Promise<void>((resolve) => {
          if (run !== drawToken.current) return resolve();
          canvas.toBlob((blob) => {
            if (blob && run === drawToken.current) {
              cardFile.current = new File([blob], CARD_FILE, { type: "image/png" });
            }
            resolve();
          }, "image/png");
        }),
    );
  }, [cardData]);

  /* 저장 모달 */
  async function openModal() {
    await drawReady.current; // 카드가 다 그려진 뒤에 이미지로 내보낸다
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setCardUrl(canvas.toDataURL("image/png"));
    } catch {
      setCardUrl("");
    }
    setModalOpen(true);
  }

  useEffect(() => {
    if (!modalOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // 뒤 화면 스크롤 잠금
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = modalRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [modalOpen]);

  /* ---------- 공유 액션 3종 ---------- */
  const siteUrl = () => `${window.location.origin}/`; // 개인 결과 주소(생년월일 포함)가 아니라 사이트 첫 화면을 공유

  function flash(message: string) {
    setStatus(message);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 4000);
  }

  /** 9:16 고화질(1080×1920) PNG 를 파일로 내려받는다. 성공하면 true */
  async function downloadCard(): Promise<boolean> {
    await drawReady.current;
    const file = cardFile.current;
    if (!file) return false;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = CARD_FILE;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return true;
  }

  /** 1) 인스타 스토리: 휴대폰 공유창(Web Share)으로 카드 이미지 전송. 안 되면 저장 + 미리보기 모달 */
  async function shareToInstagram() {
    const file = cardFile.current; // 미리 만들어 둔 파일을 바로 사용 (공유창은 탭 직후에만 열 수 있음)
    if (file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "K-Star Saju", text: `${caption} ${siteUrl()}` });
        flash(t.shared);
        return;
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return; // 사용자가 공유창을 닫음
      }
    }
    // PC·미지원 브라우저: 카드를 내려받고, 미리보기+캡션 복사 모달을 연다
    if (await downloadCard()) flash(t.saved);
    await openModal();
  }

  /** 2) X: 문구가 미리 채워진 트윗 작성 창 */
  function postToX() {
    const text = fill(t.tweet, {
      idol: idol.replace(/\s*\(.*?\)\s*/g, " ").trim(), // 괄호 설명은 빼고 짧게: "BTS V (Taehyung)" -> "BTS V"
      score: result.score,
      url: siteUrl(),
      tag: idolTag(result.partnerStem, pref, seed),
    });
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  /** 3) 카드 저장: 틱톡 배경·앨범 소장용 이미지 즉시 다운로드 */
  async function saveCard() {
    if (await downloadCard()) flash(t.saved);
    else await openModal(); // 파일을 못 만든 환경이면 길게 눌러 저장하는 모달로
  }

  /* 캡션 복사 */
  async function copyCaption() {
    const text = `${caption} ${siteUrl()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setManualText(text); // 클립보드 권한이 없으면 직접 선택해서 복사
      setTimeout(() => {
        const box = modalCaptionRef.current ?? captionRef.current;
        box?.focus();
        box?.select();
      }, 0);
    }
  }

  /* 결제 링크: Lemon Squeezy 체크아웃 + 커스텀 데이터(웹훅에서 meta.custom_data 로 돌아옴) */
  const buyHref = useMemo(() => {
    const u = new URL(CHECKOUT_URL);
    if (!result.isSample) u.searchParams.set("checkout[custom][birth]", formatBirth(result.birth));
    u.searchParams.set("checkout[custom][lang]", lang);
    return u.toString();
  }, [result, lang]);

  const lockedVars = { a: shortTitle(result.dayStem, lang), b: shortTitle(result.partnerStem, lang) };
  const sub = [
    { label: t.subSpark, v: result.sparkScore, c: mine.main },
    { label: t.subHarmony, v: result.harmonyScore, c: "#bfd8ff" },
    { label: t.subGrowth, v: result.growthScore, c: PALETTE[result.lucky].main },
  ];
  const ringOffset = 402.12 * (1 - result.score / 100);

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 pb-12 pt-5">
      <div className="sky" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex max-w-[480px] flex-col gap-10">
        {/* 상단 바 */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <span className="ff-display text-[13px] font-bold tracking-[.18em]">K-STAR SAJU</span>
          <div
            className="inline-flex rounded-full border border-[var(--line)] bg-[rgba(26,16,64,.7)] p-[3px]"
            role="group"
            aria-label="Language"
          >
            {(["en", "ko", "zh"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => chooseLang(l)}
                className={`min-h-8 cursor-pointer rounded-full px-[13px] py-1.5 text-xs font-semibold ${
                  lang === l ? "bg-[var(--fg)] text-[#1a0b3a]" : "text-[var(--dim)]"
                }`}
              >
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
        </header>

        <main className="flex min-w-0 flex-col gap-10">
          {/* 1. 핵심 분석 */}
          <section className="flex flex-col items-center gap-2.5 text-center" aria-labelledby="hero-title">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="ff-mono text-[11px] font-bold uppercase tracking-[.16em] text-[var(--faint)]">
                {t.heroEyebrow}
              </span>
              <span className="ff-mono rounded-full border border-[var(--line)] px-2 py-[3px] text-[10px] font-bold uppercase tracking-[.1em] text-[var(--dim)]">
                {result.isSample ? t.sample : formatBirth(result.birth)}
              </span>
            </div>

            <Emblem
              el={result.element}
              yin={result.yin}
              uid="hero"
              size={260}
              className="aspect-square w-[min(72vw,260px)] max-w-full"
            />

            <h1
              id="hero-title"
              className="ff-display mt-1.5 text-balance text-[clamp(28px,8.6vw,42px)] font-extrabold leading-[1.15]"
            >
              {title} <span aria-hidden="true">{ELEMENT_EMOJI[result.element]}</span>
            </h1>
            <p className="m-0 font-medium" style={{ color: mine.light }}>
              {stem.nature[lang]}
            </p>
            <ul className="m-0 mt-1.5 flex list-none flex-wrap justify-center gap-2 p-0">
              {stem.traits[lang].map((tr) => (
                <li
                  key={tr}
                  className="rounded-full border px-3 py-1.5 text-[13px] font-medium"
                  style={{
                    color: mine.light,
                    borderColor: `color-mix(in srgb, ${mine.main} 45%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${mine.main} 10%, transparent)`,
                  }}
                >
                  {tr}
                </li>
              ))}
            </ul>
            <p className="m-0 mt-2 max-w-[42ch] text-pretty text-[var(--dim)]">{stem.summary[lang]}</p>
          </section>

          {/* 2. 오행 밸런스 */}
          <section aria-labelledby="bal-title" className="min-w-0">
            <h2 id="bal-title" className="ff-display mb-3.5 text-[13px] font-bold leading-snug tracking-[.04em]">
              {t.balTitle}
            </h2>
            <ul className="m-0 mb-4 grid list-none gap-3.5 p-0">
              {result.balance.map((b, i) => (
                <li
                  key={b.element}
                  className="grid grid-cols-[92px_minmax(0,1fr)_42px] items-center gap-3 text-[13px] max-[380px]:grid-cols-[78px_minmax(0,1fr)_38px] max-[380px]:gap-2"
                >
                  <div className="flex flex-col items-start gap-[3px] font-medium">
                    <span>{t[b.element]}</span>
                    {i === 0 && (
                      <span
                        className="ff-mono rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[.08em]"
                        style={{ color: PALETTE[b.element].light, backgroundColor: `color-mix(in srgb, ${PALETTE[b.element].main} 22%, transparent)` }}
                      >
                        {t.tagDominant}
                      </span>
                    )}
                    {b.element === result.lucky && (
                      <span className="ff-mono rounded bg-[rgba(121,224,164,.16)] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[.08em] text-[#79e0a4]">
                        {t.tagLucky}
                      </span>
                    )}
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="bar-fill h-full rounded-full"
                      style={{
                        width: `${b.pct}%`,
                        background: PALETTE[b.element].main,
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  </div>
                  <span className="ff-mono text-right text-xs font-bold tabular-nums text-[var(--dim)]">{b.pct}%</span>
                </li>
              ))}
            </ul>
            <p className="m-0 text-[var(--dim)]">
              {fill(t.balNote, {
                dom: ELEMENT_NAME[lang][result.dominant],
                lucky: ELEMENT_NAME[lang][result.lucky],
              })}
            </p>
          </section>

          {/* 3. 소울메이트 매칭 카드 */}
          <section
            aria-labelledby="match-name"
            className="rounded-[28px] bg-[linear-gradient(135deg,var(--moon),var(--pink)_52%,var(--flame))] p-0.5"
          >
            <div className="flex flex-col gap-5 rounded-[26px] bg-[linear-gradient(180deg,#21145a,#140b34)] px-5 pb-[22px] pt-[26px]">
              <div className="flex flex-col gap-1.5">
                <span className="ff-mono text-[11px] font-bold uppercase tracking-[.16em] text-[var(--faint)]">
                  {t.matchEyebrow}
                </span>
                <h2
                  id="match-name"
                  className="ff-display m-0 text-balance text-[clamp(21px,6.4vw,28px)] font-extrabold leading-tight"
                >
                  {idol}
                </h2>
                <p className="m-0 font-medium text-[var(--moon)]">
                  {fill(t.matchEnergy, {
                    title: shortTitle(result.partnerStem, lang),
                    tag: STEMS[result.partnerStem].tag[lang],
                  })}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Emblem el={partnerEl} yin={partnerYin} uid="match" size={140} className="aspect-square w-[140px]" />
                <div className="relative size-[150px] shrink-0" role="img" aria-label={`${result.score}%`}>
                  <svg viewBox="0 0 150 150" className="block size-full" aria-hidden="true">
                    <defs>
                      <linearGradient id="ringG" gradientUnits="userSpaceOnUse" x1="10" y1="10" x2="140" y2="140">
                        <stop offset="0" stopColor="#ffd27a" />
                        <stop offset=".55" stopColor="#ff72d0" />
                        <stop offset="1" stopColor="#bfd8ff" />
                      </linearGradient>
                    </defs>
                    <circle cx="75" cy="75" r="64" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="10" />
                    <circle
                      className="ring-fg"
                      cx="75"
                      cy="75"
                      r="64"
                      fill="none"
                      stroke="url(#ringG)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      transform="rotate(-90 75 75)"
                      style={{ strokeDashoffset: ringOffset }}
                    />
                  </svg>
                  <div className="ff-display absolute inset-0 flex items-center justify-center text-[38px] font-extrabold leading-none tabular-nums">
                    {result.score}
                    <small className="ml-0.5 text-base text-[var(--dim)]">%</small>
                  </div>
                </div>
              </div>

              <p className="ff-display m-0 -mt-1.5 text-center text-base font-bold tracking-[.02em] text-[var(--flame-hot)]">
                {t.matchLabel}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3.5 border-y border-[var(--line)] px-2.5 py-3.5">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[34px] font-bold leading-[1.1]" style={{ color: mine.main }}>
                    {STEMS[result.dayStem].char}
                  </span>
                  <span className="text-[11px] text-[var(--dim)]">{formulaName(result.dayStem, lang)}</span>
                </div>
                <span className="text-xl text-[var(--faint)]" aria-hidden="true">+</span>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[34px] font-bold leading-[1.1]" style={{ color: mate.main }}>
                    {STEMS[result.partnerStem].char}
                  </span>
                  <span className="text-[11px] text-[var(--dim)]">{formulaName(result.partnerStem, lang)}</span>
                </div>
                <span className="text-xl text-[var(--faint)]" aria-hidden="true">→</span>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[34px] font-bold leading-[1.1]" style={{ color: PALETTE[result.lucky].main }}>
                    {ELEMENT_CHAR[result.lucky]}
                  </span>
                  <span className="text-[11px] text-[var(--dim)]">{ELEMENT_NAME[lang][result.lucky]}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {sub.map((s, i) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <b className="ff-display text-[22px] font-extrabold leading-none tabular-nums">{s.v}</b>
                    <span className="text-xs text-[var(--dim)]">{s.label}</span>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="bar-fill h-full rounded-full"
                        style={{ width: `${s.v}%`, background: s.c, animationDelay: `${(i + 1) * 70}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="m-0 text-pretty text-[var(--dim)]">
                {fill(t.matchWhy, {
                  a: formulaName(result.dayStem, lang),
                  b: formulaName(result.partnerStem, lang),
                  c: ELEMENT_NAME[lang][result.lucky],
                })}
              </p>
              <p className="m-0 text-xs leading-relaxed text-[var(--faint)]">{t.matchDisclaimer}</p>
            </div>
          </section>

          {/* 4. 스토리 카드 공유 (바이럴 우선: 유료 배너보다 위) */}
          <section className="flex flex-col items-center gap-4 text-center" aria-labelledby="share-title">
            <div className="flex flex-col gap-2">
              <h2 id="share-title" className="ff-display m-0 text-[13px] font-bold leading-snug tracking-[.04em]">
                {t.shareTitle}
              </h2>
              <p className="m-0 text-[var(--dim)]">{t.shareSub}</p>
            </div>

            {/* 카드를 누르면 크게 보기(길게 눌러 저장) */}
            <button
              type="button"
              onClick={openModal}
              aria-label={t.openPreview}
              className="cursor-zoom-in rounded-[18px] border-0 bg-transparent p-0"
            >
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                role="img"
                aria-label={fill(t.cardAlt, {
                  title: shortTitle(result.dayStem, lang),
                  idol,
                  score: result.score,
                })}
                className="block h-auto w-[210px] max-w-full rounded-[18px] border border-[var(--line)] bg-[#120a30] shadow-[0_18px_44px_rgba(0,0,0,.5)]"
                style={{ aspectRatio: "9 / 16" }}
              />
            </button>

            {/* 바이럴 버튼 3종 */}
            <div className="flex w-full max-w-[360px] flex-col gap-2.5">
              <button
                type="button"
                onClick={shareToInstagram}
                className={`${BTN} w-full cursor-pointer bg-[linear-gradient(45deg,#feda75,#fa7e1e_25%,#d62976_55%,#962fbf_80%,#4f5bd5)] text-white shadow-[0_8px_24px_rgba(214,41,118,.35)]`}
              >
                <IconInstagram />
                {t.shareIg}
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={postToX}
                  className={`${BTN} cursor-pointer border-white/30 bg-black text-white`}
                >
                  <IconX />
                  {t.shareX}
                </button>
                <button
                  type="button"
                  onClick={saveCard}
                  className={`${BTN} cursor-pointer border-[var(--line)] bg-[rgba(26,16,64,.7)] text-[var(--fg)]`}
                >
                  <IconSave />
                  {t.saveCard}
                </button>
              </div>
              <button
                type="button"
                onClick={copyCaption}
                className="mx-auto min-h-10 cursor-pointer border-0 bg-transparent px-3 text-[13px] font-medium text-[var(--dim)] underline underline-offset-4"
              >
                {copied ? t.copied : t.copyCaption}
              </button>
            </div>

            <p role="status" aria-live="polite" className="m-0 min-h-5 max-w-[34ch] text-[13px] text-[var(--moon)]">
              {status}
            </p>
            <p className="m-0 max-w-[40ch] text-xs leading-relaxed text-[var(--faint)]">{t.shareHint}</p>

            {manualText !== null && !modalOpen && (
              <div className="flex w-full max-w-[360px] flex-col gap-2 text-left">
                <p className="m-0 text-xs leading-relaxed text-[var(--faint)]" id="cap-hint">
                  {t.copyManual}
                </p>
                <textarea
                  ref={captionRef}
                  readOnly
                  rows={4}
                  value={manualText}
                  aria-labelledby="cap-hint"
                  className="w-full resize-none rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2.5 text-[13px] leading-normal text-[var(--fg)]"
                />
              </div>
            )}
          </section>

          {/* 5. $3.99 유료 리포트 배너 */}
          <section
            aria-labelledby="pay-title"
            className="flex flex-col gap-4 rounded-[28px] bg-[linear-gradient(160deg,#ffd98a,#ff9a4d)] p-5 text-[#2a1100]"
          >
            <span className="ff-mono self-start rounded-full bg-[#2a1100] px-[9px] py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--flame-hot)]">
              {t.payTag}
            </span>
            <h2 id="pay-title" className="ff-display m-0 text-balance text-[clamp(18px,5.4vw,22px)] font-extrabold leading-snug">
              {t.payTitle}
            </h2>
            <ul className="m-0 grid list-none gap-[9px] p-0">
              {[t.pay1, t.pay2, t.pay3, t.pay4].map((line) => (
                <li key={line} className="flex items-start gap-2.5 font-medium leading-normal">
                  <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <circle cx="9" cy="9" r="9" fill="#2a1100" />
                    <path d="M5 9.4l2.7 2.6L13 6.6" fill="none" stroke="#ffd27a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="relative overflow-hidden rounded-2xl bg-[#1a0b3a] px-4 pb-4 pt-3.5 text-[var(--fg)]">
              <h3 className="m-0 mb-1.5 text-[13px] text-[var(--flame-hot)]">{fill(t.lockedTitle, lockedVars)}</h3>
              <p className="m-0 select-none text-sm blur-[4.5px]" aria-hidden="true">
                {fill(t.lockedBody, lockedVars)}
              </p>
              <div className="ff-mono absolute inset-0 flex items-center justify-center gap-2 bg-[rgba(26,11,58,.4)] text-[11px] font-bold uppercase tracking-[.1em]">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="3" y="7" width="10" height="7" rx="2" fill="#f3eeff" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="#f3eeff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {t.lockedLabel}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <div className="flex flex-col leading-[1.1]">
                <strong className="ff-display text-[34px] font-extrabold tabular-nums">$3.99</strong>
                <span className="text-xs font-medium opacity-80">{t.oneTime}</span>
              </div>
              <a
                href={buyHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN} min-w-[180px] flex-[1_1_180px] bg-[#1d0f46] text-white`}
              >
                {t.payCta}
              </a>
            </div>
            <p className="m-0 text-center text-xs font-bold">
              Special Launch {OFF_PCT}% OFF (<s className="opacity-70">{usd(LIST_PRICE)}</s>)
            </p>
          </section>

          {/* 6. 최애 1:1 심층 리포트 */}
          <Link
            href={`/report?y=${result.birth.year}&m=${result.birth.month}&d=${result.birth.day}&lang=${lang}`}
            className={`${BTN} w-full border-[var(--line)] bg-[rgba(26,16,64,.7)] text-[var(--fg)]`}
          >
            <span aria-hidden="true">✦</span>
            {BIAS_CTA[lang]}
          </Link>

          {/* 7. 다시 하기 */}
          <Link
            href="/"
            className={`${BTN} w-full border-[var(--line)] bg-[rgba(26,16,64,.7)] text-[var(--fg)]`}
          >
            <span aria-hidden="true">🔄</span>
            {RETRY[lang]}
          </Link>
        </main>

        <footer className="flex flex-col gap-2 border-t border-[var(--line)] pt-4">
          <p className="m-0 text-xs leading-relaxed text-[var(--faint)]">{t.footer}</p>
          <p className="m-0 text-xs leading-relaxed text-[var(--faint)]">{t.simplified}</p>
        </footer>
      </div>

      {/* 스토리 카드 저장 모달 */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-[rgba(8,4,24,.88)] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          ref={modalRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="flex max-w-full flex-col items-center gap-3">
            <span id="modal-title" className="ff-mono text-[11px] font-bold uppercase tracking-[.16em] text-[var(--faint)]">
              {t.shareTitle}
            </span>
            {cardUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cardUrl}
                alt={fill(t.cardAlt, { title: shortTitle(result.dayStem, lang), idol, score: result.score })}
                className="h-auto max-h-[calc(100dvh-260px)] w-auto max-w-full rounded-2xl"
              />
            )}
            <p className="m-0 max-w-[34ch] text-center text-[13px] text-[var(--dim)]">{t.modalHint}</p>
            {manualText !== null && (
              <div className="flex w-full max-w-[320px] flex-col gap-2 text-left">
                <p className="m-0 text-xs leading-relaxed text-[var(--faint)]" id="modal-cap-hint">
                  {t.copyManual}
                </p>
                <textarea
                  ref={modalCaptionRef}
                  readOnly
                  rows={4}
                  value={manualText}
                  aria-labelledby="modal-cap-hint"
                  className="w-full resize-none rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2.5 text-[13px] leading-normal text-[var(--fg)]"
                />
              </div>
            )}
            <div className="flex w-full max-w-[320px] flex-wrap justify-center gap-2.5">
              <a
                href={cardUrl || undefined}
                download={CARD_FILE}
                className={`${BTN} min-w-[140px] flex-1 bg-[var(--flame)] text-[#2a1100]`}
              >
                {t.modalSave}
              </a>
              <button
                type="button"
                onClick={copyCaption}
                className={`${BTN} min-w-[140px] flex-1 cursor-pointer border-[var(--line)] bg-transparent text-[var(--fg)]`}
              >
                {copied ? t.copied : t.copyCaption}
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setModalOpen(false)}
                className={`${BTN} w-full cursor-pointer border-[var(--line)] bg-transparent text-[var(--fg)]`}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
