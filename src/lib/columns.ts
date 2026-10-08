// Pure planning for the "console drains into falling binary columns" dissolve (no DOM, unit-testable).
// The navy overlay is split into columns one glyph wide. Each column drains downward: above its falling
// edge the page is clean, below it the navy remains. Binary glyph streams (drops) live only on navy.

export const GLYPHS = '01';
export const SOFT_ROWS = 3; // the drained edge fades over this many glyph heights
export const FINISH_AT = 0.92; // every column is fully drained by this share of the dissolve

export interface Column {
  index: number;
  x: number; // left edge
  cx: number; // centre
  start: number; // ms
  speed: number; // px/s of the drain edge
  fromText: boolean;
  salt: number;
}

/** A glyph stream with a bright head (bottom) and a fading trail above it. Drawn only on navy. */
export interface Drop {
  layer: 0 | 1 | 2; // 0 back, 1 middle, 2 front
  x: number; // centre
  col: number; // front column index whose drain edge clips it
  start: number; // ms
  speed: number; // px/s
  y0: number;
  trail: number; // glyphs
  cell: number; // glyph advance (smaller for back layers)
  row: number; // glyph row height
  alpha: number; // layer brightness
  salt: number;
}

export const LAYER = [
  { scale: 0.62, speed: 0.55, alpha: 0.32 },
  { scale: 0.8, speed: 0.8, alpha: 0.55 },
  { scale: 1, speed: 1.9, alpha: 1 },
] as const;

export function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PlanOptions {
  width: number; height: number; cellW: number; cellH: number; durationMs: number;
  /** x-centres of the typed characters (their columns start first and spread outward). */
  textXs: number[];
  rng: () => number;
}

export interface Plan { columns: Column[]; drops: Drop[]; cellW: number; cellH: number }

export function planColumns(o: PlanOptions): Plan {
  const { width, height, cellW, cellH, durationMs, textXs, rng } = o;
  const n = Math.ceil(width / cellW);
  const hasText = textXs.length > 0;
  const tMin = hasText ? Math.min(...textXs) : width / 2;
  const tMax = hasText ? Math.max(...textXs) : width / 2;
  const textCols = new Set(textXs.map((x) => Math.min(n - 1, Math.floor(x / cellW))));
  const dist = (cx: number) => Math.max(0, tMin - cx, cx - tMax);
  const maxDist = Math.max(1, ...Array.from({ length: n }, (_, c) => dist(c * cellW + cellW / 2)));
  const startSpan = durationMs * 0.42;
  const reach = height + cellH * (SOFT_ROWS + 1);
  const columns: Column[] = [];
  for (let c = 0; c < n; c++) {
    const cx = c * cellW + cellW / 2;
    const fromText = textCols.has(c);
    // wave outward from the text, jittered so it never looks like a clean sweep
    const start = fromText ? rng() * durationMs * 0.05 : Math.min(startSpan, 60 + (dist(cx) / maxDist) * startSpan * 0.85 + rng() * durationMs * 0.12);
    const need = reach / (Math.max(200, durationMs * FINISH_AT - start) / 1000);
    columns.push({ index: c, x: c * cellW, cx, start, speed: need * (1 + rng() * 0.28), fromText, salt: Math.floor(rng() * 1e6) });
  }
  const drops: Drop[] = [];
  for (const col of columns) {
    // front layer: one fast drop inside the navy right behind the edge
    drops.push(mkDrop(2, col, col.cx, col.start, col.speed * LAYER[2].speed, 1));
    if (rng() < 0.55) drops.push(mkDrop(2, col, col.cx, col.start + 160 + rng() * 380, col.speed * LAYER[2].speed * 0.85, 1));
  }
  // back layers: narrower columns that fall slower and dimmer, over navy only
  for (const L of [0, 1] as const) {
    const cw = cellW * LAYER[L].scale;
    const m = Math.ceil(width / cw);
    for (let k = 0; k < m; k++) {
      const x = k * cw + cw / 2;
      const col = columns[Math.min(n - 1, Math.floor(x / cellW))];
      if (rng() < 0.7) drops.push(mkDrop(L, col, x, col.start + rng() * 420, 220 * LAYER[L].speed * (0.8 + rng() * 0.8) * (height / 700), LAYER[L].scale));
    }
  }
  return { columns, drops, cellW, cellH };

  function mkDrop(layer: 0 | 1 | 2, col: Column, x: number, start: number, speed: number, scale: number): Drop {
    const trail = 12 + Math.floor(rng() * 14);
    return { layer, x, col: col.index, start, speed, y0: -rng() * cellH * 4, trail, cell: cellW * scale, row: cellH * scale, alpha: LAYER[layer].alpha, salt: Math.floor(rng() * 1e6) };
  }
}

/** y of the drain edge (top of the navy) for a column. */
export const edgeY = (c: Column, t: number, cellH: number) => -cellH * SOFT_ROWS + (Math.max(0, t - c.start) / 1000) * c.speed;

export const isDrained = (c: Column, t: number, cellH: number, height: number) => edgeY(c, t, cellH) >= height;

/** Top of the region where glyphs may be drawn: the navy is opaque from here down. */
export const navyTop = (c: Column, t: number, cellH: number) => edgeY(c, t, cellH) + cellH * SOFT_ROWS;

export const dropHeadY = (d: Drop, t: number) => d.y0 + (Math.max(0, t - d.start) / 1000) * d.speed;

/** Rows (y positions, head first) a drop wants to draw, already clipped to the navy (y >= navyTop). */
export function dropRows(d: Drop, t: number, clipTop: number): { y: number; i: number }[] {
  const out: { y: number; i: number }[] = [];
  if (t < d.start) return out;
  const head = dropHeadY(d, t);
  for (let i = 0; i < d.trail; i++) {
    const y = head - i * d.row;
    if (y < clipTop) break; // everything further up the trail is above the navy edge
    out.push({ y, i });
  }
  return out;
}

/** Binary glyph that flickers now and then (0 or 1). */
export function glyphAt(salt: number, row: number, t: number): 0 | 1 {
  const slot = Math.floor(t / 90);
  const flick = (Math.imul(salt ^ Math.imul(row + 3, 2654435761), 2246822519) >>> 11) % 5 === 0;
  const h = Math.imul(salt ^ Math.imul(row + 1, 40503) ^ Math.imul(flick ? slot : 0, 2654435761), 2246822519);
  return ((h >>> 13) & 1) as 0 | 1;
}

/** Share of columns whose edge has left the top of the screen... i.e. how much of the page is clear. */
export function clearFraction(plan: Plan, t: number, height: number): number {
  let sum = 0;
  for (const c of plan.columns) sum += Math.min(1, Math.max(0, (edgeY(c, t, plan.cellH) + plan.cellH * SOFT_ROWS) / height));
  return sum / plan.columns.length;
}
