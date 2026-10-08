import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { copy } from '../copy';
import { ANSWER, QUESTION, useLive } from '../live';
import { S_AS } from '../archWorld';
import { WorldText } from '../WorldScene';

const PANEL = { x: 150, y: 370, w: 900, h: 590 };

function Assistant_() {
  const { here, b } = useScene();
  const qs = useLive((st) => st.live.qs);
  const ans = useLive((st) => st.live.ans);
  const q = QUESTION().slice(0, qs);
  const a = ANSWER().slice(0, ans);
  const chat = here && b <= 2;
  const facts = tr(copy.chat.facts);
  return (
    <>
      <WorldText label={copy.scene.assistant} pairs={copy.assistant} />

      {/* the chat panel: an illustrative exchange, clearly flagged */}
      <div style={{ position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, boxSizing: 'border-box', borderRadius: 10, border: '2px solid var(--hair-strong)', background: 'rgba(8,16,30,0.78)', opacity: here ? 1 : 0, transition: 'opacity 500ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', height: 76, borderBottom: '2px solid var(--hair)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--accent-text)' }}>{tr(copy.chat.channel)}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--warning)', opacity: chat ? 1 : 0, transition: 'opacity 400ms' }}>{tr(copy.chat.illustrative)}</span>
        </div>
      </div>

      {/* resident question (typed), right-aligned */}
      <div style={{ position: 'absolute', left: PANEL.x + 160, top: PANEL.y + 110, width: 700, height: 130, boxSizing: 'border-box', padding: '22px 28px', borderRadius: 14, border: '2px solid var(--accent)', background: 'rgba(47,91,234,0.28)', fontFamily: 'var(--font-sans)', fontSize: 36, fontWeight: 500, lineHeight: 1.3, color: 'var(--ink)', opacity: chat && qs > 0 ? 1 : 0, transform: `translateY(${chat && qs > 0 ? 0 : 14}px)`, transition: 'opacity 350ms, transform 450ms var(--ease)' }}>
        {q}<span className="blink-dot" style={{ display: b === 0 && qs < QUESTION().length ? 'inline-block' : 'none', width: 4, height: 34, marginLeft: 4, verticalAlign: 'middle', background: 'var(--accent-text)' }} />
      </div>

      {/* the assistant's answer (typed once it arrives) */}
      <div style={{ position: 'absolute', left: PANEL.x + 40, top: PANEL.y + 290, width: 760, height: 200, boxSizing: 'border-box', padding: '22px 28px', borderRadius: 14, border: '2px solid var(--ok)', background: 'rgba(25,179,155,0.12)', boxShadow: '0 0 40px -12px var(--ok)', fontFamily: 'var(--font-sans)', fontSize: 36, fontWeight: 500, lineHeight: 1.3, color: 'var(--ink)', opacity: chat && ans > 0 ? 1 : 0, transform: `translateY(${chat && ans > 0 ? 0 : 14}px)`, transition: 'opacity 350ms, transform 450ms var(--ease)' }}>
        {a}
      </div>

      {/* 05.4 what the assistant leans on, in place of the exchange */}
      {facts.map((f, i) => (
        <Reveal key={i} on={here && b === 3} x={PANEL.x + 34} y={PANEL.y + 120 + i * 140} delay={i * 220} axis="x">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, width: 830 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 44, lineHeight: 1.1, color: 'var(--ok)', textShadow: '0 0 18px var(--ok)' }}>✓</span>
            <span className="t-editorial" style={{ fontSize: 40, fontWeight: 600 }}>{f}</span>
          </div>
        </Reveal>
      ))}
    </>
  );
}

/** 05 ASSISTANT: an illustrative question types out, the vector search runs on the world, the answer arrives; then the rule it follows. */
export const Assistant = () => <Scene index={S_AS}><Assistant_ /></Scene>;
