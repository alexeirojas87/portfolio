// Pure planning for the Matrix-style dissolve (no DOM): where each falling column starts, how fast it
// falls, and how far the navy overlay has eroded in each column. Rendering lives in BootIntro.

export interface Seed { x: number; y: number; ch: string }
export interface Stream {
  col: number;
  x: number; // column centre
  y0: number; // head start (top of its character, or above the viewport)
  speed: number; // px per second
  delay: number; // ms before it starts falling
  trail: number; // trail length in glyph cells
  seed?: string; // original typed character shown at the head for the first instants
  salt: number;
}

export function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PlanOptions {
  width: number; height: number; cell: number; durationMs: number;
  seeds: Seed[]; rng: () => number;
}

/** Fraction of the dissolve by which every stream must have left the screen. */
export const FINISH_AT = 0.88;

export function columnCount(width: number, cell: number): number { return Math.ceil(width / cell); }

export function planRain(o: PlanOptions): Stream[] {
  const { width, height, cell, durationMs, seeds, rng } = o;
  const cols = columnCount(width, cell);
  const streams: Stream[] = [];
  const finishBy = durationMs * FINISH_AT;
  const mk = (x: number, y0: number, delay: number, seed?: string): Stream => {
    const trail = 12 + Math.floor(rng() * 12);
    const col = Math.min(cols - 1, Math.max(0, Math.floor(x / cell)));
    // fast enough that this stream is fully off-screen by FINISH_AT of the dissolve
    const need = (height + trail * cell - y0) / ((finishBy - delay) / 1000);
    const speed = Math.max(380, need * (1 + rng() * 0.22));
    return { col, x: col * cell + cell / 2, y0, speed, delay, trail, seed, salt: Math.floor(rng() * 1e6) };
  };
  // every typed character breaks loose and becomes the head of a column
  for (const s of seeds) streams.push(mk(s.x, s.y, rng() * 0.18 * durationMs, s.ch));
  // extra columns fill the whole width; they start staggered so the rain builds, then thins out
  for (let c = 0; c < cols; c++) {
    const delay = rng() * 0.42 * durationMs;
    streams.push(mk(c * cell + cell / 2, -rng() * 8 * cell, delay));
    if (rng() < 0.4) streams.push(mk(c * cell + cell / 2, -rng() * 12 * cell, 0.18 * durationMs + rng() * 0.3 * durationMs));
  }
  return streams;
}

export const headY = (s: Stream, t: number) => s.y0 + (Math.max(0, t - s.delay) / 1000) * s.speed;
export const tailY = (s: Stream, t: number, cell: number) => headY(s, t) - s.trail * cell;
/** Time (ms) when the whole trail has left the bottom of the screen. */
export const finishTime = (s: Stream, height: number, cell: number) => s.delay + ((height + s.trail * cell - s.y0) / s.speed) * 1000;

/**
 * Erosion line per column: everything above it is revealed. It follows the topmost tail in the
 * column (so the page appears top-down behind the falling trails) and never moves back up.
 */
export function revealLines(streams: Stream[], cols: number, t: number, cell: number, height: number, prev: number[]): number[] {
  const out = prev.length === cols ? prev.slice() : new Array<number>(cols).fill(0);
  const top = new Array<number>(cols).fill(Infinity);
  for (const s of streams) top[s.col] = Math.min(top[s.col], tailY(s, t, cell));
  for (let c = 0; c < cols; c++) {
    const y = top[c] === Infinity ? 0 : Math.min(height, Math.max(0, top[c]));
    out[c] = Math.max(out[c], y);
  }
  return out;
}

export const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789<>{}[]=+-*/#$%&;:';

/** Deterministic flickering glyph for a trail cell. */
export function glyphFor(s: Stream, row: number, t: number): string {
  const tick = Math.floor(t / 90);
  const h = Math.imul(s.salt ^ Math.imul(row + 1, 2654435761) ^ Math.imul(tick + (row % 3 === 0 ? 0 : 7), 40503), 2246822519);
  return GLYPHS[(h >>> 7) % GLYPHS.length];
}
