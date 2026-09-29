// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// TEMP DEBUG: remove once Umami build vars are confirmed in Cloudflare's build log.
// Logs names/lengths only, never values.
console.log(
  '[umami-debug]',
  JSON.stringify({
    publicKeys: Object.keys(process.env).filter(
      (k) => k.toUpperCase().includes('UMAMI') || k.startsWith('PUBLIC_'),
    ),
    urlLength: process.env.PUBLIC_UMAMI_URL?.length ?? null,
    idLength: process.env.PUBLIC_UMAMI_ID?.length ?? null,
  }),
);

// https://astro.build/config
export default defineConfig({
  site: 'https://debtrelief.win',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
