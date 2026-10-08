import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy, project } from '../copy';

function Summary_() {
  const { here, b } = useScene();
  const glance = project.architecture.glance ?? [];
  const closing = tr(copy.summary.closing);
  const size = fitSize(closing, 1500, 150);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.summary)}</Eyebrow>

      {/* 08.1 the four facts the project data already lists */}
      {glance.map((g, i) => (
        <Reveal key={i} on={here && b === 0} out={here && b > 0} x={150} y={210 + i * 185} delay={i * 240}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 48, width: 1620, borderTop: '2px solid var(--hair-strong)', paddingTop: 34 }}>
            <span className="t-meta" style={{ fontSize: 28, color: 'var(--accent-text)' }}>{String(i + 1).padStart(2, '0')}</span>
            <span className="t-editorial" style={{ fontSize: 70, fontWeight: 600, whiteSpace: 'nowrap' }}>{tr(g)}</span>
          </div>
        </Reveal>
      ))}

      {/* 08.2 closing: the problem's three words, answered */}
      {closing.map((w, i) => (
        <Reveal key={i} on={here && b === 1} x={150} y={190 + i * size * 1.1} delay={i * 220} ms={1000}>
          <div className="t-statement" style={{ fontSize: size, color: 'var(--accent-text)' }}>{w}</div>
        </Reveal>
      ))}
      <Reveal on={here && b === 1} x={150} y={850} delay={900}>
        <div className="t-body" style={{ fontSize: 38, width: 1500 }}>{tr(project.tagline)}</div>
      </Reveal>
    </>
  );
}

/** 08 SUMMARY: the glance facts, then the closing callback. The data has no "outcome" text, so none is invented. */
export const Summary = () => <Scene index={7}><Summary_ /></Scene>;
