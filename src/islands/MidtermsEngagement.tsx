import type { LameDuckLocale, LameDuckMidterms } from '../data/lameDuck';

interface Props {
  midterms: LameDuckMidterms;
  locale: LameDuckLocale;
}

const copy = {
  en: {
    house: 'U.S. House',
    senate: 'U.S. Senate',
    demMajority: 'Dem control',
    gopMajority: 'GOP control',
    median: 'Median of simulations',
    colon: ': ',
    note: 'The large figure counts the seats where Democrats are favoured, as on our House and Senate pages. The median of our simulations also counts their chances in seats they are not favoured to win; it is the figure most models show, including The Economist. When a wave is building, it runs higher.',
    senateTie: 'Senate: a 50-50 tie counts as Republican control, since Vice President Vance breaks ties.',
    seats: 'projected Democratic seats',
    majority: 'majority',
    rabbit: 'Keep digging',
    houseLink: 'Open House projection',
    senateLink: 'Open Senate projection',
    usDesk: 'Open U.S. desk',
    indexes: 'All Vote-Scope indexes',
  },
  fr: {
    house: 'Chambre',
    senate: 'Sénat',
    demMajority: 'Contrôle démocrate',
    gopMajority: 'Contrôle républicain',
    median: 'Médiane des simulations',
    colon: ' : ',
    note: 'Le grand chiffre compte les sièges où les démocrates sont favoris, comme sur nos pages Chambre et Sénat. La médiane de nos simulations tient aussi compte de leurs chances dans les sièges où ils ne le sont pas ; c\'est le chiffre qu\'affichent la plupart des modèles, dont The Economist. Quand une vague se forme, elle est plus haute.',
    senateTie: 'Sénat : une égalité 50-50 compte comme un contrôle républicain, puisque le vice-président Vance départage les votes.',
    seats: 'sièges démocrates projetés',
    majority: 'majorité',
    rabbit: 'Continuer à creuser',
    houseLink: 'Ouvrir la projection Chambre',
    senateLink: 'Ouvrir la projection Sénat',
    usDesk: 'Ouvrir le desk U.S.',
    indexes: 'Tous les indices Vote-Scope',
  },
  es: {
    house: 'Cámara',
    senate: 'Senado',
    demMajority: 'Control demócrata',
    gopMajority: 'Control republicano',
    median: 'Mediana de las simulaciones',
    colon: ': ',
    note: 'La cifra grande cuenta los escaños donde los demócratas son favoritos, como en nuestras páginas de la Cámara y el Senado. La mediana de nuestras simulaciones también tiene en cuenta sus posibilidades donde no lo son; es la cifra que muestran la mayoría de los modelos, como The Economist. Cuando se forma una ola, es más alta.',
    senateTie: 'Senado: un empate 50-50 cuenta como control republicano, ya que el vicepresidente Vance desempata.',
    seats: 'escaños demócratas proyectados',
    majority: 'mayoría',
    rabbit: 'Seguir explorando',
    houseLink: 'Abrir proyección Cámara',
    senateLink: 'Abrir proyección Senado',
    usDesk: 'Abrir desk U.S.',
    indexes: 'Todos los índices Vote-Scope',
  },
};

function pct(value?: number) {
  if (typeof value !== 'number') return '—';
  return `${Math.round(value * 100)}%`;
}

function chamberCard(
  title: string,
  demProbability: number | undefined,
  demSeats: number | undefined,
  repSeats: number | undefined,
  demMedian: number | undefined,
  totalSeats: number,
  majority: number,
  t: typeof copy.en,
) {
  const seats = demSeats ?? 0;
  const gopSeats = repSeats ?? totalSeats - seats;
  const showMedian = typeof demMedian === 'number' && Math.abs(demMedian - seats) >= 3;
  const demWidth = totalSeats > 0 ? Math.max(0, Math.min(100, (seats / totalSeats) * 100)) : 0;

  return (
    <article class="lame-duck-midterm-card">
      <header>
        <h3>{title}</h3>
        <span>{majority} {t.majority}</span>
      </header>
      <strong>{seats || '—'}</strong>
      <p>{t.seats}</p>
      {showMedian && <p class="lame-duck-midterm-median">{t.median}{t.colon}{demMedian}</p>}
      <div class="lame-duck-seatbar" aria-hidden="true">
        <span class="is-dem" style={{ width: `${demWidth}%` }} />
        <span class="is-gop" style={{ width: `${100 - demWidth}%` }} />
      </div>
      <dl>
        <div>
          <dt>{t.demMajority}</dt>
          <dd>{pct(demProbability)}</dd>
        </div>
        <div>
          <dt>{t.gopMajority}</dt>
          <dd>{pct(typeof demProbability === 'number' ? 1 - demProbability : undefined)}</dd>
        </div>
      </dl>
      <footer>D {seats || '—'} · R {seats ? gopSeats : '—'}</footer>
    </article>
  );
}

export default function MidtermsEngagement({ midterms, locale }: Props) {
  const t = copy[locale] ?? copy.en;
  const links = {
    en: {
      house: '/en/us/house/',
      senate: '/en/us/senate/',
      us: '/en/us/',
      indexes: '/en/indexes/',
    },
    fr: {
      house: '/fr/us/chambre/',
      senate: '/fr/us/senat/',
      us: '/fr/us/',
      indexes: '/fr/indexes/',
    },
    es: {
      house: '/es/us/house/',
      senate: '/es/us/senate/',
      us: '/es/us/',
      indexes: '/es/indexes/',
    },
  }[locale] ?? {
    house: '/en/us/house/',
    senate: '/en/us/senate/',
    us: '/en/us/',
    indexes: '/en/indexes/',
  };

  return (
    <div class="lame-duck-midterms">
      <div class="lame-duck-midterm-grid">
        {chamberCard(t.house, midterms.house_dem_prob, midterms.house_seats_dem, midterms.house_seats_rep, midterms.house_seats_dem_median, 435, midterms.house_majority ?? 218, t)}
        {chamberCard(t.senate, midterms.senate_dem_prob, midterms.senate_seats_dem, midterms.senate_seats_rep, midterms.senate_seats_dem_median, 100, midterms.senate_majority ?? 51, t)}
        <div class="lame-duck-midterm-note">
          {[['house', midterms.house_seats_dem, midterms.house_seats_dem_median], ['senate', midterms.senate_seats_dem, midterms.senate_seats_dem_median]]
            .some(([, a, b]) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) >= 3) && <p>{t.note}</p>}
          <p>{t.senateTie}</p>
        </div>
      </div>
      <aside class="lame-duck-rabbit">
        <p class="eyebrow">{t.rabbit}</p>
        <a href={links.house}>{t.houseLink}</a>
        <a href={links.senate}>{t.senateLink}</a>
        <a href={links.us}>{t.usDesk}</a>
        <a href={links.indexes}>{t.indexes}</a>
      </aside>
    </div>
  );
}
