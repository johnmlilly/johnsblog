import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { FolderCode, Mail, NotebookPen } from 'lucide';
import { lucideLogo, ogPng, ogReady, type OgCard } from '../../utils/ogImage';
import { postCard } from '../../utils/postCard';
import { formatIsoDate } from '../../utils/format';

// Social preview images, generated at build time. The home page keeps its
// own hand-made image; everything else points here.
export const getStaticPaths = (async () => {
  await ogReady;
  const posts = (await getCollection('blog', ({ data }) => data.published !== false)).sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0)
  );
  const projects = (await getCollection('projects')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const topTags = (lists: string[][], count: number) => {
    const counts = new Map<string, number>();
    lists.flat().forEach((tag) => counts.set(tag.toLowerCase(), (counts.get(tag.toLowerCase()) ?? 0) + 1));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([tag]) => tag)
      .join(' · ');
  };

  const cards: { slug: string; card: OgCard }[] = [
    ...posts.map((post) => {
      const { logo, handle, rows } = postCard(post);
      return { slug: `blog/${post.id}`, card: { logo, handle, rows, title: post.data.title, section: 'blog' } };
    }),
    {
      slug: 'blog',
      card: {
        logo: lucideLogo(NotebookPen, 'blog'),
        handle: 'blog',
        title: 'Notes from a freelance web developer',
        section: 'blog',
        rows: [
          { label: 'posts', value: String(posts.length) },
          { label: 'latest', value: posts[0]?.data.date ? formatIsoDate(posts[0].data.date) : '—' },
          { label: 'topics', value: topTags(posts.map((p) => p.data.tags), 3) },
        ],
      },
    },
    {
      slug: 'projects',
      card: {
        logo: lucideLogo(FolderCode, 'projects'),
        handle: 'projects',
        title: 'Websites and apps for nonprofits and small businesses',
        section: 'projects',
        rows: [
          { label: 'projects', value: String(projects.length) },
          { label: 'latest', value: projects[0] ? formatIsoDate(projects[0].data.date).slice(0, 4) : '—' },
          { label: 'stack', value: topTags(projects.map((p) => p.data.tags), 3) },
        ],
      },
    },
    {
      slug: 'contact',
      card: {
        logo: lucideLogo(Mail, 'contact'),
        handle: 'contact',
        title: "Let's work together",
        section: 'contact',
        rows: [
          { label: 'email', value: 'hello@johnlilly.dev' },
          { label: 'based', value: 'Northern Virginia' },
          { label: 'form', value: 'johnlilly.dev/contact' },
        ],
      },
    },
  ];

  return cards.map(({ slug, card }) => ({ params: { slug }, props: { card } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  await ogReady;
  const png = ogPng((props as { card: OgCard }).card);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
