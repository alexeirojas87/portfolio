import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { KIND_VAR, Node } from '../../../shared/Node';
import { arch, copy, project } from '../copy';

const AGENTS = ['defagent', 'qaagent', 'devagent', 'reviewagent'] as const;
const CYCLE = ['var(--k-compute)', 'var(--k-ai)', 'var(--k-data)', 'var(--k-queue)', 'var(--k-client)'];

function Idea_() {
  const { here, b } = useScene();
  const work = tr(copy.idea.work);
  const decide = tr(copy.idea.decide);
  const workSize = fitSize(work, 1000, 150);
  const decideSize = fitSize(decide, 1000, 160);
  const glance = project.architecture.glance![0];
  const list = tr(copy.idea.workList).split(' · ');
  const gateOn = here && b === 1;
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.idea)}</Eyebrow>

      {/* 03.1 agents do the work: five jobs as glowing chips */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={300}>
        <div className="t-statement" style={{ fontSize: workSize, lineHeight: 1.08 }}>
          {work.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Reveal>
      {list.map((item, i) => (
        <Reveal key={i} on={here && b === 0} out={here && b > 0} x={1130} y={190 + i * 150} delay={250 + i * 200} axis="x">
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 22, width: 640, boxSizing: 'border-box', padding: '0 28px', height: 108, borderRadius: 6,
              border: `2px solid ${CYCLE[i]}`, background: 'var(--surface)', boxShadow: `0 0 40px -8px ${CYCLE[i]}`,
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: CYCLE[i], boxShadow: `0 0 18px 4px ${CYCLE[i]}`, flex: 'none' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 38, fontWeight: 600, lineHeight: 1.1 }}>{item}</span>
          </div>
        </Reveal>
      ))}

      {/* 03.2 humans decide: an approval gate draws itself */}
      <Reveal on={gateOn} out={here && b > 1} x={150} y={300}>
        <div className="t-statement" style={{ fontSize: decideSize, lineHeight: 1.08 }}>
          {decide.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--accent-text)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>
      <Reveal on={gateOn} out={here && b > 1} x={150} y={720} delay={250}>
        <div className="t-body" style={{ fontSize: 40, width: 1000 }}>{tr(copy.idea.decideCap)}</div>
      </Reveal>
      <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
        <g style={{ opacity: gateOn ? 1 : 0, transition: gateOn ? 'opacity 400ms 340ms' : 'opacity 250ms' }}>
          <path d="M1130 540 L1280 540" stroke="var(--ink-2)" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={gateOn ? 0 : 1} style={{ transition: 'stroke-dashoffset 700ms var(--ease) 500ms' }} />
          <path d="M1280 400 L1420 540 L1280 680 L1140 540 Z" transform="translate(140 0)" fill="rgba(47,91,234,0.18)" stroke="var(--accent-text)" strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={gateOn ? 0 : 1} style={{ transition: 'stroke-dashoffset 900ms var(--ease) 600ms', filter: 'drop-shadow(0 0 20px var(--accent))' }} />
          <path d="M1370 545 L1415 592 L1500 490" fill="none" stroke="var(--ok)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={gateOn ? 0 : 1} style={{ transition: 'stroke-dashoffset 700ms var(--ease) 1400ms', filter: 'drop-shadow(0 0 16px var(--ok))' }} />
          <path d="M1560 540 L1760 540" stroke="var(--ok)" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={gateOn ? 0 : 1} style={{ transition: 'stroke-dashoffset 700ms var(--ease) 1800ms' }} />
        </g>
      </svg>
      <Reveal on={gateOn} out={here && b > 1} x={1250} y={730} delay={900}>
        <div className="t-meta" style={{ fontSize: 32, color: 'var(--accent-text)' }}>{tr(copy.idea.gateLabel)}</div>
      </Reveal>

      {/* 03.3 four role-specific agents, straight from the project's own nodes */}
      <Reveal on={here && b === 2} x={150} y={150}>
        <div className="t-statement" style={{ fontSize: 70 }}>{tr(copy.idea.four)}</div>
      </Reveal>
      <Reveal on={here && b === 2} x={150} y={250} delay={120}>
        <div className="t-body" style={{ fontSize: 38 }}>{tr(glance)}</div>
      </Reveal>
      {AGENTS.map((id, i) => (
        <Node key={id} n={arch.node(id)} on={here && b === 2} delay={i * 180}
          rect={{ x: 150 + i * 430, y: 440, w: 395, h: 190 }} />
      ))}
      <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
        {AGENTS.map((id, i) => (
          <path key={id} d={`M${347 + i * 430} 630 L${347 + i * 430} 760`} stroke={KIND_VAR[arch.node(id).kind]} strokeWidth={3} strokeDasharray="10 12" fill="none" opacity={here && b === 2 ? 0.8 : 0} style={{ transition: 'opacity 500ms 900ms' }} />
        ))}
        <path d="M347 760 L1637 760" stroke="var(--ink-3)" strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={here && b === 2 ? 0 : 1} style={{ transition: 'stroke-dashoffset 900ms var(--ease) 1000ms' }} />
      </svg>
    </>
  );
}

/** 03 IDEA: agents do the work, humans decide (a gate draws itself), four role-specific agents. */
export const Idea = () => <Scene index={2}><Idea_ /></Scene>;
