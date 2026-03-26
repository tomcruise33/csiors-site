import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  site: 'https://csiors.org',
  integrations: [sitemap()],
});
