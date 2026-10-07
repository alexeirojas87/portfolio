import type { CSSProperties } from 'react';
import { KIND_ICON } from './icons.tsx';
import { kindColor } from './kinds.ts';
import { wrapText } from './layout.ts';
import type { CuratedLayout } from './curated.ts';
import { nodeLabel, type Architecture, type Locale } from './types.ts';
import type { Progress } from './flow.ts';

export interface CuratedSvgProps {
  arch: Architecture;
  layout: CuratedLayout;
  locale: Locale;
  uid: string;
  compact?: boolean;
  boundaryLabel?: string;
  progress?: Progress;
  /** Edge id -> 1-based step number for the selected flow. */
  stepNo?: Map<string, number>;
  stepKey?: string;
  playing?: boolean;
  hoverNode?: string | null;
  onHover?: (id: string | null) => void;
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
  const hasFlow = !compact && !!p.stepNo && p.stepNo.size > 0;
  const connected = new Set<string>();
  if (p.hoverNode) {
    for (const e of arch.edges)
      if (e.from === p.hoverNode || e.to === p.hoverNode) { connected.add(e.id); connected.add(e.from); connected.add(e.to); }
  }
  const mk = (k: string) => `${uid}-ah-${k}`;
  const inFlow = (id: string) => !!p.stepNo?.has(id);

  return (
    <svg className="dg-svg dg-curated" viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={p.fixedWidth ? layout.width : undefined} height={p.fixedWidth ? layout.height : undefined}
      preserveAspectRatio="xMidYMid meet" aria-hidden={compact ? true : undefined}
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
          const hl = connected.has(e.id);
          const flow = inFlow(e.id);
          const dim = (hasFlow && !flow && !hl) || (!!p.hoverNode && !hl);
          const state = isActive || hl ? 'active' : isDone ? 'done' : flow ? 'flow' : e.async ? 'async' : 'base';
          const cls = ['dg-edge', `st-${state}`, e.async ? 'is-async' : '', dim ? 'is-dim' : '', compact && flow ? 'in-flow0' : ''].join(' ');
          return <path key={e.id} d={e.d} className={cls} markerEnd={`url(#${mk(state)})`} />;
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
          if (compact) {
            return (
              <g key={n.id} className={`dg-node compact ${own} st-${st}`} style={style} transform={`translate(${n.x} ${n.y})`}>
                <rect width={n.w} height={n.h} rx={18} className="dg-box" />
                <Icon x={n.w / 2 - 20} y={n.h / 2 - 20} size={40} strokeWidth={1.8} color={color} />
              </g>
            );
          }
          const title = nodeLabel(n.node, locale);
          const sub = n.node.sublabel[locale];
          const textW = n.w - 24;
          const tl = wrapText(title, Math.floor(textW / 7.4), 2);
          const room = n.h - 36 - tl.length * 16 - 6; // space left for the sublabel
          const sl = room >= 12 ? wrapText(sub, Math.floor(textW / 6.1), room >= 26 ? 2 : 1) : [];
          const tech = n.node.tech ?? '';
          const techMax = Math.floor((n.w - 34 - 20 - 6) / 6.4);
          const techText = trunc(tech, techMax);
          const techW = techText.length * 6.4 + 12;
          return (
            <g key={n.id} className={`dg-node ${own} st-${st} ${hov ? 'is-hover' : ''} ${dim ? 'is-dim' : ''}`} style={style}
              transform={`translate(${n.x} ${n.y})`} tabIndex={0} role="img"
              aria-label={`${title}${tech ? ` (${tech})` : ''}: ${sub}${n.owned ? '' : ''}`}
              onMouseEnter={() => p.onHover?.(n.id)} onMouseLeave={() => p.onHover?.(null)}
              onFocus={() => p.onHover?.(n.id)} onBlur={() => p.onHover?.(null)}>
              <rect width={n.w} height={n.h} rx={16} className="dg-box" />
              <Icon x={12} y={11} size={16} strokeWidth={2} color={color} />
              {tech && (
                <g transform="translate(34 9)">
                  <rect width={techW} height={19} rx={9.5} className="dg-tech-bg" />
                  <text x={6} y={13} className="dg-tech">{techText}</text>
                </g>
              )}
              <text className="dg-label">
                {tl.map((l, i) => <tspan key={i} x={12} y={44 + i * 16}>{l}</tspan>)}
              </text>
              <text className="dg-sub">
                {sl.map((l, i) => <tspan key={i} x={12} y={44 + tl.length * 16 + 2 + i * 13}>{l}</tspan>)}
              </text>
              <circle cx={n.w - 12} cy={19} r={4} className="dg-dot" />
            </g>
          );
        })}
      </g>

      {!compact && p.stepNo && (
        <g className="dg-badges" pointerEvents="none">
          {layout.edges.filter((e) => inFlow(e.id)).map((e) => {
            const no = p.stepNo!.get(e.id)!;
            const label = trunc(edgeById.get(e.id)!.label[locale], 26);
            const isActive = e.id === active;
            const done = !!p.progress?.doneEdges.has(e.id);
            const w = 26 + label.length * 6.3 + 10;
            const cls = `dg-badge ${isActive ? 'is-active' : done ? 'is-done' : ''}`;
            // Label pills only where the straight segment is long enough; otherwise a numbered dot.
            if (e.anchor.len < w + 16) {
              return (
                <g key={e.id} transform={`translate(${e.anchor.x} ${e.anchor.y})`} className={cls}>
                  <circle r={11.5} className="dg-num dg-num-solo" />
                  <text y={3.8} textAnchor="middle" className="dg-numt">{no}</text>
                </g>
              );
            }
            return (
              <g key={e.id} transform={`translate(${e.anchor.x - w / 2} ${e.anchor.y - 11})`} className={cls}>
                <rect width={w} height={22} rx={11} className="dg-pill" />
                <circle cx={11} cy={11} r={8.5} className="dg-num" />
                <text x={11} y={14.6} textAnchor="middle" className="dg-numt">{no}</text>
                <text x={26} y={15} className="dg-pt">{label}</text>
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
