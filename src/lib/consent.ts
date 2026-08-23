/**
 * Consent arbitration between the two consent managers on the page.
 *
 * Vote-Scope ends up with two of them for a structural reason: Journey by
 * Mediavine ships its own IAB TCF CMP (CONSENTMANAGER, cmpId 31) that we do
 * not control, and Cloudflare Zaraz has one of its own from the days before
 * advertising, when it was the only thing we had.
 *
 * Measured on 2026-08-23 on production:
 *   - From Canada the Mediavine CMP stays silent: it reports `cmpGDPR: 0`,
 *     `cmpDisplayStatus: "hidden"` and never installs `__tcfapi` at all.
 *   - Inside the EEA and the UK it does display, and the Zaraz modal displays
 *     on top of it. That stack of two banners is the bug this module fixes.
 *
 * The rule is therefore: exactly one banner asks, and whichever one asked is
 * the one we believe. The Mediavine CMP wins wherever it speaks, because it
 * is the one that carries the TCF string the ad stack needs.
 *
 * Nothing here loads an analytics tool. It only resolves a decision and
 * publishes it on the dataLayer as `vs_consent`, where Google Tag Manager
 * turns it into a Consent Mode v2 signal. See
 * models/docs/analytics/MEASUREMENT_PLAN.md.
 */

type ConsentState = 'granted' | 'denied';

interface ZarazConsentApi {
  getAll?: () => Record<string, boolean>;
  setAll?: (value: boolean) => void;
  sendQueuedEvents?: () => void;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    /** Defined by the Consent Mode defaults script at the top of Base.astro. */
    gtag?: (...args: unknown[]) => void;
    zaraz?: {
      consent?: ZarazConsentApi;
      showConsentModal?: () => void;
    };
    __tcfapi?: (
      command: string,
      version: number,
      callback: (data: unknown, success: boolean) => void,
    ) => void;
  }
}

/** Zaraz purpose id for "Audience measurement" / "Mesure d'audience". */
const ZARAZ_PURPOSE = 'METw';

let published: ConsentState | undefined;
let decided = false;

function publish(state: ConsentState, source: string): void {
  // Republish only on an actual change: GTM applies every update it receives.
  if (state === published) return;
  published = state;
  if (source !== 'pending') decided = true;

  // The consent signal itself, in the shape Consent Mode expects. This goes
  // through the same gtag defined alongside the defaults in Base.astro, so GTM
  // reads it natively — no Custom HTML tag stands between the decision and the
  // container.
  window.gtag?.('consent', 'update', { analytics_storage: state });

  // A plain event as well, so the decision and its origin are visible in GTM
  // Preview and can be triggered on later without re-deriving any of this.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'vs_consent',
    vs_analytics_consent: state,
    vs_consent_source: source,
  });
}

/**
 * Read the most recent CONSENTMANAGER snapshot off the dataLayer. The CMP
 * pushes a flat object of `cmp*` keys on every state change rather than
 * exposing a stable global, so the newest push that carries `cmpGDPR` is the
 * current truth.
 */
function cmpSnapshot(): Record<string, unknown> | undefined {
  const layer = window.dataLayer;
  if (!Array.isArray(layer)) return undefined;
  for (let index = layer.length - 1; index >= 0; index -= 1) {
    const entry = layer[index];
    if (entry && typeof entry === 'object' && 'cmpGDPR' in (entry as object)) {
      return entry as Record<string, unknown>;
    }
  }
  return undefined;
}

/** True once the Mediavine CMP has taken responsibility for asking. */
function cmpGoverns(snapshot: Record<string, unknown> | undefined): boolean {
  if (typeof window.__tcfapi === 'function') return true;
  return !!snapshot && Number(snapshot.cmpGDPR) === 1;
}

/**
 * Google's own IAB vendor id is 755. Under TCF the CMP publishes the vendors
 * the reader accepted as a comma-delimited list, so membership of 755 is what
 * tells us Google Analytics may run.
 */
function cmpGrantsAnalytics(snapshot: Record<string, unknown>): boolean {
  const vendors = String(snapshot.cmpVendorsConsent ?? '');
  const purposes = String(snapshot.cmpPurposesConsent ?? '');
  const googleAccepted = vendors.split(',').includes('755');
  // TCF purpose 8 is "measure content performance"; purpose 1 is storage access.
  const measurementAccepted = purposes.split(',').includes('8')
    || purposes.split(',').includes('1');
  return googleAccepted && measurementAccepted;
}

function zarazGrantsAnalytics(): boolean | undefined {
  const all = window.zaraz?.consent?.getAll?.();
  if (!all || !(ZARAZ_PURPOSE in all)) return undefined;
  return all[ZARAZ_PURPOSE] === true;
}

/**
 * Decide, publish, and keep the Zaraz modal out of the way where the Mediavine
 * CMP is already asking. Safe to call more than once.
 */
export function initConsentArbitration(): void {
  if (typeof window === 'undefined') return;
  if (document.documentElement.dataset.consentReady === 'true') return;
  document.documentElement.dataset.consentReady = 'true';

  const settle = (): void => {
    const snapshot = cmpSnapshot();

    if (cmpGoverns(snapshot) && snapshot) {
      // Mediavine asks here. Never show a second banner on top of theirs.
      publish(cmpGrantsAnalytics(snapshot) ? 'granted' : 'denied', 'mediavine');
      return;
    }

    // Outside the EEA and the UK the Mediavine CMP stays hidden, so the Zaraz
    // modal is the only thing standing between us and unconsented measurement.
    const zarazChoice = zarazGrantsAnalytics();
    if (zarazChoice === undefined) {
      publish('denied', 'pending');
      window.zaraz?.showConsentModal?.();
      return;
    }
    publish(zarazChoice ? 'granted' : 'denied', 'zaraz');
  };

  settle();

  // The event is `zarazConsentChoicesUpdated`. `zarazConsentChoiceMade` sounds
  // right and does not exist — verified on production 2026-08-23 by wrapping
  // dispatchEvent and reading what Zaraz actually emits.
  for (const name of ['zarazConsentChoicesUpdated', 'zarazConsentModalClosed', 'zarazConsentAPIReady']) {
    document.addEventListener(name, settle);
  }
  window.addEventListener('cmpEvent', settle);

  // Both managers resolve asynchronously, and a reader can leave the banner
  // sitting there for minutes. So keep looking until somebody has actually
  // answered rather than for a fixed window: a poll that expires silently
  // discards every late acceptance, which is most of them.
  const timer = window.setInterval(() => {
    settle();
    if (decided) window.clearInterval(timer);
  }, 500);
}
