import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// TEMPORARY, remove before merging to main: on Cloudflare preview builds
// (any branch but main), point social preview images at that branch's
// preview URL so they can be tested before going live. Canonical URLs,
// the sitemap, and RSS keep using `site`.
const branch = process.env.WORKERS_CI_BRANCH;
const ogOrigin =
  branch && branch !== 'main'
    ? `https://${branch.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-johnsblog.jm2lilly.workers.dev`
    : '';

export default defineConfig({
  site: 'https://johnlilly.dev',
  output: 'static',
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [sitemap()],
  vite: {
    define: { __OG_ORIGIN__: JSON.stringify(ogOrigin) },
  },
});
