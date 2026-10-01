// Tirage quantique : l'élection tirée sur un vrai ordinateur quantique IBM
// (labs/quantum_draw.py, publié dans web_data/labs/quantum/<clé>.json).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Locale, LabsKey } from './labs';

const dir = resolve(process.cwd(), 'web_data', 'labs', 'quantum');

export function loadQuantum(key: LabsKey): any | null {
  const f = resolve(dir, `${key}.json`);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null;
}

// Tirage annoncé (avant qu'il ait lieu) : date de la veille du vote.
export const QUANTUM_PLANNED: Partial<Record<LabsKey, string>> = { qc_2026: '2026-10-04' };

export const QT = {
  fr: {
    kicker: 'Tirage quantique',
    title: 'L’élection tirée sur un vrai ordinateur quantique',
    teaserTitle: 'Rendez-vous la veille du vote',
    teaser: (d: string) => `Le ${d}, Orbite tirera l’élection sur un vrai ordinateur quantique d’IBM : une puce de 156 qubits, refroidie près du zéro absolu. Chaque mesure du circuit donnera une élection complète. On publiera le résultat ici, à côté du calcul exact, avec l’écart dû au bruit de la machine.`,
    dek: (n: number) => `Chaque circonscription disputée devient un ou deux qubits, réglés pour que la mesure donne chaque parti avec exactement sa chance selon Orbite. Chaque mesure du circuit est une élection complète. On a répété l’expérience des milliers de fois, sur ${n} scénarios provinciaux.`,
    machine: 'Machine',
    when: 'Tirage',
    drawn: 'Élections tirées',
    qubits: 'Qubits par circuit',
    seconds: 'Temps de machine',
    chartTitle: (p: string) => `Sièges du ${p} : ce que la machine a tiré`,
    legendDrawn: 'Tirage brut de la machine',
    legendCorrected: 'Après correction des erreurs de lecture',
    legendExact: 'Calcul exact d’Orbite',
    majority: (n: number) => `Majorité (${n})`,
    colParty: 'Parti',
    colExact: 'Calcul exact',
    colRaw: 'Machine, brut',
    colCorrected: 'Machine, corrigé',
    seatsNote: 'Sièges moyens par parti',
    pMaj: 'Chances de majorité',
    whatTitle: 'Ce que ça montre, et ce que ça ne montre pas',
    what: [
      'Ça montre qu’un ordinateur quantique réel sait déjà tirer une élection à l’échelle du Québec, et à quel point son bruit la déforme : les qubits basculent parfois, ce qui redonne des circonscriptions aux partis moins probables.',
      'La correction des erreurs de lecture, calibrée par IBM pour chaque qubit, efface une bonne partie de cet écart. Le reste vient des opérations entre qubits.',
      'Ça ne rend pas la prévision plus juste : Orbite calcule déjà la même loi exactement, sur un ordinateur ordinaire. C’est une expérience scientifique, faite au grand jour.',
    ],
    jobs: 'Tâches IBM',
    sec: 's',
  },
  en: {
    kicker: 'Quantum draw',
    title: 'The election, drawn on a real quantum computer',
    teaserTitle: 'See you the day before the vote',
    teaser: (d: string) => `On ${d}, Orbit will draw the election on a real IBM quantum computer: a 156-qubit chip cooled close to absolute zero. Every measurement of the circuit will produce a complete election. We will publish the result here, next to the exact calculation, with the gap caused by the machine’s noise.`,
    dek: (n: number) => `Each contested riding becomes one or two qubits, tuned so that measuring them returns each party with exactly its chance according to Orbit. Every measurement of the circuit is a complete election. We repeated the experiment thousands of times, across ${n} provincial scenarios.`,
    machine: 'Machine',
    when: 'Draw',
    drawn: 'Elections drawn',
    qubits: 'Qubits per circuit',
    seconds: 'Machine time',
    chartTitle: (p: string) => `${p} seats: what the machine drew`,
    legendDrawn: 'Raw draw from the machine',
    legendCorrected: 'After readout-error correction',
    legendExact: 'Orbit’s exact calculation',
    majority: (n: number) => `Majority (${n})`,
    colParty: 'Party',
    colExact: 'Exact',
    colRaw: 'Machine, raw',
    colCorrected: 'Machine, corrected',
    seatsNote: 'Average seats by party',
    pMaj: 'Chance of a majority',
    whatTitle: 'What this shows, and what it does not',
    what: [
      'It shows that a real quantum computer can already draw an election at the scale of Quebec, and how much its noise distorts it: qubits sometimes flip, handing ridings to less likely parties.',
      'Readout-error correction, calibrated by IBM for every qubit, removes a good share of that gap. The rest comes from operations between qubits.',
      'It does not make the forecast more accurate: Orbit already computes the same distribution exactly, on an ordinary computer. It is a scientific experiment, run in the open.',
    ],
    jobs: 'IBM jobs',
    sec: 's',
  },
  es: {
    kicker: 'Sorteo cuántico',
    title: 'La elección, sorteada en un verdadero ordenador cuántico',
    teaserTitle: 'Cita la víspera de la votación',
    teaser: (d: string) => `El ${d}, Órbita sorteará la elección en un verdadero ordenador cuántico de IBM: un chip de 156 cúbits enfriado cerca del cero absoluto. Cada medición del circuito dará una elección completa. Publicaremos el resultado aquí, junto al cálculo exacto, con la diferencia debida al ruido de la máquina.`,
    dek: (n: number) => `Cada circunscripción disputada se convierte en uno o dos cúbits, ajustados para que al medirlos cada partido salga exactamente con su probabilidad según Órbita. Cada medición del circuito es una elección completa. Repetimos el experimento miles de veces, en ${n} escenarios provinciales.`,
    machine: 'Máquina',
    when: 'Sorteo',
    drawn: 'Elecciones sorteadas',
    qubits: 'Cúbits por circuito',
    seconds: 'Tiempo de máquina',
    chartTitle: (p: string) => `Escaños del ${p}: lo que sorteó la máquina`,
    legendDrawn: 'Sorteo bruto de la máquina',
    legendCorrected: 'Tras corregir los errores de lectura',
    legendExact: 'Cálculo exacto de Órbita',
    majority: (n: number) => `Mayoría (${n})`,
    colParty: 'Partido',
    colExact: 'Exacto',
    colRaw: 'Máquina, bruto',
    colCorrected: 'Máquina, corregido',
    seatsNote: 'Escaños medios por partido',
    pMaj: 'Probabilidad de mayoría',
    whatTitle: 'Lo que muestra, y lo que no',
    what: [
      'Muestra que un ordenador cuántico real ya puede sortear una elección a la escala de Quebec, y cuánto la deforma su ruido: a veces los cúbits se voltean y entregan circunscripciones a partidos menos probables.',
      'La corrección de los errores de lectura, calibrada por IBM para cada cúbit, borra buena parte de esa diferencia. El resto proviene de las operaciones entre cúbits.',
      'No hace la previsión más precisa: Órbita ya calcula la misma distribución exactamente, en un ordenador común. Es un experimento científico, hecho a la vista de todos.',
    ],
    jobs: 'Tareas de IBM',
    sec: 's',
  },
} as const satisfies Record<Locale, unknown>;
