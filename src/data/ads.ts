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
 *
 * Where the ads go: the dashboard's Content Selector is set to `#main-content`
 * (Settings -> Ad Settings -> Ad Placement Selectors). Journey inserts ads
 * between the DIRECT children of each target it is given, and it does not
 * descend into them -- divbuster is off. Our page bodies are single monolithic
 * <article> wrappers, so `#main-content` alone yields two or three slots at the
 * very bottom of a page: on /fr/canada/quebec/, article.projection-engine is
 * 7824px of an 11330px page and used to receive none at all.
 *
 * Hence the bare `data-content-area` attribute on those 32 page wrappers. The
 * wrapper queries `${content_selector}, [data-content-area]`, so each marked
 * article becomes a target in its own right and its own sections become
 * insertion points. Measured on the Quebec page: 3 slots -> 10, spread from
 * 809px to 12861px, which is 18% ad density against the "Optimal" target of 20%.
 *
 * The attribute does NOTHING on its own. That query is only reached when
 * content_selector is non-null -- an empty Content Selector short-circuits to an
 * empty target list, which is exactly the state the site shipped in from
 * 2026-08-21 to 2026-09-11, one adhesion unit per pageview and a $0.15 page RPM.
 * If ads ever vanish from mid-content, check that field before touching markup.
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
