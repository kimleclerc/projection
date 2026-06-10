/**
 * Curated Amazon picks for the Library page.
 *
 * Three link kinds, in priority order:
 * - `url`: full-length SiteStripe link (amazon.com + tag + linkId). MUST be
 *   long-form, never amzn.to: the OneLink script only localizes amazon.com
 *   links, so short links would not credit CA/FR/UK/IT purchases.
 * - `asin`: direct product link built with the tag.
 * - `search`: an Amazon search query (safe fallback for seasonal items like
 *   jerseys where editions change every cycle).
 *
 * Every page that renders these MUST also render the mandatory
 * `amazonDisclosure` statement from affiliates.ts.
 */

export interface AmazonPick {
  id: string;
  kind: 'book' | 'wc';
  /** Official SiteStripe short link (amzn.to) — takes priority over asin/search. */
  url?: string;
  asin?: string;
  /** Localized search queries — used when no asin. */
  search?: { en: string; fr: string; es: string };
  title: { en: string; fr: string; es: string };
  author?: string;
  blurb: { en: string; fr: string; es: string };
}

export const amazonPicks: AmazonPick[] = [
  // ——— The desk's bookshelf ———
  {
    id: 'signal-noise',
    kind: 'book',
    url: 'https://www.amazon.com/dp/0143125087?linkCode=sl2&tag=votescope05-20&linkId=6145ec2d186938f6509a70a38e23c0de&language=en_US&ref_=as_li_ss_tl',
    asin: '0143125087',
    title: { en: 'The Signal and the Noise', fr: 'The Signal and the Noise', es: 'La señal y el ruido' },
    author: 'Nate Silver',
    blurb: {
      en: 'The book that made election forecasting mainstream. Why most predictions fail — and what separates signal from noise.',
      fr: 'Le livre qui a rendu la projection électorale grand public. Pourquoi la plupart des prédictions échouent — et ce qui sépare le signal du bruit.',
      es: 'El libro que popularizó la proyección electoral. Por qué fallan la mayoría de las predicciones — y qué separa la señal del ruido.',
    },
  },
  {
    id: 'superforecasting',
    kind: 'book',
    url: 'https://www.amazon.com/dp/0804136718?linkCode=sl2&tag=votescope05-20&linkId=057fdabef920de164d6ce5d891d95ccc&language=en_US&ref_=as_li_ss_tl',
    asin: '0804136718',
    title: { en: 'Superforecasting', fr: 'Superforecasting', es: 'Superpronosticadores' },
    author: 'Philip E. Tetlock & Dan Gardner',
    blurb: {
      en: 'What 20 years of forecasting tournaments teach about who actually predicts well, and how. The intellectual backbone of our Track Record page.',
      fr: 'Ce que 20 ans de tournois de prévision enseignent sur qui prédit réellement bien, et comment. La colonne vertébrale intellectuelle de notre page Track Record.',
      es: 'Lo que 20 años de torneos de pronóstico enseñan sobre quién predice realmente bien, y cómo. La columna vertebral intelectual de nuestra página Track Record.',
    },
  },
  {
    id: 'thinking-fast-slow',
    kind: 'book',
    asin: '0374533555',
    title: { en: 'Thinking, Fast and Slow', fr: 'Système 1 / Système 2', es: 'Pensar rápido, pensar despacio' },
    author: 'Daniel Kahneman',
    blurb: {
      en: 'Why your gut reads polls wrong. Every bias our model corrects for, Kahneman documented first.',
      fr: 'Pourquoi votre instinct lit mal les sondages. Chaque biais que notre modèle corrige, Kahneman l\'a documenté en premier.',
      es: 'Por qué tu instinto lee mal las encuestas. Cada sesgo que nuestro modelo corrige, Kahneman lo documentó primero.',
    },
  },
  {
    id: 'art-of-statistics',
    kind: 'book',
    url: 'https://www.amazon.com/dp/1541675703?linkCode=sl2&tag=votescope05-20&linkId=ae97101e34941f959a46c4a380d6776e&language=en_US&ref_=as_li_ss_tl',
    asin: '1541675703',
    title: { en: 'The Art of Statistics', fr: 'The Art of Statistics', es: 'El arte de la estadística' },
    author: 'David Spiegelhalter',
    blurb: {
      en: 'The most readable introduction to how statistics actually work — confidence intervals included. If you read one book to understand this site, read this one.',
      fr: 'L\'introduction la plus lisible au fonctionnement réel des statistiques — intervalles de confiance inclus. Si vous lisez un seul livre pour comprendre ce site, c\'est celui-là.',
      es: 'La introducción más legible a cómo funcionan realmente las estadísticas — intervalos de confianza incluidos. Si lees un solo libro para entender este sitio, que sea este.',
    },
  },
  {
    id: 'soccermatics',
    kind: 'book',
    url: 'https://www.amazon.com/dp/1472924142?linkCode=sl2&tag=votescope05-20&linkId=f7a9af8ac2caab3af8ff0d1f4f9b03ad&language=en_US&ref_=as_li_ss_tl',
    asin: '1472924142',
    title: { en: 'Soccermatics', fr: 'Soccermatics', es: 'Soccermatics' },
    author: 'David Sumpter',
    blurb: {
      en: 'Football through the eyes of a mathematician — the same toolkit behind our WC2026 simulations, explained with actual matches.',
      fr: 'Le football vu par un mathématicien — la même boîte à outils que nos simulations WC2026, expliquée avec de vrais matchs.',
      es: 'El fútbol visto por un matemático — la misma caja de herramientas de nuestras simulaciones WC2026, explicada con partidos reales.',
    },
  },
  {
    id: 'storytelling-data',
    kind: 'book',
    url: 'https://www.amazon.com/dp/1119002257?linkCode=ll2&tag=votescope05-20&linkId=e78b19e8033f5b48065cfd46eaa6ca4d&language=en_US&ref_=as_li_ss_tl',
    asin: '1119002257',
    title: { en: 'Storytelling with Data', fr: 'Storytelling with Data', es: 'Storytelling con datos' },
    author: 'Cole Nussbaumer Knaflic',
    blurb: {
      en: 'How we think about every chart on this site: strip the noise, keep the story.',
      fr: 'Comment nous pensons chaque graphique de ce site : enlever le bruit, garder l\'histoire.',
      es: 'Cómo pensamos cada gráfico de este sitio: quitar el ruido, conservar la historia.',
    },
  },
  // ——— World Cup locker room ———
  {
    id: 'wc-ball',
    kind: 'wc',
    url: 'https://www.amazon.com/s?k=soccer+ball+fifa+2026&linkCode=sl2&tag=votescope05-20&linkId=ff7c168edf7738991e744ce7c5b40f5a&language=en_US&ref_=as_li_ss_tl',
    search: {
      en: 'adidas world cup 2026 official match ball',
      fr: 'ballon officiel coupe du monde 2026 adidas',
      es: 'balón oficial mundial 2026 adidas',
    },
    title: { en: 'The official 2026 match ball', fr: 'Le ballon officiel 2026', es: 'El balón oficial 2026' },
    blurb: {
      en: 'The ball every probability on this page gets kicked with.',
      fr: 'Le ballon avec lequel chaque probabilité de cette page se joue.',
      es: 'El balón con el que se juega cada probabilidad de esta página.',
    },
  },
  {
    id: 'wc-panini',
    kind: 'wc',
    search: {
      en: 'panini world cup 2026 sticker album',
      fr: 'album panini coupe du monde 2026',
      es: 'álbum panini mundial 2026',
    },
    title: { en: 'Panini 2026 sticker album', fr: 'Album Panini 2026', es: 'Álbum Panini 2026' },
    blurb: {
      en: 'The analog forecasting experience: 48 teams, zero confidence intervals, pure hope.',
      fr: 'L\'expérience de projection analogique : 48 équipes, zéro intervalle de confiance, espoir pur.',
      es: 'La experiencia de pronóstico analógica: 48 equipos, cero intervalos de confianza, esperanza pura.',
    },
  },
  {
    id: 'wc-jersey',
    kind: 'wc',
    search: {
      en: 'national team soccer jersey 2026',
      fr: 'maillot équipe nationale soccer 2026',
      es: 'camiseta selección nacional fútbol 2026',
    },
    title: { en: 'Your team\'s 2026 jersey', fr: 'Le maillot 2026 de votre équipe', es: 'La camiseta 2026 de tu selección' },
    blurb: {
      en: 'Wear your bracket. Whatever the model says about your team, the jersey doesn\'t care.',
      fr: 'Portez votre tableau. Peu importe ce que le modèle dit de votre équipe, le maillot s\'en fiche.',
      es: 'Viste tu cuadro. Diga lo que diga el modelo de tu selección, a la camiseta no le importa.',
    },
  },
];
