import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Switch domains with one edit: the SITE_URL environment variable (or the default below).
const SITE_URL = (process.env.SITE_URL || 'https://alexeirojas.dev').replace(/\/+$/, '');

function normalize(href) {
  const u = new URL(href);
  if (u.pathname !== '/' && u.pathname !== '/es/') u.pathname = u.pathname.replace(/\/+$/, '');
  return u.toString();
}

export default defineConfig({
  site: SITE_URL,
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
      // same URL shape as the canonical links: no trailing slash except the roots
      serialize: (item) => ({
        ...item,
        url: normalize(item.url),
        links: item.links?.map((l) => ({ ...l, url: normalize(l.url) })),
      }),
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()], ssr: { external: ['satori', '@resvg/resvg-js'] } },
});
