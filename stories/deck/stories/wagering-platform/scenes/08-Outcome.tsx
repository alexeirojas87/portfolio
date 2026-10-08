import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy, project } from '../copy';

function Outcome_() {
  const { here, b, entry, dir } = useScene();
  const closing = tr(copy.outcome.closing);
  const size = fitSize(closing, 1500, 170);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.outcome)}</Eyebrow>

      {/* 08.1 the four public metrics, attributed to the modernization as a whole */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={160}>
        <div className="t-editorial" style={{ fontSize: 48, color: 'var(--ink-2)' }}>{tr(copy.outcome.scope)}</div>
      </Reveal>
      {copy.outcome.metrics.map((m, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        return (
          <Reveal key={i} on={here && b === 0} out={here && b > 0} x={150 + col * 860} y={290 + row * 330} delay={200 + i * 260}>
            <div style={{ width: 800, borderTop: '2px solid var(--hair-strong)', paddingTop: 22 }}>
              <div className="t-numeral" style={{ fontSize: 190, lineHeight: 0.9, color: 'var(--accent-text)', textShadow: '0 0 70px rgba(47,91,234,0.6)' }}>
                <CountUp value={m.n} prefix={m.prefix} suffix="%" from={here && b === 0 && dir === 'forward' ? 0 : undefined} entry={entry} ms={1100} delay={400 + i * 260} />
              </div>
              <div className="t-editorial" style={{ fontSize: 48, fontWeight: 600, marginTop: 14 }}>{tr(m.label)}</div>
            </div>
          </Reveal>
        );
      })}

      {/* 08.2 closing */}
      <div style={{ position: 'absolute', left: 900, top: 160, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,91,234,0.3), transparent 62%)', opacity: here && b === 1 ? 1 : 0, transition: 'opacity 1400ms' }} />
      {closing.map((w, i) => (
        <Reveal key={i} on={here && b === 1} x={150} y={170 + i * size * 1.1} delay={i * 240} ms={1000}>
          <div className="t-statement" style={{ fontSize: size, color: 'var(--accent-text)' }}>{w}</div>
        </Reveal>
      ))}
      <Reveal on={here && b === 1} x={150} y={850} delay={1000}>
        <div className="t-body" style={{ fontSize: 40, width: 1500 }}>{tr(project.tagline)}</div>
      </Reveal>
    </>
  );
}

/** 08 OUTCOME: the public resume metrics (counting), attributed to the modernization as a whole; then the closing callback. */
export const Outcome = () => <Scene index={7}><Outcome_ /></Scene>;
