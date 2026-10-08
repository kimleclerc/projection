/**
 * Titres FR/ES des jeux de données de l'API (le manifeste public n'a que l'anglais).
 * Un jeu de données absent d'ici garde son titre anglais : l'ajouter quand on en publie un.
 */
type T = { fr: string; es: string };

export const API_TITLES: Record<string, T> = {
  'ca-federal-next': { fr: 'Projection de la prochaine élection fédérale canadienne', es: 'Pronóstico de las próximas elecciones federales de Canadá' },
  'qc-2026': { fr: 'Projection de l’élection générale québécoise de 2026', es: 'Pronóstico de las elecciones generales de Quebec 2026' },
  'on-next': { fr: 'Projection de la prochaine élection ontarienne', es: 'Pronóstico de las próximas elecciones de Ontario' },
  'bc-next': { fr: 'Projection de l’élection en Colombie-Britannique', es: 'Pronóstico de las elecciones de Columbia Británica' },
  'uk-next': { fr: 'Projection de la prochaine élection générale britannique', es: 'Pronóstico de las próximas elecciones generales del Reino Unido' },
  'us-house-2026': { fr: 'Projection de la Chambre des représentants 2026', es: 'Pronóstico de la Cámara de Representantes 2026' },
  'us-senate-2026': { fr: 'Projection du Sénat américain 2026', es: 'Pronóstico del Senado de EE. UU. 2026' },
  'us-governor-2026': { fr: 'Projection des élections de gouverneurs 2026', es: 'Pronóstico de las elecciones a gobernador 2026' },
  'us-president-2028': { fr: 'Primaires présidentielles américaines 2028', es: 'Primarias presidenciales de EE. UU. 2028' },
  'fr-president-2027': { fr: 'Projection de la présidentielle française 2027', es: 'Pronóstico de la elección presidencial francesa 2027' },
  'nhl-2026': { fr: 'Projections LNH', es: 'Pronósticos de la NHL' },
  'mlb-2026': { fr: 'Projections MLB', es: 'Pronósticos de la MLB' },
  'ca-federal-polls': { fr: 'Archive des sondages fédéraux canadiens', es: 'Archivo de encuestas federales de Canadá' },
  'qc-2026-polls': { fr: 'Archive des sondages québécois 2026', es: 'Archivo de encuestas de Quebec 2026' },
  'on-next-polls': { fr: 'Archive des sondages ontariens', es: 'Archivo de encuestas de Ontario' },
  'bc-next-polls': { fr: 'Archive des sondages de la Colombie-Britannique', es: 'Archivo de encuestas de Columbia Británica' },
  'uk-next-polls': { fr: 'Archive des sondages britanniques', es: 'Archivo de encuestas del Reino Unido' },
  'us-house-2026-polls': { fr: 'Archive des sondages de la Chambre 2026', es: 'Archivo de encuestas de la Cámara 2026' },
  'qc-2026-candidates': { fr: 'Registre officiel des candidatures, Québec 2026', es: 'Registro oficial de candidaturas, Quebec 2026' },
  'qc-2026-advance-vote': { fr: 'Participation au vote par anticipation par circonscription, Québec 2026 (préliminaire)', es: 'Participación en el voto anticipado por circunscripción, Quebec 2026 (preliminar)' },
  'us-house-2026-candidates': { fr: 'Registre des candidatures à la Chambre 2026', es: 'Registro de candidaturas a la Cámara 2026' },
  'us-senate-2026-candidates': { fr: 'Registre des candidatures au Sénat 2026', es: 'Registro de candidaturas al Senado 2026' },
  'us-primaries-2026': { fr: 'Primaires du Congrès 2026', es: 'Primarias del Congreso 2026' },
  'us-lame-duck-index': { fr: 'Indice Lame-Duck de Vote-Scope', es: 'Lame-Duck Index de Vote-Scope' },
  'ca-canada-goose-index': { fr: 'Indice Bernache de Vote-Scope', es: 'Canada Goose Index de Vote-Scope' },
  'ca-cusma-showdown-index': { fr: 'Duel ACEUM de Vote-Scope', es: 'Duelo T-MEC de Vote-Scope' },
  'fr-barrage-index': { fr: 'Indice Barrage de Vote-Scope', es: 'Índice Barrage de Vote-Scope' },
  'on-fraser-interim-index': { fr: 'Indice Fraser intérimaire de Vote-Scope', es: 'Índice Fraser interino de Vote-Scope' },
  'us-latino-radar': { fr: 'Radar électoral latino de Vote-Scope', es: 'Radar electoral latino de Vote-Scope' },
  'qc-2026-candidate-equity': { fr: 'Baromètre des candidatures, Québec 2026', es: 'Barómetro de candidaturas, Quebec 2026' },
  'ca-federal-byelections': { fr: 'Partielles fédérales canadiennes à venir', es: 'Elecciones parciales federales pendientes en Canadá' },
  'on-byelections': { fr: 'Partielles ontariennes à venir', es: 'Elecciones parciales pendientes en Ontario' },
  'us-ga13-special-2026': { fr: 'Partielle du 13ᵉ district de Géorgie', es: 'Elección especial del distrito 13 de Georgia' },
  'us-fl20-special-2026': { fr: 'Partielle à venir dans le 20ᵉ district de Floride', es: 'Elección especial pendiente en el distrito 20 de Florida' },
  'us-tx23-special-2026': { fr: 'Partielle à venir dans le 23ᵉ district du Texas', es: 'Elección especial pendiente en el distrito 23 de Texas' },
  'uk-clacton-recall-watch-2026': { fr: 'Clacton : risque d’une deuxième partielle et 24 scénarios de course', es: 'Clacton: probabilidad de una segunda elección parcial y 24 escenarios' },
  'uk-holborn-st-pancras-2026': { fr: 'Projection de la partielle de Holborn and St Pancras 2026', es: 'Pronóstico de la elección parcial de Holborn and St Pancras 2026' },
  'uk-clacton-2026': { fr: 'Projection de la partielle de Clacton 2026', es: 'Pronóstico de la elección parcial de Clacton 2026' },
  'votescope-track-record': { fr: 'Bilan des prédictions tranchées de Vote-Scope', es: 'Historial de predicciones resueltas de Vote-Scope' },
  'us-ga14-runoff-2026': { fr: 'Second tour de la partielle du 14ᵉ district de Géorgie, tranché le 7 avril 2026', es: 'Segunda vuelta especial del distrito 14 de Georgia, resuelta el 7 de abril de 2026' },
  'us-nj11-special-2026': { fr: 'Partielle du 11ᵉ district du New Jersey, tranchée le 16 avril 2026', es: 'Elección especial del distrito 11 de Nueva Jersey, resuelta el 16 de abril de 2026' },
  'us-ca1-special-2026': { fr: 'Partielle du 1er district de Californie, tranchée le 2 juin 2026', es: 'Elección especial del distrito 1 de California, resuelta el 2 de junio de 2026' },
  'us-ca14-special-2026': { fr: 'Partielle du 14ᵉ district de Californie : générale du 18 août, certification attendue le 25 septembre', es: 'Elección especial del distrito 14 de California: general del 18 de agosto, certificación prevista el 25 de septiembre' },
};

export const API_KINDS: Record<string, { en: string; fr: string; es: string }> = {
  election_forecast: { en: 'Election forecast', fr: 'Projection électorale', es: 'Pronóstico electoral' },
  polling_index: { en: 'Polling archive', fr: 'Archive de sondages', es: 'Archivo de encuestas' },
  candidate_registry: { en: 'Candidate registry', fr: 'Registre des candidatures', es: 'Registro de candidaturas' },
  original_index: { en: 'Vote-Scope index', fr: 'Indice Vote-Scope', es: 'Índice Vote-Scope' },
  primary_calendar: { en: 'Primary calendar', fr: 'Calendrier des primaires', es: 'Calendario de primarias' },
  special_election: { en: 'Special election', fr: 'Élection partielle', es: 'Elección especial' },
  sports_forecast: { en: 'Sports forecast', fr: 'Projection sportive', es: 'Pronóstico deportivo' },
  track_record: { en: 'Track record', fr: 'Bilan des prédictions', es: 'Historial de predicciones' },
  turnout: { en: 'Turnout', fr: 'Participation', es: 'Participación' },
};

export function apiTitle(id: string, en: string, locale: 'en' | 'fr' | 'es'): string {
  return locale === 'en' ? en : API_TITLES[id]?.[locale] ?? en;
}
export function apiKind(kind: string, locale: 'en' | 'fr' | 'es'): string {
  return API_KINDS[kind]?.[locale] ?? kind.replaceAll('_', ' ');
}
