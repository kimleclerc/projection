import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import '../styles/quebec-election-night-live.css';
import '../styles/us-midterms-live.css';
import { numFmt, timeFmt, type Locale, type PartyInfo } from './qcLiveBus';
import { chamberSummary, deriveUsRows, geoKeyOf, mapState, RACE_ANCHOR, sanitize, stateNotices, waveReading,
  WAVE_MIN_REPORTED_PCT, type Chamber, type ChamberSummary, type ExitPollEntry, type MapState, type RaceStatus,
  type UsLivePayload, type UsRow, type WaveReading } from './usLive';

/**
 * La soirée des mi-mandat du 3 novembre 2026 sur les pages Chambre, Sénat et
 * gouverneurs. Dans l'ordre de lecture, téléphone d'abord :
 *
 *   1. la réponse en une phrase (qui contrôle la chambre), puis la jauge de
 *      majorité : acquis (appelés + non renouvelés), en tête, non attribués ;
 *   2. le décompte face à notre projection publiée (jauge de vague), qui dit
 *      quand trop peu de courses sont assez avancées pour en tirer quoi que ce soit ;
 *   3. ce que chaque État publie ce soir (sans flux, saisie manuelle, recul) ;
 *   4. la carte : appelé, en tête, en attente, sans chiffres lisibles ;
 *   5. l'estimation d'avant-dépouillement (sondages de sortie) ;
 *   6. chaque course, avec une ancre stable (`#H-13006`) et « Copier le lien ».
 *
 * Même régime de lecture que BritishColumbiaElectionNightLive : `setTimeout`
 * récursif, 90 s ± 15 %, jamais deux lectures en vol, pause d'onglet caché,
 * garde de séquence, dernier état dans localStorage, repli plafonné vers le
 * Worker. Même contrat aussi : `live.json` v2, rail Pages d'abord.
 *
 * Ce qui est propre aux États-Unis :
 *  · cinquante sources, pas une. Un État sans flux (`state_unavailable`) ou en
 *    saisie manuelle (`transcribed`) est DIT comme tel ; ses courses ne
 *    montrent jamais « 0 voix », ni dans la liste ni sur la carte ;
 *  · `source.anomaly_count` n'est pas affiché : chaque course en saisie
 *    manuelle y compte, et « 80 anomalies » ferait croire à une panne ;
 *  · l'estimation d'avant-dépouillement (us_exit_poll.py) s'efface course par
 *    course au premier bulletin compté. Elle ne nourrit aucun appel ;
 *  · la cote du marché n'est jamais lue ni rendue : `desk` est retiré par le
 *    Worker et, par prudence, une seconde fois ici (`sanitize`).
 */

const TZ = 'America/New_York';
const BASE_INTERVAL_MS = 90_000;
// Profil us-2026-11-03 : publication.stale_after_seconds = 300.
const STALE_AFTER_MS = 5 * 60_000;
const FALLBACK_AFTER_MS = 3 * 60_000;
const FALLBACK_MAX_USES = 3;
// Premières fermetures : 18 h HNE (23 h UTC), dans l'est de l'Indiana et du
// Kentucky ; 19 h pour le gros de la côte Est. Aucune lecture avant 17 h 30 :
// les pages sont en ligne depuis des mois. Un identifiant d'événement surchargé
// (répétition) ou `?direct=1` lève la barrière.
const DEFAULT_EVENT_ID = 'us-2026-11-03';
const OPENS_AT = Date.parse('2026-11-03T17:30:00-05:00');
const EARLY_UNTIL = Date.parse('2026-11-03T19:30:00-05:00');
const PAGE = 30;
// Bornes de la jauge de vague, en points d'écart démocrates moins républicains.
const WAVE_SPAN = 15;

type Filter = 'all' | 'called' | 'counting' | 'none';
type Unit = { one: string; many: string };

const UNIT: Record<Locale, Record<Chamber, Unit>> = {
  fr: { house: { one: 'siège', many: 'sièges' }, senate: { one: 'siège', many: 'sièges' }, governor: { one: 'poste', many: 'postes' } },
  en: { house: { one: 'seat', many: 'seats' }, senate: { one: 'seat', many: 'seats' }, governor: { one: 'governorship', many: 'governorships' } },
  es: { house: { one: 'escaño', many: 'escaños' }, senate: { one: 'escaño', many: 'escaños' }, governor: { one: 'gobernación', many: 'gobernaciones' } },
};

const copy = {
  fr: {
    live: 'En direct', connecting: 'Lecture du décompte officiel…',
    waiting: 'Aucune course n’a encore d’appel ni de meneur : les premiers chiffres arrivent dans les minutes qui suivent la fermeture des bureaux.',
    unavailable: 'Les résultats ne se chargent pas en ce moment. La page réessaie d’elle-même.',
    lastKnown: 'Derniers chiffres reçus', updated: 'Chiffres des États à', eastern: 'heure de l’Est',
    stale: (m: number) => `Aucun chiffre officiel nouveau depuis ${m} min.`,
    before: 'Les premiers bureaux de vote ferment le mardi 3 novembre à 18 h, heure de l’Est (18 h aussi à Montréal), dans l’est de l’Indiana et du Kentucky ; la plupart des États suivent à partir de 19 h. Les résultats s’afficheront ici d’eux-mêmes, sans recharger la page.',
    soon: 'Les premiers bureaux ferment à 18 h, heure de l’Est, dans l’est de l’Indiana et du Kentucky. Les premiers chiffres des États s’afficheront ici dans les minutes qui suivent.',
    testPage: 'Une source se présente encore comme une page d’essai : ces chiffres ne sont pas des résultats.',
    subj: { us_dem: 'Les démocrates', us_rep: 'Les républicains', us_oth: 'Les autres partis' } as Record<string, string>,
    short: { us_dem: 'démocrates', us_rep: 'républicains', us_oth: 'autres' } as Record<string, string>,
    answer: (s: ChamberSummary, u: Unit, chamber: Chamber, subj: string, lead: string, run: string) => {
      const L = s.leader!, R = s.runnerUp;
      if (chamber === 'governor') {
        if (s.state === 'secured') return `${subj} détiennent au moins ${L.secured} des 50 postes de gouverneur, plus de la moitié.`;
        if (s.state === 'ahead') return `${subj} détiennent ou mènent pour ${L.total} des 50 postes de gouverneur ; ${L.secured} sont acquis.`;
        return `Personne n’a encore 26 des 50 postes de gouverneur : ${lead} ${L.total}, ${run} ${R?.total ?? 0}, acquis ou en tête.`;
      }
      if (s.state === 'secured') return `${subj} ont la majorité : ${L.secured} ${u.many} acquis, il en fallait ${s.majority}.`;
      if (s.state === 'ahead') return `${subj} mènent : ${L.total} ${u.many} acquis ou en tête, pour ${s.majority} nécessaires. ${L.secured} sont acquis.`;
      return `Personne n’a encore ${s.majority} ${u.many} : ${lead} ${L.total}, ${run} ${R?.total ?? 0}, acquis ou en tête.`;
    },
    secured: 'acquis', leading: 'en tête', unassigned: 'non attribués',
    majorityLabel: (chamber: Chamber, n: number) => chamber === 'senate' ? `Majorité : ${n} (à 50 contre 50, le vice-président, républicain, départage)`
      : chamber === 'governor' ? `${n} : plus de la moitié des 50 postes` : `Majorité : ${n}`,
    gaugeNote: (holdover: number) => `Acquis : appelé par Vote-Scope ce soir${holdover ? `, ou siège non renouvelé cette année (${holdover} en tout)` : ''}. En tête : le parti mène au décompte, sans appel. Non attribués : aucun bulletin compté, ou pas de chiffres lisibles.`,
    govNote: 'Être majoritaire parmi les gouverneurs n’a pas d’effet institutionnel ; la ligne sert de repère.',
    projLine: (parts: string) => `Notre projection d’avant-scrutin, pour les mêmes courses : ${parts}.`,
    waveTitle: 'Le décompte face à notre projection',
    wave: (w: WaveReading, mean: number, toward: string) => {
      const a = Math.abs(mean);
      if (a < 0.5) return `Dans les ${w.races.length} courses dépouillées à ${WAVE_MIN_REPORTED_PCT} % ou plus, le décompte suit notre projection d’avant-scrutin à moins d’un demi-point près, en moyenne.`;
      const pts = numFmt(a, 'fr', 1);
      return `Dans les ${w.races.length} courses dépouillées à ${WAVE_MIN_REPORTED_PCT} % ou plus, le décompte est en moyenne ${pts} point${a >= 2 ? 's' : ''} plus ${toward} que notre projection d’avant-scrutin.`;
    },
    waveSplit: (dem: number, rep: number) => `${rep} penche${rep > 1 ? 'nt' : ''} plus républicain que prévu, ${dem} plus démocrate.`,
    waveToward: { us_dem: 'démocrate', us_rep: 'républicain' } as Record<string, string>,
    waveShort: (k: number, min: number) => k === 0
      ? `Pas encore de lecture : aucune course n’est dépouillée à ${WAVE_MIN_REPORTED_PCT} % ou plus. Il en faut au moins ${min} pour que la moyenne dise quelque chose.`
      : `Pas encore de lecture : ${k} course${k > 1 ? 's' : ''} dépouillée${k > 1 ? 's' : ''} à ${WAVE_MIN_REPORTED_PCT} % ou plus, il en faut au moins ${min} pour que la moyenne dise quelque chose.`,
    waveCaveat: 'Les États publient la part des bureaux ou des comtés qui ont rapporté, pas la part des voix comptées : les derniers bulletins (vote par correspondance, grandes villes) peuvent encore déplacer cet écart. Chaque trait gris est une course ; le trait noir, la moyenne.',
    waveAxis: { center: 'notre projection', dem: 'plus démocrate', rep: 'plus républicain' },
    waveExcluded: (states: string) => `Hors de la moyenne : ${states}, dont la soirée ne compte qu’une partie du vote par correspondance.`,
    waveByState: 'La moyenne pèse chaque État une fois : quarante districts du Texas ne font pas quarante indices.',
    noticeTitle: 'Ce que chaque État publie ce soir',
    noticeUnavailable: (s: string) => `Pas de chiffres lisibles pour ${s}. Ces courses ne sont pas à zéro voix : nous ne pouvons pas lire la source de l’État en ce moment, et rien n’y est affiché.`,
    noticeTranscribed: (s: string) => `Saisie manuelle pour ${s}. Ces États ne publient pas de fichier lisible par machine : leurs chiffres sont relevés à la main sur le site officiel, avec du retard, et aucune course n’y est appelée automatiquement.`,
    noticeRegressed: (s: string) => `Chiffres en recul pour ${s}. L’État a publié des chiffres plus anciens que les précédents ; nous gardons les derniers jusqu’à ce que la source se rétablisse.`,
    status: { called: 'Appelée', counting: 'Au décompte', transcribed: 'Saisie manuelle', transcribed_empty: 'Saisie manuelle, rien de saisi',
              regressed: 'Derniers chiffres gardés', state_unavailable: 'Pas de chiffres lisibles', awaiting: 'Aucun bulletin compté' } as Record<RaceStatus, string>,
    mapTitle: { house: 'Carte des 435 districts', senate: 'Carte des 35 courses au Sénat', governor: 'Carte des 36 courses de gouverneur' } as Record<Chamber, string>,
    mapLegend: { called: 'Appelée', leading: 'En tête', awaiting: 'Aucun bulletin compté', transcribed_empty: 'Saisie manuelle, rien de saisi',
                 unavailable: 'Pas de chiffres lisibles', none: 'Pas de course cette année', manual: 'Saisie manuelle, chiffres relevés à la main' } as Record<MapState | 'none' | 'manual', string>,
    mapPick: { house: 'Touchez un district pour voir où il en est.', senate: 'Touchez un État pour voir où en est sa course.', governor: 'Touchez un État pour voir où en est sa course.' } as Record<Chamber, string>,
    mapLoading: 'Chargement de la carte…', mapGo: 'Voir la course dans la liste',
    insets: 'Les encadrés agrandissent les districts des grandes villes.',
    predTitle: 'Avant le dépouillement : l’estimation des sondages de sortie',
    predLede: 'Pour les courses qui n’ont encore aucun bulletin compté, notre projection d’avant-scrutin corrigée par le sondage de sortie de l’État. Ce n’est ni un résultat ni un appel : les sondages de sortie se sont souvent trompés (2004, 2016), et nos marges d’erreur sont volontairement larges. Chaque course quitte cette liste à ses premiers bulletins comptés.',
    predFav: (p: string, pct: string) => `${p} favoris à ${pct} %`, predPrior: (pct: string) => `projection : ${pct} %`,
    predRange: (lo: string, hi: string) => `écart probable de ${lo} à ${hi}`,
    predGone: (n: number) => n === 1 ? '1 course a commencé son décompte : son estimation a cédé la place aux bulletins.' : `${n} courses ont commencé leur décompte : leurs estimations ont cédé la place aux bulletins.`,
    predEmpty: 'Aucune estimation pour l’instant : elles arrivent à la fermeture des bureaux de chaque État.',
    kinds: { nep_initial: 'Sondage de sortie Edison (NEP)', votecast: 'AP VoteCast', nep_weighted: 'Edison, repondéré sur le décompte' } as Record<string, string>,
    racesTitle: { house: 'Les 435 districts', senate: 'Les 35 courses au Sénat', governor: 'Les 36 courses de gouverneur' } as Record<Chamber, string>,
    racesLede: 'Les courses serrées d’abord, selon notre projection.',
    search: 'Chercher un district, un État (GA) ou un candidat',
    filters: { all: 'Toutes', called: 'Appelées', counting: 'Au décompte', none: 'Sans chiffres' } as Record<Filter, string>,
    reported: 'dépouillé', more: (n: number) => `Afficher ${n} de plus`, votes: 'voix', none: 'Aucune course ne correspond.', estimate: 'Estimation',
    margin: (m: string) => `écart ${m} pt`, at: 'appelée à',
    copy: 'Copier le lien', copied: 'Lien copié', copyPage: 'Copier le lien de la page',
    callShare: 'Partager l’appel', callImage: 'Image de l’appel', callTitle: 'Fastest Call · mi-mandat 2026', callVerdict: { governor: 'remporte le poste de gouverneur', other: 'remporte la course' },
    callText: (who: string, race: string, time: string) => `Fastest Call de Vote-Scope : ${who} remporte ${race}. Appel à ${time}.`,
    callWhen: (time: string) => `Appel Vote-Scope à ${time}`, callFoot: 'Décision Fastest Call, à partir du décompte officiel',
    image: 'Télécharger l’image', imageBusy: 'Image en cours…', imageShare: 'Partager l’image', embed: 'Intégrer', embedCopied: 'Code copié',
    fullPage: 'Toutes les courses sur Vote-Scope',
    source: 'Chiffres : les bureaux électoraux des États, État par État ; là où un État ne publie rien de lisible, civicAPI (civicapi.org). Les appels sont ceux de Vote-Scope, approuvés par une personne. Sondages de sortie : Edison Research (NEP) et AP VoteCast. Projection : Kim Leclerc, Vote-Scope.',
    cardTitle: { house: 'Chambre des représentants', senate: 'Sénat', governor: 'Gouverneurs' } as Record<Chamber, string>,
    cardWhen: 'Scrutin du 3 novembre 2026',
    cardFoot: (time: string) => `Chiffres des États à ${time}, heure de l’Est`,
    cardHatched: 'Hachures : pas de chiffres lisibles (source de l’État illisible, ou saisie manuelle encore vide).',
  },
  en: {
    live: 'Live', connecting: 'Reading the official count…',
    waiting: 'No race has a call or a leader yet: the first figures come in minutes after the polls close.',
    unavailable: 'Results are not loading right now. The page will try again on its own.',
    lastKnown: 'Last figures received', updated: 'State figures as of', eastern: 'ET',
    stale: (m: number) => `No new official figures for ${m} min.`,
    before: 'The first polls close on Tuesday, November 3 at 6 p.m. Eastern, in eastern Indiana and Kentucky; most states follow from 7 p.m. Results will appear here on their own, no need to reload the page.',
    soon: 'The first polls close at 6 p.m. Eastern, in eastern Indiana and Kentucky. The first state figures will appear here within minutes.',
    testPage: 'A source still labels itself as a test page: these numbers are not results.',
    subj: { us_dem: 'Democrats', us_rep: 'Republicans', us_oth: 'Other parties' } as Record<string, string>,
    short: { us_dem: 'Democrats', us_rep: 'Republicans', us_oth: 'others' } as Record<string, string>,
    answer: (s: ChamberSummary, u: Unit, chamber: Chamber, subj: string, lead: string, run: string) => {
      const L = s.leader!, R = s.runnerUp;
      if (chamber === 'governor') {
        if (s.state === 'secured') return `${subj} hold at least ${L.secured} of the 50 governorships, more than half.`;
        if (s.state === 'ahead') return `${subj} hold or lead for ${L.total} of the 50 governorships; ${L.secured} are secured.`;
        return `No party has 26 of the 50 governorships yet: ${lead} ${L.total}, ${run} ${R?.total ?? 0}, won or leading.`;
      }
      if (s.state === 'secured') return `${subj} have won a majority: ${L.secured} ${u.many} secured, ${s.majority} needed.`;
      if (s.state === 'ahead') return `${subj} lead: ${L.total} ${u.many} won or leading, ${s.majority} needed. ${L.secured} are secured.`;
      return `No party has ${s.majority} ${u.many} yet: ${lead} ${L.total}, ${run} ${R?.total ?? 0}, won or leading.`;
    },
    secured: 'secured', leading: 'leading', unassigned: 'not assigned',
    majorityLabel: (chamber: Chamber, n: number) => chamber === 'senate' ? `Majority: ${n} (at 50–50, the Republican vice president breaks ties)`
      : chamber === 'governor' ? `${n}: more than half of the 50 offices` : `Majority: ${n}`,
    gaugeNote: (holdover: number) => `Secured: called by Vote-Scope tonight${holdover ? `, or a seat not up this year (${holdover} in all)` : ''}. Leading: the party is ahead in the count, without a call. Not assigned: no ballots counted, or no readable figures.`,
    govNote: 'A majority of governorships has no institutional effect; the line is a reference point.',
    projLine: (parts: string) => `Our pre-election forecast for the same races: ${parts}.`,
    waveTitle: 'The count against our forecast',
    wave: (w: WaveReading, mean: number, toward: string) => {
      const a = Math.abs(mean);
      if (a < 0.5) return `In the ${w.races.length} races with ${WAVE_MIN_REPORTED_PCT}% or more reported, the count tracks our pre-election forecast within half a point, on average.`;
      return `In the ${w.races.length} races with ${WAVE_MIN_REPORTED_PCT}% or more reported, the count runs ${numFmt(a, 'en', 1)} point${a === 1 ? '' : 's'} more ${toward} than our pre-election forecast, on average.`;
    },
    waveSplit: (dem: number, rep: number) => `${rep} lean more Republican than expected, ${dem} more Democratic.`,
    waveToward: { us_dem: 'Democratic', us_rep: 'Republican' } as Record<string, string>,
    waveShort: (k: number, min: number) => k === 0
      ? `No reading yet: no race has ${WAVE_MIN_REPORTED_PCT}% or more reported. It takes at least ${min} for the average to mean anything.`
      : `No reading yet: ${k} race${k > 1 ? 's have' : ' has'} ${WAVE_MIN_REPORTED_PCT}% or more reported; it takes at least ${min} for the average to mean anything.`,
    waveCaveat: 'States report the share of precincts or counties in, not the share of votes counted: the last ballots (mail votes, big cities) can still move this gap. Each grey tick is a race; the black line is the average.',
    waveAxis: { center: 'our forecast', dem: 'more Democratic', rep: 'more Republican' },
    waveExcluded: (states: string) => `Left out of the average: ${states}, where election night counts only part of the mail vote.`,
    waveByState: 'Each state counts once in the average: forty Texas districts are not forty separate clues.',
    noticeTitle: 'What each state is publishing tonight',
    noticeUnavailable: (s: string) => `No readable figures for ${s}. These races are not at zero votes: we cannot read the state’s source right now, so nothing is shown.`,
    noticeTranscribed: (s: string) => `Hand-entered for ${s}. These states publish no machine-readable file: their figures are copied by hand from the official site, with a delay, and no race there is called automatically.`,
    noticeRegressed: (s: string) => `Figures went backwards for ${s}. The state published older figures than before; we keep the latest ones until the source recovers.`,
    status: { called: 'Called', counting: 'Counting', transcribed: 'Hand-entered', transcribed_empty: 'Hand-entered, nothing yet',
              regressed: 'Last figures kept', state_unavailable: 'No readable figures', awaiting: 'No ballots counted' } as Record<RaceStatus, string>,
    mapTitle: { house: 'Map of the 435 districts', senate: 'Map of the 35 Senate races', governor: 'Map of the 36 governor races' } as Record<Chamber, string>,
    mapLegend: { called: 'Called', leading: 'Leading', awaiting: 'No ballots counted', transcribed_empty: 'Hand-entered, nothing yet',
                 unavailable: 'No readable figures', none: 'No race this year', manual: 'Hand-entered figures' } as Record<MapState | 'none' | 'manual', string>,
    mapPick: { house: 'Select a district to see where it stands.', senate: 'Select a state to see where its race stands.', governor: 'Select a state to see where its race stands.' } as Record<Chamber, string>,
    mapLoading: 'Loading the map…', mapGo: 'See the race in the list',
    insets: 'The boxes enlarge big-city districts.',
    predTitle: 'Before the count: the exit-poll estimate',
    predLede: 'For races with no ballots counted yet, our pre-election forecast adjusted by the state’s exit poll. This is neither a result nor a call: exit polls have often been wrong (2004, 2016), and our error bands are deliberately wide. Each race leaves this list once its first ballots are counted.',
    predFav: (p: string, pct: string) => `${p} favored at ${pct}%`, predPrior: (pct: string) => `forecast: ${pct}%`,
    predRange: (lo: string, hi: string) => `likely margin ${lo} to ${hi}`,
    predGone: (n: number) => n === 1 ? '1 race has started counting: its estimate gave way to the ballots.' : `${n} races have started counting: their estimates gave way to the ballots.`,
    predEmpty: 'No estimate yet: they come in as each state’s polls close.',
    kinds: { nep_initial: 'Edison exit poll (NEP)', votecast: 'AP VoteCast', nep_weighted: 'Edison, reweighted on the count' } as Record<string, string>,
    racesTitle: { house: 'All 435 districts', senate: 'All 35 Senate races', governor: 'All 36 governor races' } as Record<Chamber, string>,
    racesLede: 'Closest races first, according to our forecast.',
    search: 'Search a district, a state (GA) or a candidate',
    filters: { all: 'All', called: 'Called', counting: 'Counting', none: 'No figures' } as Record<Filter, string>,
    reported: 'reported', more: (n: number) => `Show ${n} more`, votes: 'votes', none: 'No race matches.', estimate: 'Estimate',
    margin: (m: string) => `margin ${m} pt`, at: 'called at',
    copy: 'Copy link', copied: 'Link copied', copyPage: 'Copy page link',
    callShare: 'Share the call', callImage: 'Call image', callTitle: 'Fastest Call · 2026 midterms', callVerdict: { governor: 'wins the governorship', other: 'wins the race' },
    callText: (who: string, race: string, time: string) => `Vote-Scope Fastest Call: ${who} wins ${race}. Called at ${time}.`,
    callWhen: (time: string) => `Vote-Scope call at ${time}`, callFoot: 'Fastest Call decision, from the official count',
    image: 'Download image', imageBusy: 'Drawing…', imageShare: 'Share image', embed: 'Embed', embedCopied: 'Code copied',
    fullPage: 'Every race on Vote-Scope',
    source: 'Figures: each state’s election office; where a state publishes nothing readable, civicAPI (civicapi.org). Calls are Vote-Scope’s, approved by a person. Exit polls: Edison Research (NEP) and AP VoteCast. Forecast: Kim Leclerc, Vote-Scope.',
    cardTitle: { house: 'U.S. House', senate: 'U.S. Senate', governor: 'Governors' } as Record<Chamber, string>,
    cardWhen: 'Election of November 3, 2026',
    cardFoot: (time: string) => `State figures as of ${time} ET`,
    cardHatched: 'Hatched: no readable figures (state source unreadable, or hand entry still empty).',
  },
  es: {
    live: 'En directo', connecting: 'Leyendo el recuento oficial…',
    waiting: 'Ninguna contienda tiene aún anuncio ni líder: las primeras cifras llegan minutos después del cierre de las urnas.',
    unavailable: 'Los resultados no se cargan en este momento. La página vuelve a intentarlo sola.',
    lastKnown: 'Últimas cifras recibidas', updated: 'Cifras de los estados a las', eastern: 'hora del Este',
    stale: (m: number) => `Sin cifras oficiales nuevas desde hace ${m} min.`,
    before: 'Las primeras urnas cierran el martes 3 de noviembre a las 18:00, hora del Este, en el este de Indiana y Kentucky; la mayoría de los estados siguen desde las 19:00. Los resultados aparecerán aquí solos, sin recargar la página.',
    soon: 'Las primeras urnas cierran a las 18:00, hora del Este, en el este de Indiana y Kentucky. Las primeras cifras de los estados aparecerán aquí en los minutos siguientes.',
    testPage: 'Una fuente aún figura como página de prueba: estas cifras no son resultados.',
    subj: { us_dem: 'Los demócratas', us_rep: 'Los republicanos', us_oth: 'Los demás partidos' } as Record<string, string>,
    short: { us_dem: 'demócratas', us_rep: 'republicanos', us_oth: 'otros' } as Record<string, string>,
    answer: (s: ChamberSummary, u: Unit, chamber: Chamber, subj: string, lead: string, run: string) => {
      const L = s.leader!, R = s.runnerUp;
      if (chamber === 'governor') {
        if (s.state === 'secured') return `${subj} tienen al menos ${L.secured} de las 50 gobernaciones, más de la mitad.`;
        if (s.state === 'ahead') return `${subj} tienen o encabezan ${L.total} de las 50 gobernaciones; ${L.secured} están aseguradas.`;
        return `Ningún partido tiene aún 26 de las 50 gobernaciones: ${lead} ${L.total}, ${run} ${R?.total ?? 0}, aseguradas o en cabeza.`;
      }
      if (s.state === 'secured') return `${subj} tienen la mayoría: ${L.secured} ${u.many} asegurados; hacían falta ${s.majority}.`;
      if (s.state === 'ahead') return `${subj} van en cabeza: ${L.total} ${u.many} asegurados o en cabeza, de ${s.majority} necesarios. ${L.secured} están asegurados.`;
      return `Ningún partido tiene aún ${s.majority} ${u.many}: ${lead} ${L.total}, ${run} ${R?.total ?? 0}, asegurados o en cabeza.`;
    },
    secured: 'asegurados', leading: 'en cabeza', unassigned: 'sin asignar',
    majorityLabel: (chamber: Chamber, n: number) => chamber === 'senate' ? `Mayoría: ${n} (con 50 a 50, desempata el vicepresidente, republicano)`
      : chamber === 'governor' ? `${n}: más de la mitad de los 50 cargos` : `Mayoría: ${n}`,
    gaugeNote: (holdover: number) => `Asegurados: anunciados por Vote-Scope esta noche${holdover ? `, o escaños sin elección este año (${holdover} en total)` : ''}. En cabeza: el partido va por delante en el recuento, sin anuncio. Sin asignar: ninguna papeleta contada, o sin cifras legibles.`,
    govNote: 'Tener la mayoría de las gobernaciones no tiene efecto institucional; la línea sirve de referencia.',
    projLine: (parts: string) => `Nuestra proyección previa, para las mismas contiendas: ${parts}.`,
    waveTitle: 'El recuento frente a nuestra proyección',
    wave: (w: WaveReading, mean: number, toward: string) => {
      const a = Math.abs(mean);
      if (a < 0.5) return `En las ${w.races.length} contiendas escrutadas al ${WAVE_MIN_REPORTED_PCT} % o más, el recuento sigue nuestra proyección previa a menos de medio punto, en promedio.`;
      return `En las ${w.races.length} contiendas escrutadas al ${WAVE_MIN_REPORTED_PCT} % o más, el recuento es en promedio ${numFmt(a, 'es', 1)} punto${a === 1 ? '' : 's'} más ${toward} que nuestra proyección previa.`;
    },
    waveSplit: (dem: number, rep: number) => `${rep} se inclinan más a los republicanos de lo previsto, ${dem} más a los demócratas.`,
    waveToward: { us_dem: 'demócrata', us_rep: 'republicano' } as Record<string, string>,
    waveShort: (k: number, min: number) => k === 0
      ? `Aún no hay lectura: ninguna contienda está escrutada al ${WAVE_MIN_REPORTED_PCT} % o más. Hacen falta al menos ${min} para que el promedio signifique algo.`
      : `Aún no hay lectura: ${k} contienda${k > 1 ? 's' : ''} escrutada${k > 1 ? 's' : ''} al ${WAVE_MIN_REPORTED_PCT} % o más; hacen falta al menos ${min} para que el promedio signifique algo.`,
    waveCaveat: 'Los estados publican la parte de precintos o condados escrutados, no la parte de votos contados: las últimas papeletas (voto por correo, grandes ciudades) aún pueden mover esta diferencia. Cada trazo gris es una contienda; la línea negra, el promedio.',
    waveAxis: { center: 'nuestra proyección', dem: 'más demócrata', rep: 'más republicano' },
    waveExcluded: (states: string) => `Fuera del promedio: ${states}, donde la noche electoral solo cuenta parte del voto por correo.`,
    waveByState: 'Cada estado pesa una vez en el promedio: cuarenta distritos de Texas no son cuarenta indicios.',
    noticeTitle: 'Lo que publica cada estado esta noche',
    noticeUnavailable: (s: string) => `Sin cifras legibles para ${s}. Estas contiendas no están en cero votos: ahora no podemos leer la fuente del estado, y no se muestra nada.`,
    noticeTranscribed: (s: string) => `Captura manual para ${s}. Estos estados no publican un archivo legible por máquina: sus cifras se copian a mano del sitio oficial, con retraso, y ninguna contienda se anuncia allí automáticamente.`,
    noticeRegressed: (s: string) => `Cifras en retroceso para ${s}. El estado publicó cifras más antiguas que las anteriores; conservamos las últimas hasta que la fuente se recupere.`,
    status: { called: 'Anunciada', counting: 'En recuento', transcribed: 'Captura manual', transcribed_empty: 'Captura manual, sin datos aún',
              regressed: 'Últimas cifras conservadas', state_unavailable: 'Sin cifras legibles', awaiting: 'Sin papeletas contadas' } as Record<RaceStatus, string>,
    mapTitle: { house: 'Mapa de los 435 distritos', senate: 'Mapa de las 35 contiendas al Senado', governor: 'Mapa de las 36 contiendas a gobernador' } as Record<Chamber, string>,
    mapLegend: { called: 'Anunciada', leading: 'En cabeza', awaiting: 'Sin papeletas contadas', transcribed_empty: 'Captura manual, sin datos aún',
                 unavailable: 'Sin cifras legibles', none: 'Sin contienda este año', manual: 'Captura manual, cifras copiadas a mano' } as Record<MapState | 'none' | 'manual', string>,
    mapPick: { house: 'Toca un distrito para ver cómo va.', senate: 'Toca un estado para ver cómo va su contienda.', governor: 'Toca un estado para ver cómo va su contienda.' } as Record<Chamber, string>,
    mapLoading: 'Cargando el mapa…', mapGo: 'Ver la contienda en la lista',
    insets: 'Los recuadros amplían los distritos de las grandes ciudades.',
    predTitle: 'Antes del recuento: la estimación de las encuestas a pie de urna',
    predLede: 'Para las contiendas sin ninguna papeleta contada, nuestra proyección previa corregida con la encuesta a pie de urna del estado. No es un resultado ni un anuncio: las encuestas a pie de urna se han equivocado a menudo (2004, 2016), y nuestros márgenes de error son deliberadamente amplios. Cada contienda sale de esta lista en cuanto se cuentan sus primeras papeletas.',
    predFav: (p: string, pct: string) => `${p} favoritos al ${pct} %`, predPrior: (pct: string) => `proyección: ${pct} %`,
    predRange: (lo: string, hi: string) => `diferencia probable de ${lo} a ${hi}`,
    predGone: (n: number) => n === 1 ? '1 contienda empezó su recuento: su estimación dejó paso a las papeletas.' : `${n} contiendas empezaron su recuento: sus estimaciones dejaron paso a las papeletas.`,
    predEmpty: 'Aún no hay estimaciones: llegan al cierre de las urnas de cada estado.',
    kinds: { nep_initial: 'Encuesta a pie de urna Edison (NEP)', votecast: 'AP VoteCast', nep_weighted: 'Edison, reponderada con el recuento' } as Record<string, string>,
    racesTitle: { house: 'Los 435 distritos', senate: 'Las 35 contiendas al Senado', governor: 'Las 36 contiendas a gobernador' } as Record<Chamber, string>,
    racesLede: 'Primero las contiendas más reñidas, según nuestra proyección.',
    search: 'Buscar un distrito, un estado (GA) o un candidato',
    filters: { all: 'Todas', called: 'Anunciadas', counting: 'En recuento', none: 'Sin cifras' } as Record<Filter, string>,
    reported: 'escrutado', more: (n: number) => `Mostrar ${n} más`, votes: 'votos', none: 'Ninguna contienda coincide.', estimate: 'Estimación',
    margin: (m: string) => `diferencia ${m} pt`, at: 'anunciada a las',
    copy: 'Copiar el enlace', copied: 'Enlace copiado', copyPage: 'Copiar el enlace de la página',
    callShare: 'Compartir el anuncio', callImage: 'Imagen del anuncio', callTitle: 'Fastest Call · intermedias 2026', callVerdict: { governor: 'gana la gobernación', other: 'gana la contienda' },
    callText: (who: string, race: string, time: string) => `Fastest Call de Vote-Scope: ${who} gana ${race}. Anunciado a las ${time}.`,
    callWhen: (time: string) => `Anuncio de Vote-Scope a las ${time}`, callFoot: 'Decisión Fastest Call, a partir del recuento oficial',
    image: 'Descargar la imagen', imageBusy: 'Generando…', imageShare: 'Compartir la imagen', embed: 'Insertar', embedCopied: 'Código copiado',
    fullPage: 'Todas las contiendas en Vote-Scope',
    source: 'Cifras: la oficina electoral de cada estado; donde un estado no publica nada legible, civicAPI (civicapi.org). Los anuncios son de Vote-Scope, aprobados por una persona. Encuestas a pie de urna: Edison Research (NEP) y AP VoteCast. Proyección: Kim Leclerc, Vote-Scope.',
    cardTitle: { house: 'Cámara de Representantes', senate: 'Senado', governor: 'Gobernadores' } as Record<Chamber, string>,
    cardWhen: 'Elección del 3 de noviembre de 2026',
    cardFoot: (time: string) => `Cifras de los estados a las ${time}, hora del Este`,
    cardHatched: 'Rayado: sin cifras legibles (fuente del estado ilegible, o captura manual aún vacía).',
  },
};

type Copy = typeof copy['fr'];
type MetaOf = (code: string) => { color: string; label: string };

export type UsRaceInfo = { name: string; href?: string; projected?: string | null; rank: number };

function storageKey(eventId: string) { return `vs-live-${eventId}`; }
function readStored(eventId: string): UsLivePayload | null {
  try { const raw = localStorage.getItem(storageKey(eventId)); return raw ? sanitize(JSON.parse(raw) as UsLivePayload) : null; } catch { return null; }
}
function writeStored(eventId: string, payload: UsLivePayload) {
  try { localStorage.setItem(storageKey(eventId), JSON.stringify(payload)); } catch { /* quota, navigation privée : sans conséquence */ }
}
function isValid(value: unknown): value is UsLivePayload {
  const p = value as Partial<UsLivePayload> | null;
  return !!p && typeof p === 'object' && Array.isArray(p.results) && p.results.every((r) => typeof r?.riding_id === 'string');
}

async function copyText(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); } catch {
    // Repli hors contexte sécurisé.
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
}

/** Couleur d'un parti mêlée de blanc, pour l'image (satori ne lit pas les variables CSS). */
function tintHex(hex: string, a: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `#${v.map((x) => Math.round(x * a + 255 * (1 - a)).toString(16).padStart(2, '0')).join('')}`;
}

/** Bouton texte « Copier le lien » : le retour « Lien copié » dure deux secondes. */
function CopyButton({ text, label, done, className = 'usl-copy' }: { text: () => string; label: string; done: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" class={`${className}${ok ? ' is-done' : ''}`} aria-live="polite"
    onClick={async () => { await copyText(text()); setOk(true); window.setTimeout(() => setOk(false), 2000); }}>{ok ? done : label}</button>;
}

export default function UsMidtermsLive({ chamber, eventId, lang, apiBase, fallbackApiBase, parties, races, holdovers = {}, seats, majority,
  geoUrl, pagePath, embedPath, compact = false, headless = false }:
  { chamber: Chamber; eventId: string; lang: Locale; apiBase: string; fallbackApiBase?: string;
    /** Couleurs et noms des partis, joints au build. */
    parties: PartyInfo[];
    /** Par identifiant de course (`S-13000`) : nom localisé, lien, gagnant projeté, rang (courses serrées d'abord). */
    races: Record<string, UsRaceInfo>;
    /** Sièges non renouvelés cette année, par parti (Sénat, gouverneurs). */
    holdovers?: Record<string, number>;
    seats: number; majority: number | null;
    /** web_data/us-<chambre>/geomap.json : chargé à l'affichage, il ne gonfle pas le HTML. */
    geoUrl?: string;
    /** Chemin de la page complète (liens de partage, version intégrée). */
    pagePath?: string;
    /** Chemin de la version intégrable (iframe). */
    embedPath?: string;
    /** Version intégrée : la réponse, les deux jauges et la carte, sans la liste. */
    compact?: boolean;
    headless?: boolean }) {
  const t = copy[lang];
  const unit = UNIT[lang][chamber];
  const [data, setData] = useState<UsLivePayload | null>(null);
  const [fromStorage, setFromStorage] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [target, setTarget] = useState<string | null>(null);
  const scrolledTo = useRef<string | null>(null);
  const inFlight = useRef(false);
  const failures = useRef(0);
  const lastFetchAt = useRef(0);
  const timer = useRef<number | null>(null);
  const stopped = useRef(false);
  const sequence = useRef(-1);
  const fallbackUses = useRef(0);
  const [beforeOpen, setBeforeOpen] = useState(() => eventId === DEFAULT_EVENT_ID && Date.now() < OPENS_AT
    && !(typeof location !== 'undefined' && new URLSearchParams(location.search).has('direct')));

  useEffect(() => {
    const stored = readStored(eventId);
    if (stored && isValid(stored)) { setData(stored); setFromStorage(true); sequence.current = stored.sequence ?? -1; }

    const endpoint = (base: string) => `${base.replace(/\/$/, '')}/api/v1/elections/${eventId}/live.json`;
    const url = endpoint(apiBase);
    const read = async (from: string): Promise<UsLivePayload> => {
      const response = await fetch(from, { cache: 'default' });
      if (!response.ok) throw new Error(`http ${response.status}`);
      const body = await response.json();
      if (!isValid(body)) throw new Error('payload invalide');
      return sanitize(body as UsLivePayload);
    };
    const ageOf = (p: UsLivePayload) => {
      const stamp = p.source?.source_updated_at;
      return stamp ? Date.now() - new Date(stamp).getTime() : Number.POSITIVE_INFINITY;
    };
    const schedule = (ms: number) => {
      if (stopped.current) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(tick, ms);
    };
    const jittered = () => BASE_INTERVAL_MS * (0.85 + Math.random() * 0.3);

    const tick = async () => {
      if (stopped.current) return;
      if (document.hidden) { schedule(jittered()); return; }    // pause : rien tant que l'onglet est caché
      if (inFlight.current) { schedule(jittered()); return; }   // jamais deux lectures en vol
      inFlight.current = true;
      try {
        let payload: UsLivePayload;
        try {
          payload = await read(url);                             // le rail statique d'abord, toujours
          if (fallbackApiBase && ageOf(payload) > FALLBACK_AFTER_MS && fallbackUses.current < FALLBACK_MAX_USES) {
            fallbackUses.current += 1;
            try {
              const spare = await read(endpoint(fallbackApiBase));
              if (ageOf(spare) < ageOf(payload)) payload = spare;
            } catch { /* le repli ne doit jamais faire échouer une lecture réussie */ }
          }
        } catch (primaryError) {
          if (!fallbackApiBase || fallbackUses.current >= FALLBACK_MAX_USES) throw primaryError;
          fallbackUses.current += 1;
          payload = await read(endpoint(fallbackApiBase));
        }
        const seq = payload.sequence ?? 0;
        if (seq >= sequence.current) {
          // GARDE DE SÉQUENCE : un instantané plus ancien n'est jamais rendu ni conservé.
          sequence.current = seq;
          setData(payload); setFromStorage(false); setFailed(false);
          writeStored(eventId, payload);
        }
        failures.current = 0;
        lastFetchAt.current = Date.now();
      } catch {
        failures.current += 1;
        setFailed(true);
      } finally {
        inFlight.current = false;
      }
      setNow(Date.now());
      const cap = Date.now() < EARLY_UNTIL ? 2 * 60_000 : 10 * 60_000;
      const backoff = Math.min(cap, jittered() * 2 ** Math.min(failures.current, 4));
      schedule(failures.current ? backoff : jittered());
    };

    const onVisible = () => {
      if (beforeOpen && Date.now() < OPENS_AT) return;          // la barrière tient aussi au retour sur l'onglet
      if (!document.hidden && Date.now() - lastFetchAt.current > 60_000) { schedule(500 + Math.random() * 1500); }
    };
    document.addEventListener('visibilitychange', onVisible);
    const wait = beforeOpen ? Math.max(0, OPENS_AT - Date.now()) : 0;
    if (wait > 0) {
      // setTimeout plafonne à ~24,8 jours ; la page est en ligne depuis des mois.
      const arm = () => {
        const left = OPENS_AT - Date.now();
        if (left > 0) { timer.current = window.setTimeout(arm, Math.min(left, 24 * 3600_000)); return; }
        setBeforeOpen(false); schedule(500 + Math.random() * 4000);
      };
      arm();
    } else {
      schedule(500 + Math.random() * 4000);
    }
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => { stopped.current = true; if (timer.current) window.clearTimeout(timer.current); window.clearInterval(clock); document.removeEventListener('visibilitychange', onVisible); };
  }, [eventId, apiBase]);

  // Lien profond : `#H-13006`. L'ancre n'existe qu'une fois les chiffres reçus ;
  // on la lit au chargement et à chaque changement d'ancre (lien de la carte).
  useEffect(() => {
    const read = () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ''));
      setTarget(RACE_ANCHOR.test(id) && races[id] ? id : null);
      scrolledTo.current = null;
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [races]);

  const metaOf: MetaOf = (code: string) => {
    const p = parties.find((x) => x.code === code);
    return p ? { color: p.color, label: p.label } : { color: '#78909c', label: code.replace(/^us_/, '').toUpperCase() };
  };
  const nameOf = (id: string, fallback: string) => races[id]?.name ?? fallback;

  const rows = useMemo(() => deriveUsRows(data, chamber)
    .sort((a, b) => (races[a.id]?.rank ?? 1e9) - (races[b.id]?.rank ?? 1e9)), [data, chamber, races]);
  const summary = useMemo(() => chamberSummary(rows, holdovers, seats, majority), [rows, holdovers, seats, majority]);
  const wave = useMemo(() => waveReading(data, rows, chamber), [data, rows, chamber]);
  const notices = useMemo(() => stateNotices(rows), [rows]);
  const decidedRows = rows.filter((r) => r.party);
  const projectedHere = useMemo(() => {
    const acc: Record<string, number> = { ...holdovers };
    for (const row of decidedRows) { const w = races[row.id]?.projected; if (w) acc[w] = (acc[w] ?? 0) + 1; }
    return acc;
  }, [decidedRows, races, holdovers]);
  const predicted = rows.filter((r) => r.exitPoll);
  const predictorGone = useMemo(() => {
    if (!data?.exit_poll?.races) return 0;
    const prefix = chamber + ':';
    const visible = new Set(predicted.map((r) => r.id.slice(2)));
    return Object.keys(data.exit_poll.races).filter((k) => k.startsWith(prefix) && !visible.has(k.slice(prefix.length))
      && rows.some((r) => r.id.slice(2) === k.slice(prefix.length))).length;
  }, [data, predicted, rows, chamber]);

  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => {
    if (target && r.id === target) return true;                   // la course visée reste visible
    if (filter === 'called' && r.status !== 'called') return false;
    if (filter === 'counting' && !(r.party && r.status !== 'called')) return false;
    if (filter === 'none' && r.party) return false;
    if (!q) return true;
    return nameOf(r.id, r.name).toLowerCase().includes(q) || (r.state ?? '').toLowerCase() === q
      || (r.leader?.candidate_name ?? r.call?.candidate_name ?? '').toLowerCase().includes(q);
  });
  const targetIndex = target ? shown.findIndex((r) => r.id === target) : -1;
  const visibleCount = Math.max(limit, targetIndex + 1);

  useEffect(() => {
    if (!target || scrolledTo.current === target || targetIndex < 0) return;
    const el = document.getElementById(target);
    if (el) { el.scrollIntoView({ block: 'center' }); scrolledTo.current = target; }
  });

  const sourceStamp = data?.source?.source_updated_at ?? null;
  const ageMin = sourceStamp ? Math.floor((now - new Date(sourceStamp).getTime()) / 60_000) : null;
  const stale = !!data && !fromStorage && data.source?.healthy !== false && ageMin !== null && ageMin * 60_000 > STALE_AFTER_MS;
  const stamp = (iso: string | null | undefined) => `${timeFmt(iso, lang, TZ)} ${t.eastern}`;
  // Une estimation n'affiche jamais 100 % : au-delà de 99 %, « > 99 ».
  const pct = (p: number) => (p >= 0.995 ? '> 99' : p <= 0.005 ? '< 1' : numFmt(100 * p, lang, 0));
  const margin = (m: number) => (Math.abs(m) < 0.05 ? '0' : `${m > 0 ? 'D' : 'R'}+${numFmt(Math.abs(m), lang, 1)}`);
  const pageUrl = (hash = '') => {
    const base = typeof location === 'undefined' ? '' : (compact && pagePath ? `https://vote-scope.com${pagePath}` : `${location.origin}${location.pathname}`);
    return hash ? `${base}#${hash}` : base;
  };

  if (headless) return null;

  if (!data) {
    return <section class={`qcl usl${failed ? ' qcl-is-failed' : ''}`} aria-live="polite"><div class="qcl-head"><span class="qcl-label"><i></i>{t.live}</span></div>
      <p class="usl-state">{beforeOpen ? t.before : failed ? (Date.now() < EARLY_UNTIL - 15 * 60_000 ? t.soon : t.unavailable) : t.connecting}</p></section>;
  }

  const answer = summary.leader && summary.state !== 'none'
    ? t.answer(summary, unit, chamber, t.subj[summary.leader.code] ?? metaOf(summary.leader.code).label,
      t.short[summary.leader.code] ?? summary.leader.code, t.short[summary.runnerUp?.code ?? ''] ?? '')
    : t.waiting;
  const holdoverTotal = Object.values(holdovers).reduce((a, b) => a + b, 0);
  const projParts = summary.parties.filter((p) => (projectedHere[p.code] ?? 0) > 0)
    .map((p) => `${t.short[p.code] ?? metaOf(p.code).label} ${projectedHere[p.code]}`).join(', ');

  return (
    <section class={`qcl usl${stale || fromStorage ? ' qcl-is-stale' : ''}${compact ? ' usl-compact' : ''}`} aria-live="polite" data-sequence={data.sequence ?? ''} data-chamber={chamber}>
      <div class="qcl-head">
        <span class="qcl-label"><i></i>{t.live}</span>
        <span>{fromStorage ? `${t.lastKnown} · ` : ''}{sourceStamp ? `${t.updated} ${stamp(sourceStamp)}` : ''}</span>
      </div>
      {data.source?.is_test_page && <p class="qcl-warn">{t.testPage}</p>}
      {failed && <p class="qcl-warn">{t.unavailable}</p>}
      {stale && ageMin !== null && <p class="qcl-warn">{t.stale(ageMin)}</p>}

      <p class="usl-answer">{typo(lang, answer)}</p>
      {decidedRows.length > 0 && (
        <MajorityGauge summary={summary} chamber={chamber} t={t} metaOf={metaOf} />
      )}
      {decidedRows.length > 0 && (
        <p class="usl-note">{typo(lang, `${t.gaugeNote(holdoverTotal)}${chamber === 'governor' ? ` ${t.govNote}` : ''}${projParts ? ` ${t.projLine(projParts)}` : ''}`)}</p>
      )}
      {!compact && decidedRows.length > 0 && (
        <ShareRow t={t} lang={lang} chamber={chamber} geoUrl={geoUrl} embedPath={embedPath} pageUrl={pageUrl}
          card={() => liveCardInput(t, chamber, summary, rows, metaOf, majority, sourceStamp ? timeFmt(sourceStamp, lang, TZ) : '')} />
      )}

      {decidedRows.length > 0 && <WaveGauge wave={wave} t={t} metaOf={metaOf} lang={lang} />}

      {(notices.unavailable.length > 0 || notices.transcribed.length > 0 || notices.regressed.length > 0) && (
        <div class="usl-notices" role="note" aria-label={t.noticeTitle}>
          <h3>{t.noticeTitle}</h3>
          {notices.unavailable.length > 0 && <p>{typo(lang, t.noticeUnavailable(notices.unavailable.join(', ')))}</p>}
          {notices.transcribed.length > 0 && <p>{typo(lang, t.noticeTranscribed(notices.transcribed.join(', ')))}</p>}
          {notices.regressed.length > 0 && <p>{typo(lang, t.noticeRegressed(notices.regressed.join(', ')))}</p>}
        </div>
      )}

      {geoUrl && <LiveMap url={geoUrl} chamber={chamber} rows={rows} t={t} metaOf={metaOf} nameOf={nameOf} lang={lang}
        goHref={(id) => (compact ? pageUrl(id) : `#${id}`)} external={compact} />}

      {!compact && data.exit_poll && (predicted.length > 0 || predictorGone > 0) && (
        <div class="usl-pred">
          <h3>{t.predTitle}</h3>
          <p class="usl-pred-lede">{typo(lang, t.predLede)}</p>
          {predicted.length === 0 ? <p class="usl-pred-empty">{t.predEmpty}</p> : (
            <ul class="usl-pred-list">{predicted.map((r) => <PredictorItem key={r.id} row={r} name={nameOf(r.id, r.name)} t={t}
              metaOf={metaOf} pct={pct} margin={margin} stamp={stamp} />)}</ul>
          )}
          {predictorGone > 0 && <p class="usl-pred-gone">{t.predGone(predictorGone)}</p>}
        </div>
      )}

      {!compact && (
        <div class="usl-races">
          <div class="qll-head">
            <h3>{t.racesTitle[chamber]}</h3>
            <p class="usl-races-lede">{t.racesLede}</p>
            <input type="search" value={query} placeholder={t.search} aria-label={t.search}
              onInput={(e) => { setQuery((e.target as HTMLInputElement).value); setLimit(PAGE); }} />
            <div class="qll-filters" role="group">
              {(Object.keys(t.filters) as Filter[]).map((f) => <button type="button" key={f} class={filter === f ? 'is-on' : ''}
                aria-pressed={filter === f} onClick={() => { setFilter(f); setLimit(PAGE); }}>{t.filters[f]}</button>)}
            </div>
          </div>
          {shown.length === 0 ? <p class="qlf-empty">{t.none}</p> : (
            <ul class="usl-list">
              {shown.slice(0, visibleCount).map((r) => <RaceItem key={r.id} row={r} info={races[r.id]} t={t} metaOf={metaOf} pct={pct}
                lang={lang} stamp={stamp} isTarget={r.id === target} link={() => pageUrl(r.id)} chamber={chamber} />)}
            </ul>
          )}
          {shown.length > visibleCount && <button type="button" class="qll-more" onClick={() => setLimit(visibleCount + PAGE * 2)}>{t.more(Math.min(PAGE * 2, shown.length - visibleCount))}</button>}
        </div>
      )}
      {compact && pagePath && <p class="usl-full"><a href={`https://vote-scope.com${pagePath}`} target="_blank" rel="noopener">{t.fullPage}</a></p>}
      <p class="qcl-source">{t.source}</p>
    </section>
  );
}

/**
 * La jauge de majorité : démocrates à gauche, républicains à droite ; pour
 * chacun, les sièges acquis (couleur pleine) puis ceux où il mène (couleur
 * pâle) ; au centre, les sièges non attribués. Le trait marque la moitié de la
 * chambre ; le chiffre de la majorité est écrit dessous.
 */
function MajorityGauge({ summary, chamber, t, metaOf }: { summary: ChamberSummary; chamber: Chamber; t: Copy; metaOf: MetaOf }) {
  const total = Math.max(summary.seats, 1);
  const w = (n: number) => `${(100 * n) / total}%`;
  const ps = summary.parties;
  const left = ps.slice(0, -1);
  const right = ps.at(-1);
  const ends = [ps[0], right].filter((p, i, a) => p && a.indexOf(p) === i);
  const aria = `${ps.map((p) => `${metaOf(p.code).label} ${p.secured} ${t.secured}, ${p.leading} ${t.leading}`).join(' ; ')} ; ${summary.unassigned} ${t.unassigned}`;
  return (
    <div class="usl-gauge">
      <div class="usl-gauge-ends">
        {ends.map((p, i) => p && (
          <div key={p.code} class={`usl-gauge-end${i === 1 ? ' is-right' : ''}`} style={`--c:${metaOf(p.code).color}`}>
            <strong>{p.total}</strong>
            <span><b>{metaOf(p.code).label}</b><small>{p.secured} {t.secured} · {p.leading} {t.leading}</small></span>
          </div>
        ))}
      </div>
      <div class="usl-gauge-bar" role="img" aria-label={aria}>
        {left.map((p) => [
          <i key={`${p.code}s`} style={`width:${w(p.secured)};--c:${metaOf(p.code).color}`}></i>,
          <i key={`${p.code}l`} class="is-leading" style={`width:${w(p.leading)};--c:${metaOf(p.code).color}`}></i>,
        ])}
        <i class="is-open" style={`width:${w(summary.unassigned)}`}></i>
        {right && [
          <i key={`${right.code}l`} class="is-leading" style={`width:${w(right.leading)};--c:${metaOf(right.code).color}`}></i>,
          <i key={`${right.code}s`} style={`width:${w(right.secured)};--c:${metaOf(right.code).color}`}></i>,
        ]}
        {summary.majority && <em aria-hidden="true"></em>}
      </div>
      <div class="usl-gauge-foot">
        <span>{summary.unassigned} {t.unassigned}</span>
        {summary.majority && <span class="usl-gauge-maj">{t.majorityLabel(chamber, summary.majority)}</span>}
      </div>
    </div>
  );
}

/** L'écart moyen du décompte avec notre projection : une échelle, un point par course, un trait pour la moyenne. */
function WaveGauge({ wave, t, metaOf, lang }: { wave: WaveReading; t: Copy; metaOf: MetaOf; lang: Locale }) {
  // Démocrates à gauche, comme la jauge de majorité : un écart positif (plus démocrate) va vers la gauche.
  const x = (shift: number) => `${50 - (50 * Math.max(-WAVE_SPAN, Math.min(WAVE_SPAN, shift))) / WAVE_SPAN}%`;
  const toward = wave.mean !== null && wave.mean > 0 ? 'us_dem' : 'us_rep';
  return (
    <div class="usl-wave">
      <h3>{t.waveTitle}</h3>
      {wave.mean === null ? <p class="usl-wave-text">{typo(lang, t.waveShort(wave.races.length, wave.minRaces))}</p> : (
        <>
          <p class="usl-wave-text">{typo(lang, `${t.wave(wave, wave.mean, t.waveToward[toward])} ${t.waveSplit(wave.towardDem, wave.towardRep)}`)}</p>
          <div class="usl-wave-scale" role="img" aria-label={t.wave(wave, wave.mean, t.waveToward[toward])}>
            <span class="usl-wave-zero" aria-hidden="true"></span>
            {wave.races.map((r) => <i key={r.id} style={`left:${x(r.shift)}`}></i>)}
            <b style={`left:${x(wave.mean)};--c:${metaOf(toward).color}`}></b>
          </div>
          <div class="usl-wave-axis" aria-hidden="true">
            <span style={`color:${metaOf('us_dem').color}`}><b>D+{WAVE_SPAN}</b>{t.waveAxis.dem}</span>
            <span class="is-center"><b>0</b>{t.waveAxis.center}</span>
            <span class="is-right" style={`color:${metaOf('us_rep').color}`}><b>R+{WAVE_SPAN}</b>{t.waveAxis.rep}</span>
          </div>
        </>
      )}
      <p class="usl-note">{typo(lang, t.waveCaveat)}{wave.excludedStates.length > 0 && ` ${typo(lang, t.waveExcluded(wave.excludedStates.join(', ')))}`}{wave.source === 'engine' && ` ${typo(lang, t.waveByState)}`}</p>
    </div>
  );
}

type GeoDoc = { viewBox: [number, number, number, number]; panels: { id: string; x: number; y: number; w: number; h: number; main: boolean; title_fr: string; title_en: string; title_es: string }[]; paths: Record<string, Record<string, string>> };

/**
 * La carte du soir, sur la géométrie déjà publiée pour la projection
 * (web_data/us-<chambre>/geomap.json, la même que GeoMap et les images de
 * partage). Une course sans chiffres lisibles est hachurée, jamais coloriée
 * comme si elle avait zéro voix.
 */
function LiveMap({ url, chamber, rows, t, metaOf, nameOf, lang, goHref, external }:
  { url: string; chamber: Chamber; rows: UsRow[]; t: Copy; metaOf: MetaOf; nameOf: (id: string, f: string) => string; lang: Locale;
    goHref: (id: string) => string; external: boolean }) {
  const [doc, setDoc] = useState<GeoDoc | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(url).then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive) setDoc(d); }).catch(() => {});
    return () => { alive = false; };
  }, [url]);
  const byKey = useMemo(() => new Map(rows.map((r) => [geoKeyOf(r.id), r])), [rows]);
  const present = useMemo(() => {
    const s = new Set<MapState | 'none' | 'manual'>(rows.map(mapState));
    if (rows.some((r) => r.status === 'transcribed')) s.add('manual');
    if (doc && Object.keys(doc.paths.main ?? {}).some((k) => !byKey.has(k))) s.add('none');
    return s;
  }, [rows, doc, byKey]);
  if (!doc) return <div class="usl-map"><h3>{t.mapTitle[chamber]}</h3><p class="usl-note">{t.mapLoading}</p></div>;
  const [, , W, H] = doc.viewBox;
  const cur = sel ? byKey.get(sel) ?? null : null;
  const fillOf = (row: UsRow | undefined) => {
    if (!row) return 'var(--paper-2)';
    const st = mapState(row);
    if (st === 'called' || st === 'leading') return metaOf(row.party ?? '').color;
    return 'var(--usl-map-empty)';
  };
  const titre = (p: GeoDoc['panels'][number]) => (lang === 'en' ? p.title_en : lang === 'es' ? p.title_es : p.title_fr);
  const order: (MapState | 'none' | 'manual')[] = ['called', 'leading', 'awaiting', 'manual', 'transcribed_empty', 'unavailable', 'none'];
  return (
    <div class="usl-map">
      <h3>{t.mapTitle[chamber]}</h3>
      <ul class="usl-map-legend">
        {order.filter((k) => present.has(k)).map((k) => (
          <li key={k}><i class={`is-${k}`} style={k === 'called' || k === 'leading' ? `--c:${metaOf('us_dem').color};--c2:${metaOf('us_rep').color}` : undefined}></i>{t.mapLegend[k]}</li>
        ))}
      </ul>
      <div class="usl-map-board" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={doc.viewBox.join(' ')} role="group" aria-label={t.mapTitle[chamber]}>
          <defs>
            <pattern id="usl-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect class="usl-map-hatch" width="1.5" height="4" />
            </pattern>
            <pattern id="usl-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle class="usl-map-hatch" cx="2" cy="2" r="0.9" />
            </pattern>
            {doc.panels.map((p) => <clipPath id={`usl-clip-${p.id}`} key={p.id}><rect x={p.x} y={p.y} width={p.w} height={p.h} /></clipPath>)}
          </defs>
          {doc.panels.map((p) => (
            <g key={p.id} clip-path={`url(#usl-clip-${p.id})`}>
              {!p.main && <rect class="usl-map-inset" x={p.x} y={p.y} width={p.w} height={p.h} />}
              {Object.entries(doc.paths[p.id] ?? {}).map(([key, d]) => {
                const row = byKey.get(key);
                const st = row ? mapState(row) : null;
                return (
                  <g key={key} class={`usl-map-race${st ? ` is-${st}` : ' is-none'}`}>
                    <path d={d} style={{ fill: fillOf(row) }} role={row ? 'button' : undefined} tabIndex={row && p.main ? 0 : -1}
                      aria-label={row ? `${nameOf(row.id, row.name)} : ${t.status[row.status]}` : undefined}
                      onClick={() => row && setSel(key)} onFocus={() => row && setSel(key)} />
                    {st === 'unavailable' && <path d={d} fill="url(#usl-hatch)" pointer-events="none" />}
                    {row && (row.status === 'transcribed' || row.status === 'transcribed_empty') && <path d={d} fill="url(#usl-dots)" pointer-events="none" />}
                  </g>
                );
              })}
              {sel && doc.paths[p.id]?.[sel] && <path class="usl-map-halo" d={doc.paths[p.id][sel]} pointer-events="none" />}
              {!p.main && <rect class="usl-map-frame" x={p.x} y={p.y} width={p.w} height={p.h} pointer-events="none" />}
            </g>
          ))}
        </svg>
        {doc.panels.filter((p) => !p.main && titre(p)).map((p) => (
          <span class="usl-map-title" key={`t-${p.id}`} style={{ left: `${((p.x + 4) / W) * 100}%`, top: `${((p.y + 3) / H) * 100}%` }}>{titre(p)}</span>
        ))}
      </div>
      {chamber === 'house' && <p class="usl-note">{t.insets}</p>}
      <p class="usl-map-detail" aria-live="polite">
        {cur ? (
          <>
            <strong>{nameOf(cur.id, cur.name)}</strong>
            <span>{t.status[cur.status]}</span>
            {cur.party && <span class="usl-map-who"><i style={`background:${metaOf(cur.party).color}`}></i>{metaOf(cur.party).label}
              {cur.margin !== null ? ` · ${t.margin(numFmt(cur.margin, lang, 1))}` : ''}</span>}
            <a href={goHref(cur.id)} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>{t.mapGo}</a>
          </>
        ) : <span class="usl-note">{t.mapPick[chamber]}</span>}
      </p>
    </div>
  );
}

/** Ce que l'image de partage montre : exactement ce que la page affiche. */
function liveCardInput(t: Copy, chamber: Chamber, s: ChamberSummary, rows: UsRow[], metaOf: MetaOf, majority: number | null, time: string) {
  const fills: Record<string, string> = {};
  const hatched: string[] = [];
  for (const r of rows) {
    const st = mapState(r);
    const key = geoKeyOf(r.id);
    const c = metaOf(r.party ?? '').color;
    fills[key] = st === 'called' ? c : st === 'leading' ? tintHex(c, 0.45) : '#d9d9d9';
    if (st === 'unavailable' || st === 'transcribed_empty') hatched.push(key);
  }
  const answer = s.leader && s.state !== 'none'
    ? t.answer(s, UNIT[langOf(t)][chamber], chamber, t.subj[s.leader.code] ?? metaOf(s.leader.code).label, t.short[s.leader.code] ?? '', t.short[s.runnerUp?.code ?? ''] ?? '')
    : t.waiting;
  return {
    title: t.cardTitle[chamber], when: t.cardWhen, answer, seats: s.seats,
    majorityLabel: majority ? t.majorityLabel(chamber, majority) : '',
    parties: s.parties.map((p) => ({ label: metaOf(p.code).label, color: metaOf(p.code).color, secured: p.secured, leading: p.leading })),
    unassigned: s.unassigned,
    legend: { secured: t.secured, leading: t.leading, unassigned: t.unassigned, hatched: t.cardHatched },
    fills, hatched, foot: time ? t.cardFoot(time) : '',
  };
}
/** Français : espace insécable devant « : ; ? ! », pour que la ponctuation ne passe pas seule à la ligne. */
const typo = (lang: Locale, s: string) => (lang === 'fr' ? s.replace(/ ([:;?!»])/g, '\u00a0$1').replace(/« /g, '«\u00a0') : s);
const langOf = (t: Copy): Locale => (t === copy.en ? 'en' : t === copy.es ? 'es' : 'fr');

/** Partager la page : le lien, l'image de l'état de la chambre, le code d'intégration. */
function ShareRow({ t, lang, chamber, geoUrl, embedPath, pageUrl, card }:
  { t: Copy; lang: Locale; chamber: Chamber; geoUrl?: string; embedPath?: string; pageUrl: (h?: string) => string;
    card: () => ReturnType<typeof liveCardInput> }) {
  const [busy, setBusy] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    try {
      const probe = new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' });
      setCanShare(typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }));
    } catch { setCanShare(false); }
  }, []);
  const name = (fmt: string) => `vote-scope-us-${chamber}-${lang}${fmt === 'wide' ? '' : `-${fmt}`}.png`;
  const draw = async (fmt: 'wide' | 'square') => {
    const { renderLiveChamberPng } = await import('../lib/share/render-client');
    return renderLiveChamberPng(fmt, lang, geoUrl ?? null, card());
  };
  const download = async () => {
    if (busy) return; setBusy(true);
    try {
      const blob = await draw('wide');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name('wide'); a.click();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch { /* réseau ou navigateur : rien de plus à faire */ }
    setBusy(false);
  };
  const share = async () => {
    if (busy) return; setBusy(true);
    try {
      const blob = await draw('square');
      await navigator.share({ files: [new File([blob], name('square'), { type: 'image/png' })], url: pageUrl() });
    } catch { /* annulé */ }
    setBusy(false);
  };
  const embedSnippet = () => embedPath
    ? `<iframe src="${location.origin}${embedPath}" width="100%" height="720" style="border:0" loading="lazy" title="${t.cardTitle[chamber]} · Vote-Scope"></iframe>`
    : '';
  return (
    <div class="usl-share">
      <CopyButton text={() => pageUrl()} label={t.copyPage} done={t.copied} className="usl-share-btn" />
      <button type="button" class="usl-share-btn" onClick={download} disabled={busy}>{busy ? t.imageBusy : t.image}</button>
      {canShare && <button type="button" class="usl-share-btn" onClick={share} disabled={busy}>{t.imageShare}</button>}
      {embedPath && <CopyButton text={embedSnippet} label={t.embed} done={t.embedCopied} className="usl-share-btn" />}
    </div>
  );
}

function favoured(e: ExitPollEntry) {
  const dem = e.posterior.p_dem >= 0.5;
  return { code: dem ? 'us_dem' : 'us_rep', p: dem ? e.posterior.p_dem : e.posterior.p_rep, prior: dem ? e.prior.p_dem : 1 - e.prior.p_dem };
}

function PredictorItem({ row, name, t, metaOf, pct, margin, stamp }:
  { row: UsRow; name: string; t: Copy; metaOf: MetaOf; pct: (p: number) => string; margin: (m: number) => string; stamp: (iso: string) => string }) {
  const e = row.exitPoll!;
  const f = favoured(e);
  const m = metaOf(f.code);
  const qs = e.posterior.margin_quantiles ?? {};
  return (
    <li class="usl-pred-item">
      <div class="usl-pred-name"><a href={`#${row.id}`}>{name}</a>
        {row.status !== 'awaiting' && <em class={`usl-status is-${row.status}`}>{t.status[row.status]}</em>}</div>
      <div class="usl-pred-fav"><i style={`background:${m.color}`}></i>{t.predFav(m.label, pct(f.p))}<small>{t.predPrior(pct(f.prior))}</small></div>
      <small class="usl-pred-meta">
        {typeof qs.q05 === 'number' && typeof qs.q95 === 'number' ? `${t.predRange(margin(qs.q05), margin(qs.q95))} · ` : ''}
        {t.kinds[e.kind] ?? e.kind}{e.as_of ? ` · ${stamp(e.as_of)}` : ''}
      </small>
    </li>
  );
}

function RaceItem({ row, info, t, metaOf, pct, lang, stamp, isTarget, link, chamber }:
  { row: UsRow; info?: UsRaceInfo; t: Copy; metaOf: MetaOf; pct: (p: number) => string; lang: Locale; stamp: (iso: string) => string;
    isTarget: boolean; link: () => string; chamber: Chamber }) {
  const name = info?.name ?? row.name;
  const lead = row.call ? metaOf(row.call.party_code) : row.leader ? metaOf(row.leader.party_code) : null;
  const who = row.call?.candidate_name ?? row.leader?.candidate_name ?? null;
  const e = row.exitPoll;
  const f = e ? favoured(e) : null;
  return (
    <li id={row.id} class={`usl-race is-${row.status}${isTarget ? ' is-target' : ''}`}>
      <div class="usl-race-name">{info?.href ? <a href={info.href}>{name}</a> : name}<em class={`usl-status is-${row.status}`}>{t.status[row.status]}</em></div>
      <div class="usl-race-lead">
        {lead ? <><i style={`background:${lead.color}`}></i><strong>{lead.label}</strong>{who && <span>{who}</span>}
          {row.call?.called_at && <small>{t.at} {stamp(row.call.called_at)}</small>}</>
          : f ? <span class="usl-race-est">{t.estimate} : {t.predFav(metaOf(f.code).label, pct(f.p))}</span>
          : <span class="qcl-muted">{row.status === 'awaiting' ? '' : t.status[row.status]}</span>}
      </div>
      <div class="usl-race-nums">
        {row.margin !== null && row.leader && <span>{t.margin(numFmt(row.margin, lang, 1))}</span>}
        {row.reportedPct !== null && <span>{numFmt(row.reportedPct, lang, 0)}{lang === 'en' ? '%' : ' %'} {t.reported}</span>}
        {row.votes > 0 && <span>{row.votes.toLocaleString(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-CA')} {t.votes}</span>}
      </div>
      <CopyButton text={link} label={t.copy} done={t.copied} />
      {row.call && lead && <CallShare t={t} lang={lang} chamber={chamber} race={name} party={lead.label} color={lead.color}
        candidate={who} time={row.call.called_at ? stamp(row.call.called_at) : null} link={link} id={row.id} />}
    </li>
  );
}

/**
 * Partager un appel : le texte prêt (gagnant, course, heure de l'appel) et le
 * lien de la course ; l'image est dessinée dans le navigateur, au clic, comme
 * celle de la chambre — rien n'est fabriqué au build.
 */
function CallShare({ t, lang, chamber, race, party, color, candidate, time, link, id }:
  { t: Copy; lang: Locale; chamber: Chamber; race: string; party: string; color: string; candidate: string | null; time: string | null; link: () => string; id: string }) {
  const [busy, setBusy] = useState(false);
  const raceLabel = `${t.cardTitle[chamber]} · ${race}`;
  const who = candidate ? `${candidate} (${party})` : party;
  const text = () => t.callText(who, raceLabel, time ?? '—');
  const share = async () => {
    try {
      if (typeof navigator.share === 'function') await navigator.share({ text: text(), url: link() });
      else await copyText(`${text()} ${link()}`);
    } catch { /* annulé */ }
  };
  const image = async () => {
    if (busy) return; setBusy(true);
    try {
      const { renderCallPng } = await import('../lib/share/render-client');
      const blob = await renderCallPng('wide', lang, { title: t.callTitle, race: raceLabel, party, candidate, color,
        verdict: chamber === 'governor' ? t.callVerdict.governor : t.callVerdict.other, when: time ? t.callWhen(time) : '', foot: t.callFoot });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `vote-scope-call-${id}-${lang}.png`; a.click();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch { /* réseau ou navigateur */ }
    setBusy(false);
  };
  return (
    <span class="usl-call-share">
      <button type="button" class="usl-copy" onClick={share} data-analytics-event="share_click" data-analytics-kind="call">{t.callShare}</button>
      <button type="button" class="usl-copy" onClick={image} disabled={busy} data-analytics-event="share_click" data-analytics-kind="call-image">{busy ? t.imageBusy : t.callImage}</button>
    </span>
  );
}
