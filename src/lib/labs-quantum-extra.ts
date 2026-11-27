// Tirages quantiques hors des pages Labs : Espagne 2026 (Orbite, sièges PP + Vox)
// et partielles fédérales du 7 décembre 2026. Lus par QuantumDrawCard (sur la
// page de l'élection) et par LabsQuantumHub (la page de tous les tirages).
import type { Locale } from './labs';

type L<T> = Record<Locale, T>;

export interface QuantumExtra {
  /** Fichiers de web_data/labs/quantum, du plus souhaité au repli. */
  files: string[];
  lead: string;
  rows: string[];
  color: string;
  partyColors: Record<string, string>;
  name: L<string>;
  href: L<string>;
  /** « Majorité selon la puce » dans la table de tous les tirages. */
  hubCell: (q: any, l: Locale, P: (v: number) => string) => string;
  shareSlug: string;
  /** Ligne de cette élection sur la fiche de partage de LabsQuantumHub. */
  shareFav: L<string>;
  shareP: (q: any, l: Locale, P: (v: number) => string) => string;
  voteDay: string;
  raceHref: (l: Locale, slug: string) => string;
  text: L<any>;
}

const BYE_BASE: L<string> = { fr: '/fr/canada/byelections/', en: '/en/canada/byelections/', es: '/es/canada/byelections/' };

export const QUANTUM_EXTRA: Record<'es_2026' | 'ca_byelections_2026_12_07', QuantumExtra> = {
  es_2026: {
    files: ['es_2026_ibm_fez', 'es_2026_ibm_marrakesh', 'es_2026_ibm_kingston'],
    lead: 'pp_vox', rows: ['pp_vox'], color: '#1D84CE', partyColors: { pp_vox: '#1D84CE' },
    name: { fr: 'Espagne 2026', en: 'Spain 2026', es: 'España 2026' },
    href: { fr: '/fr/spain/#quantique', en: '/en/spain/#quantique', es: '/es/spain/#quantique' },
    hubCell: (q, _l, P) => `PP + Vox ${P(q.parties.pp_vox.corrected_p_majority)}`,
    shareSlug: 'espagne-quantique', voteDay: '2026-11-29',
    shareFav: { fr: 'PP + Vox majoritaires', en: 'PP + Vox majority', es: 'Mayoría PP + Vox' },
    shareP: (q, _l, P) => P(q.parties.pp_vox.corrected_p_majority),
    raceHref: () => '',
    text: {
      fr: {
        title: 'Les générales espagnoles tirées sur un vrai ordinateur quantique',
        dek: (q: any) => `Orbite, notre modèle expérimental, a été mis sur une puce IBM de 156 qubits. Chaque province devient 1 à 3 qubits, réglés pour que la mesure donne le nombre de sièges du PP et de Vox avec exactement sa chance selon Orbite. Chaque mesure du circuit est une élection complète, et ${q.climates} scénarios nationaux gardent ensemble les provinces qui bougent ensemble.`,
        chartTitle: 'Sièges PP + Vox : ce que la puce a tiré',
        rowLabel: () => 'Sièges PP + Vox (moyenne)',
        pMajLabel: 'Chances de majorité (176)',
        leadLabel: 'PP + Vox majoritaires',
        simName: 'simulateur parfait',
        what: [
          'Une province espagnole élit plusieurs députés : ce qui passe par la puce, c’est le nombre de sièges du bloc PP + Vox dans chaque province, la quantité qui décide de la majorité absolue.',
          'La puce ne rend pas la prévision plus juste : le calcul exact donne la même loi sur un ordinateur ordinaire. L’écart entre les deux mesure le bruit de la machine, que la correction des erreurs de lecture réduit.',
        ],
        rowExact: 'Calcul exact d’Orbite', rowExactWhere: 'ordinateur ordinaire',
        shareTitle: 'Vote-Scope Labs', shareHeading: 'L’Espagne tirée sur un ordinateur quantique IBM',
        shareThFav: 'Issue', shareThP: 'Chances',
        shareFoot: (n: string, m: string) => `${n} élections tirées sur ${m}`,
      },
      en: {
        title: 'Spain’s general election, drawn on a real quantum computer',
        dek: (q: any) => `Orbit, our experimental model, was put on a 156-qubit IBM chip. Each province becomes 1 to 3 qubits, tuned so that measuring them returns the PP and Vox seat count with exactly its chance according to Orbit. Every measurement of the circuit is a complete election, and ${q.climates} national scenarios keep provinces that move together moving together.`,
        chartTitle: 'PP + Vox seats: what the chip drew',
        rowLabel: () => 'PP + Vox seats (average)',
        pMajLabel: 'Chance of a majority (176)',
        leadLabel: 'PP + Vox majority',
        simName: 'perfect simulator',
        what: [
          'A Spanish province elects several MPs: what goes through the chip is the PP + Vox seat count in each province, the quantity that decides an absolute majority.',
          'The chip does not make the forecast more accurate: the exact calculation gives the same distribution on an ordinary computer. The gap between the two measures the machine’s noise, which readout-error correction reduces.',
        ],
        rowExact: 'Orbit’s exact calculation', rowExactWhere: 'ordinary computer',
        shareTitle: 'Vote-Scope Labs', shareHeading: 'Spain drawn on an IBM quantum computer',
        shareThFav: 'Outcome', shareThP: 'Chance',
        shareFoot: (n: string, m: string) => `${n} elections drawn on ${m}`,
      },
      es: {
        title: 'Las generales españolas, sorteadas en un ordenador cuántico real',
        dek: (q: any) => `Órbita, nuestro modelo experimental, pasó por un chip de IBM de 156 cúbits. Cada provincia se convierte en 1 a 3 cúbits, ajustados para que al medirlos salga el número de escaños de PP y Vox exactamente con su probabilidad según Órbita. Cada medición del circuito es una elección completa, y ${q.climates} escenarios nacionales mantienen juntas las provincias que se mueven juntas.`,
        chartTitle: 'Escaños de PP + Vox: lo que sorteó el chip',
        rowLabel: () => 'Escaños de PP + Vox (media)',
        pMajLabel: 'Probabilidad de mayoría (176)',
        leadLabel: 'Mayoría de PP + Vox',
        simName: 'simulador perfecto',
        what: [
          'Una provincia española elige varios diputados: lo que pasa por el chip es el número de escaños del bloque PP + Vox en cada provincia, la cantidad que decide la mayoría absoluta.',
          'El chip no hace la previsión más precisa: el cálculo exacto da la misma distribución en un ordenador común. La diferencia entre ambos mide el ruido de la máquina, que la corrección de los errores de lectura reduce.',
        ],
        rowExact: 'Cálculo exacto de Órbita', rowExactWhere: 'ordenador común',
        shareTitle: 'Vote-Scope Labs', shareHeading: 'España sorteada en un ordenador cuántico de IBM',
        shareThFav: 'Resultado', shareThP: 'Probabilidad',
        shareFoot: (n: string, m: string) => `${n} elecciones sorteadas en ${m}`,
      },
    },
  },
  ca_byelections_2026_12_07: {
    files: ['ca_byelections_2026_12_07_ibm_fez', 'ca_byelections_2026_12_07_ibm_marrakesh', 'ca_byelections_2026_12_07_ibm_kingston'],
    lead: 'lib', rows: ['lib', 'con', 'bq'], color: '#D71920',
    partyColors: { lib: '#D71920', con: '#1A4782', bq: '#33B2CC', ndp: '#F58220', grn: '#3D9B35', ind: '#6B6B6B' },
    name: { fr: 'Partielles fédérales du 7 décembre', en: 'Federal by-elections, December 7', es: 'Parciales federales del 7 de diciembre' },
    href: { fr: `${BYE_BASE.fr}#quantique`, en: `${BYE_BASE.en}#quantique`, es: `${BYE_BASE.es}#quantique` },
    hubCell: (q, l, _P) => {
      const v = q.parties.lib.corrected_mean.toFixed(1);
      return l === 'en' ? `Liberals ${v} of 6` : l === 'es' ? `Liberales ${v.replace('.', ',')} de 6` : `Libéraux ${v.replace('.', ',')} sur 6`;
    },
    shareSlug: 'partielles-quantique', voteDay: '2026-12-07',
    shareFav: { fr: 'Sièges libéraux sur 6', en: 'Liberal seats of 6', es: 'Escaños liberales de 6' },
    shareP: (q, l) => l === 'en' ? q.parties.lib.corrected_mean.toFixed(1) : q.parties.lib.corrected_mean.toFixed(1).replace('.', ','),
    raceHref: (l, slug) => `${BYE_BASE[l]}${slug}/`,
    text: {
      fr: {
        title: 'Les six partielles tirées sur un vrai ordinateur quantique',
        dek: () => 'Chaque course devient un ou deux qubits, tournés pour que la mesure donne chaque candidat avec exactement sa chance de victoire selon notre projection. Les six courses tiennent sur un seul circuit : chaque mesure est une soirée électorale complète, six vainqueurs.',
        chartTitle: 'Sièges libéraux sur six : ce que la puce a tiré',
        rowLabel: (k: string) => ({ lib: 'Sièges libéraux (moyenne)', con: 'Sièges conservateurs (moyenne)', bq: 'Sièges bloquistes (moyenne)' } as any)[k],
        pMajLabel: '',
        leadLabel: '',
        simName: 'simulateur parfait',
        what: [
          'Les six courses sont indépendantes dans notre projection des partielles : la puce ne les relie pas entre elles. Ce qu’elle tire, c’est la soirée entière, et donc le nombre de sièges que chaque parti ramasse sur les six.',
          'La puce ne rend pas la prévision plus juste : le calcul exact est le produit des six courses. L’écart entre les deux mesure le bruit de la machine.',
        ],
        shareTitle: 'Vote-Scope Labs', shareHeading: 'Les partielles du 7 décembre tirées sur une puce quantique IBM',
        shareThFav: 'Favori', shareThP: 'Puce',
        shareFoot: (n: string, m: string) => `${n} soirées électorales tirées sur ${m}`,
      },
      en: {
        title: 'The six by-elections, drawn on a real quantum computer',
        dek: () => 'Each race becomes one or two qubits, rotated so that measuring them returns each candidate with exactly their chance of winning in our forecast. All six races fit on a single circuit: each measurement is a complete election night, six winners.',
        chartTitle: 'Liberal seats out of six: what the chip drew',
        rowLabel: (k: string) => ({ lib: 'Liberal seats (average)', con: 'Conservative seats (average)', bq: 'Bloc seats (average)' } as any)[k],
        pMajLabel: '',
        leadLabel: '',
        simName: 'perfect simulator',
        what: [
          'The six races are independent in our by-election forecast, so the chip does not link them. What it draws is the whole night, and so the number of seats each party picks up out of six.',
          'The chip does not make the forecast more accurate: the exact calculation is the product of the six races. The gap between the two measures the machine’s noise.',
        ],
        shareTitle: 'Vote-Scope Labs', shareHeading: 'The December 7 by-elections, drawn on an IBM quantum chip',
        shareThFav: 'Favourite', shareThP: 'Chip',
        shareFoot: (n: string, m: string) => `${n} election nights drawn on ${m}`,
      },
      es: {
        title: 'Las seis parciales, sorteadas en un ordenador cuántico real',
        dek: () => 'Cada contienda se convierte en uno o dos cúbits, girados para que al medirlos cada candidato salga exactamente con su probabilidad de ganar según nuestra proyección. Las seis contiendas caben en un solo circuito: cada medición es una noche electoral completa, seis ganadores.',
        chartTitle: 'Escaños liberales sobre seis: lo que sorteó el chip',
        rowLabel: (k: string) => ({ lib: 'Escaños liberales (media)', con: 'Escaños conservadores (media)', bq: 'Escaños del Bloque (media)' } as any)[k],
        pMajLabel: '',
        leadLabel: '',
        simName: 'simulador perfecto',
        what: [
          'Las seis contiendas son independientes en nuestra proyección de las parciales: el chip no las enlaza. Lo que sortea es la noche entera, y por tanto el número de escaños que cada partido suma sobre seis.',
          'El chip no hace la previsión más precisa: el cálculo exacto es el producto de las seis contiendas. La diferencia entre ambos mide el ruido de la máquina.',
        ],
        shareTitle: 'Vote-Scope Labs', shareHeading: 'Las parciales del 7 de diciembre, sorteadas en un chip cuántico de IBM',
        shareThFav: 'Favorito', shareThP: 'Chip',
        shareFoot: (n: string, m: string) => `${n} noches electorales sorteadas en ${m}`,
      },
    },
  },
};
