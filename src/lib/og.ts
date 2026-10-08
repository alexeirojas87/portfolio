// Build-time Open Graph cards (1200x630) with satori + resvg, in the site's design tokens and fonts.
import './node-shim.ts';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import { computeCurated } from '../components/diagram/curated.ts';
import { CLASS_COLOR, KIND_CLASS } from '../components/diagram/kinds.ts';
import { isCurated, type Architecture, type Locale } from '../components/diagram/types.ts';

// satori initialises WASM at import time and needs the shim first, so load it lazily.
const loadSatori = async () => (await import('satori')).default;

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`${pkg}/files/${file}`));

let fontsCache: { name: string; data: Buffer; weight: 400 | 500 | 800; style: 'normal' }[] | null = null;
const fonts = () =>
  (fontsCache ??= [
    { name: 'Archivo', data: font('@fontsource/archivo', 'archivo-latin-800-normal.woff'), weight: 800, style: 'normal' },
    { name: 'IBM Plex Sans', data: font('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'IBM Plex Sans', data: font('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'), weight: 500, style: 'normal' },
  ]);

const T = { canvas: '#0F1B2D', line: '#2A3B55', text: '#E8EEF8', muted: '#9FB0C8', cobalt: '#2F5BEA', page: '#EEF1F6' };

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type, props: { style: { display: 'flex', ...style }, children, ...extra },
});

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** Mini rendering of an architecture: kind-colored nodes and edges, no text. Returns an SVG data URI and its aspect ratio. */
export function diagramSvg(arch: Architecture, locale: Locale): { uri: string; ratio: number } | null {
  if (!isCurated(arch)) return null;
  const l = computeCurated(arch, locale, { orientation: 'horizontal', compact: true });
  const { x, y, w, h: vh } = l.vb;
  const edges = l.edges.map((e) => `<path d="${e.d}" fill="none" stroke="${e.async ? '#c99a45' : '#6580aa'}" stroke-width="3.2" ${e.async ? 'stroke-dasharray="9 7"' : ''} stroke-linecap="round"/>`).join('');
  const nodes = l.nodes
    .map((n) => {
      const c = CLASS_COLOR[KIND_CLASS[n.node.kind]];
      const dash = n.owned ? '' : 'stroke-dasharray="8 6"';
      return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="18" fill="${rgba(c, 0.22)}" stroke="${c}" stroke-width="3" ${dash}/><rect x="${n.x + n.w / 2 - 16}" y="${n.y + n.h / 2 - 7}" width="32" height="14" rx="7" fill="${c}"/>`;
    })
    .join('');
  const b = l.boundary;
  const boundary = b ? `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="26" fill="rgba(79,122,255,0.05)" stroke="#4f7aff" stroke-opacity="0.6" stroke-width="3" stroke-dasharray="4 12" stroke-linecap="round"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${vh}" width="${w}" height="${vh}">${boundary}${edges}${nodes}</svg>`;
  return { uri: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, ratio: w / vh };
}

const grid = () =>
  h('div', {
    position: 'absolute', top: 0, left: 0, width: 1200, height: 630,
    backgroundImage: `linear-gradient(${rgba('#ffffff', 0.035)} 1px, transparent 1px), linear-gradient(90deg, ${rgba('#ffffff', 0.035)} 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  });

const brand = (label: string) =>
  h('div', { alignItems: 'center', gap: 14, fontFamily: 'JetBrains Mono', fontSize: 22, color: T.muted, letterSpacing: 2 }, [
    h('div', { width: 14, height: 14, borderRadius: 7, background: T.cobalt }),
    h('div', {}, label),
  ]);

export interface CardInput {
  eyebrow: string; title: string; subtitle: string; brand: string; diagram?: { uri: string; ratio: number } | null; chips?: string[];
}

export async function renderCard(c: CardInput): Promise<Buffer> {
  const hasDiagram = !!c.diagram;
  const textW = hasDiagram ? 560 : 1000;
  const titleSize = c.title.length > 34 ? 52 : c.title.length > 22 ? 62 : 80;
  const dW = 480, dH = c.diagram ? Math.min(380, Math.round(dW / c.diagram.ratio)) : 0;
  const tree = h('div', { width: 1200, height: 630, position: 'relative', background: T.canvas, color: T.text, fontFamily: 'IBM Plex Sans', flexDirection: 'column', padding: '56px 64px', justifyContent: 'space-between' }, [
    grid(),
    brand(c.brand),
    h('div', { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 }, [
      h('div', { flexDirection: 'column', width: textW, gap: 22 }, [
        h('div', { fontFamily: 'JetBrains Mono', fontSize: 22, color: '#9db8ff', letterSpacing: 3, textTransform: 'uppercase' }, c.eyebrow),
        h('div', { fontFamily: 'Archivo', fontWeight: 800, fontSize: titleSize, lineHeight: 1.04, letterSpacing: -1.5, color: '#ffffff' }, c.title),
        h('div', { fontSize: 28, lineHeight: 1.35, color: T.muted }, c.subtitle),
      ]),
      ...(c.diagram
        ? [h('div', { width: dW + 40, height: dH + 40, alignItems: 'center', justifyContent: 'center', borderRadius: 28, border: `2px solid ${T.line}`, background: rgba('#ffffff', 0.03) }, [
            { type: 'img', props: { src: c.diagram.uri, width: dW, height: dH } },
          ])]
        : []),
    ]),
    h('div', { gap: 10, flexWrap: 'wrap' }, (c.chips ?? []).map((t) =>
      h('div', { fontFamily: 'JetBrains Mono', fontSize: 20, padding: '6px 16px', borderRadius: 999, border: `1.5px solid ${T.line}`, color: T.text, background: rgba('#ffffff', 0.05) }, t))),
  ]);
  const satori = await loadSatori();
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: fonts() });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}

/** Monogram favicon as SVG (text converted to paths by satori) for the icon generator. */
export async function monogramSvg(size: number, rounded: boolean): Promise<string> {
  const tree = h('div', { width: size, height: size, background: T.canvas, alignItems: 'center', justifyContent: 'center', borderRadius: rounded ? size * 0.22 : 0, fontFamily: 'Archivo', fontWeight: 800, fontSize: size * 0.5, letterSpacing: -size * 0.02, color: '#ffffff' }, [
    h('div', { color: '#ffffff' }, 'A'), h('div', { color: '#7fa2ff' }, 'R'),
  ]);
  const satori = await loadSatori();
  return satori(tree as never, { width: size, height: size, fonts: fonts() });
}
