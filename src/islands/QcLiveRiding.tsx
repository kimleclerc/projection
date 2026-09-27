import { useMemo } from 'preact/hooks';
import { deriveRows, numFmt, timeFmt, useLive, type Locale, type PartyInfo } from './qcLiveBus';

/**
 * Résultat en direct d'UNE circonscription, en tête de sa page. Avant 20 h :
 * un rendez-vous (et le lien vers la page de soirée). Le soir : les candidats,
 * les bureaux dépouillés et le statut. Les données viennent de l'îlot principal
 * monté en mode invisible sur la même page.
 */
const copy = {
  fr: { title: 'Résultats en direct', before: (n: string) => `Les résultats de ${n} s’afficheront ici dès la fermeture des bureaux, à 20 h le 5 octobre.`,
        waiting: 'En attente des premiers bureaux de cette circonscription.', elected: 'Élu·e', leading: 'En tête', polls: 'bureaux dépouillés',
        updated: 'Données de', all: 'Tous les résultats du Québec →' },
  en: { title: 'Live results', before: (n: string) => `Results for ${n} will appear here when polls close at 8 p.m. on October 5.`,
        waiting: 'Waiting for the first polls in this riding.', elected: 'Elected', leading: 'Leading', polls: 'polls counted',
        updated: 'Data as of', all: 'All Quebec results →' },
  es: { title: 'Resultados en directo', before: (n: string) => `Los resultados de ${n} aparecerán aquí al cierre de las urnas, a las 20:00 del 5 de octubre.`,
        waiting: 'A la espera de las primeras mesas de este distrito.', elected: 'Electo', leading: 'En cabeza', polls: 'mesas escrutadas',
        updated: 'Datos de las', all: 'Todos los resultados de Quebec →' },
};

export default function QcLiveRiding({ lang, ridingId, name, parties, resultsHref }:
  { lang: Locale; ridingId: string; name: string; parties: PartyInfo[]; resultsHref: string }) {
  const t = copy[lang];
  const { data } = useLive();
  const pmap = useMemo(() => new Map(parties.map((p) => [p.code, p])), [parties]);
  const result = data?.results.find((r) => r.riding_id === ridingId) ?? null;
  const row = useMemo(() => deriveRows(data).find((r) => r.id === ridingId) ?? null, [data, ridingId]);
  const cands = result ? [...result.candidates].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)) : [];
  const counted = cands.some((c) => (c.votes ?? 0) > 0);

  return (
    <section class="qlr container">
      <div class="qlr-box">
        <div class="qlr-head">
          <span class="qlr-label"><i></i>{t.title}</span>
          {counted && data?.source?.source_updated_at && <span class="qlr-stamp">{t.updated} {timeFmt(data.source.source_updated_at, lang)}</span>}
        </div>
        {!data ? <p class="qlr-state">{t.before(name)}</p> : !counted ? <p class="qlr-state">{t.waiting}</p> : (
          <>
            <ul class="qlr-cands">
              {cands.slice(0, 6).map((c, i) => {
                const p = pmap.get(c.party_code);
                const status = i === 0 ? (row?.call ? t.elected : t.leading) : null;
                return (
                  <li key={`${c.party_code}-${c.candidate_name}`} class={i === 0 ? 'is-first' : ''}>
                    <span class="qlr-name"><i style={`background:${p?.color ?? '#90a4ae'}`}></i><strong>{c.candidate_name}</strong> <small>{p?.label ?? c.party_code.toUpperCase()}</small>
                      {status && <em class={row?.call ? 'is-called' : ''}>{status}</em>}</span>
                    <span class="qlr-num">{numFmt(c.vote_pct ?? 0, lang)} %<small>{(c.votes ?? 0).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA')}</small></span>
                    <b style={`width:${Math.min(100, c.vote_pct ?? 0)}%;background:${p?.color ?? '#90a4ae'}`}></b>
                  </li>
                );
              })}
            </ul>
            {result?.polls?.total ? <p class="qlr-polls">{result.polls.reported ?? 0}/{result.polls.total} {t.polls}</p> : null}
          </>
        )}
        <a class="qlr-all" href={resultsHref}>{t.all}</a>
      </div>
    </section>
  );
}
