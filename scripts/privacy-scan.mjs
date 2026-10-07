#!/usr/bin/env node
// Fails closed. Never prints denylist terms: only file, line and a generic marker.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const denyFile = join(root, '.privacy-denylist');

if (!existsSync(denyFile)) {
  console.error('privacy: .privacy-denylist is missing; refusing to pass (fail closed).');
  process.exit(1);
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = readFileSync(denyFile, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((t) => new RegExp(`(?<![\\p{L}\\p{N}_])${escape(t)}(?![\\p{L}\\p{N}_])`, 'iu'));

if (patterns.length === 0) {
  console.error('privacy: .privacy-denylist has no terms; refusing to pass (fail closed).');
  process.exit(1);
}

const SKIP_DIRS = new Set(['node_modules', '.git']);
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|mp4|webm|zip)$/i;

// Minified vendor bundles in dist/_astro (JS, CSS, source maps) produce false positives on short
// terms. Project content is still covered by scanning src/, public/, odd/ and the generated
// HTML/JSON/XML in dist/.
const VENDOR = /^dist[\\/]_astro[\\/].*\.(m?js|css|map)$/i;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (!BINARY.test(name) && !VENDOR.test(relative(root, p))) yield p;
  }
}

let hits = 0;
for (const target of ['src', 'public', 'odd', 'dist']) {
  const dir = join(root, target);
  if (!existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (patterns.some((re) => re.test(line))) {
        hits++;
        console.error(`${file.slice(root.length + 1)}:${i + 1} denylisted term`);
      }
    });
  }
}

if (hits > 0) {
  console.error(`privacy: ${hits} hit(s).`);
  process.exit(1);
}
console.log('privacy: 0 hits.');
