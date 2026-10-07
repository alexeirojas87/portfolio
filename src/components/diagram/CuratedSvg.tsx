import { useMemo, type CSSProperties } from 'react';
import { KIND_ICON } from './icons.tsx';
import { kindColor } from './kinds.ts';
import { fitTitle, wrapText } from './layout.ts';
import { placeBadges, pillSize, type BadgeRequest } from './badges.ts';
import type { CuratedLayout } from './curated.ts';
import { nodeLabel, type Architecture, type Locale } from './types.ts';
import type { Progress } from './flow.ts';

export interface CuratedSvgProps {
  arch: Architecture;
  layout: CuratedLayout;
  locale: Locale;
  uid: string;
  compact?: boolean;
  /** Compact view with node titles and tech chips (hero). Never edge labels or sublabels. */
  labels?: boolean;
  boundaryLabel?: string;
  progress?: Progress;
  /** Edge id -> 1-based step number for the selected flow. */
  stepNo?: Map<string, number>;
  stepKey?: string;
  playing?: boolean;
  hoverNode?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  emphasisEdge?: string | null;
  hoverEdge?: string | null;
  /** A node panel is open: the flow is paused and its badges and highlights are dimmed. */
  dimFlow?: boolean;
  onHoverEdge?: (id: string | null) => void;
  /** Rendered pixel width (vertical orientation is never scaled). */
  fixedWidth?: boolean;
}

const COMET_MS = 1700;
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export default function CuratedSvg(p: CuratedSvgProps) {
  const { arch, layout, locale, uid, compact } = p;
  const nodeById = new Map(arch.nodes.map((n) => [n.id, n]));
  const edgeById = new Map(arch.edges.map((e) => [e.id, e]));
  const active = p.progress?.activeEdge ?? null;
  const hasFlow = !compact && !!p.stepNo && p.stepNo.size > 0 && !p.dimFlow;
  const connected = new Set<string>();
  if (p.hoverNode) {
    for (const e of arch.edges)
      if (e.from === p.hoverNode || e.to === p.hoverNode) { connected.add(e.id); connected.add(e.from); connected.add(e.to); }
  }
  const mk = (k: string) => `${uid}-ah-${k}`;
  const inFlow = (id: string) => !!p.stepNo?.has(id);

  // Dots for every step; full label pills only for the active / emphasised / hovered edge.
  const pillIds = useMemo(() => [active, p.emphasisEdge ?? null, p.hoverEdge ?? null].filter((x, i, a): x is string => !!x && a.indexOf(x) === i), [active, p.emphasisEdge, p.hoverEdge]);
  const pillInfo = useMemo(() => new Map(pillIds.map((id) => [id, pillSize(edgeById.get(id)?.label[locale] ?? '')])), [pillIds, arch, locale]);
  const badges = useMemo(() => {
    if (compact) return new Map();
    const ids = new Set<string>([...(p.stepNo?.keys() ?? []), ...pillIds]);
    const reqs: BadgeRequest[] = [...pillIds, ...[...ids].filter((id) => !pillIds.includes(id))]
      .map((id) => layout.edges.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => !!e)
      .map((e) => ({ id: e.id, points: e.points, pill: pillInfo.has(e.id) ? { w: pillInfo.get(e.id)!.w, h: pillInfo.get(e.id)!.h } : undefined }));
    return placeBadges(reqs, layout.nodes.map((n) => ({ x: n.x, y: n.y, w: n.w, h: n.h })));
  }, [compact, layout, p.stepNo, pillIds, pillInfo]);

  return (
    <svg className="dg-svg dg-curated" viewBox={`${layout.vb.x} ${layout.vb.y} ${layout.vb.w} ${layout.vb.h}`}
      width={p.fixedWidth ? layout.width : undefined} height={p.fixedWidth ? layout.height : undefined}
      preserveAspectRatio={compact && layout.orientation === 'vertical' ? 'xMidYMin meet' : 'xMidYMid meet'} aria-hidden={compact ? true : undefined}
      role={compact ? undefined : 'group'} focusable="false">
      <defs>
        {(['base', 'async', 'flow', 'done', 'active'] as const).map((k) => (
          <marker key={k} id={mk(k)} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse"
            markerWidth={compact ? 14 : 10} markerHeight={compact ? 14 : 10} orient="auto">
            <path d="M0 1 L9 5 L0 9 z" className={`dg-ah dg-ah-${k}`} />
          </marker>
        ))}
      </defs>

      {layout.boundary && (
        <g className="dg-boundary">
          <rect x={layout.boundary.x} y={layout.boundary.y} width={layout.boundary.w} height={layout.boundary.h} rx={compact ? 24 : 22} />
          {!compact && p.boundaryLabel && (
            <g transform={`translate(${layout.boundary.x + 16} ${layout.boundary.y + 8})`}>
              <rect width={p.boundaryLabel.length * 7.6 + 30} height={22} rx={11} className="dg-btab" />
              <circle cx={12} cy={11} r={3.5} className="dg-bdot" />
              <text x={22} y={15}>{p.boundaryLabel.toUpperCase()}</text>
            </g>
          )}
        </g>
      )}

      <g className="dg-edges">
        {layout.edges.map((e) => {
          const isActive = e.id === active;
          const isDone = !!p.progress?.doneEdges.has(e.id);
          const hl = connected.has(e.id) || e.id === p.emphasisEdge;
          const flow = inFlow(e.id);
          const dim = (hasFlow && !flow && !hl) || ((!!p.hoverNode || !!p.emphasisEdge) && !hl);
          const state = isActive || hl ? 'active' : isDone ? 'done' : flow ? 'flow' : e.async ? 'async' : 'base';
          const cls = ['dg-edge', `st-${state}`, e.async ? 'is-async' : '', dim ? 'is-dim' : '', compact && flow ? 'in-flow0' : ''].join(' ');
          return (
            <g key={e.id}>
              <path d={e.d} className={cls} markerEnd={`url(#${mk(state)})`} />
              {!compact && <path d={e.d} className="dg-edge-hit" onMouseEnter={() => p.onHoverEdge?.(e.id)} onMouseLeave={() => p.onHoverEdge?.(null)} />}
            </g>
          );
        })}
      </g>

      <g className="dg-comets">
        {compact && layout.edges.map((e, i) => {
          const style = { '--k': kindColor(nodeById.get(e.from)!.kind), '--dur': '3.6s', '--delay': `${(i * 0.53) % 3.4}s` } as CSSProperties;
          return <Comet key={e.id} d={e.d} style={style} ambient />;
        })}
        {!compact && p.playing && active && (() => {
          const e = layout.edges.find((x) => x.id === active);
          if (!e) return null;
          const style = { '--k': kindColor(nodeById.get(e.from)!.kind), '--dur': `${COMET_MS}ms`, '--delay': '0s' } as CSSProperties;
          return <Comet key={`${p.stepKey}:${active}`} d={e.d} style={style} />;
        })()}
      </g>

      <g className="dg-nodes">
        {layout.nodes.map((n) => {
          const color = kindColor(n.node.kind);
          const Icon = KIND_ICON[n.node.kind];
          const st = p.progress?.activeNodes.has(n.id) ? 'active' : p.progress?.doneNodes.has(n.id) ? 'done' : 'idle';
          const hov = p.hoverNode === n.id;
          const dim = !!p.hoverNode && !connected.has(n.id) && !hov;
          const style = { '--k': color } as CSSProperties;
          const own = n.owned ? 'owned' : 'outside';
          if (compact && !p.labels) {
            return (
              <g key={n.id} className={`dg-node compact ${own} st-${st}`} style={style} transform={`translate(${n.x} ${n.y})`}>
                <rect width={n.w} height={n.h} rx={18} className="dg-box" />
                <Icon x={n.w / 2 - 20} y={n.h / 2 - 20} size={40} strokeWidth={1.8} color={color} />
              </g>
            );
          }
          const title = nodeLabel(n.node, locale);
          const sub = n.node.sublabel[locale];
          const narrow = n.w < 120;
          const textW = n.w - (narrow ? 16 : 24);
          const ft = fitTitle(title, textW, narrow ? [12, 11] : [14.5, 13], narrow ? 0.52 : 0.483, 3);
          const tl = ft.lines;
          const lh = narrow ? 14 : 16;
          const room = n.h - (narrow ? 40 : 36) - tl.length * lh - 6;
          const subLines = Math.min(3, Math.floor(room / 13));
          const sl = narrow || p.compact || subLines < 1 ? [] : wrapText(sub, Math.floor(textW / 5.7), subLines);
          const tech = n.node.tech ?? '';
          const techMax = narrow ? Math.floor((n.w - 16 - 10) / 5.8) : Math.floor((n.w - 34 - 20 - 6) / 6.4);
          const techText = trunc(tech, techMax);
          const techW = techText.length * (narrow ? 5.8 : 6.4) + 12;
          const iconX = narrow ? 8 : 12;
          const titleY = narrow ? 50 : 44;
          return (
            <g key={n.id} className={`dg-node ${own} ${narrow ? 'narrow' : ''} st-${st} ${hov ? 'is-hover' : ''} ${dim ? 'is-dim' : ''}`} style={style}
              transform={`translate(${n.x} ${n.y})`} tabIndex={0} role="button" data-node-id={n.id} aria-haspopup="dialog"
              aria-label={`${title}${tech ? ` (${tech})` : ''}: ${sub}${n.owned ? '' : ''}`}
              onMouseEnter={() => p.onHover?.(n.id)} onMouseLeave={() => p.onHover?.(null)}
              onFocus={() => p.onHover?.(n.id)} onBlur={() => p.onHover?.(null)}
              onClick={() => p.onSelect?.(n.id)}
              onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); p.onSelect?.(n.id); } }}>
              <rect width={n.w} height={n.h} rx={16} className="dg-box" />
              {!narrow && <Icon x={iconX} y={11} size={16} strokeWidth={2} color={color} />}
              {tech && (
                <g transform={`translate(${narrow ? 8 : iconX + 22} 9)`}>
                  <rect width={techW} height={19} rx={9.5} className="dg-tech-bg" />
                  <text x={6} y={13} className="dg-tech">{techText}</text>
                </g>
              )}
              <text className="dg-label" lang={locale} style={{ fontSize: ft.size }}>
                {tl.map((l, i) => <tspan key={i} x={narrow ? 8 : 12} y={titleY + i * lh}>{l}</tspan>)}
              </text>
              <text className="dg-sub">
                {sl.map((l, i) => <tspan key={i} x={12} y={titleY + tl.length * lh + 2 + i * 13}>{l}</tspan>)}
              </text>
              {!narrow && <circle cx={n.w - 10} cy={19} r={4} className="dg-dot" />}
            </g>
          );
        })}
      </g>

      {!compact && (
        <g className={`dg-badges ${p.dimFlow ? 'is-dim' : ''}`} pointerEvents="none">
          {[...badges.values()].map((b) => {
            const no = p.stepNo?.get(b.id);
            const isActive = b.id === active;
            const done = !!p.progress?.doneEdges.has(b.id);
            const cls = `dg-badge ${isActive ? 'is-active' : done ? 'is-done' : ''}`;
            if (b.kind === 'dot') {
              const r = b.w / 2;
              return (
                <g key={b.id} transform={`translate(${b.x + r} ${b.y + r})`} className={cls}>
                  <circle r={r - 0.5} className="dg-num dg-num-solo" />
                  <text y={3.8} textAnchor="middle" className="dg-numt">{no}</text>
                </g>
              );
            }
            const info = pillInfo.get(b.id)!;
            const tx = no ? 30 : 12;
            return (
              <g key={b.id} transform={`translate(${b.x} ${b.y})`} className={`${cls} is-pill`}>
                <rect width={b.w} height={b.h} rx={Math.min(12, b.h / 2)} className="dg-pill" />
                {no && <circle cx={14} cy={Math.min(14, b.h / 2)} r={9.5} className="dg-num" />}
                {no && <text x={14} y={Math.min(14, b.h / 2) + 3.8} textAnchor="middle" className="dg-numt">{no}</text>}
                <text className="dg-pt">
                  {info.lines.map((l, i) => <tspan key={i} x={tx} y={(info.lines.length === 1 ? b.h / 2 + 3.8 : 17 + i * 14)}>{l}</tspan>)}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

function Comet({ d, style, ambient }: { d: string; style: CSSProperties; ambient?: boolean }) {
  return (
    <g className={ambient ? 'cmt ambient' : 'cmt once'} style={style}>
      <path d={d} pathLength={100} className="cmt-trail" />
      <path d={d} pathLength={100} className="cmt-head" />
    </g>
  );
}
