/**
 * Affiliate partner config.
 *
 * IMPORTANT: leave `url` empty until the real tracking link from the partner
 * program is pasted in — components render nothing when `url` is ''.
 * All affiliate links MUST go out with rel="sponsored noopener" (Google
 * requirement + program ToS). Every placement must sit near a disclosure
 * notice linking to the /disclosure page.
 *
 * Proton: tracking link from the Proton Partners dashboard.
 * NordVPN: tracking link from the Nord Security affiliate dashboard.
 */

export interface AffiliatePartner {
  id: string;
  name: string;
  /** Tracking URL from the partner dashboard. Empty string = placement hidden. */
  url: string;
  /** Localized pitch used by AffiliateCard. */
  copy: {
    en: { kicker: string; title: string; body: string; cta: string };
    fr: { kicker: string; title: string; body: string; cta: string };
    es: { kicker: string; title: string; body: string; cta: string };
  };
}

export const affiliates: Record<string, AffiliatePartner> = {
  nordvpn: {
    id: 'nordvpn',
    name: 'NordVPN',
    url: 'https://go.nordvpn.net/aff_c?offer_id=612&aff_id=149100',
    copy: {
      en: {
        kicker: 'Partner · World Cup',
        title: 'Watching from abroad this summer?',
        body: 'A VPN keeps your connection private on hotel and stadium Wi-Fi while you travel for the tournament. NordVPN is the service we use for speed.',
        cta: 'Get NordVPN',
      },
      fr: {
        kicker: 'Partenaire · Coupe du monde',
        title: 'Vous suivez les matchs en voyage cet été?',
        body: 'Un VPN garde votre connexion privée sur les Wi-Fi d\'hôtel et de stade pendant vos déplacements pour le tournoi. NordVPN est le service que nous utilisons pour la vitesse.',
        cta: 'Obtenir NordVPN',
      },
      es: {
        kicker: 'Socio · Copa del Mundo',
        title: '¿Siguiendo los partidos desde el extranjero este verano?',
        body: 'Una VPN mantiene tu conexión privada en el Wi-Fi de hoteles y estadios mientras viajas por el torneo. NordVPN es el servicio que usamos por su velocidad.',
        cta: 'Obtener NordVPN',
      },
    },
  },
  proton: {
    id: 'proton',
    name: 'Proton',
    url: 'https://go.getproton.me/aff_c?offer_id=26&aff_id=18125',
    copy: {
      en: {
        kicker: 'Partner · Privacy',
        title: 'Independent media runs on private infrastructure.',
        body: 'Vote-Scope values data independence. Proton offers encrypted email, VPN and storage from Switzerland — the privacy-first suite we recommend.',
        cta: 'Try Proton',
      },
      fr: {
        kicker: 'Partenaire · Vie privée',
        title: 'Un média indépendant roule sur une infrastructure privée.',
        body: 'Vote-Scope tient à l\'indépendance des données. Proton offre courriel chiffré, VPN et stockage depuis la Suisse — la suite axée vie privée que nous recommandons.',
        cta: 'Essayer Proton',
      },
      es: {
        kicker: 'Socio · Privacidad',
        title: 'Los medios independientes funcionan con infraestructura privada.',
        body: 'Vote-Scope valora la independencia de los datos. Proton ofrece correo cifrado, VPN y almacenamiento desde Suiza — la suite centrada en la privacidad que recomendamos.',
        cta: 'Probar Proton',
      },
    },
  },
};

/**
 * Amazon Associates (OneLink).
 *
 * Kim's CA/US/FR/UK/IT accounts are linked through OneLink: links point at
 * amazon.com with the US tag, and Amazon reroutes international visitors to
 * their local marketplace while keeping attribution.
 *
 * - `tag`: the US Associates tracking ID (looks like `something-20`), from
 *   the Associates Central dashboard. Empty = every Amazon placement hidden.
 * - `oneLinkScriptSrc`: the OneLink script URL from Associates Central →
 *   Tools → OneLink (looks like `//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=...`).
 *   Optional but needed for the CA/FR/UK/IT rerouting to actually happen.
 *
 * Amazon program rules already handled by the components: the mandatory
 * earnings statement is rendered on every page with Amazon links and on the
 * disclosure pages; links are direct (no shorteners/cloaking); no prices are
 * ever hardcoded.
 */
export const amazon = {
  tag: 'votescope05-20',
  oneLinkScriptSrc: '',
};

export const amazonDp = (asin: string): string =>
  `https://www.amazon.com/dp/${asin}?tag=${amazon.tag}`;

export const amazonSearch = (q: string): string =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${amazon.tag}`;

/** Mandatory Amazon Associates earnings statement — exact program wording per locale. */
export const amazonDisclosure: Record<'en' | 'fr' | 'es', string> = {
  en: 'As an Amazon Associate, Vote-Scope earns from qualifying purchases.',
  fr: 'En tant que Partenaire Amazon, Vote-Scope réalise un bénéfice sur les achats remplissant les conditions requises.',
  es: 'En calidad de Afiliado de Amazon, Vote-Scope obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables.',
};

export const disclosurePath: Record<'en' | 'fr' | 'es', string> = {
  en: '/en/disclosure/',
  fr: '/fr/divulgation/',
  es: '/es/divulgacion/',
};

export const disclosureMicrocopy: Record<'en' | 'fr' | 'es', { notice: string; link: string }> = {
  en: { notice: 'Affiliate link — we may earn a commission, at no extra cost to you.', link: 'How we disclose' },
  fr: { notice: 'Lien affilié — nous pouvons toucher une commission, sans coût supplémentaire pour vous.', link: 'Notre politique de divulgation' },
  es: { notice: 'Enlace de afiliado — podemos ganar una comisión, sin costo adicional para ti.', link: 'Cómo lo divulgamos' },
};

/** True when at least one partner has a live tracking URL. */
export const hasLiveAffiliates = (): boolean =>
  Object.values(affiliates).some((p) => p.url.trim() !== '');
