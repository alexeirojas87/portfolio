/** Single source for "since" wording; never hard-code years of experience. */
export const CAREER_START_YEAR = 2013;

import type { KindClass } from '../components/diagram/kinds.ts';

export interface CapabilityGroup {
  id: 'backend' | 'data' | 'cloud' | 'ai';
  tone: KindClass;
  items: string[];
}

export const capabilityGroups: CapabilityGroup[] = [
  { id: 'backend', tone: 'compute', items: ['C#', '.NET Framework → .NET 10', 'ASP.NET', 'Web API', 'MVC', 'Microservices', 'Distributed systems', 'OOD', 'SignalR'] },
  { id: 'data', tone: 'data', items: ['SQL Server / T-SQL', 'Redis', 'Entity Framework', 'PostgreSQL', 'MySQL', 'Couchbase', 'Kafka', 'RabbitMQ'] },
  { id: 'cloud', tone: 'external', items: ['Azure', 'Docker', 'CI/CD', 'Playwright E2E', 'Workload Identity Federation'] },
  { id: 'ai', tone: 'ai', items: ['LLM gateways & provider routing', 'MCP', 'Agent orchestration & tool calling', 'RAG & vector search', 'Qdrant', 'Embeddings', 'LLM evaluation', 'Prompt-level DLP'] },
];

export const stripHighlights = [
  'C# / .NET 10', 'Microservices', 'Distributed systems', 'SQL Server', 'Redis', 'Kafka', 'RabbitMQ',
  'Azure', 'CI/CD', 'LLM gateways', 'MCP', 'Agent orchestration', 'RAG & vector search',
];
