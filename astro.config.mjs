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
      // Les canonicals et les URLs servies portent le slash final (Cloudflare
      // 308 depuis la forme sans slash). Sans cette normalisation, Bing voit
      // /en/ absent du sitemap (entrée émise : /en) — avertissement High.
      serialize: (item) => {
        if (!item.url.endsWith('/')) item.url = `${item.url}/`;
        return item;
      },
    }),
  ],
});
