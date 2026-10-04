// Build-time "neofetch" logos: turn a Simple Icons brand logo into a coarse
// pixel grid, drawn like half-block (▀ ▄ █) terminal art. The grid is output
// as an SVG path rather than block characters, because block glyphs render
// with seams or fall back to other fonts depending on the device.
import * as simpleIcons from 'simple-icons';
import svgpath from 'svgpath';

interface SimpleIcon {
  title: string;
  slug: string;
  hex: string;
  path: string;
}

export interface TerminalLogo {
  /** Grid size in pixels (width = height). */
  size: number;
  /** SVG path data for the "on" pixels, in a size×size viewBox. */
  path: string;
  /** Short label shown under the art, e.g. "react". */
  label: string;
  /** CSS color for the art. */
  color: string;
}

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

// Tags whose wording doesn't match the Simple Icons title or slug.
const TAG_ALIASES: Record<string, string> = {
  '11ty': 'eleventy',
};

const icons = Object.values(simpleIcons as Record<string, unknown>).filter(
  (icon): icon is SimpleIcon => typeof icon === 'object' && icon !== null && 'path' in icon && 'slug' in icon
);

const bySlug = new Map<string, SimpleIcon>();
const byTitle = new Map<string, SimpleIcon>();
for (const icon of icons) {
  bySlug.set(icon.slug, icon);
  byTitle.set(normalize(icon.title), icon);
}

function findIcon(name: string): SimpleIcon | undefined {
  const key = normalize(name);
  const alias = TAG_ALIASES[key];
  return (alias && bySlug.get(alias)) || bySlug.get(key) || byTitle.get(key);
}

// --- Rasterizing ------------------------------------------------------------

type Point = [number, number];

/** Flatten an SVG path (24×24 viewBox) into closed polygons. */
function toPolygons(d: string): Point[][] {
  const polygons: Point[][] = [];
  let current: Point[] = [];
  let x = 0;
  let y = 0;
  const STEPS = 16;

  svgpath(d)
    .abs()
    .unarc()
    .unshort()
    .iterate((seg) => {
      const [cmd, ...args] = seg as [string, ...number[]];
      switch (cmd) {
        case 'M':
          if (current.length) polygons.push(current);
          [x, y] = args;
          current = [[x, y]];
          break;
        case 'L':
          [x, y] = args;
          current.push([x, y]);
          break;
        case 'H':
          [x] = args;
          current.push([x, y]);
          break;
        case 'V':
          [y] = args;
          current.push([x, y]);
          break;
        case 'C': {
          const [x1, y1, x2, y2, ex, ey] = args;
          for (let i = 1; i <= STEPS; i++) {
            const t = i / STEPS;
            const u = 1 - t;
            current.push([
              u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * ex,
              u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ey,
            ]);
          }
          [x, y] = [ex, ey];
          break;
        }
        case 'Q': {
          const [x1, y1, ex, ey] = args;
          for (let i = 1; i <= STEPS; i++) {
            const t = i / STEPS;
            const u = 1 - t;
            current.push([u * u * x + 2 * u * t * x1 + t * t * ex, u * u * y + 2 * u * t * y1 + t * t * ey]);
          }
          [x, y] = [ex, ey];
          break;
        }
        case 'Z':
        case 'z':
          if (current.length) {
            polygons.push(current);
            [x, y] = current[0];
          }
          current = [];
          break;
      }
    });

  if (current.length) polygons.push(current);
  return polygons;
}

/** Nonzero-winding fill test for one sample point. */
function inside(px: number, py: number, polygons: Point[][]): boolean {
  let winding = 0;
  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      if (y1 <= py) {
        if (y2 > py && (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) > 0) winding++;
      } else if (y2 <= py && (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) < 0) {
        winding--;
      }
    }
  }
  return winding !== 0;
}

/** Rasterize a 24×24 path into a size×size on/off grid. */
function rasterize(d: string, size: number): boolean[][] {
  const polygons = toPolygons(d);
  const SS = 4; // samples per pixel, per axis
  const pad = 0.06;
  const scale = (24 * (1 + pad * 2)) / size;
  const offset = -24 * pad;

  const grid: boolean[][] = [];
  for (let gy = 0; gy < size; gy++) {
    const row: boolean[] = [];
    for (let gx = 0; gx < size; gx++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = offset + (gx + (sx + 0.5) / SS) * scale;
          const py = offset + (gy + (sy + 0.5) / SS) * scale;
          if (inside(px, py, polygons)) hits++;
        }
      }
      row.push(hits / (SS * SS) > 0.45);
    }
    grid.push(row);
  }
  return grid;
}

/** One SVG subpath per horizontal run of "on" pixels. */
export function toPixelPath(grid: boolean[][]): string {
  const parts: string[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x++;
        continue;
      }
      const start = x;
      while (x < row.length && row[x]) x++;
      parts.push(`M${start} ${y}h${x - start}v1h${start - x}z`);
    }
  });
  return parts.join('');
}

// --- Fallback ---------------------------------------------------------------

/** Mirrored 5×5 pattern seeded by text, scaled to size×size. */
function identicon(seed: string, size: number): boolean[][] {
  let h = 0x811c9dc5;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const cells: boolean[][] = [];
  for (let r = 0; r < 5; r++) {
    const half = [0, 1, 2].map((c) => ((h >>> (r * 3 + c)) & 1) === 1);
    cells.push([half[0], half[1], half[2], half[1], half[0]]);
  }
  const cell = size / 5;
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => cells[Math.floor(y / cell)][Math.floor(x / cell)])
  );
}

// --- Color ------------------------------------------------------------------

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Brand color, unless it's too dark to read on the terminal background. */
function brandColor(hex: string): string {
  const background = luminance('0a0a0a');
  const contrast = (luminance(hex) + 0.05) / (background + 0.05);
  return contrast >= 3 ? `#${hex}` : 'var(--color-text)';
}

// --- Public -----------------------------------------------------------------

export const SIZE = 20; // pixels per side, i.e. 20 columns × 10 rows of half-blocks

/**
 * Logo for a project: an explicit `logo` slug wins, otherwise the first tag
 * that matches a Simple Icons logo. Falls back to a pattern from the title.
 */
export function terminalLogo(title: string, tags: string[], logo?: string): TerminalLogo {
  const icon = [logo, ...tags].filter(Boolean).map((name) => findIcon(name!)).find(Boolean);

  if (icon) {
    return {
      size: SIZE,
      path: toPixelPath(rasterize(icon.path, SIZE)),
      label: icon.title.toLowerCase(),
      color: brandColor(icon.hex),
    };
  }

  return {
    size: SIZE,
    path: toPixelPath(identicon(title, SIZE)),
    label: tags[0]?.toLowerCase() ?? 'project',
    color: 'var(--color-primary)',
  };
}
