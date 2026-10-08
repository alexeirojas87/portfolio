import { Reveal, Scene, Terminal, useScene, type TermLine } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow, Line } from '../../../shared/Frame';
import { copy } from '../copy';
import { useLive } from '../live';
import { ALL, KEY, SKIPPED, typed } from '../prompts';
import { S_ID } from '../archWorld';

const TERM = { x: 150, y: 420, w: 1060, size: 36 };
const GATE_X = 1290;

function Idempotent_() {
  const { here, b } = useScene();
  const { ty, cs } = useLive((st) => ({ ty: st.live.ty, cs: st.live.cs }));
  const absorbed = b >= 2 && cs >= 2;
  const lines: TermLine[] = typed(ALL, ty).map((t, i) => (
    i === 4 ? { t, labels: 1 as const, ...(cs >= 2 && b >= 2 ? { marks: [{ text: SKIPPED, on: true, label: tr(copy.idemUi.absorbed) }] } : {}) } : { t }
  ));
  // first message crosses the key check; the redelivery stops at it
  const firstDone = b >= 1 || ty >= 70;
  const p2On = here && b >= 1;
  const p2x = absorbed ? GATE_X - 40 : 1190;
  const scanH = TERM.size * 1.5 * 5 + 2 * 12;
  const vSize = fitSize([tr(copy.idemUi.absorbed)], 470, 96, 0.82);
  return (
    <div className="idem layer">
      <Eyebrow on={here}>{tr(copy.scene.idempotent)}</Eyebrow>
      {copy.idem.map((p, k) => (
        <Line key={k} on={here && b === k} out={here && b > k} head={tr(p.head)} cap={tr(p.cap)} />
      ))}

      <div style={{ position: 'absolute', left: TERM.x - 40, top: TERM.y - 36, width: TERM.w + 80, height: scanH + 72, borderRadius: 8, border: '2px solid var(--hair-strong)', background: 'rgba(8,16,30,0.72)', opacity: here ? 1 : 0, transition: 'opacity 500ms' }} />
      <Reveal on={here} x={TERM.x} y={TERM.y}>
        <Terminal size={TERM.size} width={TERM.w} lines={lines} />
      </Reveal>
      <div
        style={{
          position: 'absolute', left: TERM.x - 40, width: TERM.w + 80, height: 6, background: 'var(--accent-text)', boxShadow: '0 0 40px 10px var(--accent), 0 -60px 70px 0 rgba(47,91,234,0.35)',
          top: cs === 1 ? TERM.y - 36 + scanH + 72 : TERM.y - 36, opacity: here && b === 2 && cs === 1 ? 1 : 0,
          transition: cs === 1 ? 'top 1300ms linear, opacity 200ms' : 'opacity 300ms',
        }}
      />

      {/* the key check: a boundary every message must pass */}
      <div style={{ position: 'absolute', left: GATE_X - 2, top: 340, width: 4, height: here ? 620 : 0, background: 'repeating-linear-gradient(180deg, var(--accent-text) 0 18px, transparent 18px 30px)', boxShadow: '0 0 24px var(--accent)', transition: 'height 900ms var(--ease)' }} />
      <div className="t-meta" style={{ position: 'absolute', left: GATE_X + 22, top: 352, width: 420, fontSize: 30, lineHeight: 1.2, color: 'var(--accent-text)', opacity: here ? 1 : 0, transition: 'opacity 600ms' }}>
        {tr(copy.idemUi.key)} · {KEY}
      </div>

      {/* message 1: crosses and is paid on-chain, once */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 36, borderRadius: '50%', background: '#fff', boxShadow: '0 0 36px 12px var(--ok)', transform: `translate(${(firstDone ? 1620 : 1190) - 18}px, ${560 - 18}px)`, opacity: here && ty >= 40 ? 1 : 0, transition: 'transform 1100ms cubic-bezier(.45,0,.2,1), opacity 300ms' }} />
      {/* message 2: the redelivery, stopped at the check */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 36, borderRadius: '50%', background: '#fff', boxShadow: `0 0 36px 12px ${absorbed ? 'var(--warning)' : 'var(--accent-text)'}`, transform: `translate(${p2x - 18}px, ${840 - 18}px)`, opacity: p2On && ty >= 105 ? (absorbed ? 0.7 : 1) : 0, transition: 'transform 900ms cubic-bezier(.45,0,.2,1), opacity 300ms, box-shadow 300ms' }} />

      {/* the on-chain counter: paid once, and it stays at one */}
      <Reveal on={here && firstDone && b >= 0 && ty >= 70} x={GATE_X + 330} y={430}>
        <div className="t-numeral" style={{ fontSize: 200, color: 'var(--ok)', textShadow: '0 0 60px var(--ok)' }}>1</div>
      </Reveal>
      <Reveal on={here && ty >= 70} x={GATE_X + 330} y={620}>
        <div className="t-meta" style={{ fontSize: 30, color: 'var(--ok)', width: 300, lineHeight: 1.2 }}>{tr(copy.idemUi.paid)}</div>
      </Reveal>
      <Reveal on={here && absorbed} x={GATE_X + 50} y={900}>
        <div className="t-statement" style={{ fontSize: vSize, color: 'var(--warning)', textShadow: '0 0 40px var(--warning)', textTransform: 'uppercase' }}>{tr(copy.idemUi.absorbed)}</div>
      </Reveal>
    </div>
  );
}

/** 05 IDEMPOTENT: a message is consumed and paid once; the same key is redelivered and absorbed at the key check. */
export const Idempotent = () => <Scene index={S_ID}><Idempotent_ /></Scene>;
