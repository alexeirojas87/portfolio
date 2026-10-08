import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy, project } from '../copy';
import { Vignette } from '../Vignettes';

function Decisions_() {
  const { here, b } = useScene();
  const total = project.decisions.length;
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.decisions)}</Eyebrow>
      {project.decisions.map((d, i) => {
        const on = here && b === i;
        const out = here && b > i;
        const lines = tr(copy.decisionLines[i]);
        return (
          <div key={i}>
            <Reveal on={on} out={out} x={150} y={170}>
              <div className="t-numeral" style={{ fontSize: 120, color: 'var(--accent-text)', textShadow: '0 0 50px rgba(47,91,234,0.6)' }}>
                {String(i + 1).padStart(2, '0')}<span style={{ fontSize: 48, color: 'var(--ink-3)' }}> / {String(total).padStart(2, '0')}</span>
              </div>
            </Reveal>
            <Reveal on={on} out={out} x={150} y={310} delay={80}>
              <div className="t-statement" style={{ fontSize: fitSize(lines, 1620, 96, 0.78), lineHeight: 1.08 }}>
                {lines.map((l, k) => <div key={k}>{l}</div>)}
              </div>
            </Reveal>
            <Reveal on={on} out={out} x={150} y={600} delay={260}>
              <div className="t-body" style={{ fontSize: 36, width: 1050, color: 'var(--ink)' }}>{tr(d.why)}</div>
            </Reveal>
            <Vignette i={i} on={on} x={1230} y={560} />
          </div>
        );
      })}
    </>
  );
}

/** 08 DECISIONS: one beat per entry of `decisions`: a big index, the title as a statement, the "why" verbatim, and a drawn vignette. */
export const Decisions = () => <Scene index={6}><Decisions_ /></Scene>;
