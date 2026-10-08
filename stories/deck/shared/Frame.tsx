import type { ReactNode } from 'react';
import { Reveal } from 'beatdeck';

/** Scene label above the headline ("04 · The lifecycle"). */
export function Eyebrow({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <Reveal on={on} x={150} y={96}>
      <div className="t-eyebrow">{children}</div>
    </Reveal>
  );
}

/**
 * Headline + caption slot used by the diagram scenes: one pair per beat, all at the same spot.
 * The pair for the current beat rises in; the previous one leaves first (Reveal's swap rule).
 */
export function Line({ on, out, head, cap, headSize = 64 }: { on: boolean; out: boolean; head: string; cap: string; headSize?: number }) {
  return (
    <>
      <Reveal on={on} out={out} x={150} y={150}>
        <div className="t-statement" style={{ fontSize: headSize }}>{head}</div>
      </Reveal>
      <Reveal on={on} out={out} x={150} y={250} delay={120}>
        <div className="t-body" style={{ fontSize: 34, width: 1500 }}>{cap}</div>
      </Reveal>
    </>
  );
}
