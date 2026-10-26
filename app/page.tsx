"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { langFromHeader, parseLang, type Lang } from "../lib/saju";

type Pref = "boy" | "girl" | "all";

const PREFS: { value: Pref; icon: string }[] = [
  { value: "boy", icon: "👦" },
  { value: "girl", icon: "👧" },
  { value: "all", icon: "✨" },
];

const LANG_TABS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
];

// 메인 화면 문구 (결과 화면 문구는 lib/i18n.ts)
const T: Record<
  Lang,
  {
    matched: string;
    title: [string, string];
    sub: string;
    birth: string;
    pref: string;
    boy: string;
    girl: string;
    all: string;
    cta: string;
    pending: string;
    note: string;
    langLabel: string;
  }
> = {
  en: {
    matched: "Soulmates Matched",
    title: ["Meet Your", "K-Pop Soulmate"],
    sub: "Your birth date holds a cosmic code. Decode your Five Elements and find the idol the stars wrote for you. ✦",
    birth: "Birth date (Year / Month / Day)",
    pref: "Preferred idol",
    boy: "Boy Group",
    girl: "Girl Group",
    all: "Any",
    cta: "Find my soulmate →",
    pending: "Reading the stars…",
    note: "Free · takes 5 seconds · no sign-up",
    langLabel: "Language",
  },
  ko: {
    matched: "명의 소울메이트 매칭 완료",
    title: ["나의 운명적인", "K-Pop 소울메이트"],
    sub: "생년월일에는 우주의 코드가 담겨 있어요. 오행을 풀어 별이 점지한 아이돌을 찾아보세요. ✦",
    birth: "생년월일 (년 / 월 / 일)",
    pref: "선호 아이돌",
    boy: "보이 그룹",
    girl: "걸 그룹",
    all: "상관없음",
    cta: "내 소울메이트 찾기 →",
    pending: "별을 읽는 중…",
    note: "무료 · 5초 소요 · 가입 필요 없음",
    langLabel: "언어",
  },
  zh: {
    matched: "位灵魂伴侣已匹配",
    title: ["遇见你的", "K-Pop 灵魂伴侣"],
    sub: "你的生辰里藏着宇宙密码。解读五行，找到星星为你写下的爱豆。✦",
    birth: "出生日期（年 / 月 / 日）",
    pref: "偏好的爱豆",
    boy: "男团",
    girl: "女团",
    all: "不限",
    cta: "找到我的灵魂伴侣 →",
    pending: "正在读取星象…",
    note: "免费 · 仅需5秒 · 无需注册",
    langLabel: "语言",
  },
};

function readCookieLang(): Lang | null {
  try {
    const m = document.cookie.match(/(?:^|;\s*)kss-lang=([^;]+)/);
    return parseLang(m ? decodeURIComponent(m[1]) : null);
  } catch {
    return null;
  }
}

// 소셜 프루프 숫자: 실제 가입/매칭 수에 맞춰 직접 바꾸세요.
const MATCHED = "14,800+";

// 배경 스파클 위치 (top, left, 크기, 지연)
const SPARKLES: { t: string; l: string; s: string; d: string }[] = [
  { t: "8%", l: "12%", s: "text-lg", d: "0s" },
  { t: "14%", l: "82%", s: "text-2xl", d: "0.8s" },
  { t: "30%", l: "6%", s: "text-sm", d: "1.6s" },
  { t: "36%", l: "92%", s: "text-base", d: "0.4s" },
  { t: "62%", l: "10%", s: "text-xl", d: "1.2s" },
  { t: "74%", l: "88%", s: "text-sm", d: "2s" },
  { t: "88%", l: "24%", s: "text-base", d: "0.6s" },
  { t: "90%", l: "74%", s: "text-lg", d: "1.8s" },
];

// 오행 노드 (木火土金水) : 오각형 꼭짓점
const NODES = [
  { x: 60, y: 10, c: "#7dffb0", ch: "木" },
  { x: 107.5, y: 44.5, c: "#ff8a5c", ch: "火" },
  { x: 89.4, y: 100.5, c: "#ffd86b", ch: "土" },
  { x: 30.6, y: 100.5, c: "#e6ecff", ch: "金" },
  { x: 12.5, y: 44.5, c: "#6cb8ff", ch: "水" },
];

function ElementSigil() {
  return (
    <div className="ks-float relative mx-auto h-28 w-28" aria-hidden="true">
      <div className="absolute inset-[-18px] rounded-full bg-fuchsia-500/30 blur-2xl" />
      <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-xl" />
      <svg viewBox="0 0 120 120" className="ks-spin relative h-full w-full overflow-visible">
        <defs>
          <linearGradient id="ks-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#f0abfc" />
          </linearGradient>
          <filter id="ks-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r="52" fill="none" stroke="url(#ks-line)" strokeOpacity=".35" strokeDasharray="2 5" />
        <polygon
          points={NODES.map((n) => `${n.x},${n.y}`).join(" ")}
          fill="none"
          stroke="url(#ks-line)"
          strokeOpacity=".5"
          strokeWidth="1"
        />
        <polygon
          points={[NODES[0], NODES[2], NODES[4], NODES[1], NODES[3]].map((n) => `${n.x},${n.y}`).join(" ")}
          fill="none"
          stroke="url(#ks-line)"
          strokeOpacity=".9"
          strokeWidth="1.2"
          filter="url(#ks-glow)"
        />
        {NODES.map((n) => (
          <g key={n.ch} filter="url(#ks-glow)">
            <circle cx={n.x} cy={n.y} r="5.5" fill={n.c} />
            <circle cx={n.x} cy={n.y} r="9" fill="none" stroke={n.c} strokeOpacity=".4" />
          </g>
        ))}
        <text x="60" y="66" textAnchor="middle" fontSize="20" fill="#fff" filter="url(#ks-glow)">
          ✦
        </text>
      </svg>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [date, setDate] = useState("2003-05-14");
  const [pref, setPref] = useState<Pref>("all");
  const [lang, setLang] = useState<Lang>("en"); // 서버/브라우저 첫 화면을 같게 en 으로 시작
  const [isPending, startTransition] = useTransition(); // 이동이 끝날 때까지 true

  // 첫 방문: 저장된 언어(kss-lang 쿠키) -> 없으면 브라우저 언어
  useEffect(() => {
    setLang(readCookieLang() ?? langFromHeader(navigator.language));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [lang]);

  function chooseLang(next: Lang) {
    setLang(next);
    try {
      document.cookie = `kss-lang=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }

  const t = T[lang];
  const prefLabel: Record<Pref, string> = { boy: t.boy, girl: t.girl, all: t.all };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const [y, m, d] = date.split("-").map(Number);
    startTransition(() => router.push(`/result?y=${y}&m=${m}&d=${d}&pref=${pref}&lang=${lang}`));
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <style>{`
        @keyframes ks-twinkle { 0%,100% { opacity:.2; transform:scale(.8) } 50% { opacity:1; transform:scale(1.25) } }
        @keyframes ks-float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes ks-spin { to { transform:rotate(360deg) } }
        @keyframes ks-drift { 0%,100% { transform:translate(0,0) scale(1) } 50% { transform:translate(24px,-18px) scale(1.12) } }
        @keyframes ks-shine { to { background-position:200% center } }
        @keyframes ks-ping { 0% { transform:scale(1); opacity:.7 } 80%,100% { transform:scale(2.4); opacity:0 } }
        .ks-twinkle { animation: ks-twinkle 3.2s ease-in-out infinite }
        .ks-float { animation: ks-float 6s ease-in-out infinite }
        .ks-spin { animation: ks-spin 48s linear infinite; transform-origin: 50% 50% }
        .ks-drift { animation: ks-drift 14s ease-in-out infinite }
        .ks-shine { background-size:200% auto; animation: ks-shine 6s linear infinite }
        .ks-ping { animation: ks-ping 1.8s cubic-bezier(0,0,.2,1) infinite }
        @media (prefers-reduced-motion: reduce) {
          .ks-twinkle,.ks-float,.ks-spin,.ks-drift,.ks-shine,.ks-ping { animation: none }
        }
      `}</style>

      <div className="sky" aria-hidden="true" />

      {/* 몽환적 보랏빛 글로우 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="ks-drift absolute -left-24 top-[-6rem] h-[22rem] w-[22rem] rounded-full bg-violet-600/35 blur-[90px]" />
        <div
          className="ks-drift absolute -right-28 top-1/3 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/25 blur-[100px]"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="ks-drift absolute -bottom-24 left-1/4 h-[20rem] w-[20rem] rounded-full bg-indigo-500/30 blur-[90px]"
          style={{ animationDelay: "-9s" }}
        />
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className={`ks-twinkle absolute text-fuchsia-200 ${s.s}`}
            style={{ top: s.t, left: s.l, animationDelay: s.d, textShadow: "0 0 12px #e879f9" }}
          >
            ✦
          </span>
        ))}
      </div>

      <div
        role="group"
        aria-label={t.langLabel}
        className="absolute right-3 top-3 z-20 flex gap-1 rounded-full border border-white/15 bg-white/[0.07] p-1 shadow-[0_0_24px_rgba(168,85,247,.3)] backdrop-blur-xl sm:right-5 sm:top-5"
      >
        {LANG_TABS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => chooseLang(l.value)}
            aria-pressed={lang === l.value}
            className={`min-h-8 cursor-pointer rounded-full px-3 text-xs font-semibold transition duration-200 active:scale-95 ${
              lang === l.value
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_16px_rgba(217,70,239,.6)]"
                : "text-violet-200/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative z-10 mt-8 flex w-full max-w-[420px] flex-col items-center gap-6 sm:mt-0">
        <ElementSigil />

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-xs font-semibold text-violet-100 shadow-[0_0_24px_rgba(192,132,252,.25)] backdrop-blur-md">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="ks-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            ✨ {MATCHED}{lang === "en" ? " " : ""}{t.matched}
          </span>

          <h1 className={`${lang === "en" ? "ff-display " : ""}m-0 text-[34px] font-extrabold leading-[1.15] tracking-tight`}>
            <span className="ks-shine bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
              {t.title[0]}
              <br />
              {t.title[1]}
            </span>
          </h1>

          <p className="m-0 max-w-[340px] text-[15px] leading-relaxed text-violet-200/80">
            {t.sub}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex w-full flex-col gap-5 rounded-[28px] border border-white/15 bg-white/[0.06] p-6 shadow-[0_0_60px_rgba(168,85,247,.22),inset_0_1px_0_rgba(255,255,255,.15)] backdrop-blur-xl"
        >
          <label htmlFor="birth" className="flex flex-col gap-2 text-sm font-medium text-violet-100/90">
            {t.birth}
            <input
              id="birth"
              type="date"
              required
              min="1900-01-01"
              max="2100-12-31"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-12 rounded-xl border border-white/15 bg-white/[0.07] px-3 text-base text-[var(--fg)] outline-none transition focus:border-fuchsia-300/70 focus:shadow-[0_0_0_3px_rgba(232,121,249,.25)] [color-scheme:dark]"
            />
          </label>

          <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
            <legend className="mb-2 p-0 text-sm font-medium text-violet-100/90">{t.pref}</legend>
            <div className="grid grid-cols-3 gap-2">
              {PREFS.map((p) => (
                <label key={p.value} className="group cursor-pointer">
                  <input
                    type="radio"
                    name="pref"
                    value={p.value}
                    checked={pref === p.value}
                    onChange={() => setPref(p.value)}
                    className="peer sr-only"
                  />
                  <span
                    className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/15 bg-white/[0.06] px-1 py-2 text-center text-xs font-semibold leading-tight text-violet-100/80 backdrop-blur-md transition duration-200
                      group-hover:-translate-y-0.5 group-hover:border-fuchsia-300/50 group-hover:bg-white/[0.12]
                      group-active:scale-95
                      peer-checked:border-fuchsia-300/80 peer-checked:bg-gradient-to-br peer-checked:from-violet-500/45 peer-checked:to-fuchsia-500/45 peer-checked:text-white peer-checked:shadow-[0_0_22px_rgba(217,70,239,.55)]
                      peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--moon)]"
                  >
                    <span className="text-lg" aria-hidden="true">
                      {p.icon}
                    </span>
                    {prefLabel[p.value]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isPending}
            className="group relative min-h-14 cursor-pointer overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 py-3 text-base font-bold text-white shadow-[0_0_30px_rgba(217,70,239,.5)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(236,72,153,.75)] active:translate-y-0 active:scale-[.97] disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/30 opacity-0 blur-md transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
            />
            <span className="relative">{isPending ? t.pending : t.cta}</span>
          </button>

          <p className="m-0 text-center text-xs text-violet-200/60">{t.note}</p>
        </form>
      </div>
    </main>
  );
}