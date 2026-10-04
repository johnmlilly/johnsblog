import type { CollectionEntry } from 'astro:content';
import { formatIsoDate, handleFor, readingMinutes } from './format';
import { terminalLogo, type TerminalLogo } from './terminalLogo';

export interface CardData {
  logo: TerminalLogo;
  handle: string;
  rows: { label: string; value: string; datetime?: string }[];
}

/** Neofetch card data for a blog post (used by cards, post header, OG image). */
export function postCard(post: CollectionEntry<'blog'>): CardData {
  const { title, tags, date, logo } = post.data;
  return {
    logo: terminalLogo(title, tags, logo),
    handle: handleFor(title),
    rows: [
      { label: 'tags', value: tags.map((tag) => tag.toLowerCase()).join(' · ') || 'none' },
      ...(date ? [{ label: 'date', value: formatIsoDate(date), datetime: date.toISOString() }] : []),
      { label: 'read', value: `${readingMinutes(post.body ?? '')} min` },
    ],
  };
}
