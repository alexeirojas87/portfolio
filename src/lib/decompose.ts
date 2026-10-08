// Pure planning for the console decomposition (no DOM, unit-testable).
// The console screen is a grid of cells. Each cell is solid navy, then glitches into a cycling glyph,
// then detaches (the navy behind it disappears and the page shows through), then its glyph falls and
// fades. Activation follows a clustered noise + distance field that starts at the typed text.

export interface TextSeed { x: number; y: number; w: number; h: number; ch: string; row: number; cursor?: boolean }

export interface Piece {
  kind: 'cell' | 'text';
  x: number; y: number; w: number; h: number;
  act: number; // ms when it starts to glitch
  glitch: number; // ms cycling glyphs on navy
  hover: number; // ms floating over the page before it falls
  fall: number; // ms falling and fading
  drop: number; // fall distance in px
  salt: number;
  ch?: string; // text pieces: the typed character
  cursor?: boolean;
}

export type Stage = 'solid' | 'glitch' | 'detached' | 'falling' | 'done';

/** Longest possible lifetime of a piece (glitch + hover + fall maxima). */
export const MAX_LIFE_MS = 250 + 200 + 520;
/** Activation curve exponent (<1 pushes activations later: slow start, then it accelerates). */
const RAMP = 0.52;
export const TEXT_HOLD_MS = 110; // typed characters keep their own glyph briefly when they start to crumble

export function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash2 = (x: number, y: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
/** Smooth value noise in [0,1]. */
export function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed), c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export interface PlanOptions {
  width: number; height: number; cellW: number; cellH: number; durationMs: number;
  text: TextSeed[]; rng: () => number; seed?: number;
}

export function planDecompose(o: PlanOptions): Piece[] {
  const { width, height, cellW, cellH, durationMs, text, rng } = o;
  const seed = o.seed ?? 7;
  const span = Math.max(1, durationMs - MAX_LIFE_MS); // latest activation
  const cols = Math.ceil(width / cellW), rows = Math.ceil(height / cellH);

  // distance field from the typed-text block
  const real = text.length ? text : [{ x: 0, y: 0, w: 1, h: 1, ch: '', row: 0 }];
  const bx1 = Math.min(...real.map((t) => t.x)), by1 = Math.min(...real.map((t) => t.y));
  const bx2 = Math.max(...real.map((t) => t.x + t.w)), by2 = Math.max(...real.map((t) => t.y + t.h));
  const dMax = Math.hypot(Math.max(bx1, width - bx2), Math.max(by1, height - by2)) || 1;

  const raw: { i: number; v: number }[] = [];
  const pieces: Piece[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW, y = r * cellH;
      const cx = x + cellW / 2, cy = y + cellH / 2;
      const dx = Math.max(0, bx1 - cx, cx - bx2), dy = Math.max(0, by1 - cy, cy - by2);
      const d = Math.hypot(dx, dy) / dMax;
      // clusters (two noise octaves) bend the distance wave so holes grow and merge
      const n = valueNoise(cx / 110, cy / 110, seed) * 0.7 + valueNoise(cx / 45, cy / 45, seed + 1) * 0.3;
      raw.push({ i: pieces.length, v: d * 0.4 + n * 0.75 + rng() * 0.04 });
      pieces.push(mk('cell', x, y, cellW, cellH));
    }
  }
  // rank-normalise, then bend the curve so it starts slowly and builds: about half of the page is open at
  // the midpoint and the last scattered cells crumble at the end
  raw.sort((a, b) => a.v - b.v);
  raw.forEach((e, rank) => { pieces[e.i].act = Math.pow(rank / Math.max(1, raw.length - 1), RAMP) * span; });

  // the terminal lines crumble first, line by line
  for (const t of text) {
    const p = mk('text', t.x, t.y, t.w, t.h);
    p.ch = t.ch; p.cursor = t.cursor;
    p.act = (t.row * 0.022 + rng() * 0.045) * span;
    pieces.push(p);
  }
  return pieces;

  function mk(kind: 'cell' | 'text', x: number, y: number, w: number, h: number): Piece {
    return {
      kind, x, y, w, h, act: 0,
      glitch: 100 + rng() * 150, hover: 60 + rng() * 140, fall: 380 + rng() * 140,
      drop: h * (2.5 + rng() * 3), salt: Math.floor(rng() * 1e6),
    };
  }
}

export const lifeOf = (p: Piece) => p.glitch + p.hover + p.fall;
export const endOf = (p: Piece) => p.act + lifeOf(p);

export function stageAt(p: Piece, t: number): { stage: Stage; p: number } {
  const dt = t - p.act;
  if (dt < 0) return { stage: 'solid', p: 0 };
  if (dt < p.glitch) return { stage: 'glitch', p: dt / p.glitch };
  if (dt < p.glitch + p.hover) return { stage: 'detached', p: (dt - p.glitch) / p.hover };
  if (dt < lifeOf(p)) return { stage: 'falling', p: (dt - p.glitch - p.hover) / p.fall };
  return { stage: 'done', p: 1 };
}

/** Whether the navy behind this piece is gone (the page shows through). */
export const isOpen = (p: Piece, t: number) => t - p.act >= p.glitch;

/** Share of grid cells whose navy is gone at time t. */
export function openFraction(pieces: Piece[], t: number): number {
  let n = 0, open = 0;
  for (const p of pieces) { if (p.kind !== 'cell') continue; n++; if (isOpen(p, t)) open++; }
  return n ? open / n : 1;
}

export const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789<>{}[]=+-*/#$%&;:';
export const GLYPH_TICK_MS = 70;

/** Deterministic cycling glyph index for a piece. */
export function glyphIndex(p: Piece, t: number): number {
  const tick = Math.floor(Math.max(0, t - p.act) / GLYPH_TICK_MS);
  return (Math.imul(p.salt ^ Math.imul(tick + 1, 2654435761), 2246822519) >>> 9) % GLYPHS.length;
}

/** Fall offset in px and opacity for the falling stage. */
export function fallState(p: Piece, prog: number): { dy: number; alpha: number } {
  const e = Math.pow(prog, 1.6);
  return { dy: p.drop * e, alpha: 1 - prog };
}
