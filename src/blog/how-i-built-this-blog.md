---
published: true
title: How I Built My Portfolio Site (and Why I Chose 11ty)
description: Building this site was a chance to combine creativity and code — to
  design something simple, fast, and fully my own.
date: 2025-10-17
tags:
  - featured
  - 11ty
image: /blog/howibuildthisblog.jpg
imageAlt: Laptop, coffee mug and paper pad on a desk
---
When I set out to build my personal website, I had a few simple goals:

*   **Showcase my work** and highlight my skills as a developer.
    
*   **Keep it scalable** so it could grow with me over time.
    
*   **Stay low-cost and lightweight**, without paying monthly fees or relying on complicated plugins or builders.
    
*   **Incorporate a blog** to share insights, best practices, and my own reflections as a developer.
    

I knew I didn’t want to go the WordPress or Squarespace route. They’re great tools and I've used them for several side [projects](/projects) over the years, but I wanted something that gave me more control over the code, performance, and overall experience — both for visitors and for myself.

## Research and Choosing a Tech Stack

My initial research led me into the world of [**static site generators**](https://jamstack.org/generators/) **(SSGs)** and the broader [**Jamstack**](https://jamstack.org/) approach, which is a modern architecture that combines static files with APIs and JavaScript for speed, security, and scalability. I explored a few popular options like [Astro](https://astro.build/), [Jekyll](https://jekyllrb.com/), and [11ty](https://www.11ty.dev/) to find the right balance between flexibility, simplicity, and long-term maintainability.

While Astro was appealing for its React compatibility and Jekyll had strong roots in the developer community, **11ty (Eleventy)** stood out for its simplicity, flexibility, and supportive open-source community. The documentation was excellent, the learning curve was easy to pick up, and it allowed me to use plain HTML and template languages like Nunjucks. This was perfect for me who enjoys tinkering with the front end while also having control over custom back-end functionality.

## Getting Started

Once I decided on 11ty, I dove into the documentation and began following tutorials to understand the structure and workflow.

One tutorial that really helped was from [**Kevin Powell**,](https://www.kevinpowell.co/) commonly know as the “King of CSS,” whose content I’ve followed for years. His tutorials and courses have helped me tremendously in my career growth and trajectory with CSS and JavaScript. His video on [building a JAMstack blog using 11ty](https://www.youtube.com/watch?v=4wD00RT6d-g&t=3133s&pp=ygUVa2V2aW4gcG93ZWxsIGphbXN0YWNr), Netlify, and a custom CMS clicked immediately for me. I knew this would be the path for me!

It showed me that I could have everything I wanted: a modern, fast, and completely customizable site — without needing to manage servers or pay for hosting.

## Building the Site

The initial build came together surprisingly quickly. I set up my 11ty project, connected it to Netlify for deployment, and began experimenting with collections for my projects and blog posts.

Styling was done entirely with custom CSS that focused on a clean and responsive layouts with accessible design principles in mind. I also added a touch of JavaScript for interactive elements, but overall, I wanted to keep things fast and lightweight.

I originally integrated [Decap CMS (](https://decapcms.org/)formerly Netlify CMS) to make content editing easier, but after a bit of testing, I switched to [**PagesCMS**](https://pagescms.org/). It offered a simpler user interface and smoother integration with my 11ty setup — a much better overall experience for managing my blog posts and projects.

## Review and Iteration

Once the main structure was up, I spent time refining the layout, improving accessibility, and optimizing performance. Each round of feedback helped shape the final version.

I focused on scalability from the start, ensuring that adding new pages, posts, or features would be as seamless as possible. The static architecture makes it easy to maintain, and the modular 11ty structure means I can add new components or sections down the road without rebuilding the entire project.

## The Final Stack

Here’s what the final tech stack looks like:

*   **Static Site Generator:** [11ty](https://www.11ty.dev/)
    
*   **Hosting:** [Netlify](https://www.netlify.com/) (with automatic builds from GitHub)
    
*   **CMS:** [PagesCMS](https://pagescms.org/) (switched from Decap CMS for simplicity)
    
*   **Styling:** Custom CSS (no frameworks — just well-structured, reusable components)
    
*   **Scripting:** Vanilla JavaScript for small interactive features
    
*   **Version Control:** [GitHub](https://github.com/)
    

The end result is exactly what I set out to do — create a site that’s **simple, scalable, and low-cost**, while still showcasing my skills and giving me a space to share my thoughts.

## Final Thoughts

Building this site reminded me why I love front-end development: the mix of creativity and problem-solving, the freedom to experiment, and the satisfaction of creating something from the ground up.

If you’re thinking of building your own portfolio or blog, I can’t recommend the Jamstack approach enough. It’s a powerful, flexible approach that keeps things simple and gives you total creative control.