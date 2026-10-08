import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy, project } from '../copy';

function Outcome_() {
  const { here, b, entry, dir } = useScene();
  const glance = project.architecture.glance ?? [];
  const closing = tr(copy.outcome.closing);
  const size = fitSize(closing, 1500, 150);
  const faster = tr(copy.outcome.faster);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.outcome)}</Eyebrow>

      {/* 08.1 the public resume metric, attributed, beside the four facts the project data lists */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={260}>
        <div className="t-numeral" style={{ fontSize: 300, color: 'var(--accent-text)', textShadow: '0 0 90px rgba(47,91,234,0.7)' }}>
          <CountUp value={20} from={here && b === 0 && dir === 'forward' ? 0 : undefined} entry={entry} ms={1100} delay={300} suffix="%" />
        </div>
      </Reveal>
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={600} delay={200}>
        <div className="t-statement" style={{ fontSize: 56, lineHeight: 1.1 }}>
          {faster.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Reveal>
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={800} delay={400}>
        <div className="t-body" style={{ fontSize: 34, width: 760 }}>{tr(copy.outcome.attribution)}</div>
      </Reveal>
      {glance.map((g, i) => (
        <Reveal key={i} on={here && b === 0} out={here && b > 0} x={1100} y={210 + i * 170} delay={400 + i * 260} axis="x">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 30, width: 670, borderTop: '2px solid var(--hair-strong)', paddingTop: 26 }}>
            <span className="t-meta" style={{ fontSize: 32, color: 'var(--accent-text)' }}>{String(i + 1).padStart(2, '0')}</span>
            <span className="t-editorial" style={{ fontSize: 42, fontWeight: 600 }}>{tr(g)}</span>
          </div>
        </Reveal>
      ))}

      {/* 08.2 closing */}
      <div style={{ position: 'absolute', left: 900, top: 160, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,91,234,0.3), transparent 62%)', opacity: here && b === 1 ? 1 : 0, transition: 'opacity 1400ms' }} />
      {closing.map((w, i) => (
        <Reveal key={i} on={here && b === 1} x={150} y={170 + i * size * 1.1} delay={i * 240} ms={1000}>
          <div className="t-statement" style={{ fontSize: size, color: i === 2 ? 'var(--accent-text)' : undefined }}>{w}</div>
        </Reveal>
      ))}
      <Reveal on={here && b === 1} x={150} y={880} delay={1000}>
        <div className="t-body" style={{ fontSize: 40 }}>{tr(project.tagline)}</div>
      </Reveal>
    </>
  );
}

/** 08 OUTCOME: the attributed 20% metric beside the glance facts, then the closing callback. */
export const Outcome = () => <Scene index={7}><Outcome_ /></Scene>;
