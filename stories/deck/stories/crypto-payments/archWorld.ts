import { rectExit, type Rect } from 'beatdeck';

/**
 * The architecture "world": ONE coordinate space shared by the intake, execution and confirmation scenes.
 * The camera (see `camFor`) pans over it, so nothing is redrawn between scenes. Node text comes from the project JSON
 * (ARCH_ID); positions and the choreography below are authored.
 *
 * Both JSON views are laid out left to right on one row: merchant, API, queue, executor, adapters, chain (view 1), then the
 * confirmation view continues to the right: watcher, event queue, notifier, merchant (view 2). The payments store appears once
 * per view (`db`, `db2`), exactly as the JSON draws it.
 *
 * Scene indices (0-based): 2 intake, 3 execution, 4 idempotency (world hidden), 5 confirmation.
 */
export type Pt = { x: number; y: number };

export const S_IN = 2, S_EX = 3, S_ID = 4, S_CF = 5;

const R = (x: number, y: number, w = 330, h = 140): Rect => ({ x, y, w, h });

export const RECT = {
  merchant: R(60, 620), api: R(510, 620), reqq: R(960, 620), executor: R(1410, 620), adapters: R(1860, 620), chain: R(2310, 620),
  dlq: R(960, 400), wallet: R(2310, 400), db: R(960, 860),
  watcher: R(2760, 620), db2: R(2760, 860), evtq: R(3210, 620), notifier: R(3660, 620), merchant2: R(4110, 620),
} satisfies Record<string, Rect>;
export type NodeKey = keyof typeof RECT;
export const NODE_KEYS = Object.keys(RECT) as NodeKey[];

/** Which JSON node supplies the text/kind of each world node. */
export const ARCH_ID: Record<NodeKey, string> = {
  merchant: 'merchant', api: 'api', reqq: 'reqq', executor: 'executor', adapters: 'adapters', chain: 'chain',
  dlq: 'dlq', wallet: 'wallet', db: 'db', watcher: 'watcher', db2: 'db', evtq: 'evtq', notifier: 'notifier', merchant2: 'merchant',
};

export const centre = (k: NodeKey): Pt => {
  const r = RECT[k];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};

// ── edges ─────────────────────────────────────────────────────────────────────────────────────────────────────

export interface EdgeDef { id: string; from: NodeKey; to: NodeKey; json?: string; async?: boolean; off?: number; busy?: boolean }
export const EDGES: EdgeDef[] = [
  { id: 'e1', from: 'merchant', to: 'api', json: 'e1', off: -16, busy: true },
  { id: 'ack', from: 'api', to: 'merchant', off: -16 },
  { id: 'e2', from: 'api', to: 'db', json: 'e2' },
  { id: 'e3', from: 'api', to: 'reqq', json: 'e3', async: true, busy: true },
  { id: 'e4', from: 'reqq', to: 'executor', json: 'e4', async: true },
  { id: 'e5', from: 'executor', to: 'wallet', json: 'e5' },
  { id: 'e6', from: 'executor', to: 'adapters', json: 'e6' },
  { id: 'e7', from: 'adapters', to: 'chain', json: 'e7' },
  { id: 'e8', from: 'executor', to: 'db', json: 'e8' },
  { id: 'e9', from: 'reqq', to: 'dlq', json: 'e9', async: true },
  { id: 'e10', from: 'watcher', to: 'db2', json: 'e10', off: -16 },
  { id: 'e11', from: 'watcher', to: 'chain', json: 'e11' },
  { id: 'e12', from: 'watcher', to: 'db2', json: 'e12', off: 16 },
  { id: 'e13', from: 'watcher', to: 'evtq', json: 'e13', async: true },
  { id: 'e14', from: 'evtq', to: 'notifier', json: 'e14', async: true },
  { id: 'e15', from: 'notifier', to: 'merchant2', json: 'e15', async: true },
];

/** Clipped endpoints of an edge (so a line never runs under its boxes), shifted by `off` for parallel pairs. */
export function edgePts(e: EdgeDef): [Pt, Pt] {
  const a = RECT[e.from], z = RECT[e.to];
  const ca = centre(e.from), cz = centre(e.to);
  const p = rectExit(a, cz.x, cz.y), q = rectExit(z, ca.x, ca.y);
  const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
  const ux = (q.x - p.x) / len, uy = (q.y - p.y) / len;
  const o = e.off ?? 0, gap = 8;
  return [
    { x: p.x + ux * gap - uy * o, y: p.y + uy * gap + ux * o },
    { x: q.x - ux * gap - uy * o, y: q.y - uy * gap + ux * o },
  ];
}

// ── choreography: ONE table for every world scene, so flags carry over naturally ───────────────────────────────

export interface Step {
  /** Where the glowing packet is. */
  pkt: NodeKey | null;
  /** Dwell time (ms) on this step before the next one. */
  ms: number;
  /** Persisted as pending (badge on the store) / acknowledged to the merchant (badge on the checkout). */
  pend: boolean;
  ack: boolean;
  /** The acknowledgement wire is the hot one (instead of the request wire). */
  ackw: boolean;
  /** Burst of requests on the intake wires. */
  stream: boolean;
  /** Messages waiting in the request queue. */
  q: number;
  sign: boolean;
  /** Coin chip in focus (0 BTC, 1 ETH, 2 LTC), -1 none. */
  coin: number;
  /** Transaction hash and submitted status stored. */
  hash: boolean;
  fail: boolean;
  /** Messages in the dead-letter queue. */
  dlq: number;
  /** Illustrative confirmation counter. */
  cf: number;
  confirmed: boolean;
  evt: boolean;
  push: boolean;
}
type Patch = Partial<Step> & { ms: number };
const BASE: Step = {
  pkt: null, ms: 0, pend: false, ack: false, ackw: false, stream: false, q: 0, sign: false, coin: -1, hash: false, fail: false,
  dlq: 0, cf: 0, confirmed: false, evt: false, push: false,
};
/** Each entry patches the previous step: flags carry over until a step changes them. */
function build(list: Patch[]): Step[] {
  let cur = BASE;
  return list.map((p) => (cur = { ...cur, ...p }));
}

/** Each world beat is one segment of the shared step table: [scene, beat, steps]. Ends are computed, never hand-counted. */
const SEGS: [number, number, Patch[]][] = [
  // intake 0: the checkout calls the API
  [S_IN, 0, [{ pkt: 'merchant', ms: 700 }, { pkt: 'api', ms: 900 }]],
  // intake 1: validated, persisted as pending
  [S_IN, 1, [{ pkt: 'db', ms: 1000, pend: true }, { pkt: 'api', ms: 600 }]],
  // intake 2: enqueued
  [S_IN, 2, [{ pkt: 'reqq', ms: 1000, q: 1 }, { pkt: 'api', ms: 500 }]],
  // intake 3: acknowledged at once
  [S_IN, 3, [{ pkt: 'merchant', ms: 1400, ack: true, ackw: true }]],
  // intake 4: a burst of requests, the queue absorbs it
  [S_IN, 4, [
    { pkt: 'merchant', ms: 500, ackw: false, stream: true }, { pkt: 'api', ms: 450 }, { pkt: 'reqq', ms: 500, q: 2 },
    { pkt: 'merchant', ms: 350 }, { pkt: 'api', ms: 450 }, { pkt: 'reqq', ms: 900, q: 3 },
  ]],
  // execution 0: consume and sign with the user's wallet
  [S_EX, 0, [{ pkt: 'reqq', ms: 600, stream: false }, { pkt: 'executor', ms: 800, q: 2 }, { pkt: 'wallet', ms: 1100, sign: true }, { pkt: 'executor', ms: 600 }]],
  // execution 1: one adapter per coin, broadcast through the node
  [S_EX, 1, [
    { pkt: 'adapters', ms: 650, coin: 0 }, { pkt: 'adapters', ms: 450, coin: 1 }, { pkt: 'adapters', ms: 450, coin: 2 }, { pkt: 'adapters', ms: 700, coin: 0 },
    { pkt: 'chain', ms: 1200 }, { pkt: 'adapters', ms: 600 },
  ]],
  // execution 2: hash and submitted status recorded
  [S_EX, 2, [{ pkt: 'executor', ms: 500, coin: -1 }, { pkt: 'db', ms: 1500, hash: true }, { pkt: 'executor', ms: 700 }]],
  // execution 3: a message that keeps failing goes to the dead-letter queue
  [S_EX, 3, [
    { pkt: 'reqq', ms: 700, q: 1 }, { pkt: 'executor', ms: 700, q: 0 }, { pkt: 'executor', ms: 800, fail: true }, { pkt: 'reqq', ms: 600, fail: false, q: 1 },
    { pkt: 'executor', ms: 600, q: 0 }, { pkt: 'executor', ms: 700, fail: true }, { pkt: 'dlq', ms: 1700, fail: false, dlq: 1 },
  ]],
  // confirmation 0: the watcher polls for confirmations (illustrative counter)
  [S_CF, 0, [
    { pkt: 'watcher', ms: 700, fail: false }, { pkt: 'db2', ms: 800 }, { pkt: 'watcher', ms: 500 },
    { pkt: 'chain', ms: 800 }, { pkt: 'watcher', ms: 700, cf: 1 }, { pkt: 'chain', ms: 800 }, { pkt: 'watcher', ms: 700, cf: 2 },
    { pkt: 'chain', ms: 800 }, { pkt: 'watcher', ms: 1000, cf: 3 },
  ]],
  // confirmation 1: marked confirmed, event published
  [S_CF, 1, [{ pkt: 'db2', ms: 1000, confirmed: true }, { pkt: 'watcher', ms: 500 }, { pkt: 'evtq', ms: 1300, evt: true }]],
  // confirmation 2: the notifier pushes the result
  [S_CF, 2, [{ pkt: 'notifier', ms: 900 }, { pkt: 'merchant2', ms: 1500, push: true }]],
];

export const STEPS: Step[] = build(SEGS.flatMap(([, , steps]) => steps));
export const LAST = STEPS.length - 1;

/** Last step index of each segment, in story order. */
const ENDS: { s: number; b: number; end: number }[] = [];
{
  let n = -1;
  for (const [s, b, steps] of SEGS) { n += steps.length; ENDS.push({ s, b, end: n }); }
}
const before = (a: { s: number; b: number }, s: number, b: number) => a.s < s || (a.s === s && a.b < b);
/** Step index when beat (s, b) is entered (an automatic world beat replays from here). */
export function wStart(s: number, b: number): number {
  const prev = ENDS.filter((w) => before(w, s, b)).pop();
  return prev ? prev.end : -1;
}
/** Step index settled at the END of (s, b), or carried over from the last world beat before it. */
export function wEnd(s: number, b: number): number {
  const w = ENDS.find((x) => x.s === s && x.b === b);
  if (w) return w.end;
  const prev = ENDS.filter((x) => before(x, s, b + 1)).pop();
  return prev ? prev.end : -1;
}
export const isAutoWorld = (s: number, b: number) => ENDS.some((x) => x.s === s && x.b === b);

// ── camera ────────────────────────────────────────────────────────────────────────────────────────────────────

export interface Cam { x: number; y: number; s: number }
/** Top-left world coordinate seen at the stage origin, and zoom. Pans right across the one row (intake, execution, confirmation). */
export function camFor(s: number, b: number): Cam {
  if (s <= S_IN) return { x: -200, y: 0, s: 1 };
  if (s === S_EX || s === S_ID) return { x: 810, y: 0, s: 1 };
  if (s === S_CF) return b <= 1 ? { x: 2010, y: 0, s: 1 } : { x: 2610, y: 0, s: 1 };
  return { x: 2610, y: 0, s: 1 };
}
export const worldVisible = (s: number, b: number) => s === S_IN || s === S_EX || (s === S_CF && b <= 2);

// ── what is on stage, as a pure function of position + live ───────────────────────────────────────────────────

export type Tone = 'hot' | 'normal' | 'dim' | 'fault' | 'ok';

const FIRST_AT: Record<NodeKey, [number, number]> = {
  merchant: [S_IN, 0], api: [S_IN, 0], db: [S_IN, 1], reqq: [S_IN, 2],
  executor: [S_EX, 0], wallet: [S_EX, 0], adapters: [S_EX, 1], chain: [S_EX, 1], dlq: [S_EX, 3],
  watcher: [S_CF, 0], db2: [S_CF, 0], evtq: [S_CF, 1], notifier: [S_CF, 2], merchant2: [S_CF, 2],
};
export const nodeOn = (k: NodeKey, s: number, b: number) => s > FIRST_AT[k][0] || (s === FIRST_AT[k][0] && b >= FIRST_AT[k][1]);

const IN_NODES = new Set<NodeKey>(['merchant', 'api', 'db', 'reqq']);
const EX_NODES = new Set<NodeKey>(['reqq', 'executor', 'wallet', 'adapters', 'chain', 'dlq', 'db']);
const CF_NODES = new Set<NodeKey>(['chain', 'watcher', 'db2', 'evtq', 'notifier', 'merchant2']);

export interface Live { w: number; boot: number; ty: number; cs: number; pc: number; pb: number; cut: boolean }
export const stepAt = (i: number): Step => (i < 0 ? BASE : STEPS[Math.min(i, LAST)]);

export interface WorldState {
  visible: boolean;
  tone: Partial<Record<NodeKey, Tone>>;
  on: Partial<Record<NodeKey, boolean>>;
  edges: { def: EdgeDef; on: boolean; tone: Tone | 'dimline' }[];
  step: Step;
  stream: boolean;
}

export function deriveWorld(s: number, b: number, live: Live): WorldState {
  const step = stepAt(live.w);
  const prev = live.w > 0 ? STEPS[Math.min(live.w - 1, LAST)] : BASE;
  const inF = s === S_IN, exF = s === S_EX, cfF = s === S_CF;
  const on: WorldState['on'] = {};
  const tone: WorldState['tone'] = {};
  for (const k of NODE_KEYS) {
    on[k] = nodeOn(k, s, b);
    const focus = (inF && IN_NODES.has(k)) || (exF && EX_NODES.has(k)) || (cfF && CF_NODES.has(k));
    let t: Tone = focus ? 'normal' : 'dim';
    if (step.pkt === k && focus) t = 'hot';
    if (inF && k === 'merchant' && step.ack && step.pkt === 'merchant') t = 'ok';
    if (exF) {
      if (k === 'executor' && step.fail) t = 'fault';
      if (k === 'wallet' && step.sign && step.pkt === 'wallet') t = 'ok';
      if (k === 'db' && step.hash && step.pkt === 'db') t = 'ok';
      if (k === 'dlq' && step.dlq) t = 'fault';
    }
    if (cfF) {
      if (k === 'watcher' && step.cf === 3 && !step.confirmed) t = 'ok';
      if (k === 'db2' && step.confirmed) t = 'ok';
      if (k === 'merchant2' && step.push) t = 'ok';
    }
    tone[k] = t;
  }

  const hotPair = (e: EdgeDef) =>
    !!prev.pkt && !!step.pkt && prev.pkt !== step.pkt &&
    ((e.from === prev.pkt && e.to === step.pkt) || (e.to === prev.pkt && e.from === step.pkt));
  const edges = EDGES.map((def) => {
    let vis = !!on[def.from] && !!on[def.to];
    if (def.id === 'ack') vis = vis && (s > S_IN || b >= 3);
    const cluster = IN_NODES.has(def.from) && IN_NODES.has(def.to) || def.id === 'ack' ? 'in' : CF_NODES.has(def.from) && CF_NODES.has(def.to) ? 'cf' : 'ex';
    const focus = (cluster === 'in' && inF) || (cluster === 'ex' && exF) || (cluster === 'cf' && cfF);
    let t: Tone | 'dimline' = focus ? 'normal' : 'dimline';
    let hot = hotPair(def);
    if (def.id === 'ack') hot = step.ackw && inF;
    if (def.id === 'e1' && step.ackw) hot = false;
    if (def.id === 'e12') hot = step.confirmed && step.pkt === 'db2' && cfF;
    if (def.id === 'e10') hot = !step.confirmed && step.pkt === 'db2' && cfF;
    if (hot) t = 'hot';
    if (exF && step.fail && (def.id === 'e4' || def.id === 'e9')) t = 'fault';
    if (exF && step.dlq && def.id === 'e9') t = 'fault';
    return { def, on: vis, tone: t };
  });

  return { visible: worldVisible(s, b), tone, on, edges, step, stream: inF && step.stream };
}
