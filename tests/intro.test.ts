import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countProjects, typedLines, hasPlayed, markPlayed, shouldPlayIntro, beatAt, introTotalMs,
  dissolveStartMs, terminalDuration, charsTypedAt, CHAR_MS, LINE_PAUSE_MS, READY_PAUSE_MS, CURSOR_MS, TERMINAL_END_MS, DISSOLVE_MS, INTRO_STORAGE_KEY } from '../src/lib/intro.ts';
import { planColumns, mulberry32, edgeY, navyTop, isDrained, dropRows, glyphAt, clearFraction, GLYPHS, SOFT_ROWS, LAYER } from '../src/lib/columns.ts';

test('counts are derived from project data', () => {
  const c = countProjects([{ category: 'corporate' }, { category: 'personal' }, { category: 'personal' }]);
  assert.deepEqual(c, { total: 3, client: 1, personal: 2 });
});

test('terminal typing reveals characters across lines', () => {
  const lines = ['> a', '> bc'];
  assert.deepEqual(typedLines(lines, 0), []);
  assert.deepEqual(typedLines(lines, 2), ['> ']);
  assert.deepEqual(typedLines(lines, 4), ['> a', '>']);
  assert.deepEqual(typedLines(lines, 99), lines);
});

function fakeStorage(throwing = false) {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => { if (throwing) throw new Error('blocked'); return m.get(k) ?? null; },
    setItem: (k: string, v: string) => { if (throwing) throw new Error('blocked'); m.set(k, v); },
  };
}

test('session flag: plays once, then not again', () => {
  const s = fakeStorage();
  assert.equal(shouldPlayIntro({ isHome: true, reducedMotion: false, storage: s }), true);
  markPlayed(s);
  assert.equal(s.getItem(INTRO_STORAGE_KEY), '1');
  assert.equal(shouldPlayIntro({ isHome: true, reducedMotion: false, storage: s }), false);
});

test('session flag: unavailable storage still plays (once per page view) and never throws', () => {
  const s = fakeStorage(true);
  assert.equal(hasPlayed(s), false);
  assert.doesNotThrow(() => markPlayed(s));
  assert.equal(shouldPlayIntro({ isHome: true, reducedMotion: false, storage: s }), true);
  assert.equal(shouldPlayIntro({ isHome: true, reducedMotion: false, storage: null }), true);
});

test('never plays on deep links or with reduced motion', () => {
  assert.equal(shouldPlayIntro({ isHome: false, reducedMotion: false, storage: fakeStorage() }), false);
  assert.equal(shouldPlayIntro({ isHome: true, reducedMotion: true, storage: fakeStorage() }), false);
});

const LINES = ['> booting portfolio…', '> loading engineer: alexei_rojas_quiroga', '> mapping 13 systems · 4 client · 9 personal', '> ready'];

test('typing runs at CHAR_MS per character with pauses between lines', () => {
  const l = ['> ab', '> cd', '> ready'];
  assert.equal(charsTypedAt(l, 0), 0);
  assert.equal(charsTypedAt(l, CHAR_MS * 2), 2);
  assert.equal(charsTypedAt(l, 4 * CHAR_MS), 4); // first line done
  assert.equal(charsTypedAt(l, 4 * CHAR_MS + LINE_PAUSE_MS - 1), 4); // still pausing
  assert.equal(charsTypedAt(l, 4 * CHAR_MS + LINE_PAUSE_MS + 2 * CHAR_MS), 6);
  // the pause before the last line is the longer READY pause
  const afterSecond = 4 * CHAR_MS + LINE_PAUSE_MS + 4 * CHAR_MS;
  assert.equal(charsTypedAt(l, afterSecond + READY_PAUSE_MS - 1), 8);
  assert.equal(charsTypedAt(l, afterSecond + READY_PAUSE_MS + CHAR_MS), 9);
  assert.equal(charsTypedAt(l, 1e6), 4 + 4 + 7);
  assert.equal(terminalDuration(l), 15 * CHAR_MS + LINE_PAUSE_MS + READY_PAUSE_MS);
});

test('constants are within the readable ranges', () => {
  assert.ok(CHAR_MS >= 35 && CHAR_MS <= 45);
  assert.ok(CURSOR_MS >= 600 && CURSOR_MS <= 800);
  assert.ok(TERMINAL_END_MS >= 1000, 'last line readable for >= 1s');
  assert.ok(DISSOLVE_MS >= 2000 && DISSOLVE_MS <= 2500);
});

test('beats: cursor, terminal, dissolve, done; skip ends immediately', () => {
  assert.equal(beatAt(0, LINES), 'cursor');
  assert.equal(beatAt(CURSOR_MS - 1, LINES), 'cursor');
  assert.equal(beatAt(CURSOR_MS, LINES), 'terminal');
  const dissolve = dissolveStartMs(LINES);
  assert.equal(beatAt(CURSOR_MS + terminalDuration(LINES) + 400, LINES), 'terminal'); // finished terminal stays readable
  assert.equal(beatAt(dissolve - 1, LINES), 'terminal');
  assert.equal(beatAt(dissolve, LINES), 'dissolve');
  assert.equal(beatAt(introTotalMs(LINES) - 1, LINES), 'dissolve');
  assert.equal(beatAt(introTotalMs(LINES), LINES), 'done');
  assert.equal(beatAt(100, LINES, true), 'done');
  assert.equal(introTotalMs(LINES) - dissolve, DISSOLVE_MS);
});

// ---- column drain ----
const W = 1440, H = 900, CW = 16, CH = 25;
const textXs = LINES.flatMap((l, row) => [...l].map((ch, i) => ({ ch, x: 56 + i * 12 + 6 }))).filter((t) => t.ch.trim()).map((t) => t.x);
const plan = (seed = 1) => planColumns({ width: W, height: H, cellW: CW, cellH: CH, durationMs: DISSOLVE_MS, textXs, rng: mulberry32(seed) });

test('columns: one drain column per glyph advance, covering the whole width', () => {
  const p = plan();
  assert.equal(p.columns.length, Math.ceil(W / CW));
  p.columns.forEach((c, i) => { assert.equal(c.x, i * CW); assert.equal(c.index, i); });
  assert.equal(GLYPHS, '01');
});

test('columns: every column is fully drained before the dissolve ends', () => {
  for (const seed of [1, 2, 3, 42]) {
    const p = plan(seed);
    for (const c of p.columns) assert.ok(isDrained(c, DISSOLVE_MS, CH, H), `column ${c.index} drained`);
    assert.equal(clearFraction(p, DISSOLVE_MS, H), 1);
    assert.ok(clearFraction(p, 0, H) < 0.01);
  }
});

test('columns: the wave starts under the typed text and spreads outward with jitter', () => {
  const p = plan(5);
  const lo = Math.min(...textXs), hi = Math.max(...textXs);
  const under = p.columns.filter((c) => c.fromText);
  assert.ok(under.length > 5);
  assert.ok(under.every((c) => c.cx >= lo - CW && c.cx <= hi + CW));
  const underMax = Math.max(...under.map((c) => c.start));
  const outside = p.columns.filter((c) => !c.fromText);
  assert.ok(outside.every((c) => c.start >= 0));
  // further from the text starts later, on average (left and right)
  const dist = (c: { cx: number }) => Math.max(0, lo - c.cx, c.cx - hi);
  const near = outside.filter((c) => dist(c) < 300), far = outside.filter((c) => dist(c) > 700);
  const mean = (a: { start: number }[]) => a.reduce((x, y) => x + y.start, 0) / a.length;
  assert.ok(underMax < DISSOLVE_MS * 0.1);
  assert.ok(mean(near) < mean(far), `near ${mean(near)} vs far ${mean(far)}`);
  // jitter: starts are not a clean monotone sweep
  const right = outside.filter((c) => c.cx > hi).sort((a, b) => a.cx - b.cx);
  assert.ok(right.some((c, i) => i > 0 && c.start < right[i - 1].start));
  // a wave, not noise: half the page is clear around the middle of the dissolve
  const mid = clearFraction(p, DISSOLVE_MS * 0.5, H);
  assert.ok(mid > 0.25 && mid < 0.75, `midpoint ${mid}`);
});

test('columns: the drain edge only moves down and is a soft gradient of SOFT_ROWS glyphs', () => {
  const p = plan();
  const c = p.columns[40];
  let prev = -Infinity;
  for (let t = 0; t <= DISSOLVE_MS; t += 50) { const e = edgeY(c, t, CH); assert.ok(e >= prev); prev = e; }
  assert.equal(navyTop(c, 1000, CH) - edgeY(c, 1000, CH), SOFT_ROWS * CH);
});

test('columns: no glyph is ever drawn above the drain edge (glyphs live only on navy), on every layer', () => {
  for (const seed of [1, 7]) {
    const p = plan(seed);
    for (let t = 0; t <= DISSOLVE_MS; t += 80) {
      for (const d of p.drops) {
        const clip = navyTop(p.columns[d.col], t, CH);
        for (const r of dropRows(d, t, clip)) assert.ok(r.y >= clip, `layer ${d.layer} row at ${r.y} >= ${clip}`);
      }
    }
  }
});

test('columns: three depth layers, back dimmer, slower and smaller than front', () => {
  const p = plan(2);
  const layers = new Set(p.drops.map((d) => d.layer));
  assert.deepEqual([...layers].sort(), [0, 1, 2]);
  assert.ok(LAYER[0].alpha < LAYER[1].alpha && LAYER[1].alpha < LAYER[2].alpha);
  assert.ok(LAYER[0].speed < LAYER[1].speed && LAYER[1].speed < LAYER[2].speed);
  const avg = (l: number, f: (d: (typeof p.drops)[number]) => number) => { const a = p.drops.filter((d) => d.layer === l); return a.reduce((x, d) => x + f(d), 0) / a.length; };
  assert.ok(avg(0, (d) => d.cell) < avg(2, (d) => d.cell));
  assert.ok(avg(0, (d) => d.speed) < avg(2, (d) => d.speed));
  for (const d of p.drops) assert.ok(d.trail >= 12 && d.trail <= 25);
});

test('columns: glyphs are binary, deterministic, and occasionally flicker', () => {
  const salt = 12345;
  assert.equal(glyphAt(salt, 3, 100), glyphAt(salt, 3, 100));
  const seen = new Set<number>(); let flips = 0, prevG = -1;
  for (let t = 0; t < 4000; t += 90) { const g = glyphAt(salt, 5, t); seen.add(g); if (prevG >= 0 && g !== prevG) flips++; prevG = g; }
  assert.ok([...seen].every((g) => g === 0 || g === 1));
  for (let r = 0; r < 30; r++) for (let t = 0; t < 900; t += 90) assert.ok([0, 1].includes(glyphAt(salt + r, r, t)));
  assert.ok(flips < 40);
});
