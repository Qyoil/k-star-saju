"use client";

// app/report/ReportView.tsx
// 1:1 심층 궁합 리포트 뷰어: 다크 럭셔리 매거진 스타일 + 인쇄/PDF 저장 최적화
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildReport, josa, type PersonView, type ReportSection } from "../../lib/compatibility";
import { ELEMENT_EMOJI, ELEMENT_NAME, fill } from "../../lib/i18n";
import { ELEMENT_ORDER, formatBirth, type BirthInput, type Element, type Lang } from "../../lib/saju";
import { CHECKOUT_URL, LIST_PRICE, OFF_PCT, PRICE, usd } from "../../lib/checkout";
import { reportBase, resultBackHref, UI } from "./ui";

const LANG_TABS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
];

const EL_COLOR: Record<Element, string> = {
  wood: "#34d399",
  fire: "#fb7185",
  earth: "#fbbf24",
  metal: "#94a3b8",
  water: "#60a5fa",
};

/* ── 결제 설정 (Lemon Squeezy) ─────────────────────────────────────────
   - 결제 링크: 환경변수 NEXT_PUBLIC_LEMONSQUEEZY_REPORT_URL 이 있으면 그 값, 없으면 아래 기본 링크
   - 가격/정가: 아래 숫자만 바꾸면 버튼 문구와 할인율(%)이 자동으로 다시 계산됩니다.
     (Lemon Squeezy 상품 가격도 같은 값으로 맞춰 두세요) */

/** 결제 상태 저장(이 브라우저, 리포트별): pending = 결제창을 열었음 / paid = 열람 확인함 */
const storeKey = (user: BirthInput, bias: { nameEn: string; birth: BirthInput }) =>
  `kss-unlock:v1:${formatBirth(user)}:${formatBirth(bias.birth)}:${bias.nameEn}`;
function readStore(key: string): "pending" | "paid" | null {
  try {
    const v = window.localStorage.getItem(key);
    return v === "pending" || v === "paid" ? v : null;
  } catch {
    return null;
  }
}
function writeStore(key: string, v: "pending" | "paid") {
  try {
    window.localStorage.setItem(key, v);
  } catch {}
}

/* 잠금 상태에서는 진짜 본문 대신 "같은 길이의 의미 없는 문장"을 그려 블러 처리합니다.
   -> 잠금 중에는 실제 풀이 문장이 화면(HTML)에 존재하지 않습니다. */
const FILLER: Record<Lang, string[]> = {
  en: ["hidden", "dynamic", "between", "your", "souls", "secret", "pattern", "quietly", "unfolds", "energy", "shared", "moment"],
  ko: ["숨겨진", "두", "사람의", "비밀", "이야기가", "조용히", "펼쳐지는", "에너지와", "흐름이", "함께", "나눈", "순간"],
  zh: ["隐藏的", "秘密", "正在", "两人", "之间", "悄悄", "流动", "能量", "与", "默契", "共享", "时刻"],
};
function filler(len: number, lang: Lang, seed: number): string {
  const words = FILLER[lang];
  const sep = lang === "zh" ? "" : " ";
  let out = "";
  let i = seed;
  while (out.length < len) {
    out += (out ? sep : "") + words[i % words.length];
    i += 5;
  }
  return out.slice(0, Math.max(8, len));
}

function ChapterHead({ s, locked, lockedTag }: { s: ReportSection; locked: boolean; lockedTag: string }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-[var(--rp-rule)] pb-3">
      <span className="rp-serif text-5xl font-semibold leading-none text-[var(--rp-accent)]" aria-hidden="true">
        {s.no}
      </span>
      <h2 id={`ch-${s.id}`} className="rp-serif m-0 flex-1 text-[clamp(22px,5.4vw,30px)] font-semibold leading-tight">
        {s.title}
      </h2>
      {locked && (
        <span className="rp-noprint shrink-0 rounded-full border border-fuchsia-300/40 bg-fuchsia-500/15 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-100">
          🔒 {lockedTag}
        </span>
      )}
    </div>
  );
}

function ChapterBody({
  s,
  remedy,
  labels,
}: {
  s: ReportSection;
  remedy: { color: string; direction: string; numbers: string };
  labels: { color: string; dir: string; num: string };
}) {
  return (
    <>
      {s.paragraphs.map((p, i) => (
        <p key={i} className="m-0 text-[15px] leading-[1.85] text-[var(--rp-fg)]/90">
          {p}
        </p>
      ))}
      {s.id === "remedy" && (
        <div className="grid grid-cols-3 gap-2 text-center" aria-label="lucky">
          {[
            [labels.color, remedy.color],
            [labels.dir, remedy.direction],
            [labels.num, remedy.numbers],
          ].map(([k, v]) => (
            <div key={k} className="rp-card rounded-xl border border-[var(--rp-line)] bg-[var(--rp-card)] px-2 py-3">
              <p className="m-0 text-[10px] uppercase tracking-[.18em] text-[var(--rp-accent)]">{k}</p>
              <p className="m-0 mt-1 text-[13px] font-medium leading-snug">{v}</p>
            </div>
          ))}
        </div>
      )}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {s.bullets.map((b, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-[var(--rp-fg)]/85">
            <span className="mt-0.5 shrink-0 text-[var(--rp-accent)]" aria-hidden="true">
              ✦
            </span>
            <span className="min-w-0 break-words">{b}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-44 w-44 shrink-0" role="img" aria-label={`${label} ${score}%`}>
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="rp-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4b5fd" />
            <stop offset="0.55" stopColor="#f0abfc" />
            <stop offset="1" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--rp-line)" strokeWidth="8" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="url(#rp-ring)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="rp-serif text-[44px] font-semibold leading-none text-[var(--rp-fg)]">
          {score}
          <span className="text-2xl text-[var(--rp-accent)]">%</span>
        </span>
        <span className="mt-1 text-[11px] uppercase tracking-[.2em] text-[var(--rp-dim)]">{label}</span>
      </div>
    </div>
  );
}

function PersonCard({ p, lang, role }: { p: PersonView; lang: Lang; role: string }) {
  const t = UI[lang];
  return (
    <article className="rp-card flex min-w-0 flex-col gap-4 rounded-2xl border border-[var(--rp-line)] bg-[var(--rp-card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[11px] uppercase tracking-[.2em] text-[var(--rp-accent)]">{role}</p>
          <h3 className="rp-serif m-0 mt-1 break-words text-2xl font-semibold leading-tight text-[var(--rp-fg)]">{p.name}</h3>
          <p className="m-0 mt-1 text-xs text-[var(--rp-dim)]">
            {t.born} {formatBirth(p.birth)}
          </p>
        </div>
        <div className="rp-serif shrink-0 text-5xl leading-none text-[var(--rp-accent)]" aria-hidden="true">
          {p.stemChar}
        </div>
      </div>
      <p className="m-0 text-sm leading-relaxed text-[var(--rp-fg)]">
        <span className="text-[var(--rp-dim)]">{t.dayMaster} · </span>
        {ELEMENT_EMOJI[p.element]} {p.tag}
        <span className="block text-[13px] text-[var(--rp-dim)]">{p.nature}</span>
      </p>
      <div className="flex flex-col gap-1.5" aria-label={t.balance}>
        {ELEMENT_ORDER.map((e) => {
          const pct = p.balance.find((b) => b.element === e)?.pct ?? 0;
          return (
            <div key={e} className="flex items-center gap-2 text-[11px] text-[var(--rp-dim)]">
              <span className="w-12 shrink-0">{ELEMENT_NAME[lang][e]}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--rp-line)]">
                <span className="rp-bar block h-full rounded-full" style={{ width: `${pct}%`, background: EL_COLOR[e] }} />
              </span>
              <span className="w-8 text-right tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function ReportView({
  user,
  bias,
  initialLang,
}: {
  user: BirthInput;
  bias: { nameEn: string; nameKo: string; birth: BirthInput };
  initialLang: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  // 테스트용 잠금: locked -> revealing(블러 상태로 진짜 본문 그림) -> open(블러가 풀림)
  const [phase, setPhase] = useState<"locked" | "revealing" | "open">("locked");
  const [awaiting, setAwaiting] = useState(false); // 결제창을 연 뒤 "결제했어요" 확인을 기다리는 중
  const timer = useRef<number | null>(null);
  const key = storeKey(user, bias);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  // 다시 들어왔을 때: 이미 열람 확인한 리포트면 바로 열고, 결제창만 열어 둔 상태면 확인 카드를 보여줌
  useEffect(() => {
    const saved = readStore(key);
    if (saved === "paid") setPhase("open");
    else if (saved === "pending") setAwaiting(true);
  }, [key]);
  const t = UI[lang];
  const biasName = lang === "ko" ? bias.nameKo : bias.nameEn;
  const report = useMemo(() => buildReport(user, { name: biasName, birth: bias.birth }, lang), [user, bias.birth, biasName, lang]);

  /** 결제 링크(새 탭) + 결제 웹훅에서 쓸 수 있게 생년월일/최애/언어를 custom data 로 전달 */
  const checkoutHref = useMemo(() => {
    try {
      const u = new URL(CHECKOUT_URL);
      u.searchParams.set("checkout[custom][birth]", formatBirth(user));
      u.searchParams.set("checkout[custom][bias]", bias.nameEn);
      u.searchParams.set("checkout[custom][bias_birth]", formatBirth(bias.birth));
      u.searchParams.set("checkout[custom][lang]", lang);
      return u.toString();
    } catch {
      return CHECKOUT_URL;
    }
  }, [user, bias.nameEn, bias.birth, lang]);

  /** 결제 링크 클릭: 새 탭은 <a target="_blank"> 가 열고, 여기서는 "결제창 열었음"만 기록 */
  function onCheckoutClick() {
    writeStore(key, "pending");
    window.setTimeout(() => setAwaiting(true), 200);
  }

  /**
   * "결제했어요 · 리포트 열기".
   * 주의: 지금은 결제 여부를 서버에서 확인하지 않는 "자기 확인" 방식입니다.
   * 결제한 사람에게만 열리게 하려면 Lemon Squeezy 웹훅(order_created) 확인 후 서버에서 본문을 내려 주세요.
   */
  function unlock() {
    if (phase !== "locked") return;
    writeStore(key, "paid");
    setAwaiting(false);
    setPhase("revealing");
    timer.current = window.setTimeout(() => setPhase("open"), 60);
  }
  const unlocked = phase !== "locked";

  function chooseLang(next: Lang) {
    setLang(next);
    try {
      document.cookie = `kss-lang=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }

  return (
    <main className="rp relative min-h-screen overflow-hidden bg-[var(--rp-bg)] px-4 pb-20 pt-5 text-[var(--rp-fg)]">
      <style>{`
        .rp {
          --rp-bg: #0a0616; --rp-fg: #f4efff; --rp-dim: #b3a6dc; --rp-card: rgba(255,255,255,.05);
          --rp-line: rgba(196,181,253,.22); --rp-accent: #e9c46a; --rp-rule: rgba(233,196,106,.55);
        }
        .rp-serif { font-family: "Playfair Display", Georgia, "Noto Serif KR", "Noto Serif SC", "Songti SC", serif; }
        .rp { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          @page { size: A4; margin: 14mm; }
          html, body { background: #fff !important; }
          .rp {
            --rp-bg: #ffffff; --rp-fg: #1b1233; --rp-dim: #5b5280; --rp-card: #f6f3ff;
            --rp-line: #d9d1f2; --rp-accent: #8a5a00; --rp-rule: #b88a2a;
            padding: 0 !important; min-height: 0 !important;
          }
          .rp-noprint { display: none !important; }
          .rp-chapter, .rp-card { break-inside: avoid; page-break-inside: avoid; }
          .rp-glow { display: none !important; }
        }
      `}</style>

      <div aria-hidden="true" className="rp-glow pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-[26rem] w-[26rem] rounded-full bg-violet-700/30 blur-[110px]" />
        <div className="absolute -right-32 top-[30%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/4 h-[24rem] w-[24rem] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col gap-10">
        {/* 도구 줄 (인쇄 시 숨김) */}
        <div className="rp-noprint flex flex-wrap items-center justify-between gap-3">
          <Link
            href={resultBackHref(user, lang)}
            className="text-sm font-medium text-[var(--rp-dim)] underline-offset-4 hover:text-[var(--rp-fg)] hover:underline"
          >
            ← {t.back}
          </Link>
          <div
            role="group"
            aria-label={t.langLabel}
            className="flex gap-1 rounded-full border border-[var(--rp-line)] bg-white/[0.06] p-1 backdrop-blur-xl"
          >
            {LANG_TABS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => chooseLang(l.value)}
                aria-pressed={lang === l.value}
                className={`min-h-8 cursor-pointer rounded-full px-3 text-xs font-semibold transition active:scale-95 ${
                  lang === l.value
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                    : "text-[var(--rp-dim)] hover:bg-white/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* 표지 */}
        <header className="flex flex-col items-center gap-6 border-y border-[var(--rp-rule)] py-10 text-center">
          <p className="m-0 text-[11px] font-medium uppercase tracking-[.28em] text-[var(--rp-accent)]">{t.kicker}</p>
          <h1 className="rp-serif m-0 text-balance text-[clamp(34px,9vw,62px)] font-semibold leading-[1.05]">
            {report.you.name}
            <span className="mx-3 italic text-[var(--rp-accent)]">×</span>
            <span className="break-words">{report.bias.name}</span>
          </h1>
          <p className="rp-serif m-0 text-lg italic text-[var(--rp-dim)]">{t.coverTitle}</p>
          <ScoreRing score={report.score} label={t.chemistry} />
          <div className="flex flex-col items-center gap-2">
            <p className="rp-serif m-0 text-2xl font-semibold text-[var(--rp-accent)]">{report.verdict}</p>
            <p className="m-0 rounded-full border border-[var(--rp-line)] px-4 py-1.5 text-xs tracking-wide text-[var(--rp-dim)]">
              {report.relationLabel}
            </p>
          </div>
        </header>

        {/* 두 사람 프로필 */}
        <section className="grid gap-4 sm:grid-cols-2" aria-label="profiles">
          <PersonCard p={report.you} lang={lang} role={t.you} />
          <PersonCard p={report.bias} lang={lang} role="BIAS" />
        </section>

        {/* 챕터 1: 항상 공개 */}
        {report.sections.slice(0, 1).map((s) => (
          <section key={s.id} className="rp-chapter flex flex-col gap-4" aria-labelledby={`ch-${s.id}`}>
            <ChapterHead s={s} locked={false} lockedTag={t.lockedTag} />
            <p className="rp-serif m-0 text-balance text-xl italic leading-snug text-[var(--rp-fg)]">{s.headline}</p>
            <ChapterBody
              s={s}
              remedy={report.remedy}
              labels={{ color: t.luckyColor, dir: t.luckyDir, num: t.luckyNum }}
            />
          </section>
        ))}

        {/* 챕터 2~4: 티징(제목·소제목만 공개) -> 결제 후 전체 공개 */}
        <div className="relative flex flex-col gap-10">
          {report.sections.slice(1).map((s) => (
            <section key={s.id} className="rp-chapter flex flex-col gap-4" aria-labelledby={`ch-${s.id}`}>
              <ChapterHead s={s} locked={!unlocked} lockedTag={t.lockedTag} />
              <p className="rp-serif m-0 text-balance text-xl italic leading-snug text-[var(--rp-fg)]">{s.headline}</p>
              {!unlocked && s.teaser && <p className="m-0 text-sm leading-relaxed text-[var(--rp-dim)]">{s.teaser}</p>}
              {phase === "locked" ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none flex select-none flex-col gap-4 opacity-80 blur-[9px]"
                >
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="m-0 text-[15px] leading-[1.85]">
                      {filler(p.length, lang, i * 3 + s.no.charCodeAt(1))}
                    </p>
                  ))}
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span aria-hidden="true">✦</span>
                        <span>{filler(b.length, lang, i * 2 + 1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  className={`flex flex-col gap-4 transition-[filter,opacity] duration-[900ms] ease-out ${
                    phase === "revealing" ? "opacity-80 blur-[9px]" : "opacity-100 blur-0"
                  }`}
                >
                  <ChapterBody
                    s={s}
                    remedy={report.remedy}
                    labels={{ color: t.luckyColor, dir: t.luckyDir, num: t.luckyNum }}
                  />
                </div>
              )}
            </section>
          ))}

          {/* 결제 유도 CTA: 블러 중앙에 떠 있다가 스크롤을 따라옴 (잠금 중에만) */}
          {phase === "locked" && (
            <div className="rp-noprint pointer-events-none absolute inset-0 z-20">
              <div className="pointer-events-none sticky top-[24vh] flex justify-center px-1 pt-44">
                <div className="pointer-events-auto flex w-full max-w-[340px] flex-col items-center gap-3 rounded-3xl border border-fuchsia-300/40 bg-[rgba(18,8,44,.72)] p-5 text-center shadow-[0_0_60px_rgba(217,70,239,.45),inset_0_1px_0_rgba(255,255,255,.18)] backdrop-blur-xl">
                  <span className="text-3xl" aria-hidden="true">
                    🔒
                  </span>
                  {awaiting ? (
                    <>
                      <p className="rp-serif m-0 text-lg font-semibold leading-snug text-white">{t.awaitTitle}</p>
                      <p className="m-0 text-[13px] leading-relaxed text-violet-100/80">{t.awaitBody}</p>
                      <button
                        type="button"
                        onClick={unlock}
                        className="min-h-14 w-full cursor-pointer rounded-2xl border border-white/25 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-4 py-3 text-[15px] font-bold leading-snug text-white shadow-[0_0_30px_rgba(217,70,239,.55)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(236,72,153,.8)] active:translate-y-0 active:scale-[.97]"
                      >
                        {t.awaitDone}
                      </button>
                      <a
                        href={checkoutHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-violet-200/80 underline underline-offset-4 hover:text-white"
                      >
                        {t.awaitReopen}
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="rp-serif m-0 text-lg font-semibold leading-snug text-white">
                        {josa(fill(t.lockedTitle, { idol: report.bias.name }))}
                      </p>
                      <a
                        href={checkoutHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onCheckoutClick}
                        className="flex min-h-14 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-4 py-3 text-[15px] font-bold leading-snug text-white no-underline shadow-[0_0_30px_rgba(217,70,239,.55)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(236,72,153,.8)] active:translate-y-0 active:scale-[.97]"
                      >
                        {fill(t.unlockMain, { price: usd(PRICE) })}
                        <span className="mt-0.5 text-[11px] font-medium text-white/85">
                          {fill(t.unlockSub, { off: OFF_PCT })} (<s>{usd(LIST_PRICE)}</s>)
                        </span>
                      </a>
                      <p className="m-0 text-[11px] text-violet-200/60">{t.secureNote}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-[var(--rp-rule)] pt-5">
          <p className="m-0 text-xs leading-relaxed text-[var(--rp-dim)]">{report.disclaimer}</p>
          <p className="m-0 text-[11px] uppercase tracking-[.2em] text-[var(--rp-dim)]">{t.footer}</p>
        </footer>

        {/* 하단 버튼 (인쇄 시 숨김) */}
        <div className="rp-noprint flex flex-wrap gap-3">
          {unlocked && (
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-12 flex-[1_1_200px] cursor-pointer rounded-2xl border border-white/25 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 text-[15px] font-bold text-white shadow-[0_0_28px_rgba(217,70,239,.45)] transition hover:-translate-y-0.5 active:scale-[.97]"
          >
            🖨 {t.print}
          </button>
          )}
          <Link
            href={reportBase(user, lang)}
            className="flex min-h-12 flex-[1_1_200px] items-center justify-center rounded-2xl border border-[var(--rp-line)] bg-white/[0.06] px-5 text-[15px] font-semibold text-[var(--rp-fg)] transition hover:-translate-y-0.5 hover:bg-white/10 active:scale-[.97]"
          >
            ✦ {t.change}
          </Link>
        </div>
      </div>
    </main>
  );
}
