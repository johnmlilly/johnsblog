# My Personal Portfolio Site

## Overview
This is my personal blog and portfolio site, built with **[Astro](https://astro.build/)** and deployed to **Cloudflare Workers**. Content is managed through **[Pages CMS](https://pagescms.org/)**, a Git-based CMS configured via `.pages.yml`.

## Features
- **Astro:** Component-based static site generation with server endpoints for the contact form and RSS feed.
- **Pages CMS:** Git-based content management for blog posts, projects, skills, and page SEO metadata.
- **Content Collections:** Blog, project, and skills content live in `src/content/` with typed schemas (`src/content.config.ts`).
- **Contact Form:** Server-side API route (`src/pages/api/contact.ts`) that sends submissions via **[Resend](https://resend.com/)**.
- **Cloudflare Workers:** Deployed via `wrangler`, serving static assets from `dist/` alongside the server routes.
- **Responsive Design:** Fully responsive and mobile-friendly layout.

## Installation & Setup
### Prerequisites
- **Node.js** (LTS recommended)
- **npm**
- A [Resend](https://resend.com/) API key with a verified sending domain (for the contact form)

### Clone the Repository
```sh
git clone https://github.com/johnmlilly/johnsblog.git
cd johnsblog
npm install
```

### Local Development
```sh
npm run dev
```

For the contact form to work locally, create a `.dev.vars` file (gitignored) in the project root:
```
RESEND_API_KEY=your_resend_api_key
```

## Deployment
Deployed to **Cloudflare Workers**. `wrangler.jsonc` points the `assets.directory` at `./dist` (Astro's build output).

```sh
npm run build    # astro build -> dist/
npm run deploy   # wrangler deploy
```

The `RESEND_API_KEY` secret must be set on the Cloudflare Worker (not just locally):
```sh
wrangler secret put RESEND_API_KEY
```

## Credits
- **Kevin Powell** - Provided the original starter files for the Codementor DevProjects challenge this site was based on.
- **Astro** - The site generator powering this project.
- **Pages CMS** - For making content management seamless.

## License
This project is licensed under the [MIT License](LICENSE).

---
🚀 Happy coding and may the Force be with you! ✨
