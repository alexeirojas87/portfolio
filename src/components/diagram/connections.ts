import type { Architecture, ArchNode, LText } from './types.ts';

export interface Connection {
  edgeId: string;
  /** The node at the other end of the edge. */
  other: ArchNode;
  label: LText;
  async: boolean;
}

/** Incoming and outgoing edges of a node, derived from the architecture (order follows the data). */
export function connectionsFor(arch: Architecture, nodeId: string): { incoming: Connection[]; outgoing: Connection[] } {
  const byId = new Map(arch.nodes.map((n) => [n.id, n]));
  const incoming: Connection[] = [];
  const outgoing: Connection[] = [];
  for (const e of arch.edges) {
    if (e.to === nodeId && byId.has(e.from)) incoming.push({ edgeId: e.id, other: byId.get(e.from)!, label: e.label, async: e.async });
    if (e.from === nodeId && byId.has(e.to)) outgoing.push({ edgeId: e.id, other: byId.get(e.to)!, label: e.label, async: e.async });
  }
  return { incoming, outgoing };
}
