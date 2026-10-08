import { makeDiagramScene } from '../../../shared/DiagramScene';
import { arch, copy } from '../copy';

const ALL = [0, 1, 2, 3];

/** 05 GATEWAY: view "AI infrastructure", the completion path (flow-gateway: e13 → e14 → e15 → e16). */
export const Gateway = makeDiagramScene({
  index: 4,
  label: copy.scene.gateway,
  pairs: copy.gateway,
  arch,
  nodes: [
    { id: 'devagent', rect: { x: 130, y: 590, w: 400, h: 130 }, from: 0, hot: [0] },
    { id: 'gateway', rect: { x: 760, y: 590, w: 400, h: 130 }, from: 0, hot: ALL },
    { id: 'safety', rect: { x: 760, y: 372, w: 400, h: 130 }, from: 1, hot: [1, 3] },
    { id: 'provider', rect: { x: 1390, y: 590, w: 400, h: 130 }, from: 2, hot: [2] },
    { id: 'audit', rect: { x: 760, y: 808, w: 400, h: 130 }, from: 3, hot: [3] },
  ],
  edges: [
    { id: 'e13', from: 'devagent', to: 'gateway', first: 0, hot: [0] },
    { id: 'e14', from: 'gateway', to: 'safety', first: 1, hot: [1, 3] },
    { id: 'e15', from: 'gateway', to: 'provider', first: 2, hot: [2] },
    { id: 'e16', from: 'gateway', to: 'audit', first: 3, hot: [3] },
  ],
});
