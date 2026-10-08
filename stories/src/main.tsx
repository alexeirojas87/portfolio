import { mount } from 'beatdeck';
import { loadDeck } from '@deck';

// One deck app, many stories: `?story=<slug>&lang=<en|es>` picks the story (see deck/index.tsx).
loadDeck().then(mount);
