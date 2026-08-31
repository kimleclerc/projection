import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  projectFeatures,
  type GeoFeatureLike,
  type ProjectedShape,
} from '../lib/mapProjection';

export interface RidingFull {
  riding_id: string;
  name_en: string;
  name_fr: string;
  href?: string;
  province: string | null;
  projection: {
    winner: string;
    p_winner: number;
    mean_margin: number;
    p_close_race: number;
    vote_mean: Record<string, number>;
    win_prob: Record<string, number>;
  };
  baseline: {
    winner: string | null;
    margin: number | null;
    turnout_pct: number | null;
  } | null;
  /** Présent quand une partielle est en cours dans cette circonscription.
   *  Le scrutin qui arrive D'ABORD prime à l'affichage : sans ça, la carte
   *  annonçait un vainqueur (prochaine générale) et le desk de partielle un
   *  autre, pour le même siège. `projection` reste la prochaine générale,
   *  dont dépend l'arithmétique des sièges. */
  byelection?: {
    election_date: string | null;
    leading_party: string | null;
    p_leading: number | null;
    p_close_race: number | null;
    mean_margin: number | null;
    vote_mean: Record<string, number>;
    has_local_poll?: boolean;
  } | null;
}

export interface MapParty {
  key: string;
  label_en: string;
  label_fr: string;
  color: string;
}

interface Props {
  geoUrl: string;
  ridings: RidingFull[];
  parties: MapParty[];
  locale: 'en' | 'fr';
  center?: [number, number];
  zoom?: number;
  /** clé de la propriété GeoJSON qui matche `riding_id` (défaut 'FEDNUM') */
  idProp?: string;
  baselineYear?: number;
  /** 'winner' (défaut) = remplissage par parti/bloc gagnant, comportement historique.
   *  'heat' = dégradé séquentiel d'une seule couleur selon `vote_mean[heatKey]`. */
  mode?: 'winner' | 'heat';
  /** Requis en mode 'heat' : clé dans `projection.vote_mean` à cartographier. */
  heatKey?: string;
  /** Requis en mode 'heat' : couleur de base du dégradé. */
  heatColor?: string;
  /** Borne haute de l'échelle en mode 'heat' (défaut = max observé sur `heatKey`). */
  heatMax?: number;
  /** Seuil de `p_winner` au-dessus duquel une circo est colorée par son vainqueur
   *  (mode 'winner'). Défaut 0.5 = comportement projection historique. Passer 0
   *  pour des RÉSULTATS réels où le vainqueur est une pluralité (< 50 %). */
  winnerThreshold?: number;
  /** Met à jour les styles et contenus des circonscriptions sans recréer la carte.
   *  Destiné aux outils où `ridings` change rapidement (simulateurs, résultats live). */
  reactive?: boolean;
  /** Circonscriptions à souligner, par exemple celles qui changent de camp. */
  highlightIds?: string[];
  /** Circonscriptions sur lesquelles recadrer la carte. Une carte du Québec au
   *  zoom d'ensemble rend les 33 circos de Montréal invisibles (moins de 10 px
   *  de côté) : recadrer sur la portée active est la seule façon de les voir.
   *  Vide = retour au cadrage d'ensemble (`center`/`zoom`). */
  focusIds?: string[];
  /** Hauteur maximale du canevas SVG. Défaut historique : 480 px. */
  height?: number;
  /** Présentation éditoriale d'un scénario personnel, sans probabilités de modèle. */
  scenario?: boolean;
}

interface LegendItem {
  key: string;
  label_en: string;
  label_fr: string;
  color: string;
  seats: number;
}

const fmtPct = (v: number) => `${(v * 100).toFixed(0)}%`;
// Defensive clamp: upstream pipeline can occasionally produce >100% values for uncontested races; cap at 100 for display.
const clampPct = (v: number) => Math.max(0, Math.min(100, v));

function idAliases(id: string): string[] {
  const clean = String(id ?? '').trim();
  if (!clean) return [];
  const aliases = new Set([clean]);
  if (/^\d+$/.test(clean)) {
    aliases.add(String(Number(clean)));
    aliases.add(clean.padStart(5, '0'));
  }
  return [...aliases];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPopupHtml(
  riding: RidingFull,
  parties: MapParty[],
  locale: 'en' | 'fr',
  baselineYear: number,
  winnerThreshold: number,
): string {
  const partyByKey = new Map(parties.map((p) => [p.key, p]));
  const labelOf = (key: string) =>
    partyByKey.get(key)?.[locale === 'fr' ? 'label_fr' : 'label_en'] ?? key;
  const colorOf = (key: string) => partyByKey.get(key)?.color ?? '#888';

  const name = locale === 'fr' ? riding.name_fr : riding.name_en;
  const winner = riding.projection.winner;
  const isTossup = winner === 'tossup' || riding.projection.p_winner < winnerThreshold;
  const winnerLabel = isTossup
    ? locale === 'fr'
      ? 'Indécis'
      : 'Tossup'
    : labelOf(winner);
  const winnerColor = isTossup ? '#888' : colorOf(winner);

  // Sort vote shares descending, drop near-zeros (<0.5%).
  const votes = Object.entries(riding.projection.vote_mean)
    .filter(([, v]) => v >= 0.5)
    .sort((a, b) => b[1] - a[1]);

  // Une partielle en cours PRIME sur la projection de la prochaine générale :
  // c'est le scrutin qui arrive d'abord, et c'est celui que le desk publie.
  const byel = riding.byelection ?? null;
  const hasByel = Boolean(byel && byel.leading_party);

  const t = {
    currentProjection:
      hasByel
        ? locale === 'fr' ? 'Prochaine générale' : 'Next general election'
        : locale === 'fr' ? 'Projection actuelle' : 'Current projection',
    byelection: locale === 'fr' ? 'Partielle' : 'By-election',
    byelectionDate: locale === 'fr' ? 'Scrutin' : 'Polling day',
    localPoll: locale === 'fr' ? 'Sondage local' : 'Local poll',
    yes: locale === 'fr' ? 'oui' : 'yes',
    pWin: locale === 'fr' ? 'P(victoire)' : 'P(win)',
    closeRace: locale === 'fr' ? 'Course serrée' : 'Close race',
    margin: locale === 'fr' ? 'Marge' : 'Margin',
    turnout: locale === 'fr' ? 'Participation' : 'Turnout',
    baseline:
      locale === 'fr'
        ? `Référence ${baselineYear}`
        : `${baselineYear} baseline`,
    winner: locale === 'fr' ? 'Vainqueur' : 'Winner',
  };

  const voteRows = votes
    .map(
      ([k, v]) =>
        `<div class="rm-pop-row"><span style="color:${colorOf(k)};font-weight:500;">${escapeHtml(labelOf(k))}</span><span class="rm-pop-num">${clampPct(v).toFixed(1)}%</span></div>`,
    )
    .join('');

  const stats = [
    [t.pWin, fmtPct(riding.projection.p_winner)],
    [t.closeRace, fmtPct(riding.projection.p_close_race)],
    [t.margin, `${riding.projection.mean_margin.toFixed(1)}%`],
  ];
  if (riding.baseline?.turnout_pct != null) {
    stats.push([t.turnout, `${riding.baseline.turnout_pct.toFixed(1)}%`]);
  }
  const statRows = stats
    .map(
      ([k, v]) =>
        `<div class="rm-pop-row"><span class="rm-pop-key">${escapeHtml(k)}</span><span class="rm-pop-num">${escapeHtml(v)}</span></div>`,
    )
    .join('');

  let baselineBlock = '';
  if (riding.baseline && riding.baseline.winner) {
    const blWinner = labelOf(riding.baseline.winner);
    const blMargin =
      riding.baseline.margin != null
        ? `${riding.baseline.margin.toFixed(1)}%`
        : '—';
    baselineBlock = `
      <div class="rm-pop-eyebrow">${escapeHtml(t.baseline)}</div>
      <div class="rm-pop-row"><span class="rm-pop-key">${escapeHtml(t.winner)}</span><span style="color:${colorOf(riding.baseline.winner)};font-weight:500;">${escapeHtml(blWinner)}</span></div>
      <div class="rm-pop-row"><span class="rm-pop-key">${escapeHtml(t.margin)}</span><span class="rm-pop-num">${escapeHtml(blMargin)}</span></div>`;
  }

  // Bloc partielle, affiché AVANT la générale quand il existe.
  let byelectionBlock = '';
  let pillWinner = winner;
  let pillLabel = winnerLabel;
  let pillColor = winnerColor;
  if (hasByel && byel) {
    // La pastille annonce le meneur de la PARTIELLE : c'est le scrutin à venir.
    pillWinner = byel.leading_party as string;
    pillLabel = labelOf(pillWinner);
    pillColor = colorOf(pillWinner);
    const byVotes = Object.entries(byel.vote_mean || {})
      .filter(([, v]) => v >= 0.5)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([k, v]) =>
          `<div class="rm-pop-row"><span style="color:${colorOf(k)};font-weight:500;">${escapeHtml(labelOf(k))}</span><span class="rm-pop-num">${clampPct(v).toFixed(1)}%</span></div>`,
      )
      .join('');
    const byStats: [string, string][] = [];
    if (byel.p_leading != null) byStats.push([t.pWin, fmtPct(byel.p_leading)]);
    if (byel.election_date) byStats.push([t.byelectionDate, byel.election_date]);
    if (byel.has_local_poll) byStats.push([t.localPoll, t.yes]);
    const byStatRows = byStats
      .map(
        ([k, v]) =>
          `<div class="rm-pop-row"><span class="rm-pop-key">${escapeHtml(k)}</span><span class="rm-pop-num">${escapeHtml(v)}</span></div>`,
      )
      .join('');
    byelectionBlock = `
      <div class="rm-pop-eyebrow rm-pop-eyebrow-byel">${escapeHtml(t.byelection)}</div>
      ${byVotes}
      ${byStatRows}
      <div class="rm-pop-sep"></div>`;
  }

  const provinceTag = riding.province
    ? `<span class="rm-pop-province">${escapeHtml(riding.province)}</span>`
    : '';

  return `
    <div class="rm-pop">
      <div class="rm-pop-head">
        <h3 class="rm-pop-title">${escapeHtml(name)}</h3>
        ${provinceTag}
      </div>
      <div class="rm-pop-pill" style="border-color:${pillColor};color:${pillColor};">
        <span class="rm-pop-dot" style="background:${pillColor};"></span>${escapeHtml(pillLabel)}
      </div>
      ${byelectionBlock}
      <div class="rm-pop-eyebrow">${escapeHtml(t.currentProjection)}</div>
      ${voteRows}
      <div class="rm-pop-sep"></div>
      ${statRows}
      ${baselineBlock}
    </div>`;
}

function buildAriaLabel(
  riding: RidingFull,
  parties: MapParty[],
  locale: 'en' | 'fr',
  winnerThreshold: number,
): string {
  const name = locale === 'fr' ? riding.name_fr : riding.name_en;
  const partyByKey = new Map(parties.map((p) => [p.key, p]));
  const winner = riding.projection.winner;
  const isTossup = winner === 'tossup' || riding.projection.p_winner < winnerThreshold;
  const winnerLabel = isTossup
    ? locale === 'fr'
      ? 'indécis'
      : 'tossup'
    : (partyByKey.get(winner)?.[locale === 'fr' ? 'label_fr' : 'label_en'] ??
      winner);
  const pct = (riding.projection.p_winner * 100).toFixed(0);
  return locale === 'fr'
    ? `${name} : ${winnerLabel} (probabilité ${pct} %)`
    : `${name}: ${winnerLabel} (${pct}% probability)`;
}

function buildScenarioPopupHtml(
  riding: RidingFull,
  parties: MapParty[],
  locale: 'en' | 'fr',
): string {
  const partyByKey = new Map(parties.map((party) => [party.key, party]));
  const labelOf = (key: string) =>
    partyByKey.get(key)?.[locale === 'fr' ? 'label_fr' : 'label_en'] ?? key;
  const colorOf = (key: string) => partyByKey.get(key)?.color ?? '#888';
  const name = locale === 'fr' ? riding.name_fr : riding.name_en;
  const winner = riding.projection.winner;
  const voteRows = Object.entries(riding.projection.vote_mean)
    .filter(([, value]) => value >= .5)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) =>
      `<div class="rm-pop-row"><span style="color:${colorOf(key)};font-weight:500;">${escapeHtml(labelOf(key))}</span><span class="rm-pop-num">${clampPct(value).toFixed(1)}%</span></div>`,
    ).join('');
  const published = riding.baseline?.winner
    ? `<div class="rm-pop-eyebrow">${locale === 'fr' ? 'Projection publiée' : 'Published projection'}</div>
       <div class="rm-pop-row"><span class="rm-pop-key">${locale === 'fr' ? 'Gagnant' : 'Winner'}</span><span style="color:${colorOf(riding.baseline.winner)};font-weight:500;">${escapeHtml(labelOf(riding.baseline.winner))}</span></div>`
    : '';

  return `<div class="rm-pop">
    <div class="rm-pop-head"><h3 class="rm-pop-title">${escapeHtml(name)}</h3></div>
    <div class="rm-pop-pill" style="border-color:${colorOf(winner)};color:${colorOf(winner)};">
      <span class="rm-pop-dot" style="background:${colorOf(winner)};"></span>${escapeHtml(labelOf(winner))}
    </div>
    <div class="rm-pop-eyebrow">${locale === 'fr' ? 'Votre scénario' : 'Your scenario'}</div>
    ${voteRows}
    <div class="rm-pop-sep"></div>
    <div class="rm-pop-row"><span class="rm-pop-key">${locale === 'fr' ? 'Marge' : 'Margin'}</span><span class="rm-pop-num">${riding.projection.mean_margin.toFixed(1)}%</span></div>
    ${published}
  </div>`;
}

function buildScenarioAriaLabel(
  riding: RidingFull,
  parties: MapParty[],
  locale: 'en' | 'fr',
): string {
  const party = parties.find((item) => item.key === riding.projection.winner);
  const label = party?.[locale === 'fr' ? 'label_fr' : 'label_en'] ?? riding.projection.winner;
  const name = locale === 'fr' ? riding.name_fr : riding.name_en;
  return locale === 'fr'
    ? `${name} : ${label}, marge ${riding.projection.mean_margin.toFixed(1)} % dans votre scénario`
    : `${name}: ${label}, ${riding.projection.mean_margin.toFixed(1)}% margin in your scenario`;
}

// ── Mode 'heat' : dégradé séquentiel mono-couleur ─────────────────────────
// fillOpacity varie linéairement de 0.12 (0 %) à 0.92 (heatMax), même formule
// pour le remplissage des circonscriptions et les graduations de la légende.
const HEAT_OPACITY_MIN = 0.12;
const HEAT_OPACITY_MAX = 0.92;

function heatOpacity(value: number, max: number): number {
  if (!(max > 0)) return HEAT_OPACITY_MIN;
  const t = Math.max(0, Math.min(1, value / max));
  return HEAT_OPACITY_MIN + t * (HEAT_OPACITY_MAX - HEAT_OPACITY_MIN);
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const fmtPct1 = (v: number, locale: 'en' | 'fr') =>
  `${v.toFixed(1).replace('.', locale === 'fr' ? ',' : '.')}%`;

function buildHeatPopupHtml(
  riding: RidingFull,
  parties: MapParty[],
  locale: 'en' | 'fr',
  heatKey: string,
  heatColor: string,
): string {
  const partyByKey = new Map(parties.map((p) => [p.key, p]));
  const labelOf = (key: string) =>
    partyByKey.get(key)?.[locale === 'fr' ? 'label_fr' : 'label_en'] ?? key;
  const colorOf = (key: string) => partyByKey.get(key)?.color ?? '#888';

  const name = locale === 'fr' ? riding.name_fr : riding.name_en;
  const heatValue = riding.projection.vote_mean[heatKey] ?? 0;

  const others = Object.entries(riding.projection.vote_mean)
    .filter(([k, v]) => k !== heatKey && v >= 0.5)
    .sort((a, b) => b[1] - a[1]);

  const t = {
    otherKeys: locale === 'fr' ? 'Autres' : 'Others',
  };

  const otherRows = others
    .map(
      ([k, v]) =>
        `<div class="rm-pop-row"><span style="color:${colorOf(k)};font-weight:500;">${escapeHtml(labelOf(k))}</span><span class="rm-pop-num">${clampPct(v).toFixed(1)}%</span></div>`,
    )
    .join('');

  const provinceTag = riding.province
    ? `<span class="rm-pop-province">${escapeHtml(riding.province)}</span>`
    : '';

  return `
    <div class="rm-pop">
      <div class="rm-pop-head">
        <h3 class="rm-pop-title">${escapeHtml(name)}</h3>
        ${provinceTag}
      </div>
      <div class="rm-pop-heat-big" style="color:${heatColor};">
        <span class="rm-pop-heat-label">${escapeHtml(labelOf(heatKey))}</span>
        <span class="rm-pop-heat-value">${fmtPct1(clampPct(heatValue), locale)}</span>
      </div>
      <div class="rm-pop-eyebrow">${escapeHtml(t.otherKeys)}</div>
      ${otherRows}
    </div>`;
}

function buildHeatAriaLabel(
  riding: RidingFull,
  parties: MapParty[],
  locale: 'en' | 'fr',
  heatKey: string,
): string {
  const name = locale === 'fr' ? riding.name_fr : riding.name_en;
  const partyByKey = new Map(parties.map((p) => [p.key, p]));
  const label =
    partyByKey.get(heatKey)?.[locale === 'fr' ? 'label_fr' : 'label_en'] ??
    heatKey;
  const value = fmtPct1(clampPct(riding.projection.vote_mean[heatKey] ?? 0), locale);
  return locale === 'fr' ? `${name} : ${label} ${value}` : `${name}: ${label} ${value}`;
}

export default function RidingsMap({
  geoUrl,
  ridings,
  parties,
  locale,
  center,
  zoom,
  idProp,
  baselineYear = 2025,
  mode = 'winner',
  heatKey,
  heatColor,
  heatMax,
  winnerThreshold = 0.5,
  reactive = false,
  highlightIds = [],
  focusIds = [],
  height = 480,
  scenario = false,
}: Props) {
  const mapWidth = 1000;
  const mapHeight = 620;
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<GeoFeatureLike[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Compute legend items (outside useEffect, reactive to props)
  const legendItems: LegendItem[] = [];
  for (const p of parties) {
    const seats = ridings.filter(
      (r) =>
        r.projection.winner === p.key && r.projection.p_winner >= winnerThreshold,
    ).length;
    if (seats > 0) {
      legendItems.push({
        key: p.key,
        label_en: p.label_en,
        label_fr: p.label_fr,
        color: p.color,
        seats,
      });
    }
  }
  const tossupCount = ridings.filter(
    (r) =>
      r.projection.winner === 'tossup' || r.projection.p_winner < winnerThreshold,
  ).length;
  if (tossupCount > 0) {
    legendItems.push({
      key: 'tossup',
      label_en: 'Tossup',
      label_fr: 'Indécis',
      color: '#bbb',
      seats: tossupCount,
    });
  }

  // Mode 'heat' : borne haute + 4 graduations de légende (0 → heatMax).
  const heatMaxResolved =
    mode === 'heat'
      ? (heatMax ??
        Math.max(0, ...ridings.map((r) => r.projection.vote_mean[heatKey ?? ''] ?? 0)))
      : 0;
  const heatStops =
    mode === 'heat'
      ? [0, heatMaxResolved / 3, (2 * heatMaxResolved) / 3, heatMaxResolved]
      : [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) {
          throw new Error(`Failed to load GeoJSON: ${geoRes.status}`);
        }
        const geo = await geoRes.json();
        if (!cancelled) setFeatures(Array.isArray(geo?.features) ? geo.features : []);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [geoUrl]);

  const prop = idProp ?? 'FEDNUM';
  const ridingById = useMemo(() => {
    const lookup = new Map<string, RidingFull>();
    for (const riding of ridings) {
      for (const alias of idAliases(riding.riding_id)) lookup.set(alias, riding);
    }
    return lookup;
  }, [ridings]);
  const partyColor = useMemo(
    () => new Map(parties.map((party) => [party.key, party.color])),
    [parties],
  );
  const highlighted = useMemo(
    () => new Set(highlightIds.flatMap(idAliases)),
    [highlightIds],
  );
  const projected = useMemo(
    () => projectFeatures(features, geoUrl, prop, {
      center: center ?? [56, -96],
      width: mapWidth,
      height: mapHeight,
      padding: 22,
    }),
    [features, geoUrl, prop, center?.[0], center?.[1]],
  );

  const viewBox = useMemo(() => {
    if (!focusIds.length || !projected.length) return `0 0 ${mapWidth} ${mapHeight}`;
    const wanted = new Set(focusIds.flatMap(idAliases));
    const matches = projected.filter((shape) => wanted.has(featureIdFor(shape, prop)));
    if (!matches.length) return `0 0 ${mapWidth} ${mapHeight}`;
    const x0 = Math.min(...matches.map((shape) => shape.bounds[0]));
    const y0 = Math.min(...matches.map((shape) => shape.bounds[1]));
    const x1 = Math.max(...matches.map((shape) => shape.bounds[2]));
    const y1 = Math.max(...matches.map((shape) => shape.bounds[3]));
    const pad = Math.max(18, Math.max(x1 - x0, y1 - y0) * .08);
    const width = Math.max(120, x1 - x0 + pad * 2);
    const height = Math.max(120, y1 - y0 + pad * 2);
    return `${x0 - pad} ${y0 - pad} ${width} ${height}`;
  }, [focusIds.join(','), projected, prop]);

  const selected = selectedId ? ridingById.get(selectedId) ?? null : null;
  const selectedHtml = selected
    ? mode === 'heat' && heatKey
      ? buildHeatPopupHtml(selected, parties, locale, heatKey, heatColor ?? '#888')
      : scenario
        ? buildScenarioPopupHtml(selected, parties, locale)
        : buildPopupHtml(selected, parties, locale, baselineYear, winnerThreshold)
    : '';
  const insetLabels = [...new Set(projected.map((shape) => shape.inset).filter(Boolean))] as string[];

  function styleFor(shape: ProjectedShape) {
    const id = featureIdFor(shape, prop);
    const riding = ridingById.get(id);
    const isHighlighted = highlighted.has(id);
    if (mode === 'heat') {
      const value = riding?.projection.vote_mean[heatKey ?? ''] ?? 0;
      return {
        fill: hexToRgba(heatColor ?? '#888', riding ? heatOpacity(value, heatMaxResolved) : HEAT_OPACITY_MIN),
        stroke: isHighlighted ? '#171714' : '#fff',
        strokeWidth: isHighlighted ? 2.5 : .72,
      };
    }
    const fill = riding && riding.projection.winner !== 'tossup' && riding.projection.p_winner >= winnerThreshold
      ? partyColor.get(riding.projection.winner) ?? '#bbb'
      : '#bbb';
    return { fill, stroke: isHighlighted ? '#171714' : '#fff', strokeWidth: isHighlighted ? 2.5 : .72 };
  }

  return (
    <div class="pe-chart-wrap" data-analytics-event="projection_map_interaction" data-analytics-once="true">
      {error && (
        <p class="pe-chart-error" role="status">
          {error}
        </p>
      )}
      {!error && !features.length && (
        <p class="pe-chart-loading" role="status">
          {locale === 'fr' ? 'Chargement de la carte…' : 'Loading map…'}
        </p>
      )}
      <div
        class="rm-stage"
        style={`--rm-height:${height}px;`}
        role="region"
        aria-label={
          locale === 'fr' ? 'Carte des circonscriptions' : 'Riding map'
        }
      >
        <svg
          class="rm-svg"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <g class="rm-geography">
            {projected.map((shape, index) => {
              const id = featureIdFor(shape, prop);
              const riding = ridingById.get(id);
              const style = styleFor(shape);
              const aria = riding
                ? mode === 'heat' && heatKey
                  ? buildHeatAriaLabel(riding, parties, locale, heatKey)
                  : scenario
                    ? buildScenarioAriaLabel(riding, parties, locale)
                    : buildAriaLabel(riding, parties, locale, winnerThreshold)
                : undefined;
              return (
                <path
                  key={`${id}-${index}`}
                  d={shape.path}
                  fill={style.fill}
                  stroke={style.stroke}
                  stroke-width={style.strokeWidth}
                  vector-effect="non-scaling-stroke"
                  fill-rule="evenodd"
                  class={`rm-district${selectedId === id ? ' is-selected' : ''}`}
                  role={riding ? 'button' : undefined}
                  tabindex={riding ? 0 : undefined}
                  aria-label={aria}
                  onClick={() => riding && setSelectedId(id)}
                  onKeyDown={(event) => {
                    if (riding && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      setSelectedId(id);
                    }
                  }}
                >
                  {riding && <title>{aria}</title>}
                </path>
              );
            })}
          </g>
          {insetLabels.map((label) => {
            const shapes = projected.filter((shape) => shape.inset === label);
            const x = Math.min(...shapes.map((shape) => shape.bounds[0]));
            const y = Math.min(...shapes.map((shape) => shape.bounds[1]));
            return <text key={label} x={x} y={Math.max(12, y - 6)} class="rm-inset-label">{label}</text>;
          })}
        </svg>
        {selected && (
          <aside class="rm-detail-card" aria-live="polite">
            <button
              class="rm-detail-close"
              type="button"
              aria-label={locale === 'fr' ? 'Fermer les détails' : 'Close details'}
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
            <div dangerouslySetInnerHTML={{ __html: selectedHtml }} />
          </aside>
        )}
      </div>
      {mode === 'heat' ? (
        <div
          class="pe-heat-legend"
          style="margin:18px 0 0;font-family:var(--mono,monospace);font-size:12px;max-width:360px;"
        >
          <div
            class="pe-heat-gradient"
            style={`height:10px;border-radius:3px;background:linear-gradient(to right, ${hexToRgba(heatColor ?? '#888', HEAT_OPACITY_MIN)}, ${hexToRgba(heatColor ?? '#888', HEAT_OPACITY_MAX)});`}
          />
          <div
            class="pe-heat-ticks"
            style="display:flex;justify-content:space-between;margin-top:6px;color:var(--ink-3,#888);"
          >
            {heatStops.map((v, i) => (
              <span key={i}>{fmtPct1(v, locale)}</span>
            ))}
          </div>
        </div>
      ) : (
        <ul
          class="pe-legend"
          style="list-style:none;padding:0;margin:18px 0 0;display:flex;flex-wrap:wrap;gap:10px 18px;font-family:var(--mono,monospace);font-size:12px;"
        >
          {legendItems.map((item) => (
            <li
              key={item.key}
              style="display:inline-flex;align-items:center;gap:8px;"
            >
              <span
                class="pe-legend-swatch"
                style={`display:inline-block;width:12px;height:12px;border-radius:3px;background:${item.color};`}
              />
              <span class="pe-legend-name" style="color:var(--ink-2,#333);">
                {locale === 'fr' ? item.label_fr : item.label_en}
              </span>
              <span
                class="pe-legend-value"
                style="color:var(--ink-3,#888);margin-left:4px;"
              >
                {item.seats}
              </span>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .rm-stage { position: relative; width: 100%; min-height: min(var(--rm-height), 62vw); background: var(--paper, #fff); overflow: hidden; }
        .rm-svg { display: block; width: 100%; height: min(var(--rm-height), 62vw); min-height: 280px; touch-action: manipulation; }
        .rm-district { cursor: pointer; transition: filter 120ms ease, stroke-width 120ms ease; outline: none; }
        .rm-district:hover, .rm-district:focus-visible, .rm-district.is-selected { filter: brightness(.88); stroke: var(--ink, #171714); stroke-width: 2.4; }
        .rm-district:focus-visible { filter: drop-shadow(0 0 2px rgba(0,0,0,.5)); }
        .rm-inset-label { font-family: var(--mono, ui-monospace, monospace); font-size: 13px; fill: var(--ink-3, #777); }
        .rm-detail-card { position: absolute; left: 18px; right: 18px; bottom: 14px; z-index: 3; max-width: 560px; padding: 16px 44px 16px 18px; background: rgba(255,255,255,.97); border: 1px solid var(--rule, #d8d8d2); box-shadow: 0 4px 18px rgba(0,0,0,.22); }
        .rm-detail-close { position: absolute; right: 10px; top: 8px; width: 32px; height: 32px; border: 0; background: transparent; color: var(--ink-2, #555); font: 24px/1 var(--sans, sans-serif); cursor: pointer; }
        .rm-pop { font-family: var(--mono, ui-monospace, monospace); font-size: 12px; line-height: 1.4; color: var(--ink, #1a1a1a); }
        .rm-pop-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
        .rm-pop-title { font-family: var(--serif, Georgia, serif); font-size: 18px; font-weight: 600; margin: 0; flex: 1 1 auto; }
        .rm-pop-province { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3, #888); }
        .rm-pop-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border: 1px solid; border-radius: 999px; font-size: 11px; font-weight: 600; margin-bottom: 12px; }
        .rm-pop-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
        .rm-pop-eyebrow { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3, #888); margin: 10px 0 6px; }
        .rm-pop-eyebrow-byel { color: var(--ink, #1a1a1a); font-weight: 700; }
        .rm-pop-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 2px 0; }
        .rm-pop-key { color: var(--ink-2, #555); }
        .rm-pop-num { font-weight: 600; color: var(--ink, #1a1a1a); font-variant-numeric: tabular-nums; }
        .rm-pop-sep { height: 1px; background: var(--rule, #e5e5e0); margin: 8px 0 4px; }
        .rm-pop-heat-big { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
        .rm-pop-heat-label { font-family: var(--serif, Georgia, serif); font-size: 15px; font-weight: 500; }
        .rm-pop-heat-value { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
        @media (max-width: 640px) {
          .rm-stage { min-height: 330px; overflow: visible; }
          .rm-svg { height: auto; min-height: 330px; }
          .rm-detail-card { position: absolute; left: 8px; right: 8px; bottom: 8px; max-height: 72%; overflow: auto; padding: 13px 40px 13px 14px; }
          .rm-pop-title { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}

function featureIdFor(shape: ProjectedShape, idProp: string): string {
  const raw = String(shape.feature.properties?.[idProp] ?? shape.feature.properties?.riding_id ?? '');
  const aliases = idAliases(raw);
  return aliases[0] ?? raw;
}
