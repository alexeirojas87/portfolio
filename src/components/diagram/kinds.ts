import type { NodeKind } from './types.ts';

export type KindClass = 'compute' | 'data' | 'queue' | 'ai' | 'client' | 'external';

export const KIND_CLASS: Record<NodeKind, KindClass> = {
  service: 'compute', gateway: 'compute', worker: 'compute', scheduler: 'compute',
  db: 'data', cache: 'data', storage: 'data',
  queue: 'queue',
  ai: 'ai',
  client: 'client',
  external: 'external',
};

/** Color = meaning. Same hues on the canvas and in stack chips. */
export const CLASS_COLOR: Record<KindClass, string> = {
  compute: '#5B8CFF',
  data: '#19B39B',
  queue: '#F2A93B',
  ai: '#E0559E',
  client: '#C7D2E3',
  external: '#8A97AB',
};

export const CLASS_ORDER: KindClass[] = ['compute', 'data', 'queue', 'ai', 'client', 'external'];

export const kindColor = (k: NodeKind): string => CLASS_COLOR[KIND_CLASS[k]];

/** Stack category (from project data) -> kind class, so chips share the canvas palette. */
export const CATEGORY_CLASS: Record<string, KindClass> = {
  backend: 'compute',
  frontend: 'client',
  language: 'compute',
  data: 'data',
  messaging: 'queue',
  ai: 'ai',
  cloud: 'external',
  devops: 'external',
  testing: 'external',
  other: 'external',
};
