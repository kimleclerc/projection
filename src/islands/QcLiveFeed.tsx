import { useMemo } from 'preact/hooks';
import { deriveRows, numFmt, outcomeLabel, outcomeOf, timeFmt, useLive, type Locale, type PartyInfo, type RidingInfo } from './qcLiveBus';

/** Dernières annonces, courses les plus serrées, gains par rapport à 2022. Rien avant les premiers résultats. */
const copy = {
  fr: { calls: 'Dernières annonces', close: 'Les courses les plus serrées', gains: 'Circonscriptions qui changent de parti', noCalls: 'Aucun gagnant annoncé pour l’instant.',
        noClose: 'Les écarts apparaîtront avec les premiers bureaux.', in: 'dans', from: 'sur', ahead: 'd’avance', polls: 'bureaux', seats: 'sièges' },
  en: { calls: 'Latest calls', close: 'Closest races', gains: 'Seats changing hands', noCalls: 'No winner called yet.',
        noClose: 'Margins will appear with the first polls.', in: 'in', from: 'from', ahead: 'ahead', polls: 'polls', seats: 'seats' },
  es: { calls: 'Últimos anuncios', close: 'Las contiendas más ajustadas', gains: 'Distritos que cambian de partido', noCalls: 'Todavía no se ha anunciado ningún ganador.',
        noClose: 'Las diferencias aparecerán con las primeras mesas.', in: 'en', from: 'sobre', ahead: 'de ventaja', polls: 'mesas', seats: 'escaños' },
};

export default function QcLiveFeed({ lang, parties, ridings }: { lang: Locale; parties: PartyInfo[]; ridings: RidingInfo[] }) {
  const t = copy[lang];
  const { data } = useLive();
  const pmap = useMemo(() => new Map(parties.map((p) => [p.code, p])), [parties]);
  const rinfo = useMemo(() => new Map(ridings.map((r) => [r.id, r])), [ridings]);
  const rows = useMemo(() => deriveRows(data), [data]);
  if (!data || !rows.some((r) => r.party)) return null;

  const latest = rows.filter((r) => r.call).sort((a, b) => (b.call?.called_at ?? '').localeCompare(a.call?.called_at ?? '')).slice(0, 6);
  const close = rows.filter((r) => !r.call && r.margin !== null).sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0)).slice(0, 6);
  const gains = new Map<string, number>();
  for (const r of rows) {
    const w = rinfo.get(r.id)?.holder ?? rinfo.get(r.id)?.winner2022;
    if (r.party && w && r.party !== w) gains.set(r.party, (gains.get(r.party) ?? 0) + 1);
  }
  const label = (code: string | null) => (code ? pmap.get(code)?.label ?? code.toUpperCase() : '');
  const dot = (code: string | null) => <i class="qlf-dot" style={`background:${code ? pmap.get(code)?.color ?? '#90a4ae' : '#cfd8dc'}`}></i>;
  const link = (id: string, name: string) => <a href={rinfo.get(id)?.href ?? '#'}>{rinfo.get(id)?.name ?? name}</a>;

  return (
    <div class="qlf">
      <div class="qlf-col">
        <h3>{t.calls}</h3>
        {latest.length === 0 ? <p class="qlf-empty">{t.noCalls}</p> : (
          <ol>{latest.map((r) => {
            const o = outcomeOf(r.call, rinfo.get(r.id));
            return <li key={r.id}>{dot(r.party)}<span><strong>{r.call?.candidate_name}</strong> ({label(r.party)}){' '}
              {o && <em class={`qlf-outcome is-${o.kind}`}>{outcomeLabel(o, lang)}{o.kind === 'gain' && o.from ? ` ${t.from} ${label(o.from)}` : ''}</em>}{' '}
              {t.in} {link(r.id, r.name)}</span><time>{timeFmt(r.call?.called_at, lang)}</time></li>;
          })}</ol>
        )}
      </div>
      <div class="qlf-col">
        <h3>{t.close}</h3>
        {close.length === 0 ? <p class="qlf-empty">{t.noClose}</p> : (
          <ol>{close.map((r) => <li key={r.id}>{dot(r.party)}<span>{link(r.id, r.name)} — {label(r.party)} {numFmt(r.margin ?? 0, lang)} pt {t.ahead}</span>
            <small>{r.polls?.total ? `${r.polls.reported ?? 0}/${r.polls.total} ${t.polls}` : ''}</small></li>)}</ol>
        )}
      </div>
      {gains.size > 0 && (
        <div class="qlf-gains">
          <h3>{t.gains}</h3>
          <ul>{[...gains.entries()].sort((a, b) => b[1] - a[1]).map(([code, n]) => <li key={code}>{dot(code)}{label(code)} <strong>+{n}</strong></li>)}</ul>
        </div>
      )}
    </div>
  );
}
