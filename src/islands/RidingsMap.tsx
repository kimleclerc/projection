import { useEffect, useRef, useState } from 'preact/hooks';

export interface RidingFull {
  riding_id: string;
  name_en: string;
  name_fr: string;
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

  const t = {
    currentProjection:
      locale === 'fr' ? 'Projection actuelle' : 'Current projection',
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

  const provinceTag = riding.province
    ? `<span class="rm-pop-province">${escapeHtml(riding.province)}</span>`
    : '';

  return `
    <div class="rm-pop">
      <div class="rm-pop-head">
        <h3 class="rm-pop-title">${escapeHtml(name)}</h3>
        ${provinceTag}
      </div>
      <div class="rm-pop-pill" style="border-color:${winnerColor};color:${winnerColor};">
        <span class="rm-pop-dot" style="background:${winnerColor};"></span>${escapeHtml(winnerLabel)}
      </div>
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
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);

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
    let mapInstance: any = null;

    // Inject popup CSS once per page (idempotent).
    if (
      typeof document !== 'undefined' &&
      !document.getElementById('rm-popup-style')
    ) {
      const style = document.createElement('style');
      style.id = 'rm-popup-style';
      style.textContent = `
.rm-popup .leaflet-popup-content { margin: 14px 16px; min-width: 220px; }
.rm-popup .leaflet-popup-content-wrapper { border-radius: 6px; }
.rm-pop { font-family: var(--mono, ui-monospace, monospace); font-size: 12px; line-height: 1.4; color: var(--ink, #1a1a1a); }
.rm-pop-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.rm-pop-title { font-family: var(--serif, Georgia, serif); font-size: 16px; font-weight: 500; margin: 0; flex: 1 1 auto; }
.rm-pop-province { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3, #888); }
.rm-pop-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border: 1px solid; border-radius: 999px; font-size: 11px; font-weight: 500; margin-bottom: 12px; }
.rm-pop-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.rm-pop-eyebrow { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3, #888); margin: 10px 0 6px; }
.rm-pop-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 2px 0; }
.rm-pop-key { color: var(--ink-2, #555); }
.rm-pop-num { font-weight: 500; color: var(--ink, #1a1a1a); font-variant-numeric: tabular-nums; }
.rm-pop-sep { height: 1px; background: var(--rule, #e5e5e0); margin: 8px 0 4px; }
.rm-pop-heat-big { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
.rm-pop-heat-label { font-family: var(--serif, Georgia, serif); font-size: 15px; font-weight: 500; }
.rm-pop-heat-value { font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
`;
      document.head.appendChild(style);
    }

    async function boot() {
      try {
        // Lazy-load Leaflet CSS
        (import('leaflet/dist/leaflet.css' as any) as Promise<any>).catch(
          () => {},
        );

        const [leafletModule, geoRes] = await Promise.all([
          import('leaflet'),
          fetch(geoUrl),
        ]);

        if (cancelled || !mapRef.current) return;

        if (!geoRes.ok) {
          throw new Error(`Failed to load GeoJSON: ${geoRes.status}`);
        }
        const geo = await geoRes.json();

        if (cancelled || !mapRef.current) return;

        const L = (leafletModule as any).default ?? leafletModule;

        const ridingById = new Map<string, RidingFull>();
        for (const riding of ridings) {
          for (const alias of idAliases(riding.riding_id)) {
            ridingById.set(alias, riding);
          }
        }
        const colorByParty = new Map(parties.map((p) => [p.key, p.color]));

        const prop = idProp ?? 'FEDNUM';
        const mapCenter: [number, number] = center ?? [56, -96];
        const mapZoom = zoom ?? 4;

        // Click-to-activate scroll zoom: start disabled, enable on click,
        // disable when clicking outside.
        mapInstance = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        }).setView(mapCenter, mapZoom);

        const enableZoom = () => {
          mapInstance.scrollWheelZoom.enable();
          setZoomActive(true);
        };
        const disableZoom = () => {
          mapInstance.scrollWheelZoom.disable();
          setZoomActive(false);
        };
        mapInstance.on('focus click', enableZoom);
        mapInstance.on('blur', disableZoom);
        const outsideClick = (e: MouseEvent) => {
          if (
            mapRef.current &&
            !mapRef.current.contains(e.target as Node)
          ) {
            disableZoom();
          }
        };
        document.addEventListener('click', outsideClick);
        // Stash on mapInstance so cleanup can remove
        (mapInstance as any).__outsideClick = outsideClick;

        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          {
            attribution: '© OpenStreetMap, © CARTO',
          },
        ).addTo(mapInstance);

        L.geoJSON(geo, {
          style(feature: any) {
            const id = String(feature?.properties?.[prop] ?? '');
            const riding = ridingById.get(id);
            if (mode === 'heat') {
              const value = riding ? riding.projection.vote_mean[heatKey ?? ''] ?? 0 : 0;
              return {
                fillColor: heatColor ?? '#888',
                color: '#fff',
                weight: 0.4,
                fillOpacity: riding ? heatOpacity(value, heatMaxResolved) : HEAT_OPACITY_MIN,
              };
            }
            let fillColor = '#bbb';
            if (
              riding &&
              riding.projection.winner !== 'tossup' &&
              riding.projection.p_winner >= winnerThreshold
            ) {
              fillColor =
                colorByParty.get(riding.projection.winner) ?? '#bbb';
            }
            return {
              fillColor,
              color: '#fff',
              weight: 0.4,
              fillOpacity: 0.85,
            };
          },
          onEachFeature(feature: any, layer: any) {
            const id = String(feature?.properties?.[prop] ?? '');
            const riding = ridingById.get(id);
            if (!riding) return;

            if (mode === 'heat' && heatKey) {
              layer.bindPopup(
                buildHeatPopupHtml(riding, parties, locale, heatKey, heatColor ?? '#888'),
                { maxWidth: 320, className: 'rm-popup' },
              );
              const partyByKey = new Map(parties.map((p) => [p.key, p]));
              const heatLabel =
                partyByKey.get(heatKey)?.[locale === 'fr' ? 'label_fr' : 'label_en'] ??
                heatKey;
              const heatValueStr = fmtPct1(
                clampPct(riding.projection.vote_mean[heatKey] ?? 0),
                locale,
              );
              const name = locale === 'fr' ? riding.name_fr : riding.name_en;
              layer.bindTooltip(
                `<strong>${escapeHtml(name)}</strong><br>${escapeHtml(String(heatLabel))} : ${heatValueStr}`,
                { sticky: true, direction: 'top' },
              );
              const el = layer.getElement?.();
              if (el && el.setAttribute) {
                el.setAttribute('aria-label', buildHeatAriaLabel(riding, parties, locale, heatKey));
                el.setAttribute('role', 'img');
                el.setAttribute('tabindex', '-1');
              }
              return;
            }

            layer.bindPopup(buildPopupHtml(riding, parties, locale, baselineYear, winnerThreshold), {
              maxWidth: 320,
              className: 'rm-popup',
            });
            // Also keep a brief tooltip on hover (name + party).
            const partyByKey = new Map(parties.map((p) => [p.key, p]));
            const winnerLabel =
              riding.projection.winner === 'tossup' ||
              riding.projection.p_winner < winnerThreshold
                ? locale === 'fr'
                  ? 'Indécis'
                  : 'Tossup'
                : (partyByKey.get(riding.projection.winner)?.[
                    locale === 'fr' ? 'label_fr' : 'label_en'
                  ] ?? riding.projection.winner);
            const name =
              locale === 'fr' ? riding.name_fr : riding.name_en;
            layer.bindTooltip(
              `<strong>${escapeHtml(name)}</strong><br>${escapeHtml(winnerLabel)}`,
              { sticky: true, direction: 'top' },
            );
            // a11y: aria-label on the SVG path.
            const el = layer.getElement?.();
            if (el && el.setAttribute) {
              el.setAttribute(
                'aria-label',
                buildAriaLabel(riding, parties, locale, winnerThreshold),
              );
              el.setAttribute('role', 'img');
              el.setAttribute('tabindex', '-1');
            }
          },
        }).addTo(mapInstance);

        setLoaded(true);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e));
      }
    }

    boot();
    return () => {
      cancelled = true;
      if (mapInstance) {
        try {
          if ((mapInstance as any).__outsideClick) {
            document.removeEventListener(
              'click',
              (mapInstance as any).__outsideClick,
            );
          }
          mapInstance.remove();
        } catch {
          /* noop */
        }
      }
    };
  }, [
    geoUrl,
    ridings,
    parties,
    locale,
    center,
    zoom,
    idProp,
    baselineYear,
    mode,
    heatKey,
    heatColor,
    heatMaxResolved,
  ]);

  const hint =
    locale === 'fr'
      ? 'Cliquez la carte pour activer le zoom à la molette'
      : 'Click the map to enable scroll-wheel zoom';

  return (
    <div class="pe-chart-wrap">
      {error && (
        <p class="pe-chart-error" role="status">
          {error}
        </p>
      )}
      {!error && !loaded && (
        <p class="pe-chart-loading" role="status">
          {locale === 'fr' ? 'Chargement de la carte…' : 'Loading map…'}
        </p>
      )}
      <div
        style="position:relative;"
        role="region"
        aria-label={
          locale === 'fr' ? 'Carte des circonscriptions' : 'Riding map'
        }
      >
        <div
          ref={mapRef}
          class="pe-map"
          style="height:480px;width:100%;border-radius:4px;"
        />
        {loaded && !zoomActive && (
          <div
            style="position:absolute;top:10px;right:50px;background:rgba(255,255,255,0.92);border:1px solid #ddd;border-radius:3px;padding:5px 9px;font-family:var(--mono,monospace);font-size:11px;color:#555;pointer-events:none;z-index:500;"
          >
            {hint}
          </div>
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
    </div>
  );
}
