import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://johnlilly.dev',
  output: 'static',
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [sitemap()],
  vite: {
    // Pre-bundle deps the dev worker otherwise discovers late; a mid-boot
    // re-optimize deletes chunks it already loaded and crashes cold starts.
    ssr: {
      optimizeDeps: { include: ['astro/assets/services/noop', '@astrojs/rss'] },
    },
  },
  markdown: {
    // Mermaid blocks are left as plain code and drawn in the browser
    // (see src/pages/projects/[slug].astro).
    syntaxHighlight: { type: 'shiki', excludeLangs: ['math', 'mermaid'] },
  },
});
