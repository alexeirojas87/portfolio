import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countProjects, typedLines, hasPlayed, markPlayed, shouldPlayIntro, beatAt, introTotalMs, dissolveStartMs, terminalDuration, charsTypedAt, CHAR_MS, LINE_PAUSE_MS, READY_PAUSE_MS, CURSOR_MS, TERMINAL_END_MS, DISSOLVE_MS, INTRO_STORAGE_KEY } from '../src/lib/intro.ts';
import { planDecompose, mulberry32, stageAt, endOf, openFraction, glyphIndex, fallState, GLYPHS, MAX_LIFE_MS, valueNoise, type Piece } from '../src/lib/decompose.ts';

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
  assert.ok(DISSOLVE_MS >= 2200 && DISSOLVE_MS <= 2800);
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

// ---- console decomposition ----
const W = 1440, H = 900, CW = 16, CH = 25;
const text = LINES.flatMap((l, row) => [...l].map((ch, i) => ({ x: 56 + i * 12, y: 56 + row * 32, w: 12, h: 26, ch, row }))).filter((t) => t.ch.trim());
const plan = (seed = 1) => planDecompose({ width: W, height: H, cellW: CW, cellH: CH, durationMs: DISSOLVE_MS, text, rng: mulberry32(seed), seed });

test('decompose: a cell grid covers the whole screen plus one text piece per typed character', () => {
  const pieces = plan();
  const cells = pieces.filter((p) => p.kind === 'cell');
  assert.equal(cells.length, Math.ceil(W / CW) * Math.ceil(H / CH));
  assert.equal(pieces.filter((p) => p.kind === 'text').length, text.length);
  assert.ok(cells.every((c) => c.w === CW && c.h === CH));
});

test('decompose: every piece has crumbled and fallen before the dissolve ends', () => {
  for (const seed of [1, 2, 3, 42]) {
    const pieces = plan(seed);
    for (const p of pieces) assert.ok(endOf(p) <= DISSOLVE_MS, `piece ends by ${DISSOLVE_MS}`);
    assert.ok(pieces.every((p) => stageAt(p, DISSOLVE_MS).stage === 'done'));
    assert.equal(openFraction(pieces, DISSOLVE_MS), 1);
  }
  assert.ok(MAX_LIFE_MS < DISSOLVE_MS / 2);
});

test('decompose: stages run solid -> glitch -> detached -> falling -> done and navy opens at detach', () => {
  const p = plan()[0] as Piece;
  assert.equal(stageAt(p, p.act - 1).stage, 'solid');
  assert.equal(stageAt(p, p.act + 1).stage, 'glitch');
  assert.equal(stageAt(p, p.act + p.glitch + 1).stage, 'detached');
  assert.equal(stageAt(p, p.act + p.glitch + p.hover + 1).stage, 'falling');
  assert.equal(stageAt(p, endOf(p) + 1).stage, 'done');
  const f = fallState(p, 0.5);
  assert.ok(f.dy > 0 && f.alpha > 0 && f.alpha < 1);
  assert.ok(fallState(p, 0.2).dy < fallState(p, 0.9).dy);
});

test('decompose: the page opens progressively (about half at the midpoint), monotonically, not as a curtain', () => {
  const pieces = plan(5);
  let prev = 0;
  for (let t = 0; t <= DISSOLVE_MS; t += 100) {
    const f = openFraction(pieces, t);
    assert.ok(f >= prev - 1e-9, 'monotonic');
    prev = f;
  }
  const mid = openFraction(pieces, DISSOLVE_MS / 2);
  assert.ok(mid > 0.4 && mid < 0.7, `midpoint ${mid}`);
  assert.ok(openFraction(pieces, 300) < 0.2);
  // not a horizontal curtain: at the midpoint holes appear in every band of rows
  const cells = pieces.filter((p) => p.kind === 'cell');
  const bands = 6;
  for (let b = 0; b < bands; b++) {
    const inBand = cells.filter((c) => c.y >= (H / bands) * b && c.y < (H / bands) * (b + 1));
    const open = inBand.filter((c) => c.act + c.glitch <= DISSOLVE_MS / 2).length / inBand.length;
    assert.ok(open > 0.1 && open < 0.95, `band ${b} open ${open}`);
  }
});

test('decompose: the typed text crumbles first, line by line, then it spreads outward in clusters', () => {
  const pieces = plan(9);
  const texts = pieces.filter((p) => p.kind === 'text');
  const cells = pieces.filter((p) => p.kind === 'cell');
  const lastText = Math.max(...texts.map((p) => p.act));
  const firstQuarterCells = cells.filter((c) => c.act < lastText * 2).length;
  assert.ok(lastText < DISSOLVE_MS * 0.2, 'text starts crumbling early');
  assert.ok(firstQuarterCells < cells.length * 0.2, 'most of the screen is still solid when the text is crumbling');
  const row0 = texts.filter((p) => p.y < 80).map((p) => p.act);
  const row3 = texts.filter((p) => p.y > 140).map((p) => p.act);
  assert.ok(Math.min(...row0) < Math.max(...row3));
  // clustering: neighbouring cells activate closer in time than random pairs
  const by = new Map(cells.map((c) => [`${c.x},${c.y}`, c.act]));
  let adj = 0, n = 0;
  for (const c of cells) { const r = by.get(`${c.x + CW},${c.y}`); if (r !== undefined) { adj += Math.abs(r - c.act); n++; } }
  const rnd = mulberry32(3); let rand = 0;
  for (let i = 0; i < n; i++) rand += Math.abs(cells[Math.floor(rnd() * cells.length)].act - cells[Math.floor(rnd() * cells.length)].act);
  assert.ok(adj / n < (rand / n) * 0.35, `adjacent ${adj / n} vs random ${rand / n}`);
});

test('decompose: glitch glyphs cycle over time, deterministically, from the binary set', () => {
  const p = plan()[10];
  assert.equal(glyphIndex(p, p.act + 50), glyphIndex(p, p.act + 50));
  const seen = new Set<number>();
  for (let t = 0; t < 1200; t += 70) seen.add(glyphIndex(p, p.act + t));
  assert.equal(seen.size, 2);
  assert.ok([...seen].every((i) => i >= 0 && i < GLYPHS.length));
  const a = valueNoise(3.2, 4.1, 1);
  assert.ok(a >= 0 && a <= 1);
});
