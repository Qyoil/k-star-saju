"use client";

// app/report/BiasPicker.tsx
// 최애 선택 화면: [Quick Pick] 목록에서 원클릭 / [Custom Bias] 이름 + 생년월일 직접 입력
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { cleanBiasName, parseBirthString } from "../../lib/compatibility";
import type { BirthInput, Lang } from "../../lib/saju";
import { RETURN_KEY, UNLOCK_KEY } from "./unlock";
import { reportHrefCustom, reportHrefIdol, resultBackHref, UI } from "./ui";

interface IdolItem {
  id: string;
  name: string; //   'BTS V'
  nameKo: string; // 'BTS 뷔'
  group: string; //  'BTS'
  gender: "boy" | "girl";
}

const LANG_TABS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
];

/** 이름에서 그룹 부분과 멤버 부분을 나눔 (영문: 그룹명 길이 기준, 한글: 마지막 단어가 멤버) */
function split(i: IdolItem, lang: Lang): { group: string; member: string } {
  if (lang === "ko") {
    const k = i.nameKo.lastIndexOf(" ");
    return { group: i.nameKo.slice(0, k), member: i.nameKo.slice(k + 1) };
  }
  return { group: i.group, member: i.name.slice(i.group.length + 1) };
}

export default function BiasPicker({
  user,
  initialLang,
  paid,
  invalid,
  idols,
}: {
  user: BirthInput;
  initialLang: Lang;
  paid: boolean;
  invalid: boolean;
  idols: IdolItem[];
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [tab, setTab] = useState<"quick" | "custom">("quick");
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = UI[lang];

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const groups = useMemo(() => {
    const map = new Map<string, IdolItem[]>();
    for (const i of idols.filter((x) => x.gender === gender)) {
      const list = map.get(i.group) ?? [];
      list.push(i);
      map.set(i.group, list);
    }
    return [...map.entries()];
  }, [idols, gender]);

  // 결제창에서 돌아왔는데 최애 선택 화면이라면: 결제 직전에 보던 리포트로 되돌려 보냄
  useEffect(() => {
    if (!paid) return;
    try {
      window.localStorage.setItem(UNLOCK_KEY, "true");
      const back = window.localStorage.getItem(RETURN_KEY);
      if (back && back.startsWith("/report")) router.replace(`${back}${back.includes("?") ? "&" : "?"}paid=true`);
    } catch {}
  }, [paid, router]);

  function chooseLang(next: Lang) {
    setLang(next);
    try {
      document.cookie = `kss-lang=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }

  function go(href: string) {
    startTransition(() => router.push(href));
  }

  function onCustom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = cleanBiasName(name);
    const b = parseBirthString(date);
    if (!n) return setError(t.errName);
    if (!b) return setError(t.errDate);
    setError(null);
    go(reportHrefCustom(user, lang, n, b));
  }

  const tabBtn = (active: boolean) =>
    `min-h-11 flex-1 cursor-pointer rounded-full px-4 text-sm font-semibold transition duration-200 active:scale-95 ${
      active
        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_18px_rgba(217,70,239,.55)]"
        : "text-violet-200/75 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-5">
      <div className="sky" aria-hidden="true" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-6rem] h-[22rem] w-[22rem] rounded-full bg-violet-600/35 blur-[90px]" />
        <div className="absolute -right-28 top-1/3 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/25 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={resultBackHref(user, lang)}
            className="text-sm font-medium text-violet-200/80 underline-offset-4 hover:text-white hover:underline"
          >
            ← {t.back}
          </Link>
          <div
            role="group"
            aria-label={t.langLabel}
            className="flex gap-1 rounded-full border border-white/15 bg-white/[0.07] p-1 backdrop-blur-xl"
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
                    : "text-violet-200/75 hover:bg-white/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <header className="flex flex-col items-center gap-2 text-center">
          <span className="ff-mono text-[11px] tracking-[.22em] text-fuchsia-200/80">{t.pickerKicker}</span>
          <h1
            className={`${lang === "en" ? "ff-display " : ""}m-0 bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-[28px] font-extrabold leading-tight text-transparent`}
          >
            {t.pickerTitle}
          </h1>
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-violet-200/75">
            {t.pickerSub.replace("{n}", String(idols.length))}
          </p>
        </header>

        {invalid && (
          <p role="alert" className="m-0 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {t.errInvalid}
          </p>
        )}

        <div
          role="tablist"
          aria-label={t.pickerTitle}
          className="flex gap-1 rounded-full border border-white/15 bg-white/[0.07] p-1 backdrop-blur-xl"
        >
          <button
            role="tab"
            id="tab-quick"
            aria-selected={tab === "quick"}
            aria-controls="panel-quick"
            type="button"
            onClick={() => setTab("quick")}
            className={tabBtn(tab === "quick")}
          >
            ✦ {t.tabQuick}
          </button>
          <button
            role="tab"
            id="tab-custom"
            aria-selected={tab === "custom"}
            aria-controls="panel-custom"
            type="button"
            onClick={() => setTab("custom")}
            className={tabBtn(tab === "custom")}
          >
            ✎ {t.tabCustom}
          </button>
        </div>

        {isPending && (
          <p role="status" className="m-0 text-center text-sm text-fuchsia-200">
            {t.pending}
          </p>
        )}

        {tab === "quick" ? (
          <section
            role="tabpanel"
            id="panel-quick"
            aria-labelledby="tab-quick"
            className="flex flex-col gap-5 rounded-[28px] border border-white/15 bg-white/[0.06] p-5 shadow-[0_0_60px_rgba(168,85,247,.2)] backdrop-blur-xl"
          >
            <div className="grid grid-cols-2 gap-2" role="group" aria-label={t.tabQuick}>
              {(["boy", "girl"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={gender === g}
                  onClick={() => setGender(g)}
                  className={`min-h-11 cursor-pointer rounded-2xl border px-3 text-sm font-semibold transition active:scale-95 ${
                    gender === g
                      ? "border-fuchsia-300/80 bg-gradient-to-br from-violet-500/45 to-fuchsia-500/45 text-white shadow-[0_0_20px_rgba(217,70,239,.5)]"
                      : "border-white/15 bg-white/[0.06] text-violet-100/80 hover:border-fuchsia-300/50 hover:bg-white/[0.12]"
                  }`}
                >
                  {g === "boy" ? "👦 " : "👧 "}
                  {g === "boy" ? t.boy : t.girl}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {groups.map(([group, list]) => (
                <div key={group} className="flex flex-col gap-2">
                  <h2 className="ff-mono m-0 text-[11px] font-bold tracking-[.18em] text-violet-200/60">
                    {split(list[0], lang).group.toUpperCase()}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {list.map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        disabled={isPending}
                        onClick={() => go(reportHrefIdol(user, lang, i.id))}
                        className="min-h-11 cursor-pointer rounded-full border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-violet-50 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-fuchsia-300/60 hover:bg-fuchsia-500/20 hover:shadow-[0_0_18px_rgba(217,70,239,.45)] active:scale-95 disabled:cursor-wait disabled:opacity-60"
                      >
                        {split(i, lang).member}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section role="tabpanel" id="panel-custom" aria-labelledby="tab-custom">
            <form
              onSubmit={onCustom}
              noValidate
              className="flex flex-col gap-5 rounded-[28px] border border-white/15 bg-white/[0.06] p-6 shadow-[0_0_60px_rgba(168,85,247,.2)] backdrop-blur-xl"
            >
              <p className="m-0 text-sm leading-relaxed text-violet-200/75">{t.customHelp}</p>

              <label htmlFor="bias-name" className="flex flex-col gap-2 text-sm font-medium text-violet-100/90">
                {t.nameLabel}
                <input
                  id="bias-name"
                  type="text"
                  maxLength={40}
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePh}
                  className="min-h-12 rounded-xl border border-white/15 bg-white/[0.07] px-3 text-base text-[var(--fg)] outline-none transition placeholder:text-violet-200/35 focus:border-fuchsia-300/70 focus:shadow-[0_0_0_3px_rgba(232,121,249,.25)]"
                />
              </label>

              <label htmlFor="bias-date" className="flex flex-col gap-2 text-sm font-medium text-violet-100/90">
                {t.birthLabel}
                <input
                  id="bias-date"
                  type="date"
                  min="1900-01-01"
                  max={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="min-h-12 rounded-xl border border-white/15 bg-white/[0.07] px-3 text-base text-[var(--fg)] outline-none transition focus:border-fuchsia-300/70 focus:shadow-[0_0_0_3px_rgba(232,121,249,.25)] [color-scheme:dark]"
                />
                <span className="text-xs font-normal text-violet-200/55">{t.birthHint}</span>
              </label>

              {error && (
                <p role="alert" className="m-0 text-sm font-medium text-rose-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="min-h-14 cursor-pointer rounded-2xl border border-white/25 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 py-3 text-base font-bold text-white shadow-[0_0_30px_rgba(217,70,239,.5)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(236,72,153,.75)] active:translate-y-0 active:scale-[.97] disabled:cursor-wait disabled:opacity-75"
              >
                {isPending ? t.pending : t.submit}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
