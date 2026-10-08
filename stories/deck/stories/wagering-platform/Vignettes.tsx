import type { ReactNode } from 'react';
import { EASE } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/** Small diagram per decision, 560 x 440, drawn with stroke animation when `on`. Node-kind colours, same as the world. */
const C = { compute: 'var(--k-compute)', data: 'var(--k-data)', queue: 'var(--k-queue)', ai: 'var(--k-ai)', client: 'var(--k-client)', accent: 'var(--accent-text)', ok: 'var(--ok)', fault: 'var(--fault)' };

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

/** 1: bets keyed by player stay in order inside their own lane. */
function Lanes({ on }: { on: boolean }) {
  const lanes = [{ y: 90, c: C.compute, n: 3 }, { y: 220, c: C.queue, n: 3 }, { y: 350, c: C.ai, n: 2 }];
  return (
    <>
      <Box x={0} y={165} w={130} h={110} color={C.accent} on={on} delay={0} hot>{tr(copy.vig.api)}</Box>
      <Box x={430} y={165} w={130} h={110} color={C.data} on={on} delay={900}>{'›'}</Box>
      {lanes.map((l, i) => (
        <g key={l.y}>
          <path d={`M132 220 C170 220 150 ${l.y} 200 ${l.y} L428 ${l.y}`} stroke={l.c} strokeWidth={4} fill="none" {...draw(on, 200 + i * 200, 900)} />
          {Array.from({ length: l.n }, (_, k) => (
            <circle key={k} cx={250 + k * 70} cy={l.y} r={14} fill="#fff" style={{ opacity: on ? 1 : 0, transition: `opacity 400ms ${900 + i * 150 + k * 140}ms`, filter: `drop-shadow(0 0 10px ${l.c})` }} />
          ))}
          <path d={`M428 ${l.y} L432 ${l.y} L446 ${l.y < 220 ? 190 : l.y > 220 ? 250 : 220}`} stroke={l.c} strokeWidth={3} fill="none" {...fade(on, 1200)} />
        </g>
      ))}
    </>
  );
}

/** 2: a pure library: a snapshot goes in, a decision comes out; HTTP, database and Kafka are not wired in. */
function Pure({ on }: { on: boolean }) {
  return (
    <>
      <Box x={180} y={150} w={200} h={140} color={C.accent} on={on} delay={0} hot>{'limits'}</Box>
      <text x={90} y={110} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 400)}>{tr(copy.vig.snapshot)}</text>
      <path d="M0 220 L176 220" stroke={C.data} strokeWidth={5} fill="none" {...draw(on, 400, 700)} />
      <path d="M384 220 L556 220" stroke={C.ok} strokeWidth={5} fill="none" {...draw(on, 900, 700)} />
      <text x={470} y={186} textAnchor="middle" fill={C.ok} fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 1200)}>{tr(copy.vig.decision)}</text>
      {['http', 'db', 'kafka'].map((t, i) => (
        <g key={t} {...fade(on, 700 + i * 200)}>
          <rect x={60 + i * 160} y={340} width={140} height={64} rx={6} fill="none" stroke="var(--ink-3)" strokeWidth={3} strokeDasharray="8 8" />
          <text x={130 + i * 160} y={382} textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={30}>{t}</text>
          <path d={`M${64 + i * 160} ${410} L${196 + i * 160} ${334}`} stroke={C.fault} strokeWidth={5} />
        </g>
      ))}
    </>
  );
}

/** 3: two passes, the second under a lock, so concurrent bets cannot jointly breach a cap. */
function Twice({ on }: { on: boolean }) {
  return (
    <>
      <circle cx={30} cy={220} r={20} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${C.accent})`, ...fade(on, 0).style }} />
      <path d="M52 220 L130 220" stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(on, 200, 500)} />
      <Box x={130} y={160} w={170} h={120} color={C.compute} on={on} delay={300}>{tr(copy.vig.pass1)}</Box>
      <path d="M302 220 L350 220" stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(on, 700, 400)} />
      <Box x={350} y={150} w={210} h={140} color={C.accent} on={on} delay={700} hot>{tr(copy.vig.pass2)}</Box>
      <g {...fade(on, 1300)}>
        <rect x={420} y={320} width={70} height={52} rx={8} fill="var(--bg)" stroke={C.ok} strokeWidth={5} style={{ filter: `drop-shadow(0 0 12px ${C.ok})` }} />
        <path d="M434 320 L434 300 A21 21 0 0 1 476 300 L476 320" fill="none" stroke={C.ok} strokeWidth={5} />
      </g>
    </>
  );
}

/** 4: services never talk to the front-end: they emit to one topic, a hub fans out to clients. */
function Fan({ on }: { on: boolean }) {
  const sy = [90, 220, 350];
  return (
    <>
      {sy.map((y, i) => (
        <g key={y}>
          <circle cx={30} cy={y} r={20} fill="var(--bg)" stroke={C.compute} strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${C.compute})`, ...fade(on, i * 150).style }} />
          <path d={`M54 ${y} L150 220`} stroke={C.compute} strokeWidth={3} fill="none" {...draw(on, 300 + i * 150, 600)} />
        </g>
      ))}
      <text x={20} y={430} fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 300)}>{tr(copy.vig.services)}</text>
      <rect x={150} y={190} width={140} height={60} rx={30} fill="var(--bg)" stroke={C.queue} strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${C.queue})`, ...fade(on, 600).style }} />
      <path d="M292 220 L350 220" stroke={C.accent} strokeWidth={4} fill="none" {...draw(on, 900, 400)} />
      <Box x={350} y={170} w={110} h={100} color={C.accent} on={on} delay={900} hot>{tr(copy.vig.hub)}</Box>
      {[110, 220, 330].map((y, i) => (
        <g key={y}>
          <path d={`M462 220 L530 ${y}`} stroke={C.ok} strokeWidth={3} fill="none" {...draw(on, 1200 + i * 150, 500)} />
          <circle cx={540} cy={y} r={12} fill={C.client} style={{ filter: `drop-shadow(0 0 8px ${C.client})`, ...fade(on, 1300 + i * 150).style }} />
        </g>
      ))}
      <text x={0} y={30} fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 1500)}>{tr(copy.vig.topic)}</text>
    </>
  );
}

/** 5: a call that retries, trips a breaker, and ends in an explicit error key instead of a silent drop. */
function Resilient({ on }: { on: boolean }) {
  return (
    <>
      <Box x={0} y={150} w={170} h={110} color={C.compute} on={on} delay={0}>{tr(copy.vig.client)}</Box>
      <path d="M172 205 L330 205" stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(on, 300, 500)} />
      <path d="M200 160 C230 90 290 90 320 160" stroke={C.queue} strokeWidth={4} fill="none" strokeDasharray="8 8" {...fade(on, 800)} />
      <text x={260} y={72} textAnchor="middle" fill={C.queue} fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 800)}>{tr(copy.vig.retry)}</text>
      <g {...fade(on, 1100)}>
        <path d="M335 175 L335 235" stroke={C.fault} strokeWidth={8} />
        <path d="M335 205 L368 205" stroke={C.fault} strokeWidth={5} />
        <text x={350} y={290} textAnchor="middle" fill={C.fault} fontFamily="var(--font-mono)" fontSize={30}>{tr(copy.vig.breaker)}</text>
      </g>
      <rect x={400} y={150} width={160} height={110} rx={6} fill="var(--bg)" stroke="var(--ink-3)" strokeWidth={3} strokeDasharray="8 8" {...fade(on, 300)} />
      <path d="M85 270 C85 340 200 350 270 350" stroke={C.ok} strokeWidth={4} fill="none" {...draw(on, 1500, 700)} />
      <g {...fade(on, 1900)}>
        <rect x={270} y={320} width={290} height={64} rx={6} fill="var(--surface)" stroke={C.ok} strokeWidth={4} style={{ filter: `drop-shadow(0 0 12px ${C.ok})` }} />
        <text x={415} y={363} textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize={30} fontWeight={600}>{tr(copy.vig.errorKey)}</text>
      </g>
    </>
  );
}

const ALL = [Lanes, Pure, Twice, Fan, Resilient];

/** The vignette of decision `i` (of the shown ones), in a 560 x 440 box at (x, y) on the stage. */
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
