import type { ReactNode } from 'react';
import { EASE } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/** Small diagram per decision, 560 x 440, drawn with stroke animation when `on`. Node-kind colours, same as the world. */
const C = { compute: 'var(--k-compute)', data: 'var(--k-data)', queue: 'var(--k-queue)', ai: 'var(--k-ai)', client: 'var(--k-client)', ext: 'var(--k-external)', accent: 'var(--accent-text)', ok: 'var(--ok)', fault: 'var(--fault)', warn: 'var(--warning)' };

const draw = (on: boolean, delay = 0, ms = 800) => ({
  pathLength: 1, strokeDasharray: 1, strokeDashoffset: on ? 0 : 1,
  style: { transition: `stroke-dashoffset ${ms}ms ${EASE} ${on ? delay : 0}ms` },
});
const fade = (on: boolean, delay = 0) => ({ style: { opacity: on ? 1 : 0, transition: `opacity ${on ? 500 : 200}ms ${on ? delay : 0}ms` } });

function Box({ x, y, w, h, color, on, delay, children, hot, dashed }: { x: number; y: number; w: number; h: number; color: string; on: boolean; delay: number; children?: ReactNode; hot?: boolean; dashed?: boolean }) {
  return (
    <g {...fade(on, delay)}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={hot ? 'var(--surface)' : 'var(--bg)'} stroke={color} strokeWidth={hot ? 5 : 3} strokeDasharray={dashed ? '10 8' : undefined} style={{ filter: `drop-shadow(0 0 ${hot ? 18 : 8}px ${color})` }} />
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize={30} fontWeight={600}>{children}</text>
    </g>
  );
}

const Cross = ({ x, y, s = 18, color = C.fault, on, delay }: { x: number; y: number; s?: number; color?: string; on: boolean; delay: number }) => (
  <path d={`M${x - s} ${y - s} L${x + s} ${y + s} M${x + s} ${y - s} L${x - s} ${y + s}`} stroke={color} strokeWidth={6} strokeLinecap="round" fill="none" style={{ filter: `drop-shadow(0 0 8px ${color})`, opacity: on ? 1 : 0, transition: `opacity 400ms ${on ? delay : 0}ms` }} />
);

/** 1: residents reach Cloudflare; the third-party route is blocked. */
function Edge({ on }: { on: boolean }) {
  return (
    <>
      <Box x={0} y={170} w={170} h={100} color={C.client} on={on} delay={0}>{tr(copy.vig.cuba)}</Box>
      <Box x={310} y={20} w={250} h={100} color={C.ext} on={on} delay={300} dashed>{tr(copy.vig.third)}</Box>
      <Box x={310} y={320} w={250} h={100} color={C.accent} on={on} delay={500} hot>{tr(copy.vig.edge)}</Box>
      <path d="M172 200 C240 160 260 90 308 80" stroke={C.fault} strokeWidth={4} strokeDasharray="10 8" fill="none" {...fade(on, 700)} />
      <Cross x={250} y={116} on={on} delay={1000} />
      <path d="M172 240 C240 290 260 360 308 370" stroke={C.ok} strokeWidth={5} fill="none" style={{ filter: `drop-shadow(0 0 8px ${C.ok})`, transition: `stroke-dashoffset 800ms ${EASE} 900ms` }} pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 0 : 1} />
    </>
  );
}

/** 2: a clock pulls what is new; an always-on connection is crossed out. */
function Pull({ on }: { on: boolean }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    return { x1: 110 + 78 * Math.cos(a), y1: 270 + 78 * Math.sin(a), x2: 110 + 94 * Math.cos(a), y2: 270 + 94 * Math.sin(a) };
  });
  return (
    <>
      <circle cx={110} cy={270} r={100} fill="var(--bg)" stroke={C.accent} strokeWidth={5} style={{ filter: `drop-shadow(0 0 14px ${C.accent})`, ...fade(on, 0).style }} />
      {ticks.map((t, i) => <path key={i} d={`M${t.x1} ${t.y1} L${t.x2} ${t.y2}`} stroke="var(--ink-2)" strokeWidth={4} {...fade(on, 200 + i * 40)} />)}
      <path d="M110 270 L110 214 M110 270 L152 292" stroke="#fff" strokeWidth={6} strokeLinecap="round" fill="none" {...fade(on, 700)} />
      <Box x={330} y={220} w={230} h={110} color={C.accent} on={on} delay={600} hot>{tr(copy.vig.pull)}</Box>
      <path d="M212 270 L328 270" stroke={C.ok} strokeWidth={5} fill="none" {...draw(on, 800, 600)} />
      <Box x={310} y={20} w={250} h={100} color={C.ext} on={on} delay={900} dashed>{tr(copy.vig.server)}</Box>
      <Cross x={435} y={70} s={34} on={on} delay={1300} />
    </>
  );
}

/** 3: a watchdog outside GitHub dispatches into it; GitHub can stall, the watchdog cannot hide it. */
function Outside({ on }: { on: boolean }) {
  return (
    <>
      <rect x={0} y={50} width={270} height={300} rx={10} fill="none" stroke={C.ext} strokeWidth={3} strokeDasharray="12 10" {...fade(on, 0)} />
      <text x={135} y={100} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 200)}>{tr(copy.vig.github)}</text>
      <Box x={40} y={190} w={190} h={110} color={C.fault} on={on} delay={400}>{tr(copy.vig.stalled)}</Box>
      <Box x={340} y={200} w={220} h={110} color={C.accent} on={on} delay={700} hot>{tr(copy.vig.worker)}</Box>
      <path d="M338 255 L275 255" stroke={C.ok} strokeWidth={5} strokeDasharray="12 8" fill="none" style={{ filter: `drop-shadow(0 0 8px ${C.ok})`, opacity: on ? 1 : 0, transition: `opacity 400ms ${on ? 1100 : 0}ms` }} />
      <path d="M296 235 L274 255 L296 275" stroke={C.ok} strokeWidth={5} fill="none" {...fade(on, 1100)} />
    </>
  );
}

/** 4: rules decide; the LLM enriches on the side and never gates publishing. */
function Rules({ on }: { on: boolean }) {
  return (
    <>
      <Box x={0} y={250} w={180} h={110} color={C.compute} on={on} delay={0} hot>{tr(copy.vig.rules)}</Box>
      <Box x={380} y={250} w={180} h={110} color={C.ok} on={on} delay={400}>{tr(copy.vig.publish)}</Box>
      <path d="M184 305 L376 305" stroke={C.ok} strokeWidth={6} fill="none" style={{ filter: `drop-shadow(0 0 8px ${C.ok})`, transition: `stroke-dashoffset 800ms ${EASE} 700ms` }} pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 0 : 1} />
      <Box x={170} y={20} w={220} h={100} color={C.ai} on={on} delay={900} dashed>{tr(copy.vig.llm)}</Box>
      <path d="M90 248 C90 170 150 90 168 80" stroke={C.ai} strokeWidth={4} strokeDasharray="10 8" fill="none" {...fade(on, 1200)} />
      <path d="M392 80 C420 100 460 170 470 248" stroke={C.ai} strokeWidth={4} strokeDasharray="10 8" fill="none" {...fade(on, 1400)} />
    </>
  );
}

/** 5: vectors stay in the database: the query goes in, only the top fragments come out; a static file is crossed out. */
function Vectors({ on }: { on: boolean }) {
  const dots = [[200, 200], [260, 250], [330, 190], [380, 260], [240, 310], [320, 320], [290, 230]];
  return (
    <>
      <rect x={160} y={140} width={260} height={230} rx={14} fill="var(--bg)" stroke={C.data} strokeWidth={5} style={{ filter: `drop-shadow(0 0 16px ${C.data})`, ...fade(on, 0).style }} />
      <text x={290} y={180} textAnchor="middle" fill={C.data} fontFamily="var(--font-mono)" fontSize={30} fontWeight={600} {...fade(on, 300)}>{tr(copy.vig.db)}</text>
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y + 20} r={i === 3 || i === 6 ? 10 : 7} fill={i === 3 || i === 6 ? C.accent : C.data} style={{ filter: `drop-shadow(0 0 8px ${i === 3 || i === 6 ? C.accent : C.data})`, opacity: on ? 1 : 0, transition: `opacity 400ms ${400 + i * 100}ms` }} />)}
      <path d="M0 255 L156 255" stroke={C.accent} strokeWidth={5} fill="none" {...draw(on, 800, 600)} />
      <text x={0} y={235} fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={30} {...fade(on, 900)}>{tr(copy.vig.query)}</text>
      <path d="M424 230 L540 200 M424 250 L540 250 M424 270 L540 300" stroke={C.ok} strokeWidth={4} fill="none" {...draw(on, 1300, 600)} />
      <Box x={310} y={400} w={250} h={40} color={C.ext} on={on} delay={1500} dashed>{''}</Box>
      <text x={435} y={430} textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={28} {...fade(on, 1500)}>{tr(copy.vig.json)}</text>
      <path d="M312 420 L558 420" stroke={C.fault} strokeWidth={5} {...fade(on, 1800)} />
    </>
  );
}

const ALL = [Edge, Pull, Outside, Rules, Vectors];

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
