/**
 * Le résultat d'une course du 3 novembre 2026, en tête de sa fiche : gagnant
 * projeté par Vote-Scope (ou meneur si la course n'est pas appelée), voix et
 * pourcentages, part dépouillée, source, écart avec notre projection.
 * Rendu au build depuis la copie de repli, puis tenu à jour par live.json.
 */
import type { UsLivePayload } from './usLive';
import { drLabel, etStamp, num, pct, raceView, sourceLink, useLiveView, type Lang, type RaceView } from '../lib/us-results';
import '../styles/us-results.css';

type Party = { code: string; color: string };
interface Props {
  lang: Lang; raceId: string; initial: RaceView | null; urls: string[];
  parties: Party[]; allRacesHref: string; allRacesLabel?: string;
}

const PARTY: Record<Lang, Record<string, string>> = {
  fr: { us_dem: 'Démocrate', us_rep: 'Républicain', us_oth: 'Autre' },
  en: { us_dem: 'Democrat', us_rep: 'Republican', us_oth: 'Other' },
  es: { us_dem: 'Demócrata', us_rep: 'Republicano', us_oth: 'Otro' },
};

const T = {
  fr: {
    called: 'Résultat', counting: 'Dépouillement en cours',
    wins: (who: string) => `${who} remporte la course.`,
    leads: (who: string, m: string) => `${who} mène de ${m} points.`,
    callAt: (s: string) => `Projection Vote-Scope le ${s}, heure de l’Est.`,
    none: { awaiting: 'Aucun bulletin compté pour l’instant.', state_unavailable: 'Pas de chiffres lisibles pour l’instant : la source de l’État ne répond pas.', transcribed_empty: 'Les chiffres de cet État sont relevés à la main ; rien n’est encore saisi.' } as Record<string, string>,
    cols: ['Candidat', 'Parti', 'Voix', '%'],
    reported: (p: string) => `Dépouillé : ${p}`, votes: (n: string) => `${n} voix comptées`,
    source: 'Chiffres : ', asOf: (s: string) => `au ${s}, heure de l’Est`,
    proj: (p: string, l: string) => `Notre projection : ${p}. Décompte : ${l}.`,
    diff: (n: string, side: 'dem' | 'rep', x: number) => ` Soit ${n} point${x < 2 ? '' : 's'} plus ${side === 'dem' ? 'démocrate' : 'républicain'} que prévu.`,
    inLine: ' Conforme à notre projection, à un demi-point près.',
    all: 'Toutes les courses de la soirée',
  },
  en: {
    called: 'Result', counting: 'Count under way',
    wins: (who: string) => `${who} wins the race.`,
    leads: (who: string, m: string) => `${who} leads by ${m} points.`,
    callAt: (s: string) => `Vote-Scope projection on ${s} Eastern.`,
    none: { awaiting: 'No ballots counted yet.', state_unavailable: 'No readable figures yet: the state’s source is not answering.', transcribed_empty: 'This state’s figures are entered by hand; nothing has been entered yet.' } as Record<string, string>,
    cols: ['Candidate', 'Party', 'Votes', '%'],
    reported: (p: string) => `Reported: ${p}`, votes: (n: string) => `${n} votes counted`,
    source: 'Figures: ', asOf: (s: string) => `as of ${s} Eastern`,
    proj: (p: string, l: string) => `Our forecast: ${p}. Count: ${l}.`,
    diff: (n: string, side: 'dem' | 'rep', x: number) => ` That is ${n} point${x === 1 ? '' : 's'} more ${side === 'dem' ? 'Democratic' : 'Republican'} than forecast.`,
    inLine: ' In line with our forecast, within half a point.',
    all: 'All of tonight’s races',
  },
  es: {
    called: 'Resultado', counting: 'Escrutinio en curso',
    wins: (who: string) => `${who} gana la contienda.`,
    leads: (who: string, m: string) => `${who} lidera por ${m} puntos.`,
    callAt: (s: string) => `Proyección de Vote-Scope el ${s}, hora del Este.`,
    none: { awaiting: 'Aún no hay papeletas contadas.', state_unavailable: 'Aún no hay cifras legibles: la fuente del estado no responde.', transcribed_empty: 'Las cifras de este estado se registran a mano; todavía no hay nada registrado.' } as Record<string, string>,
    cols: ['Candidato', 'Partido', 'Votos', '%'],
    reported: (p: string) => `Escrutado: ${p}`, votes: (n: string) => `${n} votos contados`,
    source: 'Cifras: ', asOf: (s: string) => `al ${s}, hora del Este`,
    proj: (p: string, l: string) => `Nuestra proyección: ${p}. Recuento: ${l}.`,
    diff: (n: string, side: 'dem' | 'rep', x: number) => ` Es decir, ${n} punto${x === 1 ? '' : 's'} más ${side === 'dem' ? 'demócrata' : 'republicano'} de lo previsto.`,
    inLine: ' En línea con nuestra proyección, con medio punto de margen.',
    all: 'Todas las contiendas de la noche',
  },
};

function Check({ color }: { color: string }) {
  return (
    <svg class="usr-check" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill={color} />
      <path d="M5.5 10.4l3 3 6-6.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export default function UsRaceResult({ lang, raceId, initial, urls, parties, allRacesHref }: Props) {
  const view = useLiveView<{ v: RaceView | null; at: string | null }>(urls, { v: initial, at: null },
    (p: UsLivePayload) => ({ v: raceView(p, raceId), at: p.source?.source_updated_at ?? p.generated_at ?? null }));
  const v = view.v;
  if (!v) return null;
  const t = T[lang];
  const colorOf = (code: string) => parties.find((x) => x.code === code)?.color ?? '#777';
  const partyName = (code: string) => PARTY[lang][code] ?? code.replace(/^us_/, '');
  const top = v.candidates[0];
  const second = v.candidates[1];
  const winnerParty = v.call?.party ?? top?.party ?? null;
  const winnerName = v.call?.candidate ?? top?.name ?? '';
  const who = winnerParty ? `${winnerName} (${partyName(winnerParty)})` : winnerName;
  const lead = top && second ? num(top.pct - second.pct, lang, 1) : null;
  const src = sourceLink(v.sourceUrl);
  const diff = v.liveDR !== null && v.projDR !== null ? v.liveDR - v.projDR : null;
  const stamp = etStamp(view.at, lang);

  return (
    <section class="container usr" aria-labelledby={`usr-${raceId}`} data-status={v.status}>
      <h2 id={`usr-${raceId}`} class="usr-h">{v.call ? t.called : t.counting}</h2>
      {v.call ? (
        <p class="usr-winner" style={`--usr-color:${colorOf(v.call.party)}`}>
          <Check color={colorOf(v.call.party)} /><span>{t.wins(who)}</span>
        </p>
      ) : top && lead !== null ? (
        <p class="usr-winner is-leading" style={`--usr-color:${colorOf(top.party)}`}><span>{t.leads(who, lead)}</span></p>
      ) : null}
      {v.call?.at && <p class="usr-meta">{t.callAt(etStamp(v.call.at, lang))}</p>}

      {v.candidates.length > 0 ? (
        <div class="table-scroll">
          <table class="usr-table">
            <thead><tr><th>{t.cols[0]}</th><th>{t.cols[1]}</th><th class="num">{t.cols[2]}</th><th class="num">{t.cols[3]}</th></tr></thead>
            <tbody>
              {v.candidates.map((c, i) => (
                <tr key={`${c.party}-${i}`} class={i === 0 && v.call ? 'is-winner' : ''}>
                  <th scope="row"><span class="usr-dot" style={`background:${colorOf(c.party)}`} aria-hidden="true"></span>{c.name}</th>
                  <td>{partyName(c.party)}</td>
                  <td class="num">{num(c.votes, lang)}</td>
                  <td class="num">
                    <span class="usr-bar" aria-hidden="true"><i style={`width:${Math.max(0, Math.min(100, c.pct))}%;background:${colorOf(c.party)}`}></i></span>
                    {pct(c.pct, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p class="usr-meta">{t.none[v.status] ?? t.none.awaiting}</p>
      )}

      {v.candidates.length > 0 && (
        <p class="usr-meta">
          {v.reportedPct !== null ? `${t.reported(lang === 'en' ? `${num(v.reportedPct, lang)}%` : `${num(v.reportedPct, lang)} %`)} · ` : ''}
          {t.votes(num(v.votes, lang))}
        </p>
      )}
      {v.liveDR !== null && v.projDR !== null && diff !== null && (
        <p class="usr-proj">
          {t.proj(drLabel(v.projDR, lang), drLabel(v.liveDR, lang))}
          {Math.abs(diff) < 0.5 ? t.inLine : t.diff(num(Math.abs(diff), lang, 1), diff > 0 ? 'dem' : 'rep', Math.abs(diff))}
        </p>
      )}
      <p class="usr-source">
        {src ? <>{t.source}<a class="vs-link" href={src.href} rel="noopener" target="_blank">{src.host}</a>{stamp ? `, ${t.asOf(stamp)}` : ''}. </> : null}
        <a class="vs-link" href={allRacesHref}>{t.all}</a>
      </p>
    </section>
  );
}
