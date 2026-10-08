import type { ReactNode } from 'react';
import { EASE } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/** Small diagram per decision, 560 x 440, drawn with stroke animation when `on`. Node-kind colours, same as the world. */
const C = { compute: 'var(--k-compute)', data: 'var(--k-data)', queue: 'var(--k-queue)', accent: 'var(--accent-text)', ok: 'var(--ok)', fault: 'var(--fault)' };

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
const Dot = ({ x, y, color, r = 14 }: { x: number; y: number; color: string; r?: number }) => (
  <circle cx={x} cy={y} r={r} fill="#fff" style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
);

/** 1: the bus. The worker is down; accepted messages wait safely in the queue instead of being lost. */
function Bus({ on }: { on: boolean }) {
  return (
    <>
      <Box x={0} y={150} w={140} h={110} color={C.compute} on={on} delay={0}>{tr(copy.vig.api)}</Box>
      <Box x={210} y={140} w={160} h={130} color={C.queue} on={on} delay={200} hot>{tr(copy.vig.queue)}</Box>
      <Box x={440} y={150} w={120} h={110} color={C.fault} on={on} delay={400}>{tr(copy.vig.worker)}</Box>
      <path d="M142 205 L208 205" stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(on, 500, 400)} />
      <path d="M372 205 L438 205" stroke={C.fault} strokeWidth={4} strokeDasharray="10 10" fill="none" {...fade(on, 700)} />
      <path d="M476 175 L524 235 M524 175 L476 235" stroke={C.fault} strokeWidth={6} fill="none" {...fade(on, 900)} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={246 + i * 44} cy={310} r={15} fill={C.queue} style={{ filter: `drop-shadow(0 0 10px ${C.queue})`, opacity: on ? 1 : 0, transition: `opacity 400ms ${1000 + i * 150}ms` }} />
      ))}
      <text x={290} y={390} textAnchor="middle" fill={C.ok} fontFamily="var(--font-mono)" fontSize={30} fontWeight={600} {...fade(on, 1500)}>{tr(copy.vig.safe)}</text>
    </>
  );
}

/** 2: idempotency. The same message arrives twice; the second is absorbed at the key check. */
function Once({ on }: { on: boolean }) {
  return (
    <>
      <path d="M280 20 L280 420" stroke={C.accent} strokeWidth={8} fill="none" {...draw(on, 0, 900)} />
      <g {...fade(on, 500)}>
        <Dot x={110} y={120} color={C.ok} />
        <path d="M140 120 L520 120" stroke={C.ok} strokeWidth={5} fill="none" />
        <path d="M498 98 L522 120 L498 142" stroke={C.ok} strokeWidth={5} fill="none" />
      </g>
      <g {...fade(on, 1000)}>
        <Dot x={110} y={290} color={C.fault} />
        <path d="M140 290 L236 290" stroke={C.fault} strokeWidth={5} fill="none" />
        <path d="M214 268 L238 290 L214 312" stroke={C.fault} strokeWidth={5} fill="none" />
        <path d="M262 258 L298 322 M298 258 L262 322" stroke={C.fault} strokeWidth={6} fill="none" />
      </g>
      <text x={110} y={190} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 1200)}>{tr(copy.vig.key)}</text>
      <text x={400} y={190} textAnchor="middle" fill={C.ok} fontFamily="var(--font-mono)" fontSize={48} fontWeight={600} {...fade(on, 1300)}>{tr(copy.vig.once)}</text>
    </>
  );
}

/** 3: sending is quick, finality is slow. The executor is free again, the watcher carries the wait. */
function Split({ on }: { on: boolean }) {
  return (
    <>
      <Box x={0} y={40} w={200} h={100} color={C.compute} on={on} delay={0}>{tr(copy.vig.executor)}</Box>
      <path d="M210 90 L300 90" stroke={C.ok} strokeWidth={8} fill="none" {...draw(on, 400, 400)} />
      <text x={330} y={102} fill={C.ok} fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 700)}>{tr(copy.vig.quick)}</text>
      <text x={20} y={196} fill={C.ok} fontFamily="var(--font-mono)" fontSize={30} fontWeight={600} {...fade(on, 1000)}>{tr(copy.vig.free)}</text>
      <Box x={0} y={270} w={200} h={100} color={C.accent} on={on} delay={600} hot>{tr(copy.vig.watcher)}</Box>
      <path d="M210 320 L540 320" stroke={C.accent} strokeWidth={8} strokeDasharray="2 14" strokeLinecap="round" fill="none" {...fade(on, 900)} />
      <text x={230} y={400} fill={C.queue} fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 1200)}>{tr(copy.vig.slow)}</text>
    </>
  );
}

/** 4: polling asks again and again; push says it once, the moment it is true. */
function Push({ on }: { on: boolean }) {
  return (
    <>
      <path d="M20 120 L540 120" stroke="var(--ink-3)" strokeWidth={3} fill="none" {...draw(on, 0, 700)} />
      {[80, 190, 300, 410].map((x, i) => (
        <g key={x} {...fade(on, 300 + i * 160)}>
          <path d={`M${x} 120 L${x} 70`} stroke={C.queue} strokeWidth={4} fill="none" />
          <circle cx={x} cy={62} r={9} fill={C.queue} />
        </g>
      ))}
      <path d="M20 320 L540 320" stroke="var(--ink-3)" strokeWidth={3} fill="none" {...draw(on, 200, 700)} />
      <g {...fade(on, 1200)}>
        <path d="M400 380 L400 322" stroke={C.ok} strokeWidth={6} fill="none" style={{ filter: `drop-shadow(0 0 10px ${C.ok})` }} />
        <path d="M376 346 L400 322 L424 346" stroke={C.ok} strokeWidth={6} fill="none" />
        <circle cx={400} cy={400} r={14} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${C.ok})` }} />
      </g>
      <text x={20} y={30} fill={C.queue} fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 300)}>{tr(copy.lanes.poll)}</text>
      <text x={20} y={250} fill={C.ok} fontFamily="var(--font-mono)" fontSize={30} fontWeight={600} {...fade(on, 1000)}>{tr(copy.lanes.push)}</text>
    </>
  );
}

/** 5: the system of record: every state transition is a row that stays. */
function Record({ on }: { on: boolean }) {
  const rows = [copy.vig.pending, copy.vig.submitted, copy.vig.confirmed];
  return (
    <>
      <path d="M50 50 L50 380 A230 36 0 0 0 510 380 L510 50" fill="none" stroke={C.data} strokeWidth={4} {...draw(on, 100, 1000)} />
      <ellipse cx={280} cy={50} rx={230} ry={36} fill="var(--bg)" stroke={C.data} strokeWidth={4} style={{ filter: `drop-shadow(0 0 12px ${C.data})`, opacity: on ? 1 : 0, transition: 'opacity 500ms' }} />
      {rows.map((r, i) => (
        <g key={i} {...fade(on, 500 + i * 350)}>
          <rect x={90} y={120 + i * 80} width={380} height={60} rx={6} fill="var(--surface)" stroke={i === 2 ? C.ok : C.data} strokeWidth={3} />
          <text x={116} y={160 + i * 80} fill={i === 2 ? C.ok : 'var(--ink)'} fontFamily="var(--font-mono)" fontSize={30} fontWeight={600}>{tr(r)}</text>
          <circle cx={436} cy={150 + i * 80} r={9} fill={i === 2 ? C.ok : C.data} />
        </g>
      ))}
    </>
  );
}

const ALL = [Bus, Once, Split, Push, Record];

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
