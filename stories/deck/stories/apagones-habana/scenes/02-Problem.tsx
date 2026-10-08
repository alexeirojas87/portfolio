import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy, project } from '../copy';

/** Eight cards, two staggered columns: the shape of a channel's feed, with placeholder lines instead of text. */
const CARDS: { x: number; y: number; kind: 'post' | 'comment' | 'voice'; d: string }[] = [
  { x: 990, y: 190, kind: 'post', d: '' }, { x: 1400, y: 280, kind: 'comment', d: 'd2' },
  { x: 1030, y: 380, kind: 'voice', d: 'd3' }, { x: 1380, y: 470, kind: 'post', d: '' },
  { x: 990, y: 570, kind: 'comment', d: 'd2' }, { x: 1400, y: 660, kind: 'voice', d: 'd3' },
  { x: 1020, y: 760, kind: 'post', d: '' }, { x: 1380, y: 850, kind: 'comment', d: 'd2' },
];
const KIND_COLOR = { post: 'var(--k-compute)', comment: 'var(--k-client)', voice: 'var(--k-ai)' } as const;

function Card({ kind, d }: { kind: keyof typeof KIND_COLOR; d: string }) {
  const c = KIND_COLOR[kind];
  return (
    <div className={`drift ${d}`} style={{ width: 380, height: 112, boxSizing: 'border-box', padding: '12px 22px', borderRadius: 6, border: `2px solid ${c}`, background: 'var(--surface)', boxShadow: `0 0 34px -8px ${c}` }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.06em', textTransform: 'uppercase', color: c }}>{tr(copy.problem.kinds[kind])}</div>
      {kind === 'voice' ? (
        <svg width={330} height={34} style={{ marginTop: 10 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={i * 11} y={17 - (6 + ((i * 7) % 11) * 1.4)} width={6} height={(6 + ((i * 7) % 11) * 1.4) * 2} rx={3} fill={c} opacity={0.8} />
          ))}
        </svg>
      ) : (
        <>
          <div style={{ marginTop: 14, height: 8, width: '92%', borderRadius: 4, background: 'var(--hair-strong)' }} />
          <div style={{ marginTop: 10, height: 8, width: '64%', borderRadius: 4, background: 'var(--hair-strong)' }} />
        </>
      )}
    </div>
  );
}

function Bulb({ on }: { on: boolean }) {
  return (
    <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
      <g transform="translate(1380 240)" style={{ opacity: on ? 1 : 0, transition: 'opacity 700ms 300ms' }}>
        <circle cx={150} cy={250} r={300} fill="rgba(242,169,59,0.10)" className="flicker" />
        <circle cx={150} cy={250} r={190} fill="rgba(242,169,59,0.16)" className="flicker" />
        <path d="M150 90 C60 90 20 170 20 240 C20 310 80 350 100 420 L200 420 C220 350 280 310 280 240 C280 170 240 90 150 90 Z" fill="rgba(242,169,59,0.35)" stroke="var(--warning)" strokeWidth={6} className="flicker" style={{ filter: 'drop-shadow(0 0 30px var(--warning))' }} />
        <path d="M110 250 L135 330 L150 270 L165 330 L190 250" fill="none" stroke="var(--warning)" strokeWidth={5} strokeLinejoin="round" className="flicker" />
        <rect x={100} y={424} width={100} height={26} rx={6} fill="var(--bg)" stroke="var(--ink-3)" strokeWidth={4} />
        <rect x={112} y={456} width={76} height={22} rx={6} fill="var(--bg)" stroke="var(--ink-3)" strokeWidth={4} />
        <path d="M150 90 L150 -60" stroke="var(--ink-3)" strokeWidth={4} />
      </g>
    </svg>
  );
}

function Problem_() {
  const { here, b, entry, dir } = useScene();
  const ask = tr(copy.problem.ask);
  const askSize = fitSize(ask, 1150, 190);
  const scattered = tr(copy.problem.scattered);
  const scatteredSize = fitSize(scattered, 800, 100);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.problem)}</Eyebrow>

      {/* 02.1 the question every resident has */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={340}>
        <div className="t-statement" style={{ fontSize: askSize, lineHeight: 1.1 }}>
          {ask.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--warning)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>
      <Bulb on={here && b === 0} />

      {/* 02.2 scattered across a channel: free-text posts, comments, voice notes */}
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={300}>
        <div className="t-statement" style={{ fontSize: scatteredSize, lineHeight: 1.1 }}>
          {scattered.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--accent-text)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={600} delay={300}>
        <div className="t-body" style={{ fontSize: 36, width: 760 }}>{tr(project.problem)}</div>
      </Reveal>
      {CARDS.map((c, i) => (
        <Reveal key={i} on={here && b === 1} out={here && b > 1} x={c.x} y={c.y} delay={200 + i * 170} axis="x">
          <Card kind={c.kind} d={c.d} />
        </Reveal>
      ))}

      {/* 02.3 a big 3 counts up: what residents could not see */}
      <Reveal on={here && b === 2} x={150} y={250}>
        <div className="t-numeral" style={{ fontSize: 560, color: 'var(--warning)', textShadow: '0 0 90px rgba(242,169,59,0.6)' }}>
          <CountUp value={3} from={here && b === 2 && dir === 'forward' ? 0 : undefined} entry={entry} ms={1000} delay={300} />
        </div>
      </Reveal>
      <Reveal on={here && b === 2} x={150} y={150}>
        <div className="t-editorial" style={{ fontSize: 44, color: 'var(--ink-2)', width: 1620 }}>{tr(copy.problem.noView)}</div>
      </Reveal>
      {tr(copy.problem.list).map((item, i) => (
        <Reveal key={i} on={here && b === 2} x={700} y={330 + i * 190} delay={300 + i * 300}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, width: 1060 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 56, lineHeight: 1.1, color: 'var(--fault)', textShadow: '0 0 24px var(--fault)' }}>×</span>
            <span className="t-editorial" style={{ fontSize: 52 }}>{item}</span>
          </div>
        </Reveal>
      ))}
    </>
  );
}

/** 02 PROBLEM: the question, the scatter (posts, comments, voice notes), and the three things nobody could see (a counting 3). */
export const Problem = () => <Scene index={1}><Problem_ /></Scene>;
