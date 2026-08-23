/**
 * Display advertising config — Journey by Mediavine.
 *
 * Live in production since 2026-08-21. `enabled` is the master switch: false
 * renders no script at all, which is the way to turn advertising off.
 *
 * Consent for advertising is Mediavine's, not ours. Their consent management
 * platform (CONSENTMANAGER) collects it, and their own documentation scopes it
 * to "display and video advertising" and to regions covered by GDPR, PECR and
 * the ePrivacy Directive. Nothing on our side should declare an advertising
 * consent signal: on 2026-08-23 our Consent Mode defaults briefly did, which
 * put Google ad demand into restricted mode in Canada and the United States
 * where no consent signal is required at all. See the note in Base.astro.
 *
 * Audience measurement is the opposite case and is ours: GA4 and Microsoft
 * Clarity run through Google Tag Manager, gated on analytics_storage by
 * src/lib/consent.ts.
 */

export interface AdsConfig {
  /** Master switch. False renders no script at all. */
  enabled: boolean;
  /** Journey site ID, from publishers.mediavine.com → Settings → Ad Setup. */
  siteId: string;
  /** Script wrapper host, as given by Mediavine. */
  scriptHost: string;
}

export const ads: AdsConfig = {
  enabled: true,
  siteId: '9eff603b-b6c9-42b7-a2dc-d65bce3610a5',
  scriptHost: 'scripts.scriptwrapper.com',
};

/** Absolute URL of the ad script wrapper. */
export const adScriptUrl = (c: AdsConfig = ads): string =>
  `https://${c.scriptHost}/tags/${c.siteId}.js`;
