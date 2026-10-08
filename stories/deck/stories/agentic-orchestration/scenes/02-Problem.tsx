import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy } from '../copy';

function Problem_() {
  const { here, b } = useScene();
  const wanted = tr(copy.problem.wanted);
  const wantedSize = fitSize(wanted, 1620, 120);
  const challenge = tr(copy.problem.challenge);
  const challengeSize = fitSize(challenge, 1500, 150);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.problem)}</Eyebrow>

      {/* 02.1 teams wanted LLM-assisted delivery */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={330}>
        <div className="t-statement" style={{ fontSize: wantedSize, lineHeight: 1.1 }}>
          {wanted.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--accent-text)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>

      {/* 02.2 what agents could not be allowed to do (the four items stagger in on one click) */}
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={190}>
        <div className="t-editorial" style={{ fontSize: 46, color: 'var(--ink-2)' }}>{tr(copy.problem.couldNot)}</div>
      </Reveal>
      {tr(copy.problem.list).map((item, i) => (
        <Reveal key={i} on={here && b === 1} out={here && b > 1} x={150} y={320 + i * 140} delay={200 + i * 260}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 36 }}>
            <span className="mono" style={{ fontSize: 40, color: 'var(--fault)' }}>×</span>
            <span className="t-editorial" style={{ fontSize: 54, whiteSpace: 'nowrap' }}>{item}</span>
          </div>
        </Reveal>
      ))}

      {/* 02.3 the challenge */}
      {challenge.map((w, i) => (
        <Reveal key={i} on={here && b === 2} x={150} y={170 + i * (challengeSize * 1.1)} delay={i * 220} ms={1000}>
          <div className="t-statement" style={{ fontSize: challengeSize, color: i === 2 ? 'var(--accent-text)' : undefined }}>{w}</div>
        </Reveal>
      ))}
      <Reveal on={here && b === 2} x={150} y={850} delay={900}>
        <div className="t-body" style={{ fontSize: 42 }}>{tr(copy.problem.notAdHoc)}</div>
      </Reveal>
    </>
  );
}

/** 02 PROBLEM: what teams wanted, what could not be allowed, and the challenge. */
export const Problem = () => <Scene index={1}><Problem_ /></Scene>;
