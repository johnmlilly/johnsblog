import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// `image` fields are plain root-relative strings (e.g. "/assets/blog/x.jpg")
// pointing into public/assets, not co-located files — Pages CMS's media
// picker writes paths that way, so we deliberately don't use Astro's
// image() schema helper (which expects an importable relative sibling file).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    published: z.boolean().default(true),
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    link: z.string().url(),
    // Simple Icons slug for the card logo (e.g. "react"). Optional: by
    // default the first tag with a matching logo is used.
    logo: z.string().optional(),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/skills' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    skills: z.array(z.string()),
  }),
});

export const collections = { blog, projects, skills };
