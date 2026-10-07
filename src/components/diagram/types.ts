// Structural types for the diagram. Kept free of Astro imports so pure modules are testable.
export type Locale = 'en' | 'es';
export type Mode = 'full' | 'compact';
export interface LText { en: string; es: string }

export type NodeKind =
  | 'ai' | 'cache' | 'client' | 'db' | 'external' | 'gateway'
  | 'queue' | 'scheduler' | 'service' | 'storage' | 'worker';

export interface ArchNode {
  id: string;
  label: string;
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
}
