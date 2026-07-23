/**
 * Carte de partage des instruments (og:image, build-time, satori → PNG).
 *
 * Même famille visuelle que poll-card : papier, carte bordée, watermark
 * vote-scope.com. Montre la LECTURE COURANTE de l'instrument (score + zone
 * active + bande de zones avec repère), régénérée à chaque build — le lien
 * partagé affiche donc toujours l'état du jour, pas un PNG figé.
 *
 * Domaine paramétrable : [0,100] pour les jauges, [-100,100] pour le bras
 * de fer ACEUM (diverging).
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { el, FONTS, PAPER, CARD, INK, INK_2, INK_3, RULE, type Node } from './poll-card';

export interface MeterCardZone {
  min: number;
  max: number;
  color: string; // hex (les zones des web_data sont déjà en hexa)
}

export interface MeterCardInput {
  eyebrow: string;      // kicker mono, ex. "INSTRUMENT LIVE"
  title: string;        // titre serif, ex. "Lame-Duck Index"
  subtitle?: string;    // question de l'instrument
  scoreText: string;    // ex. "62" ou "+14"
  scoreSuffix?: string; // ex. "/100" (absent pour le diverging)
  zoneLabel: string;    // libellé de la zone active, localisé
  zoneColor: string;    // hex de la zone active
  zones: MeterCardZone[];
  domainMin?: number;   // défaut 0
  domainMax?: number;   // défaut 100
  value: number;        // position du repère sur la bande
  footerLeft: string;   // ex. "Au 22 juillet 2026"
  width?: number;
  height?: number;
}

/** Rend la carte instrument en PNG Buffer. */
export async function renderMeterCard(input: MeterCardInput): Promise<Buffer> {
  const W = input.width ?? 1200;
  const H = input.height ?? 630;
  const d0 = input.domainMin ?? 0;
  const d1 = input.domainMax ?? 100;
  const span = Math.max(1, d1 - d0);
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - d0) / span) * 100));

  // Bande de zones : segments colorés (zone active pleine) traversée par un
  // repère vertical encre à la position de la lecture (satori ne rend pas
  // l'astuce CSS du triangle en bordures, on reste sur un trait net).
  const strip = el('div', { display: 'flex', position: 'relative', marginTop: 6, height: 54 }, [
    el('div', {
      display: 'flex', position: 'absolute', left: 0, top: 4, right: 0,
      height: 46, borderRadius: 8, overflow: 'hidden',
    },
      input.zones.map((z) => {
        const active = input.value >= z.min && (input.value < z.max || z.max === d1);
        return el('div', {
          display: 'flex',
          width: `${pct(z.max) - pct(z.min)}%`,
          backgroundColor: z.color,
          opacity: active ? 1 : 0.28,
        }, '');
      }),
    ),
    el('div', {
      display: 'flex',
      position: 'absolute',
      left: `${pct(input.value)}%`,
      top: 0,
      transform: 'translateX(-3px)',
      width: 6,
      height: 54,
      borderRadius: 3,
      backgroundColor: INK,
      border: `1px solid ${CARD}`,
    }, ''),
  ]);

  const tree = el('div', {
    display: 'flex', flexDirection: 'column', width: W, height: H,
    padding: 56, backgroundColor: PAPER, position: 'relative',
  }, [
    el('div', {
      display: 'flex', flexDirection: 'column', flex: 1,
      backgroundColor: CARD, border: `1px solid ${RULE}`, borderRadius: 14,
      padding: 48, justifyContent: 'space-between',
    }, [
      // header
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, [
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontWeight: 500,
          fontSize: 22, letterSpacing: '0.14em', color: INK,
        }, 'VOTE·SCOPE'),
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 16,
          letterSpacing: '0.12em', color: INK_3,
        }, input.eyebrow),
      ]),
      // titre + question
      el('div', { display: 'flex', flexDirection: 'column', marginTop: 4 }, [
        el('div', {
          display: 'flex', fontFamily: 'Newsreader', fontWeight: 600,
          fontSize: 54, lineHeight: 1.05, color: INK, letterSpacing: '-0.01em',
        }, input.title),
        ...(input.subtitle
          ? [el('div', {
              display: 'flex', fontFamily: 'Newsreader', fontSize: 26,
              color: INK_2, marginTop: 8,
            }, input.subtitle)]
          : []),
      ]),
      // lecture : score énorme + zone
      el('div', { display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 4 }, [
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontWeight: 500,
          fontSize: 128, lineHeight: 1, color: input.zoneColor,
        }, input.scoreText),
        ...(input.scoreSuffix
          ? [el('div', {
              display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 40, color: INK_3,
            }, input.scoreSuffix)]
          : []),
        el('div', {
          display: 'flex', fontFamily: 'Newsreader', fontWeight: 600,
          fontSize: 40, color: input.zoneColor,
        }, input.zoneLabel),
      ]),
      strip,
      // footer
      el('div', {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid ${RULE}`, paddingTop: 18,
      }, [
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 16, color: INK_3,
        }, input.footerLeft),
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontWeight: 500,
          fontSize: 18, color: INK, letterSpacing: '0.04em',
        }, 'vote-scope.com'),
      ]),
    ]),
  ]);

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: FONTS,
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } })
    .render()
    .asPng();
  return Buffer.from(png);
}
