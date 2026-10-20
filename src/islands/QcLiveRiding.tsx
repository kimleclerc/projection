import { useMemo } from 'preact/hooks';
import { awaitsFinalCount, deriveRows, numFmt, oodLabel, outcomeLabel, outcomeOf, timeFmt, useLive, type Locale, type PartyInfo, type RidingInfo } from './qcLiveBus';

/**
 * Résultat en direct d'UNE circonscription, en tête de sa page. Avant 20 h :
 * un rendez-vous (et le lien vers la page de soirée). Le soir : les candidats,
 * les bureaux dépouillés et le statut. Les données viennent de l'îlot principal
 * monté en mode invisible sur la même page.
 */
const copy = {
  fr: { title: 'Résultats en direct', before: (n: string) => `Les résultats de ${n} s’afficheront ici dès la fermeture des bureaux, à 20 h le 5 octobre.`,
        waiting: 'En attente des premiers bureaux de cette circonscription.', elected: 'Élu', leading: 'En tête', polls: 'bureaux dépouillés',
        updated: 'Données de', at: 'appel à', all: 'Tous les résultats du Québec',
        ood: 'Bulletins d’absents', finalNote: 'Toutes les boîtes sont dépouillées, mais l’écart est trop mince pour annoncer un gagnant ce soir : le vote postal tardif et les bulletins d’absents seront comptés au dépouillement final, une semaine plus tard.',
        finalPhase: 'Dépouillement final' },
  en: { title: 'Live results', before: (n: string) => `Results for ${n} will appear here when polls close at 8 p.m. on October 5.`,
        waiting: 'Waiting for the first polls in this riding.', elected: 'Elected', leading: 'Leading', polls: 'polls counted',
        updated: 'Data as of', at: 'called at', all: 'All Quebec results',
        ood: 'Absentee ballots', finalNote: 'Every box is counted, but the margin is too thin to call a winner tonight: late mail-in and absentee ballots are counted at the final count, a week later.',
        finalPhase: 'Final count' },
  es: { title: 'Resultados en directo', before: (n: string) => `Los resultados de ${n} aparecerán aquí al cierre de las urnas, a las 20:00 del 5 de octubre.`,
        waiting: 'A la espera de las primeras mesas de este distrito.', elected: 'Electo', leading: 'En cabeza', polls: 'mesas escrutadas',
        updated: 'Datos de las', at: 'anunciado a las', all: 'Todos los resultados de Quebec',
        ood: 'Papeletas de ausentes', finalNote: 'Todas las urnas están escrutadas, pero la diferencia es demasiado estrecha para anunciar un ganador esta noche: el voto por correo tardío y las papeletas de ausentes se cuentan en el recuento final, una semana después.',
        finalPhase: 'Recuento final' },
};

export default function QcLiveRiding({ lang, ridingId, name, parties, resultsHref, info, timeZone, text, beforeText }:
  { lang: Locale; ridingId: string; name: string; parties: PartyInfo[]; resultsHref: string;
    /** Sortant, détenteur et genres (src/data/qc-live-ridings.json) pour « réélu·e / élu·e / gain ». */
    info?: RidingInfo;
    timeZone?: string;
    /** Textes d'une autre soirée : rendez-vous, lien de retour. */
    /** Pas de fonction ici : les props d'un îlot sont sérialisées. */
    text?: Partial<Omit<typeof copy.fr, 'before'>>;
    /** Rendez-vous d'avant-scrutin d'une autre soirée, nom déjà inséré. */
    beforeText?: string }) {
  const t = { ...copy[lang], ...text };
  const { data } = useLive();
  const pmap = useMemo(() => new Map(parties.map((p) => [p.code, p])), [parties]);
  const result = data?.results.find((r) => r.riding_id === ridingId) ?? null;
  const row = useMemo(() => deriveRows(data).find((r) => r.id === ridingId) ?? null, [data, ridingId]);
  const cands = result ? [...result.candidates].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)) : [];
  const counted = cands.some((c) => (c.votes ?? 0) > 0);
  const pendingFinal = awaitsFinalCount(data, row);

  return (
    <section class="qlr container">
      <div class="qlr-box">
        <div class="qlr-head">
          <span class="qlr-label"><i></i>{t.title}</span>
          {counted && data?.source?.source_updated_at && <span class="qlr-stamp">{data.source.count_phase === 'final' ? `${t.finalPhase} · ` : ''}{t.updated} {timeFmt(data.source.source_updated_at, lang, timeZone)}</span>}
        </div>
        {!data ? <p class="qlr-state">{beforeText ?? t.before(name)}</p> : !counted ? <p class="qlr-state">{t.waiting}</p> : (
          <>
            <ul class="qlr-cands">
              {cands.slice(0, 6).map((c, i) => {
                const p = pmap.get(c.party_code);
                const o = i === 0 ? outcomeOf(row?.call ?? null, info) : null;
                const status = i === 0 ? (o ? `${outcomeLabel(o, lang)}${o.kind === 'gain' && o.from ? ` (${pmap.get(o.from)?.label ?? o.from.toUpperCase()})` : ''} · ${t.at} ${timeFmt(row?.call?.called_at, lang, timeZone)}` : t.leading) : null;
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
            {result?.polls?.total || result?.out_of_district ? <p class="qlr-polls">
              {result.polls?.total ? `${result.polls.reported ?? 0}/${result.polls.total} ${t.polls}` : null}
              {result.polls?.total && result.out_of_district ? ' · ' : null}
              {result.out_of_district ? <>{t.ood}{lang === 'fr' ? ' : ' : ': '}{oodLabel(result.out_of_district, lang)}</> : null}</p> : null}
            {pendingFinal && <p class="qlr-final">{t.finalNote}</p>}
          </>
        )}
        <a class="qlr-all" href={resultsHref}>{t.all}</a>
      </div>
    </section>
  );
}
