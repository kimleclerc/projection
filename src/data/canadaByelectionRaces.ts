// Partielles fédérales en attente — 45e législature.
//
// Même contrat que specialElections.ts, mais UNIFORME dans les trois langues :
// aucune locale n'est un repli d'une autre, aucune page n'est noindex faute de
// traduction. Les chiffres du modèle ne sont JAMAIS écrits ici — ils viennent
// de web_data/<dataPath>/latest.json au build, produit par
// export_fed_byelections_web.py côté moteur.

export type ByelectionRaceLocale = 'en' | 'fr' | 'es';
type L<T> = Record<ByelectionRaceLocale, T>;

/** Statut d'une course : le bref est déposé ou non. */
export type ByelectionRaceStatus = 'scheduled' | 'vacant_pending_writ' | 'expected';

export interface ByelectionRaceConfig {
  slug: string;
  ridingId: string;
  dataPath: string;
  currentPage: string;
  status: ByelectionRaceStatus;
  /** null tant que le décret n'est pas pris. */
  electionDate: string | null;
  vacancyDate: string | null;
  province: string;
  /** Nom officiel par langue quand l'anglais diffère du français (Elections
   *  Canada publie les deux) ; à défaut, le nom français du moteur. */
  ridingName?: L<string>;
  /** Événement de résultats live, absent hors soirée électorale prise en charge. */
  liveEventId?: string;
  // The engine keys races by the jurisdiction's OWN district number (Ontario
  // publishes 37, not the zero-padded 00037 the rest of the site uses). When the
  // two differ, this is the id to match the live payload on.
  liveRidingId?: string;
  // Which authority publishes the count. Defaults to Elections Canada; a
  // provincial by-election MUST set it, or the page credits the wrong body.
  liveSourceName?: Record<ByelectionRaceLocale, string>;
  title: L<string>;
  description: L<string>;
  kicker: L<string>;
  headline: L<string>;
  dek: L<string>;
  /** Pourquoi cette partielle a lieu. */
  why: L<string[]>;
  /** Ce que le modèle fait de particulier ici. */
  modelNote: L<string>;
  paths: Record<ByelectionRaceLocale, string>;
  /**
   * Rattachement du desk. Absents, ces champs retombent sur le fédéral —
   * l'Ontario les fournit pour pointer vers son propre hub et sa projection.
   */
  hubPath?: L<string>;
  hubLabel?: L<string>;
  projectionPath?: L<string>;
  projectionLabel?: L<string>;
  /** Niveau 2 du fil d'Ariane (« Canada », « Ontario »…). */
  sectionLabel?: L<string>;
  sectionPath?: L<string>;
}

const WIKI = 'https://en.wikipedia.org/wiki/By-elections_to_the_45th_Canadian_Parliament';

/** Proclamation des partielles du 7 décembre 2026 (communiqué du premier ministre, 1er novembre). */
export const writSource = {
  date: '2026-12-07',
  url: 'https://www.pm.gc.ca/en/news/news-releases/2026/11/01/prime-minister-carney-announces-elections',
  label: {
    en: 'Prime Minister announces by-elections (November 1, 2026)',
    fr: 'Le premier ministre annonce des élections partielles (1er novembre 2026)',
    es: 'El primer ministro anuncia elecciones parciales (1 de noviembre de 2026)',
  },
};

export const canadaByelectionRaces = {


  'rosemont-la-petite-patrie': {
    slug: 'rosemont-la-petite-patrie',
    ridingId: '24065',
    dataPath: 'canada-byelection-rosemont-la-petite-patrie',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-12-07',
    vacancyDate: '2026-08-25',
    province: 'QC',
    title: {
      en: 'Rosemont—La Petite-Patrie By-Election, December 7, 2026: Forecast — Vote-Scope',
      fr: 'Partielle de Rosemont—La Petite-Patrie du 7 décembre 2026 : projection — Vote-Scope',
      es: 'Parcial de Rosemont—La Petite-Patrie del 7 de diciembre de 2026: proyección — Vote-Scope',
    },
    description: {
      en: 'Alexandre Boulerice won 40.5% here in 2025 while the NDP took 4.5% across Quebec. Our forecast for the December 7 by-election, with the share of his vote that leaves with him.',
      fr: 'Alexandre Boulerice a obtenu 40,5 % ici en 2025, le NPD 4,5 % au Québec. Notre projection pour la partielle du 7 décembre, et la part de son vote qui part avec lui.',
      es: 'Alexandre Boulerice obtuvo el 40,5 % aquí en 2025, y el NPD el 4,5 % en Quebec. Nuestra proyección para la parcial del 7 de diciembre y la parte de su voto que se va con él.',
    },
    kicker: {
      en: 'Federal by-election · Quebec',
      fr: 'Partielle fédérale · Québec',
      es: 'Parcial federal · Quebec',
    },
    headline: {
      en: 'The NDP’s last Quebec seat, without its member.',
      fr: 'Le dernier siège du NPD au Québec, sans son député.',
      es: 'El último escaño del NPD en Quebec, sin su diputado.',
    },
    dek: {
      en: 'Alexandre Boulerice was the last New Democrat elected in Quebec: 40.5% here in 2025, against 4.5% for his party across the province. He left to run for Québec solidaire. How much of that vote belonged to the NDP rather than to him decides this race.',
      fr: 'Alexandre Boulerice était le dernier néo-démocrate élu au Québec : 40,5 % ici en 2025, contre 4,5 % pour son parti dans la province. Il est parti se présenter pour Québec solidaire. La course se joue sur la part de ce vote qui revenait au NPD plutôt qu’à lui.',
      es: 'Alexandre Boulerice era el último neodemócrata elegido en Quebec: 40,5 % aquí en 2025, frente al 4,5 % de su partido en la provincia. Se fue para presentarse por Québec solidaire. La carrera depende de qué parte de ese voto era del NPD y no suya.',
    },
    why: {
      en: [
        'Boulerice sat as an independent from April 27, 2026 and ran for Québec solidaire in Gouin at the Quebec election of October 5, 2026. His seat has been vacant since August 25.',
        'Comparing 40.5% here with the NDP’s 4.5% across Quebec overstates his personal vote, because it puts central Montreal and the regions in the same average.',
        'Neighbouring ridings with similar profiles, and no well-known NDP candidate, gave the party 18.6% (Laurier—Sainte-Marie), 16.1% (Papineau) and 12.8% (Hochelaga—Rosemont-Est) in 2025.',
        'Québec solidaire won all four provincial ridings that overlap this one in 2022, including Gouin with 59.4%, its best result in Quebec. Those voters do not all vote NDP federally, but the left has a real base here.',
        'Without a correction, the general-election projection would still put the NDP near 44% here, a share that depends on a candidate who is not running.',
      ],
      fr: [
        'Boulerice siégeait comme indépendant depuis le 27 avril 2026 et s’est présenté pour Québec solidaire dans Gouin à l’élection québécoise du 5 octobre 2026. Son siège est vacant depuis le 25 août.',
        'Comparer 40,5 % ici aux 4,5 % du NPD au Québec gonfle son vote personnel, parce que cette moyenne met le centre de Montréal et les régions ensemble.',
        'Les circonscriptions voisines au profil semblable, sans candidat néo-démocrate connu, ont donné au parti 18,6 % (Laurier—Sainte-Marie), 16,1 % (Papineau) et 12,8 % (Hochelaga—Rosemont-Est) en 2025.',
        'Québec solidaire a remporté en 2022 les quatre circonscriptions provinciales qui recouvrent celle-ci, dont Gouin avec 59,4 %, son meilleur résultat au Québec. Ces électeurs ne votent pas tous NPD au fédéral, mais la gauche a ici une vraie base.',
        'Sans correction, la projection d’élection générale placerait encore le NPD près de 44 % ici, une part qui tient à un candidat absent du bulletin.',
      ],
      es: [
        'Boulerice era diputado independiente desde el 27 de abril de 2026 y se presentó por Québec solidaire en Gouin en las elecciones quebequesas del 5 de octubre de 2026. Su escaño está vacante desde el 25 de agosto.',
        'Comparar el 40,5 % de aquí con el 4,5 % del NPD en Quebec exagera su voto personal, porque esa media junta el centro de Montreal con las regiones.',
        'Las circunscripciones vecinas de perfil parecido, sin un candidato neodemócrata conocido, dieron al partido el 18,6 % (Laurier—Sainte-Marie), el 16,1 % (Papineau) y el 12,8 % (Hochelaga—Rosemont-Est) en 2025.',
        'Québec solidaire ganó en 2022 las cuatro circunscripciones provinciales que se solapan con esta, incluida Gouin con el 59,4 %, su mejor resultado en Quebec. Esos votantes no votan todos al NPD en las federales, pero la izquierda tiene aquí una base real.',
        'Sin corrección, la proyección de elecciones generales seguiría dando al NPD cerca del 44 % aquí, una cuota que depende de un candidato que no se presenta.',
      ],
    },
    modelNote: {
      en: 'We remove at most 18 points of personal vote from the NDP, less than half of Boulerice’s own 2025 result, and never take the party below 19%. The votes removed go mostly to the parties closest to the NDP (Liberals, Bloc, Greens), not in proportion to local strength, which would have handed the Conservatives votes they were unlikely to get.',
      fr: 'Nous retirons au NPD au plus 18 points de vote personnel, moins de la moitié du résultat de Boulerice en 2025, sans jamais faire descendre le parti sous 19 %. Les voix retirées vont surtout aux partis les plus proches du NPD (libéraux, Bloc, verts), et non au prorata des forces locales, ce qui aurait donné aux conservateurs des voix qu’ils avaient peu de chances d’obtenir.',
      es: 'Quitamos al NPD como máximo 18 puntos de voto personal, menos de la mitad del resultado de Boulerice en 2025, sin bajar nunca al partido del 19 %. Los votos retirados van sobre todo a los partidos más cercanos al NPD (liberales, Bloque, verdes), y no en proporción a la fuerza local, lo que habría dado a los conservadores votos que difícilmente iban a recibir.',
    },
    paths: {
      en: '/en/canada/byelections/rosemont-la-petite-patrie/',
      fr: '/fr/canada/byelections/rosemont-la-petite-patrie/',
      es: '/es/canada/byelections/rosemont-la-petite-patrie/',
    },
  },

  'saint-hyacinthe-bagot-acton': {
    slug: 'saint-hyacinthe-bagot-acton',
    ridingId: '24066',
    dataPath: 'canada-byelection-saint-hyacinthe-bagot-acton',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-12-07',
    vacancyDate: '2026-06-19',
    province: 'QC',
    title: {
      en: 'Saint-Hyacinthe—Bagot—Acton By-Election, December 7, 2026: Forecast — Vote-Scope',
      fr: 'Partielle de Saint-Hyacinthe—Bagot—Acton du 7 décembre 2026 : projection — Vote-Scope',
      es: 'Parcial de Saint-Hyacinthe—Bagot—Acton del 7 de diciembre de 2026: proyección — Vote-Scope',
    },
    description: {
      en: 'Simon-Pierre Savard-Tremblay left for Quebec politics. The Bloc already ran ahead of its provincial score here before he was elected. Our forecast for the December 7 by-election.',
      fr: 'Simon-Pierre Savard-Tremblay est passé à la politique québécoise. Le Bloc devançait déjà ici sa moyenne provinciale avant son élection. Notre projection pour la partielle du 7 décembre.',
      es: 'Simon-Pierre Savard-Tremblay pasó a la política quebequesa. El Bloque ya superaba aquí su media provincial antes de su elección. Nuestra proyección para la parcial del 7 de diciembre.',
    },
    kicker: {
      en: 'Federal by-election · Quebec',
      fr: 'Partielle fédérale · Québec',
      es: 'Parcial federal · Quebec',
    },
    headline: {
      en: 'The Bloc’s edge here predates its departing member.',
      fr: 'L’avance du Bloc ici est antérieure au député sortant.',
      es: 'La ventaja del Bloque aquí es anterior al diputado saliente.',
    },
    dek: {
      en: 'Simon-Pierre Savard-Tremblay left the Commons to run for the Parti Québécois in Saint-Hyacinthe. The Bloc was already 4.8 points above its Quebec-wide score here in 2015, four years before he won the seat, so most of its lead belongs to the riding.',
      fr: 'Simon-Pierre Savard-Tremblay a quitté les Communes pour se présenter pour le Parti québécois dans Saint-Hyacinthe. Le Bloc faisait déjà ici 4,8 points de plus que sa moyenne québécoise en 2015, quatre ans avant son élection : l’essentiel de son avance tient à la circonscription.',
      es: 'Simon-Pierre Savard-Tremblay dejó los Comunes para presentarse por el Parti Québécois en Saint-Hyacinthe. El Bloque ya sacaba aquí 4,8 puntos más que su media quebequesa en 2015, cuatro años antes de que él ganara el escaño, así que la mayor parte de su ventaja es de la circunscripción.',
    },
    why: {
      en: [
        'Savard-Tremblay resigned on June 19, 2026 to run for the Parti Québécois in Saint-Hyacinthe at the Quebec election of October 5, 2026.',
        'Bloc share compared with its Quebec-wide vote: +4.8 points in 2015, before his election, then +8.4 in 2019, +13.9 in 2021 and +15.3 in 2025.',
        'Since the edge existed before him, we remove only a small personal vote: 4 points.',
      ],
      fr: [
        'Savard-Tremblay a démissionné le 19 juin 2026 pour se présenter pour le Parti québécois dans Saint-Hyacinthe à l’élection québécoise du 5 octobre 2026.',
        'Part du Bloc par rapport à son vote québécois : +4,8 points en 2015, avant son élection, puis +8,4 en 2019, +13,9 en 2021 et +15,3 en 2025.',
        'L’avance existant avant lui, nous ne retirons qu’un faible vote personnel : 4 points.',
      ],
      es: [
        'Savard-Tremblay renunció el 19 de junio de 2026 para presentarse por el Parti Québécois en Saint-Hyacinthe en las elecciones quebequesas del 5 de octubre de 2026.',
        'Cuota del Bloque frente a su voto en Quebec: +4,8 puntos en 2015, antes de su elección, y luego +8,4 en 2019, +13,9 en 2021 y +15,3 en 2025.',
        'Como la ventaja existía antes que él, solo retiramos un voto personal pequeño: 4 puntos.',
      ],
    },
    modelNote: {
      en: 'There is no local poll. The forecast starts from our current federal projection for the riding, removes a small personal vote, and adds the turnout gap measured at the April 13, 2026 by-elections, when voters for the government party turned out more than opposition voters.',
      fr: 'Il n’y a pas de sondage local. La projection part de notre projection fédérale actuelle pour la circonscription, retire un faible vote personnel et ajoute l’écart de participation mesuré aux partielles du 13 avril 2026, où les électeurs du parti au pouvoir se sont davantage déplacés que ceux de l’opposition.',
      es: 'No hay encuesta local. La proyección parte de nuestra proyección federal actual para la circunscripción, retira un pequeño voto personal y añade la diferencia de participación medida en las parciales del 13 de abril de 2026, cuando los votantes del partido de gobierno acudieron más que los de la oposición.',
    },
    paths: {
      en: '/en/canada/byelections/saint-hyacinthe-bagot-acton/',
      fr: '/fr/canada/byelections/saint-hyacinthe-bagot-acton/',
      es: '/es/canada/byelections/saint-hyacinthe-bagot-acton/',
    },
  },

  'laurier-sainte-marie': {
    slug: 'laurier-sainte-marie',
    ridingId: '24037',
    dataPath: 'canada-byelection-laurier-sainte-marie',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-12-07',
    vacancyDate: '2026-08-28',
    province: 'QC',
    title: {
      en: 'Laurier—Sainte-Marie By-Election, December 7, 2026: Forecast — Vote-Scope',
      fr: 'Partielle de Laurier—Sainte-Marie du 7 décembre 2026 : projection — Vote-Scope',
      es: 'Parcial de Laurier—Sainte-Marie del 7 de diciembre de 2026: proyección — Vote-Scope',
    },
    description: {
      en: 'Steven Guilbeault left his seat to work on climate change outside Parliament. Before him, the Liberals ran 12 points below their Quebec average here. Our forecast for the December 7 by-election.',
      fr: 'Steven Guilbeault a quitté son siège pour travailler sur le climat hors du Parlement. Avant lui, les libéraux faisaient ici 12 points de moins que leur moyenne québécoise. Notre projection pour la partielle du 7 décembre.',
      es: 'Steven Guilbeault dejó su escaño para trabajar sobre el clima fuera del Parlamento. Antes de él, los liberales sacaban aquí 12 puntos menos que su media quebequesa. Nuestra proyección para la parcial del 7 de diciembre.',
    },
    kicker: {
      en: 'Federal by-election · Quebec',
      fr: 'Partielle fédérale · Québec',
      es: 'Parcial federal · Quebec',
    },
    headline: {
      en: 'A Liberal seat that was not Liberal before Guilbeault.',
      fr: 'Un siège libéral qui ne l’était pas avant Guilbeault.',
      es: 'Un escaño liberal que no lo era antes de Guilbeault.',
    },
    dek: {
      en: 'In 2015, before Steven Guilbeault ran here, the Liberals were 12.3 points below their Quebec-wide score. With him they were 8.4 points above it in 2025. Part of that lead is his, and leaves with him.',
      fr: 'En 2015, avant la candidature de Steven Guilbeault, les libéraux faisaient ici 12,3 points de moins que leur moyenne québécoise. Avec lui, ils faisaient 8,4 points de plus en 2025. Une partie de cette avance lui revient et part avec lui.',
      es: 'En 2015, antes de que Steven Guilbeault se presentara aquí, los liberales sacaban 12,3 puntos menos que su media quebequesa. Con él sacaron 8,4 puntos más en 2025. Parte de esa ventaja es suya y se va con él.',
    },
    why: {
      en: [
        'Guilbeault left the House of Commons on August 28, 2026 to work on climate change outside Parliament.',
        'Liberal share compared with the party’s Quebec-wide vote: −12.3 points in 2015 (before him), +6.8 in 2019, +2.8 in 2021, +8.4 in 2025.',
        'The riding has a strong left vote: the NDP still took 18.6% here in 2025.',
      ],
      fr: [
        'Guilbeault a quitté la Chambre des communes le 28 août 2026 pour travailler sur les changements climatiques hors du Parlement.',
        'Part libérale par rapport au vote libéral québécois : −12,3 points en 2015 (avant lui), +6,8 en 2019, +2,8 en 2021, +8,4 en 2025.',
        'La circonscription vote beaucoup à gauche : le NPD y a encore obtenu 18,6 % en 2025.',
      ],
      es: [
        'Guilbeault dejó la Cámara de los Comunes el 28 de agosto de 2026 para trabajar sobre el cambio climático fuera del Parlamento.',
        'Cuota liberal frente al voto liberal en Quebec: −12,3 puntos en 2015 (antes de él), +6,8 en 2019, +2,8 en 2021, +8,4 en 2025.',
        'La circunscripción vota mucho a la izquierda: el NPD aún obtuvo aquí el 18,6 % en 2025.',
      ],
    },
    modelNote: {
      en: 'There is no local poll. The forecast starts from our current federal projection for the riding, removes 3 points of personal vote from the Liberals, and adds the turnout gap measured at the April 13, 2026 by-elections.',
      fr: 'Il n’y a pas de sondage local. La projection part de notre projection fédérale actuelle pour la circonscription, retire 3 points de vote personnel aux libéraux et ajoute l’écart de participation mesuré aux partielles du 13 avril 2026.',
      es: 'No hay encuesta local. La proyección parte de nuestra proyección federal actual para la circunscripción, retira 3 puntos de voto personal a los liberales y añade la diferencia de participación medida en las parciales del 13 de abril de 2026.',
    },
    paths: {
      en: '/en/canada/byelections/laurier-sainte-marie/',
      fr: '/fr/canada/byelections/laurier-sainte-marie/',
      es: '/es/canada/byelections/laurier-sainte-marie/',
    },
  },

  'yorkton-melville': {
    slug: 'yorkton-melville',
    ridingId: '47014',
    dataPath: 'canada-byelection-yorkton-melville',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-12-07',
    vacancyDate: '2026-08-31',
    province: 'SK',
    title: {
      en: 'Yorkton—Melville By-Election, December 7, 2026: Forecast — Vote-Scope',
      fr: 'Partielle de Yorkton—Melville du 7 décembre 2026 : projection — Vote-Scope',
      es: 'Parcial de Yorkton—Melville del 7 de diciembre de 2026: proyección — Vote-Scope',
    },
    description: {
      en: 'Cathay Wagantall resigned on August 31, 2026. The Conservatives took 77% here in 2025, their best result among the seats voting on December 7. Our forecast.',
      fr: 'Cathay Wagantall a démissionné le 31 août 2026. Les conservateurs ont obtenu 77 % ici en 2025, leur meilleur résultat parmi les sièges qui votent le 7 décembre. Notre projection.',
      es: 'Cathay Wagantall renunció el 31 de agosto de 2026. Los conservadores obtuvieron el 77 % aquí en 2025, su mejor resultado entre los escaños que votan el 7 de diciembre. Nuestra proyección.',
    },
    kicker: {
      en: 'Federal by-election · Saskatchewan',
      fr: 'Partielle fédérale · Saskatchewan',
      es: 'Parcial federal · Saskatchewan',
    },
    headline: {
      en: 'The safest seat on the December 7 ballot.',
      fr: 'Le siège le plus sûr du 7 décembre.',
      es: 'El escaño más seguro del 7 de diciembre.',
    },
    dek: {
      en: 'A rural Saskatchewan riding where the Conservatives took 77% in 2025. They already ran well above their provincial score before Cathay Wagantall was elected, so very little of the margin is personal.',
      fr: 'Une circonscription rurale de la Saskatchewan où les conservateurs ont obtenu 77 % en 2025. Ils devançaient déjà largement leur moyenne provinciale avant l’élection de Cathay Wagantall : très peu de la marge est personnelle.',
      es: 'Una circunscripción rural de Saskatchewan donde los conservadores obtuvieron el 77 % en 2025. Ya superaban con holgura su media provincial antes de la elección de Cathay Wagantall, así que muy poco del margen es personal.',
    },
    why: {
      en: [
        'Cathay Wagantall resigned her seat effective August 31, 2026.',
        'Conservative share compared with the party’s Saskatchewan-wide vote: +10.5 points in 2015, before she was elected, and +11.9 in 2025.',
        'At 77% in 2025, this is the largest Conservative margin among the six seats voting on December 7.',
      ],
      fr: [
        'Cathay Wagantall a démissionné de son siège le 31 août 2026.',
        'Part conservatrice par rapport au vote conservateur en Saskatchewan : +10,5 points en 2015, avant son élection, et +11,9 en 2025.',
        'Avec 77 % en 2025, c’est la plus large marge conservatrice des six sièges qui votent le 7 décembre.',
      ],
      es: [
        'Cathay Wagantall renunció a su escaño con efecto el 31 de agosto de 2026.',
        'Cuota conservadora frente al voto conservador en Saskatchewan: +10,5 puntos en 2015, antes de su elección, y +11,9 en 2025.',
        'Con el 77 % en 2025, es el mayor margen conservador de los seis escaños que votan el 7 de diciembre.',
      ],
    },
    modelNote: {
      en: 'There is no local poll. The forecast starts from our current federal projection for the riding, removes 4 points of personal vote, and adds the turnout gap measured at the April 13, 2026 by-elections, which costs the Conservatives a little even here.',
      fr: 'Il n’y a pas de sondage local. La projection part de notre projection fédérale actuelle pour la circonscription, retire 4 points de vote personnel et ajoute l’écart de participation mesuré aux partielles du 13 avril 2026, qui coûte un peu aux conservateurs même ici.',
      es: 'No hay encuesta local. La proyección parte de nuestra proyección federal actual para la circunscripción, retira 4 puntos de voto personal y añade la diferencia de participación medida en las parciales del 13 de abril de 2026, que resta algo a los conservadores incluso aquí.',
    },
    paths: {
      en: '/en/canada/byelections/yorkton-melville/',
      fr: '/fr/canada/byelections/yorkton-melville/',
      es: '/es/canada/byelections/yorkton-melville/',
    },
  },

  'brantford-brant-sud': {
    slug: 'brantford-brant-sud',
    ridingId: '35015',
    dataPath: 'canada-byelection-brantford-brant-sud',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-12-07',
    vacancyDate: '2026-09-18',
    province: 'ON',
    // Nom de la proclamation du 1er novembre 2026 (communiqué du premier ministre).
    ridingName: {
      en: 'Brantford—Brant South',
      fr: 'Brantford—Brant-Sud',
      es: 'Brantford—Brant South',
    },
    title: {
      en: 'Brantford—Brant South By-Election, December 7, 2026: Forecast — Vote-Scope',
      fr: 'Partielle de Brantford—Brant-Sud du 7 décembre 2026 : projection — Vote-Scope',
      es: 'Parcial de Brantford—Brant South del 7 de diciembre de 2026: proyección — Vote-Scope',
    },
    description: {
      en: 'Larry Brock resigned on September 18, 2026. The Conservatives won here by 11 points in 2025, but our forecast for the December 7 by-election has the Liberals ahead.',
      fr: 'Larry Brock a démissionné le 18 septembre 2026. Les conservateurs ont gagné ici par 11 points en 2025, mais notre projection pour la partielle du 7 décembre place les libéraux devant.',
      es: 'Larry Brock renunció el 18 de septiembre de 2026. Los conservadores ganaron aquí por 11 puntos en 2025, pero nuestra proyección para la parcial del 7 de diciembre sitúa a los liberales por delante.',
    },
    kicker: {
      en: 'Federal by-election · Ontario',
      fr: 'Partielle fédérale · Ontario',
      es: 'Parcial federal · Ontario',
    },
    headline: {
      en: 'Conservative by 11 points in 2025, Liberal-leaning now.',
      fr: 'Conservateur par 11 points en 2025, penché vers les libéraux aujourd’hui.',
      es: 'Conservador por 11 puntos en 2025, inclinado hoy hacia los liberales.',
    },
    dek: {
      en: 'The Conservatives held this seat by eleven points in 2025. Brock took little of that with him. What changed is the national picture: the Conservative vote is down about nine points since April 2025, and turnout at this year’s by-elections has worked against the opposition.',
      fr: 'Les conservateurs ont gardé ce siège par onze points en 2025. Brock n’emporte pas grand-chose de cette avance. C’est le portrait national qui a changé : le vote conservateur a reculé d’environ neuf points depuis avril 2025, et la participation aux partielles de cette année a désavantagé l’opposition.',
      es: 'Los conservadores retuvieron este escaño por once puntos en 2025. Brock se lleva poco de esa ventaja. Lo que cambió es el panorama nacional: el voto conservador ha caído unos nueve puntos desde abril de 2025, y la participación en las parciales de este año ha perjudicado a la oposición.',
    },
    why: {
      en: [
        'Larry Brock announced his resignation on August 6, 2026; the seat has been vacant since September 18. He returned to the Crown attorney’s office in Brantford.',
        'He is the seventh MP to leave the Conservative caucus since the 2025 election. Four of them joined the Liberals.',
        'Conservative share compared with the party’s Ontario-wide vote: +5.8 points in 2015 and +7.2 in 2019, both before Brock was elected. Little of the edge is personal.',
      ],
      fr: [
        'Larry Brock a annoncé sa démission le 6 août 2026 ; le siège est vacant depuis le 18 septembre. Il est retourné au bureau du procureur de la Couronne à Brantford.',
        'Il est le septième député à quitter le caucus conservateur depuis l’élection de 2025. Quatre d’entre eux sont passés chez les libéraux.',
        'Part conservatrice par rapport au vote conservateur ontarien : +5,8 points en 2015 et +7,2 en 2019, avant son élection dans les deux cas. Peu de cette avance est personnelle.',
      ],
      es: [
        'Larry Brock anunció su renuncia el 6 de agosto de 2026; el escaño está vacante desde el 18 de septiembre. Volvió a la fiscalía de la Corona en Brantford.',
        'Es el séptimo diputado que deja el caucus conservador desde las elecciones de 2025. Cuatro de ellos se pasaron a los liberales.',
        'Cuota conservadora frente al voto conservador en Ontario: +5,8 puntos en 2015 y +7,2 en 2019, en ambos casos antes de su elección. Poca de esa ventaja es personal.',
      ],
    },
    modelNote: {
      en: 'Our general-election projection for the riding still has the Conservatives ahead; the by-election forecast does not. The difference is turnout. In a general election most voters show up; in a by-election, the side whose supporters are less motivated loses more of them. Liberal seats paid that price in 2024. With the Conservatives down nationally, their seats pay it now. A 3-point personal-vote correction for Brock is enough for the seat to change hands.',
      fr: 'Notre projection d’élection générale pour la circonscription place encore les conservateurs devant ; la projection de partielle, non. La différence tient à la participation. À une générale, la plupart des électeurs votent ; à une partielle, le camp dont les partisans sont moins motivés en perd davantage. Les sièges libéraux en ont fait les frais en 2024. Les conservateurs ayant reculé au pays, ce sont leurs sièges qui paient aujourd’hui. Une correction de 3 points de vote personnel pour Brock suffit à faire changer le siège de camp.',
      es: 'Nuestra proyección de elecciones generales para la circunscripción todavía sitúa a los conservadores por delante; la de la parcial, no. La diferencia es la participación. En unas generales vota la mayoría; en una parcial, el bando con simpatizantes menos motivados pierde más. Los escaños liberales lo pagaron en 2024. Con los conservadores a la baja en el país, ahora lo pagan sus escaños. Una corrección de 3 puntos de voto personal para Brock basta para que el escaño cambie de manos.',
    },
    paths: {
      en: '/en/canada/byelections/brantford-brant-sud/',
      fr: '/fr/canada/byelections/brantford-brant-sud/',
      es: '/es/canada/byelections/brantford-brant-sud/',
    },
  },

  'scarborough-nord': {
    slug: 'scarborough-nord',
    ridingId: '35095',
    dataPath: 'canada-byelection-scarborough-nord',
    currentPage: 'canada',
    status: 'scheduled',
    electionDate: '2026-12-07',
    vacancyDate: '2026-08-15',
    province: 'ON',
    ridingName: {
      en: 'Scarborough North',
      fr: 'Scarborough-Nord',
      es: 'Scarborough North',
    },
    title: {
      en: 'Scarborough North By-Election, December 7, 2026: Forecast — Vote-Scope',
      fr: 'Partielle de Scarborough-Nord du 7 décembre 2026 : projection — Vote-Scope',
      es: 'Parcial de Scarborough North del 7 de diciembre de 2026: proyección — Vote-Scope',
    },
    description: {
      en: 'Shaun Chen left the Commons on August 15, 2026. The Liberals won 62.4% here in 2025. Our forecast for the December 7 by-election.',
      fr: 'Shaun Chen a quitté les Communes le 15 août 2026. Les libéraux ont obtenu 62,4 % ici en 2025. Notre projection pour la partielle du 7 décembre.',
      es: 'Shaun Chen dejó los Comunes el 15 de agosto de 2026. Los liberales obtuvieron el 62,4 % aquí en 2025. Nuestra proyección para la parcial del 7 de diciembre.',
    },
    kicker: {
      en: 'Federal by-election · Ontario',
      fr: 'Partielle fédérale · Ontario',
      es: 'Parcial federal · Ontario',
    },
    headline: {
      en: 'The Liberals’ safest seat on December 7.',
      fr: 'Le siège libéral le plus sûr du 7 décembre.',
      es: 'El escaño liberal más seguro del 7 de diciembre.',
    },
    dek: {
      en: 'Shaun Chen leaves a riding where the Liberals won more than 60% in 2025. We cannot separate his personal vote from the riding’s own lean, so we remove none, and the seat starts as a very safe Liberal hold.',
      fr: 'Shaun Chen laisse une circonscription où les libéraux ont dépassé 60 % en 2025. Nous ne pouvons pas distinguer son vote personnel du penchant propre à la circonscription : nous n’en retirons donc aucun, et le siège part comme une défense libérale très sûre.',
      es: 'Shaun Chen deja una circunscripción donde los liberales superaron el 60 % en 2025. No podemos separar su voto personal de la inclinación propia de la circunscripción, así que no retiramos ninguno, y el escaño parte como una defensa liberal muy segura.',
    },
    why: {
      en: [
        'Shaun Chen left the House of Commons on August 15, 2026, after holding the riding since 2015.',
        'He won 62.4% in 2025, 13.4 points above the Liberal share across Ontario.',
        'The riding was created in 2013 and Chen won it at its first election, so there is no earlier result to measure his personal vote against.',
      ],
      fr: [
        'Shaun Chen a quitté la Chambre des communes le 15 août 2026, après avoir représenté la circonscription depuis 2015.',
        'Il a obtenu 62,4 % en 2025, 13,4 points de plus que la part libérale en Ontario.',
        'La circonscription a été créée en 2013 et Chen l’a remportée dès sa première élection : aucun résultat antérieur ne permet de mesurer son vote personnel.',
      ],
      es: [
        'Shaun Chen dejó la Cámara de los Comunes el 15 de agosto de 2026, tras representar la circunscripción desde 2015.',
        'Obtuvo el 62,4 % en 2025, 13,4 puntos más que el voto liberal en Ontario.',
        'La circunscripción se creó en 2013 y Chen la ganó en su primera elección, así que no hay un resultado anterior con el que medir su voto personal.',
      ],
    },
    modelNote: {
      en: 'There is no local poll. The forecast starts from our current federal projection for the riding and adds the turnout gap measured at the April 13, 2026 by-elections. No personal vote is removed, for lack of a reliable measure.',
      fr: 'Il n’y a pas de sondage local. La projection part de notre projection fédérale actuelle pour la circonscription et ajoute l’écart de participation mesuré aux partielles du 13 avril 2026. Aucun vote personnel n’est retiré, faute de mesure fiable.',
      es: 'No hay encuesta local. La proyección parte de nuestra proyección federal actual para la circunscripción y añade la diferencia de participación medida en las parciales del 13 de abril de 2026. No se retira voto personal, por falta de una medida fiable.',
    },
    paths: {
      en: '/en/canada/byelections/scarborough-nord/',
      fr: '/fr/canada/byelections/scarborough-nord/',
      es: '/es/canada/byelections/scarborough-nord/',
    },
  },

  'parry-sound-muskoka': {
    slug: 'parry-sound-muskoka',
    ridingId: '35084',
    dataPath: 'canada-byelection-parry-sound-muskoka',
    currentPage: 'canada',
    status: 'expected',
    electionDate: null,
    vacancyDate: null,
    province: 'ON',
    ridingName: {
      en: 'Parry Sound—Muskoka',
      fr: 'Parry Sound—Muskoka',
      es: 'Parry Sound—Muskoka',
    },
    title: {
      en: 'Parry Sound—Muskoka By-Election: Forecast — Vote-Scope',
      fr: 'Partielle de Parry Sound—Muskoka : projection — Vote-Scope',
      es: 'Parcial de Parry Sound—Muskoka: proyección — Vote-Scope',
    },
    description: {
      en: 'Scott Aitchison has said he will resign after the fall sitting. The seat is not vacant yet and was not part of the by-elections called on November 1. Our forecast.',
      fr: 'Scott Aitchison a annoncé sa démission après la session d’automne. Le siège n’est pas encore vacant et ne fait pas partie des partielles déclenchées le 1er novembre. Notre projection.',
      es: 'Scott Aitchison anunció que renunciará tras el periodo de sesiones de otoño. El escaño aún no está vacante y no forma parte de las parciales convocadas el 1 de noviembre. Nuestra proyección.',
    },
    kicker: {
      en: 'Federal by-election · Ontario',
      fr: 'Partielle fédérale · Ontario',
      es: 'Parcial federal · Ontario',
    },
    headline: {
      en: 'Departure announced, seat not yet vacant.',
      fr: 'Départ annoncé, siège pas encore vacant.',
      es: 'Salida anunciada, escaño aún no vacante.',
    },
    dek: {
      en: 'Scott Aitchison is still the Conservative MP. A by-election will follow once he resigns and a writ is issued. It was not among the six called on November 1, 2026.',
      fr: 'Scott Aitchison est toujours député conservateur. Une partielle suivra sa démission, une fois le bref émis. Elle ne figure pas parmi les six déclenchées le 1er novembre 2026.',
      es: 'Scott Aitchison sigue siendo diputado conservador. Habrá una parcial cuando renuncie y se emita el decreto. No está entre las seis convocadas el 1 de noviembre de 2026.',
    },
    why: {
      en: [
        'On September 30, 2026, Scott Aitchison announced that he would resign after the fall sitting of Parliament.',
        'The seat is not yet vacant. No date or new candidate has been confirmed.',
      ],
      fr: [
        'Le 30 septembre 2026, Scott Aitchison a annoncé qu’il démissionnerait après la session parlementaire d’automne.',
        'Le siège n’est pas encore vacant. Aucune date ni nouvelle candidature n’est confirmée.',
      ],
      es: [
        'El 30 de septiembre de 2026, Scott Aitchison anunció que renunciaría tras el periodo de sesiones de otoño.',
        'El escaño aún no está vacante. No se han confirmado fecha ni nuevas candidaturas.',
      ],
    },
    modelNote: {
      en: 'The forecast starts from our current federal projection for the riding and adds the turnout gap measured at the April 13, 2026 by-elections. It uses no local poll and no estimate of Aitchison’s personal vote. Candidacies and local polls may change it.',
      fr: 'La projection part de notre projection fédérale actuelle pour la circonscription et ajoute l’écart de participation mesuré aux partielles du 13 avril 2026. Elle n’utilise aucun sondage local ni estimation du vote personnel d’Aitchison. Les candidatures et les sondages locaux pourront la modifier.',
      es: 'La proyección parte de nuestra proyección federal actual para la circunscripción y añade la diferencia de participación medida en las parciales del 13 de abril de 2026. No usa encuestas locales ni una estimación del voto personal de Aitchison. Las candidaturas y las encuestas locales podrán modificarla.',
    },
    paths: {
      en: '/en/canada/byelections/parry-sound-muskoka/',
      fr: '/fr/canada/byelections/parry-sound-muskoka/',
      es: '/es/canada/byelections/parry-sound-muskoka/',
    },
  },
} satisfies Record<string, ByelectionRaceConfig>;

export type CanadaByelectionRaceKey = keyof typeof canadaByelectionRaces;

export const byelectionSourceUrl = WIKI;

export function byelectionRaceAlternates(config: ByelectionRaceConfig) {
  return Object.fromEntries(
    Object.entries(config.paths).map(([locale, path]) => [
      locale,
      `https://vote-scope.com${path}`,
    ]),
  ) as Record<ByelectionRaceLocale, string>;
}
