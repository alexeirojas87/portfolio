#!/usr/bin/env node
// Copies the built story deck (stories/dist) into public/stories, so Astro serves it at /stories/
// and copies it into dist/stories on `astro build`. public/stories is generated and gitignored.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const from = join(root, 'stories', 'dist');
const to = join(root, 'public', 'stories');

if (!existsSync(join(from, 'index.html'))) {
  console.error('copy-stories: stories/dist/index.html is missing. Run `npm run build:stories` first.');
  process.exit(1);
}
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log('copy-stories: stories/dist -> public/stories');
