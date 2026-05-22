import type { LameDuckLocale, LameDuckMidterms } from '../data/lameDuck';

interface Props {
  midterms: LameDuckMidterms;
  locale: LameDuckLocale;
}

const copy = {
  en: {
    house: 'U.S. House',
    senate: 'U.S. Senate',
    demMajority: 'Dem majority',
    gopMajority: 'GOP majority',
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
    demMajority: 'Majorité démocrate',
    gopMajority: 'Majorité GOP',
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
    demMajority: 'Mayoría demócrata',
    gopMajority: 'Mayoría GOP',
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
  totalSeats: number,
  majority: number,
  t: typeof copy.en,
) {
  const seats = demSeats ?? 0;
  const gopSeats = totalSeats - seats;
  const demWidth = totalSeats > 0 ? Math.max(0, Math.min(100, (seats / totalSeats) * 100)) : 0;

  return (
    <article class="lame-duck-midterm-card">
      <header>
        <h3>{title}</h3>
        <span>{majority} {t.majority}</span>
      </header>
      <strong>{seats || '—'}</strong>
      <p>{t.seats}</p>
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
        {chamberCard(t.house, midterms.house_dem_prob, midterms.house_seats_dem, 435, midterms.house_majority ?? 218, t)}
        {chamberCard(t.senate, midterms.senate_dem_prob, midterms.senate_seats_dem, 100, midterms.senate_majority ?? 51, t)}
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
