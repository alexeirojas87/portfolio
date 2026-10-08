import { Reveal, Scene, Terminal, useScene } from 'beatdeck';
import { lang, tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { copy, project } from '../copy';
import { useLive } from '../live';


/** Lines revealed by `chars` typed characters, one line after the other. */
function typedLines(lines: readonly string[], chars: number): string[] {
  let left = chars;
  return lines.map((l) => {
    const n = Math.max(0, Math.min(l.length, left));
    left -= l.length;
    return l.slice(0, n);
  });
}

function Open_() {
  const { here, b } = useScene();
  const boot = useLive((st) => st.live.boot);
  const lines = typedLines(copy.boot[lang], boot);
  const title = tr(copy.titleLines);
  const size = fitSize(title, 1560, 132);
  return (
    <>
      {/* 01.1 standby: a quiet mark on black */}
      <div className="blink-dot" style={{ position: 'absolute', left: 942, top: 522, width: 36, height: 36, background: 'var(--accent)', boxShadow: '0 0 40px 6px var(--accent)', opacity: here && b === 0 ? 1 : 0, transition: 'opacity 400ms' }} />

      {/* 01.2 boot: a terminal on black, typed by the timeline, then a hard cut to the title */}
      <Reveal on={here && b === 1} out={here && b > 1} x={150} y={400}>
        <Terminal size={46} lines={lines.map((t, i) => ({ t, dim: i > 0 }))} />
      </Reveal>

      {/* 01.3 title */}
      <div style={{ position: 'absolute', left: 900, top: 120, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,91,234,0.34), transparent 62%)', opacity: here && b === 2 ? 1 : 0, transition: 'opacity 1400ms' }} />
      <Reveal on={here && b === 2} x={150} y={150}>
        <div className="t-eyebrow">{tr(copy.storyLabel)}</div>
      </Reveal>
      <Reveal on={here && b === 2} x={150} y={290} delay={80} ms={1100}>
        <div className="t-statement" style={{ fontSize: size, lineHeight: 1.04 }}>
          {title.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Reveal>
      <div style={{ position: 'absolute', left: 150, top: 690, width: here && b === 2 ? 160 : 0, height: 8, background: 'var(--accent)', boxShadow: '0 0 24px var(--accent)', transition: 'width 900ms var(--ease) 500ms' }} />
      <Reveal on={here && b === 2} x={150} y={740} delay={300}>
        <div className="t-body" style={{ fontSize: 40, width: 1400 }}>{tr(project.tagline)}</div>
      </Reveal>
      <Reveal on={here && b === 2} x={150} y={930} delay={700}>
        <div className="t-meta" style={{ fontSize: 30, color: 'var(--ink-2)' }}>{tr(copy.startHint)}</div>
      </Reveal>
    </>
  );
}

/** 01 OPEN: standby (black), boot terminal (automatic), title. */
export const Open = () => <Scene index={0}><Open_ /></Scene>;
