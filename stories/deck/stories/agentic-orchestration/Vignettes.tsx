import type { ReactNode } from 'react';
import { EASE } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/** Small diagram per decision, 560 x 440, drawn with stroke animation when `on`. Node-kind colours, same as the world. */
const C = { compute: 'var(--k-compute)', data: 'var(--k-data)', queue: 'var(--k-queue)', ai: 'var(--k-ai)', accent: 'var(--accent-text)', ok: 'var(--ok)', fault: 'var(--fault)' };

const draw = (on: boolean, delay = 0, ms = 800) => ({
  pathLength: 1, strokeDasharray: 1, strokeDashoffset: on ? 0 : 1,
  style: { transition: `stroke-dashoffset ${ms}ms ${EASE} ${on ? delay : 0}ms` },
});
const fade = (on: boolean, delay = 0) => ({ style: { opacity: on ? 1 : 0, transition: `opacity ${on ? 500 : 200}ms ${on ? delay : 0}ms` } });

function Box({ x, y, w, h, color, on, delay, children, hot }: { x: number; y: number; w: number; h: number; color: string; on: boolean; delay: number; children?: ReactNode; hot?: boolean }) {
  return (
    <g {...fade(on, delay)}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={hot ? 'var(--surface)' : 'var(--bg)'} stroke={color} strokeWidth={hot ? 5 : 3} style={{ filter: `drop-shadow(0 0 ${hot ? 18 : 8}px ${color})` }} />
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize={30} fontWeight={600}>{children}</text>
    </g>
  );
}

/** 1: agent / gateway / model are three replaceable parts. */
function Layers({ on }: { on: boolean }) {
  return (
    <>
      <Box x={0} y={170} w={160} h={100} color={C.compute} on={on} delay={0}>{tr(copy.vig.agent)}</Box>
      <Box x={200} y={160} w={190} h={120} color={C.accent} on={on} delay={200} hot>{tr(copy.vig.gateway)}</Box>
      <Box x={430} y={170} w={130} h={100} color={C.ai} on={on} delay={400}>{tr(copy.vig.model)}</Box>
      <path d="M162 220 L198 220" stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(on, 500, 400)} />
      <path d="M392 220 L428 220" stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(on, 700, 400)} />
      <path d="M200 320 L390 320 M200 336 L390 336" stroke={C.accent} strokeWidth={3} fill="none" opacity={0.7} {...draw(on, 900, 700)} />
    </>
  );
}

/** 2: a durable state machine: a ring of phases, a crash, and the run resumes with its lease. */
function Lease({ on }: { on: boolean }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    return { x: 280 + 170 * Math.cos(a), y: 220 + 170 * Math.sin(a) };
  });
  return (
    <>
      <circle cx={280} cy={220} r={170} fill="none" stroke="var(--ink-3)" strokeWidth={3} {...draw(on, 0, 1200)} />
      <circle cx={280} cy={220} r={170} fill="none" stroke={C.accent} strokeWidth={6} strokeDasharray="1 3" pathLength={1} style={{ strokeDashoffset: on ? 0 : 1, transition: `stroke-dashoffset 1600ms ${EASE} 300ms`, filter: `drop-shadow(0 0 12px ${C.accent})` }} />
      {pts.map((p, i) => (
        <g key={i} {...fade(on, 300 + i * 150)}>
          <circle cx={p.x} cy={p.y} r={i === 3 ? 26 : 20} fill="var(--bg)" stroke={i === 3 ? C.fault : C.compute} strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${i === 3 ? C.fault : C.compute})` }} />
          {i === 3 && <path d={`M${p.x - 10} ${p.y - 10} L${p.x + 10} ${p.y + 10} M${p.x + 10} ${p.y - 10} L${p.x - 10} ${p.y + 10}`} stroke={C.fault} strokeWidth={5} />}
        </g>
      ))}
      <text x={280} y={232} textAnchor="middle" fill={C.ok} fontFamily="var(--font-mono)" fontSize={42} fontWeight={600} {...fade(on, 1300)}>{tr(copy.vig.lease)}</text>
    </>
  );
}

/** 3: a pre-flight barrier: the sensitive packet is stopped, the clean one passes. */
function Gate({ on }: { on: boolean }) {
  return (
    <>
      <path d="M280 40 L280 400" stroke={C.ai} strokeWidth={8} fill="none" {...draw(on, 0, 900)} />
      <g {...fade(on, 500)}>
        <circle cx={150} cy={140} r={20} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${C.fault})` }} />
        <path d="M180 140 L246 140" stroke={C.fault} strokeWidth={5} fill="none" />
        <path d="M246 118 L266 140 L246 162" stroke={C.fault} strokeWidth={5} fill="none" />
      </g>
      <g {...fade(on, 900)}>
        <circle cx={150} cy={300} r={20} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${C.ok})` }} />
        <path d="M180 300 L500 300" stroke={C.ok} strokeWidth={5} fill="none" />
        <path d="M480 278 L504 300 L480 322" stroke={C.ok} strokeWidth={5} fill="none" />
      </g>
    </>
  );
}

/** 4: builder and reviewer are different roles, with a bounded loop between them. */
function Roles({ on }: { on: boolean }) {
  return (
    <>
      <Box x={0} y={40} w={240} h={110} color={C.compute} on={on} delay={0}>{tr(copy.vig.builder)}</Box>
      <Box x={320} y={290} w={240} h={110} color={C.ai} on={on} delay={300} hot>{tr(copy.vig.reviewer)}</Box>
      <path d="M240 95 C420 95 440 200 440 288" stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(on, 600, 900)} />
      <path d="M320 345 C120 345 120 250 120 152" stroke={C.queue} strokeWidth={4} fill="none" style={{ filter: `drop-shadow(0 0 8px ${C.queue})`, transition: `stroke-dashoffset 900ms ${EASE} 1000ms` }} pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 0 : 1} />
    </>
  );
}

/** 5: tools are enforced server-side: a lock on the MCP box, scoped doors only. */
function Lock({ on }: { on: boolean }) {
  return (
    <>
      <Box x={150} y={120} w={260} h={190} color={C.accent} on={on} delay={0} hot>MCP</Box>
      <g {...fade(on, 500)}>
        <rect x={236} y={250} width={88} height={62} rx={8} fill="var(--bg)" stroke={C.ok} strokeWidth={5} style={{ filter: `drop-shadow(0 0 12px ${C.ok})` }} />
        <path d="M252 250 L252 226 A28 28 0 0 1 308 226 L308 250" fill="none" stroke={C.ok} strokeWidth={5} />
      </g>
      {[110, 220, 330].map((y, i) => (
        <path key={y} d={`M0 ${y} L148 ${y}`} stroke={i === 1 ? C.ok : C.fault} strokeWidth={4} fill="none" {...draw(on, 300 + i * 200, 600)} />
      ))}
      <text x={280} y={380} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 1000)}>{tr(copy.vig.scoped)}</text>
    </>
  );
}

/** 6: an immutable graph per commit: generations of nodes with stable identities. */
function Graph({ on }: { on: boolean }) {
  const cols = [60, 280, 500];
  const rows = [90, 220, 350];
  return (
    <>
      {cols.map((x, ci) => (
        <g key={x}>
          <rect x={x - 46} y={30} width={92} height={380} rx={8} fill="none" stroke="var(--hair-strong)" strokeWidth={2} strokeDasharray="6 8" {...fade(on, ci * 250)} />
          {rows.map((y, ri) => (
            <g key={y} {...fade(on, ci * 250 + ri * 120)}>
              {ci < 2 && <path d={`M${x + 12} ${y} L${cols[ci + 1] - 12} ${rows[(ri + ci) % 3]}`} stroke={C.data} strokeWidth={3} fill="none" opacity={0.8} />}
              <circle cx={x} cy={y} r={ri === 1 ? 20 : 15} fill="var(--bg)" stroke={ri === 1 ? C.accent : C.data} strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${ri === 1 ? C.accent : C.data})` }} />
            </g>
          ))}
        </g>
      ))}
    </>
  );
}

const ALL = [Layers, Lease, Gate, Roles, Lock, Graph];

/** The vignette of decision `i`, in a 560 x 440 box at (x, y) on the stage. */
export function Vignette({ i, on, x, y }: { i: number; on: boolean; x: number; y: number }) {
  const V = ALL[i];
  return (
    <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
      <g transform={`translate(${x} ${y})`}>
        <V on={on} />
      </g>
    </svg>
  );
}
