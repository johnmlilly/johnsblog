import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { FolderCode, Mail, NotebookPen } from 'lucide';
import { lucideLogo, ogPng, ogProfilePng, ogReady, type OgCard, type OgProfile } from '../../utils/ogImage';
import home from '../../data/home.json';
import { postCard } from '../../utils/postCard';
import { projectCard } from '../../utils/projectCard';
import { formatIsoDate } from '../../utils/format';

// Social preview images, generated at build time. The home page keeps its
// own hand-made image; everything else points here, and /og/default.png is
// the fallback for pages without their own.
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
    ...projects.map((project) => {
      const { logo, handle, rows } = projectCard(project, true);
      return {
        slug: `projects/${project.id}`,
        card: { logo, handle, rows: rows.filter((row) => row.label !== 'url'), title: project.data.title, section: 'projects' },
      };
    }),
    ...posts.map((post) => {
      const { logo, handle, rows } = postCard(post);
      return { slug: `blog/${post.id}`, card: { logo, handle, rows, title: post.data.title, section: 'blog' } };
    }),
    {
      slug: 'blog',
      card: {
        logo: lucideLogo(NotebookPen, 'blog'),
        handle: 'blog',
        title: 'Notes on code, tools, and the craft',
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
        title: 'Web apps, APIs, and the pipelines behind them',
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
        title: "Say hi",
        section: 'contact',
        rows: [
          { label: 'based', value: 'Northern Virginia' },
          { label: 'github', value: 'johnmlilly' },
          { label: 'form', value: '/contact' },
        ],
      },
    },
  ];

  const profile: OgProfile = {
    name: home.hero.name,
    title: 'Full Stack Web Developer',
    rows: [
      { label: 'based', value: 'Northern Virginia' },
      { label: 'github', value: 'johnmlilly' },
    ],
  };

  return [
    ...cards.map(({ slug, card }) => ({ params: { slug }, props: { card } as OgProps })),
    { params: { slug: 'default' }, props: { profile } as OgProps },
  ];
}) satisfies GetStaticPaths;

type OgProps = { card: OgCard; profile?: never } | { profile: OgProfile; card?: never };

export const GET: APIRoute = async ({ props }) => {
  await ogReady;
  const { card, profile } = props as OgProps;
  const png = profile ? ogProfilePng(profile) : ogPng(card!);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
