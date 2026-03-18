import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://csiors.org',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'sk'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
