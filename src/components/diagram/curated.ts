import { isOwned, type Architecture, type ArchNode, type Locale } from './types.ts';
import { compress, labelAnchor, roundedPath, routeEdges, GRID, type Dir, type Point, type Rect, type RouteRequest } from './route.ts';

// Curated layout: nodes carry an authored { col, row } grid position so the primary request path
// reads left to right on one row. `vertical` transposes the grid (col -> y, row -> x) so the same
// flow reads top to bottom on phones.

export type Orientation = 'horizontal' | 'vertical';

export interface CuratedOptions {
  orientation: Orientation;
  /** Node width; vertical mode derives it from the available width. */
  nodeW?: number;
  compact?: boolean;
}

export interface CNode { id: string; node: ArchNode; x: number; y: number; w: number; h: number; owned: boolean }
export interface CEdge {
  id: string; from: string; to: string; async: boolean;
  points: Point[]; d: string; anchor: Point & { len: number };
}
export interface CuratedLayout {
  width: number; height: number; orientation: Orientation;
  /** Content-fitted view box: crops empty canvas around the drawing. */
  vb: Rect;
  nodes: CNode[]; boundary: Rect | null; edges: CEdge[];
}

const PAD = 16, PAD_TOP = 32;

export function curatedDims(o: CuratedOptions) {
  if (o.compact) return { nodeW: 160, nodeH: 112, gapAlong: 40, gapAcross: 40, margin: 32 };
  if (o.orientation === 'horizontal') return { nodeW: 160, nodeH: 112, gapAlong: 40, gapAcross: 40, margin: 32 };
  const nodeW = o.nodeW ?? 144;
  // Narrow cards (phones) drop the sublabel, so they can be shorter.
  return { nodeW, nodeH: nodeW < 120 ? 96 : 112, gapAlong: 40, gapAcross: 16, margin: 16 };
}

/** Column count when transposed, and the node width that fits `width` px without scrolling. */
export function fitNodeW(rows: number, width: number): number {
  const PADS = 2 * PAD + 16;
  const w = Math.floor((width - PADS - (rows - 1) * 16) / rows / 8) * 8;
  return Math.max(96, Math.min(176, w));
}

/** Number of distinct grid rows: the column count when transposed. */
export const gridRows = (arch: Architecture): number =>
  new Set(arch.nodes.map((n) => n.pos!.row)).size;

export function boundaryRect(nodes: { x: number; y: number; w: number; h: number; owned: boolean }[]): Rect | null {
  const o = nodes.filter((n) => n.owned);
  if (o.length === 0 || o.length === nodes.length) return null;
  const x1 = Math.min(...o.map((n) => n.x)), y1 = Math.min(...o.map((n) => n.y));
  const x2 = Math.max(...o.map((n) => n.x + n.w)), y2 = Math.max(...o.map((n) => n.y + n.h));
  return { x: x1 - PAD, y: y1 - PAD_TOP, w: x2 - x1 + PAD * 2, h: y2 - y1 + PAD_TOP + PAD };
}

export function computeCurated(arch: Architecture, _locale: Locale, opts: CuratedOptions): CuratedLayout {
  const D = curatedDims(opts);
  const minCol = Math.min(...arch.nodes.map((n) => n.pos!.col));
  const minRow = Math.min(...arch.nodes.map((n) => n.pos!.row));
  const vertical = opts.orientation === 'vertical' && !opts.compact;
  const cellW = D.nodeW + (vertical ? D.gapAcross : D.gapAlong);
  const cellH = D.nodeH + (vertical ? D.gapAlong : D.gapAcross);
  const snap = (n: number) => Math.round(n / GRID) * GRID;

  const nodes: CNode[] = arch.nodes.map((node) => {
    const c = node.pos!.col - minCol, r = node.pos!.row - minRow;
    const x = D.margin + (vertical ? r : c) * cellW;
    const y = D.margin + (vertical ? c : r) * cellH;
    return { id: node.id, node, x: snap(x), y: snap(y), w: D.nodeW, h: D.nodeH, owned: isOwned(node) };
  });
  const boundary = boundaryRect(nodes);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const maxX = Math.max(...nodes.map((n) => n.x + n.w));
  const maxY = Math.max(...nodes.map((n) => n.y + n.h));
  const width = Math.max(maxX, boundary ? boundary.x + boundary.w : 0) + D.margin;
  const height = Math.max(maxY, boundary ? boundary.y + boundary.h : 0) + D.margin;

  // Attach each edge to the node side that faces its other end, spreading parallel attachments.
  const edges = arch.edges.filter((e) => byId.has(e.from) && byId.has(e.to));
  const side = (a: CNode, b: CNode): Dir => {
    const dx = (b.x + b.w / 2 - (a.x + a.w / 2)) / cellW;
    const dy = (b.y + b.h / 2 - (a.y + a.h / 2)) / cellH;
    return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : dy >= 0 ? 'down' : 'up';
  };
  const slots = new Map<string, { id: string; key: number }[]>();
  const sides = new Map<string, { from: Dir; to: Dir }>();
  for (const e of edges) {
    const a = byId.get(e.from)!, b = byId.get(e.to)!;
    const sa = side(a, b), sb = side(b, a);
    sides.set(e.id, { from: sa, to: sb });
    const push = (n: CNode, s: Dir, other: CNode) => {
      const k = `${n.id}:${s}`;
      const list = slots.get(k) ?? [];
      list.push({ id: e.id, key: s === 'left' || s === 'right' ? other.y + other.h / 2 : other.x + other.w / 2 });
      slots.set(k, list);
    };
    push(a, sa, b); push(b, sb, a);
  }
  const anchor = (n: CNode, s: Dir, edgeId: string): Point => {
    const list = [...(slots.get(`${n.id}:${s}`) ?? [])].sort((p, q) => p.key - q.key || (p.id < q.id ? -1 : 1));
    const i = list.findIndex((x) => x.id === edgeId);
    const off = (i - (list.length - 1) / 2) * 16;
    const cx = snap(n.x + n.w / 2), cy = snap(n.y + n.h / 2);
    switch (s) {
      case 'right': return { x: n.x + n.w, y: cy + off };
      case 'left': return { x: n.x, y: cy + off };
      case 'down': return { x: cx + off, y: n.y + n.h };
      case 'up': return { x: cx + off, y: n.y };
    }
  };
  const reqs: RouteRequest[] = edges.map((e) => {
    const a = byId.get(e.from)!, b = byId.get(e.to)!, s = sides.get(e.id)!;
    return { id: e.id, start: anchor(a, s.from, e.id), startDir: s.from, end: anchor(b, s.to, e.id), endDir: s.to };
  });
  const routes = routeEdges(reqs, nodes, { w: width, h: height });
  const cedges: CEdge[] = edges.map((e) => {
    const pts = compress(routes.get(e.id)!);
    return { id: e.id, from: e.from, to: e.to, async: e.async, points: pts, d: roundedPath(pts, 10), anchor: labelAnchor(pts) };
  });
  const xs: number[] = [], ys: number[] = [];
  for (const n of nodes) { xs.push(n.x, n.x + n.w); ys.push(n.y, n.y + n.h); }
  if (boundary) { xs.push(boundary.x, boundary.x + boundary.w); ys.push(boundary.y, boundary.y + boundary.h); }
  for (const e of cedges) for (const p of e.points) { xs.push(p.x); ys.push(p.y); }
  const VP = 12;
  const vx = Math.min(...xs) - VP, vy = Math.min(...ys) - VP;
  const vb = { x: vx, y: vy, w: Math.max(...xs) + VP - vx, h: Math.max(...ys) + VP - vy };
  return { width: vb.w, height: vb.h, orientation: vertical ? 'vertical' : 'horizontal', vb, nodes, boundary, edges: cedges };
}

/** True when a polyline passes through the interior of any rectangle. */
export function crossesRect(pts: Point[], rects: Rect[]): boolean {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x), y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
    for (const r of rects) {
      if (x2 > r.x && x1 < r.x + r.w && y2 > r.y && y1 < r.y + r.h) return true;
    }
  }
  return false;
}
