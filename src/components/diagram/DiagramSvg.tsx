import type { CSSProperties } from 'react';
import { KIND_ICON } from './icons.tsx';
import { kindColor } from './kinds.ts';
import { wrapText, type Layout } from './layout.ts';
import type { Architecture, Locale, Mode } from './types.ts';
import type { Progress } from './flow.ts';

export interface DiagramSvgProps {
  arch: Architecture;
  layout: Layout;
  locale: Locale;
  mode: Mode;
  uid: string;
  progress?: Progress;
  /** Edges of the selected flow (full mode) or of the first flow (compact reduced-motion fallback). */
  flowEdges?: Set<string>;
  /** Restarts the one-shot comet when the step changes. */
  stepKey?: string;
  playing?: boolean;
  hoverNode?: string | null;
  onHover?: (id: string | null) => void;
}

const COMET_MS = 1700;

export default function DiagramSvg(p: DiagramSvgProps) {
  const { arch, layout, locale, mode, uid } = p;
  const full = mode === 'full';
  const nodeById = new Map(arch.nodes.map((n) => [n.id, n]));
  const edgeById = new Map(arch.edges.map((e) => [e.id, e]));
  const connected = new Set<string>();
  if (p.hoverNode) {
    for (const e of arch.edges) {
      if (e.from === p.hoverNode || e.to === p.hoverNode) {
        connected.add(e.id); connected.add(e.from); connected.add(e.to);
      }
    }
  }
  const hasFlow = full && !!p.flowEdges;
  const active = p.progress?.activeEdge ?? null;
  const markerId = (k: string) => `${uid}-ah-${k}`;

  return (
    <svg
      className="dg-svg"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden={full ? undefined : true}
      role={full ? 'group' : undefined}
      focusable="false"
    >
      <defs>
        {(['base', 'async', 'active', 'done'] as const).map((k) => (
          <marker key={k} id={markerId(k)} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth={full ? 7 : 6} markerHeight={full ? 7 : 6} orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 z" className={`dg-ah dg-ah-${k}`} />
          </marker>
        ))}
      </defs>

      {layout.zones.map((z) => (
        <g key={z.id} className="dg-zone">
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={full ? 20 : 12} />
          {full && <text x={z.x + 16} y={z.y + 24}>{z.label.toUpperCase()}</text>}
        </g>
      ))}

      <g className="dg-edges">
        {layout.edges.map((e, i) => {
          const isActive = e.id === active;
          const isDone = !!p.progress?.doneEdges.has(e.id);
          const inFlow = p.flowEdges?.has(e.id) ?? false;
          const hl = connected.has(e.id);
          const dim = (hasFlow && !inFlow && !hl) || (p.hoverNode && !hl);
          const state = isActive || hl ? 'active' : isDone ? 'done' : e.async ? 'async' : 'base';
          const cls = [
            'dg-edge', `st-${state}`, e.async ? 'is-async' : '', dim ? 'is-dim' : '',
            !full && inFlow ? 'in-flow0' : '',
          ].join(' ');
          return (
            <path key={e.id} d={e.d} className={cls}
              markerEnd={`url(#${markerId(state === 'active' ? 'active' : state === 'done' ? 'done' : e.async ? 'async' : 'base')})`} />
          );
        })}
      </g>

      {/* Comets: one-shot on the active edge (full) or ambient on every edge (compact). */}
      <g className="dg-comets">
        {!full &&
          layout.edges.map((e, i) => {
            const k = kindColor(nodeById.get(e.from)!.kind);
            const style = { '--k': k, '--dur': '3.6s', '--delay': `${(i * 0.53) % 3.4}s` } as CSSProperties;
            return <Comet key={e.id} d={e.d} style={style} ambient />;
          })}
        {full && p.playing && active && (() => {
          const e = layout.edges.find((x) => x.id === active);
          if (!e) return null;
          const k = kindColor(nodeById.get(e.from)!.kind);
          const style = { '--k': k, '--dur': `${COMET_MS}ms`, '--delay': '0s' } as CSSProperties;
          return <Comet key={`${p.stepKey}:${active}`} d={e.d} style={style} />;
        })()}
      </g>

      <g className="dg-nodes">
        {layout.nodes.map((n) => {
          const color = kindColor(n.node.kind);
          const Icon = KIND_ICON[n.node.kind];
          const st = p.progress?.activeNodes.has(n.id) ? 'active' : p.progress?.doneNodes.has(n.id) ? 'done' : 'idle';
          const hov = p.hoverNode === n.id;
          const dim = p.hoverNode && !connected.has(n.id) && !hov;
          const style = { '--k': color } as CSSProperties;
          const sub = n.node.sublabel[locale];
          if (!full) {
            return (
              <g key={n.id} className={`dg-node compact st-${st}`} style={style} transform={`translate(${n.x} ${n.y})`}>
                <rect width={n.w} height={n.h} rx={12} className="dg-box" />
                <Icon x={n.w / 2 - 9} y={n.h / 2 - 9} size={18} strokeWidth={2} color={color} />
              </g>
            );
          }
          const label = wrapText(n.node.label, 19, 2);
          const subl = wrapText(sub, 25, 2);
          const lineH = 14, subH = 12;
          const total = label.length * lineH + subl.length * subH + 2;
          const y0 = (n.h - total) / 2 + 11;
          const subY0 = y0 + (label.length - 1) * lineH + lineH;
          return (
            <g key={n.id} className={`dg-node st-${st} ${hov ? 'is-hover' : ''} ${dim ? 'is-dim' : ''}`} style={style}
              transform={`translate(${n.x} ${n.y})`} tabIndex={0} role="img"
              aria-label={`${n.node.label}: ${sub}`}
              onMouseEnter={() => p.onHover?.(n.id)} onMouseLeave={() => p.onHover?.(null)}
              onFocus={() => p.onHover?.(n.id)} onBlur={() => p.onHover?.(null)}>
              <rect width={n.w} height={n.h} rx={16} className="dg-box" />
              <rect x={12} y={(n.h - 34) / 2} width={34} height={34} rx={10} className="dg-ibox" />
              <Icon x={12 + 8} y={(n.h - 34) / 2 + 8} size={18} strokeWidth={2} color={color} />
              <text x={58} className="dg-label">
                {label.map((l, i) => <tspan key={i} x={58} y={y0 + i * lineH}>{l}</tspan>)}
              </text>
              <text x={58} className="dg-sub">
                {subl.map((l, i) => <tspan key={i} x={58} y={subY0 + i * subH}>{l}</tspan>)}
              </text>
              <circle cx={n.w - 12} cy={12} r={4} className="dg-dot" />
            </g>
          );
        })}
      </g>

      {full && (
        <g className="dg-labels" pointerEvents="none">
          {layout.edges.map((e) => {
            const show = e.id === active || connected.has(e.id);
            if (!show) return null;
            return (
              <text key={e.id} x={e.mid.x} y={e.mid.y - 8} textAnchor="middle" className="dg-edge-label">
                {edgeById.get(e.id)!.label[locale]}
              </text>
            );
          })}
        </g>
      )}
    </svg>
  );
}

function Comet({ d, style, ambient }: { d: string; style: CSSProperties; ambient?: boolean }) {
  const cls = ambient ? 'cmt ambient' : 'cmt once';
  return (
    <g className={cls} style={style}>
      <path d={d} pathLength={100} className="cmt-trail" />
      <path d={d} pathLength={100} className="cmt-head" />
    </g>
  );
}
