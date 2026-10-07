import type { Architecture, ArchNode, Locale, Mode } from './types.ts';

// Deterministic layered layout: each group is a column ("zone"), nodes stack inside it
// in data order. No graph-layout dependency: the data is already authored in reading order,
// and a ~100 line function keeps output stable and testable.

export interface Dims {
  nodeW: number; nodeH: number; rowGap: number;
  zonePadX: number; zonePadTop: number; zonePadBottom: number;
  colGap: number; margin: number;
}

export const DIMS: Record<Mode, Dims> = {
  full: { nodeW: 184, nodeH: 84, rowGap: 26, zonePadX: 14, zonePadTop: 40, zonePadBottom: 20, colGap: 60, margin: 14 },
  compact: { nodeW: 74, nodeH: 40, rowGap: 16, zonePadX: 10, zonePadTop: 14, zonePadBottom: 12, colGap: 44, margin: 8 },
};

export interface PlacedNode { id: string; node: ArchNode; x: number; y: number; w: number; h: number; col: number }
export interface PlacedZone { id: string; label: string; x: number; y: number; w: number; h: number }
export interface PlacedEdge {
  id: string; from: string; to: string; async: boolean; d: string;
  mid: { x: number; y: number };
}
export interface Layout {
  width: number; height: number;
  zones: PlacedZone[]; nodes: PlacedNode[]; edges: PlacedEdge[];
}

type Side = 'left' | 'right';

export function computeLayout(arch: Architecture, locale: Locale, mode: Mode): Layout {
  const D = DIMS[mode];

  // Columns follow group order; unknown groups are appended so no node is dropped.
  const groupIds = arch.groups.map((g) => g.id);
  for (const n of arch.nodes) if (!groupIds.includes(n.group)) groupIds.push(n.group);
  const columns = groupIds
    .map((id) => ({
      id,
      label: arch.groups.find((g) => g.id === id)?.label[locale] ?? id,
      nodes: arch.nodes.filter((n) => n.group === id),
    }))
    .filter((c) => c.nodes.length > 0);

  const maxRows = Math.max(1, ...columns.map((c) => c.nodes.length));
  const contentH = maxRows * D.nodeH + (maxRows - 1) * D.rowGap;
  const zoneH = contentH + D.zonePadTop + D.zonePadBottom;
  const zoneW = D.nodeW + D.zonePadX * 2;

  const zones: PlacedZone[] = [];
  const nodes: PlacedNode[] = [];
  columns.forEach((c, col) => {
    const x = D.margin + col * (zoneW + D.colGap);
    zones.push({ id: c.id, label: c.label, x, y: D.margin, w: zoneW, h: zoneH });
    const colH = c.nodes.length * D.nodeH + (c.nodes.length - 1) * D.rowGap;
    const startY = D.margin + D.zonePadTop + (contentH - colH) / 2;
    c.nodes.forEach((node, i) => {
      nodes.push({
        id: node.id, node, col,
        x: x + D.zonePadX, y: startY + i * (D.nodeH + D.rowGap), w: D.nodeW, h: D.nodeH,
      });
    });
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges = arch.edges.filter((e) => byId.has(e.from) && byId.has(e.to));

  const sideOf = (from: PlacedNode, to: PlacedNode): [Side, Side] =>
    from.col < to.col ? ['right', 'left'] : from.col > to.col ? ['left', 'right'] : ['right', 'right'];

  // Spread anchors along a node side so parallel edges do not overlap.
  const slots = new Map<string, { edgeId: string; otherY: number }[]>();
  for (const e of edges) {
    const a = byId.get(e.from)!, b = byId.get(e.to)!;
    const [sa, sb] = sideOf(a, b);
    for (const [n, side, other] of [[a, sa, b], [b, sb, a]] as const) {
      const k = `${n.id}:${side}`;
      const list = slots.get(k) ?? [];
      list.push({ edgeId: e.id, otherY: other.y });
      slots.set(k, list);
    }
  }
  const anchorY = (n: PlacedNode, side: Side, edgeId: string): number => {
    const list = [...(slots.get(`${n.id}:${side}`) ?? [])].sort((p, q) => p.otherY - q.otherY);
    const i = list.findIndex((s) => s.edgeId === edgeId);
    const span = n.h - 22;
    return n.y + n.h / 2 + ((i + 1) / (list.length + 1) - 0.5) * span;
  };

  const loopRank = new Map<number, number>();
  const placedEdges: PlacedEdge[] = edges.map((e) => {
    const a = byId.get(e.from)!, b = byId.get(e.to)!;
    const [sa, sb] = sideOf(a, b);
    const x1 = sa === 'right' ? a.x + a.w : a.x;
    const x2 = sb === 'right' ? b.x + b.w : b.x;
    const y1 = anchorY(a, sa, e.id);
    const y2 = anchorY(b, sb, e.id);
    let c1x: number, c2x: number;
    if (a.col === b.col) {
      const r = loopRank.get(a.col) ?? 0;
      loopRank.set(a.col, r + 1);
      const bulge = (mode === 'full' ? 34 : 18) + (r % 3) * (mode === 'full' ? 9 : 5);
      c1x = x1 + bulge; c2x = x2 + bulge;
    } else {
      const dir = Math.sign(x2 - x1);
      const dx = Math.max(mode === 'full' ? 36 : 20, Math.abs(x2 - x1) * 0.45);
      c1x = x1 + dir * dx; c2x = x2 - dir * dx;
    }
    // End a hair outside the node so the arrowhead tip touches the card edge.
    const tipGap = sb === 'left' ? -1 : 1;
    const ex = x2 + tipGap;
    const d = `M${r2(x1)} ${r2(y1)} C${r2(c1x)} ${r2(y1)} ${r2(c2x)} ${r2(y2)} ${r2(ex)} ${r2(y2)}`;
    const mid = { x: (x1 + 3 * c1x + 3 * c2x + ex) / 8, y: (y1 + 3 * y1 + 3 * y2 + y2) / 8 };
    return { id: e.id, from: e.from, to: e.to, async: e.async, d, mid };
  });

  return {
    width: D.margin * 2 + columns.length * zoneW + Math.max(0, columns.length - 1) * D.colGap,
    height: D.margin * 2 + zoneH,
    zones, nodes, edges: placedEdges,
  };
}

const r2 = (n: number) => Math.round(n * 10) / 10;

/** Greedy word wrap with ellipsis, used for SVG text which cannot wrap on its own. */
export function wrapText(text: string, maxChars: number, maxLines: number, hardBreak = false): string[] {
  // Break at spaces and after hyphens ("Backend-for-frontend" can wrap).
  let words = text.split(/(?<=-)(?=\S)|\s+/).filter(Boolean);
  if (hardBreak) words = words.flatMap((w) => splitLong(w, maxChars));
  const join = (a: string, w: string) => (a.endsWith('-') ? a + w : a + ' ' + w);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if (join(cur, w).length <= maxChars) cur = join(cur, w);
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines.map((l) => clip(l, maxChars));
  const kept = lines.slice(0, maxLines);
  const rest = lines.slice(maxLines - 1).reduce((acc, l) => (acc ? join(acc, l) : l), '');
  kept[maxLines - 1] = clip(rest, maxChars - 1).replace(/[\s,.;:]+$/, '') + '…';
  return kept.map((l) => clip(l, maxChars));
}
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Split a word longer than `max` into hyphenated chunks ("enriquecimi-" / "ento"). */
function splitLong(w: string, max: number): string[] {
  if (w.length <= max || max < 4) return [w];
  const out: string[] = [];
  let rest = w;
  while (rest.length > max) { out.push(rest.slice(0, max - 1) + '-'); rest = rest.slice(max - 1); }
  out.push(rest);
  return out;
}

/** Title lines for a node: step the font down before truncating; hard-hyphenate only as a last resort. */
export function fitTitle(title: string, textW: number, sizes: number[], charFactor: number, maxLines = 3): { lines: string[]; size: number } {
  for (const size of sizes) {
    const chars = Math.floor(textW / (size * charFactor));
    const longest = Math.max(...title.split(/(?<=-)(?=\S)|\s+/).map((w) => w.length), 0);
    if (longest > chars) continue;
    const lines = wrapText(title, chars, maxLines);
    if (!lines.some((l) => l.endsWith('…'))) return { lines, size };
  }
  const size = sizes[sizes.length - 1];
  return { lines: wrapText(title, Math.floor(textW / (size * charFactor)), maxLines, true), size };
}
