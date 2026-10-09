/**
 * Scénarios enregistrés du simulateur, dans le navigateur du lecteur. Chaque
 * scénario garde ses curseurs, sa date ET les sièges obtenus à l'enregistrement :
 * quand la projection du jour change, on ne réécrit pas le scénario en silence,
 * on montre les deux résultats côte à côte.
 */
import { useEffect, useState } from 'preact/hooks';

type Lang = 'fr' | 'en' | 'es';
interface Saved { id: string; name: string; sim: string; at: string; run: string; seats: Record<string, number> }
interface Party { code: string; label: string }
interface Props {
  locale: Lang;
  cycle: string;
  runDate: string;
  parties: Party[];
  current: string;                      // état encodé courant ('' = curseurs au repos)
  seatsNow: Record<string, number>;     // sièges du scénario courant
  seatsFor: (sim: string) => Record<string, number>; // sièges d'un scénario avec la projection du jour
  onOpen: (sim: string) => void;
}

const T = {
  fr: {
    title: 'Mes scénarios', save: 'Enregistrer ce scénario', name: 'Nom du scénario', open: 'Ouvrir', remove: 'Supprimer',
    defaultName: (d: string) => `Scénario du ${d}`, savedOn: 'Enregistré le', withRun: 'projection du',
    today: 'Avec la projection d’aujourd’hui', same: 'Même résultat avec la projection d’aujourd’hui.',
    note: 'Enregistrés dans ce navigateur seulement.', full: 'Vingt scénarios au plus : supprimez-en un pour en ajouter.',
  },
  en: {
    title: 'My scenarios', save: 'Save this scenario', name: 'Scenario name', open: 'Open', remove: 'Delete',
    defaultName: (d: string) => `Scenario of ${d}`, savedOn: 'Saved on', withRun: 'forecast of',
    today: 'With today’s forecast', same: 'Same result with today’s forecast.',
    note: 'Saved in this browser only.', full: 'Twenty scenarios at most: delete one to add another.',
  },
  es: {
    title: 'Mis escenarios', save: 'Guardar este escenario', name: 'Nombre del escenario', open: 'Abrir', remove: 'Eliminar',
    defaultName: (d: string) => `Escenario del ${d}`, savedOn: 'Guardado el', withRun: 'proyección del',
    today: 'Con la proyección de hoy', same: 'El mismo resultado con la proyección de hoy.',
    note: 'Guardados solo en este navegador.', full: 'Veinte escenarios como máximo: elimine uno para añadir otro.',
  },
};
const MAX = 20;

export default function SavedScenarios({ locale, cycle, runDate, parties, current, seatsNow, seatsFor, onOpen }: Props) {
  const t = T[locale];
  const key = `vs:scenarios:v1:${cycle}`;
  const [list, setList] = useState<Saved[] | null>(null);
  const [name, setName] = useState('');

  const date = (iso: string) => iso
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    : '';
  const line = (seats: Record<string, number>) => parties
    .filter((p) => (seats[p.code] ?? 0) >= 0.5)
    .sort((a, b) => (seats[b.code] ?? 0) - (seats[a.code] ?? 0))
    .map((p) => `${p.label} ${Math.round(seats[p.code])}`)
    .join(' · ');
  const round = (s: Record<string, number>) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, Math.round(v)]));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      setList(Array.isArray(parsed) ? parsed : []);
    } catch {
      setList(null); // stockage indisponible : le bloc ne s'affiche pas
    }
  }, [key]);

  const persist = (next: Saved[]) => {
    try { window.localStorage.setItem(key, JSON.stringify(next)); setList(next); } catch { /* quota */ }
  };

  if (list === null) return null;
  const today = new Date().toISOString().slice(0, 10);

  const save = () => {
    if (!current || list.length >= MAX) return;
    persist([{ id: `${Date.now()}`, name: name.trim() || t.defaultName(date(today)), sim: current, at: today, run: runDate, seats: round(seatsNow) }, ...list]);
    setName('');
  };

  return (
    <section class="msim-saved" aria-labelledby="msim-saved-title">
      <h3 id="msim-saved-title">{t.title}</h3>
      {current && (
        list.length >= MAX ? <p class="vs-meta">{t.full}</p> : (
          <form class="msim-saved-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <label>
              <span class="sr-only">{t.name}</span>
              <input type="text" maxLength={60} placeholder={t.defaultName(date(today))} value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
            </label>
            <button type="submit" class="vs-btn-secondary">{t.save}</button>
          </form>
        )
      )}
      {list.length > 0 && (
        <ul class="msim-saved-list">
          {list.map((s) => {
            const now = round(seatsFor(s.sim));
            const changed = s.run !== runDate && parties.some((p) => (now[p.code] ?? 0) !== (s.seats[p.code] ?? 0));
            return (
              <li>
                <div class="msim-saved-head">
                  <strong>{s.name}</strong>
                  <span class="vs-meta">{t.savedOn} {date(s.at)} · {t.withRun} {date(s.run)}</span>
                </div>
                <p>{line(s.seats)}</p>
                {s.run !== runDate && <p class="vs-meta">{changed ? `${t.today} : ${line(now)}`.replace(' : ', locale === 'fr' ? ' : ' : ': ') : t.same}</p>}
                <p class="msim-saved-actions">
                  <button type="button" class="vs-link" onClick={() => onOpen(s.sim)}>{t.open}</button>
                  <button type="button" class="vs-link" onClick={() => persist(list.filter((x) => x.id !== s.id))}>{t.remove}</button>
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p class="vs-meta">{t.note}</p>
    </section>
  );
}
