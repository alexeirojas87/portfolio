import type { ReactNode } from 'react';
import { Reveal } from 'beatdeck';

/** Scene label above the headline ("04 · The lifecycle"). */
export function Eyebrow({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <Reveal on={on} x={150} y={92}>
      <div className="t-eyebrow">{children}</div>
    </Reveal>
  );
}

/**
 * Headline + caption slot used by the world and terminal scenes: one pair per beat, all at the same spot.
 * The pair for the current beat rises in; the previous one leaves first (Reveal's swap rule).
 * Sizes are chosen for the project page embed (stage shown at ~0.5-0.7): nothing under 30 px.
 */
export function Line({ on, out, head, cap, headSize = 66 }: { on: boolean; out: boolean; head: string; cap: string; headSize?: number }) {
  return (
    <>
      <Reveal on={on} out={out} x={150} y={146}>
        <div className="t-statement" style={{ fontSize: headSize }}>{head}</div>
      </Reveal>
      <Reveal on={on} out={out} x={150} y={244} delay={120}>
        <div className="t-body" style={{ fontSize: 36, width: 1620 }}>{cap}</div>
      </Reveal>
    </>
  );
}
