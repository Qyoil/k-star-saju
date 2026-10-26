"use client";

// app/report/ReportView.tsx
// 1:1 심층 궁합 리포트 뷰어: 다크 럭셔리 매거진 스타일 + 인쇄/PDF 저장 최적화
import Link from "next/link";
import { useMemo, useState } from "react";
import { buildReport, type PersonView } from "../../lib/compatibility";
import { ELEMENT_EMOJI, ELEMENT_NAME } from "../../lib/i18n";
import { ELEMENT_ORDER, formatBirth, type BirthInput, type Element, type Lang } from "../../lib/saju";
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
  const t = UI[lang];
  const biasName = lang === "ko" ? bias.nameKo : bias.nameEn;
  const report = useMemo(() => buildReport(user, { name: biasName, birth: bias.birth }, lang), [user, bias.birth, biasName, lang]);

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

        {/* 4대 챕터 */}
        {report.sections.map((s) => (
          <section key={s.id} className="rp-chapter flex flex-col gap-4" aria-labelledby={`ch-${s.id}`}>
            <div className="flex items-baseline gap-4 border-b border-[var(--rp-rule)] pb-3">
              <span className="rp-serif text-5xl font-semibold leading-none text-[var(--rp-accent)]" aria-hidden="true">
                {s.no}
              </span>
              <h2 id={`ch-${s.id}`} className="rp-serif m-0 text-[clamp(22px,5.4vw,30px)] font-semibold leading-tight">
                {s.title}
              </h2>
            </div>
            <p className="rp-serif m-0 text-balance text-xl italic leading-snug text-[var(--rp-fg)]">{s.headline}</p>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="m-0 text-[15px] leading-[1.85] text-[var(--rp-fg)]/90">
                {p}
              </p>
            ))}
            {s.id === "remedy" && (
              <div className="grid grid-cols-3 gap-2 text-center" aria-label="lucky">
                {[
                  [t.luckyColor, report.remedy.color],
                  [t.luckyDir, report.remedy.direction],
                  [t.luckyNum, report.remedy.numbers],
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
          </section>
        ))}

        <footer className="flex flex-col gap-3 border-t border-[var(--rp-rule)] pt-5">
          <p className="m-0 text-xs leading-relaxed text-[var(--rp-dim)]">{report.disclaimer}</p>
          <p className="m-0 text-[11px] uppercase tracking-[.2em] text-[var(--rp-dim)]">{t.footer}</p>
        </footer>

        {/* 하단 버튼 (인쇄 시 숨김) */}
        <div className="rp-noprint flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-12 flex-[1_1_200px] cursor-pointer rounded-2xl border border-white/25 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 text-[15px] font-bold text-white shadow-[0_0_28px_rgba(217,70,239,.45)] transition hover:-translate-y-0.5 active:scale-[.97]"
          >
            🖨 {t.print}
          </button>
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
