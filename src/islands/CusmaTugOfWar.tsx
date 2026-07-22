import { GooseSvg, DuckSvg } from './birds';
import type { ShowdownZone, ShowdownLocale } from '../data/cusmaShowdown';
import CopyLink from './lib/CopyLink';

interface Props {
  gap: number;
  zones: ShowdownZone[];
  leader: 'canada' | 'us' | 'even';
  label: string;
  locale: ShowdownLocale;
}

const T = {
  us: { en: 'U.S. advantage', fr: 'Avantage É.-U.', es: 'Ventaja EE. UU.' },
  ca: { en: 'Canada advantage', fr: 'Avantage Canada', es: 'Ventaja Canadá' },
  even: { en: 'Even', fr: 'Égalité', es: 'Pareja' },
  gap: { en: 'Leverage gap', fr: 'Écart de levier', es: 'Brecha de ventaja' },
};

function zoneLabel(z: ShowdownZone, locale: ShowdownLocale): string {
  if (locale === 'es') return z.label_es ?? z.label_en;
  return locale === 'fr' ? z.label_fr : z.label_en;
}

/* Diverging "tug of war": domain −100..+100 mapped to x 60..540 (center 300).
 * Duck holds the left (U.S./red), goose holds the right (Canada/blue). The knot
 * sits at the current gap; the rope fills from centre toward the leader. */
export default function CusmaTugOfWar({ gap, zones, leader, label, locale }: Props) {
  const clamped = Math.max(-100, Math.min(100, gap));
  const xOf = (g: number) => 300 + (g / 100) * 240;
  const knotX = xOf(clamped);
  const center = 300;
  const safeZones = zones.length ? zones : [];
  const leaderColor = leader === 'canada' ? '#2f6fb0' : leader === 'us' ? '#c94040' : '#c8a030';
  const trackY = 64;
  const trackH = 14;

  return (
    <div style="position:relative;max-width:660px;margin:0 auto">
      <svg viewBox="0 0 600 130" style="width:100%;overflow:visible" role="img" aria-label={label}>
        {/* zone bands */}
        {safeZones.map((z) => {
          const x1 = xOf(Math.max(-100, z.min));
          const x2 = xOf(Math.min(100, z.max));
          return <rect key={z.min} x={x1} y={trackY} width={Math.max(0, x2 - x1)} height={trackH} fill={z.color} opacity="0.28" />;
        })}
        {/* rope fill from centre to knot */}
        <rect
          x={Math.min(center, knotX)}
          y={trackY}
          width={Math.abs(knotX - center)}
          height={trackH}
          fill={leaderColor}
          opacity="0.9"
        />
        {/* centre line */}
        <line x1={center} y1={trackY - 10} x2={center} y2={trackY + trackH + 10} stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
        <text x={center} y={trackY - 14} font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="middle">0</text>
        {/* ticks */}
        {[-50, 50].map((tv) => (
          <g key={tv}>
            <line x1={xOf(tv)} y1={trackY + trackH} x2={xOf(tv)} y2={trackY + trackH + 6} stroke="var(--ink-3)" />
            <text x={xOf(tv)} y={trackY + trackH + 18} font-size="9" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="middle">{tv > 0 ? `+${tv}` : tv}</text>
          </g>
        ))}
        {/* knot */}
        <line x1={knotX} y1={trackY - 12} x2={knotX} y2={trackY + trackH + 12} stroke={leaderColor} stroke-width="2.5" />
        <circle cx={knotX} cy={trackY + trackH / 2} r="9" fill={leaderColor} stroke="var(--paper-3)" stroke-width="2.5" />
        {/* side labels — above the track to avoid the tick numbers */}
        <text x="60" y={trackY - 14} font-size="10" font-family="var(--mono)" fill="#c94040" text-anchor="start">◄ {T.us[locale]}</text>
        <text x="540" y={trackY - 14} font-size="10" font-family="var(--mono)" fill="#2f6fb0" text-anchor="end">{T.ca[locale]} ►</text>
      </svg>

      {/* duck holds the left, facing right (inward) */}
      <div style="position:absolute;left:0;top:6px;pointer-events:none">
        <DuckSvg size={70} idPrefix="tug-duck" />
      </div>
      {/* goose holds the right, flipped to face left (inward) */}
      <div style="position:absolute;right:0;top:2px;pointer-events:none;transform:scaleX(-1)">
        <GooseSvg size={84} idPrefix="tug-goose" flapping />
      </div>

      <div class="meter-readout" style="margin-top:6px">
        <div class="eyebrow" style="color:var(--ink-3)">{T.gap[locale]}</div>
        <div class="score" style={`color:${leaderColor}`}>{gap > 0 ? `+${gap}` : gap}</div>
        <div class="label" style={`color:${leaderColor}`}>{label}</div>
      </div>
      <div style="display:flex;justify-content:center;margin-top:10px">
        <CopyLink locale={locale} anchor="meter" />
      </div>
    </div>
  );
}
