import { useMemo, useState } from 'preact/hooks';
import type { LameDuckComponent, LameDuckLocale } from '../data/lameDuck';

interface Props {
  components: LameDuckComponent[];
  locale: LameDuckLocale;
}

const copy = {
  en: {
    score: 'Index score',
    weight: 'weight',
    real: 'real',
    estimate: 'estimate',
    mixed: 'mixed',
    supportive: 'Supportive',
    moderate: 'Moderate drag',
    strong: 'Strong drag on LDI',
  },
  fr: {
    score: 'Score indice',
    weight: 'poids',
    real: 'réel',
    estimate: 'estimé',
    mixed: 'mixte',
    supportive: 'Soutien',
    moderate: 'Traînée modérée',
    strong: 'Forte traînée sur l’indice',
  },
  es: {
    score: 'Puntaje índice',
    weight: 'peso',
    real: 'real',
    estimate: 'estimado',
    mixed: 'mixto',
    supportive: 'Soporte',
    moderate: 'Arrastre moderado',
    strong: 'Fuerte arrastre',
  },
};

const componentColors: Record<string, string> = {
  net_approval: 'var(--red)',
  generic_ballot: 'var(--blue)',
  congressional_ctrl: 'var(--duck-deep)',
  economic_sentiment: 'oklch(0.62 0.12 170)',
};

function componentName(component: LameDuckComponent, locale: LameDuckLocale) {
  if (locale === 'fr') return component.name_fr ?? component.name_en ?? component.id;
  if (locale === 'es') return component.name_es ?? component.name_en ?? component.id;
  return component.name_en ?? component.id;
}

function componentTip(component: LameDuckComponent, locale: LameDuckLocale) {
  if (locale === 'fr') return component.tooltip_fr ?? component.tooltip_en ?? '';
  if (locale === 'es') return component.tooltip_es ?? component.tooltip_en ?? '';
  return component.tooltip_en ?? '';
}

function dragLabel(score: number | undefined, locale: LameDuckLocale) {
  const t = copy[locale] ?? copy.en;
  if (typeof score !== 'number') return { text: '—', tone: 'neutral' };
  if (score >= 66) return { text: t.strong, tone: 'strong' };
  if (score >= 40) return { text: t.moderate, tone: 'moderate' };
  return { text: t.supportive, tone: 'supportive' };
}

function qualityLabel(quality: string | undefined, locale: LameDuckLocale) {
  const t = copy[locale] ?? copy.en;
  if (quality === 'real') return t.real;
  if (quality === 'estimate') return t.estimate;
  if (quality === 'mixed') return t.mixed;
  return quality ?? '—';
}

export default function ComponentBreakdown({ components, locale }: Props) {
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
          const drag = dragLabel(component.score, locale);
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
              aria-describedby={tip ? 'lame-duck-component-tip' : undefined}
            >
              <span class={`lame-duck-quality is-${component.data_quality ?? 'mixed'}`}>
                {qualityLabel(component.data_quality, locale)}
              </span>
              <p class="lame-duck-component-weight">
                {Math.round((component.weight ?? 0) * 100)}% {t.weight}
              </p>
              <h3>{name}</h3>
              <strong>{component.raw_label ?? '—'}</strong>
              <em class={`is-${drag.tone}`}>{drag.text}</em>
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
        <aside id="lame-duck-component-tip" class="lame-duck-component-tip" role="status">
          <span>{componentName(activeComponent, locale)}</span>
          <p>{componentTip(activeComponent, locale)}</p>
        </aside>
      )}
    </div>
  );
}
