import type { L10n } from './lang';

/** The slice of a project's architecture data that stories draw from (shape of `src/content/projects/*.json`). */
export interface ArchNode {
  id: string;
  kind: string;
  label: L10n;
  sublabel?: L10n;
  tech?: string;
}
export interface ArchEdge { id: string; from: string; to: string; label: L10n; async?: boolean }
export interface ArchView { nodes: ArchNode[]; edges: ArchEdge[] }
export interface ProjectData {
  slug: string;
  title: L10n;
  tagline: L10n;
  summary: L10n;
  problem: L10n;
  architecture: ArchView & { glance?: L10n[] };
  additionalViews?: { id: string; architecture: ArchView }[] | null;
  decisions: { title: L10n; why: L10n }[];
}

/** Lookup helpers over every view of a project. Unknown ids throw, so a renamed node cannot silently vanish from a story. */
export function archOf(p: ProjectData) {
  const views = [p.architecture, ...(p.additionalViews ?? []).map((v) => v.architecture)];
  const nodes = new Map(views.flatMap((v) => v.nodes).map((n) => [n.id, n]));
  const edges = new Map(views.flatMap((v) => v.edges).map((e) => [e.id, e]));
  return {
    node(id: string): ArchNode {
      const n = nodes.get(id);
      if (!n) throw new Error(`story: unknown architecture node "${id}" in ${p.slug}`);
      return n;
    },
    edge(id: string): ArchEdge {
      const e = edges.get(id);
      if (!e) throw new Error(`story: unknown architecture edge "${id}" in ${p.slug}`);
      return e;
    },
  };
}
