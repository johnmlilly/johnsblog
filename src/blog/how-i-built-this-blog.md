---
published: false
title: How I Built My Portfolio Site (and Why I Chose 11ty)
description: Building this site was a chance to combine creativity and code — to
  design something simple, fast, and fully my own.
date: 2025-10-17
tags:
  - featured
  - 11ty
  - SSG
image: /blog/howibuildthisblog.jpg
imageAlt: Laptop, coffee mug and paper pad on a desk
---
When I set out to build my personal website, I had a few simple goals:

*   **Showcase my work** and highlight my skills as a developer.
    
*   **Keep it scalable** — something I could grow over time.
    
*   **Stay low-cost and lightweight**, without paying monthly fees or relying on bulky builders.
    
*   **Incorporate a blog** to share insights, tutorials, and reflections on my journey as a developer.
    

I knew I didn’t want to go the WordPress or Squarespace route. They’re great tools for many people, but I wanted something that gave me more control over the code, performance, and overall experience — both for visitors and for myself.

## Research and Choosing a Tech Stack

My initial research led me into the world of **static site generators (SSGs)** — tools that let you build fast, secure websites with modern developer workflows. I explored a few popular options like **Astro**, **Jekyll**, and **11ty**.

While Astro was appealing for its React compatibility and Jekyll had strong roots in the developer community, **11ty (Eleventy)** stood out for its simplicity, flexibility, and supportive open-source community. The documentation was excellent, the learning curve was gentle, and it allowed me to use plain HTML and template languages like Nunjucks — perfect for someone who enjoys tinkering with the front end.

### /Getting Started

Once I decided on 11ty, I dove into the documentation and began following tutorials to understand the structure and workflow. One tutorial that really helped was from **Kevin Powell**, the “King of CSS,” whose content I’ve followed for years. His video on building a JAMstack blog using 11ty, Netlify, and a custom CMS clicked immediately.

It showed me that I could have everything I wanted: a modern, fast, and completely customizable site — without needing to manage servers or pay for hosting.

* * *

### Building the Site

The initial build came together surprisingly quickly. I set up my **11ty project**, connected it to **Netlify** for deployment, and began experimenting with collections for my projects and blog posts.

Styling was done entirely with **custom CSS**, focusing on clean, responsive layouts and accessible design principles. I also added a touch of **JavaScript** for interactive elements, but overall, I wanted to keep things fast and lightweight.

I originally integrated **Decap CMS** (formerly Netlify CMS) to make content editing easier, but after a bit of testing, I switched to **PagesCMS**. It offered a simpler user interface and smoother integration with my 11ty setup — a much better overall experience for managing my blog posts and projects.

* * *

### Review and Iteration

Once the main structure was up, I spent time refining the layout, improving accessibility, and optimizing performance. Each round of feedback — from peers and my own testing — helped shape the final version.

I focused on scalability from the start, ensuring that adding new pages, posts, or features would be as seamless as possible. The static architecture makes it easy to maintain, and the modular 11ty structure means I can add new components or sections down the road without rebuilding the whole thing.

* * *

### The Final Stack

Here’s what the final tech stack looks like:

*   **Static Site Generator:** [11ty](https://www.11ty.dev/)
    
*   **Hosting:** [Netlify](https://www.netlify.com/) (with automatic builds from GitHub)
    
*   **CMS:** [PagesCMS](https://pagescms.org/) (switched from Decap CMS for simplicity)
    
*   **Styling:** Custom CSS (no frameworks — just well-structured, reusable components)
    
*   **Scripting:** Vanilla JavaScript for small interactive features
    
*   **Version Control:** GitHub
    

The end result is exactly what I set out to build — a site that’s **simple, fast, scalable, and low-cost**, while still showcasing my skills and giving me a space to share my thoughts through my blog.

* * *

### Final Thoughts

Building this site reminded me why I love front-end development: the mix of creativity and problem-solving, the freedom to experiment, and the satisfaction of creating something from the ground up.

There’s always room to improve — I’m already planning to add new sections, performance tweaks, and maybe a few visual Easter eggs for fun — but I’m proud of how far it’s come.

If you’re thinking of building your own portfolio or blog, I can’t recommend **11ty + Netlify + PagesCMS** enough. It’s a powerful, flexible stack that keeps things simple and gives you total creative control.

* * *

Would you like me to help you turn this into a markdown-ready version for your 11ty blog (with headings, front matter, and internal links if applicable)?