import { useEffect, useState } from 'preact/hooks';
import '../styles/wc.css';

// Scores en direct du tournoi mondial 2026 via l'API publique de scoreboard ESPN.
// Aucune clé requise. Repli gracieux si indisponible/vide. Langage générique
// (noms de pays), aucune marque/logo officiel — le disclaimer de non-affiliation
// vit sur la page hôte.
type Lang = 'en' | 'fr' | 'es';

interface Props {
  lang: Lang;
  // Filtre optionnel par codes ESPN d'abréviation OU noms (insensible casse).
  teamFilter?: string[];
  limit?: number;
}

interface ScoreRow {
  id: string;
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  state: 'pre' | 'in' | 'post';
  detail: string;
  date: string;
}

const ESPN_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

const T: Record<Lang, Record<string, string>> = {
  en: { title: 'Live scores', live: 'LIVE', loading: 'Loading scores…', empty: 'No matches in progress right now. Check the full schedule below.', err: 'Live scores are unavailable right now — see the schedule below.', source: 'Live data: ESPN public feed. Vote-Scope is not affiliated with any tournament rights-holder.', final: 'Final' },
  fr: { title: 'Scores en direct', live: 'EN DIRECT', loading: 'Chargement des scores…', empty: 'Aucun match en cours. Consultez le calendrier complet ci-dessous.', err: 'Scores en direct indisponibles pour l’instant — voir le calendrier ci-dessous.', source: 'Données en direct : flux public ESPN. Vote-Scope n’est affilié à aucun détenteur de droits du tournoi.', final: 'Terminé' },
  es: { title: 'Marcadores en vivo', live: 'EN VIVO', loading: 'Cargando marcadores…', empty: 'No hay partidos en curso ahora. Consulta el calendario completo abajo.', err: 'Los marcadores en vivo no están disponibles ahora — ver el calendario abajo.', source: 'Datos en vivo: feed público de ESPN. Vote-Scope no está afiliado a ningún titular de derechos del torneo.', final: 'Final' },
};

function parseEvents(json: any): ScoreRow[] {
  const events = Array.isArray(json?.events) ? json.events : [];
  const rows: ScoreRow[] = [];
  for (const ev of events) {
    const comp = ev?.competitions?.[0];
    if (!comp) continue;
    const competitors = comp.competitors ?? [];
    const home = competitors.find((c: any) => c.homeAway === 'home') ?? competitors[0];
    const away = competitors.find((c: any) => c.homeAway === 'away') ?? competitors[1];
    if (!home || !away) continue;
    const stateRaw = ev?.status?.type?.state as string;
    const state: ScoreRow['state'] = stateRaw === 'in' ? 'in' : stateRaw === 'post' ? 'post' : 'pre';
    rows.push({
      id: String(ev.id),
      home: home.team?.shortDisplayName ?? home.team?.displayName ?? home.team?.abbreviation ?? '?',
      away: away.team?.shortDisplayName ?? away.team?.displayName ?? away.team?.abbreviation ?? '?',
      homeScore: home.score ?? '',
      awayScore: away.score ?? '',
      state,
      detail: ev?.status?.type?.shortDetail ?? '',
      date: ev?.date ?? '',
    });
  }
  return rows;
}

function rank(r: ScoreRow): number {
  if (r.state === 'in') return 0;
  if (r.state === 'pre') return 1;
  return 2;
}

export default function WcLiveScores({ lang, teamFilter, limit = 8 }: Props) {
  const t = T[lang];
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [error, setError] = useState(false);

  async function load() {
    try {
      const res = await fetch(ESPN_URL, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      let parsed = parseEvents(json);
      if (teamFilter && teamFilter.length) {
        const wanted = teamFilter.map((s) => s.toLowerCase());
        parsed = parsed.filter(
          (r) =>
            wanted.some((w) => r.home.toLowerCase().includes(w) || r.away.toLowerCase().includes(w)),
        );
      }
      parsed.sort((a, b) => rank(a) - rank(b) || a.date.localeCompare(b.date));
      setRows(parsed.slice(0, limit));
      setError(false);
    } catch {
      setError(true);
      setRows([]);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000); // rafraîchit chaque minute
    return () => clearInterval(id);
  }, []);

  const hasLive = rows?.some((r) => r.state === 'in');

  return (
    <div class="wc-live">
      <p class="wc-live-head">
        <span class="wc-live-title">{t.title}</span>
        {hasLive && <span class="wc-live-badge">{t.live}</span>}
      </p>

      {rows === null && <p class="wc-live-msg">{t.loading}</p>}
      {rows !== null && rows.length === 0 && (
        <p class="wc-live-msg">{error ? t.err : t.empty}</p>
      )}

      {rows !== null && rows.length > 0 && (
        <ul class="wc-live-list">
          {rows.map((r) => (
            <li class={`wc-live-row ${r.state === 'in' ? 'is-live' : ''}`} key={r.id}>
              <span class="wc-live-teams">
                <span>{r.home}</span>
                <span class="wc-live-score">
                  {r.state === 'pre' ? '—' : `${r.homeScore}–${r.awayScore}`}
                </span>
                <span>{r.away}</span>
              </span>
              <span class="wc-live-status">
                {r.state === 'in' ? r.detail : r.state === 'post' ? t.final : r.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p class="wc-live-source">{t.source}</p>
    </div>
  );
}
