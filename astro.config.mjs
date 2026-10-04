import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://johnlilly.dev',
  output: 'static',
  session: false,
  // Prerender in Node so build-time endpoints (e.g. /og/*.png) can use
  // native modules like resvg.
  adapter: cloudflare({ imageService: 'passthrough', prerenderEnvironment: 'node' }),
  integrations: [sitemap()],
});
