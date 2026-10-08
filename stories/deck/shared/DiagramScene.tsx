import { Arrow, Scene, useScene, type NodeTone, type Rect } from 'beatdeck';
import type { ArchView } from './arch';
import { tr, type L10n } from './lang';
import { Eyebrow, Line } from './Frame';
import { Node } from './Node';

type Pt = { x: number; y: number };

/** A node placed on the stage. It appears on beat `from` and is hot (the point of the beat) on the beats in `hot`. */
export interface NodeSpec { id: string; rect: Rect; from: number; hot: number[] }
/** An edge of the project's architecture. `from`/`to` are node ids, or free points when two edges share the same pair of nodes. */
export interface EdgeSpec { id: string; from: string | Pt; to: string | Pt; first: number; hot: number[] }

export interface DiagramSceneConfig {
  index: number;
  label: L10n;
  pairs: { head: L10n; cap: L10n }[];
  nodes: NodeSpec[];
  edges: EdgeSpec[];
  arch: { node(id: string): ArchView['nodes'][number]; edge(id: string): ArchView['edges'][number] };
}

/**
 * One scene = one slice of the project's architecture, drawn node by node.
 * Beat k shows pair k (headline + caption) and spotlights what is new: hot nodes and edges are bright, earlier ones dim.
 * Positions are stage pixels; text comes from the project data (nodes) and the story copy (headline, caption).
 */
export function makeDiagramScene(cfg: DiagramSceneConfig) {
  const rects = new Map(cfg.nodes.map((n) => [n.id, n.rect]));
  const toTarget = (v: string | Pt): Rect | Pt => {
    if (typeof v !== 'string') return v;
    const r = rects.get(v);
    if (!r) throw new Error(`story: edge refers to node "${v}" that is not placed in scene ${cfg.index + 1}`);
    return r;
  };

  function View() {
    const { here, b } = useScene();
    const tone = (hot: number[]): NodeTone => (hot.includes(b) ? 'hot' : 'dim');
    return (
      <>
        <Eyebrow on={here}>{tr(cfg.label)}</Eyebrow>
        {cfg.pairs.map((p, k) => (
          <Line key={k} on={here && b === k} out={here && b > k} head={tr(p.head)} cap={tr(p.cap)} />
        ))}
        {cfg.edges.map((e) => {
          const meta = cfg.arch.edge(e.id);
          return (
            <Arrow key={e.id} from={toTarget(e.from)} to={toTarget(e.to)} on={here && b >= e.first}
              tone={tone(e.hot)} flow={!!meta.async && e.hot.includes(b)} />
          );
        })}
        {cfg.nodes.map((n) => (
          <Node key={n.id} n={cfg.arch.node(n.id)} rect={n.rect} on={here && b >= n.from} tone={tone(n.hot)} />
        ))}
      </>
    );
  }

  return () => <Scene index={cfg.index}><View /></Scene>;
}
