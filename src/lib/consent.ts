/**
 * Google Consent Mode signal for measurement.
 *
 * Google requires a Consent Mode v2 signal from a certified consent manager
 * only for visitors in the EEA, the United Kingdom and Switzerland. Everywhere
 * else — Canada and the United States included — it requires nothing, and
 * Journey by Mediavine's consent platform deliberately does not display: their
 * own documentation scopes the CMP to "display and video advertising" and to
 * "regions covered by GDPR, PECR, and the ePrivacy Directive".
 *
 * So this module answers one question: has a consent manager taken charge of
 * this reader, and if so what did they say?
 *
 *   - It has  → derive analytics_storage from the TCF signals it publishes.
 *   - It has not → Google asks for nothing here, so measurement runs.
 *
 * Advertising consent is deliberately absent from this file and from the
 * defaults in Base.astro. It belongs to Mediavine: their ad stack, their
 * certified CMP, their vendor list.
 *
 * Measured on production 2026-08-23: from Canada the CMP reports `cmpGDPR: 0`,
 * `cmpDisplayStatus: "hidden"` and never installs `__tcfapi`.
 */

type ConsentState = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    /** Defined by the Consent Mode defaults script at the top of Base.astro. */
    gtag?: (...args: unknown[]) => void;
    /** The default that script already applied, so we never contradict it. */
    __vsConsentDefault?: ConsentState;
    __tcfapi?: (
      command: string,
      version: number,
      callback: (data: unknown, success: boolean) => void,
    ) => void;
  }
}

/**
 * How long to wait for the CMP to announce itself before concluding it never
 * will. It is blocked outright by most ad blockers, and staying silent forever
 * would mean measuring nothing at all for those readers.
 */
const CMP_FALLBACK_MS = 5000;

let published: ConsentState | undefined;
let decided = false;
let startedAt = 0;

/**
 * Whatever Base.astro already told Google before the container loaded. Outside
 * the EEA that is 'granted', and we must not walk it back to 'denied' while
 * waiting for a CMP that is never going to speak — doing so is what stripped
 * page_view of its consent and emptied the Realtime views card.
 */
function defaultState(): ConsentState {
  return window.__vsConsentDefault === 'granted' ? 'granted' : 'denied';
}

function publish(state: ConsentState, source: string): void {
  // Republish only on an actual change: GTM applies every update it receives.
  if (state === published) return;
  published = state;
  if (source !== 'pending') decided = true;

  // The signal itself, through the gtag defined alongside the defaults in
  // Base.astro, so GTM reads it natively.
  window.gtag?.('consent', 'update', { analytics_storage: state });

  // A plain event too, so the decision and its origin are visible in GTM
  // Preview and can be triggered on later.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'vs_consent',
    vs_analytics_consent: state,
    vs_consent_source: source,
  });
}

/**
 * The most recent CONSENTMANAGER snapshot. It pushes a flat object of `cmp*`
 * keys on every state change rather than exposing a stable global, so the
 * newest push carrying `cmpGDPR` is the current truth.
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

/** True once the CMP has taken responsibility for asking this reader. */
function cmpGoverns(snapshot: Record<string, unknown> | undefined): boolean {
  if (typeof window.__tcfapi === 'function') return true;
  return !!snapshot && Number(snapshot.cmpGDPR) === 1;
}

/**
 * Google's own IAB vendor id is 755. Under TCF the CMP publishes the vendors
 * the reader accepted as a comma-delimited list, so membership of 755 is what
 * says Google Analytics may run. TCF purpose 1 is storage access and purpose 8
 * is measuring content performance.
 */
function cmpGrantsAnalytics(snapshot: Record<string, unknown>): boolean {
  const vendors = String(snapshot.cmpVendorsConsent ?? '').split(',');
  const purposes = String(snapshot.cmpPurposesConsent ?? '').split(',');
  return vendors.includes('755') && (purposes.includes('8') || purposes.includes('1'));
}

/**
 * Last-resort guard for the fallback path only. If the CMP never loaded we
 * cannot ask it where the reader is, and granting a European reader by default
 * is the one mistake worth avoiding. The browser's own timezone is not proof
 * of location, but it is enough to hold back rather than guess wrong.
 */
function looksEuropean(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return /^(Europe\/|Atlantic\/(Canary|Faroe|Madeira)|Africa\/Ceuta)/.test(zone);
  } catch {
    return true;
  }
}

/** Decide and publish. Safe to call more than once. */
export function initConsentArbitration(): void {
  if (typeof window === 'undefined') return;
  if (document.documentElement.dataset.consentReady === 'true') return;
  document.documentElement.dataset.consentReady = 'true';
  startedAt = Date.now();
  published = defaultState();

  const settle = (): void => {
    const snapshot = cmpSnapshot();

    if (cmpGoverns(snapshot) && snapshot) {
      publish(cmpGrantsAnalytics(snapshot) ? 'granted' : 'denied', 'mediavine');
      return;
    }

    if (snapshot) {
      // The CMP loaded and decided this reader is outside its scope. Google
      // requires no signal here, so measurement runs.
      publish('granted', 'not-required');
      return;
    }

    if (Date.now() - startedAt > CMP_FALLBACK_MS) {
      publish(looksEuropean() ? 'denied' : 'granted', 'no-cmp');
      return;
    }

    publish(defaultState(), 'pending');
  };

  settle();

  window.addEventListener('cmpEvent', settle);

  // Both the CMP and the reader act asynchronously, so keep looking until
  // somebody has actually answered rather than for a fixed window.
  const timer = window.setInterval(() => {
    settle();
    if (decided) window.clearInterval(timer);
  }, 300);
}
