import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://johnlilly.dev',
  output: 'static',
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [sitemap()],
  markdown: {
    // Mermaid blocks are left as plain code and drawn in the browser
    // (see src/pages/projects/[slug].astro).
    syntaxHighlight: { type: 'shiki', excludeLangs: ['math', 'mermaid'] },
  },
});
