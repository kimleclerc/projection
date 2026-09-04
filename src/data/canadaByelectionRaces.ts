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

export const canadaByelectionRaces = {

  'rosemont-la-petite-patrie': {
    slug: 'rosemont-la-petite-patrie',
    ridingId: '24065',
    dataPath: 'canada-byelection-rosemont-la-petite-patrie',
    currentPage: 'canada',
    status: 'vacant_pending_writ',
    electionDate: null,
    vacancyDate: null,
    province: 'QC',
    title: {
      en: 'Rosemont—La Petite-Patrie By-Election: The Last NDP Seat in Quebec — Vote-Scope',
      fr: 'Partielle de Rosemont—La Petite-Patrie : le dernier siège NPD du Québec — Vote-Scope',
      es: 'Parcial de Rosemont—La Petite-Patrie: el último escaño del NPD en Quebec — Vote-Scope',
    },
    description: {
      en: 'Alexandre Boulerice held 40.5% while his party polled 4.5% province-wide. Vote-Scope separates the man from the riding — and finds a progressive floor that does not leave with him.',
      fr: 'Alexandre Boulerice tenait 40,5 % pendant que son parti récoltait 4,5 % au Québec. Vote-Scope sépare l’homme de la circonscription — et trouve un socle progressiste qui ne part pas avec lui.',
      es: 'Alexandre Boulerice mantenía 40,5 % mientras su partido lograba 4,5 % en Quebec. Vote-Scope separa al hombre de la circunscripción — y encuentra un suelo progresista que no se va con él.',
    },
    kicker: {
      en: 'Federal by-election · Quebec · expected',
      fr: 'Partielle fédérale · Québec · anticipée',
      es: 'Parcial federal · Quebec · prevista',
    },
    headline: {
      en: 'One man, one seat.',
      fr: 'Un homme, un siège.',
      es: 'Un hombre, un escaño.',
    },
    dek: {
      en: 'Alexandre Boulerice was the last New Democrat in Quebec, and very nearly the last New Democrat vote: 40.5% here against 4.5% province-wide. He is leaving to run for Québec solidaire. The question is how much of that vote was ever his party’s.',
      fr: 'Alexandre Boulerice était le dernier néo-démocrate du Québec, et presque le dernier vote néo-démocrate : 40,5 % ici contre 4,5 % dans la province. Il part se présenter pour Québec solidaire. Reste à savoir quelle part de ce vote a jamais appartenu à son parti.',
      es: 'Alexandre Boulerice era el último neodemócrata de Quebec, y casi el último voto neodemócrata: 40,5 % aquí frente a 4,5 % en la provincia. Se va a presentarse por Québec solidaire. La pregunta es qué parte de ese voto fue alguna vez de su partido.',
    },
    why: {
      en: [
        'Boulerice has sat as an independent since April 27, 2026 and will run for Québec solidaire in Gouin at the Quebec general election.',
        'The naive comparison — 40.5% here against 4.5% for the NDP across Quebec — overstates the personal effect, because it lumps central Montreal in with the regions.',
        'The right control group is the neighbouring, comparable ridings, which gave the NDP 18.6% (Laurier—Sainte-Marie), 16.1% (Papineau) and 12.8% (Hochelaga—Rosemont-Est) with no star on the ballot.',
        'The local progressive base is real: Québec solidaire won all four overlapping provincial ridings in 2022, including Gouin at 59.4% — its strongest seat in Quebec. That vote does not transfer to the NDP one-for-one, but it rules out collapsing them to the provincial average.',
        'Left uncorrected, the general-election model still carries the NDP near 44% here — the personal vote of a candidate who is not running.',
      ],
      fr: [
        'Boulerice siège comme indépendant depuis le 27 avril 2026 et sera candidat de Québec solidaire dans Gouin à la générale québécoise.',
        'La comparaison naïve — 40,5 % ici contre 4,5 % pour le NPD au Québec — surestime l’effet personnel, parce qu’elle mélange le centre de Montréal et les régions.',
        'Le bon groupe de contrôle, ce sont les voisines comparables, qui donnent au NPD 18,6 % (Laurier—Sainte-Marie), 16,1 % (Papineau) et 12,8 % (Hochelaga—Rosemont-Est) sans vedette au bulletin.',
        'Le socle progressiste local est réel : Québec solidaire remporte les quatre circonscriptions provinciales recouvrantes en 2022, dont Gouin à 59,4 % — son meilleur siège au Québec. Ce vote n’est pas transférable au NPD un pour un, mais il interdit de rabattre le parti sur la moyenne provinciale.',
        'Sans correction, le modèle de générale porte encore le NPD près de 44 % ici — le vote personnel d’un candidat qui ne se présente pas.',
      ],
      es: [
        'Boulerice es diputado independiente desde el 27 de abril de 2026 y será candidato de Québec solidaire en Gouin en las generales quebequesas.',
        'La comparación ingenua — 40,5 % aquí frente al 4,5 % del NPD en Quebec — exagera el efecto personal, porque mezcla el centro de Montreal con las regiones.',
        'El grupo de control correcto son las circunscripciones vecinas comparables, que dan al NPD 18,6 % (Laurier—Sainte-Marie), 16,1 % (Papineau) y 12,8 % (Hochelaga—Rosemont-Est) sin estrella en la papeleta.',
        'El suelo progresista local es real: Québec solidaire ganó las cuatro circunscripciones provinciales solapadas en 2022, incluida Gouin con 59,4 % — su mejor escaño en Quebec. Ese voto no se transfiere al NPD uno a uno, pero impide reducirlo a la media provincial.',
        'Sin corregir, el modelo de generales todavía sitúa al NPD cerca del 44 % aquí — el voto personal de un candidato que no se presenta.',
      ],
    },
    modelNote: {
      en: 'The personal-vote correction here is capped at 18 points — under half of Boulerice’s own 2025 vote, because an effect larger than half stops being a personal vote and becomes the whole seat attributed to one person — and floored at 19%, so the local progressive base survives his departure. Orphaned votes are transferred on ideological lines rather than in proportion to each party’s local strength, which would have handed the Conservatives votes they were never going to receive.',
      fr: 'La correction du vote personnel est plafonnée à 18 points — moins de la moitié du vote de Boulerice lui-même, parce qu’un effet supérieur à la moitié cesse d’être un vote personnel pour devenir le siège entier attribué à une personne — et bornée par un plancher de 19 %, pour que le socle progressiste local survive à son départ. Les votes orphelins sont reportés selon des affinités idéologiques et non au prorata des forces locales, ce qui aurait donné aux conservateurs des voix qu’ils n’auraient jamais reçues.',
      es: 'La corrección del voto personal está limitada a 18 puntos — menos de la mitad del voto del propio Boulerice, porque un efecto superior a la mitad deja de ser voto personal y pasa a ser el escaño entero atribuido a una persona — y con un suelo del 19 %, para que la base progresista local sobreviva a su marcha. Los votos huérfanos se transfieren por afinidad ideológica y no en proporción a la fuerza local, lo que habría dado a los conservadores votos que nunca iban a recibir.',
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
    status: 'vacant_pending_writ',
    electionDate: null,
    vacancyDate: null,
    province: 'QC',
    title: {
      en: 'Saint-Hyacinthe—Bagot—Acton By-Election Forecast — Vote-Scope',
      fr: 'Partielle de Saint-Hyacinthe—Bagot—Acton : projection — Vote-Scope',
      es: 'Parcial de Saint-Hyacinthe—Bagot—Acton: proyección — Vote-Scope',
    },
    description: {
      en: 'Simon-Pierre Savard-Tremblay left for provincial politics. The Bloc lean here is structural rather than personal — but the by-election turnout residual narrows the race.',
      fr: 'Simon-Pierre Savard-Tremblay part vers la politique provinciale. Le penchant bloquiste ici est structurel plus que personnel — mais le résidu de participation resserre la course.',
      es: 'Simon-Pierre Savard-Tremblay se va a la política provincial. La inclinación bloquista aquí es estructural más que personal — pero el residuo de participación estrecha la carrera.',
    },
    kicker: {
      en: 'Federal by-election · Quebec · writ pending',
      fr: 'Partielle fédérale · Québec · en attente du bref',
      es: 'Parcial federal · Quebec · a la espera del decreto',
    },
    headline: {
      en: 'A Bloc seat, not a Bloc star.',
      fr: 'Un siège bloquiste, pas une vedette bloquiste.',
      es: 'Un escaño bloquista, no una estrella bloquista.',
    },
    dek: {
      en: 'Simon-Pierre Savard-Tremblay is running for the Parti Québécois in Saint-Hyacinthe this October. Unlike Chicoutimi, the departing member is not the reason his party wins here: the Bloc premium predates him.',
      fr: 'Simon-Pierre Savard-Tremblay sera candidat du Parti québécois dans Saint-Hyacinthe en octobre. Contrairement à Chicoutimi, le député sortant n’est pas la raison des victoires de son parti ici : la prime bloquiste lui est antérieure.',
      es: 'Simon-Pierre Savard-Tremblay se presenta por el Parti Québécois en Saint-Hyacinthe en octubre. A diferencia de Chicoutimi, el diputado saliente no es la razón por la que su partido gana aquí: la prima bloquista es anterior a él.',
    },
    why: {
      en: [
        'Savard-Tremblay is leaving the Commons to stand for the Parti Québécois in Saint-Hyacinthe at the Quebec general election expected in October 2026.',
        'The Bloc ran 4.8 points ahead of its Quebec-wide score here in 2015 — before he was elected. The lean belongs to the riding, not to him.',
        'The correction applied is therefore small, and deliberately conservative.',
        'The vacancy date still has to be confirmed with the Chief Electoral Officer.',
      ],
      fr: [
        'Savard-Tremblay quitte les Communes pour se présenter sous la bannière du Parti québécois dans Saint-Hyacinthe à la générale québécoise attendue en octobre 2026.',
        'Le Bloc devançait ici sa moyenne québécoise de 4,8 points dès 2015 — avant son élection. Le penchant appartient à la circonscription, pas à lui.',
        'La correction appliquée est donc faible, et volontairement prudente.',
        'La date de vacance reste à confirmer auprès du directeur général des élections.',
      ],
      es: [
        'Savard-Tremblay deja los Comunes para presentarse por el Parti Québécois en Saint-Hyacinthe en las generales quebequesas previstas para octubre de 2026.',
        'El Bloque aventajaba aquí su media quebequesa en 4,8 puntos ya en 2015 — antes de su elección. La inclinación pertenece a la circunscripción, no a él.',
        'La corrección aplicada es por tanto pequeña, y deliberadamente prudente.',
        'La fecha de vacante aún debe confirmarse con el director general de elecciones.',
      ],
    },
    modelNote: {
      en: 'No constituency poll exists, so the projection starts from the riding’s current general-election projection and adds the by-election turnout residual measured on April 13, 2026.',
      fr: 'Aucun sondage de circonscription n’existe : la projection part donc de la projection générale courante du siège et y ajoute le résidu de participation mesuré le 13 avril 2026.',
      es: 'No existe encuesta de circunscripción, así que la proyección parte de la proyección general actual del escaño y añade el residuo de participación medido el 13 de abril de 2026.',
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
    status: 'vacant_pending_writ',
    electionDate: null,
    vacancyDate: null,
    province: 'QC',
    title: {
      en: 'Laurier—Sainte-Marie By-Election Forecast — Vote-Scope',
      fr: 'Partielle de Laurier—Sainte-Marie : projection — Vote-Scope',
      es: 'Parcial de Laurier—Sainte-Marie: proyección — Vote-Scope',
    },
    description: {
      en: 'Steven Guilbeault says he will resign in the summer of 2026 to fight climate change outside Parliament. The seat was below the Liberal average before he took it.',
      fr: 'Steven Guilbeault annonce sa démission à l’été 2026 pour militer sur le climat hors du Parlement. Le siège était sous la moyenne libérale avant lui.',
      es: 'Steven Guilbeault anunció que renunciará en el verano de 2026 para luchar contra el cambio climático fuera del Parlamento. El escaño estaba por debajo de la media liberal antes de él.',
    },
    kicker: {
      en: 'Federal by-election · Quebec · expected',
      fr: 'Partielle fédérale · Québec · anticipée',
      es: 'Parcial federal · Quebec · prevista',
    },
    headline: {
      en: 'Leaving to campaign elsewhere.',
      fr: 'Partir militer ailleurs.',
      es: 'Irse a militar a otra parte.',
    },
    dek: {
      en: 'In 2015, before Guilbeault, the Liberals here ran 12.3 points BELOW their Quebec average. He turned that into a lead. A real but modest share of the seat is personal — and the vacancy is not yet effective.',
      fr: 'En 2015, avant Guilbeault, les libéraux faisaient ici 12,3 points SOUS leur moyenne québécoise. Il en a fait une avance. Une part réelle mais modeste du siège est personnelle — et la vacance n’est pas encore effective.',
      es: 'En 2015, antes de Guilbeault, los liberales aquí quedaban 12,3 puntos POR DEBAJO de su media quebequesa. Él lo convirtió en ventaja. Una parte real pero modesta del escaño es personal — y la vacante aún no es efectiva.',
    },
    why: {
      en: [
        'Guilbeault announced he intends to resign his seat during the summer of 2026 to work on climate change outside Parliament.',
        'Liberal share versus the Quebec-wide Liberal vote: −12.3 points in 2015 (before him), +6.8 in 2019, +2.8 in 2021, +8.4 in 2025.',
        'Because the seat started well below the party average, a real but modest part of the current lead is personal.',
        'No writ can issue until the resignation actually takes effect.',
      ],
      fr: [
        'Guilbeault a annoncé son intention de démissionner à l’été 2026 pour travailler sur les changements climatiques hors du Parlement.',
        'Part libérale par rapport au vote libéral québécois : −12,3 points en 2015 (avant lui), +6,8 en 2019, +2,8 en 2021, +8,4 en 2025.',
        'Le siège partant nettement sous la moyenne du parti, une part réelle mais modeste de l’avance actuelle est personnelle.',
        'Aucun bref ne peut être émis avant que la démission prenne effet.',
      ],
      es: [
        'Guilbeault anunció su intención de renunciar en el verano de 2026 para trabajar sobre el cambio climático fuera del Parlamento.',
        'Cuota liberal frente al voto liberal quebequés: −12,3 puntos en 2015 (antes de él), +6,8 en 2019, +2,8 en 2021, +8,4 en 2025.',
        'Al partir el escaño muy por debajo de la media del partido, una parte real pero modesta de la ventaja actual es personal.',
        'No puede emitirse decreto hasta que la renuncia sea efectiva.',
      ],
    },
    modelNote: {
      en: 'Baseline from the riding’s current general-election projection, minus a modest personal-vote correction, plus the measured by-election turnout residual.',
      fr: 'Base tirée de la projection générale courante du siège, moins une correction modeste de vote personnel, plus le résidu de participation mesuré.',
      es: 'Base tomada de la proyección general actual del escaño, menos una corrección modesta de voto personal, más el residuo de participación medido.',
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
    status: 'vacant_pending_writ',
    electionDate: null,
    vacancyDate: null,
    province: 'SK',
    title: {
      en: 'Yorkton—Melville By-Election Forecast — Vote-Scope',
      fr: 'Partielle de Yorkton—Melville : projection — Vote-Scope',
      es: 'Parcial de Yorkton—Melville: proyección — Vote-Scope',
    },
    description: {
      en: 'Cathay Wagantall resigns effective August 31, 2026, leaving the safest seat of the eight: the Conservatives took 77% here in 2025.',
      fr: 'Cathay Wagantall démissionne le 31 août 2026, laissant le siège le plus sûr des huit : les conservateurs y ont fait 77 % en 2025.',
      es: 'Cathay Wagantall renuncia con efecto el 31 de agosto de 2026, dejando el escaño más seguro de los ocho: los conservadores lograron 77 % aquí en 2025.',
    },
    kicker: {
      en: 'Federal by-election · Saskatchewan · expected',
      fr: 'Partielle fédérale · Saskatchewan · anticipée',
      es: 'Parcial federal · Saskatchewan · prevista',
    },
    headline: {
      en: 'The safest of the eight.',
      fr: 'Le plus sûr des huit.',
      es: 'El más seguro de los ocho.',
    },
    dek: {
      en: 'Rural Saskatchewan at its most Conservative. The seat ran ahead of the provincial Conservative score before Wagantall was ever elected, so almost none of the margin is personal — and almost nothing about this race is in doubt.',
      fr: 'La Saskatchewan rurale dans sa version la plus conservatrice. Le siège devançait le score conservateur provincial avant même l’élection de Wagantall : presque rien de la marge n’est personnel — et presque rien de cette course n’est incertain.',
      es: 'La Saskatchewan rural en su versión más conservadora. El escaño aventajaba la marca conservadora provincial antes incluso de la elección de Wagantall: casi nada del margen es personal — y casi nada de esta carrera está en duda.',
    },
    why: {
      en: [
        'Cathay Wagantall announced her resignation, effective August 31, 2026.',
        'Conservative share versus the Saskatchewan-wide Conservative vote: +10.5 points in 2015, before she was elected. The premium is structural.',
        'The Conservatives took 77% here in 2025 — the largest margin among the eight pending or expected by-elections.',
      ],
      fr: [
        'Cathay Wagantall a annoncé sa démission, effective le 31 août 2026.',
        'Part conservatrice par rapport au vote conservateur saskatchewanais : +10,5 points en 2015, avant son élection. La prime est structurelle.',
        'Les conservateurs ont fait 77 % ici en 2025 — la plus large marge des huit partielles en attente ou anticipées.',
      ],
      es: [
        'Cathay Wagantall anunció su renuncia, efectiva el 31 de agosto de 2026.',
        'Cuota conservadora frente al voto conservador de Saskatchewan: +10,5 puntos en 2015, antes de su elección. La prima es estructural.',
        'Los conservadores lograron 77 % aquí en 2025 — el mayor margen de las ocho parciales pendientes o previstas.',
      ],
    },
    modelNote: {
      en: 'Baseline from the riding’s current general-election projection, minus a small personal-vote correction, plus the measured by-election turnout residual — which works against the Conservatives even in a seat this safe.',
      fr: 'Base tirée de la projection générale courante du siège, moins une faible correction de vote personnel, plus le résidu de participation mesuré — qui joue contre les conservateurs même dans un siège aussi sûr.',
      es: 'Base tomada de la proyección general actual del escaño, menos una pequeña corrección de voto personal, más el residuo de participación medido — que juega en contra de los conservadores incluso en un escaño tan seguro.',
    },
    paths: {
      en: '/en/canada/byelections/yorkton-melville/',
      fr: '/fr/canada/byelections/yorkton-melville/',
      es: '/es/canada/byelections/yorkton-melville/',
    },
  },
  'brantford-brant-sud-six-nations': {
    slug: 'brantford-brant-sud-six-nations',
    ridingId: '35015',
    dataPath: 'canada-byelection-brantford-brant-sud-six-nations',
    currentPage: 'canada',
    status: 'expected',
    electionDate: null,
    vacancyDate: null,
    province: 'ON',
    title: {
      en: 'Brantford—Brant South—Six Nations By-Election Forecast — Vote-Scope',
      fr: 'Partielle de Brantford—Brant-Sud—Six Nations : projection — Vote-Scope',
      es: 'Parcial de Brantford—Brant South—Six Nations: proyección — Vote-Scope',
    },
    description: {
      en: 'Larry Brock resigns September 18, 2026 to return to the Crown attorney’s office. The Conservatives won here by 11 points in 2025 — and this is the first of the eight pending by-elections the model does not call for the incumbent party.',
      fr: 'Larry Brock démissionne le 18 septembre 2026 pour retourner au bureau du procureur de la Couronne. Les conservateurs ont gagné ici par 11 points en 2025 — et c’est la première des huit partielles en attente que le modèle ne donne pas au parti sortant.',
      es: 'Larry Brock renuncia el 18 de septiembre de 2026 para volver a la fiscalía de la Corona. Los conservadores ganaron aquí por 11 puntos en 2025 — y es la primera de las ocho parciales pendientes que el modelo no adjudica al partido saliente.',
    },
    kicker: {
      en: 'Federal by-election · Ontario · expected',
      fr: 'Partielle fédérale · Ontario · anticipée',
      es: 'Parcial federal · Ontario · prevista',
    },
    headline: {
      en: 'The first one that is actually in play.',
      fr: 'La première qui est vraiment jouable.',
      es: 'La primera que está realmente en juego.',
    },
    dek: {
      en: 'A seat the Conservatives held by eleven points is the closest race of the eight — not because the departing member took much with him, but because the Conservative vote has fallen roughly nine points nationally since April 2025, and by-election turnout has been running against them all year.',
      fr: 'Un siège conservateur avec onze points d’avance est la course la plus serrée des huit — non parce que le député sortant emporte grand-chose, mais parce que le vote conservateur a reculé d’environ neuf points au pays depuis avril 2025, et que la participation des partielles joue contre lui depuis le début de l’année.',
      es: 'Un escaño conservador con once puntos de ventaja es la carrera más reñida de las ocho — no porque el diputado saliente se lleve mucho consigo, sino porque el voto conservador ha caído unos nueve puntos en el país desde abril de 2025, y la participación en las parciales viene jugando en su contra todo el año.',
    },
    why: {
      en: [
        'Larry Brock announced on August 6, 2026 that he will resign effective September 18, to return to the Crown attorney’s office in Brantford.',
        'He is the seventh MP to leave the Conservative caucus since the 2025 election — four of them crossed to the Liberals.',
        'Conservative share versus the Ontario-wide Conservative vote: +5.8 points in 2015 and +7.2 in 2019, both before Brock was elected. The premium predates him, so little of it is personal.',
      ],
      fr: [
        'Larry Brock a annoncé le 6 août 2026 sa démission, effective le 18 septembre, pour retourner au bureau du procureur de la Couronne à Brantford.',
        'Il est le septième député à quitter le caucus conservateur depuis la générale de 2025 — quatre d’entre eux ont traversé chez les libéraux.',
        'Part conservatrice par rapport au vote conservateur ontarien : +5,8 points en 2015 et +7,2 en 2019, avant son élection dans les deux cas. La prime le précède : peu de chose y est personnel.',
      ],
      es: [
        'Larry Brock anunció el 6 de agosto de 2026 su renuncia, efectiva el 18 de septiembre, para volver a la fiscalía de la Corona en Brantford.',
        'Es el séptimo diputado en dejar el caucus conservador desde las generales de 2025 — cuatro de ellos se pasaron a los liberales.',
        'Cuota conservadora frente al voto conservador de Ontario: +5,8 puntos en 2015 y +7,2 en 2019, en ambos casos antes de su elección. La prima es anterior a él: poco de ella es personal.',
      ],
    },
    modelNote: {
      en: 'The riding’s general-election projection still has the Conservatives ahead, and the by-election projection does not. That gap is the model working, not failing: the two answer different questions. A general election turns out everybody; a by-election turns out whoever is still motivated, and that differential costs the demobilised side. Liberal-held seats paid it through 2024, when the Liberals were the unpopular ones. With the Conservative vote down roughly nine points nationally since April 2025, Conservative-held seats pay it now. Add a small personal-vote strip for a departing member and the seat crosses over.',
      fr: 'La projection générale du siège place encore les conservateurs devant, et la projection de partielle non. Cet écart est le modèle qui fonctionne, pas qui se trompe : les deux répondent à des questions différentes. Une générale fait voter tout le monde ; une partielle fait voter qui reste motivé, et ce différentiel coûte au camp démobilisé. Les sièges libéraux l’ont payé tout au long de 2024, quand c’étaient les libéraux les impopulaires. Le vote conservateur ayant reculé d’environ neuf points au pays depuis avril 2025, ce sont les sièges conservateurs qui le paient aujourd’hui. Ajoutez un faible retrait de vote personnel pour un député sortant, et le siège bascule.',
      es: 'La proyección general del escaño todavía sitúa a los conservadores por delante, y la proyección de la parcial no. Esa brecha es el modelo funcionando, no fallando: cada una responde a una pregunta distinta. Unas generales movilizan a todo el mundo; una parcial moviliza a quien sigue motivado, y ese diferencial le cuesta al bando desmovilizado. Los escaños liberales lo pagaron durante todo 2024, cuando los impopulares eran ellos. Como el voto conservador ha caído unos nueve puntos en el país desde abril de 2025, hoy lo pagan los escaños conservadores. Súmese un pequeño retiro de voto personal por un diputado saliente, y el escaño cambia de manos.',
    },
    paths: {
      en: '/en/canada/byelections/brantford-brant-sud-six-nations/',
      fr: '/fr/canada/byelections/brantford-brant-sud-six-nations/',
      es: '/es/canada/byelections/brantford-brant-sud-six-nations/',
    },
  },
  'scarborough-nord': {
    slug: 'scarborough-nord',
    ridingId: '35095',
    dataPath: 'canada-byelection-scarborough-nord',
    currentPage: 'canada',
    status: 'vacant_pending_writ',
    electionDate: null,
    vacancyDate: '2026-08-15',
    province: 'ON',
    title: {
      en: 'Scarborough North By-Election Forecast — Vote-Scope',
      fr: 'Partielle de Scarborough-Nord : projection — Vote-Scope',
      es: 'Parcial de Scarborough Norte: proyección — Vote-Scope',
    },
    description: {
      en: 'Shaun Chen resigns as Liberal MP effective August 15, 2026. Vote-Scope projects the coming Scarborough North by-election from a seat the Liberals won with 62.4% in 2025.',
      fr: 'Shaun Chen démissionne comme député libéral le 15 août 2026. Vote-Scope projette la future partielle de Scarborough-Nord, un siège gagné par les libéraux avec 62,4 % en 2025.',
      es: 'Shaun Chen renuncia como diputado liberal el 15 de agosto de 2026. Vote-Scope proyecta la próxima parcial de Scarborough Norte, que los liberales ganaron con el 62,4 % en 2025.',
    },
    kicker: {
      en: 'Federal by-election · Ontario · expected',
      fr: 'Partielle fédérale · Ontario · anticipée',
      es: 'Parcial federal · Ontario · prevista',
    },
    headline: {
      en: 'The safest Liberal vacancy yet.',
      fr: 'La vacance libérale la plus sûre jusqu’ici.',
      es: 'La vacante liberal más segura hasta ahora.',
    },
    dek: {
      en: 'Shaun Chen is leaving a riding where the Liberals cleared sixty per cent in 2025. The model finds no identifiable personal-vote premium to remove, so the coming by-election begins as a very safe Liberal hold.',
      fr: 'Shaun Chen laisse une circonscription où les libéraux ont dépassé 60 % en 2025. Le modèle ne trouve aucune prime personnelle identifiable à retirer : la future partielle commence donc comme une très solide défense libérale.',
      es: 'Shaun Chen deja una circunscripción donde los liberales superaron el 60 % en 2025. El modelo no detecta una prima personal identificable que retirar, por lo que la parcial empieza como una defensa liberal muy segura.',
    },
    why: {
      en: [
        'Shaun Chen announced he will resign from the House of Commons effective August 15, 2026, after representing the riding since 2015.',
        'He won 62.4% in 2025, 13.4 points above the Liberal Ontario-wide share.',
        'That margin cannot be cleanly identified as personal rather than structural, so the model applies no personal-vote subtraction.',
      ],
      fr: [
        'Shaun Chen a annoncé qu’il quittera la Chambre des communes le 15 août 2026, après avoir représenté la circonscription depuis 2015.',
        'Il a obtenu 62,4 % en 2025, soit 13,4 points de plus que la part libérale à l’échelle ontarienne.',
        'Cette marge ne peut pas être attribuée proprement à sa personne plutôt qu’à la structure du siège : le modèle ne retranche donc aucun vote personnel.',
      ],
      es: [
        'Shaun Chen anunció que dejará la Cámara de los Comunes el 15 de agosto de 2026, tras representar la circunscripción desde 2015.',
        'Obtuvo el 62,4 % en 2025, 13,4 puntos por encima del voto liberal en Ontario.',
        'Ese margen no puede identificarse limpiamente como personal y no estructural, por lo que el modelo no resta voto personal.',
      ],
    },
    modelNote: {
      en: 'No constituency poll exists. The engine starts from the riding’s current federal projection and applies the measured by-election turnout residual. Because there is no defensible pre-Chen comparison on the current boundaries, personal_vote_pct is intentionally left unapplied rather than guessed.',
      fr: 'Aucun sondage de circonscription n’existe. Le moteur part de la projection fédérale courante du siège et applique le résidu de participation mesuré pour les partielles. Faute de comparaison pré-Chen défendable dans les limites actuelles, personal_vote_pct reste volontairement non appliqué plutôt que deviné.',
      es: 'No existe encuesta de circunscripción. El motor parte de la proyección federal actual y aplica el residuo de participación medido para las parciales. Sin una comparación pre-Chen defendible en los límites actuales, personal_vote_pct se deja sin aplicar en vez de inventarlo.',
    },
    paths: {
      en: '/en/canada/byelections/scarborough-nord/',
      fr: '/fr/canada/byelections/scarborough-nord/',
      es: '/es/canada/byelections/scarborough-nord/',
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
