import type { Point, Rect } from './route.ts';

// Badge placement for the curated diagram: a numbered dot for every step, and a full label pill
// only for the edges that ask for one (active step, hovered or emphasised edge). Every badge is
// put on a free spot of its own route: clear of nodes and of every other badge. If a pill has no
// free spot it is dropped (the caption line carries the text), never truncated or overlapped.

export interface BadgeRequest { id: string; points: Point[]; pill?: { w: number; h?: number } }
export interface PlacedBadge { id: string; kind: 'dot' | 'pill'; x: number; y: number; w: number; h: number }

export const DOT = 24;
export const PILL_H = 24;
const SMALL = 18;
const NODE_CLEARANCE = 6;
const BADGE_CLEARANCE = 3;

const inflate = (r: Rect, d: number): Rect => ({ x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d });
export const rectsOverlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

interface Seg { a: Point; b: Point; len: number }
const segments = (pts: Point[]): Seg[] => {
  const out: Seg[] = [];
  for (let i = 1; i < pts.length; i++) out.push({ a: pts[i - 1], b: pts[i], len: Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) });
  return out;
};

function candidates(pts: Point[], margin: number, side?: { w: number; h: number }): Point[] {
  const out: { p: Point; score: number }[] = [];
  for (const s of segments(pts)) {
    if (s.len < 1) continue;
    const usable = s.len - 2 * margin;
    const steps = usable > 0 ? Math.floor(usable / 8) : 0;
    const mid = { x: (s.a.x + s.b.x) / 2, y: (s.a.y + s.b.y) / 2 };
    const ux = (s.b.x - s.a.x) / s.len, uy = (s.b.y - s.a.y) / s.len;
    // Positions from the middle outwards; longer segments first.
    for (let k = 0; k <= steps; k++) {
      for (const sign of k === 0 ? [0] : [1, -1]) {
        const off = sign * k * 4;
        const base = { x: mid.x + ux * off, y: mid.y + uy * off };
        out.push({ p: base, score: -s.len * 10 + Math.abs(off) });
        if (side) {
          // Beside the line (above/below a horizontal run, left/right of a vertical one).
          const gap = (Math.abs(uy) > Math.abs(ux) ? side.w : side.h) / 2 + 8;
          for (const d of [gap, -gap]) {
            out.push({ p: { x: base.x + -uy * d, y: base.y + ux * d }, score: -s.len * 10 + Math.abs(off) + 4000 });
          }
        }
      }
    }
    if (steps === 0) out.push({ p: mid, score: -s.len * 10 + 5000 });
  }
  return out.sort((x, y) => x.score - y.score).map((c) => c.p);
}

export function placeBadges(reqs: BadgeRequest[], nodes: Rect[]): Map<string, PlacedBadge> {
  // Every step must keep its dot. If a pill leaves a dot without room, drop the lowest-priority
  // pill (its text then lives in the caption line only) and try again.
  let current = reqs;
  for (;;) {
    const placed = placeOnce(current, nodes);
    if (current.every((r) => placed.has(r.id))) return placed;
    const pills = current.filter((r) => r.pill);
    if (pills.length === 0) return placed;
    const drop = pills[pills.length - 1].id;
    current = current.map((r) => (r.id === drop ? { id: r.id, points: r.points } : r));
  }
}

function placeOnce(reqs: BadgeRequest[], nodes: Rect[]): Map<string, PlacedBadge> {
  const placed = new Map<string, PlacedBadge>();
  const taken: Rect[] = [];
  const hard = nodes.map((n) => inflate(n, NODE_CLEARANCE));
  const free = (r: Rect, nodeClear: boolean) =>
    (!nodeClear || !hard.some((n) => rectsOverlap(r, n))) && !taken.some((t) => rectsOverlap(r, inflate(t, BADGE_CLEARANCE)));

  const tryPlace = (req: BadgeRequest, kind: 'dot' | 'pill'): PlacedBadge | null => {
    const w = kind === 'pill' ? req.pill!.w : DOT, h = kind === 'pill' ? (req.pill!.h ?? PILL_H) : DOT;
    // Strict pass (clear of nodes), then for dots only a relaxed pass so every step gets a number.
    for (const strict of kind === 'dot' ? [true, false] : [true]) {
      for (const c of candidates(req.points, kind === 'pill' ? Math.min(w, 24) / 2 + 8 : 12, kind === 'pill' ? { w, h } : undefined)) {
        const rect = { x: c.x - w / 2, y: c.y - h / 2, w, h };
        if (free(rect, strict)) return { id: req.id, kind, ...rect };
      }
    }
    if (kind === 'dot') {
      // Last resort on very short edges: a smaller dot that only avoids other badges.
      for (const c of candidates(req.points, 8)) {
        const rect = { x: c.x - SMALL / 2, y: c.y - SMALL / 2, w: SMALL, h: SMALL };
        if (!taken.some((t) => rectsOverlap(rect, t))) return { id: req.id, kind, ...rect };
      }
    }
    return null;
  };

  // Pills first: they are the scarce, wide ones. Then a dot for every other request.
  for (const r of reqs.filter((x) => x.pill)) {
    const b = tryPlace(r, 'pill');
    if (b) { placed.set(r.id, b); taken.push(b); }
  }
  for (const r of reqs) {
    if (placed.has(r.id) && placed.get(r.id)!.kind === 'pill') continue;
    const b = tryPlace(r, 'dot');
    if (b) { placed.set(r.id, b); taken.push(b); }
  }
  return placed;
}

/** Pill text wrapped into short lines so long labels are shown in full instead of truncated. */
export function pillSize(label: string, maxChars = 30): { lines: string[]; w: number; h: number } {
  const words = label.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  const longest = Math.max(...lines.map((l) => l.length), 1);
  return { lines, w: Math.round(34 + longest * 6.3), h: lines.length === 1 ? PILL_H : 12 + lines.length * 14 };
}
