import { CountUp, EASE, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { Eyebrow, Line } from '../../../shared/Frame';
import { copy } from '../copy';
import { S_LIM } from '../archWorld';

/** Illustrative caps (see the audit): current value, cap, and the value after the rejected bet. */
const METERS = [
  { key: 'pick', n: 25, cap: 50, over: 25 },
  { key: 'parlay', n: 3, cap: 5, over: 3 },
  { key: 'game', n: 80, cap: 100, over: 120 },
] as const;

function Limits_() {
  const { here, b, entry, dir } = useScene();
  return (
    <>
      <Eyebrow on={here}>{tr(copy.scene.limits)}</Eyebrow>
      {copy.limits.map((p, k) => <Line key={k} on={here && b === k} out={here && b > k} head={tr(p.head)} cap={tr(p.cap)} />)}
      {METERS.map((m, i) => {
        const on = here && b >= 1;
        const over = b === 2 && m.key === 'game';
        const value = over ? m.over : m.n;
        const color = over ? 'var(--fault)' : 'var(--accent-text)';
        const pct = Math.min(100, (value / m.cap) * 100);
        const animate = here && ((b === 1 && dir === 'forward') || (b === 2 && dir === 'forward' && m.key === 'game'));
        const from = animate ? (b === 2 ? m.n : 0) : undefined;
        return (
          <div key={m.key}>
            <div className="t-meta" style={{ position: 'absolute', left: 150, top: 410 + i * 170, fontSize: 32, color: 'var(--ink-2)', opacity: on ? 1 : 0, transition: `opacity 500ms ${EASE} ${i * 140}ms` }}>{tr(copy.meters[m.key])}</div>
            <div
              style={{
                position: 'absolute', left: 150, top: 456 + i * 170, width: 720, height: 78, boxSizing: 'border-box', borderRadius: 6, background: 'var(--bg)', overflow: 'hidden',
                border: `3px solid ${over ? 'var(--fault)' : 'var(--hair-strong)'}`, boxShadow: over ? '0 0 40px -6px var(--fault)' : 'none',
                opacity: on ? 1 : 0, transform: `translateX(${on ? 0 : -16}px)`, transition: `opacity 500ms ${EASE} ${i * 140}ms, transform 600ms ${EASE} ${i * 140}ms, border-color 400ms, box-shadow 400ms`,
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${on ? pct : 0}%`, background: over ? 'rgba(224,85,158,0.34)' : 'rgba(47,91,234,0.4)', transition: `width 1200ms ${EASE} ${i * 140 + 200}ms, background 400ms` }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 20px', fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 600, color }}>
                <span><CountUp value={value} from={from} entry={entry} ms={1200} delay={i * 140 + 200} /> / {m.cap}</span>
                <span style={{ fontSize: 30, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: over ? 1 : 0, transition: 'opacity 400ms 900ms' }}>{tr(copy.meters.over)}</span>
              </div>
            </div>
          </div>
        );
      })}
      <div className="t-meta" style={{ position: 'absolute', left: 150, top: 940, fontSize: 30, color: 'var(--ink-3)', opacity: here && b >= 1 ? 1 : 0, transition: 'opacity 500ms 600ms' }}>{tr(copy.meters.illustrative)}</div>
    </>
  );
}

/** 05 LIMITS ENGINE: a pure library; three caps count up (illustrative numbers), then a bet over the per-game cap is rejected. */
export const Limits = () => <Scene index={S_LIM}><Limits_ /></Scene>;
