// Orthogonal edge router: A* on an 8px grid with node rectangles as obstacles.
// Costs favour few turns, discourage overlapping other edges, and mildly penalize crossings,
// so curated node positions produce clean, mostly crossing-free paths. Deterministic.

export interface Point { x: number; y: number }
export interface Rect { x: number; y: number; w: number; h: number }
/** Outward normal of the node side an edge attaches to. */
export type Dir = 'right' | 'left' | 'down' | 'up';
export interface RouteRequest { id: string; start: Point; startDir: Dir; end: Point; endDir: Dir }

export const GRID = 8;
const VEC: Record<Dir, [number, number]> = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] };
const DIRS: Dir[] = ['right', 'left', 'down', 'up'];
const OPP: Record<Dir, Dir> = { right: 'left', left: 'right', down: 'up', up: 'down' };
const TURN = 5, OVERLAP = 14, CROSS = 6, NEAR = 1.5;

export function routeEdges(
  reqs: RouteRequest[], obstacles: Rect[], bounds: { w: number; h: number },
): Map<string, Point[]> {
  const cols = Math.ceil(bounds.w / GRID) + 2;
  const rows = Math.ceil(bounds.h / GRID) + 2;
  const blocked = new Uint8Array(cols * rows);
  for (const r of obstacles) {
    for (let cy = Math.ceil(r.y / GRID); cy <= Math.floor((r.y + r.h) / GRID); cy++)
      for (let cx = Math.ceil(r.x / GRID); cx <= Math.floor((r.x + r.w) / GRID); cx++)
        if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) blocked[cy * cols + cx] = 1;
  }
  const near = new Uint8Array(cols * rows);
  for (let cy = 0; cy < rows; cy++)
    for (let cx = 0; cx < cols; cx++) {
      const i = cy * cols + cx;
      if (blocked[i]) continue;
      if ((cx > 0 && blocked[i - 1]) || (cx < cols - 1 && blocked[i + 1]) ||
          (cy > 0 && blocked[i - cols]) || (cy < rows - 1 && blocked[i + cols])) near[i] = 1;
    }
  const usedH = new Uint8Array(cols * rows);
  const usedV = new Uint8Array(cols * rows);

  // Short edges first so long ones route around them.
  const order = reqs
    .map((r, i) => ({ r, i, len: Math.abs(r.start.x - r.end.x) + Math.abs(r.start.y - r.end.y) }))
    .sort((a, b) => a.len - b.len || a.i - b.i);

  const out = new Map<string, Point[]>();
  for (const { r } of order) {
    const cells = astar(r);
    const pts = compress([r.start, ...cells, r.end]);
    out.set(r.id, pts);
    for (let k = 1; k < pts.length - 1; k++) mark(pts[k - 1], pts[k]);
  }
  return out;

  function mark(a: Point, b: Point) {
    const h = a.y === b.y;
    const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) / GRID;
    for (let s = 0; s <= n; s++) {
      const cx = (a.x + Math.sign(b.x - a.x) * s * GRID) / GRID;
      const cy = (a.y + Math.sign(b.y - a.y) * s * GRID) / GRID;
      const i = cy * cols + cx;
      if (i >= 0 && i < usedH.length) (h ? usedH : usedV)[i] = 1;
    }
  }

  function astar(r: RouteRequest): Point[] {
    const sv = VEC[r.startDir], ev = VEC[r.endDir];
    const sx = Math.round((r.start.x + sv[0] * GRID) / GRID), sy = Math.round((r.start.y + sv[1] * GRID) / GRID);
    const ex = Math.round((r.end.x + ev[0] * GRID) / GRID), ey = Math.round((r.end.y + ev[1] * GRID) / GRID);
    const total = cols * rows * 4;
    const dist = new Float32Array(total).fill(Infinity);
    const parent = new Int32Array(total).fill(-1);
    const heap = new Heap();
    const s0 = (sy * cols + sx) * 4 + DIRS.indexOf(r.startDir);
    dist[s0] = 0;
    heap.push(h(sx, sy), s0);
    const intoNode = DIRS.indexOf(OPP[r.endDir]);
    let goal = -1;
    while (heap.size) {
      const cur = heap.pop();
      const d = cur % 4, cell = (cur - d) / 4;
      const cx = cell % cols, cy = (cell - cx) / cols;
      if (cx === ex && cy === ey) { goal = cur; break; }
      const base = dist[cur];
      for (let nd = 0; nd < 4; nd++) {
        if (DIRS[nd] === OPP[DIRS[d]]) continue;
        const nx = cx + VEC[DIRS[nd]][0], ny = cy + VEC[DIRS[nd]][1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (blocked[ni]) continue;
        let c = 1 + (nd !== d ? TURN : 0) + (near[ni] ? NEAR : 0);
        const horiz = nd < 2;
        if (horiz) { if (usedH[ni]) c += OVERLAP; if (usedV[ni]) c += CROSS; }
        else { if (usedV[ni]) c += OVERLAP; if (usedH[ni]) c += CROSS; }
        if (nx === ex && ny === ey && nd !== intoNode) c += TURN;
        const key = ni * 4 + nd;
        const nd2 = base + c;
        if (nd2 < dist[key]) { dist[key] = nd2; parent[key] = cur; heap.push(nd2 + h(nx, ny), key); }
      }
    }
    if (goal < 0) return fallback(r);
    const cells: Point[] = [];
    for (let k = goal; k >= 0; k = parent[k]) {
      const cell = (k - (k % 4)) / 4;
      cells.push({ x: (cell % cols) * GRID, y: Math.floor(cell / cols) * GRID });
    }
    return cells.reverse();
    function h(x: number, y: number) { return Math.abs(x - ex) + Math.abs(y - ey); }
  }

  function fallback(r: RouteRequest): Point[] {
    const a = { x: r.start.x + VEC[r.startDir][0] * GRID, y: r.start.y + VEC[r.startDir][1] * GRID };
    const b = { x: r.end.x + VEC[r.endDir][0] * GRID, y: r.end.y + VEC[r.endDir][1] * GRID };
    return [a, { x: b.x, y: a.y }, b];
  }
}

/** Drop duplicate and collinear points. */
export function compress(pts: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (last && last.x === p.x && last.y === p.y) continue;
    out.push(p);
  }
  const res: Point[] = [];
  for (let i = 0; i < out.length; i++) {
    const a = res[res.length - 1], b = out[i], c = out[i + 1];
    if (a && c && ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y))) continue;
    res.push(b);
  }
  return res;
}

/** SVG path through the points with rounded corners. */
export function roundedPath(pts: Point[], radius = 10): string {
  if (pts.length === 0) return '';
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1], c = pts[i], n = pts[i + 1];
    const din = Math.hypot(c.x - p.x, c.y - p.y), dout = Math.hypot(n.x - c.x, n.y - c.y);
    const r = Math.min(radius, din / 2, dout / 2);
    const a = { x: c.x - Math.sign(c.x - p.x) * r, y: c.y - Math.sign(c.y - p.y) * r };
    const b = { x: c.x + Math.sign(n.x - c.x) * r, y: c.y + Math.sign(n.y - c.y) * r };
    d += ` L${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last.x} ${last.y}`;
}

/** Midpoint of the longest segment: a straight spot for badges and labels. */
export function labelAnchor(pts: Point[]): Point & { len: number } {
  let best = { len: -1, x: pts[0].x, y: pts[0].y };
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (len > best.len) best = { len, x: (pts[i].x + pts[i - 1].x) / 2, y: (pts[i].y + pts[i - 1].y) / 2 };
  }
  return { x: best.x, y: best.y, len: best.len };
}

class Heap {
  private k: number[] = [];
  private v: number[] = [];
  get size() { return this.k.length; }
  push(key: number, val: number) {
    let i = this.k.length;
    this.k.push(key); this.v.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.k[p] <= this.k[i]) break;
      this.swap(i, p); i = p;
    }
  }
  pop(): number {
    const top = this.v[0];
    const lk = this.k.pop()!, lv = this.v.pop()!;
    if (this.k.length) {
      this.k[0] = lk; this.v[0] = lv;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < this.k.length && this.k[l] < this.k[m]) m = l;
        if (r < this.k.length && this.k[r] < this.k[m]) m = r;
        if (m === i) break;
        this.swap(i, m); i = m;
      }
    }
    return top;
  }
  private swap(a: number, b: number) {
    [this.k[a], this.k[b]] = [this.k[b], this.k[a]];
    [this.v[a], this.v[b]] = [this.v[b], this.v[a]];
  }
}
