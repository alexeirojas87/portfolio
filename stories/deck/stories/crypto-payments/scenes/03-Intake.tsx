import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { Eyebrow, Line } from '../../../shared/Frame';
import { copy } from '../copy';
import { S_IN } from '../archWorld';

/** The two rails of beat 4: acknowledgement is instant, the chain takes minutes. */
function Rails({ on }: { on: boolean }) {
  return (
    <>
      <Reveal on={on} x={150} y={850}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'baseline' }}>
          <span className="t-meta" style={{ fontSize: 30, color: 'var(--ok)', width: 360 }}>{tr(copy.rails.ack)}</span>
          <span className="t-statement" style={{ fontSize: 64, color: 'var(--ok)', textShadow: '0 0 40px var(--ok)' }}>{tr(copy.rails.ackVal)}</span>
        </div>
      </Reveal>
      <Reveal on={on} x={150} y={930} delay={200}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'baseline' }}>
          <span className="t-meta" style={{ fontSize: 30, color: 'var(--k-queue)', width: 360 }}>{tr(copy.rails.chain)}</span>
          <span className="t-statement" style={{ fontSize: 64, color: 'var(--k-queue)' }}>{tr(copy.rails.chainVal)}</span>
        </div>
      </Reveal>
    </>
  );
}

function Intake_() {
  const { here, b } = useScene();
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.intake)}</Eyebrow>
      {copy.intake.map((p, k) => (
        <Line key={k} on={here && b === k} out={here && b > k} head={tr(p.head)} cap={tr(p.cap)} />
      ))}
      <Rails on={here && b === 3} />
    </>
  );
}

/** 03 INTAKE: text over the world. A request walks checkout, API, store, queue; the acknowledgement returns before the chain has started. */
export const Intake = () => <Scene index={S_IN}><Intake_ /></Scene>;
