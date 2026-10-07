import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeCurated, boundaryRect, crossesRect, gridRows } from '../src/components/diagram/curated.ts';
import { compress, roundedPath } from '../src/components/diagram/route.ts';
import { isOwned, isCurated, type Architecture } from '../src/components/diagram/types.ts';

const load = (slug: string): Architecture =>
  JSON.parse(readFileSync(new URL(`../src/content/projects/${slug}.json`, import.meta.url), 'utf8')).architecture;
const pilots = ['crypto-payments', 'agentic-orchestration'];

test('pilot projects are fully curated', () => {
  for (const s of pilots) assert.ok(isCurated(load(s)), s);
});

test('horizontal layout places a higher col to the right; same row shares y', () => {
  const a = load('crypto-payments');
  const l = computeCurated(a, 'en', { orientation: 'horizontal' });
  const n = (id: string) => l.nodes.find((x) => x.id === id)!;
  assert.ok(n('executor').x > n('reqq').x && n('reqq').x > n('api').x);
  assert.equal(n('api').y, n('reqq').y);
  assert.equal(n('api').y, n('chain').y);
});

test('vertical layout is the transpose: flow reads top to bottom, rows become columns', () => {
  const a = load('crypto-payments');
  const h = computeCurated(a, 'en', { orientation: 'horizontal' });
  const v = computeCurated(a, 'en', { orientation: 'vertical', nodeW: 144 });
  const n = (l: typeof v, id: string) => l.nodes.find((x) => x.id === id)!;
  assert.equal(v.orientation, 'vertical');
  assert.ok(n(v, 'executor').y > n(v, 'reqq').y && n(v, 'reqq').y > n(v, 'api').y);
  assert.equal(n(v, 'api').x, n(v, 'reqq').x);
  assert.ok(n(v, 'db').x > n(v, 'executor').x); // row 2 sits right of row 1
  assert.ok(v.height > v.width * 0.5 && v.width < h.width);
  assert.equal(Math.round((v.width - 48) / 176) >= 1, true);
  assert.equal(gridRows(a), 4);
});

test('boundary encloses owned nodes only and excludes clients/externals', () => {
  for (const s of pilots) {
    const a = load(s);
    for (const o of ['horizontal', 'vertical'] as const) {
      const l = computeCurated(a, 'en', { orientation: o, nodeW: 144 });
      const b = l.boundary!;
      assert.ok(b, `${s} ${o} has a boundary`);
      for (const n of l.nodes) {
        const inside = n.x >= b.x && n.y >= b.y && n.x + n.w <= b.x + b.w && n.y + n.h <= b.y + b.h;
        const overlaps = n.x < b.x + b.w && n.x + n.w > b.x && n.y < b.y + b.h && n.y + n.h > b.y;
        if (n.owned) assert.ok(inside, `${s} ${o} ${n.id} inside`);
        else assert.ok(!overlaps, `${s} ${o} ${n.id} outside`);
      }
    }
  }
});

test('boundaryRect pads the owned bounding box and is null with nothing to separate', () => {
  const r = boundaryRect([
    { x: 100, y: 100, w: 50, h: 40, owned: true },
    { x: 200, y: 160, w: 50, h: 40, owned: true },
    { x: 0, y: 0, w: 50, h: 40, owned: false },
  ])!;
  assert.deepEqual(r, { x: 84, y: 68, w: 182, h: 148 });
  assert.equal(boundaryRect([{ x: 0, y: 0, w: 1, h: 1, owned: true }]), null);
});

test('owned defaults: clients and externals outside, everything else inside, override wins', () => {
  const base = { id: 'x', label: 'x', sublabel: { en: '', es: '' }, group: 'g' } as const;
  assert.equal(isOwned({ ...base, kind: 'client' }), false);
  assert.equal(isOwned({ ...base, kind: 'external' }), false);
  assert.equal(isOwned({ ...base, kind: 'db' }), true);
  assert.equal(isOwned({ ...base, kind: 'client', owned: true }), true);
});

test('no routed edge passes through a node, in either orientation', () => {
  for (const s of pilots) {
    const a = load(s);
    for (const o of ['horizontal', 'vertical'] as const) {
      const l = computeCurated(a, 'en', { orientation: o, nodeW: 144 });
      assert.equal(l.edges.length, a.edges.length);
      for (const e of l.edges) assert.ok(!crossesRect(e.points, l.nodes), `${s} ${o} ${e.id}`);
    }
  }
});

test('route helpers: compress collinear points, rounded corners', () => {
  assert.deepEqual(compress([{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 8 }]), [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 8 }]);
  assert.match(roundedPath([{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 40 }], 10), /Q40 0 40 10/);
});
