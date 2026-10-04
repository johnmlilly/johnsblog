import { DateTime } from 'luxon';

// "2026-03-16" — used where the terminal design wants log-style dates.
export function formatIsoDate(date: Date): string {
  return DateTime.fromJSDate(date, { zone: 'utc' }).toISODate() ?? '';
}

export function readingMinutes(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`~-]/g, ' ');
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const HANDLE_STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'every', 'for', 'how', 'i', 'in', 'is', 'like', 'looks',
  'my', 'now', 'of', 'on', 'should', 'the', 'this', 'to', 'top', 'use', 'what',
  'why', 'with',
]);

// Short neofetch-style name from a title: the first two meaningful words,
// e.g. "How to Use CSS Columns for…" → "css-columns".
export function handleFor(title: string): string {
  const words = slugify(title).split('-');
  const meaningful = words.filter((word) => !HANDLE_STOPWORDS.has(word) && !/^\d+$/.test(word));
  return (meaningful.length ? meaningful : words).slice(0, 2).join('-');
}
