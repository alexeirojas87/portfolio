import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const text = z.object({ en: z.string(), es: z.string() });

const nodeKind = z.enum([
  'ai', 'cache', 'client', 'db', 'external', 'gateway',
  'queue', 'scheduler', 'service', 'storage', 'worker',
]);

const architecture = z.object({
  groups: z.array(z.object({ id: z.string(), label: text })),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.union([z.string(), text]),
      tech: z.string().nullish(),
      pos: z.object({ col: z.number(), row: z.number() }).nullish(),
      owned: z.boolean().nullish(),
      link: z.string().nullish(),
      linkLabel: text.nullish(),
      details: z
        .object({ what: text, responsibilities: z.array(text), why: text.nullish() })
        .nullish(),
      sublabel: text,
      kind: nodeKind,
      group: z.string(),
      status: z.enum(['ok', 'busy', 'warn']).nullish(),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      from: z.string(),
      to: z.string(),
      label: text,
      async: z.boolean().default(false),
    }),
  ),
  flows: z.array(
    z.object({ id: z.string(), name: text, description: text, edges: z.array(z.string()) }),
  ),
  glance: z.array(text).nullish(),
  viewName: text.nullish(),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    slug: z.string(),
    category: z.enum(['personal', 'corporate']),
    title: text,
    tagline: text,
    summary: text,
    problem: text,
    role: text,
    status: z.enum(['live', 'production', 'in-progress', 'prototype']),
    year: z.string(),
    links: z.object({ live: z.url().nullable(), github: z.url().nullable() }),
    stack: z.array(z.object({ name: z.string(), category: z.string() })),
    highlights: z.array(text),
    decisions: z.array(z.object({ title: text, why: text })),
    story: z.boolean().nullish(),
    video: z.object({ url: z.url(), title: text.optional() }).nullish(),
    architecture,
    additionalViews: z
      .array(z.object({ id: z.string(), name: text, description: text, architecture }))
      .nullish(),
  }),
});

export const collections = { projects };
