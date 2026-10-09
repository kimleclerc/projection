/**
 * « Mes courses » : les courses suivies dans ce navigateur, avec le chiffre du
 * jour et ce qui a changé depuis la dernière visite. Les chiffres viennent des
 * résumés /data/follow/<scrutin>.json publiés à chaque calcul.
 *
 * « Depuis votre dernière visite » : quand un nouveau calcul paraît, la version
 * vue jusque-là devient la référence (prev) et la nouvelle devient « vue ». La
 * comparaison reste affichée jusqu'au calcul suivant, même si on recharge.
 */
import { useEffect, useState } from 'preact/hooks';
import { readFollows, writeFollows, followKey, FOLLOW_ELECTIONS, type Follow, type Lang, type Snap } from '../lib/follow';

type Parties = Record<string, Record<string, { l: string; c: string }>>;
interface Props { lang: Lang; parties: Parties }
interface Row extends Follow { now?: Snap; missing?: boolean }

const T = {
  fr: {
    empty: 'Vous ne suivez encore aucune course. Sur la page d’une circonscription, d’un district ou d’un siège, le bouton « Suivre cette course » l’ajoute ici.',
    start: 'Commencer par les scrutins en cours',
    colRace: 'Course', colNow: 'Aujourd’hui', colChange: 'Depuis votre dernière visite',
    noChange: 'Pas de changement', firstVisit: 'Suivie depuis le', newLeader: 'Nouveau favori. Le',
    elected: 'élu', final: 'Résultat', unfollow: 'Ne plus suivre', loading: 'Chargement des derniers calculs…',
    missing: 'Cette course n’est plus publiée.', calc: 'calcul du', storage: 'Votre navigateur ne permet pas d’enregistrer des courses (navigation privée ou stockage bloqué).',
    pts: 'pts', since: 'depuis le',
  },
  en: {
    empty: 'You are not following any race yet. On a riding, district or seat page, the “Follow this race” button adds it here.',
    start: 'Start with the current elections',
    colRace: 'Race', colNow: 'Today', colChange: 'Since your last visit',
    noChange: 'No change', firstVisit: 'Followed since', newLeader: 'New favourite. On',
    elected: 'won', final: 'Result', unfollow: 'Unfollow', loading: 'Loading the latest forecasts…',
    missing: 'This race is no longer published.', calc: 'forecast of', storage: 'Your browser does not allow saving races (private browsing or blocked storage).',
    pts: 'pts', since: 'since',
  },
  es: {
    empty: 'Todavía no sigue ninguna contienda. En la página de un distrito o de un escaño, el botón «Seguir esta contienda» la añade aquí.',
    start: 'Empezar por las elecciones en curso',
    colRace: 'Contienda', colNow: 'Hoy', colChange: 'Desde su última visita',
    noChange: 'Sin cambios', firstVisit: 'Seguida desde el', newLeader: 'Nuevo favorito. El',
    elected: 'ganó', final: 'Resultado', unfollow: 'Dejar de seguir', loading: 'Cargando los últimos cálculos…',
    missing: 'Esta contienda ya no se publica.', calc: 'cálculo del', storage: 'Su navegador no permite guardar contiendas (navegación privada o almacenamiento bloqueado).',
    pts: 'pts', since: 'desde el',
  },
};
const ELECTIONS_URL: Record<Lang, string> = { fr: '/fr/', en: '/en/', es: '/es/' };

export default function MyRaces({ lang, parties }: Props) {
  const t = T[lang];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [blocked, setBlocked] = useState(false);

  const pct = (p: number) => {
    const v = Math.round(p * 100);
    const s = v >= 100 ? (lang === 'en' ? '>99' : '> 99') : v <= 0 ? (lang === 'en' ? '<1' : '< 1') : String(v);
    return lang === 'en' ? `${s}%` : `${s} %`;
  };
  const date = (iso: string) => iso
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString(lang === 'en' ? 'en-CA' : lang === 'es' ? 'es-ES' : 'fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    : '';
  const party = (j: string, code: string) => parties[j]?.[code] ?? { l: code, c: '#999' };

  useEffect(() => {
    try { window.localStorage.getItem('vs:follows:v1'); } catch { setBlocked(true); return; }
    const follows = readFollows();
    if (follows.length === 0) { setRows([]); return; }
    const elections = [...new Set(follows.map((f) => f.j))];
    Promise.all(elections.map((j) =>
      fetch(`/data/follow/${j}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null).then((data) => [j, data] as const),
    )).then((pairs) => {
      const byJ = Object.fromEntries(pairs);
      const next: Row[] = follows.map((f) => {
        const data = byJ[f.j];
        if (!data) return { ...f };                       // réseau : on garde ce qu'on a
        const hit = data.races?.[f.id];
        if (!hit) return { ...f, missing: true };
        const now: Snap = { w: hit[0], p: hit[1], d: data.d, final: hit[2] === 1 };
        // Nouveau calcul depuis la dernière visite : l'ancienne vue devient la référence.
        if (now.d && now.d !== f.seen.d) return { ...f, prev: f.seen, seen: now, now };
        return { ...f, now };
      });
      writeFollows(next.map(({ now, missing, ...f }) => f));
      setRows(next);
    });
  }, []);

  const unfollow = (r: Row) => {
    const list = readFollows().filter((f) => followKey(f.j, f.id) !== followKey(r.j, r.id));
    writeFollows(list);
    setRows((rows ?? []).filter((x) => followKey(x.j, x.id) !== followKey(r.j, r.id)));
  };

  if (blocked) return <p>{t.storage}</p>;
  if (rows === null) return <p class="vs-meta">{t.loading}</p>;
  if (rows.length === 0) return (
    <div class="mr-empty">
      <p>{t.empty}</p>
      <p><a class="vs-link" href={ELECTIONS_URL[lang]}>{t.start}</a></p>
    </div>
  );

  const groups = [...new Set(rows.map((r) => r.j))];
  return (
    <div class="mr">
      {groups.map((j) => {
        const meta = FOLLOW_ELECTIONS[j];
        const list = rows.filter((r) => r.j === j);
        const d = list.find((r) => r.now)?.now?.d;
        return (
          <section class="mr-group">
            <h2>{meta?.label[lang] ?? j}</h2>
            {d && <p class="vs-meta">{list[0]?.now?.final ? t.final : `${t.calc} ${date(d)}`}</p>}
            <div class="mr-scroll">
              <table class="mr-table">
                <thead><tr><th scope="col">{t.colRace}</th><th scope="col">{t.colNow}</th><th scope="col">{t.colChange}</th><th scope="col"><span class="sr-only">{t.unfollow}</span></th></tr></thead>
                <tbody>
                  {list.map((r) => {
                    const cur = r.now ?? r.seen;
                    const p = party(j, cur.w);
                    let change: string;
                    if (r.missing) change = t.missing;
                    else if (!r.prev) change = `${t.firstVisit} ${date(r.at)}`;
                    else if (r.prev.w !== cur.w) change = `${t.newLeader} ${date(r.prev.d)} : ${party(j, r.prev.w).l} ${pct(r.prev.p)}`.replace(' : ', lang === 'fr' ? ' : ' : ': ');
                    else {
                      const delta = Math.round((cur.p - r.prev.p) * 100);
                      change = delta === 0 ? t.noChange : `${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${t.pts} ${t.since} ${date(r.prev.d)} (${pct(r.prev.p)} → ${pct(cur.p)})`;
                    }
                    return (
                      <tr>
                        <th scope="row"><a href={`${meta?.route[lang] ?? '/'}${r.slug}/`}>{r.name[lang] || r.name.en}</a></th>
                        <td><span class="mr-dot" style={`background:${p.c}`} aria-hidden="true"></span>{p.l} {cur.final ? t.elected : pct(cur.p)}</td>
                        <td class={r.prev && (r.prev.w !== cur.w || Math.abs(cur.p - r.prev.p) >= 0.1) ? 'mr-big' : undefined}>{change}</td>
                        <td><button type="button" class="vs-link mr-unfollow" onClick={() => unfollow(r)}>{t.unfollow}</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
