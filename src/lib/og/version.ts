/**
 * Give social-card images a new absolute URL on every deployment.
 *
 * Social networks cache Open Graph images independently from the HTML page.
 * Replacing `/og/foo.png` in place is therefore not enough: X, Facebook,
 * LinkedIn and messaging clients may keep the previous pixels for days.  The
 * Cloudflare Pages commit SHA is stable within one build and changes at every
 * deploy. Local builds use a process-scoped value so the rendered markup can
 * still be tested without Cloudflare's environment variables.
 */
const socialCardVersion = (
  process.env.CF_PAGES_COMMIT_SHA
  || process.env.GITHUB_SHA
  || process.env.COMMIT_REF
  || process.env.VERCEL_GIT_COMMIT_SHA
  || `local-${Date.now().toString(36)}`
).slice(0, 12);

export function versionSocialCardUrl(url: string): string {
  if (!url) return '';

  const parsed = new URL(url, 'https://vote-scope.com');
  parsed.searchParams.set('v', socialCardVersion);
  return parsed.toString();
}

