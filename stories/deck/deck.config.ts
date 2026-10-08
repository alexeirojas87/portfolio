/**
 * One deck app holds every project story. A story is picked by URL: `?story=<slug>&lang=<en|es>`.
 * With no `story` param (or an unknown slug) the deck plays `defaultStory`.
 */
export const config = {
  title: 'Project stories',
  defaultStory: 'agentic-orchestration',
} as const;
