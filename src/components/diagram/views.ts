import type { Architecture, LText } from './types.ts';

export interface View {
  id: string;
  name: LText;
  description?: LText;
  architecture: Architecture;
}

interface ProjectLike {
  architecture: Architecture;
  additionalViews?: { id: string; name: LText; description: LText; architecture: Architecture }[] | null;
}

export const PRIMARY_VIEW_ID = 'main';
const DEFAULT_NAME: LText = { en: 'Overview', es: 'Vista general' };

/** Primary architecture first, then each additional view. Cards and the hero use the first one. */
export function buildViews(p: ProjectLike): View[] {
  const primary: View = { id: PRIMARY_VIEW_ID, name: p.architecture.viewName ?? DEFAULT_NAME, architecture: p.architecture };
  const extra = (p.additionalViews ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    architecture: v.architecture,
  }));
  return [primary, ...extra];
}

/** Resolve a view by id, falling back to the primary view. */
export function viewById(views: View[], id: string): View {
  return views.find((v) => v.id === id) ?? views[0];
}
