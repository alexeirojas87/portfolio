import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectionsFor } from '../src/components/diagram/connections.ts';
import { buildViews, viewById, PRIMARY_VIEW_ID } from '../src/components/diagram/views.ts';
import type { Architecture } from '../src/components/diagram/types.ts';

const t = (s: string) => ({ en: s, es: s });
const node = (id: string) => ({ id, label: id, sublabel: t(id), kind: 'service' as const, group: 'g' });
const arch = (ids: string[], edges: [string, string, string, boolean][], name?: string): Architecture => ({
  groups: [], nodes: ids.map(node),
  edges: edges.map(([id, from, to, async]) => ({ id, from, to, label: t(id), async })),
  flows: [], viewName: name ? t(name) : null,
});

test('connections are derived from edges, split by direction, in data order', () => {
  const a = arch(['a', 'b', 'c'], [['e1', 'a', 'b', false], ['e2', 'b', 'c', true], ['e3', 'c', 'b', false]]);
  const { incoming, outgoing } = connectionsFor(a, 'b');
  assert.deepEqual(incoming.map((c) => [c.edgeId, c.other.id, c.async]), [['e1', 'a', false], ['e3', 'c', false]]);
  assert.deepEqual(outgoing.map((c) => [c.edgeId, c.other.id, c.async]), [['e2', 'c', true]]);
  assert.deepEqual(connectionsFor(a, 'zzz'), { incoming: [], outgoing: [] });
});

test('connections ignore edges that point at unknown nodes', () => {
  const a = arch(['a'], [['e1', 'a', 'ghost', false]]);
  assert.equal(connectionsFor(a, 'a').outgoing.length, 0);
});

test('views: primary first with its own name, additional views follow', () => {
  const main = arch(['a'], [], 'Lifecycle');
  const other = arch(['x', 'y'], [['e', 'x', 'y', false]]);
  const views = buildViews({ architecture: main, additionalViews: [{ id: 'infra', name: t('Infra'), description: t('d'), architecture: other }] });
  assert.deepEqual(views.map((v) => v.id), [PRIMARY_VIEW_ID, 'infra']);
  assert.equal(views[0].name.en, 'Lifecycle');
  assert.equal(viewById(views, 'infra').architecture, other);
  assert.equal(viewById(views, 'nope').id, PRIMARY_VIEW_ID);
});

test('views: a project without additional views has a single, default-named view', () => {
  const views = buildViews({ architecture: arch(['a'], []) });
  assert.equal(views.length, 1);
  assert.equal(views[0].name.en, 'Overview');
  assert.equal(buildViews({ architecture: arch(['a'], []), additionalViews: null }).length, 1);
});
