type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
const EVENT_NAME = /^[a-z][a-z0-9_]{0,39}$/;
const sentOnce = new Set<string>();

function safeValue(value: unknown): AnalyticsValue | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  const clean = value.trim().slice(0, 80);
  return clean || undefined;
}

function pageContext(): AnalyticsProperties {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const locale = /^(en|fr|es)$/.test(segments[0] ?? '') ? segments[0] : 'unknown';
  const section = segments[1] ?? 'home';
  const path = window.location.pathname.toLowerCase();
  const contentType = path.includes('/byelections/')
    ? 'byelection'
    : path.includes('/sports/')
      ? 'sports'
      : path.includes('/indexes/')
        ? 'index'
        : path.includes('/methodolog') || path.includes('/methodology')
          ? 'methodology'
          : segments.length >= 3
            ? 'analysis'
            : 'hub';

  return {
    site_locale: locale,
    page_section: section,
    content_type: contentType,
  };
}

function safeProperties(properties: AnalyticsProperties): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties)
      .map(([key, value]) => [key.slice(0, 40), safeValue(value)] as const)
      .filter((entry): entry is readonly [string, AnalyticsValue] => entry[1] !== undefined),
  );
}

// GTM merges every push into one persistent data model, so a parameter set by
// one event survives into the next unless it is overwritten. Remember the keys
// we sent last time and blank the ones this event does not carry, otherwise a
// `chart_type` from a chart click would still be attached to a later sort.
let lastKeys: string[] = [];

export function trackAnalyticsEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
): void {
  if (typeof window === 'undefined' || !EVENT_NAME.test(eventName)) return;

  // Google Tag Manager is intentionally the only transport. Consent Mode
  // decides whether the tags reading this event may fire; there is no direct
  // gtag fallback and no second analytics library.
  const payload = safeProperties({ ...pageContext(), ...properties });
  const cleared: Record<string, undefined> = {};
  for (const key of lastKeys) {
    if (!(key in payload)) cleared[key] = undefined;
  }
  lastKeys = Object.keys(payload);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...cleared, ...payload });
}

export function trackAnalyticsEventOnce(
  eventName: string,
  properties: AnalyticsProperties = {},
  key = eventName,
): void {
  if (sentOnce.has(key)) return;
  sentOnce.add(key);
  trackAnalyticsEvent(eventName, properties);
}

function datasetProperties(element: HTMLElement): AnalyticsProperties {
  const properties: AnalyticsProperties = {};
  for (const [key, rawValue] of Object.entries(element.dataset)) {
    if (!key.startsWith('analytics') || key === 'analyticsEvent' || key === 'analyticsOnce') continue;
    const propertyName = key
      .replace(/^analytics/, '')
      .replace(/^[A-Z]/, (letter) => letter.toLowerCase())
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    const value = safeValue(rawValue);
    if (propertyName && value !== undefined) properties[propertyName] = value;
  }
  return properties;
}

function destinationProperties(anchor: HTMLAnchorElement): AnalyticsProperties {
  const url = new URL(anchor.href, window.location.href);
  if (url.origin === window.location.origin) {
    return { destination_type: 'internal', destination_path: url.pathname };
  }
  return { destination_type: 'external', destination_host: url.hostname };
}

export function initAnalyticsTracking(): void {
  if (typeof document === 'undefined' || document.documentElement.dataset.analyticsReady === 'true') return;
  document.documentElement.dataset.analyticsReady = 'true';

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const explicit = target.closest<HTMLElement>('[data-analytics-event]');
    if (explicit?.dataset.analyticsEvent) {
      const properties = datasetProperties(explicit);
      if (explicit instanceof HTMLAnchorElement) {
        Object.assign(properties, destinationProperties(explicit));
      }
      if (explicit.dataset.analyticsOnce === 'true') {
        const key = `${explicit.dataset.analyticsEvent}:${JSON.stringify(properties)}`;
        trackAnalyticsEventOnce(explicit.dataset.analyticsEvent, properties, key);
      } else {
        trackAnalyticsEvent(explicit.dataset.analyticsEvent, properties);
      }
      return;
    }

    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    const region = anchor.closest<HTMLElement>('[data-analytics-region]')?.dataset.analyticsRegion;
    if (region) {
      trackAnalyticsEvent('navigation_click', {
        navigation_region: region,
        ...destinationProperties(anchor),
      });
      return;
    }

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin) {
      trackAnalyticsEvent('outbound_click', destinationProperties(anchor));
    }
  });
}
