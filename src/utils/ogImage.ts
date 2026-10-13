// Build-time Open Graph images (1200×630 PNG) in the neofetch card style.
// Rendered from an SVG we lay out by hand (the font is monospace, so text
// width is just characters × advance), then rasterized with resvg's
// WebAssembly build so it runs in Cloudflare's runtime during prerender.
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm?module';
import regularFont from '../assets/fonts/JetBrainsMono-Regular.ttf?inline';
import extraBoldFont from '../assets/fonts/JetBrainsMono-ExtraBold.ttf?inline';
import avatar from '../assets/og-avatar.jpg?inline';
import { SIZE, toPixelPath, type TerminalLogo } from './terminalLogo';

/** Decode a Vite `?inline` data URL into bytes. */
const dataUrlBytes = (url: string) => Uint8Array.from(atob(url.slice(url.indexOf(',') + 1)), (c) => c.charCodeAt(0));

const fontBuffers = [dataUrlBytes(regularFont), dataUrlBytes(extraBoldFont)];

/** Resolves once the resvg WebAssembly module is ready. Await before rendering. */
export const ogReady: Promise<void> = initWasm(resvgWasm);

export interface OgRow {
  label: string;
  value: string;
}

export interface OgCard {
  logo: TerminalLogo;
  /** Shown as `handle@johnlilly`. */
  handle: string;
  title: string;
  rows: OgRow[];
  /** Path shown in the title bar and status bar, e.g. "blog". */
  section: string;
}

const W = 1200;
const H = 630;
const FONT = 'JetBrains Mono';
const ADVANCE = 0.6; // JetBrains Mono advance width, in em

const COLORS = {
  bg: '#1a1a1a',
  panel: '#0a0a0a',
  border: '#334155',
  text: '#e5e7eb',
  muted: '#a0a0a0',
  primary: '#60a5fa',
  purple: '#8b5cf6',
  green: '#10b981',
  amber: '#f59e0b',
};

const esc = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Greedy word wrap to a character width, capped at maxLines (with "…"). */
export function wrap(text: string, width: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= width) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word.length > width ? `${word.slice(0, width - 1)}…` : word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    // Drop whole words only until "…" fits.
    while (last.length + 1 > width && /\s/.test(last)) last = last.replace(/\s+\S*$/, '');
    kept[maxLines - 1] = `${last.slice(0, width - 1)}…`;
    return kept;
  }
  return lines;
}

/** Fit `value` after a label within `width` characters. */
const clip = (value: string, width: number) => (value.length > width ? `${value.slice(0, width - 1)}…` : value);

function text(x: number, y: number, size: number, fill: string, content: string, extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${content}</text>`;
}

/** Background, terminal panel, and title bar with a `~/section` prompt. */
function chrome(section: string): string[] {
  const path = section ? `~/${esc(section)}` : '~';
  return [
    `<rect width="${W}" height="${H}" fill="${COLORS.bg}"/>`,
    `<rect x="40" y="36" width="${W - 80}" height="530" fill="${COLORS.panel}" stroke="${COLORS.border}" stroke-width="2"/>`,
    `<line x1="40" y1="88" x2="${W - 40}" y2="88" stroke="${COLORS.border}" stroke-width="2"/>`,
    text(
      68,
      72,
      22,
      COLORS.text,
      `<tspan fill="${COLORS.green}" font-weight="800">john@lilly</tspan>:<tspan fill="${COLORS.primary}">${path}</tspan>$`
    ),
  ];
}

/** tmux-style status bar, matching the one on the site. */
function statusBar(section: string, right = 'full stack developer'): string[] {
  return [
    `<rect x="0" y="${H - 44}" width="${W}" height="44" fill="${COLORS.primary}"/>`,
    text(40, H - 15, 22, COLORS.panel, `[jl]  ${esc(section || 'home')}*`, 'font-weight="800"'),
    ...(right ? [text(W - 40, H - 15, 22, COLORS.panel, esc(right), 'text-anchor="end" font-weight="800"')] : []),
  ];
}

/** `label: value` rows starting at baseline y. Returns the next baseline. */
function rows(parts: string[], items: OgRow[], x: number, y: number, width: number): number {
  const size = 24;
  const labelWidth = Math.max(...items.map((row) => row.label.length)) + 2;
  const valueChars = Math.floor(width / (size * ADVANCE)) - labelWidth;
  for (const row of items) {
    parts.push(
      text(x, y, size, COLORS.amber, `${esc(row.label)}:`),
      row.label === 'status'
        ? text(x + labelWidth * size * ADVANCE, y, size, COLORS.green, `● ${esc(clip(row.value, valueChars - 2))}`)
        : text(x + labelWidth * size * ADVANCE, y, size, COLORS.text, esc(clip(row.value, valueChars)))
    );
    y += 36;
  }
  return y;
}

/** The palette swatch row neofetch prints at the end. */
function swatches(parts: string[], x: number, y: number) {
  [COLORS.primary, COLORS.purple, COLORS.green, COLORS.amber, COLORS.muted].forEach((fill, i) => {
    parts.push(`<rect x="${x + i * 48}" y="${y}" width="48" height="22" fill="${fill}"/>`);
  });
}

const svgDoc = (parts: string[]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">${parts.join('')}</svg>`;

function render(svg: string): Uint8Array<ArrayBuffer> {
  const resvg = new Resvg(svg, {
    font: { fontBuffers, defaultFontFamily: FONT, loadSystemFonts: false },
    fitTo: { mode: 'width', value: W },
  });
  return new Uint8Array(resvg.render().asPng());
}

export function ogSvg(card: OgCard): string {
  const { logo } = card;
  const logoColor = logo.color.startsWith('#')
    ? logo.color
    : logo.color.includes('primary')
      ? COLORS.primary
      : COLORS.text;

  const parts = chrome(card.section);

  // Logo: pixel grid scaled into a 280px square, label underneath
  const logoSize = 280;
  const logoX = 84;
  const logoY = 130;
  const scale = logoSize / logo.size;
  parts.push(
    `<path d="${logo.path}" fill="${logoColor}" transform="translate(${logoX} ${logoY}) scale(${scale})" shape-rendering="crispEdges"/>`,
    text(logoX + logoSize / 2, logoY + logoSize + 50, 22, COLORS.muted, `[ ${esc(logo.label)} ]`, 'text-anchor="middle"')
  );

  // Right column: handle, rule, title, rows, palette
  const colX = 430;
  const colWidth = W - 68 - colX;
  let y = 150;
  const handleSize = 26;
  parts.push(
    text(
      colX,
      y,
      handleSize,
      COLORS.text,
      `<tspan fill="${COLORS.green}">${esc(card.handle)}</tspan>@<tspan fill="${COLORS.primary}">johnlilly</tspan>`
    )
  );
  y += 34;
  parts.push(text(colX, y, handleSize, COLORS.muted, '-'.repeat(Math.min(card.handle.length + 10, 30))));

  const titleSize = 46;
  const titleChars = Math.floor(colWidth / (titleSize * ADVANCE));
  const titleLines = wrap(card.title, titleChars, 3);
  y += 62;
  for (const line of titleLines) {
    parts.push(text(colX, y, titleSize, COLORS.text, esc(line), 'font-weight="800"'));
    y += 56;
  }

  y = rows(parts, card.rows, colX, y + 10, colWidth);
  swatches(parts, colX, y - 6);
  parts.push(...statusBar(card.section));

  return svgDoc(parts);
}

export function ogPng(card: OgCard): Uint8Array<ArrayBuffer> {
  return render(ogSvg(card));
}

export interface OgProfile {
  name: string;
  title: string;
  rows: OgRow[];
}

/** Default image: headshot plus name and title, like the home page hero. */
export function ogProfilePng(profile: OgProfile): Uint8Array<ArrayBuffer> {
  const parts = chrome('');

  // Headshot in a window frame with a title bar
  const photo = { x: 84, y: 156, size: 340 };
  parts.push(
    `<rect x="${photo.x - 1}" y="${photo.y - 37}" width="${photo.size + 2}" height="${photo.size + 38}" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="2"/>`,
    `<line x1="${photo.x}" y1="${photo.y - 1}" x2="${photo.x + photo.size}" y2="${photo.y - 1}" stroke="${COLORS.border}" stroke-width="2"/>`,
    text(photo.x + 12, photo.y - 12, 18, COLORS.text, 'photo-01'),
    text(photo.x + photo.size - 12, photo.y - 12, 18, COLORS.muted, '~/photos', 'text-anchor="end"'),
    `<image href="${avatar}" x="${photo.x}" y="${photo.y}" width="${photo.size}" height="${photo.size}" preserveAspectRatio="xMidYMid slice"/>`
  );

  // whoami, name with cursor, title, rows
  const colX = 486;
  const colWidth = W - 68 - colX;
  parts.push(
    text(colX, 176, 26, COLORS.muted, `<tspan fill="${COLORS.green}">$</tspan> whoami`),
    text(colX, 276, 80, COLORS.text, `${esc(profile.name)}<tspan fill="${COLORS.primary}">_</tspan>`, 'font-weight="800"'),
    text(colX, 336, 32, COLORS.amber, esc(profile.title))
  );
  const y = rows(parts, profile.rows, colX, 410, colWidth);
  swatches(parts, colX, y - 6);
  // The title is already under the name, so leave the bar's right side empty.
  parts.push(...statusBar('', ''));

  return render(svgDoc(parts));
}

type IconNode = [string, Record<string, string | number>][];

/**
 * Pixel logo from a Lucide icon (the site's UI icon set), for pages that
 * aren't about a specific technology. Rendered with resvg at grid size.
 */
export function lucideLogo(node: IconNode, label: string): TerminalLogo {
  const children = node
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`)
    .join('');
  const pad = 1.2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${24 + pad * 2} ${24 + pad * 2}" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
  const { pixels, width } = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE } }).render();
  const grid = Array.from({ length: SIZE }, (_, y) =>
    Array.from({ length: SIZE }, (_, x) => pixels[(y * width + x) * 4 + 3] > 110)
  );
  return { size: SIZE, path: toPixelPath(grid), label, color: COLORS.primary };
}
