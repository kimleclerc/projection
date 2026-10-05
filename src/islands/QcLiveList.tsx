import { useMemo, useState } from 'preact/hooks';
import { deriveRows, numFmt, outcomeLabel, outcomeOf, timeFmt, useLive, type Locale, type PartyInfo, type RidingInfo } from './qcLiveBus';

/**
 * Les 127 circonscriptions : recherche, filtres, 25 lignes puis « voir tout ».
 * Une liste courte par défaut laisse le lecteur atteindre la suite de la page
 * (et ses publicités) sans faire défiler 127 lignes.
 */
const PAGE = 25;
const copy = {
  fr: { title: 'Toutes les circonscriptions', search: 'Chercher une circonscription', all: 'Toutes', close: 'Serrées', gains: 'Gains', elected: 'Élues',
        riding: 'Circonscription', leader: 'En tête', pct: '%', margin: 'Écart', polls: 'Bureaux', status: 'Statut',
        calledBadge: 'Élu·e', leadingBadge: 'En tête', gainBadge: 'Gain', more: (n: number) => `Voir les ${n} circonscriptions`, less: 'Réduire la liste', none: '—' },
  en: { title: 'All ridings', search: 'Find a riding', all: 'All', close: 'Close', gains: 'Gains', elected: 'Elected',
        riding: 'Riding', leader: 'Leading', pct: '%', margin: 'Margin', polls: 'Polls', status: 'Status',
        calledBadge: 'Elected', leadingBadge: 'Leading', gainBadge: 'Gain', more: (n: number) => `Show all ${n} ridings`, less: 'Show fewer', none: '—' },
  es: { title: 'Todos los distritos', search: 'Buscar un distrito', all: 'Todos', close: 'Ajustados', gains: 'Ganancias', elected: 'Electos',
        riding: 'Distrito', leader: 'En cabeza', pct: '%', margin: 'Diferencia', polls: 'Mesas', status: 'Estado',
        calledBadge: 'Electo', leadingBadge: 'En cabeza', gainBadge: 'Ganancia', more: (n: number) => `Ver los ${n} distritos`, less: 'Ver menos', none: '—' },
};
type Filter = 'all' | 'close' | 'gains' | 'elected';

export default function QcLiveList({ lang, parties, ridings }: { lang: Locale; parties: PartyInfo[]; ridings: RidingInfo[] }) {
  const t = copy[lang];
  const { data } = useLive();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');
  const [open, setOpen] = useState(false);
  const pmap = useMemo(() => new Map(parties.map((p) => [p.code, p])), [parties]);
  const rows = useMemo(() => {
    const live = new Map(deriveRows(data).map((r) => [r.id, r]));
    return ridings.map((rd) => ({ rd, r: live.get(rd.id) ?? null })).sort((a, b) => a.rd.name.localeCompare(b.rd.name, 'fr'));
  }, [data, ridings]);
  if (!data || !rows.some((x) => x.r?.party)) return null;

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const holderOf = (x: typeof rows[number]) => x.rd.holder ?? x.rd.winner2022;
  const isGain = (x: typeof rows[number]) => !!x.r?.party && !!holderOf(x) && x.r.party !== holderOf(x);
  let shown = rows.filter((x) => !q || norm(x.rd.name).includes(norm(q)));
  if (f === 'close') shown = shown.filter((x) => x.r && !x.r.call && x.r.margin !== null && x.r.margin < 5).sort((a, b) => (a.r!.margin ?? 0) - (b.r!.margin ?? 0));
  if (f === 'gains') shown = shown.filter(isGain);
  if (f === 'elected') shown = shown.filter((x) => x.r?.call);
  const total = shown.length;
  if (!open && !q) shown = shown.slice(0, PAGE);

  return (
    <div class="qll">
      <div class="qll-head">
        <h2>{t.title}</h2>
        <input type="search" placeholder={t.search} value={q} aria-label={t.search} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
        <div class="qll-filters" role="group">
          {(['all', 'close', 'gains', 'elected'] as Filter[]).map((k) => <button key={k} type="button" class={f === k ? 'is-on' : ''} onClick={() => setF(k)}>{t[k]}</button>)}
        </div>
      </div>
      <table>
        <thead><tr><th>{t.riding}</th><th>{t.leader}</th><th class="num">{t.pct}</th><th class="num">{t.margin}</th><th class="num">{t.polls}</th><th>{t.status}</th></tr></thead>
        <tbody>
          {shown.map(({ rd, r }) => {
            const p = r?.party ? pmap.get(r.party) : null;
            return (
              <tr key={rd.id} class={r?.call ? 'is-called' : ''}>
                <td><a href={rd.href}>{rd.name}</a></td>
                <td>{r?.leader ? <><i class="qll-dot" style={`background:${p?.color ?? '#90a4ae'}`}></i>{r.leader.candidate_name} <small>{p?.label ?? r.leader.party_code.toUpperCase()}</small></> : <span class="qll-muted">{t.none}</span>}</td>
                <td class="num">{r?.leader ? numFmt(r.leader.vote_pct ?? 0, lang) : ''}</td>
                <td class="num">{r?.margin != null ? `+${numFmt(r.margin, lang)}` : ''}</td>
                <td class="num">{r?.polls?.total ? `${r.polls.reported ?? 0}/${r.polls.total}` : ''}</td>
                <td>{(() => {
                  const o = outcomeOf(r?.call ?? null, rd);
                  if (o) return <><span class={`qll-badge is-called is-${o.kind}`}>{outcomeLabel(o, lang)}</span>
                    <small class="qll-time">{timeFmt(r?.call?.called_at, lang)}</small></>;
                  return <>{r?.leader ? <span class="qll-badge">{t.leadingBadge}</span> : null}
                    {isGain({ rd, r }) && <span class="qll-badge is-gain">{t.gainBadge}</span>}</>;
                })()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!q && total > PAGE && <button type="button" class="qll-more" onClick={() => setOpen(!open)}>{open ? t.less : t.more(total)}</button>}
    </div>
  );
}
