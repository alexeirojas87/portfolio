import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { Node } from '../../../shared/Node';
import { arch, copy, project } from '../copy';

const AGENTS = ['defagent', 'qaagent', 'devagent', 'reviewagent'] as const;

function Idea_() {
  const { here, b } = useScene();
  const work = tr(copy.idea.work);
  const decide = tr(copy.idea.decide);
  const workSize = fitSize(work, 1620, 168);
  const decideSize = fitSize(decide, 1620, 168);
  const glance = project.architecture.glance![0];
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.idea)}</Eyebrow>

      {/* 03.1 agents do the work */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={250}>
        <div className="t-statement" style={{ fontSize: workSize, lineHeight: 1.06 }}>
          {work.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Reveal>
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={770} delay={250}>
        <div className="t-body" style={{ fontSize: 38, width: 1500 }}>{tr(copy.idea.workCap)}</div>
      </Reveal>

      {/* 03.2 humans decide */}
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={250}>
        <div className="t-statement" style={{ fontSize: decideSize, lineHeight: 1.06 }}>
          {decide.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--accent-text)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={770} delay={250}>
        <div className="t-body" style={{ fontSize: 38, width: 1500 }}>{tr(copy.idea.decideCap)}</div>
      </Reveal>

      {/* 03.3 four role-specific agents (from the project's own nodes) */}
      <Reveal on={here && b === 2} x={150} y={150}>
        <div className="t-statement" style={{ fontSize: 64 }}>{tr(copy.idea.four)}</div>
      </Reveal>
      <Reveal on={here && b === 2} x={150} y={250} delay={120}>
        <div className="t-body" style={{ fontSize: 34 }}>{tr(glance)}</div>
      </Reveal>
      {AGENTS.map((id, i) => (
        <Node key={id} n={arch.node(id)} on={here && b === 2} tone="normal" delay={i * 160}
          rect={{ x: 150 + i * 415, y: 430, w: 375, h: 190 }} />
      ))}
    </>
  );
}

/** 03 IDEA: agents do the work, humans decide, four role-specific agents. */
export const Idea = () => <Scene index={2}><Idea_ /></Scene>;
