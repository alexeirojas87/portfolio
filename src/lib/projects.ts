// Single data-access module. A backend can replace the body of these functions
// (e.g. fetch from an API) without touching pages or components.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/ui';

export type Project = CollectionEntry<'projects'>['data'];
export type Architecture = Project['architecture'];
export type ProjectCategory = Project['category'];

export interface LocalizedText { en: string; es: string }
export const t = (text: LocalizedText, locale: Locale): string => text[locale] ?? text.en;

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects');
  // Client (corporate) projects come first: they are the strongest evidence for recruiters.
  const rank = (p: { category: string }) => (p.category === 'corporate' ? 0 : 1);
  return entries.map((e) => e.data).sort((a, b) => rank(a) - rank(b) || a.title.en.localeCompare(b.title.en));
}

export async function getProjectsByCategory(category: ProjectCategory): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.category === category);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}
