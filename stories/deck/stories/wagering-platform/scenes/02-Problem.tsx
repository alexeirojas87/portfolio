import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy } from '../copy';

/** The old path as a picture: many bets converge on one narrow synchronous box that glows red. */
function Pipe({ on }: { on: boolean }) {
  const ys = [330, 410, 490, 570, 650, 730];
  const draw = (d: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, style: { transition: `stroke-dashoffset 800ms var(--ease) ${on ? 500 + d : 0}ms` } });
  return (
    <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
      {ys.map((y, i) => (
        <g key={y}>
          <path d={`M1000 ${y} L1380 ${530 + (i - 2.5) * 12}`} stroke="var(--ink-2)" strokeWidth={4} fill="none" {...draw(i * 90)} />
          <circle cx={1000} cy={y} r={14} fill="#fff" style={{ opacity: on ? 1 : 0, transition: `opacity 400ms ${400 + i * 90}ms`, filter: 'drop-shadow(0 0 10px var(--accent-text))' }} />
        </g>
      ))}
      <g style={{ opacity: on ? 1 : 0, transition: 'opacity 500ms 1000ms' }}>
        <rect x={1380} y={440} width={460} height={180} rx={6} fill="var(--surface)" stroke="var(--fault)" strokeWidth={6} style={{ filter: 'drop-shadow(0 0 24px var(--fault))' }} />
        <text x={1610} y={518} textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize={30} fontWeight={600}>{tr(copy.problem.pipe)}</text>
        <text x={1610} y={576} textAnchor="middle" fill="var(--fault)" fontFamily="var(--font-mono)" fontSize={40} fontWeight={700}>✕</text>
      </g>
    </svg>
  );
}

function Problem_() {
  const { here, b, entry, dir } = useScene();
  const old = tr(copy.problem.old);
  const oldSize = fitSize(old, 1000, 128);
  const need = tr(copy.problem.need);
  const needSize = fitSize(need, 1620, 150);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.problem)}</Eyebrow>

      {/* 02.1 one monolithic, synchronous path */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={300}>
        <div className="t-statement" style={{ fontSize: oldSize, lineHeight: 1.12 }}>
          {old.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--fault)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={680} delay={250}>
        <div className="t-body" style={{ fontSize: 40, width: 800 }}>{tr(copy.problem.oldCap)}</div>
      </Reveal>
      <div style={{ opacity: here && b === 0 ? 1 : 0, transition: 'opacity 350ms' }}><Pipe on={here && b === 0} /></div>

      {/* 02.2 a big 3 counts up, three failures stagger in */}
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={250}>
        <div className="t-numeral" style={{ fontSize: 560, color: 'var(--accent-text)', textShadow: '0 0 90px rgba(47,91,234,0.7)' }}>
          <CountUp value={3} from={here && b === 1 && dir === 'forward' ? 0 : undefined} entry={entry} ms={900} delay={300} />
        </div>
      </Reveal>
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={150}>
        <div className="t-editorial" style={{ fontSize: 44, color: 'var(--ink-2)' }}>{tr(copy.problem.couldNot)}</div>
      </Reveal>
      {tr(copy.problem.list).map((item, i) => (
        <Reveal key={i} on={here && b === 1} out={here && b > 1} x={700} y={290 + i * 210} delay={300 + i * 280}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, width: 1060 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 56, lineHeight: 1.1, color: 'var(--fault)', textShadow: '0 0 24px var(--fault)' }}>×</span>
            <span className="t-editorial" style={{ fontSize: 52 }}>{item}</span>
          </div>
        </Reveal>
      ))}

      {/* 02.3 the need */}
      {need.map((w, i) => (
        <Reveal key={i} on={here && b === 2} x={150} y={170 + i * (needSize * 1.12)} delay={i * 240} ms={1000}>
          <div className="t-statement" style={{ fontSize: needSize, color: i === 2 ? 'var(--accent-text)' : undefined }}>{w}</div>
        </Reveal>
      ))}
      <div style={{ position: 'absolute', left: 150, top: 800, width: here && b === 2 ? 220 : 0, height: 8, background: 'var(--accent)', boxShadow: '0 0 24px var(--accent)', transition: 'width 800ms var(--ease) 900ms' }} />
      <Reveal on={here && b === 2} x={150} y={840} delay={1000}>
        <div className="t-body" style={{ fontSize: 36, width: 1500 }}>{tr(copy.problem.needCap)}</div>
      </Reveal>
    </>
  );
}

/** 02 PROBLEM: the monolithic synchronous path, what it could not do (a counting 3), and what the operator needed. */
export const Problem = () => <Scene index={1}><Problem_ /></Scene>;
