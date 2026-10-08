import { rectExit, type Rect } from 'beatdeck';

/**
 * The architecture "world" of Apagones Habana: ONE coordinate space shared by the pipeline, assistant and operations
 * scenes, laid out as four districts the camera travels between:
 *
 *      (0, 0) pipeline        (2100, 0) watchdog
 *      (0, 1250) assistant    (2100, 1250) digest + verification
 *
 * Node text comes from the project JSON (ARCH_ID); positions and the choreography are authored.
 * Scene indices (0-based): 2 pipeline, 3 map (world hidden), 4 assistant, 5 operations.
 */
export type Pt = { x: number; y: number };

export const S_PL = 2, S_MAP = 3, S_AS = 4, S_OP = 5;

const R = (x: number, y: number, w = 400, h = 140): Rect => ({ x, y, w, h });
const A = 430, B = 620, C = 810; // pipeline rows
const OY = 1250; // second row of districts

export const RECT = {
  // pipeline district
  cron: R(40, A), gha: R(520, A), ingest: R(1000, A), tg: R(1480, A),
  extract: R(520, B), db: R(1000, B), enrich: R(1480, B),
  web: R(40, C), pages: R(520, C), build: R(1000, C), llm: R(1480, C),
  // watchdog district
  wPages: R(2160, 570), wCron: R(2790, 570), wGha: R(3420, 570), wGh: R(2790, 830),
  // assistant district (right half; the chat panel sits on the left, in the scene layer)
  users: R(1100, OY + 400, 320), bot: R(1500, OY + 400, 380), aDb: R(1100, OY + 730, 380), aLlm: R(1540, OY + 730, 340),
  // operations district
  oGha: R(2140, OY + 600), digest: R(2680, OY + 420), mail: R(3300, OY + 420),
  verify: R(2680, OY + 650), oPages: R(3300, OY + 650), oGh: R(3300, OY + 850),
} satisfies Record<string, Rect>;
export type NodeKey = keyof typeof RECT;
export const NODE_KEYS = Object.keys(RECT) as NodeKey[];

/** Which JSON node supplies the text/kind of each world node. */
export const ARCH_ID: Record<NodeKey, string> = {
  cron: 'cron', gha: 'gha', ingest: 'ingest', tg: 'tg', extract: 'extract', db: 'db', enrich: 'enrich',
  web: 'web', pages: 'pages', build: 'build', llm: 'llm',
  wPages: 'pages', wCron: 'cron', wGha: 'gha', wGh: 'gh',
  users: 'users', bot: 'bot', aDb: 'db', aLlm: 'llm',
  oGha: 'gha', digest: 'digest', mail: 'mail', verify: 'verify', oPages: 'pages', oGh: 'gh',
};

export const centre = (k: NodeKey): Pt => {
  const r = RECT[k];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};

// ── edges ─────────────────────────────────────────────────────────────────────────────────────────────────────

export interface EdgeDef { id: string; from: NodeKey; to: NodeKey; json?: string; async?: boolean; off?: number }
export const EDGES: EdgeDef[] = [
  // pipeline
  { id: 'e1', from: 'cron', to: 'gha', json: 'e1', async: true },
  { id: 'e2', from: 'gha', to: 'ingest', json: 'e2' },
  { id: 'e3', from: 'tg', to: 'ingest', json: 'e3' },
  { id: 'e4', from: 'ingest', to: 'db', json: 'e4' },
  { id: 'e5', from: 'db', to: 'extract', json: 'e5', off: 16 },
  { id: 'e6', from: 'extract', to: 'db', json: 'e6', off: 16 },
  { id: 'e7', from: 'db', to: 'enrich', json: 'e7', off: 16 },
  { id: 'e22', from: 'enrich', to: 'db', json: 'e22', off: 16 },
  { id: 'e21', from: 'tg', to: 'enrich', json: 'e21' },
  { id: 'e8', from: 'enrich', to: 'llm', json: 'e8' },
  { id: 'e9', from: 'db', to: 'build', json: 'e9' },
  { id: 'e10', from: 'build', to: 'pages', json: 'e10' },
  { id: 'e11', from: 'pages', to: 'web', json: 'e11' },
  // watchdog
  { id: 'w-age', from: 'wCron', to: 'wPages', json: 'e18' },
  { id: 'w-cancel', from: 'wCron', to: 'wGha', json: 'e19', async: true, off: 18 },
  { id: 'w-disp', from: 'wCron', to: 'wGha', json: 'e1', async: true, off: -18 },
  { id: 'w-gh', from: 'wCron', to: 'wGh', json: 'e23' },
  // assistant
  { id: 'a-ask', from: 'users', to: 'bot', json: 'e24', off: -16 },
  { id: 'a-reply', from: 'bot', to: 'users', json: 'e25', off: -16 },
  { id: 'a-rpc', from: 'bot', to: 'aDb', json: 'e16' },
  { id: 'a-llm', from: 'bot', to: 'aLlm', json: 'e15' },
  // operations
  { id: 'o-dig', from: 'oGha', to: 'digest', json: 'e28', async: true },
  { id: 'o-mail', from: 'digest', to: 'mail', json: 'e29' },
  { id: 'o-ver', from: 'oGha', to: 'verify', json: 'e30', async: true },
  { id: 'o-fetch', from: 'verify', to: 'oPages', json: 'e31' },
  { id: 'o-issue', from: 'verify', to: 'oGh', json: 'e32' },
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

// ── choreography: one table per automatic sequence ─────────────────────────────────────────────────────────────

export interface Step {
  /** Where the glowing packet is. */
  pkt: NodeKey | null;
  /** Dwell time (ms) on this step before the next one. */
  ms: number;
  tick: boolean;
  tests: '' | 'run' | 'ok';
  ups: boolean;
  ev: boolean;
  voice: '' | 'voice' | 'parts' | 'embed';
  deploy: boolean;
  /** Age (minutes) of the published data, as the watchdog sees it. */
  age: number;
  stale: boolean;
  zombie: boolean;
  cancelled: boolean;
  dispatch: boolean;
  alert: boolean;
  sent: boolean;
  purged: boolean;
  issue: boolean;
  search: boolean;
  frag: boolean;
  answered: boolean;
}
type Patch = Partial<Step> & { ms: number };
const BASE: Step = {
  pkt: null, ms: 0, tick: false, tests: '', ups: false, ev: false, voice: '', deploy: false, age: 12, stale: false, zombie: false,
  cancelled: false, dispatch: false, alert: false, sent: false, purged: false, issue: false, search: false, frag: false, answered: false,
};
/** Each entry patches the previous step: flags carry over until a step changes them. */
function build(list: Patch[]): Step[] {
  let cur = BASE;
  return list.map((p) => (cur = { ...cur, ...p }));
}

/** Pipeline: clock + tests → pull → rules → LLM (voice, parts, embeddings) → build → deploy. */
export const PL: Step[] = build([
  { pkt: 'cron', ms: 800, tick: true }, { pkt: 'gha', ms: 900, tests: 'run' }, { pkt: 'gha', ms: 1000, tests: 'ok' },
  // 2
  { pkt: 'tg', ms: 700, tick: false, tests: '' }, { pkt: 'ingest', ms: 800 }, { pkt: 'db', ms: 1100, ups: true },
  // 5
  { pkt: 'extract', ms: 1000, ups: false, ev: true }, { pkt: 'db', ms: 1000 },
  // 7
  { pkt: 'tg', ms: 600, ev: false }, { pkt: 'enrich', ms: 700 }, { pkt: 'llm', ms: 1000, voice: 'voice' }, { pkt: 'enrich', ms: 500 },
  { pkt: 'llm', ms: 1000, voice: 'parts' }, { pkt: 'enrich', ms: 500 }, { pkt: 'llm', ms: 1000, voice: 'embed' }, { pkt: 'enrich', ms: 500 },
  { pkt: 'db', ms: 900 },
  // 16
  { pkt: 'build', ms: 800, voice: '' }, { pkt: 'pages', ms: 1000, deploy: true }, { pkt: 'web', ms: 1200, deploy: false },
  // 19
]);
export const PL_ENDS = [2, 5, 7, 16, 19];

/** Operations: watchdog freshness → zombies → alarm (cam 1), then the weekly digest and the daily verification (cam 2). */
export const OP: Step[] = build([
  { pkt: 'wCron', ms: 700, tick: true, age: 12 }, { pkt: 'wPages', ms: 1200 },
  // 1
  { pkt: 'wPages', ms: 1100, age: 52, stale: true }, { pkt: 'wCron', ms: 600 }, { pkt: 'wGha', ms: 1200, zombie: true },
  { pkt: 'wGha', ms: 1000, zombie: false, cancelled: true }, { pkt: 'wCron', ms: 500, cancelled: false },
  { pkt: 'wGha', ms: 1100, dispatch: true }, { pkt: 'wPages', ms: 1000, dispatch: false, age: 6, stale: false },
  // 8
  { pkt: 'wPages', ms: 1000, age: 132, stale: true }, { pkt: 'wCron', ms: 600 }, { pkt: 'wGh', ms: 1400, alert: true },
  // 11
  { pkt: 'oGha', ms: 800, alert: false, stale: false, age: 6 }, { pkt: 'digest', ms: 1100 }, { pkt: 'mail', ms: 1400, sent: true },
  // 14
  { pkt: 'oGha', ms: 600, sent: false }, { pkt: 'verify', ms: 1000 }, { pkt: 'oPages', ms: 900 },
  { pkt: 'verify', ms: 800, purged: true }, { pkt: 'oGh', ms: 1400, issue: true },
  // 19
]);
export const OP_ENDS = [1, 8, 11, 14, 19];

/** Assistant: the question reaches the bot, vector search, the LLM composes, the answer returns. */
export const AS: Step[] = build([
  { pkt: 'users', ms: 600 }, { pkt: 'bot', ms: 1000 },
  // 1
  { pkt: 'aDb', ms: 1200, search: true }, { pkt: 'bot', ms: 800, search: false, frag: true },
  // 3
  { pkt: 'aLlm', ms: 1000 }, { pkt: 'bot', ms: 700 }, { pkt: 'users', ms: 1000, answered: true },
  // 6
]);
export const AS_ENDS = [1, 3, 6, 6];

export const SEQ = {
  pl: { scene: S_PL, steps: PL, ends: PL_ENDS },
  as: { scene: S_AS, steps: AS, ends: AS_ENDS },
  op: { scene: S_OP, steps: OP, ends: OP_ENDS },
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

// ── the map's own sequence (scene 3, world hidden) ─────────────────────────────────────────────────────────────

export type ZoneState = 'n' | 'p' | 'x' | 'u';
/** [zone, state, dwell ms]: zones light up one by one, then go dark / unknown, then come back. ILLUSTRATIVE. */
export const MAP_OPS: [number, ZoneState, number][] = [
  [0, 'p', 380], [5, 'p', 380], [1, 'p', 380], [6, 'p', 380], [2, 'p', 380], [7, 'p', 380], [3, 'p', 380], [8, 'p', 380], [4, 'p', 380], [9, 'p', 520],
  // 10: all lit
  [2, 'x', 800], [6, 'x', 700], [7, 'x', 700], [3, 'u', 800], [9, 'x', 900],
  // 15: outages
  [6, 'p', 1000], [2, 'p', 1000], [9, 'p', 1000],
  // 18: restored
];
export const MAP_ENDS = [10, 15, 18, 18];
export const mapValue = (s: number, b: number, atStart: boolean): number => {
  if (s < S_MAP) return 0;
  if (s > S_MAP) return MAP_ENDS[MAP_ENDS.length - 1];
  const start = b === 0 ? 0 : MAP_ENDS[b - 1];
  return atStart ? start : MAP_ENDS[b];
};
export function zonesAt(idx: number): ZoneState[] {
  const z: ZoneState[] = Array(10).fill('n');
  for (let i = 0; i < idx; i++) z[MAP_OPS[i][0]] = MAP_OPS[i][1];
  return z;
}

// ── camera ────────────────────────────────────────────────────────────────────────────────────────────────────

export interface Cam { x: number; y: number; s: number }
/** Top-left world coordinate seen at the stage origin, and zoom. */
export function camFor(s: number, b: number): Cam {
  if (s <= S_PL) return { x: 0, y: 0, s: 1 };
  if (s === S_AS || s === S_MAP) return { x: 0, y: OY, s: 1 };
  if (s === S_OP) return b <= 2 ? { x: 2100, y: 0, s: 1 } : { x: 2100, y: OY, s: 1 };
  return { x: 2100, y: OY, s: 1 };
}
export const worldVisible = (s: number) => s === S_PL || s === S_AS || s === S_OP;

// ── what is on stage, as a pure function of position + live ───────────────────────────────────────────────────

export type Tone = 'hot' | 'normal' | 'dim' | 'fault' | 'ok';

const PL_NODES = new Set<NodeKey>(['cron', 'gha', 'ingest', 'tg', 'extract', 'db', 'enrich', 'web', 'pages', 'build', 'llm']);
const WD_NODES = new Set<NodeKey>(['wPages', 'wCron', 'wGha', 'wGh']);
const AS_NODES = new Set<NodeKey>(['users', 'bot', 'aDb', 'aLlm']);
const OPS_NODES = new Set<NodeKey>(['oGha', 'digest', 'mail', 'verify', 'oPages', 'oGh']);

const PL_FIRST: Partial<Record<NodeKey, number>> = {
  cron: 0, gha: 0, tg: 1, ingest: 1, db: 1, extract: 2, enrich: 3, llm: 3, build: 4, pages: 4, web: 4,
};
const AS_FIRST: Partial<Record<NodeKey, number>> = { users: 0, bot: 0, aDb: 1, aLlm: 2 };

export function nodeOn(k: NodeKey, s: number, b: number): boolean {
  if (PL_NODES.has(k)) return s > S_PL || (s === S_PL && b >= PL_FIRST[k]!);
  if (AS_NODES.has(k)) return s > S_AS || (s === S_AS && b >= AS_FIRST[k]!);
  if (WD_NODES.has(k)) return s > S_OP || (s === S_OP && (k === 'wGh' ? b >= 2 : true));
  if (OPS_NODES.has(k)) return s > S_OP || (s === S_OP && b >= 2);
  return false;
}

export interface Live { pl: number; as: number; op: number; mz: number; qs: number; ans: number; boot: number; cut: boolean }

const stepAt = (steps: Step[], i: number): Step => (i < 0 ? BASE : steps[Math.min(i, steps.length - 1)]);

export interface WorldState {
  visible: boolean;
  tone: Partial<Record<NodeKey, Tone>>;
  on: Partial<Record<NodeKey, boolean>>;
  edges: { def: EdgeDef; on: boolean; tone: Tone | 'dimline' }[];
  pkt: NodeKey | null;
  step: Step;
  idx: number;
  active: SeqKey | null;
}

export function deriveWorld(s: number, b: number, live: Live): WorldState {
  const active: SeqKey | null = s === S_PL ? 'pl' : s === S_AS ? 'as' : s === S_OP ? 'op' : null;
  const idx = active ? live[active] : -1;
  const steps = active ? SEQ[active].steps : [];
  const step = stepAt(steps, idx);
  const prev = idx > 0 ? steps[Math.min(idx - 1, steps.length - 1)] : BASE;
  const on: WorldState['on'] = {};
  const tone: WorldState['tone'] = {};
  const inFocus = (k: NodeKey) =>
    (s === S_PL && PL_NODES.has(k)) || (s === S_AS && AS_NODES.has(k)) ||
    (s === S_OP && (b <= 2 ? WD_NODES.has(k) : OPS_NODES.has(k)));

  for (const k of NODE_KEYS) {
    on[k] = nodeOn(k, s, b);
    let t: Tone = inFocus(k) ? 'normal' : 'dim';
    if (step.pkt === k && inFocus(k)) t = 'hot';
    if (s === S_PL) {
      if (k === 'gha' && step.tests === 'ok' && step.pkt === 'gha') t = 'ok';
      if (k === 'db' && step.ups) t = 'hot';
      if (k === 'llm' && step.voice && step.pkt === 'llm') t = 'hot';
      if (k === 'pages' && step.deploy) t = 'ok';
      if (k === 'web' && step.pkt === 'web') t = 'ok';
    }
    if (s === S_AS) {
      if (k === 'aDb' && step.search) t = 'hot';
      if (k === 'users' && step.answered) t = 'ok';
    }
    if (s === S_OP) {
      if (k === 'wPages' && step.stale) t = 'fault';
      if (k === 'wGha' && step.zombie) t = 'fault';
      if (k === 'wGha' && step.dispatch) t = 'ok';
      if (k === 'wGh' && step.alert) t = 'hot';
      if (k === 'mail' && step.sent) t = 'ok';
      if (k === 'oGh' && step.issue) t = 'ok';
      if (k === 'verify' && step.purged) t = 'hot';
    }
    tone[k] = t;
  }

  // the wire the packet just travelled: the edge in its own direction, else the reverse
  const forward = EDGES.filter((e) => !!prev.pkt && !!step.pkt && prev.pkt !== step.pkt && e.from === prev.pkt && e.to === step.pkt);
  const travelled = new Set((forward.length ? forward : EDGES.filter((e) => !!prev.pkt && !!step.pkt && prev.pkt !== step.pkt && e.to === prev.pkt && e.from === step.pkt)).map((e) => e.id));
  const edges = EDGES.map((def) => {
    const vis = !!on[def.from] && !!on[def.to];
    const cluster = PL_NODES.has(def.from) ? 'pl' : AS_NODES.has(def.from) ? 'as' : WD_NODES.has(def.from) ? 'wd' : 'ops';
    const focus = (cluster === 'pl' && s === S_PL) || (cluster === 'as' && s === S_AS) || (cluster === 'wd' && s === S_OP && b <= 2) || (cluster === 'ops' && s === S_OP && b >= 3);
    let t: Tone | 'dimline' = focus ? 'normal' : 'dimline';
    let hot = travelled.has(def.id);
    if (def.id === 'w-cancel' && step.dispatch) hot = false;
    if (def.id === 'w-disp' && !step.dispatch) hot = false;
    if (hot) t = 'hot';
    if (def.id === 'w-cancel' && hot) t = 'fault';
    return { def, on: vis, tone: t };
  });

  return { visible: worldVisible(s), tone, on, edges, pkt: step.pkt, step, idx, active };
}
