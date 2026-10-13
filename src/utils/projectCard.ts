import type { CollectionEntry } from 'astro:content';
import { formatIsoDate, handleFor } from './format';
import { terminalLogo } from './terminalLogo';
import type { CardData } from './postCard';

export const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/**
 * Neofetch card data for a project. `detail` adds the case study rows
 * (role, repo, status) shown on the project's own page.
 */
export function projectCard(project: CollectionEntry<'projects'>, detail = false): CardData {
  const { title, tags, link, date, logo, role, status, repo } = project.data;
  const rows: CardData['rows'] = [
    { label: 'stack', value: tags.map((tag) => tag.toLowerCase()).join(' · ') },
    ...(detail && role ? [{ label: 'role', value: role }] : []),
    { label: 'year', value: formatIsoDate(date).slice(0, 4) },
    ...(link ? [{ label: 'url', value: hostOf(link) }] : []),
    ...(detail && repo ? [{ label: 'repo', value: repo }] : []),
    ...(detail && status ? [{ label: 'status', value: status }] : []),
  ];
  return { logo: terminalLogo(title, tags, logo), handle: handleFor(title), rows };
}
