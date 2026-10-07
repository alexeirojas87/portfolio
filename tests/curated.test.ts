import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { computeCurated, boundaryRect, crossesRect, gridRows, fitNodeW } from '../src/components/diagram/curated.ts';
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
  assert.equal(gridRows(a), 3);
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

test('agentic views: <=10 nodes, <=3 rows, primary path on the middle row, valid flows, routes clear of nodes', () => {
  const proj = JSON.parse(readFileSync(new URL('../src/content/projects/agentic-orchestration.json', import.meta.url), 'utf8'));
  const views: Architecture[] = [proj.architecture, ...proj.additionalViews.map((v: { architecture: Architecture }) => v.architecture)];
  assert.equal(views.length, 2);
  for (const a of views) {
    assert.ok(isCurated(a));
    assert.ok(a.nodes.length <= 10, `nodes ${a.nodes.length}`);
    assert.ok(gridRows(a) <= 3, 'rows');
    const ids = new Set(a.nodes.map((n) => n.id));
    const edgeIds = new Set(a.edges.map((e) => e.id));
    for (const e of a.edges) assert.ok(ids.has(e.from) && ids.has(e.to), `edge ${e.id} endpoints`);
    for (const f of a.flows) for (const id of f.edges) assert.ok(edgeIds.has(id), `flow ${f.id} edge ${id}`);
    const middle = a.nodes.filter((n) => n.pos!.row === 1).length;
    assert.ok(middle >= a.nodes.filter((n) => n.pos!.row === 0).length && middle >= 2, 'middle row carries the primary path');
    for (const o of ['horizontal', 'vertical'] as const) {
      const l = computeCurated(a, 'en', { orientation: o, nodeW: 96 });
      for (const e of l.edges) assert.ok(!crossesRect(e.points, l.nodes), `${o} ${e.id}`);
    }
  }
});

test('vertical layout of a <=3 row view fits a 390px phone without scrolling', () => {
  const a = JSON.parse(readFileSync(new URL('../src/content/projects/agentic-orchestration.json', import.meta.url), 'utf8')).architecture as Architecture;
  const avail = 390 - 32 - 8; // page gutters + frame padding
  const l = computeCurated(a, 'en', { orientation: 'vertical', nodeW: fitNodeW(gridRows(a), avail) });
  assert.ok(l.width <= avail, `${l.width} <= ${avail}`);
});

// ---- every project, every view ----
const dir = new URL('../src/content/projects/', import.meta.url);
const allViews: { name: string; arch: Architecture }[] = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => {
    const p = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    return [
      { name: `${f}#main`, arch: p.architecture as Architecture },
      ...(p.additionalViews ?? []).map((v: { id: string; architecture: Architecture }) => ({ name: `${f}#${v.id}`, arch: v.architecture })),
    ];
  });

test('all projects: every view is curated, <=10 nodes, <=3 rows, unique ids, valid edges and flows', () => {
  assert.ok(allViews.length >= 12);
  for (const { name, arch } of allViews) {
    assert.ok(isCurated(arch), `${name} curated`);
    assert.ok(arch.nodes.length <= 10, `${name} nodes ${arch.nodes.length}`);
    assert.ok(gridRows(arch) <= 3, `${name} rows ${gridRows(arch)}`);
    const ids = arch.nodes.map((n) => n.id);
    assert.equal(new Set(ids).size, ids.length, `${name} unique node ids`);
    const edgeIds = new Set(arch.edges.map((e) => e.id));
    for (const e of arch.edges) assert.ok(ids.includes(e.from) && ids.includes(e.to), `${name} edge ${e.id}`);
    for (const f of arch.flows) for (const id of f.edges) assert.ok(edgeIds.has(id), `${name} flow ${f.id} -> ${id}`);
    const cells = arch.nodes.map((n) => `${n.pos!.col},${n.pos!.row}`);
    assert.equal(new Set(cells).size, cells.length, `${name} no two nodes share a cell`);
  }
});

test('all projects: no route crosses a node, boundary excludes outside nodes, and 390px fits without scrolling', () => {
  const avail = 390 - 32 - 8;
  for (const { name, arch } of allViews) {
    for (const o of ['horizontal', 'vertical'] as const) {
      const l = computeCurated(arch, 'en', { orientation: o, nodeW: o === 'vertical' ? fitNodeW(gridRows(arch), avail) : undefined });
      for (const e of l.edges) assert.ok(!crossesRect(e.points, l.nodes), `${name} ${o} ${e.id} crosses a node`);
      if (l.boundary) {
        const b = l.boundary;
        for (const n of l.nodes) {
          const overlaps = n.x < b.x + b.w && n.x + n.w > b.x && n.y < b.y + b.h && n.y + n.h > b.y;
          if (!n.owned) assert.ok(!overlaps, `${name} ${o} ${n.id} overlaps the boundary`);
        }
      }
      if (o === 'vertical') assert.ok(l.width <= avail, `${name} vertical width ${l.width} > ${avail}`);
    }
  }
});

// ---- badge placement ----
import { placeBadges, rectsOverlap, pillSize, DOT } from '../src/components/diagram/badges.ts';

test('badges: dots and active pills never overlap each other or nodes (all projects, all steps)', () => {
  let pills = 0, drops = 0;
  for (const { name, arch } of allViews) {
    const l = computeCurated(arch, 'en', { orientation: 'horizontal' });
    const nodes = l.nodes.map((n) => ({ x: n.x, y: n.y, w: n.w, h: n.h }));
    for (const f of arch.flows) {
      const flowEdges = l.edges.filter((e) => f.edges.includes(e.id));
      for (const active of flowEdges) {
        const label = arch.edges.find((e) => e.id === active.id)!.label.en;
        const reqs = flowEdges.map((e) => ({ id: e.id, points: e.points, pill: e.id === active.id ? pillSize(label) : undefined }));
        const placed = placeBadges(reqs, nodes);
        const list = [...placed.values()];
        assert.equal(list.length >= flowEdges.length - 0, true, `${name}/${f.id}: every step has a badge`);
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) assert.ok(!rectsOverlap(list[i], list[j]), `${name}/${f.id} badges ${list[i].id} and ${list[j].id} overlap`);
          if (list[i].kind === 'pill') {
            pills++;
            for (const n of nodes) assert.ok(!rectsOverlap(list[i], n), `${name}/${f.id} pill ${list[i].id} covers a node`);
          } else assert.ok(list[i].w <= DOT && list[i].w >= 18, 'dot size');
        }
        if (placed.get(active.id)?.kind !== 'pill') drops++;
      }
    }
  }
  assert.ok(pills > 0);
  // Pills without a free spot fall back to the caption line; placement must still succeed often.
  assert.ok(pills >= drops * 0.6, `placed ${pills} vs caption-only ${drops}`);
});

test('titles: font steps down before truncating; long words are hyphenated only as a last resort', async () => {
  const { fitTitle } = await import('../src/components/diagram/layout.ts');
  const ok = fitTitle('Jobs de enriquecimiento LLM', 80, [12, 11], 0.52, 3);
  assert.ok(ok.lines.every((l) => !l.endsWith('…')), ok.lines.join('|'));
  assert.ok(ok.lines.length <= 3);
  const tight = fitTitle('Supercalifragilistic', 60, [12, 11], 0.52, 3);
  assert.ok(tight.lines.every((l) => !l.endsWith('…')));
  assert.ok(tight.lines.slice(0, -1).every((l) => l.endsWith('-')));
  const normal = fitTitle('Payment intake', 136, [14.5, 13], 0.483, 3);
  assert.equal(normal.size, 14.5);
});

// ---- branches and panel/flow state ----
import { openPanelPlayback, closePanelPlayback } from '../src/components/diagram/flow.ts';

test('wagering: Live bet placement shows a single live path to the live engine', () => {
  const proj = JSON.parse(readFileSync(new URL('../src/content/projects/wagering-platform.json', import.meta.url), 'utf8'));
  const a: Architecture = proj.architecture;
  assert.equal(a.viewName?.en, 'Live bet placement');
  const ids = a.nodes.map((n) => n.id);
  assert.ok(!ids.includes('legacy') && !ids.includes('ledgerdb'), 'no pregame nodes in the live view');
  assert.ok(a.flows.every((f) => f.id !== 'flow-pregame'));
  assert.ok(a.edges.every((e) => ids.includes(e.from) && ids.includes(e.to)));
  const live = a.nodes.find((n) => n.id === 'liveapi')!;
  assert.equal(live.link, 'live-betting-engine');
  assert.equal((live.label as { en: string }).en, 'Live engine · bet API');
  assert.equal((live.label as { es: string }).es, 'API de apuestas del motor en vivo');
  // the legacy ledger API stays available, renamed, in the views that use it
  const other = proj.additionalViews.flatMap((v: { architecture: Architecture }) => v.architecture.nodes).find((n: { id: string }) => n.id === 'legacy');
  assert.equal(other.label.en, 'Legacy ledger API');
});

test('panel/flow state: opening pauses and remembers, closing restores', () => {
  const playing = openPanelPlayback({ playing: true, resume: null });
  assert.deepEqual(playing, { playing: false, resume: true });
  // opening another node while open keeps the original resume intent
  assert.deepEqual(openPanelPlayback({ playing: false, resume: true }), { playing: false, resume: true });
  assert.deepEqual(closePanelPlayback(playing), { playing: true, resume: null });
  const paused = openPanelPlayback({ playing: false, resume: null });
  assert.deepEqual(closePanelPlayback(paused), { playing: false, resume: null });
});
