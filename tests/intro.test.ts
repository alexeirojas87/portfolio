import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatUptime, countProjects, typedLines, hasPlayed, markPlayed, shouldPlayIntro, beatAt, INTRO_TOTAL_MS, INTRO_STORAGE_KEY } from '../src/lib/intro.ts';

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

test('beats follow the timeline, stay under 3s, and skip ends immediately', () => {
  assert.equal(beatAt(0), 'cursor');
  assert.equal(beatAt(299), 'cursor');
  assert.equal(beatAt(300), 'terminal');
  assert.equal(beatAt(1500), 'title');
  assert.equal(beatAt(2600), 'exit');
  assert.equal(beatAt(INTRO_TOTAL_MS), 'done');
  assert.equal(beatAt(100, true), 'done');
  assert.ok(INTRO_TOTAL_MS <= 3000);
});
