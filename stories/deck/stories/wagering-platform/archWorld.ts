import { rectExit, type Rect } from 'beatdeck';

/**
 * The live bet path as ONE world: a single coordinate space seen by a moving camera (see `camFor`).
 * Node text comes from the project JSON (ARCH_ID); positions and the choreography below are authored.
 * Only the live path exists here: no pregame branch, no ticket writer, no live-bet delay.
 *
 * Scene indices (0-based): 2 live path, 3 one player at a time, 4 limits engine, 5 real-time and telemetry.
 */
export type Pt = { x: number; y: number };

export const S_PATH = 2, S_ONE = 3, S_LIM = 4, S_RT = 5;

const R = (x: number, y: number, w = 380, h = 128): Rect => ({ x, y, w, h });

export const RECT = {
  web: R(60, 640), api: R(540, 640), kvalid: R(1020, 640), core: R(1560, 640, 420), liveapi: R(2200, 640, 420),
  limits: R(2000, 380, 420), livedb: R(1960, 880, 420),
  hub: R(540, 880), knotify: R(1000, 880), obs: R(1500, 880),
} satisfies Record<string, Rect>;
export type NodeKey = keyof typeof RECT;
export const NODE_KEYS = Object.keys(RECT) as NodeKey[];

/** Which JSON node supplies the text/kind of each world node. */
export const ARCH_ID: Record<NodeKey, string> = {
  web: 'web', api: 'api', kvalid: 'kvalid', core: 'core', liveapi: 'liveapi', limits: 'limits', livedb: 'livedb',
  hub: 'hub', knotify: 'knotify', obs: 'obs',
};

export const centre = (k: NodeKey): Pt => {
  const r = RECT[k];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};

/** Extra points: the three slots of the player's partition lane (above the topic) and two slots above the live database. */
export const SLOT = {
  ln1: { x: 1090, y: 566 }, ln2: { x: 1200, y: 566 }, ln3: { x: 1310, y: 566 },
  db1: { x: 2090, y: 832 }, db2: { x: 2170, y: 832 },
} satisfies Record<string, Pt>;
export type SlotKey = keyof typeof SLOT;
export const LANE = { x: 1030, y: 530, w: 370, h: 72 };

// ── edges ─────────────────────────────────────────────────────────────────────────────────────────────────────

export interface EdgeDef { id: string; from: NodeKey; to: NodeKey; async?: boolean }
export const EDGES: EdgeDef[] = [
  { id: 'e1', from: 'web', to: 'api' },
  { id: 'e2', from: 'api', to: 'kvalid', async: true },
  { id: 'e3', from: 'kvalid', to: 'core', async: true },
  { id: 'e6', from: 'core', to: 'limits' },
  { id: 'e7', from: 'core', to: 'livedb' },
  { id: 'e21', from: 'core', to: 'liveapi' },
  { id: 'e24', from: 'liveapi', to: 'livedb' },
  { id: 'e13', from: 'core', to: 'knotify', async: true },
  { id: 'e15', from: 'knotify', to: 'hub', async: true },
  { id: 'e16', from: 'hub', to: 'web', async: true },
  { id: 'e19', from: 'core', to: 'obs', async: true },
];
const PATH_EDGES = new Set(['e1', 'e2', 'e3', 'e6', 'e7', 'e21', 'e24']);

export function edgePts(e: EdgeDef): [Pt, Pt] {
  const a = RECT[e.from], z = RECT[e.to];
  const ca = centre(e.from), cz = centre(e.to);
  const p = rectExit(a, cz.x, cz.y), q = rectExit(z, ca.x, ca.y);
  const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
  const ux = (q.x - p.x) / len, uy = (q.y - p.y) / len;
  const gap = 8;
  return [{ x: p.x + ux * gap, y: p.y + uy * gap }, { x: q.x - ux * gap, y: q.y - uy * gap }];
}

// ── choreography: one table per automatic sequence ─────────────────────────────────────────────────────────────

export type TokId = 'a' | 'b' | 'd';
export interface Tok { id: TokId; at: NodeKey | SlotKey; label: string; tone?: 'ok' | 'fault'; dup?: boolean }
export type BadgeKey =
  | 'received' | 'keyed' | 'validates' | 'handoff' | 'inserted'
  | 'sameKey' | 'locked' | 'waits' | 'fresh' | 'retry' | 'absorbed'
  | 'violation' | 'rejected' | 'pushed' | 'otlp';

export interface Step {
  ms: number;
  toks: Tok[];
  /** Nodes drawn hot, wires drawn hot, wires carrying a dense stream (peak traffic). */
  hot: NodeKey[];
  edges: string[];
  stream: string[];
  badges: BadgeKey[];
  /** Validation checks ticked (0..4), notification states lit (0..6), per-player lock held. */
  checks: number;
  states: number;
  lock: boolean;
  /** Nodes that have been visited (green), used by the trace-follow beat. */
  seen: NodeKey[];
}
type Patch = Partial<Step> & { ms: number };
const BASE: Step = { ms: 0, toks: [], hot: [], edges: [], stream: [], badges: [], checks: 0, states: 0, lock: false, seen: [] };
/** Each entry patches the previous step: flags carry over until a step changes them. */
function build(list: Patch[]): Step[] {
  let cur = BASE;
  return list.map((p) => (cur = { ...cur, ...p }));
}
const T = (id: TokId, at: Tok['at'], label: string, extra: Partial<Tok> = {}): Tok => ({ id, at, label, ...extra });

/** Scene 3: bet, API "received", topic keyed by player, validate only, idempotent hand-off, insert. */
export const PATH: Step[] = build([
  { toks: [T('a', 'web', 'bet')], hot: ['web'], stream: ['e1', 'e2'], ms: 700 },
  { toks: [T('a', 'api', 'bet')], hot: ['api'], edges: ['e1'], badges: ['received'], ms: 900 },
  { stream: [], ms: 700 },
  // end of beat 0 = 2
  { toks: [T('a', 'kvalid', 'bet')], hot: ['kvalid'], edges: ['e2'], badges: ['received', 'keyed'], ms: 1000 },
  { ms: 900 },
  // 4
  { toks: [T('a', 'core', 'bet')], hot: ['core'], edges: ['e3'], badges: ['validates'], ms: 800 },
  { checks: 1, hot: ['core'], edges: [], ms: 600 },
  { checks: 2, ms: 600 },
  { checks: 3, hot: ['core', 'limits'], edges: ['e6'], ms: 800 },
  { checks: 4, hot: ['core', 'livedb'], edges: ['e7'], ms: 900 },
  // 9
  { toks: [T('a', 'liveapi', 'bet')], hot: ['liveapi'], edges: ['e21'], badges: ['handoff'], checks: 4, ms: 1100 },
  { ms: 600 },
  // 11
  { toks: [T('a', 'livedb', 'bet', { tone: 'ok' })], hot: ['livedb'], edges: ['e24'], badges: ['inserted'], ms: 1100 },
  { ms: 800 },
  // 13
]);
export const PATH_ENDS = [2, 4, 9, 11, 13];

/** Scene 4: two bets of one player share a lane, take the lock in turn; a duplicate id is absorbed. */
export const ONE: Step[] = build([
  { toks: [T('a', 'api', 'A1'), T('b', 'api', 'A2')], hot: ['api'], ms: 500 },
  { toks: [T('a', 'ln3', 'A1'), T('b', 'ln2', 'A2')], hot: ['kvalid'], edges: ['e2'], badges: ['sameKey'], ms: 1000 },
  { ms: 800 },
  // end of beat 0 = 2
  { toks: [T('a', 'core', 'A1'), T('b', 'ln3', 'A2')], hot: ['core'], edges: ['e3'], lock: true, badges: ['locked'], ms: 1000 },
  { toks: [T('a', 'core', 'A1'), T('b', 'ln3', 'A2')], hot: ['core', 'livedb'], edges: ['e7'], ms: 900 },
  { badges: ['locked', 'waits'], ms: 900 },
  // 5
  { toks: [T('a', 'liveapi', 'A1'), T('b', 'core', 'A2')], hot: ['liveapi', 'core'], edges: ['e21'], badges: ['locked'], ms: 900 },
  { toks: [T('a', 'db1', 'A1', { tone: 'ok' }), T('b', 'core', 'A2')], hot: ['livedb', 'core'], edges: ['e24', 'e7'], badges: ['locked', 'fresh'], ms: 1000 },
  { toks: [T('a', 'db1', 'A1', { tone: 'ok' }), T('b', 'liveapi', 'A2')], hot: ['liveapi'], edges: ['e21'], lock: false, badges: [], ms: 800 },
  { toks: [T('a', 'db1', 'A1', { tone: 'ok' }), T('b', 'db2', 'A2', { tone: 'ok' })], hot: ['livedb'], edges: ['e24'], ms: 900 },
  // 9
  { toks: [T('a', 'db1', 'A1', { tone: 'ok' }), T('b', 'db2', 'A2', { tone: 'ok' }), T('d', 'core', 'A1', { dup: true })], hot: ['core'], edges: [], badges: ['retry'], ms: 800 },
  { toks: [T('a', 'db1', 'A1', { tone: 'ok' }), T('b', 'db2', 'A2', { tone: 'ok' }), T('d', 'liveapi', 'A1', { dup: true })], hot: ['liveapi'], edges: ['e21'], ms: 900 },
  { toks: [T('a', 'db1', 'A1', { tone: 'ok' }), T('b', 'db2', 'A2', { tone: 'ok' }), T('d', 'liveapi', 'A1', { dup: true, tone: 'fault' })], hot: ['liveapi'], edges: [], badges: ['retry', 'absorbed'], ms: 1100 },
  { toks: [T('a', 'db1', 'A1', { tone: 'ok' }), T('b', 'db2', 'A2', { tone: 'ok' })], hot: [], badges: ['absorbed'], ms: 900 },
  // 13
]);
export const ONE_ENDS = [2, 5, 9, 13];

/** Scene 5: the limits engine decides; a bet over the per-game cap is rejected. */
export const LIM: Step[] = build([
  { toks: [T('a', 'core', 'bet')], hot: ['core'], ms: 500 },
  { toks: [T('a', 'limits', 'bet')], hot: ['limits'], edges: ['e6'], ms: 900 },
  // end of beat 0 = 1
  { ms: 700 },
  // 2
  { toks: [T('a', 'limits', 'bet', { tone: 'fault' })], hot: ['limits'], badges: ['violation'], ms: 1000 },
  { toks: [T('a', 'core', 'bet', { tone: 'fault' })], hot: ['core'], edges: ['e6'], badges: ['violation', 'rejected'], ms: 900 },
  // 4
]);
export const LIM_ENDS = [1, 2, 4];

/** Scene 6: states to the notification stream, the hub pushes to the player, telemetry, one trace across stages. */
export const RT: Step[] = build([
  { toks: [T('a', 'core', 'state')], hot: ['core'], ms: 500 },
  { toks: [T('a', 'knotify', 'state')], hot: ['knotify'], edges: ['e13'], ms: 900 },
  { states: 1, ms: 330 }, { states: 2, ms: 330 }, { states: 3, ms: 330 }, { states: 4, ms: 330 }, { states: 5, ms: 330 }, { states: 6, ms: 600 },
  // end of beat 0 = 7
  { toks: [T('a', 'hub', 'state')], hot: ['hub'], edges: ['e15'], ms: 900 },
  { toks: [T('a', 'web', 'state', { tone: 'ok' })], hot: ['web'], edges: ['e16'], badges: ['pushed'], ms: 1100 },
  { ms: 600 },
  // 10
  { toks: [T('a', 'core', 'trace')], hot: ['core'], edges: [], badges: [], ms: 500 },
  { toks: [T('a', 'obs', 'trace')], hot: ['obs'], edges: ['e19'], badges: ['otlp'], ms: 1100 },
  { ms: 900 },
  // 13
  { toks: [T('b', 'web', 'id')], hot: ['web'], edges: [], badges: [], seen: ['web'], ms: 450 },
  { toks: [T('b', 'api', 'id')], hot: ['api'], edges: ['e1'], seen: ['web', 'api'], ms: 450 },
  { toks: [T('b', 'kvalid', 'id')], hot: ['kvalid'], edges: ['e2'], seen: ['web', 'api', 'kvalid'], ms: 450 },
  { toks: [T('b', 'core', 'id')], hot: ['core'], edges: ['e3'], seen: ['web', 'api', 'kvalid', 'core'], ms: 450 },
  { toks: [T('b', 'knotify', 'id')], hot: ['knotify'], edges: ['e13'], seen: ['web', 'api', 'kvalid', 'core', 'knotify'], ms: 450 },
  { toks: [T('b', 'hub', 'id')], hot: ['hub'], edges: ['e15'], seen: ['web', 'api', 'kvalid', 'core', 'knotify', 'hub'], ms: 450 },
  { toks: [T('b', 'web', 'id', { tone: 'ok' })], hot: ['web'], edges: ['e16'], ms: 1000 },
  // 20
]);
export const RT_ENDS = [7, 10, 13, 20];

export const SEQ = {
  path: { scene: S_PATH, steps: PATH, ends: PATH_ENDS },
  one: { scene: S_ONE, steps: ONE, ends: ONE_ENDS },
  lim: { scene: S_LIM, steps: LIM, ends: LIM_ENDS },
  rt: { scene: S_RT, steps: RT, ends: RT_ENDS },
} as const;
export type SeqKey = keyof typeof SEQ;

/** Sequence index at the START of beat b of scene s (auto beats replay from here) or settled at its END. */
export function seqValue(key: SeqKey, s: number, b: number, atStart: boolean): number {
  const q = SEQ[key];
  if (s < q.scene) return -1;
  if (s > q.scene) return q.ends[q.ends.length - 1];
  const start = b === 0 ? -1 : q.ends[b - 1];
  return atStart ? start : q.ends[b];
}

// ── camera ────────────────────────────────────────────────────────────────────────────────────────────────────

export interface Cam { x: number; y: number; s: number }
/** Top-left world coordinate seen at the stage origin. The path pans right with the bet; limits slides left to make room for its meters. */
export function camFor(s: number, b: number): Cam {
  if (s < S_PATH) return { x: 0, y: 0, s: 1 };
  if (s === S_PATH) return b <= 1 ? { x: 0, y: 0, s: 1 } : { x: 930, y: 0, s: 1 };
  if (s === S_ONE) return { x: 930, y: 0, s: 1 };
  if (s === S_LIM) return { x: 560, y: 0, s: 1 };
  if (s === S_RT) return { x: 60, y: 0, s: 1 };
  return { x: 60, y: 0, s: 1 };
}
export const worldVisible = (s: number) => s >= S_PATH && s <= S_RT;

// ── what is on stage, as a pure function of position + live ───────────────────────────────────────────────────

export type Tone = 'hot' | 'normal' | 'dim' | 'ghost' | 'fault' | 'ok';

export function nodeOn(k: NodeKey, s: number, b: number): boolean {
  if (k === 'web' || k === 'api') return s >= S_PATH;
  if (k === 'kvalid') return s > S_PATH || (s === S_PATH && b >= 1);
  if (k === 'core' || k === 'limits' || k === 'livedb') return s > S_PATH || (s === S_PATH && b >= 2);
  if (k === 'liveapi') return s > S_PATH || (s === S_PATH && b >= 3);
  if (k === 'knotify') return s >= S_RT;
  if (k === 'hub') return s > S_RT || (s === S_RT && b >= 1);
  return s > S_RT || (s === S_RT && b >= 2); // obs
}

export interface Live { path: number; one: number; lim: number; rt: number; boot: number; cut: boolean }

const stepAt = (steps: Step[], i: number): Step => (i < 0 ? BASE : steps[Math.min(i, steps.length - 1)]);

const FOCUS: Record<number, Set<NodeKey>> = {
  [S_PATH]: new Set<NodeKey>(['web', 'api', 'kvalid', 'core', 'limits', 'livedb', 'liveapi']),
  [S_ONE]: new Set<NodeKey>(['api', 'kvalid', 'core', 'livedb', 'liveapi']),
  [S_LIM]: new Set<NodeKey>(['core', 'limits']),
  [S_RT]: new Set<NodeKey>(['web', 'hub', 'knotify', 'obs', 'core', 'api', 'kvalid']),
};

export interface WorldState {
  visible: boolean;
  tone: Partial<Record<NodeKey, Tone>>;
  on: Partial<Record<NodeKey, boolean>>;
  edges: { def: EdgeDef; on: boolean; tone: Tone | 'dimline'; stream: boolean }[];
  step: Step;
  active: SeqKey | null;
}

export function deriveWorld(s: number, b: number, live: Live): WorldState {
  const active: SeqKey | null = s === S_PATH ? 'path' : s === S_ONE ? 'one' : s === S_LIM ? 'lim' : s === S_RT ? 'rt' : null;
  const idx = active ? live[active] : -1;
  const step = stepAt(active ? SEQ[active].steps : [], idx);
  const focus = FOCUS[s] ?? new Set<NodeKey>();
  const on: WorldState['on'] = {};
  const tone: WorldState['tone'] = {};
  for (const k of NODE_KEYS) {
    on[k] = nodeOn(k, s, b);
    let t: Tone = focus.has(k) ? 'normal' : s === S_LIM || s === S_ONE ? 'ghost' : 'dim';
    if (s === S_RT && !['web', 'hub', 'knotify', 'obs', 'core'].includes(k)) t = 'dim';
    if (step.hot.includes(k)) t = 'hot';
    if (s === S_RT && step.seen.includes(k) && !step.hot.includes(k)) t = 'ok';
    if (step.toks.some((x) => x.at === k && x.tone === 'ok') && k === 'livedb') t = 'ok';
    if (s === S_LIM && b === 2 && k === 'limits' && idx >= 3) t = 'fault';
    if (s === S_ONE && k === 'core' && step.lock) t = 'hot';
    tone[k] = t;
  }
  const edges = EDGES.map((def) => {
    const vis = !!on[def.from] && !!on[def.to];
    const inFocus = s === S_RT ? true : PATH_EDGES.has(def.id) && focus.has(def.from) && focus.has(def.to);
    let t: Tone | 'dimline' = inFocus ? 'normal' : 'dimline';
    if (s === S_RT && PATH_EDGES.has(def.id)) t = 'dimline';
    if (step.edges.includes(def.id) || step.stream.includes(def.id)) t = 'hot';
    if (s === S_LIM && b === 2 && idx >= 3 && def.id === 'e6') t = 'fault';
    if (s === S_ONE && def.id !== 'e2' && !focus.has(def.from) && !focus.has(def.to)) t = 'dimline';
    if ((s === S_LIM || s === S_ONE) && !(focus.has(def.from) && focus.has(def.to))) t = 'dimline';
    return { def, on: vis && !(s === S_LIM && !(focus.has(def.from) && focus.has(def.to))), tone: t, stream: step.stream.includes(def.id) };
  });
  return { visible: worldVisible(s), tone, on, edges, step, active };
}
