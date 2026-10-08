import { Reveal, Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { fitSize } from '../../../shared/fit';
import { copy, project } from '../copy';

function Open_() {
  const { here } = useScene();
  const lines = tr(copy.titleLines);
  const size = fitSize(lines, 1560, 132);
  return (
    <>
      {/* 01.1 poster: also the first frame inside the project page */}
      <Reveal on={here} x={150} y={150}>
        <div className="t-eyebrow">{tr(copy.storyLabel)}</div>
      </Reveal>
      <Reveal on={here} x={150} y={290} delay={80} ms={1100}>
        <div className="t-statement" style={{ fontSize: size, lineHeight: 1.04 }}>
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Reveal>
      <div style={{ position: 'absolute', left: 150, top: 690, width: 120, height: 6, background: 'var(--accent)' }} />
      <Reveal on={here} x={150} y={730} delay={300}>
        <div className="t-body" style={{ fontSize: 38, width: 1400 }}>{tr(project.tagline)}</div>
      </Reveal>
      <Reveal on={here} x={150} y={930} delay={600}>
        <div className="t-meta" style={{ fontSize: 24, color: 'var(--ink-3)' }}>{tr(copy.startHint)}</div>
      </Reveal>
    </>
  );
}

/** 01 OPEN: the poster. */
export const Open = () => <Scene index={0}><Open_ /></Scene>;
