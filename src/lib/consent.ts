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

/** How long we let the Mediavine CMP announce itself before concluding it will not. */
const CMP_GRACE_MS = 2500;

let published: ConsentState | undefined;

function publish(state: ConsentState, source: string): void {
  // Republish only on an actual change: GTM applies every update it receives.
  if (state === published) return;
  published = state;
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

  // Both managers resolve asynchronously and both can be changed by the reader
  // afterwards, so re-settle on every signal either of them emits.
  document.addEventListener('zarazConsentChoiceMade', settle);
  document.addEventListener('zarazConsentAPIReady', settle);
  window.addEventListener('cmpEvent', settle);
  const timer = window.setInterval(settle, 500);
  window.setTimeout(() => window.clearInterval(timer), CMP_GRACE_MS * 4);
}
