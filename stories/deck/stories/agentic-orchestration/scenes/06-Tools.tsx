import { makeDiagramScene } from '../../../shared/DiagramScene';
import { arch, copy } from '../copy';

const ALL = [0, 1, 2];

/** 06 TOOLS: view "AI infrastructure", the dev agent tool loop (flow-dev-tools: e8, e9, e10, e11, e12). */
export const Tools = makeDiagramScene({
  index: 5,
  label: copy.scene.tools,
  pairs: copy.tools,
  arch,
  nodes: [
    { id: 'devagent', rect: { x: 130, y: 590, w: 400, h: 130 }, from: 0, hot: [0] },
    { id: 'mcp', rect: { x: 760, y: 590, w: 400, h: 130 }, from: 0, hot: ALL },
    { id: 'ado', rect: { x: 1390, y: 372, w: 400, h: 130 }, from: 0, hot: [0] },
    { id: 'workspace', rect: { x: 1390, y: 590, w: 400, h: 130 }, from: 1, hot: [1] },
    { id: 'vector', rect: { x: 1390, y: 808, w: 400, h: 130 }, from: 1, hot: [1] },
    { id: 'indexer', rect: { x: 760, y: 808, w: 400, h: 130 }, from: 2, hot: [2] },
  ],
  edges: [
    { id: 'e8', from: 'devagent', to: 'mcp', first: 0, hot: [0] },
    { id: 'e9', from: 'mcp', to: 'ado', first: 0, hot: [0] },
    { id: 'e10', from: 'mcp', to: 'workspace', first: 1, hot: [1] },
    { id: 'e11', from: 'mcp', to: 'vector', first: 1, hot: [1] },
    { id: 'e12', from: 'indexer', to: 'mcp', first: 2, hot: [2] },
  ],
});
