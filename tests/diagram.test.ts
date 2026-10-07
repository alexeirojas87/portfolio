import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeLayout, wrapText } from '../src/components/diagram/layout.ts';
import { buildSteps, progressAt, nextStep, prevStep } from '../src/components/diagram/flow.ts';
import type { Architecture } from '../src/components/diagram/types.ts';

const t = (s: string) => ({ en: s, es: s });
const arch: Architecture = {
  groups: [{ id: 'a', label: t('A') }, { id: 'b', label: t('B') }],
  nodes: [
    { id: 'n1', label: 'One', sublabel: t('x'), kind: 'client', group: 'a' },
    { id: 'n2', label: 'Two', sublabel: t('x'), kind: 'service', group: 'b' },
    { id: 'n3', label: 'Three', sublabel: t('x'), kind: 'db', group: 'b' },
  ],
  edges: [
    { id: 'e1', from: 'n1', to: 'n2', label: t('go'), async: false },
    { id: 'e2', from: 'n2', to: 'n3', label: t('save'), async: true },
    { id: 'e3', from: 'n3', to: 'n1', label: t('back'), async: false },
  ],
  flows: [{ id: 'f', name: t('F'), description: t('d'), edges: ['e1', 'e2', 'missing', 'e3'] }],
};

test('layout is deterministic and places columns left to right', () => {
  const a = computeLayout(arch, 'en', 'full');
  const b = computeLayout(arch, 'en', 'full');
  assert.deepEqual(a, b);
  assert.equal(a.zones.length, 2);
  assert.ok(a.nodes.find((n) => n.id === 'n2')!.x > a.nodes.find((n) => n.id === 'n1')!.x);
  assert.equal(a.edges.length, 3);
  assert.ok(a.width > 0 && a.height > 0);
});

test('compact layout is smaller than full', () => {
  assert.ok(computeLayout(arch, 'en', 'compact').width < computeLayout(arch, 'en', 'full').width);
});

test('wrapText wraps and ellipsizes', () => {
  assert.deepEqual(wrapText('short', 10, 2), ['short']);
  const l = wrapText('a fairly long label that overflows everything', 12, 2);
  assert.equal(l.length, 2);
  assert.ok(l[1].endsWith('…'));
});

test('flow steps skip unknown edges and progress is consistent', () => {
  const steps = buildSteps(arch, arch.flows[0]);
  assert.equal(steps.length, 3);
  const p = progressAt(steps, 1);
  assert.equal(p.activeEdge, 'e2');
  assert.ok(p.doneEdges.has('e1'));
  assert.ok(p.activeNodes.has('n2') && p.activeNodes.has('n3'));
  assert.ok(p.doneNodes.has('n1') && !p.doneNodes.has('n2'));
  assert.equal(nextStep(2, 3), 0);
  assert.equal(prevStep(0, 3), 2);
});
