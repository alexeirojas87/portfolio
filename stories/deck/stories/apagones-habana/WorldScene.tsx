import { Reveal, Scene, useScene } from 'beatdeck';
import { tr, type L10n } from '../../shared/lang';
import { fitSize } from '../../shared/fit';
import { Eyebrow } from '../../shared/Frame';
import type { Pair } from './copy';

/**
 * Scene label plus one headline + caption per beat, all at the same spot (the previous pair leaves first).
 * Each headline is sized to fit its language (Spanish runs longer), never below 56 px. Must render inside a <Scene>.
 */
export function WorldText({ label, pairs, maxW = 1620 }: { label: L10n; pairs: Pair[]; maxW?: number }) {
  const { here, b } = useScene();
  return (
    <>
      <Eyebrow on={here}>{tr(label)}</Eyebrow>
      {pairs.map((p, k) => {
        const head = tr(p.head);
        const size = Math.max(56, fitSize([head], maxW, 72, 0.74));
        const on = here && b === k, out = here && b > k;
        return (
          <div key={k}>
            <Reveal on={on} out={out} x={150} y={146}>
              <div className="t-statement" style={{ fontSize: size }}>{head}</div>
            </Reveal>
            <Reveal on={on} out={out} x={150} y={244} delay={120}>
              <div className="t-body" style={{ fontSize: 36, width: 1620 }}>{tr(p.cap)}</div>
            </Reveal>
          </div>
        );
      })}
    </>
  );
}

/** Text layer of a scene that plays over the persistent world (the boxes, wires and packets are drawn by World.tsx). */
export function makeWorldScene(index: number, label: L10n, pairs: Pair[]) {
  return () => <Scene index={index}><WorldText label={label} pairs={pairs} /></Scene>;
}
