import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://vote-scope.com',
  output: 'static',
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
    // No Astro fallback — broken in static output (empty bodies + conflicts
    // with explicit /es/* routes). Cloudflare _redirects handles partial ES
    // coverage for unimplemented ES hub routes.
  },
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !page.includes('/embed/'),
      changefreq: 'weekly',
    }),
  ],
});
