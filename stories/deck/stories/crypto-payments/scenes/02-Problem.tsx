import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow } from '../../../shared/Frame';
import { KIND_VAR } from '../../../shared/Node';
import { copy } from '../copy';
import { useLive } from '../live';

const COIN_COL = ['var(--k-queue)', 'var(--k-compute)', 'var(--k-client)', 'var(--k-external)'];

function Problem_() {
  const { here, b } = useScene();
  const pb = useLive((st) => st.live.pb);
  const wanted = tr(copy.problem.wanted);
  const slow = tr(copy.problem.slow);
  const challenge = tr(copy.problem.challenge);
  const wantedSize = fitSize(wanted, 1620, 128);
  const slowSize = fitSize(slow, 1500, 140);
  const challengeSize = fitSize(challenge, 1500, 130);
  const coins = tr(copy.problem.coins);
  const stuck = pb >= 1;
  const failed = pb >= 2;
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.problem)}</Eyebrow>

      {/* 02.1 merchants wanted any cryptocurrency: four coin chips, no integration code */}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={250}>
        <div className="t-statement" style={{ fontSize: wantedSize, lineHeight: 1.12 }}>
          {wanted.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--accent-text)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>
      {coins.map((c, i) => (
        <Reveal key={i} on={here && b === 0} out={here && b > 0} x={150 + i * 410} y={640} delay={300 + i * 180} axis="x">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: 380, boxSizing: 'border-box', padding: '0 26px', height: 104, borderRadius: 6, border: `2px solid ${COIN_COL[i]}`, background: 'var(--surface)', boxShadow: `0 0 40px -8px ${COIN_COL[i]}` }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: COIN_COL[i], boxShadow: `0 0 18px 4px ${COIN_COL[i]}`, flex: 'none' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 38, fontWeight: 600 }}>{c}</span>
          </div>
        </Reveal>
      ))}
      <Reveal on={here && b === 0} out={here && b > 0} x={150} y={820} delay={1000}>
        <div className="t-body" style={{ fontSize: 44 }}>{tr(copy.problem.noIntegration)}</div>
      </Reveal>

      {/* 02.2 on-chain is slow and can fail: a lane that waits, then breaks (automatic) */}
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={170}>
        <div className="t-statement" style={{ fontSize: slowSize, lineHeight: 1.1 }}>
          {slow.map((l, i) => <div key={i} style={i === 1 ? { color: 'var(--fault)' } : undefined}>{l}</div>)}
        </div>
      </Reveal>
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={800}>
        <div className="t-body" style={{ fontSize: 40 }}>{tr(copy.problem.slowCap)}</div>
      </Reveal>
      <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
        <g style={{ opacity: here && b === 1 ? 1 : 0, transition: 'opacity 400ms 300ms' }}>
          <path d="M150 600 L1770 600" stroke="var(--ink-3)" strokeWidth={4} fill="none" strokeDasharray="4 14" />
          <circle cx={150} cy={600} r={18} fill="var(--bg)" stroke={KIND_VAR.client} strokeWidth={4} />
          <path
            d="M150 600 L1130 600" stroke={failed ? 'var(--fault)' : 'var(--accent-text)'} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={1}
            strokeDashoffset={stuck ? 0 : 1} style={{ transition: 'stroke-dashoffset 4200ms linear, stroke 300ms', filter: 'drop-shadow(0 0 10px var(--accent))' }}
          />
          <circle cx={1130} cy={600} r={16} fill="#fff" style={{ opacity: stuck && !failed ? 1 : 0, transition: 'opacity 300ms', filter: 'drop-shadow(0 0 14px var(--accent-text))' }} />
          <path d="M1090 560 L1170 640 M1170 560 L1090 640" stroke="var(--fault)" strokeWidth={10} strokeLinecap="round" style={{ opacity: failed ? 1 : 0, transition: 'opacity 300ms', filter: 'drop-shadow(0 0 12px var(--fault))' }} />
          <text x={150} y={540} fill="var(--accent-text)" fontFamily="var(--font-mono)" fontSize={34} fontWeight={600} style={{ letterSpacing: '0.06em', textTransform: 'uppercase', opacity: stuck && !failed ? 1 : 0, transition: 'opacity 300ms' }}>{tr(copy.problem.waiting)}</text>
          <text x={1190} y={540} fill="var(--fault)" fontFamily="var(--font-mono)" fontSize={34} fontWeight={600} style={{ letterSpacing: '0.06em', textTransform: 'uppercase', opacity: failed ? 1 : 0, transition: 'opacity 300ms' }}>{tr(copy.problem.failed)}</text>
        </g>
      </svg>

      {/* 02.3 the challenge */}
      {challenge.map((w, i) => (
        <Reveal key={i} on={here && b === 2} x={150} y={170 + i * (challengeSize * 1.12)} delay={i * 240} ms={1000}>
          <div className="t-statement" style={{ fontSize: challengeSize, color: i === 2 ? 'var(--accent-text)' : undefined }}>{w}</div>
        </Reveal>
      ))}
      <div style={{ position: 'absolute', left: 150, top: 760, width: here && b === 2 ? 220 : 0, height: 8, background: 'var(--accent)', boxShadow: '0 0 24px var(--accent)', transition: 'width 800ms var(--ease) 900ms' }} />
      <Reveal on={here && b === 2} x={150} y={800} delay={1000}>
        <div className="t-body" style={{ fontSize: 44 }}>{tr(copy.problem.challengeCap)}</div>
      </Reveal>
    </>
  );
}

/** 02 PROBLEM: merchants wanted any coin, on-chain is slow and can fail (an automatic wait that breaks), the three-part challenge. */
export const Problem = () => <Scene index={1}><Problem_ /></Scene>;
