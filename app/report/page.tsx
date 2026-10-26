import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { cleanBiasName, parseBirthString } from "../../lib/compatibility";
import { IDOLS, findIdol } from "../../lib/pref";
import { langFromHeader, parseLang, resultFromParams } from "../../lib/saju";
import BiasPicker from "./BiasPicker";
import ReportView from "./ReportView";

export const metadata: Metadata = {
  title: "K-Star Saju · Bias Report",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * /report?y=2003&m=5&d=14&lang=ko                          -> 최애 선택 화면
 * /report?y=2003&m=5&d=14&lang=ko&b=bts-v                   -> 목록에서 고른 최애의 심층 리포트
 * /report?y=2003&m=5&d=14&lang=ko&bn=Karina&bd=2000-04-11   -> 직접 입력한 최애의 심층 리포트
 */
export default async function ReportPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const user = resultFromParams(params).birth;
  const saved = parseLang((await cookies()).get("kss-lang")?.value);
  const lang = parseLang(params.lang) ?? saved ?? langFromHeader((await headers()).get("accept-language"));

  // 1) 목록에서 고른 경우
  const idolId = one(params.b);
  const idol = findIdol(idolId);
  const idolBirth = idol ? parseBirthString(idol.born) : null;
  if (idol && idolBirth) {
    return (
      <ReportView
        user={user}
        bias={{ nameEn: idol.name, nameKo: idol.nameKo, birth: idolBirth }}
        initialLang={lang}
      />
    );
  }

  // 2) 직접 입력한 경우
  const customName = cleanBiasName(one(params.bn));
  const customBirth = parseBirthString(one(params.bd));
  if (customName && customBirth) {
    return <ReportView user={user} bias={{ nameEn: customName, nameKo: customName, birth: customBirth }} initialLang={lang} />;
  }

  // 3) 선택 화면 (값이 있었는데 읽지 못했다면 안내 문구 표시)
  const invalid = Boolean(idolId || one(params.bn) || one(params.bd));
  return (
    <BiasPicker
      user={user}
      initialLang={lang}
      invalid={invalid}
      idols={IDOLS.map((i) => ({ id: i.id, name: i.name, nameKo: i.nameKo, group: i.group, gender: i.gender }))}
    />
  );
}
