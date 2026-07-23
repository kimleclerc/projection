import { useUrlParam } from './lib/urlState';
import CopyLink from './lib/CopyLink';
import EmbedCode from './lib/EmbedCode';

/* BarrageMeter — Preact island for the Barrage Index (Front républicain) hero meter.
 *
 * Same instrument family as DuckMeter/GooseMeter: higher = the republican
 * firewall against the far right is more solid. Two views:
 *   - gauge: the shared half-circle dial
 *   - dam:   a dam wall holding back a rising wave; the water level is the
 *            far-right pressure (100 − score), cracks open as the score drops.
 *
 * Typography (`.score`, `.eyebrow`, `.label`) inherits from lame-duck.css,
 * shared across instruments so the meter stays visually consistent.
 */

export interface BarrageZone {
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
  zones: BarrageZone[];
  defaultView?: 'gauge' | 'dam';
  qualityNote?: string;
  /** Chemin de la page embed — affiche le bouton « Intégrer » quand fourni. */
  embedPath?: string;
}

const T = {
  gauge: { en: 'Gauge', fr: 'Cadran', es: 'Medidor' },
  dam: { en: 'The dam', fr: 'Le barrage', es: 'El dique' },
  current: { en: 'Current reading', fr: 'Lecture actuelle', es: 'Lectura actual' },
  breached: { en: '0 = breached', fr: '0 = rompu', es: '0 = roto' },
  solid: { en: '100 = rock-solid', fr: '100 = béton', es: '100 = sólido' },
  waterline: { en: 'FAR-RIGHT PRESSURE', fr: 'PRESSION EXTRÊME DROITE', es: 'PRESIÓN EXTREMA DERECHA' },
};

const DEFAULT_ZONES: BarrageZone[] = [
  { min: 0, max: 25, label_en: 'Breached', label_fr: 'Rompu', label_es: 'Roto', color: 'var(--red)' },
  { min: 25, max: 50, label_en: 'Strained', label_fr: 'Fissuré', label_es: 'Agrietado', color: 'var(--duck-deep)' },
  { min: 50, max: 75, label_en: 'Holding', label_fr: 'Tenu', label_es: 'Aguanta', color: 'oklch(0.62 0.12 170)' },
  { min: 75, max: 100, label_en: 'Rock-solid', label_fr: 'Béton', label_es: 'Sólido', color: 'var(--blue)' },
];

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function activeZone(value: number, zones: BarrageZone[]): BarrageZone {
  return zones.find((z) => value >= z.min && value < z.max) ?? zones[zones.length - 1];
}

function zoneLabel(z: BarrageZone, locale: 'en' | 'fr' | 'es'): string {
  if (locale === 'es') return z.label_es ?? z.label_en;
  return locale === 'fr' ? z.label_fr : z.label_en;
}

function fmtScore(value: number, locale: 'en' | 'fr' | 'es'): string {
  return locale === 'en' ? String(value) : String(value).replace('.', ',');
}

/* ─── Gauge view (shared dial geometry with the other instruments) ─────────── */
function GaugeView({ value, zones, locale }: { value: number; zones: BarrageZone[]; locale: 'en' | 'fr' | 'es' }) {
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
      <div class="meter-readout" style="margin-top:-8px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.current[locale]}</div>
        <div class="score">{fmtScore(value, locale)}<span style="font-size:22px;color:var(--ink-3)">/100</span></div>
        <div class="label" style={`color:${z.color}`}>{zoneLabel(z, locale)}</div>
      </div>
    </div>
  );
}

/* ─── Dam view ────────────────────────────────────────────────────────────────
 *   A dam wall holds back the far-right wave on the left; the protected side
 *   sits on the right. Water level = 100 − score. Cracks open as the score
 *   falls through the zones; below 25 the wall is breached and water jets
 *   through. The dam intact at the top of a low wave = a strong barrage. */
function DamView({ value, zones, locale }: { value: number; zones: BarrageZone[]; locale: 'en' | 'fr' | 'es' }) {
  const top = 30;
  const bottom = 300;
  const span = bottom - top;
  // Water rises as the score falls.
  const waterY = top + (value / 100) * span;
  const tickY = (tv: number) => top + (tv / 100) * span; // 0 at top = full pressure
  const z = activeZone(value, zones);

  // Dam geometry: trapezoid wall between reservoir (left) and safe side (right).
  const wallTopL = 96;
  const wallTopR = 124;
  const wallBotL = 84;
  const wallBotR = 136;
  const crackColor = 'oklch(0.35 0.02 260)';

  const cracks: string[] = [];
  if (value < 75) cracks.push(`M ${wallTopL + 14} ${top + 30} l 6 22 l -8 18 l 7 20`);
  if (value < 50) {
    cracks.push(`M ${wallTopR - 8} ${top + 70} l -9 24 l 7 20 l -9 26`);
    cracks.push(`M ${wallTopL + 6} ${top + 130} l 8 20 l -6 24`);
  }
  const breached = value < 25;

  return (
    <div>
      <div style="display:flex;justify-content:center;padding:8px 0">
        <div style="position:relative;width:300px;height:330px">
          <svg viewBox="-30 0 300 330" width="300" height="330" style="position:absolute;inset:0;overflow:visible">
            <defs>
              <linearGradient id="barrageWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="oklch(0.55 0.16 25)" stop-opacity="0.85" />
                <stop offset="100%" stop-color="oklch(0.45 0.14 25)" stop-opacity="0.95" />
              </linearGradient>
              <linearGradient id="barrageWall" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="oklch(0.72 0.02 260)" />
                <stop offset="100%" stop-color="oklch(0.60 0.02 260)" />
              </linearGradient>
            </defs>

            {/* frame */}
            <rect x="0" y={top} width="220" height={span} fill="oklch(0.98 0.02 230)" stroke="var(--ink)" stroke-width="2" />

            {/* axis: pressure ticks (top = 0 score, bottom = 100) */}
            {[0, 25, 50, 75, 100].map((tv) => {
              const y = tickY(tv);
              return (
                <g key={tv}>
                  <line x1="-12" y1={y} x2="0" y2={y} stroke="var(--ink-3)" />
                  <text x="-16" y={y + 3} font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="end">{100 - tv}</text>
                </g>
              );
            })}

            {/* zone bands on the right edge (score scale: high score at top) */}
            {zones.map((zn) => (
              <rect key={zn.min} x="214" y={tickY(100 - zn.max)} width="6" height={tickY(100 - zn.min) - tickY(100 - zn.max)} fill={zn.color} opacity="0.85" />
            ))}

            {/* reservoir: the far-right wave, left of the wall */}
            <path
              d={`M 0 ${waterY + 6} Q 14 ${waterY - 4} 28 ${waterY + 4} T 56 ${waterY + 3} T ${wallBotL} ${waterY + 5} L ${wallBotL} ${bottom} L 0 ${bottom} Z`}
              fill="url(#barrageWave)"
            />
            {/* wave crest line */}
            <path
              d={`M 0 ${waterY + 6} Q 14 ${waterY - 4} 28 ${waterY + 4} T 56 ${waterY + 3} T ${wallBotL} ${waterY + 5}`}
              fill="none"
              stroke="oklch(0.50 0.16 25)"
              stroke-width="2"
            />

            {/* dam wall */}
            <path
              d={`M ${wallTopL} ${top + 14} L ${wallTopR} ${top + 14} L ${wallBotR} ${bottom} L ${wallBotL} ${bottom} Z`}
              fill="url(#barrageWall)"
              stroke="var(--ink)"
              stroke-width="2"
            />
            {/* masonry joints */}
            {[0.25, 0.5, 0.75].map((f) => {
              const y = top + 14 + (bottom - top - 14) * f;
              const xl = wallTopL + (wallBotL - wallTopL) * f;
              const xr = wallTopR + (wallBotR - wallTopR) * f;
              return <line key={f} x1={xl} y1={y} x2={xr} y2={y} stroke="oklch(0.5 0.02 260)" stroke-width="1" opacity="0.6" />;
            })}

            {/* cracks */}
            {cracks.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={crackColor} stroke-width="2" stroke-linecap="round" />
            ))}

            {/* breach: water jets through the wall */}
            {breached && (
              <g>
                <path d={`M ${wallTopL + 4} ${top + 100} l 24 8 l -24 10 Z`} fill="oklch(0.55 0.16 25)" opacity="0.9" />
                <path
                  d={`M ${wallTopR - 2} ${top + 106} q 40 6 66 34 q 14 16 18 30`}
                  fill="none"
                  stroke="oklch(0.55 0.16 25)"
                  stroke-width="6"
                  stroke-linecap="round"
                  opacity="0.85"
                />
                <path
                  d={`M ${wallTopR - 2} ${top + 112} q 30 14 44 42`}
                  fill="none"
                  stroke="oklch(0.55 0.16 25)"
                  stroke-width="3"
                  stroke-linecap="round"
                  opacity="0.7"
                />
              </g>
            )}

            {/* waterline label */}
            <text x="4" y={Math.max(top + 12, waterY - 8)} font-size="9" font-family="var(--mono)" fill="oklch(0.45 0.14 25)">
              {T.waterline[locale]}
            </text>

            {/* protected side: a small tricolor pennant on safe ground */}
            <rect x={wallBotR} y={bottom} width={220 - wallBotR} height="0" fill="none" />
            <g>
              <line x1="182" y1={bottom} x2="182" y2={bottom - 34} stroke="var(--ink)" stroke-width="2" />
              <rect x="182" y={bottom - 34} width="7" height="10" fill="#1e4a8f" />
              <rect x="189" y={bottom - 34} width="7" height="10" fill="#f6f3ec" stroke="var(--ink-3)" stroke-width="0.4" />
              <rect x="196" y={bottom - 34} width="7" height="10" fill="#b3403c" />
            </g>
            {/* ground */}
            <rect x="0" y={bottom} width="220" height="14" fill="oklch(0.55 0.06 130)" />
          </svg>
        </div>
      </div>
      <div class="meter-readout" style="margin-top:8px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.current[locale]}</div>
        <div class="score">{fmtScore(value, locale)}<span style="font-size:22px;color:var(--ink-3)">/100</span></div>
        <div class="label" style={`color:${z.color}`}>{zoneLabel(z, locale)}</div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────*/
export default function BarrageMeter({ score, locale, zones, defaultView = 'gauge', qualityNote, embedPath }: Props) {
  // Permalien : ?view=gauge|dam (URL propre sur la vue par défaut).
  const [view, setView] = useUrlParam<'gauge' | 'dam'>(
    'view',
    defaultView,
    (v) => v === 'gauge' || v === 'dam',
  );
  const value = clampScore(score);
  const safeZones = zones.length > 0 ? zones : DEFAULT_ZONES;

  const views: Array<{ key: 'gauge' | 'dam'; label: string }> = [
    { key: 'gauge', label: T.gauge[locale] },
    { key: 'dam', label: T.dam[locale] },
  ];

  return (
    <div>
      <div role="tabpanel" aria-label={`Barrage Meter — ${views.find((v) => v.key === view)?.label}`}>
        {view === 'gauge' && <GaugeView value={value} zones={safeZones} locale={locale} />}
        {view === 'dam' && <DamView value={value} zones={safeZones} locale={locale} />}
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
        <span>{T.breached[locale]}</span>
        {qualityNote && <span style="color:var(--blue)">{qualityNote}</span>}
        <span>{T.solid[locale]}</span>
      </div>
      <div style="display:flex;justify-content:center;gap:8px;margin-top:10px">
        <CopyLink locale={locale} anchor="meter" />
        {embedPath && <EmbedCode locale={locale} embedPath={embedPath} height={560} />}
      </div>
    </div>
  );
}
