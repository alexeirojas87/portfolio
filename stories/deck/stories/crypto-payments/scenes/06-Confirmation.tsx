import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { Eyebrow, Line } from '../../../shared/Frame';
import { copy } from '../copy';
import { PC_END, PC_EVENT, useLive } from '../live';
import { S_CF } from '../archWorld';

const X0 = 330, STEP = 165, POLL_Y = 520, PUSH_Y = 800;
const tx = (t: number) => X0 + t * STEP;
const POLL_TICKS = [1, 3, 5];

/** Beat 4: the same confirmation, seen by a polling client and by a pushed one. Ticks are illustrative time, not seconds. */
function Lanes({ on, pc }: { on: boolean; pc: number }) {
  const landed = pc >= PC_EVENT;
  return (
    <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
      <g style={{ opacity: on ? 1 : 0, transition: 'opacity 500ms 300ms' }}>
        <text x={X0} y={POLL_Y - 110} fill="var(--k-queue)" fontFamily="var(--font-mono)" fontSize={38} fontWeight={600} style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>{tr(copy.lanes.poll)}</text>
        <text x={X0} y={PUSH_Y - 110} fill="var(--ok)" fontFamily="var(--font-mono)" fontSize={38} fontWeight={600} style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>{tr(copy.lanes.push)}</text>
        <path d={`M${X0} ${POLL_Y} L${tx(PC_END)} ${POLL_Y}`} stroke="var(--ink-3)" strokeWidth={4} fill="none" />
        <path d={`M${X0} ${PUSH_Y} L${tx(PC_END)} ${PUSH_Y}`} stroke="var(--ink-3)" strokeWidth={4} fill="none" />
        {/* the moment the payment is confirmed */}
        <path d={`M${tx(PC_EVENT)} ${POLL_Y - 70} L${tx(PC_EVENT)} ${PUSH_Y + 70}`} stroke="var(--accent-text)" strokeWidth={4} strokeDasharray="6 12" fill="none" style={{ opacity: landed ? 1 : 0, transition: 'opacity 400ms', filter: 'drop-shadow(0 0 8px var(--accent))' }} />
        <text x={tx(PC_EVENT)} y={PUSH_Y + 120} textAnchor="middle" fill="var(--accent-text)" fontFamily="var(--font-mono)" fontSize={32} fontWeight={600} style={{ letterSpacing: '0.06em', textTransform: 'uppercase', opacity: landed ? 1 : 0, transition: 'opacity 400ms' }}>{tr(copy.badge.confirmed)}</text>
        {POLL_TICKS.map((t) => {
          const shown = pc >= t;
          const done = t > PC_EVENT;
          const col = done ? 'var(--ok)' : 'var(--k-queue)';
          return (
            <g key={t} style={{ opacity: shown ? 1 : 0, transition: 'opacity 300ms' }}>
              <path d={`M${tx(t)} ${POLL_Y} L${tx(t)} ${POLL_Y - 60}`} stroke={col} strokeWidth={5} fill="none" />
              <circle cx={tx(t)} cy={POLL_Y - 70} r={11} fill={col} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
              <text x={tx(t)} y={POLL_Y + 56} textAnchor="middle" fill={col} fontFamily="var(--font-mono)" fontSize={30} fontWeight={600}>{tr(done ? copy.lanes.done : copy.lanes.notYet)}</text>
            </g>
          );
        })}
        <text x={tx(5)} y={POLL_Y + 100} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={30} style={{ opacity: pc >= 5 ? 1 : 0, transition: 'opacity 300ms' }}>{tr(copy.lanes.late)}</text>
        <g style={{ opacity: landed ? 1 : 0, transition: 'opacity 300ms' }}>
          <path d={`M${tx(PC_EVENT)} ${PUSH_Y + 60} L${tx(PC_EVENT)} ${PUSH_Y + 6}`} stroke="var(--ok)" strokeWidth={6} fill="none" style={{ filter: 'drop-shadow(0 0 10px var(--ok))' }} />
          <circle cx={tx(PC_EVENT)} cy={PUSH_Y} r={20} fill="#fff" style={{ filter: 'drop-shadow(0 0 20px var(--ok))' }} />
          <text x={tx(PC_EVENT) + 40} y={PUSH_Y - 24} fill="var(--ok)" fontFamily="var(--font-mono)" fontSize={30} fontWeight={600}>{tr(copy.lanes.now)}</text>
        </g>
      </g>
    </svg>
  );
}

function Confirmation_() {
  const { here, b } = useScene();
  const pc = useLive((st) => st.live.pc);
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.confirmation)}</Eyebrow>
      {copy.confirmation.map((p, k) => (
        <Line key={k} on={here && b === k} out={here && b > k} head={tr(p.head)} cap={tr(p.cap)} />
      ))}
      <Lanes on={here && b === 3} pc={pc} />
      <Reveal on={here && b === 3} x={150} y={940} delay={200}>
        <div className="t-meta" style={{ fontSize: 28, color: 'var(--warning)' }}>{tr(copy.badge.illustrative)}</div>
      </Reveal>
    </>
  );
}

/** 06 CONFIRMATION: text over the world (watcher, counter, event, SignalR push), then the polling-versus-push lanes. */
export const Confirmation = () => <Scene index={S_CF}><Confirmation_ /></Scene>;
