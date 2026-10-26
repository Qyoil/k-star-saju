import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { parsePref } from "../../lib/pref";
import { langFromHeader, parseLang, resultFromParams } from "../../lib/saju";
import ResultView from "./ResultView";

export const metadata: Metadata = {
  title: "K-Star Saju · Your Result",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// /result?y=2003&m=5&d=14&pref=girl  (선택: &lang=ko)  ·  Next.js 15+ : searchParams 는 Promise
export default async function ResultPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const saved = parseLang((await cookies()).get("kss-lang")?.value);
  const lang = parseLang(params.lang) ?? saved ?? langFromHeader((await headers()).get("accept-language"));

  return (
    <ResultView
      result={resultFromParams(params)}
      initialLang={lang}
      pref={parsePref(typeof params.pref === "string" ? params.pref : undefined)}
    />
  );
}
