// Build-time Open Graph images (1200×630 PNG) in the neofetch card style.
// Rendered from an SVG we lay out by hand (the font is monospace, so text
// width is just characters × advance), then rasterized with resvg's
// WebAssembly build so it runs in Cloudflare's runtime during prerender.
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm?module';
import regularFont from '../assets/fonts/JetBrainsMono-Regular.ttf?inline';
import extraBoldFont from '../assets/fonts/JetBrainsMono-ExtraBold.ttf?inline';
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
function wrap(text: string, width: number, maxLines: number): string[] {
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
    const last = kept[maxLines - 1];
    kept[maxLines - 1] = `${last.slice(0, width - 1).replace(/\s+\S*$/, '')}…`;
    return kept;
  }
  return lines;
}

/** Fit `value` after a label within `width` characters. */
const clip = (value: string, width: number) => (value.length > width ? `${value.slice(0, width - 1)}…` : value);

function text(x: number, y: number, size: number, fill: string, content: string, extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${content}</text>`;
}

export function ogSvg(card: OgCard): string {
  const { logo } = card;
  const logoColor = logo.color.startsWith('#')
    ? logo.color
    : logo.color.includes('primary')
      ? COLORS.primary
      : COLORS.text;

  // Panel and title bar
  const parts: string[] = [
    `<rect width="${W}" height="${H}" fill="${COLORS.bg}"/>`,
    `<rect x="40" y="36" width="${W - 80}" height="530" fill="${COLORS.panel}" stroke="${COLORS.border}" stroke-width="2"/>`,
    `<line x1="40" y1="88" x2="${W - 40}" y2="88" stroke="${COLORS.border}" stroke-width="2"/>`,
    text(
      68,
      72,
      22,
      COLORS.text,
      `<tspan fill="${COLORS.green}" font-weight="800">john@lilly</tspan>:<tspan fill="${COLORS.primary}">~/${esc(card.section)}</tspan>$`
    ),
    text(W - 68, 72, 22, COLORS.muted, 'johnlilly.dev', 'text-anchor="end"'),
  ];

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

  const rowSize = 24;
  const labelWidth = Math.max(...card.rows.map((row) => row.label.length)) + 2;
  const valueChars = Math.floor(colWidth / (rowSize * ADVANCE)) - labelWidth;
  y += 10;
  for (const row of card.rows) {
    const valueX = colX + labelWidth * rowSize * ADVANCE;
    parts.push(
      text(colX, y, rowSize, COLORS.amber, `${esc(row.label)}:`),
      text(valueX, y, rowSize, COLORS.text, esc(clip(row.value, valueChars)))
    );
    y += 36;
  }

  const swatches = [COLORS.primary, COLORS.purple, COLORS.green, COLORS.amber, COLORS.muted];
  swatches.forEach((fill, i) => {
    parts.push(`<rect x="${colX + i * 48}" y="${y - 6}" width="48" height="22" fill="${fill}"/>`);
  });

  // tmux-style status bar
  parts.push(
    `<rect x="0" y="${H - 44}" width="${W}" height="44" fill="${COLORS.primary}"/>`,
    text(
      40,
      H - 15,
      22,
      COLORS.panel,
      `[jl]  ${esc(card.section)}*`,
      'font-weight="800"'
    ),
    text(W - 40, H - 15, 22, COLORS.panel, 'johnlilly.dev · NoVA', 'text-anchor="end" font-weight="800"')
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">${parts.join('')}</svg>`;
}

export function ogPng(card: OgCard): Uint8Array<ArrayBuffer> {
  const resvg = new Resvg(ogSvg(card), {
    font: { fontBuffers, defaultFontFamily: FONT, loadSystemFonts: false },
    fitTo: { mode: 'width', value: W },
  });
  return new Uint8Array(resvg.render().asPng());
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
