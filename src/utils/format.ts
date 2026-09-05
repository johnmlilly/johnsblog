import { DateTime } from 'luxon';

export function formatDate(date: Date): string {
  return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);
}

export function readingTime(markdown: string): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`~-]/g, ' ');
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} minute read`;
}
