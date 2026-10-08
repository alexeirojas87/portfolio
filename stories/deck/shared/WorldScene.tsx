import { Scene, useScene } from 'beatdeck';
import { tr, type L10n } from './lang';
import { Eyebrow, Line } from './Frame';

/**
 * Text layer of a scene that plays over the persistent world: the scene label and one headline + caption per beat.
 * The boxes, wires and packets are drawn by the world itself (see the story's World.tsx); this layer never redraws them.
 */
export function makeWorldScene(index: number, label: L10n, pairs: { head: L10n; cap: L10n }[]) {
  function View() {
    const { here, b } = useScene();
    return (
      <>
        <Eyebrow on={here}>{tr(label)}</Eyebrow>
        {pairs.map((p, k) => (
          <Line key={k} on={here && b === k} out={here && b > k} head={tr(p.head)} cap={tr(p.cap)} />
        ))}
      </>
    );
  }
  return () => <Scene index={index}><View /></Scene>;
}
