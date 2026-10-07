import type { Architecture, ArchEdge, ArchFlow, ArchNode } from './types.ts';

export interface FlowStep {
  index: number;
  edge: ArchEdge;
  from: ArchNode;
  to: ArchNode;
}
export type StepState = 'done' | 'active' | 'pending';

export function buildSteps(arch: Architecture, flow: ArchFlow): FlowStep[] {
  const nodes = new Map(arch.nodes.map((n) => [n.id, n]));
  const edges = new Map(arch.edges.map((e) => [e.id, e]));
  const steps: FlowStep[] = [];
  for (const id of flow.edges) {
    const edge = edges.get(id);
    const from = edge && nodes.get(edge.from);
    const to = edge && nodes.get(edge.to);
    if (edge && from && to) steps.push({ index: steps.length, edge, from, to });
  }
  return steps;
}

export function stepState(index: number, active: number): StepState {
  return index < active ? 'done' : index === active ? 'active' : 'pending';
}

export function nextStep(active: number, total: number): number {
  return total === 0 ? 0 : (active + 1) % total;
}
export function prevStep(active: number, total: number): number {
  return total === 0 ? 0 : (active - 1 + total) % total;
}

export interface Progress {
  activeEdge: string | null;
  doneEdges: Set<string>;
  activeNodes: Set<string>;
  doneNodes: Set<string>;
}

export function progressAt(steps: FlowStep[], active: number): Progress {
  const doneEdges = new Set<string>();
  const doneNodes = new Set<string>();
  const activeNodes = new Set<string>();
  steps.forEach((s, i) => {
    if (i < active) {
      doneEdges.add(s.edge.id); doneNodes.add(s.from.id); doneNodes.add(s.to.id);
    } else if (i === active) {
      activeNodes.add(s.from.id); activeNodes.add(s.to.id);
    }
  });
  for (const id of activeNodes) doneNodes.delete(id);
  return { activeEdge: steps[active]?.edge.id ?? null, doneEdges, activeNodes, doneNodes };
}

// Opening a node panel pauses the flow and remembers whether it was playing; closing restores it,
// so the panel's story (a node's own connections) never mixes with the flow's story.
export interface PlaybackState { playing: boolean; resume: boolean | null }

export function openPanelPlayback(s: PlaybackState): PlaybackState {
  return { playing: false, resume: s.resume ?? s.playing };
}
export function closePanelPlayback(s: PlaybackState): PlaybackState {
  return { playing: s.resume ?? s.playing, resume: null };
}
