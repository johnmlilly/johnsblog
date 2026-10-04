import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://johnlilly.dev',
  output: 'static',
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [sitemap()],
});
