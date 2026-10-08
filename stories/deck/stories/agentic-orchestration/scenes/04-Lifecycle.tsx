import { makeDiagramScene } from '../../../shared/DiagramScene';
import { arch, copy } from '../copy';

const ALL = [0, 1, 2, 3, 4, 5, 6];

/**
 * 04 LIFECYCLE: view "Agent lifecycle". The orchestrator is the hub; each beat spotlights one step of
 * flow-lifecycle (e1, e3, e4/e5, e6, e7, e20) and then the human gates (e2, e18, e19).
 */
export const Lifecycle = makeDiagramScene({
  index: 3,
  label: copy.scene.lifecycle,
  pairs: copy.lifecycle,
  arch,
  nodes: [
    { id: 'ado', rect: { x: 130, y: 560, w: 400, h: 130 }, from: 0, hot: [0, 5] },
    { id: 'orchestrator', rect: { x: 760, y: 560, w: 400, h: 130 }, from: 0, hot: ALL },
    { id: 'runstore', rect: { x: 760, y: 372, w: 400, h: 130 }, from: 1, hot: [1] },
    { id: 'defagent', rect: { x: 1390, y: 372, w: 400, h: 130 }, from: 2, hot: [2] },
    { id: 'qaagent', rect: { x: 1390, y: 532, w: 400, h: 130 }, from: 2, hot: [2] },
    { id: 'devagent', rect: { x: 1390, y: 692, w: 400, h: 130 }, from: 3, hot: [3] },
    { id: 'reviewagent', rect: { x: 1390, y: 852, w: 400, h: 130 }, from: 4, hot: [4] },
    { id: 'chat', rect: { x: 130, y: 810, w: 400, h: 130 }, from: 6, hot: [6] },
    { id: 'portal', rect: { x: 760, y: 810, w: 400, h: 130 }, from: 6, hot: [6] },
  ],
  edges: [
    { id: 'e1', from: { x: 530, y: 595 }, to: { x: 760, y: 595 }, first: 0, hot: [0] },
    { id: 'e3', from: 'orchestrator', to: 'runstore', first: 1, hot: [1] },
    { id: 'e4', from: 'orchestrator', to: 'defagent', first: 2, hot: [2] },
    { id: 'e5', from: 'orchestrator', to: 'qaagent', first: 2, hot: [2] },
    { id: 'e6', from: 'orchestrator', to: 'devagent', first: 3, hot: [3] },
    { id: 'e7', from: 'orchestrator', to: 'reviewagent', first: 4, hot: [4] },
    { id: 'e20', from: { x: 530, y: 660 }, to: { x: 760, y: 660 }, first: 5, hot: [5] },
    { id: 'e2', from: 'chat', to: 'orchestrator', first: 6, hot: [6] },
    { id: 'e18', from: { x: 880, y: 690 }, to: { x: 880, y: 810 }, first: 6, hot: [6] },
    { id: 'e19', from: { x: 1040, y: 810 }, to: { x: 1040, y: 690 }, first: 6, hot: [6] },
  ],
});
