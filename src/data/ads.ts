/**
 * Display advertising config — Journey by Mediavine.
 *
 * IMPORTANT: `enabled` stays false until the Mediavine onboarding is
 * complete AND the consent work has shipped. Base.astro renders nothing
 * when it is false, so the script can be committed and reviewed long
 * before it ever reaches a reader.
 *
 * Before flipping this to true, in this order:
 *   1. Consent modal text switched to the post-launch wording
 *      (models/docs/analytics/consent-modal-copy.md) — the current text
 *      says "no advertising profile", which stops being true on the
 *      first impression served.
 *   2. Advertising purpose added in Cloudflare Zaraz consent settings.
 *   3. privacy.json updated in all three locales to name Mediavine.
 *   4. public/ads.txt present (publish_web.py refreshes it on every run).
 *
 * NEVER register this script as a Zaraz tool with a consent purpose.
 * Zaraz consent is global and has no geographic targeting, so gating it
 * there would switch ads off in Canada and the United States too, where
 * no consent is required. The script loads for everyone; the TCF signal
 * is what constrains behaviour inside the EEA and the UK.
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
