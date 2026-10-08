import { Reveal, Scene, Terminal, useScene, type TermLine } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { Eyebrow, Line } from '../../../shared/Frame';
import { arch, copy } from '../copy';
import { useLive } from '../live';
import { BLOCKED, CLEAN, FLAGS, REDACTED, typed } from '../prompts';
import { S_CERB } from '../archWorld';

const TERM = { x: 150, y: 400, w: 1060, size: 36 };
const BOUNDARY_X = 1290;

/** Terminal lines for the current stage of the demo (text is always character-exact from prompts.ts). */
function useLines(b: number): TermLine[] {
  const { ty, cs } = useLive((st) => ({ ty: st.live.ty, cs: st.live.cs }));
  const clean = b >= 3;
  if (clean) return typed(CLEAN, ty).map((t) => ({ t }));
  if (cs >= 3) {
    return REDACTED.map((t, i) => (i >= 2 ? { t, labels: 1 as const, marks: [{ text: '[REDACTED]', on: true, label: tr(copy.mark.redacted) }] } : { t }));
  }
  const lines = typed(BLOCKED, ty);
  return lines.map((t, i) => {
    const f = FLAGS.find((x) => x.line === i);
    if (!f) return { t };
    return { t, labels: 1 as const, ...(cs >= 2 ? { marks: [{ text: f.text, on: true, label: tr(copy.mark[f.label]) }] } : {}) };
  });
}

function Cerberus_() {
  const { here, b } = useScene();
  const cs = useLive((st) => st.live.cs);
  const lines = useLines(b);
  const clean = b >= 3;
  const blocked = !clean && cs >= 4;
  const allowed = clean && cs >= 4;
  const verdict = tr(blocked || b < 3 ? copy.verdict.blocked : copy.verdict.allowed);
  const vSize = fitSize([tr(copy.verdict.blocked), tr(copy.verdict.allowed)], 470, 96, 0.82);
  const vOn = here && (blocked || allowed);
  const prov = arch.node('provider');
  // the packet leaving the prompt: stops at the boundary when blocked, crosses it when clean
  const px = clean ? (cs >= 4 ? 1560 : 1190) : cs >= 4 ? BOUNDARY_X - 36 : 1190;
  const py = clean && cs >= 4 ? 790 : 520;
  const pOn = here && cs >= 1 && (!clean || b === 3);
  const pColor = blocked ? 'var(--fault)' : allowed ? 'var(--ok)' : 'var(--accent-text)';
  const scanH = TERM.size * 1.5 * 5 + 3 * 46;
  return (
    <div className="cerb layer">
      <Eyebrow on={here}>{tr(copy.scene.cerberus)}</Eyebrow>
      {copy.cerberus.map((p, k) => (
        <Line key={k} on={here && b === k} out={here && b > k} head={tr(p.head)} cap={tr(p.cap)} />
      ))}

      {/* the terminal, framed like a panel, with the scan beam sweeping down it */}
      <div style={{ position: 'absolute', left: TERM.x - 40, top: TERM.y - 36, width: TERM.w + 80, height: scanH + 72, borderRadius: 8, border: '2px solid var(--hair-strong)', background: 'rgba(8,16,30,0.72)', opacity: here ? 1 : 0, transition: 'opacity 500ms' }} />
      <Reveal on={here} x={TERM.x} y={TERM.y}>
        <Terminal size={TERM.size} width={TERM.w} lines={lines} />
      </Reveal>
      <div
        style={{
          position: 'absolute', left: TERM.x - 40, width: TERM.w + 80, height: 6, background: 'var(--accent-text)', boxShadow: '0 0 40px 10px var(--accent), 0 -60px 70px 0 rgba(47,91,234,0.35)',
          top: cs === 1 ? TERM.y - 36 + scanH + 72 : TERM.y - 36, opacity: here && cs === 1 ? 1 : 0,
          transition: cs === 1 ? 'top 1500ms linear, opacity 200ms' : 'opacity 300ms',
        }}
      />

      {/* the trust boundary, with Cerberus standing on it */}
      <div style={{ position: 'absolute', left: BOUNDARY_X - 2, top: 330, width: 4, height: here ? 640 : 0, background: 'repeating-linear-gradient(180deg, var(--k-ai) 0 18px, transparent 18px 30px)', boxShadow: '0 0 24px var(--k-ai)', transition: 'height 900ms var(--ease)' }} />
      <div className="t-meta" style={{ position: 'absolute', left: BOUNDARY_X + 22, top: 345, width: 400, fontSize: 30, lineHeight: 1.2, color: 'var(--k-ai)', opacity: here ? 1 : 0, transition: 'opacity 600ms' }}>
        {tr(copy.verdict.boundary)}
      </div>

      {/* the packet: the prompt on its way out */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 36, borderRadius: '50%', background: '#fff', boxShadow: `0 0 36px 12px ${pColor}`, transform: `translate(${px - 18}px, ${py - 18}px)`, opacity: pOn ? 1 : 0, transition: 'transform 900ms cubic-bezier(.45,0,.2,1), opacity 300ms, box-shadow 300ms' }} />

      {/* verdict and the provider on the far side */}
      <Reveal on={vOn} x={BOUNDARY_X + 50} y={450}>
        <div className="t-statement" style={{ fontSize: vSize, color: blocked ? 'var(--fault)' : 'var(--ok)', textShadow: `0 0 50px ${blocked ? 'var(--fault)' : 'var(--ok)'}`, textTransform: 'uppercase' }}>{verdict}</div>
      </Reveal>
      <Reveal on={vOn} x={BOUNDARY_X + 50} y={560} delay={160}>
        <div className="t-body" style={{ fontSize: 34, width: 470 }}>{tr(blocked ? copy.verdict.blockedCap : copy.verdict.allowedCap)}</div>
      </Reveal>
      <div
        style={{
          position: 'absolute', left: 1500, top: 730, width: 330, height: 130, boxSizing: 'border-box', padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderRadius: 6, border: `${allowed ? 4 : 2}px solid ${allowed ? 'var(--ok)' : 'var(--k-external)'}`, background: 'var(--surface)', boxShadow: allowed ? '0 0 60px -4px var(--ok)' : '0 0 26px -8px var(--k-external)',
          opacity: here ? (blocked ? 0.5 : 1) : 0, transition: 'opacity 500ms, border-color 400ms, box-shadow 400ms',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--k-external)' }}>{prov.tech}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600 }}>{tr(prov.label)}</div>
      </div>
    </div>
  );
}

/** 05 CERBERUS: a fake prompt types out, Cerberus scans it, secrets and PII are marked and redacted, BLOCKED lands; a clean prompt passes. */
export const Cerberus = () => <Scene index={S_CERB}><Cerberus_ /></Scene>;
