import {
  Brain, Cable, Clock, Cloud, Database, Globe, HardDrive, Layers, MonitorSmartphone,
  Server, Zap, type LucideIcon,
} from 'lucide-react';
import type { NodeKind } from './types.ts';

export const KIND_ICON: Record<NodeKind, LucideIcon> = {
  ai: Brain,
  cache: Zap,
  client: MonitorSmartphone,
  db: Database,
  external: Cloud,
  gateway: Globe,
  queue: Layers,
  scheduler: Clock,
  service: Server,
  storage: HardDrive,
  worker: Cable,
};
