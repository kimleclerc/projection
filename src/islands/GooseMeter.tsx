import { useState } from 'preact/hooks';
import { GooseSvg } from './birds';

/* GooseMeter — Preact island for the Canada Goose Index (Bernache) hero meter.
 *
 * Positive mirror of DuckMeter: higher = stronger Canadian negotiating posture.
 * Two views (gauge / altitude), inline SVG with a flying Canada goose marker.
 * The goose climbs as Carney's position strengthens — the opposite motion of the
 * lame duck sinking into the bathtub.
 *
 * Typography (`.score`, `.eyebrow`, `.label`) inherits from lame-duck.css, shared
 * across instruments so the meter stays visually consistent.
 */

export interface GooseZone {
  min: number;
  max: number;
  label_en: string;
  label_fr: string;
  label_es?: string;
  color: string;
}

interface Props {
  score: number;
  locale: 'en' | 'fr' | 'es';
  zones: GooseZone[];
  defaultView?: 'gauge' | 'altitude';
  qualityNote?: string;
}

const T = {
  gauge: { en: 'Gauge', fr: 'Cadran', es: 'Medidor' },
  altitude: { en: 'Altitude', fr: 'Altitude', es: 'Altitud' },
  current: { en: 'Current reading', fr: 'Lecture actuelle', es: 'Lectura actual' },
  grounded: { en: '0 = grounded', fr: '0 = clouée au sol', es: '0 = en tierra' },
  honking: { en: '100 = honking', fr: '100 = klaxonne fort', es: '100 = graznido fuerte' },
};

const DEFAULT_ZONES: GooseZone[] = [
  { min: 0, max: 25, label_en: 'Grounded', label_fr: 'Clouée au sol', label_es: 'En tierra', color: 'var(--red)' },
  { min: 25, max: 50, label_en: 'Ruffled', label_fr: 'Plumes ébouriffées', label_es: 'Plumas erizadas', color: 'var(--duck-deep)' },
  { min: 50, max: 75, label_en: 'On the Wing', label_fr: 'En vol', label_es: 'En vuelo', color: 'oklch(0.62 0.12 170)' },
  { min: 75, max: 100, label_en: 'Honking', label_fr: 'Bernache qui klaxonne', label_es: 'Graznido fuerte', color: 'var(--blue)' },
];

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function activeZone(value: number, zones: GooseZone[]): GooseZone {
  return zones.find((z) => value >= z.min && value < z.max) ?? zones[zones.length - 1];
}

function zoneLabel(z: GooseZone, locale: 'en' | 'fr' | 'es'): string {
  if (locale === 'es') return z.label_es ?? z.label_en;
  return locale === 'fr' ? z.label_fr : z.label_en;
}

/* Flying Canada goose, side profile — server-friendly inline SVG.
 * Iconic markers: long black neck, black head with the white cheek "chinstrap",
 * pale chest, swept wings mid-beat. `flapping` hooks a CSS bob/flap animation. */
/* GooseSvg now lives in ./birds (shared with the CUSMA showdown). */

/* ─── Gauge view ─────────────────────────────────────────────────────────── */
function GaugeView({ value, zones, locale }: { value: number; zones: GooseZone[]; locale: 'en' | 'fr' | 'es' }) {
  const cx = 200;
  const cy = 190;
  const r = 150;
  const ri = 122;
  const toRad = (v: number) => ((180 - (v / 100) * 180) * Math.PI) / 180;
  const pt = (ang: number, radius: number): [number, number] => [cx + Math.cos(ang) * radius, cy - Math.sin(ang) * radius];

  function arc(from: number, to: number, R: number) {
    const a1 = toRad(from);
    const a2 = toRad(to);
    const [x1, y1] = pt(a1, R);
    const [x2, y2] = pt(a2, R);
    return { x1, y1, x2, y2, large: Math.abs(from - to) > 50 ? 1 : 0 };
  }

  const segPaths = zones.map((seg) => {
    const outer = arc(seg.min, seg.max, r);
    const inner = arc(seg.min, seg.max, ri);
    const active = value >= seg.min && value < seg.max;
    const d = `M ${outer.x1} ${outer.y1} A ${r} ${r} 0 ${outer.large} 1 ${outer.x2} ${outer.y2} L ${inner.x2} ${inner.y2} A ${ri} ${ri} 0 ${inner.large} 0 ${inner.x1} ${inner.y1} Z`;
    return (
      <path key={seg.min} d={d} fill={seg.color} opacity={active ? 1 : 0.22} style="transition:opacity .2s">
        <title>{zoneLabel(seg, locale)}</title>
      </path>
    );
  });

  const ticks = [0, 25, 50, 75, 100].map((tv) => {
    const a = toRad(tv);
    const [x1, y1] = pt(a, r + 6);
    const [x2, y2] = pt(a, r + 14);
    const [xt, yt] = pt(a, r + 28);
    return (
      <g key={tv}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-3)" stroke-width="1" />
        <text x={xt} y={yt + 3} font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="middle">{tv}</text>
      </g>
    );
  });

  const needleAngle = toRad(value);
  const [nx, ny] = pt(needleAngle, r - 20);
  const gooseLeft = ((nx / 400) * 100).toFixed(2);
  const gooseTop = (((ny / 240) * 100) * 0.9).toFixed(2);
  const z = activeZone(value, zones);

  return (
    <div style="position:relative;width:100%;max-width:420px;margin:0 auto">
      <svg viewBox="0 0 400 240" style="width:100%;overflow:visible">
        {segPaths}
        {ticks}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx={cx} cy={cy} r="8" fill="var(--ink)" />
        <circle cx={cx} cy={cy} r="3" fill="var(--paper-3)" />
      </svg>
      <div style={`position:absolute;left:${gooseLeft}%;top:${gooseTop}%;transform:translate(-50%,-80%);pointer-events:none`}>
        <GooseSvg size={78} idPrefix="meter-gauge" flapping />
      </div>
      <div class="meter-readout" style="margin-top:-8px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.current[locale]}</div>
        <div class="score">{value}<span style="font-size:22px;color:var(--ink-3)">/100</span></div>
        <div class="label" style={`color:${z.color}`}>{zoneLabel(z, locale)}</div>
      </div>
    </div>
  );
}

/* ─── Altitude view ──────────────────────────────────────────────────────────
 *   The goose flies at a height proportional to the score — high = strong.
 *   Positive inverse of the duck's bathtub (where the duck sinks). */
function AltitudeView({ value, zones, locale }: { value: number; zones: GooseZone[]; locale: 'en' | 'fr' | 'es' }) {
  const top = 30;
  const bottom = 300;
  const gooseY = bottom - (value / 100) * (bottom - top);
  const tickY = (tv: number) => bottom - (tv / 100) * (bottom - top);
  const honkingLine = tickY(75);
  const z = activeZone(value, zones);

  return (
    <div>
      <div style="display:flex;justify-content:center;padding:8px 0">
        <div style="position:relative;width:300px;height:330px">
          <svg viewBox="-30 0 300 330" width="300" height="330" style="position:absolute;inset:0;overflow:visible">
            <defs>
              <linearGradient id="gooseSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="oklch(0.93 0.05 235)" />
                <stop offset="100%" stop-color="oklch(0.98 0.02 230)" />
              </linearGradient>
            </defs>
            <rect x="0" y={top} width="220" height={bottom - top} fill="url(#gooseSky)" stroke="var(--ink)" stroke-width="2" />
            {/* ground */}
            <rect x="0" y={bottom} width="220" height="14" fill="oklch(0.55 0.06 130)" />
            {[0, 25, 50, 75, 100].map((tv) => {
              const y = tickY(tv);
              return (
                <g key={tv}>
                  <line x1="-12" y1={y} x2="0" y2={y} stroke="var(--ink-3)" />
                  <text x="-16" y={y + 3} font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="end">{tv}</text>
                </g>
              );
            })}
            {/* zone bands on the right edge */}
            {zones.map((zn) => (
              <rect key={zn.min} x="214" y={tickY(zn.max)} width="6" height={tickY(zn.min) - tickY(zn.max)} fill={zn.color} opacity="0.85" />
            ))}
            <line x1="0" y1={honkingLine} x2="220" y2={honkingLine} stroke="var(--blue)" stroke-width="1" stroke-dasharray="3 3" opacity=".7" />
            <text x="6" y={honkingLine - 4} font-size="9" font-family="var(--mono)" fill="var(--blue)">
              {locale === 'fr' ? 'KLAXONNE' : locale === 'es' ? 'GRAZNIDO' : 'HONKING'}
            </text>
          </svg>
          <div style={`position:absolute;left:96px;top:${gooseY - 28}px;transform:translateX(-50%);pointer-events:none`}>
            <GooseSvg size={92} idPrefix="meter-alt" flapping />
          </div>
        </div>
      </div>
      <div class="meter-readout" style="margin-top:8px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.current[locale]}</div>
        <div class="score">{value}<span style="font-size:22px;color:var(--ink-3)">/100</span></div>
        <div class="label" style={`color:${z.color}`}>{zoneLabel(z, locale)}</div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────*/
export default function GooseMeter({ score, locale, zones, defaultView = 'gauge', qualityNote }: Props) {
  const [view, setView] = useState<'gauge' | 'altitude'>(defaultView);
  const value = clampScore(score);
  const safeZones = zones.length > 0 ? zones : DEFAULT_ZONES;

  const views: Array<{ key: 'gauge' | 'altitude'; label: string }> = [
    { key: 'gauge', label: T.gauge[locale] },
    { key: 'altitude', label: T.altitude[locale] },
  ];

  return (
    <div>
      <div role="tabpanel" aria-label={`Canada Goose Meter — ${views.find((v) => v.key === view)?.label}`}>
        {view === 'gauge' && <GaugeView value={value} zones={safeZones} locale={locale} />}
        {view === 'altitude' && <AltitudeView value={value} zones={safeZones} locale={locale} />}
      </div>
      <div class="meter-switch" role="tablist" aria-label={locale === 'fr' ? 'Vue du compteur' : 'Meter view'}>
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            class={view === v.key ? 'active' : ''}
            onClick={() => setView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div class="meter-foot">
        <span>{T.grounded[locale]}</span>
        {qualityNote && <span style="color:var(--blue)">{qualityNote}</span>}
        <span>{T.honking[locale]}</span>
      </div>
    </div>
  );
}
