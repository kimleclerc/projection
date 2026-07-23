/**
 * Cartes og:image des 4 instruments (lame-duck, canada-goose, barrage,
 * cusma-showdown) × 3 langues — générées au build avec la LECTURE COURANTE
 * (score, zone active, bande de zones). Remplacent les PNG statiques de
 * public/og/ sur les pages instruments : chaque partage montre l'état du jour.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderMeterCard, type MeterCardZone } from '../../../../lib/og/meter-card';
import { getLameDuckData } from '../../../../data/lameDuck';
import { getCanadaGooseData } from '../../../../data/canadaGoose';
import { getBarrageData } from '../../../../data/barrage';
import { getCusmaShowdownData, showdownLabel } from '../../../../data/cusmaShowdown';

type Lang = 'en' | 'fr' | 'es';
const LANGS: Lang[] = ['en', 'fr', 'es'];
const SLUGS = ['lame-duck', 'canada-goose', 'barrage', 'cusma-showdown'] as const;
type Slug = (typeof SLUGS)[number];

export const getStaticPaths: GetStaticPaths = () =>
  SLUGS.flatMap((slug) => LANGS.map((lang) => ({ params: { lang, slug } })));

const EYEBROW: Record<Lang, string> = {
  en: 'LIVE INSTRUMENT',
  fr: 'INSTRUMENT LIVE',
  es: 'INSTRUMENTO EN VIVO',
};

// Questions éditoriales des instruments (mêmes angles que les pages).
const COPY: Record<Slug, Record<Lang, { title: string; subtitle: string }>> = {
  'lame-duck': {
    en: { title: 'Lame-Duck Index', subtitle: 'How much political capital does Trump have left?' },
    fr: { title: 'Lame-Duck Index', subtitle: 'Combien de capital politique reste-t-il à Trump ?' },
    es: { title: 'Lame-Duck Index', subtitle: '¿Cuánto capital político le queda a Trump?' },
  },
  'canada-goose': {
    en: { title: 'Canada Goose Index', subtitle: 'How strong is Canada’s negotiating posture?' },
    fr: { title: 'Canada Goose Index', subtitle: 'Quelle est la force de la posture de négociation du Canada ?' },
    es: { title: 'Canada Goose Index', subtitle: '¿Qué tan fuerte es la postura negociadora de Canadá?' },
  },
  barrage: {
    en: { title: 'Barrage Index', subtitle: 'Does France’s republican front still hold against the RN?' },
    fr: { title: 'Barrage Index', subtitle: 'Le barrage républicain tient-il face au RN ?' },
    es: { title: 'Barrage Index', subtitle: '¿Aguanta el frente republicano francés ante el RN?' },
  },
  'cusma-showdown': {
    en: { title: 'CUSMA Showdown', subtitle: 'Who holds the leverage at the trade table?' },
    fr: { title: 'Bras de fer ACEUM', subtitle: 'Qui tient le levier à la table commerciale ?' },
    es: { title: 'Pulso del T-MEC', subtitle: '¿Quién tiene la ventaja en la mesa comercial?' },
  },
};

interface AnyZone {
  min: number;
  max: number;
  color?: string;
  label_en?: string;
  label_fr?: string;
  label_es?: string;
}

function zoneLabel(z: AnyZone, lang: Lang): string {
  if (lang === 'es') return z.label_es ?? z.label_en ?? '';
  return (lang === 'fr' ? z.label_fr : z.label_en) ?? '';
}

function activeZone(value: number, zones: AnyZone[]): AnyZone | undefined {
  return zones.find((z) => value >= z.min && value < z.max) ?? zones[zones.length - 1];
}

function fmtScore(value: number, lang: Lang): string {
  const s = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return lang === 'en' ? s : s.replace('.', ',');
}

// Repli hexa si une zone data arrivait sans couleur (satori ne lit pas var()).
const FALLBACK = '#6a635a';
const hexColor = (c?: string) => (c && c.startsWith('#') ? c : FALLBACK);

// Date localisée pour le pied de carte (asOfLabel des getters n'est pas
// localisé pour tous les instruments).
const LOC: Record<Lang, string> = { en: 'en-US', fr: 'fr-CA', es: 'es-ES' };
const AS_OF: Record<Lang, (s: string) => string> = {
  en: (s) => `As of ${s}`,
  fr: (s) => `Au ${s}`,
  es: (s) => `Al ${s}`,
};
function footerDate(iso: string | undefined, lang: Lang, fallback: string): string {
  if (!iso) return fallback;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return fallback;
  return AS_OF[lang](d.toLocaleDateString(LOC[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }));
}

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang as Lang) ?? 'en';
  const slug = params.slug as Slug;
  const copy = COPY[slug][lang];

  let scoreText: string;
  let scoreSuffix: string | undefined = '/100';
  let value: number;
  let zones: AnyZone[];
  let domain: [number, number] = [0, 100];
  let label: string;
  let footerLeft: string;

  if (slug === 'lame-duck') {
    const data = getLameDuckData(lang);
    value = data.ldi.score;
    zones = data.zones as AnyZone[];
    scoreText = fmtScore(value, lang);
    label = zoneLabel(activeZone(value, zones) ?? {} as AnyZone, lang);
    footerLeft = footerDate(data.meta?.as_of_date, lang, data.computed.asOfLabel ?? '');
  } else if (slug === 'canada-goose') {
    const data = getCanadaGooseData();
    value = data.cgi.score;
    zones = data.zones as AnyZone[];
    scoreText = fmtScore(value, lang);
    label = zoneLabel(activeZone(value, zones) ?? {} as AnyZone, lang);
    footerLeft = footerDate(data.meta?.as_of_date, lang, data.computed.asOfLabel ?? '');
  } else if (slug === 'barrage') {
    const data = getBarrageData(lang);
    value = data.bfi.score;
    zones = data.zones as AnyZone[];
    scoreText = fmtScore(value, lang);
    label = zoneLabel(activeZone(value, zones) ?? {} as AnyZone, lang);
    footerLeft = footerDate(data.meta?.as_of_date, lang, data.computed.asOfLabel ?? '');
  } else {
    // cusma-showdown : écart diverging −100..+100, pas de « /100 ».
    const data = getCusmaShowdownData();
    value = Math.max(-100, Math.min(100, data.showdown.gap));
    zones = data.zones as AnyZone[];
    domain = [-100, 100];
    scoreText = (data.showdown.gap > 0 ? '+' : '') + fmtScore(data.showdown.gap, lang);
    scoreSuffix = undefined;
    label = showdownLabel(data.showdown, lang);
    footerLeft = footerDate(data.meta?.as_of_date, lang, data.computed.asOfLabel ?? '');
  }

  const active = activeZone(value, zones);
  const cardZones: MeterCardZone[] = zones.map((z) => ({
    min: z.min,
    max: z.max,
    color: hexColor(z.color),
  }));

  const png = await renderMeterCard({
    eyebrow: EYEBROW[lang],
    title: copy.title,
    subtitle: copy.subtitle,
    scoreText,
    scoreSuffix,
    zoneLabel: label,
    zoneColor: hexColor(active?.color),
    zones: cardZones,
    domainMin: domain[0],
    domainMax: domain[1],
    value,
    footerLeft,
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
