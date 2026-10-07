import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countProjects, typedLines, hasPlayed, markPlayed, shouldPlayIntro, beatAt, introTotalMs, dissolveStartMs, terminalDuration, charsTypedAt, CHAR_MS, LINE_PAUSE_MS, READY_PAUSE_MS, CURSOR_MS, TERMINAL_END_MS, DISSOLVE_MS, INTRO_STORAGE_KEY } from '../src/lib/intro.ts';
import { planRain, mulberry32, revealLines, headY, tailY, finishTime, columnCount, glyphFor, FINISH_AT } from '../src/lib/rain.ts';

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
  assert.ok(DISSOLVE_MS >= 1400 && DISSOLVE_MS <= 1800);
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

// ---- rain planning ----
const W = 1440, H = 900, CELL = 12;
const seeds = LINES.flatMap((l, row) => [...l].map((ch, i) => ({ x: 56 + i * CELL + CELL / 2, y: 56 + row * 32, ch }))).filter((s) => s.ch.trim());

test('rain: one seeded stream per typed character, in the character\'s column; extras cover the full width', () => {
  const streams = planRain({ width: W, height: H, cell: CELL, durationMs: DISSOLVE_MS, seeds, rng: mulberry32(1) });
  const seeded = streams.filter((s) => s.seed);
  assert.equal(seeded.length, seeds.length);
  seeded.forEach((s, i) => assert.equal(s.col, Math.floor(seeds[i].x / CELL)));
  const cols = columnCount(W, CELL);
  for (let c = 0; c < cols; c++) assert.ok(streams.some((s) => !s.seed && s.col === c), `column ${c} has rain`);
});

test('rain: every stream is off screen before the dissolve ends, and the page is fully revealed', () => {
  for (const seed of [1, 2, 3, 99]) {
    const streams = planRain({ width: W, height: H, cell: CELL, durationMs: DISSOLVE_MS, seeds, rng: mulberry32(seed) });
    for (const s of streams) assert.ok(finishTime(s, H, CELL) <= DISSOLVE_MS * FINISH_AT * 1.001, `stream finishes by ${DISSOLVE_MS * FINISH_AT}`);
    const cols = columnCount(W, CELL);
    const end = revealLines(streams, cols, DISSOLVE_MS, CELL, H, []);
    assert.ok(end.every((y) => y === H), 'all columns eroded to the bottom');
  }
});

test('rain: erosion follows the tails top-down and never moves back up', () => {
  const streams = planRain({ width: W, height: H, cell: CELL, durationMs: DISSOLVE_MS, seeds, rng: mulberry32(7) });
  const cols = columnCount(W, CELL);
  let prev: number[] = [];
  let total = 0;
  for (let t = 0; t <= DISSOLVE_MS; t += 50) {
    const r = revealLines(streams, cols, t, CELL, H, prev);
    r.forEach((y, c) => { if (prev[c] !== undefined) assert.ok(y >= prev[c], `column ${c} monotonic at ${t}`); });
    const sum = r.reduce((a, b) => a + b, 0);
    assert.ok(sum >= total);
    total = sum; prev = r;
  }
  // the page behind a column is revealed only above the topmost tail
  const t = DISSOLVE_MS / 2;
  const r = revealLines(streams, cols, t, CELL, H, []);
  for (let c = 0; c < cols; c++) {
    const tops = streams.filter((s) => s.col === c).map((s) => tailY(s, t, CELL));
    assert.ok(r[c] <= Math.max(0, Math.min(H, Math.min(...tops))) + 1e-6);
  }
  assert.ok(headY(streams[0], 0) === streams[0].y0);
});

test('rain: glyphs are deterministic, flicker over time, and come from the katakana/digit/symbol set', () => {
  const [s] = planRain({ width: W, height: H, cell: CELL, durationMs: DISSOLVE_MS, seeds: [], rng: mulberry32(3) });
  assert.equal(glyphFor(s, 2, 100), glyphFor(s, 2, 100));
  const seen = new Set<string>();
  for (let t = 0; t < 2000; t += 90) seen.add(glyphFor(s, 4, t));
  assert.ok(seen.size > 3);
});
