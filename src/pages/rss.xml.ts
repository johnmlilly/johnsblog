import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.published !== false);

  return rss({
    title: "John Lilly's Blog",
    description: 'Notes on code, tools, and the craft from John Lilly, a full stack developer in Northern Virginia.',
    site: context.site!,
    items: posts
      .filter((post) => post.data.date)
      .sort((a, b) => b.data.date!.getTime() - a.data.date!.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description ?? '',
        pubDate: post.data.date,
        link: `/blog/${post.id}/`,
      })),
  });
}
