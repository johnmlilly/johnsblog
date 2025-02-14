# My Personal Blog - Built with 11ty, Pico CSS, and DeCap CMS

## Overview
This is my personal blog site built using the **11ty ([Eleventy](https://www.11ty.dev/)) static site generator**, styled with **[Pico CSS](https://picocss.com/)**, and powered by **[Decap CMS](https://decapcms.org/)** for easy content management. The project is based on the starter files from **Kevin Powell's repository**, originally created for the Codementor DevProjects Challenge: *Create a fast and secure blog using JAMstack.*

## Features
- **11ty (Eleventy):** A simple and flexible static site generator for fast and efficient builds.
- **Pico CSS:** A lightweight, classless CSS framework for a clean and modern design.
- **Decap CMS:** Provides a user-friendly, Git-based content management system for adding and editing blog posts.
- **Markdown Support:** All blog posts are written in Markdown for simplicity and portability.
- **Custom Components:** Implements reusable components using **Nunjucks (njk) templates**.
- **Optimized Images:** Uses the 11ty Image Plugin for efficient image loading and performance.
- **Responsive Design:** Fully responsive and mobile-friendly layout.

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- **Node.js** (LTS recommended)
- **npm** or **pnpm/yarn**

### Clone the Repository
```sh
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### Install Dependencies
```sh
npm install
```

### Run the Development Server
```sh
npm run dev
```
### Build for Production
```sh
npm run build
```
This generates a production-ready version of the site in the `./public/` directory.

## Content Management with DeCap CMS
This project integrates **DeCap CMS** to manage blog posts without requiring direct access to the repo. Blog posts are stored as Markdown files in `src/blog/`.

To access the CMS:
1. Navigate to `/admin/` on your deployed site.
2. Log in using the configured authentication method.
3. Create, edit, or delete posts with a simple UI.

## File Structure
```
📂 your-repo-name/
├── 📂 src/
│   ├── 📂 _includes/       # Nunjucks templates & components
│   ├── 📂 _data/           # JSON/YAML data files
│   ├── 📂 blog/           # Blog post Markdown files
│   ├── 📂 styles/         # Pico CSS & custom styles
│   ├── index.njk         # Homepage template
│   ├── admin/            # DeCap CMS config
├── 📂 public/             # Generated static site
├── 📜 .eleventy.js         # 11ty configuration
├── 📜 package.json        # Dependencies & scripts
├── 📜 README.md           # Project documentation
```

## Deployment
The site can be deployed on any static hosting provider such as:
- **Netlify** (recommended, supports Decap CMS natively)
- **Vercel**
- **GitHub Pages**
- **Cloudflare Pages**


## Credits
- **Kevin Powell** - Provided the original starter files for the Codementor challenge.
- **Pico CSS** - For a lightweight and beautiful styling approach.
- **Eleventy** - The static site generator powering this project.
- **Decap CMS** - For making content management seamless.

## License
This project is licensed under the [MIT License](LICENSE).

---
🚀 Happy coding and may the Force be with you! ✨

