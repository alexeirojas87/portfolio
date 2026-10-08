import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy, project } from '../copy';

function Summary_() {
  const { here, b, entry, dir } = useScene();
  const glance = project.architecture.glance ?? [];
  const closing = tr(copy.summary.closing);
  const size = fitSize(closing, 1500, 170);
  // glance[0] is "4 role-specific AI agents": the leading number counts up, the rest is its caption
  const first = tr(glance[0]);
  const num = parseInt(first, 10);
  const rest = first.replace(/^\d+\s*/, '');
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.summary)}</Eyebrow>

      {/* 09.1 the four facts the project data already lists; the 4 is a counter */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={180}>
        <div className="t-numeral" style={{ fontSize: 480, color: 'var(--accent-text)', textShadow: '0 0 90px rgba(47,91,234,0.7)' }}>
          <CountUp value={num} from={here && b === 0 && dir === 'forward' ? 0 : undefined} entry={entry} ms={900} delay={300} />
        </div>
      </Reveal>
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={650} delay={200}>
        <div className="t-statement" style={{ fontSize: 50, width: 560, whiteSpace: 'normal', lineHeight: 1.1 }}>{rest}</div>
      </Reveal>
      {glance.slice(1).map((g, i) => (
        <Reveal key={i} on={here && b === 0} out={here && b > 0} x={760} y={250 + i * 190} delay={400 + i * 260} axis="x">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 36, width: 1010, borderTop: '2px solid var(--hair-strong)', paddingTop: 30 }}>
            <span className="t-meta" style={{ fontSize: 32, color: 'var(--accent-text)' }}>{String(i + 2).padStart(2, '0')}</span>
            <span className="t-editorial" style={{ fontSize: 54, fontWeight: 600 }}>{tr(g)}</span>
          </div>
        </Reveal>
      ))}

      {/* 09.2 closing: the problem's three words, answered */}
      <div style={{ position: 'absolute', left: 900, top: 160, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,91,234,0.3), transparent 62%)', opacity: here && b === 1 ? 1 : 0, transition: 'opacity 1400ms' }} />
      {closing.map((w, i) => (
        <Reveal key={i} on={here && b === 1} x={150} y={170 + i * size * 1.1} delay={i * 240} ms={1000}>
          <div className="t-statement" style={{ fontSize: size, color: 'var(--accent-text)' }}>{w}</div>
        </Reveal>
      ))}
      <Reveal on={here && b === 1} x={150} y={880} delay={1000}>
        <div className="t-body" style={{ fontSize: 40 }}>{tr(project.tagline)}</div>
      </Reveal>
    </>
  );
}

/** 09 SUMMARY: the glance facts (a counting 4), then the closing callback. The data has no "outcome" text, so none is invented. */
export const Summary = () => <Scene index={8}><Summary_ /></Scene>;
