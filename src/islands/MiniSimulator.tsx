import { useMemo, useState, useEffect } from 'preact/hooks';
import {
  simulate,
  simulateRidings,
  partyLabel,
  regionLabel,
  type SimDoc,
  type NationalDelta,
  type RegionalDelta,
} from '../lib/mini-sim';
import { readUrlParam, setUrlParam } from './lib/urlState';
import CopyLink from './lib/CopyLink';
import RidingsMap, { type MapParty, type RidingFull } from './RidingsMap';

export interface SimulatorMapConfig {
  geoUrl: string;
  center: [number, number];
  zoom: number;
  idProp: string;
  baselineYear: number;
}

interface Props {
  doc: SimDoc;
  locale: 'fr' | 'en' | 'es';
  map?: SimulatorMapConfig;
}

const COPY = {
  fr: {
    title: 'Bougez les chiffres',
    lede: 'Déplacez un parti et regardez les sièges suivre. Tout se calcule sur votre appareil.',
    national: 'Partout',
    scope: 'Où appliquer',
    reset: 'Tout remettre à zéro',
    seats: 'sièges',
    majority: 'majorité',
    published: 'projection publiée',
    untouched: 'Curseurs au repos : vous voyez exactement la projection du',
    regionalHint: (r: string) => `Les curseurs n'agissent que sur ${r}. Le reste du territoire ne bouge pas.`,
    disclaimer:
      "Ce n'est pas le modèle. C'est un raccourci ancré sur la projection du jour : au repos il affiche exactement nos chiffres publiés, et il s'en éloigne d'autant plus que vous poussez les curseurs. Pour une vraie projection, c'est la page principale.",
    travelNote: 'La course de chaque curseur correspond à ce que le modèle juge plausible.',
    map: 'Carte des circonscriptions dans votre scénario',
    moved: 'Ce qui vient de bouger',
    noMove: 'Aucune circonscription ne change encore de camp.',
    current: 'Projection publiée',
    scenario: 'Votre scénario',
    margin: 'Marge',
    changed: 'Bascule',
  },
  en: {
    title: 'Move the numbers',
    lede: 'Nudge a party and watch the seats follow. Everything runs on your device.',
    national: 'Everywhere',
    scope: 'Where to apply',
    reset: 'Reset everything',
    seats: 'seats',
    majority: 'majority',
    published: 'published projection',
    untouched: 'Sliders at rest: you are seeing exactly the projection from',
    regionalHint: (r: string) => `Sliders only affect ${r}. The rest stays put.`,
    disclaimer:
      "This is not the model. It is a shortcut anchored on today's projection: at rest it shows exactly our published numbers, and it drifts further the harder you push. For a real projection, see the main page.",
    travelNote: "Each slider's travel matches what the model considers plausible.",
    map: 'Riding map in your scenario',
    moved: 'What just moved',
    noMove: 'No riding has changed hands yet.',
    current: 'Published projection',
    scenario: 'Your scenario',
    margin: 'Margin',
    changed: 'Flip',
  },
  es: {
    title: 'Mueve las cifras',
    lede: 'Ajusta un partido y observa los escaños. Todo se calcula en tu dispositivo.',
    national: 'En todas partes',
    scope: 'Dónde aplicar',
    reset: 'Reiniciar todo',
    seats: 'escaños',
    majority: 'mayoría',
    published: 'proyección publicada',
    untouched: 'Controles en reposo: estás viendo exactamente la proyección del',
    regionalHint: (r: string) => `Los controles solo afectan a ${r}. El resto no se mueve.`,
    disclaimer:
      'Esto no es el modelo. Es un atajo anclado en la proyección de hoy: en reposo muestra exactamente nuestras cifras publicadas, y se aleja cuanto más fuerzas los controles. Para una proyección real, consulta la página principal.',
    travelNote: 'El recorrido de cada control corresponde a lo que el modelo considera plausible.',
    map: 'Mapa de distritos en tu escenario',
    moved: 'Lo que acaba de cambiar',
    noMove: 'Ningún distrito cambia de partido todavía.',
    current: 'Proyección publicada',
    scenario: 'Tu escenario',
    margin: 'Margen',
    changed: 'Cambio',
  },
} as const;

/** État → `?sim=caq:3.0,pq:-1.5|rest.caq:4.0` (vide = paramètre retiré). */
function encodeState(nat: NationalDelta, reg: RegionalDelta): string {
  const n = Object.entries(nat)
    .filter(([, v]) => Math.abs(v) > 0.05)
    .map(([k, v]) => `${k}:${v.toFixed(1)}`)
    .join(',');
  const r = Object.entries(reg)
    .flatMap(([rid, parties]) =>
      Object.entries(parties)
        .filter(([, v]) => Math.abs(v) > 0.05)
        .map(([k, v]) => `${rid}.${k}:${v.toFixed(1)}`),
    )
    .join(',');
  return [n, r].filter(Boolean).join('|');
}

function decodeState(raw: string | null, doc: SimDoc): [NationalDelta, RegionalDelta] {
  const nat: NationalDelta = {};
  const reg: RegionalDelta = {};
  if (!raw) return [nat, reg];

  const codes = new Set(doc.parties.map((p) => p.code));
  const regions = new Set(doc.regions.map((r) => r.id));
  const travel = new Map(doc.parties.map((p) => [p.code, p.travel]));

  for (const chunk of raw.split(/[|,]/)) {
    const [key, value] = chunk.split(':');
    const v = Number.parseFloat(value);
    if (!key || !Number.isFinite(v)) continue;
    const [a, b] = key.split('.');
    // Une valeur forgée est bornée à la course du curseur, jamais rejetée en
    // silence au point de casser le partage d'un lien.
    if (b === undefined && codes.has(a)) {
      nat[a] = Math.max(-travel.get(a)!, Math.min(travel.get(a)!, v));
    } else if (regions.has(a) && codes.has(b)) {
      const t = travel.get(b)!;
      (reg[a] ||= {})[b] = Math.max(-t, Math.min(t, v));
    }
  }
  return [nat, reg];
}

export default function MiniSimulator({ doc, locale, map }: Props) {
  const t = COPY[locale] ?? COPY.fr;
  const [nat, setNat] = useState<NationalDelta>({});
  const [reg, setReg] = useState<RegionalDelta>({});
  const [scope, setScope] = useState<string>('national');
  const [hydrated, setHydrated] = useState(false);

  // Lecture unique au mount : l'îlot est ensuite la source de vérité.
  useEffect(() => {
    const [n, r] = decodeState(readUrlParam('sim'), doc);
    if (Object.keys(n).length || Object.keys(r).length) {
      setNat(n);
      setReg(r);
      if (Object.keys(r).length && !Object.keys(n).length) setScope(Object.keys(r)[0]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const encoded = encodeState(nat, reg);
    setUrlParam('sim', encoded || null);
  }, [hydrated, nat, reg]);

  const seats = useMemo(() => simulate(doc, nat, reg), [doc, nat, reg]);
  const ridingStates = useMemo(() => simulateRidings(doc, nat, reg, locale), [doc, nat, reg, locale]);
  const partyByCode = useMemo(() => new Map(doc.parties.map((p) => [p.code, p])), [doc.parties]);
  const changedRidings = useMemo(
    () => ridingStates.filter((riding) => riding.changed).sort((a, b) => a.margin - b.margin),
    [ridingStates],
  );
  const mapParties = useMemo<MapParty[]>(() => doc.parties.map((party) => ({
    key: party.code,
    label_en: party.label_en,
    label_fr: party.label_fr,
    color: party.color,
  })), [doc.parties]);
  const mapRidings = useMemo<RidingFull[]>(() => ridingStates.map((riding) => {
    const source = doc.ridings.find((item) => item.id === riding.id);
    const winProb = Object.fromEntries(Object.keys(riding.shares).map((key) => [key, key === riding.winner ? 1 : 0]));
    return {
      riding_id: riding.id,
      name_fr: source?.name_fr ?? riding.name,
      name_en: source?.name_en ?? riding.name,
      province: null,
      projection: {
        winner: riding.winner,
        p_winner: 1,
        mean_margin: riding.margin,
        p_close_race: riding.margin < 5 ? 1 : 0,
        vote_mean: riding.shares,
        win_prob: winProb,
      },
      baseline: {
        winner: riding.baselineWinner,
        margin: riding.baselineMargin,
        turnout_pct: null,
      },
    };
  }), [doc.ridings, ridingStates]);
  const touched =
    Object.values(nat).some((v) => Math.abs(v) > 0.05) ||
    Object.values(reg).some((p) => Object.values(p).some((v) => Math.abs(v) > 0.05));

  const total = doc.meta.total_seats;
  const threshold = doc.meta.majority_threshold;
  // On masque les partis qui n'ont ni siège ni curseur (« autres » résiduels) :
  // une ligne à zéro qu'on ne peut pas bouger n'apprend rien.
  const ordered = [...doc.parties]
    .filter((p) => seats[p.code] >= 0.5 || p.national >= 1.5)
    .sort((a, b) => seats[b.code] - seats[a.code]);
  const activeRegion = doc.regions.find((r) => r.id === scope);

  const valueFor = (code: string) =>
    scope === 'national' ? (nat[code] ?? 0) : (reg[scope]?.[code] ?? 0);

  const setValue = (code: string, v: number) => {
    if (scope === 'national') setNat((prev) => ({ ...prev, [code]: v }));
    else setReg((prev) => ({ ...prev, [scope]: { ...(prev[scope] ?? {}), [code]: v } }));
  };

  const reset = () => {
    setNat({});
    setReg({});
  };

  const nf = (n: number, digits = 0) =>
    n.toLocaleString(locale === 'fr' ? 'fr-CA' : locale === 'es' ? 'es' : 'en-CA', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${nf(Math.abs(n), 1)}`;
  const label = (code: string) => {
    const party = partyByCode.get(code);
    return party ? partyLabel(party, locale) : code.toUpperCase();
  };
  return (
    <div class={`msim${map ? ' has-map' : ''}`} data-mini-simulator>
      <section class="msim-controls" aria-labelledby="msim-title">
      <header class="msim-head">
        <h2 id="msim-title">{t.title}</h2>
        <p>{t.lede}</p>
      </header>

      {/* Barre de sièges */}
      <div
        class="msim-bar"
        role="img"
        aria-label={ordered
          .filter((p) => seats[p.code] >= 0.5)
          .map((p) => `${partyLabel(p, locale)} ${Math.round(seats[p.code])}`)
          .join(', ')}
      >
        {ordered.map((p) => {
          const w = (seats[p.code] / total) * 100;
          if (w <= 0.15) return null;
          return (
            <span
              key={p.code}
              class="msim-bar-seg"
              style={{ width: `${w}%`, background: p.color }}
              title={`${partyLabel(p, locale)} · ${nf(seats[p.code], 1)}`}
            />
          );
        })}
        <span
          class="msim-bar-maj"
          style={{ left: `${(threshold / total) * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <p class="msim-maj-label">
        {nf(threshold)} {t.seats} = {t.majority}
      </p>

      {/* Sièges par parti */}
      <ul class="msim-seats">
        {ordered.map((p) => {
          const delta = seats[p.code] - p.seats_projected;
          const maj = seats[p.code] >= threshold;
          return (
            <li key={p.code} class={`msim-seat-row${maj ? ' is-majority' : ''}`}>
              <span class="msim-chip" style={{ background: p.color }} aria-hidden="true" />
              <span class="msim-seat-name">{partyLabel(p, locale)}</span>
              <span class="msim-seat-n">{nf(seats[p.code])}</span>
              <span class={`msim-seat-d${Math.abs(delta) < 0.05 ? ' is-flat' : delta > 0 ? ' is-up' : ' is-down'}`}>
                {Math.abs(delta) < 0.05 ? '—' : signed(delta)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Portée */}
      {doc.regions.length > 1 && (
        <div class="msim-scope" role="group" aria-label={t.scope}>
          <button
            type="button"
            class={`msim-scope-btn${scope === 'national' ? ' is-active' : ''}`}
            aria-pressed={scope === 'national'}
            onClick={() => setScope('national')}
          >
            {t.national}
          </button>
          {doc.regions.map((r) => (
            <button
              key={r.id}
              type="button"
              class={`msim-scope-btn${scope === r.id ? ' is-active' : ''}`}
              aria-pressed={scope === r.id}
              onClick={() => setScope(r.id)}
            >
              {regionLabel(r, locale)}
              <small>{r.n_ridings}</small>
            </button>
          ))}
        </div>
      )}

      {activeRegion && <p class="msim-hint">{t.regionalHint(regionLabel(activeRegion, locale))}</p>}

      {/* Curseurs */}
      <ul class="msim-sliders">
        {doc.parties
          .filter((p) => p.national >= 1.5)
          .map((p) => {
            const d = valueFor(p.code);
            const shown = scope === 'national'
              ? p.national + d
              : (activeRegion?.anchor[doc.parties.findIndex((q) => q.code === p.code)] ?? 0) + d;
            return (
              <li key={p.code} class="msim-slider-row">
                <label class="msim-slider-label" for={`msim-${scope}-${p.code}`}>
                  <span class="msim-chip" style={{ background: p.color }} aria-hidden="true" />
                  {partyLabel(p, locale)}
                </label>
                <input
                  id={`msim-${scope}-${p.code}`}
                  class="msim-range"
                  type="range"
                  min={-p.travel}
                  max={p.travel}
                  step={0.1}
                  value={d}
                  style={{ accentColor: p.color }}
                  aria-valuetext={`${nf(shown, 1)} %`}
                  onInput={(e) => setValue(p.code, Number.parseFloat((e.target as HTMLInputElement).value))}
                />
                <output class="msim-slider-val" for={`msim-${scope}-${p.code}`}>
                  {nf(shown, 1)} %
                  <small class={d > 0 ? 'is-up' : d < 0 ? 'is-down' : ''}>
                    {Math.abs(d) < 0.05 ? '' : signed(d)}
                  </small>
                </output>
              </li>
            );
          })}
      </ul>

      <div class="msim-actions">
        <button type="button" class="msim-reset" onClick={reset} disabled={!touched}>
          {t.reset}
        </button>
        {touched && <CopyLink locale={locale} />}
      </div>

      <p class="msim-anchor">
        {!touched && (
          <>
            <strong>{t.untouched}</strong> {doc.meta.run_date}.{' '}
          </>
        )}
        {t.travelNote}
      </p>
      <p class="msim-disclaimer">{t.disclaimer}</p>
      </section>

      {map && (
        <section class="msim-map-panel" aria-labelledby="msim-map-title">
          <div class="msim-map-head">
            <h2 id="msim-map-title">{t.map}</h2>
            <div class="msim-legend" aria-label="Légende">
              {doc.parties.filter((party) => party.national >= 1.5).map((party) => (
                <span key={party.code}>
                  <i style={{ background: party.color }} aria-hidden="true" />
                  {partyLabel(party, locale)}
                </span>
              ))}
            </div>
          </div>

          <div class="msim-map-stage">
            <RidingsMap
              geoUrl={map.geoUrl}
              ridings={mapRidings}
              parties={mapParties}
              locale={locale === 'fr' ? 'fr' : 'en'}
              center={map.center}
              zoom={map.zoom}
              idProp={map.idProp}
              baselineYear={map.baselineYear}
              winnerThreshold={0}
              scenario
              reactive
              highlightIds={changedRidings.map((riding) => riding.id)}
              height={620}
            />
          </div>

          <div class="msim-moves">
            <div class="msim-moves-head">
              <h3>{t.moved}</h3>
              <strong>{changedRidings.length}</strong>
            </div>
            {changedRidings.length ? (
              <div class="msim-move-rail">
                {changedRidings.slice(0, 12).map((riding) => (
                  <article
                    key={riding.id}
                  >
                    <span>{riding.name}</span>
                    <strong>{label(riding.baselineWinner)} → {label(riding.winner)}</strong>
                    <small>{t.margin} {nf(riding.margin, 1)} %</small>
                  </article>
                ))}
              </div>
            ) : <p class="msim-no-move">{t.noMove}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
