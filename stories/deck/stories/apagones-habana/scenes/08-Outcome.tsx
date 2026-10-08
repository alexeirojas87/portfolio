import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { LIVE_HOST, copy, project } from '../copy';

function Outcome_() {
  const { here, b, entry, dir } = useScene();
  const glance = project.architecture.glance ?? [];
  const closing = tr(copy.outcome.closing);
  const size = fitSize(closing, 1500, 170);
  // glance[0] is "Triggered by an external watchdog every 30 min": the number counts up, the sentence stays whole
  const first = tr(glance[0]);
  const num = parseInt(first.match(/\d+/)?.[0] ?? '0', 10);
  const hostSize = fitSize([LIVE_HOST], 1500, 92, 0.62);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.outcome)}</Eyebrow>

      {/* 08.1 the facts the project data already lists; the 30 is a counter */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={170}>
        <div className="t-numeral" style={{ fontSize: 440, color: 'var(--warning)', textShadow: '0 0 90px rgba(242,169,59,0.55)', display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <span><CountUp value={num} from={here && b === 0 && dir === 'forward' ? 0 : undefined} entry={entry} ms={1100} delay={300} /></span>
        </div>
      </Reveal>
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={640} delay={200}>
        <div className="t-statement" style={{ fontSize: 48, width: 640, whiteSpace: 'normal', lineHeight: 1.12 }}>{first}</div>
      </Reveal>
      {glance.slice(1).map((g, i) => (
        <Reveal key={i} on={here && b === 0} out={here && b > 0} x={860} y={240 + i * 170} delay={400 + i * 260} axis="x">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 36, width: 910, borderTop: '2px solid var(--hair-strong)', paddingTop: 26 }}>
            <span className="t-meta" style={{ fontSize: 32, color: 'var(--accent-text)' }}>{String(i + 2).padStart(2, '0')}</span>
            <span className="t-editorial" style={{ fontSize: 50, fontWeight: 600 }}>{tr(g)}</span>
          </div>
        </Reveal>
      ))}

      {/* 08.2 closing: what the problem lacked, answered; and the live address */}
      <div style={{ position: 'absolute', left: 900, top: 160, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,169,59,0.22), rgba(47,91,234,0.18) 40%, transparent 66%)', opacity: here && b === 1 ? 1 : 0, transition: 'opacity 1400ms' }} />
      {closing.map((w, i) => (
        <Reveal key={i} on={here && b === 1} x={150} y={170 + i * size * 1.08} delay={i * 240} ms={1000}>
          <div className="t-statement" style={{ fontSize: size, color: i === 2 ? 'var(--warning)' : 'var(--accent-text)', textShadow: i === 2 ? '0 0 50px rgba(242,169,59,0.6)' : undefined }}>{w}</div>
        </Reveal>
      ))}
      <Reveal on={here && b === 1} x={150} y={830} delay={1000}>
        <div className="t-statement" style={{ fontSize: hostSize, color: 'var(--ink)' }}>{LIVE_HOST}</div>
      </Reveal>
      <Reveal on={here && b === 1} x={150} y={940} delay={1300}>
        <div className="t-body" style={{ fontSize: 36 }}>{tr(project.tagline)}</div>
      </Reveal>
    </>
  );
}

/** 08 OUTCOME: the glance facts (a counting 30), then the closing callback and the live address. The data has no usage numbers, so none is invented. */
export const Outcome = () => <Scene index={7}><Outcome_ /></Scene>;
