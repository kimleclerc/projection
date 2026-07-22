import { useUrlParam } from './lib/urlState';
import CopyLink from './lib/CopyLink';

/* DuckMeter — Preact island for the lame-duck index hero meter.
 *
 * Three switchable views (gauge / bathtub / waterline), all rendered as inline
 * SVG with the Trump-toupet rubber duck. View state is local to the island.
 *
 * Data is passed as props: `score` (0-100), `label` (zone label, locale-aware),
 * and the four zone definitions. No fetch — server side reads the JSON.
 *
 * Styling: minimal inline styles for layout. Typography (`.score`, `.eyebrow`
 * etc.) inherits from the page-level `lame-duck.css` so the meter stays visually
 * consistent across all locale pages without duplicating CSS in three .astro files.
 */

export interface DuckZone {
  min: number;
  max: number;
  label_en: string;
  label_fr: string;
  label_es?: string;
  /** CSS color string (oklch / hex / var). */
  color: string;
  /** Tooltip body (hover on the gauge segment). */
  tip_en?: string;
  tip_fr?: string;
  tip_es?: string;
}

interface Props {
  score: number;
  locale: 'en' | 'fr' | 'es';
  zones: DuckZone[];
  /** Initial view; defaults to 'gauge'. */
  defaultView?: 'gauge' | 'bathtub' | 'waterline';
  /** Footer note (data quality, e.g. '✓ All real data'). */
  qualityNote?: string;
}

const T = {
  gauge: { en: 'Gauge', fr: 'Cadran', es: 'Medidor' },
  bathtub: { en: 'Bathtub', fr: 'Baignoire', es: 'Bañera' },
  waterline: { en: 'Waterline', fr: 'Ligne d\'eau', es: 'Línea de agua' },
  current: { en: 'Current reading', fr: 'Lecture actuelle', es: 'Lectura actual' },
  fullPower: { en: '0 = full power', fr: '0 = plein pouvoir', es: '0 = pleno poder' },
  fullyLame: { en: '100 = fully lame', fr: '100 = canard boiteux', es: '100 = pato cojo total' },
};

const DEFAULT_ZONES: DuckZone[] = [
  {
    min: 0,
    max: 25,
    label_en: 'Full Power',
    label_fr: 'Plein pouvoir',
    label_es: 'Pleno poder',
    color: 'var(--blue)',
  },
  {
    min: 25,
    max: 50,
    label_en: 'Waning',
    label_fr: 'En déclin',
    label_es: 'En declive',
    color: 'oklch(0.62 0.12 170)',
  },
  {
    min: 50,
    max: 75,
    label_en: 'Quacking',
    label_fr: 'Canard qui coasse',
    label_es: 'El pato grazna',
    color: 'var(--duck-deep)',
  },
  {
    min: 75,
    max: 100,
    label_en: 'Fully Lame',
    label_fr: 'Canard boiteux',
    label_es: 'Pato cojo total',
    color: 'var(--red)',
  },
];

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function activeZone(value: number, zones: DuckZone[]): DuckZone {
  return zones.find((z) => value >= z.min && value < z.max) ?? zones[zones.length - 1];
}

function zoneLabel(z: DuckZone, locale: 'en' | 'fr' | 'es'): string {
  if (locale === 'es') return z.label_es ?? z.label_en;
  return locale === 'fr' ? z.label_fr : z.label_en;
}

/* Trump-toupet rubber duck — server-friendly inline SVG.
 * `bobbing` adds a CSS animation class hooking into duckBob @keyframes. */
function DuckSvg({ size, idPrefix, bobbing = false }: { size: number; idPrefix: string; bobbing?: boolean }) {
  const w = size;
  const h = Math.round(size * 0.95);
  const bodyId = `${idPrefix}-duckBody`;
  const headId = `${idPrefix}-duckHead`;
  const beakId = `${idPrefix}-beakGrad`;
  return (
    <svg
      class={bobbing ? 'duck-bob' : undefined}
      width={w}
      height={h}
      viewBox="0 0 200 190"
      style="overflow:visible"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bodyId} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stop-color="oklch(0.93 0.16 92)" />
          <stop offset="60%" stop-color="oklch(0.84 0.18 86)" />
          <stop offset="100%" stop-color="oklch(0.72 0.18 78)" />
        </radialGradient>
        <radialGradient id={headId} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0%" stop-color="oklch(0.95 0.14 92)" />
          <stop offset="100%" stop-color="oklch(0.80 0.18 80)" />
        </radialGradient>
        <linearGradient id={beakId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="oklch(0.78 0.18 50)" />
          <stop offset="100%" stop-color="oklch(0.62 0.18 38)" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="100" cy="178" rx="70" ry="6" fill="rgba(40,30,20,.12)" />
      {/* Body */}
      <ellipse cx="100" cy="130" rx="72" ry="48" fill={`url(#${bodyId})`} />
      <ellipse cx="35" cy="108" rx="18" ry="12" fill={`url(#${bodyId})`} transform="rotate(-18 35 108)" />
      <ellipse cx="110" cy="132" rx="38" ry="22" fill="oklch(0.80 0.17 85)" opacity=".55" />
      <path d="M 75 138 Q 95 128 140 138" stroke="oklch(0.65 0.18 70)" stroke-width="1.2" fill="none" opacity=".5" />
      {/* Head */}
      <circle cx="138" cy="74" r="42" fill={`url(#${headId})`} />
      {/* ── Trump toupet — voluminous swept-back pompadour ─────────────────
       *  Tall crest above the head, big front swoop reaching past x=190,
       *  layered highlights and wispy strands. Reads at 72px+ widths. */}
      {/* Main hair mass: big swept volume from left ear up over the head
          and arcing forward over the brow/beak area. */}
      <path
        d="M 96 76
           Q 84 36 110 14
           Q 138 -2 168 6
           Q 196 18 198 42
           Q 200 60 188 66
           Q 180 70 172 64
           Q 162 56 148 54
           Q 130 53 116 60
           Q 104 68 98 76 Z"
        fill="oklch(0.86 0.16 80)"
        stroke="oklch(0.62 0.22 62)"
        stroke-width="0.8"
        opacity="0.96"
      />
      {/* Lighter highlight crest — gives the hair its sun-bleached top sheen */}
      <path
        d="M 110 28
           Q 130 8 158 12
           Q 178 18 186 36
           Q 174 28 152 26
           Q 132 26 118 38 Z"
        fill="oklch(0.94 0.13 90)"
        opacity="0.78"
      />
      {/* Front swoop / signature forelock — the curl that drops forward
          past the brow toward the beak. */}
      <path
        d="M 174 38
           Q 192 32 196 50
           Q 200 64 186 70
           Q 178 66 172 58
           Q 168 48 174 38 Z"
        fill="oklch(0.80 0.18 72)"
        stroke="oklch(0.58 0.22 60)"
        stroke-width="0.5"
        opacity="0.92"
      />
      {/* Wispy strands — directional layers reinforcing the swoop */}
      <path d="M 102 64 Q 116 26 152 14 Q 172 12 188 22" stroke="oklch(0.58 0.22 58)" stroke-width="2.4" fill="none" opacity="0.55" stroke-linecap="round" />
      <path d="M 108 56 Q 124 22 160 18 Q 178 18 190 30" stroke="oklch(0.66 0.20 66)" stroke-width="1.6" fill="none" opacity="0.55" stroke-linecap="round" />
      <path d="M 114 60 Q 130 32 168 30" stroke="oklch(0.54 0.22 56)" stroke-width="2.6" fill="none" opacity="0.42" stroke-linecap="round" />
      <path d="M 122 50 Q 142 24 178 26" stroke="oklch(0.72 0.18 72)" stroke-width="1.2" fill="none" opacity="0.45" stroke-linecap="round" />
      {/* Tip detail — that little wave at the very front */}
      <path d="M 188 46 Q 198 50 196 60" stroke="oklch(0.50 0.22 54)" stroke-width="1.4" fill="none" opacity="0.50" stroke-linecap="round" />
      {/* Head shine & beak */}
      <ellipse cx="124" cy="58" rx="14" ry="10" fill="oklch(0.98 0.06 95)" opacity=".55" />
      <ellipse cx="88" cy="108" rx="18" ry="10" fill="oklch(0.98 0.06 95)" opacity=".35" />
      <ellipse cx="174" cy="80" rx="18" ry="10" fill={`url(#${beakId})`} />
      <path d="M 158 82 Q 172 86 188 82" stroke="oklch(0.52 0.18 40)" stroke-width=".8" fill="none" opacity=".4" />
      {/* Eye on top */}
      <circle cx="148" cy="62" r="5.5" fill="#1a1814" />
      <circle cx="149.5" cy="60" r="1.8" fill="#fff" />
    </svg>
  );
}

/* ─── Gauge view ─────────────────────────────────────────────────────────── */
function GaugeView({ value, zones, locale }: { value: number; zones: DuckZone[]; locale: 'en' | 'fr' | 'es' }) {
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
      <path
        key={seg.min}
        d={d}
        fill={seg.color}
        opacity={active ? 1 : 0.22}
        style="transition:opacity .2s"
      >
        <title>{zoneLabel(seg, locale)}{seg.tip_en && ` — ${locale === 'fr' ? seg.tip_fr ?? '' : locale === 'es' ? seg.tip_es ?? seg.tip_en : seg.tip_en}`}</title>
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
  const duckLeft = ((nx / 400) * 100).toFixed(2);
  const duckTop = (((ny / 240) * 100) * 0.9).toFixed(2);
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
      <div style={`position:absolute;left:${duckLeft}%;top:${duckTop}%;transform:translate(-50%,-80%);pointer-events:none`}>
        <DuckSvg size={72} idPrefix="meter-gauge" bobbing />
      </div>
      <div class="meter-readout" style="margin-top:-8px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.current[locale]}</div>
        <div class="score">{value}<span style="font-size:22px;color:var(--ink-3)">/100</span></div>
        <div class="label" style={`color:${z.color}`}>{zoneLabel(z, locale)}</div>
      </div>
    </div>
  );
}

/* ─── Bathtub view ───────────────────────────────────────────────────────── */
function BathtubView({ value, locale }: { value: number; locale: 'en' | 'fr' | 'es' }) {
  const wY = 70 + (1 - value / 100) * 240;
  const tickY = (tv: number) => 50 + (1 - tv / 100) * 250 + 20;
  const lameLine = tickY(75);

  return (
    <div>
      <div style="display:flex;justify-content:center;padding:8px 0">
        <div style="position:relative;width:300px;height:340px">
          <svg viewBox="-30 0 300 340" width="300" height="340" style="position:absolute;inset:0;overflow:visible">
            <defs>
              <clipPath id="tubClip">
                <path d="M 30 50 L 30 300 Q 30 320 50 320 L 210 320 Q 230 320 230 300 L 230 50 Z" />
              </clipPath>
            </defs>
            <path d="M 30 50 L 30 300 Q 30 320 50 320 L 210 320 Q 230 320 230 300 L 230 50 Z" fill="var(--paper-3)" stroke="var(--ink)" stroke-width="2" />
            {[0, 25, 50, 75, 100].map((tv) => {
              const y = tickY(tv);
              return (
                <g key={tv}>
                  <line x1="18" y1={y} x2="28" y2={y} stroke="var(--ink-3)" />
                  <text x="14" y={y + 3} font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="end">{tv}</text>
                </g>
              );
            })}
            <g clip-path="url(#tubClip)">
              <rect x="30" y={wY} width="200" height="260" fill="var(--water)" opacity=".85" />
            </g>
            <line x1="30" y1={lameLine} x2="230" y2={lameLine} stroke="var(--red)" stroke-width="1" stroke-dasharray="3 3" opacity=".7" />
            <text x="232" y={lameLine + 4} font-size="9" font-family="var(--mono)" fill="var(--red)">
              {locale === 'fr' ? 'CANARD BOITEUX' : locale === 'es' ? 'LAME DUCK' : 'FULLY LAME'}
            </text>
          </svg>
          <div style={`position:absolute;left:50%;top:${wY - 42}px;transform:translateX(-50%);pointer-events:none`}>
            <DuckSvg size={84} idPrefix="meter-tub" bobbing />
          </div>
        </div>
      </div>
      <div class="meter-readout" style="margin-top:8px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.current[locale]}</div>
        <div class="score">{value}<span style="font-size:22px;color:var(--ink-3)">/100</span></div>
      </div>
    </div>
  );
}

/* ─── Waterline view ─────────────────────────────────────────────────────────
 *   Fix vs legacy: duck now sits ON the waterline (its body bottom aligned to
 *   the water surface y=80), not floating high above it. The legacy used
 *   `top:24px` which left the duck mostly in the sky band. Now the duck's
 *   center sits at y=80 of the 140-tall viewBox (water surface), with vertical
 *   bobbing animation. */
function WaterlineView({ value, zones, locale }: { value: number; zones: DuckZone[]; locale: 'en' | 'fr' | 'es' }) {
  const bandY = 124;
  const bandH = 6;
  const labels = zones.map((z) => zoneLabel(z, locale).toUpperCase());
  const duckSize = 72;
  // Position duck so its bottom sits at water surface (svg y=80 on a 140 viewBox).
  // The container is 140px tall; we want the duck's vertical center near y=80
  // (i.e. ~57% of container). The animation handles the bob.
  const duckTopPct = `calc(57% - ${duckSize / 2}px)`;

  return (
    <div style="padding:16px 0">
      <div style="position:relative;height:140px">
        <svg viewBox="0 0 600 140" width="100%" height="140" preserveAspectRatio="none" style="position:absolute;inset:0">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="oklch(0.97 0.02 90)" />
              <stop offset="100%" stop-color="oklch(0.93 0.04 80)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="600" height="80" fill="url(#skyGrad)" />
          <rect x="0" y="80" width="600" height="60" fill="var(--water)" opacity=".8" />
          <path d="M 0 80 Q 75 74 150 80 T 300 80 T 450 80 T 600 80" stroke="var(--water-deep)" stroke-width="1.5" fill="none" opacity=".7" />
          {zones.map((z) => (
            <rect key={z.min} x={z.min * 6} y={bandY} width={(z.max - z.min) * 6} height={bandH} fill={z.color} opacity=".85" />
          ))}
          {[0, 25, 50, 75, 100].map((tv) => (
            <g key={tv}>
              <line x1={tv * 6} y1="120" x2={tv * 6} y2="134" stroke="var(--ink)" stroke-width="1" />
              <text
                x={tv * 6}
                y="118"
                font-size="10"
                font-family="var(--mono)"
                fill="var(--ink-3)"
                text-anchor={tv === 0 ? 'start' : tv === 100 ? 'end' : 'middle'}
              >
                {tv}
              </text>
            </g>
          ))}
          <line x1={value * 6} y1="20" x2={value * 6} y2="134" stroke="var(--ink)" stroke-width="1" stroke-dasharray="2 3" opacity=".4" />
        </svg>
        <div style={`position:absolute;left:${value}%;top:${duckTopPct};transform:translateX(-50%);pointer-events:none`}>
          <DuckSvg size={duckSize} idPrefix="meter-water" bobbing />
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:var(--ink-3)">
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div class="meter-readout" style="margin-top:4px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.current[locale]}</div>
        <div class="score">{value}<span style="font-size:22px;color:var(--ink-3)">/100</span></div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function DuckMeter({ score, locale, zones, defaultView = 'gauge', qualityNote }: Props) {
  // Permalien : ?view=gauge|bathtub|waterline (URL propre sur la vue par défaut).
  const [view, setView] = useUrlParam<'gauge' | 'bathtub' | 'waterline'>(
    'view',
    defaultView,
    (v) => v === 'gauge' || v === 'bathtub' || v === 'waterline',
  );
  const value = clampScore(score);
  const safeZones = zones.length > 0 ? zones : DEFAULT_ZONES;

  const views: Array<{ key: 'gauge' | 'bathtub' | 'waterline'; label: string }> = [
    { key: 'gauge', label: T.gauge[locale] },
    { key: 'bathtub', label: T.bathtub[locale] },
    { key: 'waterline', label: T.waterline[locale] },
  ];

  return (
    <div>
      <div role="tabpanel" aria-label={`Lame-Duck Meter — ${views.find((v) => v.key === view)?.label}`}>
        {view === 'gauge' && <GaugeView value={value} zones={safeZones} locale={locale} />}
        {view === 'bathtub' && <BathtubView value={value} locale={locale} />}
        {view === 'waterline' && <WaterlineView value={value} zones={safeZones} locale={locale} />}
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
        <span>{T.fullPower[locale]}</span>
        {qualityNote && <span style="color:var(--duck-deep)">{qualityNote}</span>}
        <span>{T.fullyLame[locale]}</span>
      </div>
      <div style="display:flex;justify-content:center;margin-top:10px">
        <CopyLink locale={locale} anchor="meter" />
      </div>
    </div>
  );
}
