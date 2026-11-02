/**
 * Les partielles fédérales, prêtes à lister : nom officiel par langue, province,
 * favori et chances, triées par date de scrutin puis par chances du favori.
 * Lu par la page des partielles, l'accueil du Canada et le calendrier des scrutins.
 * Les chiffres viennent de web_data/canada-byelection-* (canada-byelection-overlay).
 */
import indexSource from '../../web_data/canada-byelections/latest.json';
import { BYELECTION_BY_RIDING, type ByelectionStatus } from './canada-byelection-overlay';
import { canadaByelectionRaces, type ByelectionRaceConfig } from '../data/canadaByelectionRaces';
import { partyMeta } from './riding-adapters/parties';
import { partyName } from './party-names';

type Lang = 'fr' | 'en' | 'es';

export interface SlateRow {
  slug: string;
  name: string;
  province: string;
  href: string;
  status: ByelectionStatus;
  electionDate: string | null;
  party: string;
  partyLabel: string;
  color: string;
  p: number;
  share: number;
  incumbent: string | null;
  incumbentLabel: string;
  departing: string | null;
}

const PROVINCE: Record<string, Record<Lang, string>> = {
  QC: { fr: 'Québec', en: 'Quebec', es: 'Quebec' },
  ON: { fr: 'Ontario', en: 'Ontario', es: 'Ontario' },
  SK: { fr: 'Saskatchewan', en: 'Saskatchewan', es: 'Saskatchewan' },
  BC: { fr: 'Colombie-Britannique', en: 'British Columbia', es: 'Columbia Británica' },
  AB: { fr: 'Alberta', en: 'Alberta', es: 'Alberta' },
  MB: { fr: 'Manitoba', en: 'Manitoba', es: 'Manitoba' },
};

const label = (code: string, lang: Lang) => partyName({ ...partyMeta('federal-ca', code), party: code }, lang);

export function byelectionSlate(lang: Lang): SlateRow[] {
  return (Object.values(canadaByelectionRaces) as ByelectionRaceConfig[])
    .map((r) => {
      const o = BYELECTION_BY_RIDING[r.ridingId];
      if (!o) return null;
      const fav = o.parties.find((x) => x.party === o.favorite);
      return {
        slug: r.slug,
        name: r.ridingName?.[lang] ?? (indexSource as any).pending?.find((e: any) => e.slug === o.slug)?.riding_name_fr ?? r.slug,
        province: PROVINCE[r.province]?.[lang] ?? r.province,
        href: r.paths[lang],
        status: r.status,
        electionDate: r.electionDate,
        party: o.favorite,
        partyLabel: label(o.favorite, lang),
        color: partyMeta('federal-ca', o.favorite).color,
        p: o.favoriteProbability,
        share: fav?.voteMean ?? 0,
        incumbent: o.incumbentParty,
        incumbentLabel: o.incumbentParty ? label(o.incumbentParty, lang) : '',
        departing: o.departingMember,
      } satisfies SlateRow;
    })
    .filter((x): x is SlateRow => x !== null)
    .sort((a, b) => (a.electionDate ?? '9999').localeCompare(b.electionDate ?? '9999') || b.p - a.p);
}

/** Prochaine journée de scrutin fixée, et les courses de ce jour-là. */
export function nextByelectionDay(lang: Lang): { date: string; rows: SlateRow[] } | null {
  const rows = byelectionSlate(lang).filter((r) => r.status === 'scheduled' && r.electionDate);
  if (!rows.length) return null;
  const date = rows.map((r) => r.electionDate as string).sort()[0];
  return { date, rows: rows.filter((r) => r.electionDate === date) };
}

export const byelectionRunDate: string = (indexSource as any).meta?.run_date ?? '';

/** « > 99 % », « 81 % », « 81% » : jamais 100 %. */
export function chance(p: number, lang: Lang): string {
  const v = p * 100;
  const s = v >= 99.5 ? (lang === 'en' ? '>99' : '> 99') : v < 0.5 ? (lang === 'en' ? '<1' : '< 1') : String(Math.round(v));
  return lang === 'en' ? `${s}%` : `${s} %`;
}
