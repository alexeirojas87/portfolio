import type { DeckDefinition } from 'beatdeck';
import '../themes/site.css';
import './deck.css';
import { config } from './deck.config';
import { lang } from './shared/lang';

/**
 * Story registry. One entry per project story; each is code-split, so a page only loads the story it plays.
 * Adding a story: create deck/stories/<slug>/ with a default-exported deck, then add it here and set `story: true`
 * on the project's JSON in the site.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STORIES: Record<string, () => Promise<{ default: DeckDefinition<any> }>> = {
  'agentic-orchestration': () => import('./stories/agentic-orchestration'),
  'wagering-platform': () => import('./stories/wagering-platform'),
};

/** Resolve `?story=<slug>` (default story when missing or unknown) and add the portrait-phone hint. */
export async function loadDeck(): Promise<DeckDefinition<any>> {
  const asked = new URLSearchParams(location.search).get('story') ?? '';
  const slug = Object.hasOwn(STORIES, asked) ? asked : config.defaultStory;
  addPortraitHint();
  return (await STORIES[slug]()).default;
}

/**
 * A 1920×1080 stage is unreadable on a phone held upright. When the deck is opened in portrait on a narrow
 * screen, a DOM hint (outside the stage, so it is never part of the story) asks to rotate the phone.
 */
function addPortraitHint() {
  const el = document.createElement('div');
  el.className = 'portrait-hint';
  el.textContent = lang === 'es' ? 'Gira el teléfono para ver la historia' : 'Rotate your phone to watch the story';
  document.body.appendChild(el);
}
