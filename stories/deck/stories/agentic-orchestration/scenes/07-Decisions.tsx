import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy, project } from '../copy';

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
            <Reveal on={on} out={out} x={150} y={190}>
              <div className="t-meta" style={{ fontSize: 30, color: 'var(--accent-text)', letterSpacing: '0.1em' }}>
                {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </div>
            </Reveal>
            <Reveal on={on} out={out} x={150} y={270} delay={80}>
              <div className="t-statement" style={{ fontSize: fitSize(lines, 1620, 84, 0.78), lineHeight: 1.08 }}>
                {lines.map((l, k) => <div key={k}>{l}</div>)}
              </div>
            </Reveal>
            <Reveal on={on} out={out} x={150} y={600} delay={260}>
              <div className="t-body" style={{ fontSize: 38, width: 1500, color: 'var(--ink)' }}>{tr(d.why)}</div>
            </Reveal>
          </div>
        );
      })}
    </>
  );
}

/** 07 DECISIONS: one beat per entry of `decisions` (title + the "why", verbatim from the project data). */
export const Decisions = () => <Scene index={6}><Decisions_ /></Scene>;
