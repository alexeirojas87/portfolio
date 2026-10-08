import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { copy } from '../copy';

function Problem_() {
  const { here, b, entry, dir } = useScene();
  const wanted = tr(copy.problem.wanted);
  const wantedSize = fitSize(wanted, 1620, 128);
  const challenge = tr(copy.problem.challenge);
  const challengeSize = fitSize(challenge, 1500, 160);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.problem)}</Eyebrow>

      {/* 02.1 teams wanted LLM-assisted delivery */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={330}>
        <div className="t-statement" style={{ fontSize: wantedSize, lineHeight: 1.12 }}>
          {wanted.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--accent-text)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>

      {/* 02.2 a big 4 counts up, four refusals stagger in */}
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={250}>
        <div className="t-numeral" style={{ fontSize: 560, color: 'var(--accent-text)', textShadow: '0 0 90px rgba(47,91,234,0.7)' }}>
          <CountUp value={4} from={here && b === 1 && dir === 'forward' ? 0 : undefined} entry={entry} ms={1000} delay={300} />
        </div>
      </Reveal>
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={150}>
        <div className="t-editorial" style={{ fontSize: 44, color: 'var(--ink-2)' }}>{tr(copy.problem.couldNot)}</div>
      </Reveal>
      {tr(copy.problem.list).map((item, i) => (
        <Reveal key={i} on={here && b === 1} out={here && b > 1} x={700} y={250 + i * 180} delay={300 + i * 280}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, width: 1060 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 56, lineHeight: 1.1, color: 'var(--fault)', textShadow: '0 0 24px var(--fault)' }}>×</span>
            <span className="t-editorial" style={{ fontSize: 48 }}>{item}</span>
          </div>
        </Reveal>
      ))}

      {/* 02.3 the challenge */}
      {challenge.map((w, i) => (
        <Reveal key={i} on={here && b === 2} x={150} y={170 + i * (challengeSize * 1.1)} delay={i * 240} ms={1000}>
          <div className="t-statement" style={{ fontSize: challengeSize, color: i === 2 ? 'var(--accent-text)' : undefined }}>{w}</div>
        </Reveal>
      ))}
      <div style={{ position: 'absolute', left: 150, top: 830, width: here && b === 2 ? 220 : 0, height: 8, background: 'var(--accent)', boxShadow: '0 0 24px var(--accent)', transition: 'width 800ms var(--ease) 900ms' }} />
      <Reveal on={here && b === 2} x={150} y={870} delay={1000}>
        <div className="t-body" style={{ fontSize: 44 }}>{tr(copy.problem.notAdHoc)}</div>
      </Reveal>
    </>
  );
}

/** 02 PROBLEM: what teams wanted, what could not be allowed (a counting 4), and the challenge. */
export const Problem = () => <Scene index={1}><Problem_ /></Scene>;
