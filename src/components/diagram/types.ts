// Structural types for the diagram. Kept free of Astro imports so pure modules are testable.
export type Locale = 'en' | 'es';
export type Mode = 'full' | 'compact';
export interface LText { en: string; es: string }

export type NodeKind =
  | 'ai' | 'cache' | 'client' | 'db' | 'external' | 'gateway'
  | 'queue' | 'scheduler' | 'service' | 'storage' | 'worker';

export interface GridPos { col: number; row: number }

export interface ArchNode {
  id: string;
  /** Role title. Plain string (shared) or bilingual. */
  label: string | LText;
  /** Technology chip, e.g. "RabbitMQ". */
  tech?: string | null;
  /** Curated grid position; when every node has one, the curated renderer is used. */
  pos?: GridPos | null;
  /** Inside the "What I built" boundary. Defaults to true except for client/external. */
  owned?: boolean | null;
  sublabel: LText;
  kind: NodeKind;
  group: string;
  status?: 'ok' | 'busy' | 'warn' | null;
}
export interface ArchEdge { id: string; from: string; to: string; label: LText; async: boolean }
export interface ArchGroup { id: string; label: LText }
export interface ArchFlow { id: string; name: LText; description: LText; edges: string[] }
export interface Architecture {
  groups: ArchGroup[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  flows: ArchFlow[];
  glance?: LText[] | null;
}

export const nodeLabel = (n: ArchNode, locale: Locale): string =>
  typeof n.label === 'string' ? n.label : n.label[locale] ?? n.label.en;

export const isOwned = (n: ArchNode): boolean =>
  n.owned ?? (n.kind !== 'client' && n.kind !== 'external');

export const isCurated = (a: Architecture): boolean =>
  a.nodes.length > 0 && a.nodes.every((n) => !!n.pos);
