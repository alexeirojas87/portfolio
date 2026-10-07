import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatUptime, countProjects, typedLines, hasPlayed, markPlayed, shouldPlayIntro, beatAt, introTotalMs, terminalDuration, charsTypedAt, CHAR_MS, LINE_PAUSE_MS, READY_PAUSE_MS, CURSOR_MS, TITLE_HOLD_MS, TERMINAL_END_MS, EXIT_MS, INTRO_STORAGE_KEY } from '../src/lib/intro.ts';

test('uptime: calendar years, months, days and clock since January of the start year', () => {
  assert.equal(formatUptime(2013, new Date(2025, 9, 15, 3, 21, 7)), '12y 09m 14d 03:21:07');
  assert.equal(formatUptime(2013, new Date(2013, 0, 1, 0, 0, 0)), '0y 00m 00d 00:00:00');
  assert.equal(formatUptime(2013, new Date(2026, 0, 1, 23, 59, 59)), '13y 00m 00d 23:59:59');
  assert.equal(formatUptime(2020, new Date(2024, 2, 31, 10, 0, 0)), '4y 02m 30d 10:00:00');
  assert.equal(formatUptime(2013, new Date(2026, 9, 7, 12, 0, 0), 9), '13y 01m 06d 12:00:00');
  assert.equal(formatUptime(2013, new Date(2014, 2, 1, 0, 0, 0), 9), '0y 06m 00d 00:00:00');
});

test('uptime ticks with the clock', () => {
  const a = formatUptime(2013, new Date(2025, 5, 1, 12, 0, 0));
  const b = formatUptime(2013, new Date(2025, 5, 1, 12, 0, 1));
  assert.notEqual(a, b);
  assert.ok(a.endsWith('12:00:00') && b.endsWith('12:00:01'));
});

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
  assert.ok(TITLE_HOLD_MS >= 2400);
  assert.ok(TERMINAL_END_MS >= 1000, 'last line readable for >= 1s');
  assert.ok(EXIT_MS >= 700 && EXIT_MS <= 900);
});

test('beats follow the timeline and skip ends immediately', () => {
  assert.equal(beatAt(0, LINES), 'cursor');
  assert.equal(beatAt(CURSOR_MS - 1, LINES), 'cursor');
  assert.equal(beatAt(CURSOR_MS, LINES), 'terminal');
  const termEnd = CURSOR_MS + terminalDuration(LINES);
  assert.equal(beatAt(termEnd - 1, LINES), 'terminal');
  assert.equal(beatAt(termEnd + 400, LINES), 'terminal'); // finished terminal stays readable
  assert.equal(beatAt(termEnd + TERMINAL_END_MS + 10, LINES), 'title');
  const total = introTotalMs(LINES);
  assert.equal(beatAt(total - EXIT_MS + 1, LINES), 'exit');
  assert.equal(beatAt(total, LINES), 'done');
  assert.equal(beatAt(100, LINES, true), 'done');
  assert.ok(total >= 8000 && total <= 11000, `total ${total}`);
});
