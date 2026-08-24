/**
 * Small, editorially curated shelves for race and candidate pages.
 *
 * Keep this list deliberately narrow: inclusion means “written by a person
 * tracked on this page”, never endorsement. Search links are preferred when
 * editions vary by country; Amazon OneLink handles storefront localization.
 */

export type BookContext = 'clacton' | 'us-president' | 'france-president' | 'ga13' | 'fl20' | 'tx23' | 'cusma';
export type BookLocale = 'en' | 'fr' | 'es';

export interface ContextualBook {
  id: string;
  contexts: BookContext[];
  candidateIds?: string[];
  asin?: string;
  search?: string;
  title: string;
  author: string;
  note: Record<BookLocale, string>;
  accent: string;
}

export const contextualBooks: ContextualBook[] = [
  {
    id: 'carney-values',
    contexts: ['cusma'],
    search: 'Value(s) Building a Better World for All Mark Carney',
    title: 'Value(s)',
    author: 'Mark Carney',
    note: {
      en: 'The Prime Minister’s own argument about what markets price and what they refuse to — written years before he had to defend it at a negotiating table.',
      fr: 'L’argumentaire du premier ministre sur ce que les marchés cotent et ce qu’ils refusent de coter — écrit des années avant qu’il ait à le défendre à une table de négociation.',
      es: 'El argumento del primer ministro sobre lo que los mercados cotizan y lo que se niegan a cotizar — escrito años antes de tener que defenderlo en una mesa de negociación.',
    },
    accent: '#1f4e79',
  },
  {
    id: 'peddling-protectionism',
    contexts: ['cusma'],
    search: 'Peddling Protectionism Smoot-Hawley and the Great Depression Douglas Irwin',
    title: 'Peddling Protectionism',
    author: 'Douglas A. Irwin',
    note: {
      en: 'The standard history of the 1930 Smoot-Hawley Act — the statute Washington reached back for to sign the Section 338 proclamations.',
      fr: 'L’histoire de référence de la loi Smoot-Hawley de 1930 — le texte que Washington est allé rechercher pour signer les proclamations de l’article 338.',
      es: 'La historia de referencia de la ley Smoot-Hawley de 1930 — la norma que Washington rescató para firmar las proclamaciones de la Sección 338.',
    },
    accent: '#7a3b2e',
  },
  {
    id: 'trade-wars-class-wars',
    contexts: ['cusma'],
    search: 'Trade Wars Are Class Wars Matthew Klein Michael Pettis',
    title: 'Trade Wars Are Class Wars',
    author: 'Matthew C. Klein & Michael Pettis',
    note: {
      en: 'The case that trade conflicts are domestic distribution fights in a foreign-policy costume. Useful for reading a tariff that 59% of Americans oppose.',
      fr: 'La thèse selon laquelle les conflits commerciaux sont des batailles de répartition intérieure déguisées en politique étrangère. Utile pour lire un tarif auquel 59 % des Américains s’opposent.',
      es: 'La tesis de que los conflictos comerciales son peleas internas de distribución disfrazadas de política exterior. Útil para leer un arancel al que se opone el 59 % de los estadounidenses.',
    },
    accent: '#3f5f4a',
  },
  {
    id: 'bad-samaritans',
    contexts: ['cusma'],
    search: 'Bad Samaritans The Myth of Free Trade Ha-Joon Chang',
    title: 'Bad Samaritans',
    author: 'Ha-Joon Chang',
    note: {
      en: 'The argument that rich countries do not trade by the rules they used to get rich. Read it against either side of this table.',
      fr: 'L’argument voulant que les pays riches ne commercent pas selon les règles qui les ont enrichis. À lire contre l’un ou l’autre côté de cette table.',
      es: 'El argumento de que los países ricos no comercian con las reglas que los enriquecieron. Léase contra cualquiera de los dos lados de esta mesa.',
    },
    accent: '#5a4a7a',
  },
  {
    id: 'politics-in-georgia',
    contexts: ['ga13'],
    search: 'Politics in Georgia Charles S Bullock Ronald Keith Gaddie',
    title: 'Politics in Georgia',
    author: 'Charles S. Bullock III & Ronald Keith Gaddie',
    note: {
      en: 'A state-level guide to the institutions, electoral coalitions and political change behind the GA‑13 runoff.',
      fr: 'Un guide des institutions, coalitions électorales et transformations politiques qui forment le contexte de GA‑13.',
      es: 'Una guía de las instituciones, coaliciones electorales y cambios políticos que forman el contexto de GA‑13.',
    },
    accent: '#6b2f21',
  },
  {
    id: 'the-swamp',
    contexts: ['fl20'],
    asin: '0743251075',
    title: 'The Swamp',
    author: 'Michael Grunwald',
    note: {
      en: 'The political and environmental history of the Everglades — essential context for a South Florida seat shaped by water, development and federal policy.',
      fr: 'L’histoire politique et environnementale des Everglades — un contexte essentiel pour un siège du sud de la Floride façonné par l’eau et l’action fédérale.',
      es: 'La historia política y ambiental de los Everglades, contexto esencial para un distrito del sur de Florida marcado por el agua y la política federal.',
    },
    accent: '#3f6b57',
  },
  {
    id: 'line-becomes-river',
    contexts: ['tx23'],
    asin: '0735217734',
    title: 'The Line Becomes a River',
    author: 'Francisco Cantú',
    note: {
      en: 'A former Border Patrol agent’s account of the U.S.–Mexico borderlands, a defining geography and policy issue across TX‑23.',
      fr: 'Le récit d’un ancien agent de la Border Patrol sur la frontière américano-mexicaine, géographie et enjeu central de TX‑23.',
      es: 'El relato de un exagente de la Patrulla Fronteriza sobre la frontera entre Estados Unidos y México, geografía central de TX‑23.',
    },
    accent: '#b56b32',
  },
  {
    id: 'purple-revolution',
    contexts: ['clacton'],
    candidateIds: ['farage'],
    search: 'The Purple Revolution Nigel Farage',
    title: 'The Purple Revolution',
    author: 'Nigel Farage',
    note: {
      en: 'Farage’s account of UKIP’s rise and the political movement behind his candidacy.',
      fr: 'Le récit de Farage sur la montée de l’UKIP et le mouvement politique derrière sa candidature.',
      es: 'El relato de Farage sobre el ascenso de UKIP y el movimiento político detrás de su candidatura.',
    },
    accent: '#12b6cf',
  },
  {
    id: 'what-on-earth',
    contexts: ['clacton'],
    candidateIds: ['binface'],
    asin: '1529431441',
    title: 'What On Earth?',
    author: 'Count Binface',
    note: {
      en: 'The candidate’s own alien guide to fixing Britain — and the planet.',
      fr: 'Le propre guide extraterrestre du candidat pour réparer le Royaume-Uni — et la planète.',
      es: 'La guía extraterrestre del candidato para arreglar el Reino Unido — y el planeta.',
    },
    accent: '#252525',
  },
  {
    id: 'hillbilly-elegy',
    contexts: ['us-president'],
    asin: '0062300547',
    title: 'Hillbilly Elegy',
    author: 'J. D. Vance',
    note: {
      en: 'Vance’s memoir and the clearest starting point for understanding his political identity.',
      fr: 'Les mémoires de Vance, point de départ incontournable pour comprendre son identité politique.',
      es: 'Las memorias de Vance, punto de partida para entender su identidad política.',
    },
    accent: '#a82d2d',
  },
  {
    id: 'truths-we-hold',
    contexts: ['us-president'],
    asin: '0525560718',
    title: 'The Truths We Hold',
    author: 'Kamala Harris',
    note: {
      en: 'Harris’s campaign-era memoir on her life, public service and governing priorities.',
      fr: 'Les mémoires politiques de Harris sur sa vie, le service public et ses priorités.',
      es: 'Las memorias políticas de Harris sobre su vida, el servicio público y sus prioridades.',
    },
    accent: '#2e6ea6',
  },
  {
    id: 'citizenville',
    contexts: ['us-president'],
    search: 'Citizenville Gavin Newsom',
    title: 'Citizenville',
    author: 'Gavin Newsom',
    note: {
      en: 'Newsom’s argument for using digital tools to rebuild participation in government.',
      fr: 'La proposition de Newsom pour utiliser le numérique afin de renouveler la participation publique.',
      es: 'La propuesta de Newsom para usar herramientas digitales y renovar la participación pública.',
    },
    accent: '#b98923',
  },
  {
    id: 'nous-avons-encore-envie',
    contexts: ['france-president'],
    candidateIds: ['left_glucksmann'],
    search: 'Nous avons encore envie Raphaël Glucksmann',
    title: 'Nous avons encore envie',
    author: 'Raphaël Glucksmann',
    note: {
      en: 'Glucksmann’s 2026 case for a democratic, European and patriotic political renewal.',
      fr: 'Le plaidoyer 2026 de Glucksmann pour un sursaut démocratique, européen et patriotique.',
      es: 'El alegato de Glucksmann de 2026 por una renovación democrática, europea y patriótica.',
    },
    accent: '#b0202a',
  },
  {
    id: 'prix-de-nos-mensonges',
    contexts: ['france-president'],
    candidateIds: ['centre_philippe'],
    search: 'Le prix de nos mensonges Edouard Philippe',
    title: 'Le prix de nos mensonges',
    author: 'Édouard Philippe',
    note: {
      en: 'Philippe’s short 2025 argument for political candour and policy realism.',
      fr: 'Le court plaidoyer de Philippe pour la lucidité politique et le réalisme de l’action publique.',
      es: 'El breve alegato de Philippe por la franqueza política y el realismo público.',
    },
    accent: '#b7860f',
  },
  {
    id: 'faites-mieux',
    contexts: ['france-president'],
    candidateIds: ['left_melenchon'],
    search: 'Faites mieux Jean-Luc Mélenchon',
    title: 'Faites mieux !',
    author: 'Jean-Luc Mélenchon',
    note: {
      en: 'Mélenchon’s latest synthesis of his “citizens’ revolution” programme.',
      fr: 'La synthèse la plus récente du programme de « révolution citoyenne » de Mélenchon.',
      es: 'La síntesis más reciente del programa de «revolución ciudadana» de Mélenchon.',
    },
    accent: '#c1272d',
  },
  {
    id: 'pour-que-vive-la-france',
    contexts: ['france-president'],
    candidateIds: ['rn_le_pen'],
    asin: '2733911821',
    title: 'Pour que vive la France',
    author: 'Marine Le Pen',
    note: {
      en: 'Le Pen’s book-length statement of her political worldview.',
      fr: 'L’exposé en format livre de la vision politique de Marine Le Pen.',
      es: 'La exposición en formato libro de la visión política de Marine Le Pen.',
    },
    accent: '#2b4f8c',
  },
];
