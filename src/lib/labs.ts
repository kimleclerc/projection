// VoteScope Labs — lecture des sorties du moteur expérimental (web_data/labs)
// et textes des pages, en trois langues.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { partyMeta, partyMark } from './riding-adapters/parties';

export type Locale = 'fr' | 'en' | 'es';
export type LabsKey = 'qc_2026' | 'bc_44' | 'fed_46' | 'on_2029' | 'uk_2029' | 'fr_pres_2027' | 'fr_leg' | 'us_senate' | 'us_house' | 'us_governor';

export const LABS_KEYS: LabsKey[] = ['qc_2026', 'bc_44', 'fed_46', 'on_2029', 'uk_2029', 'fr_pres_2027', 'fr_leg', 'us_senate', 'us_house', 'us_governor'];

export const SLUGS: Record<Locale, Record<LabsKey, string>> = {
  fr: { qc_2026: 'quebec', bc_44: 'colombie-britannique', fed_46: 'federal', on_2029: 'ontario', uk_2029: 'royaume-uni', fr_pres_2027: 'presidentielle-france', fr_leg: 'legislatives-france', us_senate: 'senat', us_house: 'chambre', us_governor: 'gouverneurs' },
  en: { qc_2026: 'quebec', bc_44: 'british-columbia', fed_46: 'federal', on_2029: 'ontario', uk_2029: 'united-kingdom', fr_pres_2027: 'france-presidential', fr_leg: 'france-legislative', us_senate: 'senate', us_house: 'house', us_governor: 'governors' },
  es: { qc_2026: 'quebec', bc_44: 'columbia-britanica', fed_46: 'federal', on_2029: 'ontario', uk_2029: 'reino-unido', fr_pres_2027: 'presidencial-francia', fr_leg: 'legislativas-francia', us_senate: 'senado', us_house: 'camara', us_governor: 'gobernadores' },
};

export const MAIN_PAGES: Record<Locale, Record<LabsKey, string>> = {
  fr: { qc_2026: '/fr/canada/quebec/', bc_44: '/fr/canada/colombie-britannique/', fed_46: '/fr/canada/federal/', on_2029: '/fr/canada/ontario/', uk_2029: '/fr/uk/general-election/', fr_pres_2027: '/fr/france/presidentielle/', fr_leg: '/fr/france/legislatives/', us_senate: '/fr/us/senat/', us_house: '/fr/us/chambre/', us_governor: '/fr/us/gouverneurs/' },
  en: { qc_2026: '/en/canada/quebec/', bc_44: '/en/canada/british-columbia/', fed_46: '/en/canada/federal/', on_2029: '/en/canada/ontario/', uk_2029: '/en/uk/general-election/', fr_pres_2027: '/en/france/presidential/', fr_leg: '/en/france/legislative-election/', us_senate: '/en/us/senate/', us_house: '/en/us/house/', us_governor: '/en/us/governors/' },
  es: { qc_2026: '/es/canada/quebec/', bc_44: '/es/canada/columbia-britanica/', fed_46: '/es/canada/federal/', on_2029: '/es/canada/ontario/', uk_2029: '/es/uk/general-election/', fr_pres_2027: '/es/france/presidencial/', fr_leg: '/es/france/legislativas/', us_senate: '/es/us/senate/', us_house: '/es/us/house/', us_governor: '/es/us/gobernadores/' },
};

export const LABS_ROOT: Record<Locale, string> = { fr: '/fr/labs/', en: '/en/labs/', es: '/es/labs/' };

export function labsUrl(locale: Locale, key?: LabsKey): string {
  return key ? `${LABS_ROOT[locale]}${SLUGS[locale][key]}/` : LABS_ROOT[locale];
}

export function keyFromSlug(locale: Locale, slug: string): LabsKey | undefined {
  return LABS_KEYS.find((k) => SLUGS[locale][k] === slug);
}

const dir = resolve(process.cwd(), 'web_data', 'labs');

// Disposition publiée par la nuit (labs/run_labs.py --publish-dir) :
// labs/latest.json (date du run, index, backtests) + labs/desks/<clé>.json.
export function hasLabs(key: LabsKey): boolean {
  return existsSync(resolve(dir, 'desks', `${key}.json`));
}

export function loadLabs(key: LabsKey): any {
  return JSON.parse(readFileSync(resolve(dir, 'desks', `${key}.json`), 'utf-8'));
}

export function loadBacktests(): any | null {
  const f = resolve(dir, 'latest.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')).backtests ?? null : null;
}

// Libellés, couleurs et logos : la palette COMMUNE du site (celle des pages de
// projection), pour que les pages Labs parlent le même langage visuel.
export function partyLabel(data: any, party: string, locale: Locale): string {
  const m = partyMeta(data.desk, party);
  const txt = locale === 'fr' ? m.label_fr : m.label_en;
  if (txt && txt.toUpperCase() !== party.toUpperCase()) return txt;
  const l = data.labels?.[party];
  return (locale === 'fr' ? l?.fr : l?.en) || party.replace(/^(bc|qc|us|uk|on)_/, '').toUpperCase();
}

export function partyColor(data: any, party: string): string {
  const m = partyMeta(data.desk, party);
  return m.color && m.color !== '#999' ? m.color : (data.labels?.[party]?.color || '#888888');
}

export function partyIcon(data: any, party: string): string | undefined {
  return partyMark(partyMeta(data.desk, party));
}

export type SeatSeg = { party: string; seats: number; color: string; label: string; icon?: string };
export type Comparison = {
  total: number;
  threshold: number | null;
  orbit: SeatSeg[];
  reference: SeatSeg[];
  leaderOrbit: string;
  leaderRef: string;
  verdict: 'same' | 'status' | 'different';
  pOrbit: number | null;       // P(majorité / contrôle) du meneur Orbite
  pRef: number | null;         // même chose côté référence
  blend: SeatSeg[] | null;     // mélange 50/50 des deux moteurs (sièges gagnés)
  leaderBlend: string | null;
  pBlend: number | null;       // P(majorité / contrôle) du meneur du mélange
};

/** Orbite contre la projection de référence, en sièges gagnés. */
// Présidentielle : on compare les CHANCES DE VICTOIRE (sur 100) du scénario
// le plus sondé, à la place des sièges.
export function frCandidateColor(d: any, id: string): string {
  const bloc = d.names?.[id]?.bloc;
  const m = bloc ? partyMeta('france', bloc) : null;
  return m && m.color && m.color !== '#999' ? m.color : '#888888';
}

function comparePresidential(d: any): Comparison {
  const sc = d.scenarios?.[0];
  const name = (id: string) => d.names?.[id]?.short ?? id;
  const mk = (id: string, v: number): SeatSeg => ({ party: id, seats: Math.round(100 * v), color: frCandidateColor(d, id), label: name(id) });
  const orbit = (sc?.candidates ?? []).filter((c: any) => (c.p_win ?? 0) >= 0.005 || (sc?.prod?.[c.id]?.p_win ?? 0) >= 0.005)
    .sort((a: any, b: any) => (b.p_win ?? 0) - (a.p_win ?? 0)).map((c: any) => mk(c.id, c.p_win ?? 0));
  const reference = orbit.map((s) => ({ ...s, seats: Math.round(100 * (sc?.prod?.[s.party]?.p_win ?? 0)) }));
  const lead = (xs: SeatSeg[]) => [...xs].sort((a, b) => b.seats - a.seats)[0]?.party ?? '';
  const leaderOrbit = lead(orbit), leaderRef = lead(reference);
  const pO = sc?.candidates?.find((c: any) => c.id === leaderOrbit)?.p_win ?? null;
  return { total: 100, threshold: null, orbit, reference, leaderOrbit, leaderRef,
           verdict: leaderOrbit === leaderRef ? 'same' : 'different',
           pOrbit: pO, pRef: sc?.prod?.[leaderOrbit]?.p_win ?? null,
           blend: null, leaderBlend: null, pBlend: null };
}

export function compare(key: LabsKey, d: any, locale: Locale): Comparison {
  if (d?.kind === 'presidential') return comparePresidential(d);
  const isUS = key.startsWith('us_');
  const seg = (party: string, seats: number): SeatSeg => ({
    party, seats, color: partyColor(d, party), label: partyLabel(d, party, locale), icon: partyIcon(d, party),
  });
  let orbit: SeatSeg[] = [];
  let ref: Record<string, number> = {};
  let total = 0;
  let threshold: number | null = null;
  const pOrbitBy: Record<string, number | null> = {};
  const pRefBy: Record<string, number | null> = {};
  if (!isUS) {
    orbit = d.parties.map((x: any) => seg(x.party, x.seats_favored));
    for (const x of d.prod?.parties ?? []) { ref[x.party] = x.seats ?? 0; pRefBy[x.party] = x.p_majority ?? null; }
    for (const x of d.parties) pOrbitBy[x.party] = x.seats.p_majority;
    total = d.total_seats;
    threshold = d.majority;
  } else if (key === 'us_governor') {
    orbit = d.parties.map((x: any) => seg(x.party, x.seats_favored));
    const races = d.prod?.races ?? {};
    for (const r of Object.values(races) as any[]) ref[r.winner] = (ref[r.winner] ?? 0) + 1;
    total = d.races.length;
  } else {
    orbit = d.parties.map((x: any) => seg(x.party, x.seats_favored));
    for (const x of d.prod?.parties ?? []) { ref[x.party] = x.seats ?? 0; pRefBy[x.party] = x.p_majority ?? null; }
    for (const x of d.parties) pOrbitBy[x.party] = x.p_control;
    total = key === 'us_senate' ? 100 : 435;
    threshold = key === 'us_senate' ? 51 : 218;
  }
  const blendRaw: any[] | null = d.prod?.blend?.parties ?? null;
  const mix: Record<string, number> = {};
  const pBlendBy: Record<string, number | null> = {};
  for (const x of blendRaw ?? []) { mix[x.party] = x.seats_favored ?? 0; pBlendBy[x.party] = x.p_majority ?? null; }
  orbit = orbit.filter((x) => x.seats > 0 || (ref[x.party] ?? 0) > 0 || (mix[x.party] ?? 0) > 0)
    .sort((a, b) => b.seats - a.seats);
  const reference = orbit.map((x) => ({ ...x, seats: ref[x.party] ?? 0 }));
  const blend = blendRaw ? orbit.map((x) => ({ ...x, seats: mix[x.party] ?? 0 })) : null;
  const lead = (xs: SeatSeg[]) => [...xs].sort((a, b) => b.seats - a.seats)[0]?.party ?? '';
  const leaderOrbit = lead(orbit);
  const leaderRef = lead(reference);
  let verdict: Comparison['verdict'] = leaderOrbit === leaderRef ? 'same' : 'different';
  if (verdict === 'same' && threshold !== null) {
    const o = orbit.find((x) => x.party === leaderOrbit)!.seats >= threshold;
    const r = reference.find((x) => x.party === leaderRef)!.seats >= threshold;
    if (o !== r) verdict = 'status';
  }
  const leaderBlend = blend ? lead(blend) : null;
  return { total, threshold, orbit, reference, leaderOrbit, leaderRef, verdict,
           pOrbit: pOrbitBy[leaderOrbit] ?? null, pRef: pRefBy[leaderOrbit] ?? null,
           blend, leaderBlend,
           pBlend: leaderBlend && !(key === 'us_governor') ? (pBlendBy[leaderBlend] ?? null) : null };
}

const NUM_LOCALE: Record<Locale, string> = { fr: 'fr-CA', en: 'en-US', es: 'es-ES' };

export function fmt(n: number | null | undefined, locale: Locale, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString(NUM_LOCALE[locale], { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function pct(p: number | null | undefined, locale: Locale): string {
  if (p === null || p === undefined) return '—';
  const v = 100 * p;
  const txt = v > 99 ? '> 99' : v < 1 ? '< 1' : fmt(v, locale, 0);
  return locale === 'en' ? `${txt}%` : `${txt} %`;
}

export function fmtDate(iso: string, locale: Locale): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(NUM_LOCALE[locale], { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Textes ────────────────────────────────────────────────────────────────
export const NAMES: Record<LabsKey, Record<Locale, string>> = {
  qc_2026: { fr: 'Québec 2026', en: 'Quebec 2026', es: 'Quebec 2026' },
  bc_44: { fr: 'Colombie-Britannique 2026', en: 'British Columbia 2026', es: 'Columbia Británica 2026' },
  fed_46: { fr: 'Canada (fédéral)', en: 'Canada (federal)', es: 'Canadá (federal)' },
  on_2029: { fr: 'Ontario', en: 'Ontario', es: 'Ontario' },
  uk_2029: { fr: 'Royaume-Uni', en: 'United Kingdom', es: 'Reino Unido' },
  fr_pres_2027: { fr: 'Présidentielle française 2027', en: 'French presidential 2027', es: 'Presidencial francesa 2027' },
  fr_leg: { fr: 'Législatives françaises', en: 'French legislative election', es: 'Legislativas francesas' },
  us_senate: { fr: 'Sénat américain 2026', en: 'U.S. Senate 2026', es: 'Senado de EE. UU. 2026' },
  us_house: { fr: 'Chambre des représentants 2026', en: 'U.S. House 2026', es: 'Cámara de Representantes 2026' },
  us_governor: { fr: 'Gouverneurs américains 2026', en: 'U.S. Governors 2026', es: 'Gobernadores de EE. UU. 2026' },
};

export const T = {
  fr: {
    brand: 'VoteScope Labs',
    engine: 'Orbite',
    tags: ['Quantique', 'Relativiste', 'Qubits'],
    live: 'Expérience en cours',
    updated: 'Mis à jour le',
    hubTitle: 'Et si on prévoyait une élection avec la physique d’Einstein?',
    hubDek: 'Orbite, c’est notre moteur expérimental. Il lit exactement les mêmes sondages que notre projection de référence, mais avec une tout autre mécanique : l’opinion y voyage sur une sphère courbe, comme une planète sur son orbite, et les sièges se comptent avec des qubits plutôt qu’avec des dés. Chaque nuit, les deux moteurs tournent côte à côte. Quand ils s’entendent, le signal est fort. Quand ils se contredisent, c’est là que ça devient intéressant.',
    whyTitle: 'Pourquoi « Orbite »?',
    whyBody: 'Selon Einstein, la Terre ne tourne pas autour du Soleil parce qu’une force la tire : elle suit le chemin le plus droit possible dans un espace que le Soleil a courbé. Notre moteur fait pareil avec l’opinion publique : il la suit le long de sa trajectoire la plus naturelle, sur une surface courbe.',
    deskDek: 'Mêmes sondages, autre physique. Voici ce que voit Orbite, notre moteur quantique, à côté de Harfang des neiges, notre modèle classique.',
    compareTitle: 'Orbite (quantique) contre Harfang des neiges (classique) : d’accord ou pas?',
    compareHub: 'Partout où Orbite tourne',
    compareHubNote: 'Sièges gagnés : le nombre de circonscriptions où chaque parti est favori. La barre du haut, c’est Orbite, notre moteur quantique; celle du milieu, Harfang des neiges, notre modèle classique; celle du bas, le mélange 50/50 des deux.',
    blend: 'Mélange 50/50',
    blendTitle: 'Et si on écoutait les deux moteurs à la fois?',
    blendBody: 'Le mélange donne à chaque circonscription la moyenne des chances annoncées par Orbite et par notre projection de référence, puis compte les favoris. Sur nos rejeux du Québec (2018 et 2022, veille du vote), ce mélange a toujours fait mieux que la projection de référence seule : en 2018, l’erreur passe de 6,5 à 4,5 sièges, et les probabilités annoncées deviennent nettement plus fiables. Le partage 50/50 est un choix de principe, pas un réglage ajusté sur ces deux élections. Le 5 octobre sera son premier vrai test à l’aveugle.',
    orbit: 'Orbite (quantique)',
    reference: 'Harfang (classique)',
    verdict: { same: 'D’accord', status: 'Même gagnant, verdict différent sur la majorité', different: 'Désaccord : gagnant différent' },
    majorityLine: (n: number) => `Majorité : ${n}`,
    controlLine: (n: number) => `Contrôle : ${n}`,
    favorite: 'Le favori d’Orbite',
    chanceFirst: 'de chances de finir premier',
    seatsWon: 'Sièges gagnés',
    majority: 'Chances de majorité',
    win: 'Chances de victoire',
    control: 'Chances de contrôle',
    agreement: 'Même favori que Harfang des neiges',
    agreementNote: 'des circonscriptions',
    partiesTitle: 'Parti par parti',
    voteTitle: 'Le vote, avec sa marge d’incertitude',
    voteNote: 'La barre pleine, c’est le vote projeté par Orbite; le trait fin, 8 chances sur 10; le repère noir, notre projection de référence.',
    vote: 'Vote',
    range80: '8 chances sur 10 entre',
    and: 'et',
    vsRef: 'Harfang',
    divergeTitle: 'Là où les deux moteurs ne s’entendent pas',
    divergeNone: 'Les deux moteurs désignent le même favori partout.',
    racesTitle: 'Les courses les plus serrées selon Orbite',
    race: 'Course',
    polls: 'Sondages',
    chanceD: 'Chances démocrates',
    generic: 'Vote générique selon Orbite',
    wins: 'Victoires',
    days: 'Jours avant le vote',
    nowcastLabel: 'Horizon',
    nowcastValue: 'Élection aujourd’hui',
    nowcastNote: 'Aucune date de scrutin fixée : projection si l’élection avait lieu aujourd’hui, comme notre projection de référence.',
    instruments: 'Les instruments d’Orbite',
    moved: 'Électeurs qui ont changé de camp depuis la dernière élection',
    movedNote: 'au minimum, en points de l’électorat',
    spread: 'Écart moyen entre sondeurs',
    spreadNote: 'points, autour de l’état le plus probable',
    cone: 'Cône des possibles d’ici le vote',
    coneNote: 'points de mouvement maximal pour un parti à',
    backtests: 'Le test du passé',
    backtestsNote: 'On a rejoué les élections passées avec les seuls sondages connus la veille du vote. Voici l’écart moyen, par parti, entre les sièges gagnés projetés et les vrais résultats — la même mesure que notre historique de précision. Plus c’est bas, mieux c’est.',
    election: 'Élection',
    errOrbit: 'Écart Orbite',
    errRef: 'Écart Harfang',
    ridingsRight: 'Circonscriptions justes (Orbite)',
    notAvailable: 'non rejouée',
    howTitle: 'Comment Orbite fonctionne, en trois idées',
    how: [
      ['L’opinion voyage sur une sphère', 'Un 2 % de plus ne veut pas dire la même chose pour un parti à 5 % et pour un parti à 40 %. En posant l’opinion sur une sphère courbe, Orbite le sait d’instinct, et il transporte le mouvement national jusqu’à chaque circonscription comme on transporte une flèche sur un globe.'],
      ['Les sondages sont des mesures', 'Comme en physique quantique, chaque sondage est une mesure d’un état caché : l’électorat. Orbite suit cet état jour après jour, efface le biais propre à chaque sondeur et ne laisse personne dicter la moyenne à lui seul.'],
      ['Des qubits au lieu des dés', 'Chaque circonscription devient un petit registre quantique. Au lieu de lancer les dés 50 000 fois, Orbite compte les sièges exactement, en quelques secondes. Un vrai circuit quantique donne le même résultat, au milliardième près.'],
    ],
    experimentTitle: 'Science en cours',
    experiment: 'Orbite est une expérience, et on la mène au grand jour. Il n’a pas encore autant fait ses preuves que notre projection de référence : c’est pour ça qu’on publie les deux, et qu’on vous montre le test du passé. Jugez sur pièces.',
    goMain: 'Voir la projection de référence',
    goHub: 'Tous les résultats d’Orbite',
    openDesk: 'Voir la projection',
    usNotValidated: 'Aucune élection américaine passée n’a encore été rejouée dans Orbite : ces chiffres n’ont pas d’historique de précision.',
    readMore: 'Pour les curieux',
    hubDesks: 'Les projections d’Orbite',
  },
  en: {
    brand: 'VoteScope Labs',
    engine: 'Orbit',
    tags: ['Quantum', 'Relativistic', 'Qubits'],
    live: 'Live experiment',
    updated: 'Updated',
    hubTitle: 'What if you forecast an election with Einstein’s physics?',
    hubDek: 'Orbit is our experimental engine. It reads exactly the same polls as our reference forecast, but with completely different machinery: opinion travels on a curved sphere, like a planet on its orbit, and seats are counted with qubits instead of dice. Every night, both engines run side by side. When they agree, the signal is strong. When they clash, that is where it gets interesting.',
    whyTitle: 'Why “Orbit”?',
    whyBody: 'According to Einstein, Earth does not circle the Sun because a force pulls it: it follows the straightest possible path through a space the Sun has curved. Our engine does the same with public opinion: it follows its most natural path across a curved surface.',
    deskDek: 'Same polls, different physics. Here is what Orbit, our quantum engine, sees next to Harfang des neiges, our classical model.',
    compareTitle: 'Orbit (quantum) vs. Harfang des neiges (classical): do they agree?',
    compareHub: 'Everywhere Orbit is running',
    compareHubNote: 'Seats won: the number of ridings where each party is the favourite. The top bar is Orbit, our quantum engine; the middle one, Harfang des neiges, our classical model; the bottom one, a 50/50 blend of both.',
    blend: '50/50 blend',
    blendTitle: 'What if we listened to both engines at once?',
    blendBody: 'The blend gives each riding the average of the chances announced by Orbit and by our reference forecast, then counts the favourites. In our Quebec replays (2018 and 2022, the day before the vote), the blend always beat the reference forecast alone: in 2018 the error drops from 6.5 to 4.5 seats, and the announced probabilities become far more reliable. The 50/50 split is a choice of principle, not a setting tuned on those two elections. October 5 will be its first real blind test.',
    orbit: 'Orbit (quantum)',
    reference: 'Harfang (classical)',
    verdict: { same: 'They agree', status: 'Same winner, different call on the majority', different: 'They disagree: different winner' },
    majorityLine: (n: number) => `Majority: ${n}`,
    controlLine: (n: number) => `Control: ${n}`,
    favorite: 'Orbit’s favourite',
    chanceFirst: 'chance of finishing first',
    seatsWon: 'Seats won',
    majority: 'Chance of a majority',
    win: 'Chance of winning',
    control: 'Chance of control',
    agreement: 'Same favourite as Harfang des neiges',
    agreementNote: 'of ridings',
    partiesTitle: 'Party by party',
    voteTitle: 'The vote, with its margin of uncertainty',
    voteNote: 'The solid bar is Orbit’s projected vote; the thin line, an 8-in-10 range; the black tick, our reference forecast.',
    vote: 'Vote',
    range80: '8 in 10 chance between',
    and: 'and',
    vsRef: 'Harfang',
    divergeTitle: 'Where the two engines disagree',
    divergeNone: 'Both engines name the same favourite everywhere.',
    racesTitle: 'The closest races according to Orbit',
    race: 'Race',
    polls: 'Polls',
    chanceD: 'Democratic chances',
    generic: 'Generic ballot according to Orbit',
    wins: 'Wins',
    days: 'Days to election',
    nowcastLabel: 'Horizon',
    nowcastValue: 'Election today',
    nowcastNote: 'No election date set: forecast if the election were held today, like our reference forecast.',
    instruments: 'Orbit’s instruments',
    moved: 'Voters who switched sides since the last election',
    movedNote: 'at least, in points of the electorate',
    spread: 'Average gap between pollsters',
    spreadNote: 'points, around the most likely state',
    cone: 'Cone of possibilities until election day',
    coneNote: 'points of maximum movement for a party at',
    backtests: 'The test of the past',
    backtestsNote: 'We replayed past elections using only the polls known the day before the vote. Here is the average gap, per party, between projected seats won and the real results — the same measure as our track record. Lower is better.',
    election: 'Election',
    errOrbit: 'Orbit gap',
    errRef: 'Harfang gap',
    ridingsRight: 'Ridings called right (Orbit)',
    notAvailable: 'not replayed',
    howTitle: 'How Orbit works, in three ideas',
    how: [
      ['Opinion travels on a sphere', 'A 2-point gain does not mean the same thing for a party at 5% and a party at 40%. By placing opinion on a curved sphere, Orbit knows this by instinct, and it carries the national swing to each riding the way you carry an arrow across a globe.'],
      ['Polls are measurements', 'As in quantum physics, each poll is a measurement of a hidden state: the electorate. Orbit tracks that state day after day, erases each pollster’s own lean and lets no one dictate the average alone.'],
      ['Qubits instead of dice', 'Each riding becomes a small quantum register. Instead of rolling dice 50,000 times, Orbit counts the seats exactly, in seconds. A real quantum circuit gives the same answer, to the billionth.'],
    ],
    experimentTitle: 'Science in progress',
    experiment: 'Orbit is an experiment, and we run it in the open. It has not yet proven itself as much as our reference forecast: that is why we publish both, and show you the test of the past. Judge for yourself.',
    goMain: 'See the reference forecast',
    goHub: 'All of Orbit’s results',
    openDesk: 'See the forecast',
    usNotValidated: 'No past U.S. election has been replayed in Orbit yet: these numbers have no accuracy record.',
    readMore: 'For the curious',
    hubDesks: 'Orbit’s forecasts',
  },
  es: {
    brand: 'VoteScope Labs',
    engine: 'Órbita',
    tags: ['Cuántico', 'Relativista', 'Qubits'],
    live: 'Experimento en curso',
    updated: 'Actualizado el',
    hubTitle: '¿Y si pronosticáramos una elección con la física de Einstein?',
    hubDek: 'Órbita es nuestro motor experimental. Lee exactamente las mismas encuestas que nuestra proyección de referencia, pero con una mecánica completamente distinta: la opinión viaja sobre una esfera curva, como un planeta en su órbita, y los escaños se cuentan con qubits en lugar de dados. Cada noche, los dos motores funcionan lado a lado. Cuando coinciden, la señal es fuerte. Cuando se contradicen, ahí se pone interesante.',
    whyTitle: '¿Por qué «Órbita»?',
    whyBody: 'Según Einstein, la Tierra no gira alrededor del Sol porque una fuerza la atraiga: sigue el camino más recto posible en un espacio que el Sol ha curvado. Nuestro motor hace lo mismo con la opinión pública: la sigue por su trayectoria más natural sobre una superficie curva.',
    deskDek: 'Mismas encuestas, otra física. Esto es lo que ve Órbita, nuestro motor cuántico, junto a Harfang des neiges, nuestro modelo clásico.',
    compareTitle: 'Órbita (cuántico) frente a Harfang des neiges (clásico): ¿coinciden?',
    compareHub: 'Dondequiera que funcione Órbita',
    compareHubNote: 'Escaños ganados: el número de circunscripciones donde cada partido es favorito. La barra de arriba es Órbita, nuestro motor cuántico; la del medio, Harfang des neiges, nuestro modelo clásico; la de abajo, la mezcla 50/50 de ambas.',
    blend: 'Mezcla 50/50',
    blendTitle: '¿Y si escucháramos a los dos motores a la vez?',
    blendBody: 'La mezcla da a cada circunscripción el promedio de las probabilidades anunciadas por Órbita y por nuestra proyección de referencia, y luego cuenta los favoritos. En nuestras simulaciones de Quebec (2018 y 2022, víspera de la votación), la mezcla siempre superó a la proyección de referencia sola: en 2018 el error baja de 6,5 a 4,5 escaños, y las probabilidades anunciadas son mucho más fiables. El reparto 50/50 es una decisión de principio, no un ajuste hecho sobre esas dos elecciones. El 5 de octubre será su primera prueba real a ciegas.',
    orbit: 'Órbita (cuántico)',
    reference: 'Harfang (clásico)',
    verdict: { same: 'Coinciden', status: 'Mismo ganador, distinto veredicto sobre la mayoría', different: 'No coinciden: ganador distinto' },
    majorityLine: (n: number) => `Mayoría: ${n}`,
    controlLine: (n: number) => `Control: ${n}`,
    favorite: 'El favorito de Órbita',
    chanceFirst: 'de probabilidad de terminar primero',
    seatsWon: 'Escaños ganados',
    majority: 'Probabilidad de mayoría',
    win: 'Probabilidad de victoria',
    control: 'Probabilidad de control',
    agreement: 'Mismo favorito que Harfang des neiges',
    agreementNote: 'de las circunscripciones',
    partiesTitle: 'Partido por partido',
    voteTitle: 'El voto, con su margen de incertidumbre',
    voteNote: 'La barra llena es el voto proyectado por Órbita; la línea fina, 8 de cada 10; la marca negra, nuestra proyección de referencia.',
    vote: 'Voto',
    range80: '8 de cada 10 entre',
    and: 'y',
    vsRef: 'Harfang',
    divergeTitle: 'Donde los dos motores no coinciden',
    divergeNone: 'Los dos motores señalan el mismo favorito en todas partes.',
    racesTitle: 'Las contiendas más reñidas según Órbita',
    race: 'Contienda',
    polls: 'Encuestas',
    chanceD: 'Probabilidad demócrata',
    generic: 'Voto genérico según Órbita',
    wins: 'Victorias',
    days: 'Días para la votación',
    nowcastLabel: 'Horizonte',
    nowcastValue: 'Elección hoy',
    nowcastNote: 'Sin fecha electoral fijada: proyección si la elección fuera hoy, como nuestra proyección de referencia.',
    instruments: 'Los instrumentos de Órbita',
    moved: 'Votantes que cambiaron de bando desde la última elección',
    movedNote: 'como mínimo, en puntos del electorado',
    spread: 'Diferencia media entre encuestadoras',
    spreadNote: 'puntos, alrededor del estado más probable',
    cone: 'Cono de lo posible hasta la votación',
    coneNote: 'puntos de movimiento máximo para un partido al',
    backtests: 'La prueba del pasado',
    backtestsNote: 'Repetimos elecciones pasadas usando solo las encuestas conocidas la víspera. Esta es la diferencia media, por partido, entre los escaños ganados proyectados y los resultados reales — la misma medida que nuestro historial de precisión. Cuanto más bajo, mejor.',
    election: 'Elección',
    errOrbit: 'Diferencia Órbita',
    errRef: 'Diferencia Harfang',
    ridingsRight: 'Circunscripciones acertadas (Órbita)',
    notAvailable: 'no repetida',
    howTitle: 'Cómo funciona Órbita, en tres ideas',
    how: [
      ['La opinión viaja sobre una esfera', 'Ganar 2 puntos no significa lo mismo para un partido al 5 % que para uno al 40 %. Al situar la opinión sobre una esfera curva, Órbita lo sabe por instinto, y traslada el movimiento nacional a cada circunscripción como quien transporta una flecha sobre un globo.'],
      ['Las encuestas son mediciones', 'Como en física cuántica, cada encuesta es la medición de un estado oculto: el electorado. Órbita sigue ese estado día tras día, borra el sesgo propio de cada encuestadora y no deja que nadie dicte solo el promedio.'],
      ['Qubits en lugar de dados', 'Cada circunscripción se convierte en un pequeño registro cuántico. En lugar de tirar los dados 50 000 veces, Órbita cuenta los escaños exactamente, en segundos. Un verdadero circuito cuántico da el mismo resultado, hasta la milmillonésima.'],
    ],
    experimentTitle: 'Ciencia en curso',
    experiment: 'Órbita es un experimento, y lo llevamos a cabo a la vista de todos. Todavía no ha demostrado tanto como nuestra proyección de referencia: por eso publicamos las dos, y le mostramos la prueba del pasado. Juzgue usted mismo.',
    goMain: 'Ver la proyección de referencia',
    goHub: 'Todos los resultados de Órbita',
    openDesk: 'Ver la proyección',
    usNotValidated: 'Todavía no se ha repetido en Órbita ninguna elección estadounidense pasada: estas cifras no tienen historial de precisión.',
    readMore: 'Para curiosos',
    hubDesks: 'Las proyecciones de Órbita',
  },
} as const;

export const REFERENCES = [
  { label: 'Dubois — On quantum models for opinion and voting intention polls', url: 'https://arxiv.org/abs/2411.13593' },
  { label: 'Lin, Wang & Hong — The Poisson multinomial distribution and its applications in voting theory', url: 'https://arxiv.org/abs/2201.04237' },
  { label: 'Borghesi & Bouchaud — Spatial correlations in vote statistics: a diffusive field model', url: 'https://arxiv.org/abs/1003.2807' },
  { label: 'Khrennikov & Haven — Quantum-like modelling of the non-separability of voters’ preferences', url: 'https://arxiv.org/abs/1405.1029' },
];
