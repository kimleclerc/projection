import { useMemo, useState } from 'preact/hooks';
import type { BarrageComponent, BarrageLocale } from '../data/barrage';

/* BarrageBreakdown — component cards for the Barrage Index.
 * Same card grid as GooseBreakdown (styles from lame-duck.css), with
 * dam-flavoured strength labels instead of the goose's wind metaphors. */

interface Props {
  components: BarrageComponent[];
  locale: BarrageLocale;
}

const copy = {
  en: {
    score: 'Index score',
    weight: 'weight',
    real: 'real',
    missing: 'no data',
    mixed: 'mixed',
    strong: 'Wall holding',
    moderate: 'Under pressure',
    weak: 'Crack open',
  },
  fr: {
    score: 'Score indice',
    weight: 'poids',
    real: 'réel',
    missing: 'pas de donnée',
    mixed: 'mixte',
    strong: 'Mur qui tient',
    moderate: 'Sous pression',
    weak: 'Fissure ouverte',
  },
  es: {
    score: 'Puntaje índice',
    weight: 'peso',
    real: 'real',
    missing: 'sin datos',
    mixed: 'mixto',
    strong: 'Muro firme',
    moderate: 'Bajo presión',
    weak: 'Grieta abierta',
  },
};

const componentColors: Record<string, string> = {
  runoff_margin: 'var(--blue)',
  model_hold: 'oklch(0.55 0.11 250)',
  transfer_discipline: 'oklch(0.62 0.12 170)',
  far_right_pressure: 'var(--red)',
};

function componentName(component: BarrageComponent, locale: BarrageLocale) {
  if (locale === 'fr') return component.name_fr ?? component.name_en ?? component.id;
  if (locale === 'es') return component.name_es ?? component.name_en ?? component.id;
  return component.name_en ?? component.id;
}

function componentTip(component: BarrageComponent, locale: BarrageLocale) {
  if (locale === 'fr') return component.tooltip_fr ?? component.tooltip_en ?? '';
  if (locale === 'es') return component.tooltip_es ?? component.tooltip_en ?? '';
  return component.tooltip_en ?? '';
}

function rawLabel(component: BarrageComponent, locale: BarrageLocale) {
  let label = component.raw_label ?? '—';
  if (locale === 'fr') label = component.raw_label_fr ?? label;
  if (locale === 'es') label = component.raw_label_es ?? label;
  // Les raw_label du JSON gardent le point décimal ; on l'affiche à la locale.
  return locale === 'en' ? label : label.replace(/(\d)\.(\d)/g, '$1,$2');
}

/* High score = that part of the wall is holding; low = the crack runs there. */
function wallLabel(score: number | null | undefined, locale: BarrageLocale) {
  const t = copy[locale] ?? copy.en;
  if (typeof score !== 'number') return { text: '—', tone: 'neutral' };
  if (score >= 66) return { text: t.strong, tone: 'supportive' };
  if (score >= 40) return { text: t.moderate, tone: 'moderate' };
  return { text: t.weak, tone: 'strong' };
}

function qualityLabel(quality: string | undefined, locale: BarrageLocale) {
  const t = copy[locale] ?? copy.en;
  if (quality === 'real') return t.real;
  if (quality === 'missing') return t.missing;
  if (quality === 'mixed') return t.mixed;
  return quality ?? '—';
}

export default function BarrageBreakdown({ components, locale }: Props) {
  const t = copy[locale] ?? copy.en;
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeComponent = useMemo(
    () => components.find((component) => component.id === activeId),
    [activeId, components],
  );

  return (
    <div class="lame-duck-components">
      <div class="lame-duck-component-grid">
        {components.map((component) => {
          const score = typeof component.score === 'number' ? component.score : 0;
          const wall = wallLabel(component.score, locale);
          const color = componentColors[component.id] ?? 'var(--ink-3)';
          const name = componentName(component, locale);
          const tip = componentTip(component, locale);

          return (
            <article
              class="lame-duck-component-card"
              key={component.id}
              tabIndex={0}
              onMouseEnter={() => setActiveId(component.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(component.id)}
              onBlur={() => setActiveId(null)}
              aria-describedby={tip ? 'barrage-component-tip' : undefined}
            >
              <span class={`lame-duck-quality is-${component.data_quality ?? 'mixed'}`}>
                {qualityLabel(component.data_quality, locale)}
              </span>
              <p class="lame-duck-component-weight">
                {Math.round((component.weight ?? 0) * 100)}% {t.weight}
              </p>
              <h3>{name}</h3>
              <strong>{rawLabel(component, locale)}</strong>
              <em class={`is-${wall.tone}`}>{wall.text}</em>
              <div class="lame-duck-component-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: color }} />
              </div>
              <footer>
                {t.score} {typeof component.score === 'number' ? `${component.score.toFixed(0)}/100` : '—'}
              </footer>
            </article>
          );
        })}
      </div>

      {activeComponent && componentTip(activeComponent, locale) && (
        <aside id="barrage-component-tip" class="lame-duck-component-tip" role="status">
          <span>{componentName(activeComponent, locale)}</span>
          <p>{componentTip(activeComponent, locale)}</p>
        </aside>
      )}
    </div>
  );
}
