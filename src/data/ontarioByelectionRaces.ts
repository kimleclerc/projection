// Partielles provinciales ontariennes — trois sièges, scrutin le
// 3 septembre 2026 (brefs émis le 5 août). Même contrat que
// canadaByelectionRaces.ts : narratif ici, chiffres du moteur au build.
//
// Différence de fond avec le fédéral : AUCUN résidu de participation n'est
// appliqué. Le résidu fédéral a été mesuré sur les partielles fédérales du
// 13 avril 2026; le transposer à un scrutin provincial serait une extrapolation
// non mesurée. Les projections ontariennes reposent donc sur la projection
// générale du siège, corrigée du seul vote personnel du député sortant.

import type { ByelectionRaceConfig, ByelectionRaceLocale } from './canadaByelectionRaces';

type L<T> = Record<ByelectionRaceLocale, T>;

const HUB: L<string> = {
  en: '/en/canada/ontario/byelections/',
  fr: '/fr/canada/ontario/byelections/',
  es: '/es/canada/ontario/byelections/',
};
const HUB_LABEL: L<string> = {
  en: 'Ontario by-elections',
  fr: 'Partielles ontariennes',
  es: 'Parciales de Ontario',
};
const PROJECTION: L<string> = {
  en: '/en/canada/ontario/',
  fr: '/fr/canada/ontario/',
  es: '/es/canada/ontario/',
};
const PROJECTION_LABEL: L<string> = {
  en: 'Ontario projection',
  fr: 'Projection ontarienne',
  es: 'Proyección de Ontario',
};
const SECTION: L<string> = { en: 'Ontario', fr: 'Ontario', es: 'Ontario' };

const attach = {
  hubPath: HUB,
  hubLabel: HUB_LABEL,
  projectionPath: PROJECTION,
  projectionLabel: PROJECTION_LABEL,
  sectionLabel: SECTION,
  sectionPath: PROJECTION,
};

export const ontarioByelectionRaces = {
  'hamilton-est-stoney-creek': {
    slug: 'hamilton-est-stoney-creek',
    ridingId: '00037',
    liveEventId: 'on-2026-09-03',
    liveRidingId: '37',
    dataPath: 'ontario-byelection-hamilton-est-stoney-creek',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-09-03',
    vacancyDate: null,
    province: 'ON',
    ...attach,
    title: {
      en: 'Hamilton East—Stoney Creek By-Election 2026: Polls & Forecast — The Seat Lumsden Built — Vote-Scope',
      fr: 'Partielle de Hamilton-Est—Stoney Creek 2026 : sondages, projection et pronostic — Vote-Scope',
      es: 'Parcial de Hamilton Este—Stoney Creek 2026: encuestas, proyección y pronóstico — Vote-Scope',
    },
    description: {
      en: 'This riding voted below the provincial Progressive Conservative average for a decade. Neil Lumsden closed the gap, then left the cabinet amid the hotel controversy. Vote-Scope projects a Liberal gain.',
      fr: 'Cette circonscription votait sous la moyenne provinciale progressiste-conservatrice depuis une décennie. Neil Lumsden a comblé l’écart, puis a quitté le cabinet dans la controverse des hôtels. Vote-Scope projette un gain libéral.',
      es: 'Esta circunscripción votaba por debajo de la media provincial progresista conservadora durante una década. Neil Lumsden cerró la brecha y luego dejó el gabinete en medio de la controversia de los hoteles. Vote-Scope proyecta una ganancia liberal.',
    },
    kicker: {
      en: 'Ontario by-election · September 3, 2026',
      fr: 'Partielle ontarienne · 3 septembre 2026',
      es: 'Parcial de Ontario · 3 de septiembre de 2026',
    },
    headline: { en: 'The seat he built.', fr: 'Le siège qu’il a bâti.', es: 'El escaño que construyó.' },
    dek: {
      en: 'The Progressive Conservatives ran 11.7 points behind their provincial score here in 2018. Under Neil Lumsden — a former CFL player and Tiger-Cats executive — that deficit shrank to 0.9 points by 2025. He is gone, the party is carrying a scandal, and the Ontario Liberals now lead province-wide.',
      fr: 'Les progressistes-conservateurs accusaient ici 11,7 points de retard sur leur score provincial en 2018. Sous Neil Lumsden — ancien joueur de la LCF et dirigeant des Tiger-Cats — ce déficit est tombé à 0,9 point en 2025. Il s’en va, le parti porte un scandale, et les libéraux de l’Ontario mènent désormais dans la province.',
      es: 'Los progresistas conservadores acumulaban aquí 11,7 puntos de retraso respecto a su marca provincial en 2018. Con Neil Lumsden — exjugador de la CFL y directivo de los Tiger-Cats — ese déficit cayó a 0,9 puntos en 2025. Él se va, el partido carga con un escándalo y los liberales de Ontario ahora lideran en la provincia.',
    },
    why: {
      en: [
        'Neil Lumsden left the Ford cabinet amid the hotel controversy and then resigned his seat.',
        'Progressive Conservative share versus their province-wide score: +2.9 points (2011), −4.2 (2014), −11.7 (2018) — the riding leaned AGAINST them before he arrived.',
        'After Lumsden won in 2022 the deficit closed: −6.2 (2022), then −0.9 (2025). Roughly seven points recovered by a locally famous sports figure.',
        'The Progressive Conservative candidate is Hamilton Ward 10 councillor Jeff Beattie; the Liberals renominated Heino Doessing, who lost to Lumsden in 2025.',
      ],
      fr: [
        'Neil Lumsden a quitté le cabinet Ford dans la controverse des hôtels, puis a démissionné de son siège.',
        'Part progressiste-conservatrice par rapport à leur score provincial : +2,9 points (2011), −4,2 (2014), −11,7 (2018) — la circonscription penchait CONTRE eux avant son arrivée.',
        'Après la victoire de Lumsden en 2022, le déficit se comble : −6,2 (2022), puis −0,9 (2025). Environ sept points regagnés par une figure sportive locale.',
        'Le candidat progressiste-conservateur est le conseiller municipal du quartier 10 de Hamilton, Jeff Beattie; les libéraux réinvestissent Heino Doessing, battu par Lumsden en 2025.',
      ],
      es: [
        'Neil Lumsden dejó el gabinete de Ford en medio de la controversia de los hoteles y luego renunció a su escaño.',
        'Cuota progresista conservadora frente a su marca provincial: +2,9 puntos (2011), −4,2 (2014), −11,7 (2018) — la circunscripción se inclinaba EN SU CONTRA antes de su llegada.',
        'Tras la victoria de Lumsden en 2022 el déficit se cerró: −6,2 (2022) y luego −0,9 (2025). Unos siete puntos recuperados por una figura deportiva local.',
        'El candidato progresista conservador es el concejal del Distrito 10 de Hamilton, Jeff Beattie; los liberales repiten con Heino Doessing, derrotado por Lumsden en 2025.',
      ],
    },
    modelNote: {
      en: 'Seven points are stripped from the Progressive Conservative baseline — the share that tracked Lumsden rather than his party. No by-election turnout residual is applied: the one Vote-Scope has measured comes from the April 2026 federal by-elections, and transposing a federal measurement to a provincial contest would be an assumption, not a finding.',
      fr: 'Sept points sont retirés de la base progressiste-conservatrice — la part qui suivait Lumsden et non son parti. Aucun résidu de participation n’est appliqué : le seul que Vote-Scope a mesuré provient des partielles fédérales d’avril 2026, et transposer une mesure fédérale à un scrutin provincial relèverait de l’hypothèse, pas du constat.',
      es: 'Se retiran siete puntos de la base progresista conservadora — la parte que seguía a Lumsden y no a su partido. No se aplica ningún residuo de participación: el único que Vote-Scope ha medido proviene de las parciales federales de abril de 2026, y trasladar una medición federal a una contienda provincial sería una suposición, no un hallazgo.',
    },
    paths: {
      en: '/en/canada/ontario/byelections/hamilton-est-stoney-creek/',
      fr: '/fr/canada/ontario/byelections/hamilton-est-stoney-creek/',
      es: '/es/canada/ontario/byelections/hamilton-est-stoney-creek/',
    },
  },

  'scarborough-sud-ouest': {
    slug: 'scarborough-sud-ouest',
    ridingId: '00098',
    liveEventId: 'on-2026-09-03',
    liveRidingId: '98',
    dataPath: 'ontario-byelection-scarborough-sud-ouest',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-09-03',
    vacancyDate: '2026-02-01',
    province: 'ON',
    ...attach,
    title: {
      en: 'Scarborough Southwest By-Election 2026: Polls & Forecast — An NDP Fortress Without Its MPP — Vote-Scope',
      fr: 'Partielle de Scarborough-Sud-Ouest 2026 : sondages, projection et pronostic — Vote-Scope',
      es: 'Parcial de Scarborough Suroeste 2026: encuestas, proyección y pronóstico — Vote-Scope',
    },
    description: {
      en: 'Doly Begum left the Ontario NDP to win the federal seat as a Liberal. The provincial New Democrat premium here long predates her — Vote-Scope explains why the correction is small.',
      fr: 'Doly Begum a quitté le NPD ontarien pour remporter le siège fédéral sous bannière libérale. La prime néo-démocrate provinciale lui est bien antérieure — Vote-Scope explique pourquoi la correction est faible.',
      es: 'Doly Begum dejó el NPD de Ontario para ganar el escaño federal como liberal. La prima neodemócrata provincial es muy anterior a ella — Vote-Scope explica por qué la corrección es pequeña.',
    },
    kicker: {
      en: 'Ontario by-election · September 3, 2026',
      fr: 'Partielle ontarienne · 3 septembre 2026',
      es: 'Parcial de Ontario · 3 de septiembre de 2026',
    },
    headline: { en: 'The fortress predates her.', fr: 'Le bastion lui est antérieur.', es: 'El bastión es anterior a ella.' },
    dek: {
      en: 'Doly Begum resigned in February 2026 to run federally — for the Liberals — and won in April. It is tempting to read the New Democrat share here as hers. The record says otherwise: the seat ran more than 22 points ahead of the provincial NDP before she was ever on the ballot.',
      fr: 'Doly Begum a démissionné en février 2026 pour se présenter au fédéral — chez les libéraux — et a gagné en avril. Il serait tentant de lui attribuer la part néo-démocrate d’ici. L’historique dit le contraire : le siège devançait le NPD provincial de plus de 22 points avant même qu’elle figure au bulletin.',
      es: 'Doly Begum renunció en febrero de 2026 para presentarse a nivel federal — por los liberales — y ganó en abril. Sería tentador atribuirle la cuota neodemócrata de aquí. El registro dice lo contrario: el escaño aventajaba al NPD provincial en más de 22 puntos antes de que ella apareciera en la papeleta.',
    },
    why: {
      en: [
        'Begum, NDP MPP since 2018, stepped down in February 2026 to run for the Liberals in the federal Scarborough—Southwest by-election, which she won on April 13, 2026 with 69.6%.',
        'New Democrat share versus their province-wide score: +22.0 points (2011) and +23.0 (2014) — years before she was elected.',
        'Under Begum: +12.1 (2018, her first election and the LOWEST premium on record), +23.9 (2022), +24.4 (2025).',
        'Four candidates are named: Dr. Noor Tarun (PC), Ahsanul Hafiz (Liberal), Fatima Shaban (NDP) and Mark Bekkering (Green).',
      ],
      fr: [
        'Begum, députée néo-démocrate depuis 2018, a démissionné en février 2026 pour se présenter chez les libéraux à la partielle fédérale de Scarborough—Southwest, qu’elle a remportée le 13 avril 2026 avec 69,6 %.',
        'Part néo-démocrate par rapport au score provincial : +22,0 points (2011) et +23,0 (2014) — des années avant son élection.',
        'Sous Begum : +12,1 (2018, sa première élection et la prime la PLUS BASSE jamais enregistrée), +23,9 (2022), +24,4 (2025).',
        'Quatre candidatures sont connues : Dr Noor Tarun (PC), Ahsanul Hafiz (libéral), Fatima Shaban (NPD) et Mark Bekkering (vert).',
      ],
      es: [
        'Begum, diputada del NPD desde 2018, renunció en febrero de 2026 para presentarse por los liberales en la parcial federal de Scarborough—Southwest, que ganó el 13 de abril de 2026 con 69,6 %.',
        'Cuota neodemócrata frente a la marca provincial: +22,0 puntos (2011) y +23,0 (2014) — años antes de su elección.',
        'Con Begum: +12,1 (2018, su primera elección y la prima MÁS BAJA registrada), +23,9 (2022), +24,4 (2025).',
        'Se conocen cuatro candidaturas: Dr. Noor Tarun (PC), Ahsanul Hafiz (liberal), Fatima Shaban (NPD) y Mark Bekkering (verde).',
      ],
    },
    modelNote: {
      en: 'Only two points are stripped: her first election produced the smallest New Democrat premium on record, which is hard to read as a personal effect. One risk is deliberately left unmodelled — Begum did not merely leave, she joined the Liberals and won under their banner. Some of her personal following may follow that move to the Liberal candidate, but nothing in the record lets us size that yet.',
      fr: 'Deux points seulement sont retirés : sa première élection a produit la plus faible prime néo-démocrate de l’historique, ce qui se lit mal comme un effet personnel. Un risque est volontairement laissé hors modèle — Begum n’est pas seulement partie, elle est passée aux libéraux et a gagné sous leur bannière. Une part de son électorat personnel pourrait suivre ce mouvement vers la candidate libérale, mais rien dans l’historique ne permet encore de le chiffrer.',
      es: 'Solo se retiran dos puntos: su primera elección produjo la menor prima neodemócrata registrada, algo difícil de leer como efecto personal. Un riesgo queda deliberadamente fuera del modelo — Begum no solo se fue, se pasó a los liberales y ganó bajo su bandera. Parte de su electorado personal podría seguir ese movimiento hacia el candidato liberal, pero nada en el registro permite cuantificarlo todavía.',
    },
    paths: {
      en: '/en/canada/ontario/byelections/scarborough-sud-ouest/',
      fr: '/fr/canada/ontario/byelections/scarborough-sud-ouest/',
      es: '/es/canada/ontario/byelections/scarborough-sud-ouest/',
    },
  },

  'york-simcoe': {
    slug: 'york-simcoe',
    ridingId: '00121',
    liveEventId: 'on-2026-09-03',
    liveRidingId: '121',
    dataPath: 'ontario-byelection-york-simcoe',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-09-03',
    vacancyDate: null,
    province: 'ON',
    ...attach,
    title: {
      en: 'York—Simcoe By-Election 2026: Polls, Forecast & Seat Projection — Vote-Scope',
      fr: 'Partielle de York—Simcoe 2026 : sondages, projection et pronostic — Vote-Scope',
      es: 'Parcial de York—Simcoe 2026: encuestas, proyección y pronóstico — Vote-Scope',
    },
    description: {
      en: 'Caroline Mulroney is leaving the safest of the three Ontario by-election seats. Her premium was full from her very first election — the signature of a riding lean, not accumulated personal capital.',
      fr: 'Caroline Mulroney quitte le plus sûr des trois sièges en partielle ontarienne. Sa prime était pleine dès sa toute première élection — la signature d’un lean de circonscription, pas d’un capital personnel accumulé.',
      es: 'Caroline Mulroney deja el más seguro de los tres escaños en parciales de Ontario. Su prima era plena desde su primera elección — la firma de una inclinación de circunscripción, no de un capital personal acumulado.',
    },
    kicker: {
      en: 'Ontario by-election · September 3, 2026',
      fr: 'Partielle ontarienne · 3 septembre 2026',
      es: 'Parcial de Ontario · 3 de septiembre de 2026',
    },
    headline: { en: 'A name, not a margin.', fr: 'Un nom, pas une marge.', es: 'Un nombre, no un margen.' },
    dek: {
      en: 'Mulroney is the most recognisable name of the three departures, which makes the measurement more interesting: her premium did not grow. It was 16.8 points in her first election and 16.4 in her last. A margin that arrives fully formed belongs to the riding.',
      fr: 'Mulroney est le nom le plus reconnaissable des trois départs, ce qui rend la mesure plus intéressante : sa prime n’a pas grandi. Elle valait 16,8 points à sa première élection et 16,4 à sa dernière. Une marge qui arrive déjà complète appartient à la circonscription.',
      es: 'Mulroney es el nombre más reconocible de las tres salidas, lo que hace la medición más interesante: su prima no creció. Era de 16,8 puntos en su primera elección y de 16,4 en la última. Un margen que llega ya formado pertenece a la circunscripción.',
    },
    why: {
      en: [
        'Caroline Mulroney is vacating the seat she has held since 2018.',
        'Progressive Conservative share versus their province-wide score: +16.8 points (2018, her first election), +15.9 (2022), +16.4 (2025) — full from the start and flat thereafter.',
        'Redistribution leaves no pre-incumbency observation for this seat, so the correction stays cautious rather than assuming the premium is entirely structural.',
        'The Progressive Conservatives took 59.4% here in 2025 — the safest of the three Ontario contests. No candidates were named at the time of writing.',
      ],
      fr: [
        'Caroline Mulroney quitte le siège qu’elle détenait depuis 2018.',
        'Part progressiste-conservatrice par rapport au score provincial : +16,8 points (2018, sa première élection), +15,9 (2022), +16,4 (2025) — pleine d’emblée, puis stable.',
        'Le redécoupage ne laisse aucune observation antérieure à son mandat pour ce siège : la correction reste prudente plutôt que de présumer la prime entièrement structurelle.',
        'Les progressistes-conservateurs y ont fait 59,4 % en 2025 — le plus sûr des trois scrutins ontariens. Aucune candidature n’était annoncée au moment de l’écriture.',
      ],
      es: [
        'Caroline Mulroney deja el escaño que ocupaba desde 2018.',
        'Cuota progresista conservadora frente a la marca provincial: +16,8 puntos (2018, su primera elección), +15,9 (2022), +16,4 (2025) — plena desde el inicio y estable después.',
        'La redistribución no deja ninguna observación anterior a su mandato para este escaño, así que la corrección se mantiene prudente en lugar de presumir que la prima es del todo estructural.',
        'Los progresistas conservadores lograron 59,4 % aquí en 2025 — el más seguro de los tres. No había candidaturas anunciadas al momento de escribir.',
      ],
    },
    modelNote: {
      en: 'Three points are stripped from the Progressive Conservative baseline — a deliberately small correction, since the evidence points to a structural lean and no pre-incumbency period exists to prove otherwise. No by-election turnout residual is applied.',
      fr: 'Trois points sont retirés de la base progressiste-conservatrice — correction volontairement faible, puisque les indices pointent vers un lean structurel et qu’aucune période pré-titulaire n’existe pour trancher. Aucun résidu de participation n’est appliqué.',
      es: 'Se retiran tres puntos de la base progresista conservadora — una corrección deliberadamente pequeña, ya que la evidencia apunta a una inclinación estructural y no existe periodo previo al mandato para demostrar lo contrario. No se aplica residuo de participación.',
    },
    paths: {
      en: '/en/canada/ontario/byelections/york-simcoe/',
      fr: '/fr/canada/ontario/byelections/york-simcoe/',
      es: '/es/canada/ontario/byelections/york-simcoe/',
    },
  },
} satisfies Record<string, ByelectionRaceConfig>;

export type OntarioByelectionRaceKey = keyof typeof ontarioByelectionRaces;
