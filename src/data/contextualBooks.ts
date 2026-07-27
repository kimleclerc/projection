/**
 * Small, editorially curated shelves for race and candidate pages.
 *
 * Keep this list deliberately narrow: inclusion means “written by a person
 * tracked on this page”, never endorsement. Search links are preferred when
 * editions vary by country; Amazon OneLink handles storefront localization.
 */

export type BookContext = 'clacton' | 'us-president' | 'france-president';
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
