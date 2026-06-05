import { useMemo, useState } from 'preact/hooks';
import type { GooseComponent, GooseLocale } from '../data/canadaGoose';

interface Props {
  components: GooseComponent[];
  locale: GooseLocale;
}

const copy = {
  en: {
    score: 'Index score',
    weight: 'weight',
    real: 'real',
    missing: 'no data',
    mixed: 'mixed',
    strong: 'Strong tailwind',
    moderate: 'Steady lift',
    weak: 'Headwind',
  },
  fr: {
    score: 'Score indice',
    weight: 'poids',
    real: 'réel',
    missing: 'pas de donnée',
    mixed: 'mixte',
    strong: 'Fort vent arrière',
    moderate: 'Portance stable',
    weak: 'Vent de face',
  },
  es: {
    score: 'Puntaje índice',
    weight: 'peso',
    real: 'real',
    missing: 'sin datos',
    mixed: 'mixto',
    strong: 'Fuerte viento de cola',
    moderate: 'Sustentación estable',
    weak: 'Viento en contra',
  },
};

const componentColors: Record<string, string> = {
  electoral_strength: 'var(--blue)',
  mandate_projection: 'oklch(0.55 0.11 250)',
  government_approval: 'oklch(0.62 0.12 170)',
  economic_confidence: 'var(--duck-deep)',
  national_mood: 'oklch(0.62 0.10 140)',
  mandate_horizon: 'oklch(0.58 0.06 90)',
};

function componentName(component: GooseComponent, locale: GooseLocale) {
  if (locale === 'fr') return component.name_fr ?? component.name_en ?? component.id;
  if (locale === 'es') return component.name_es ?? component.name_en ?? component.id;
  return component.name_en ?? component.id;
}

function componentTip(component: GooseComponent, locale: GooseLocale) {
  if (locale === 'fr') return component.tooltip_fr ?? component.tooltip_en ?? '';
  if (locale === 'es') return component.tooltip_es ?? component.tooltip_en ?? '';
  return component.tooltip_en ?? '';
}

function rawLabel(component: GooseComponent, locale: GooseLocale) {
  if (locale === 'fr') return component.raw_label_fr ?? component.raw_label ?? '—';
  if (locale === 'es') return component.raw_label_es ?? component.raw_label ?? '—';
  return component.raw_label ?? '—';
}

/* Positive framing: high score = strength (tailwind), low = weakness (headwind). */
function liftLabel(score: number | null | undefined, locale: GooseLocale) {
  const t = copy[locale] ?? copy.en;
  if (typeof score !== 'number') return { text: '—', tone: 'neutral' };
  if (score >= 66) return { text: t.strong, tone: 'supportive' };
  if (score >= 40) return { text: t.moderate, tone: 'moderate' };
  return { text: t.weak, tone: 'strong' };
}

function qualityLabel(quality: string | undefined, locale: GooseLocale) {
  const t = copy[locale] ?? copy.en;
  if (quality === 'real') return t.real;
  if (quality === 'missing') return t.missing;
  if (quality === 'mixed') return t.mixed;
  return quality ?? '—';
}

export default function GooseBreakdown({ components, locale }: Props) {
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
          const lift = liftLabel(component.score, locale);
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
              aria-describedby={tip ? 'goose-component-tip' : undefined}
            >
              <span class={`lame-duck-quality is-${component.data_quality ?? 'mixed'}`}>
                {qualityLabel(component.data_quality, locale)}
              </span>
              <p class="lame-duck-component-weight">
                {Math.round((component.weight ?? 0) * 100)}% {t.weight}
              </p>
              <h3>{name}</h3>
              <strong>{rawLabel(component, locale)}</strong>
              <em class={`is-${lift.tone}`}>{lift.text}</em>
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
        <aside id="goose-component-tip" class="lame-duck-component-tip" role="status">
          <span>{componentName(activeComponent, locale)}</span>
          <p>{componentTip(activeComponent, locale)}</p>
        </aside>
      )}
    </div>
  );
}
