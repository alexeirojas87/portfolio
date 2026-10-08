import { rectExit, type Rect } from 'beatdeck';

/**
 * The architecture "world": ONE coordinate space shared by the lifecycle, gateway and tools scenes.
 * The camera (see `camFor`) pans and zooms over it, so nothing is redrawn between scenes.
 * Node text comes from the project JSON (ARCH_ID); positions and the choreography below are authored.
 *
 * Scene indices (0-based) used here: 3 lifecycle, 4 Cerberus terminal (world hidden), 5 gateway, 6 tools.
 */
export type Pt = { x: number; y: number };

export const S_LC = 3, S_CERB = 4, S_GW = 5, S_TC = 6;

const R = (x: number, y: number, w = 380, h = 128): Rect => ({ x, y, w, h });

export const RECT = {
  // lifecycle view
  ado: R(40, 620, 400), orchestrator: R(580, 620, 400), runstore: R(580, 400, 400), chat: R(40, 860, 400), portal: R(580, 860, 400),
  defagent: R(1260, 372), qaagent: R(1260, 520), devagent: R(1260, 668), reviewagent: R(1260, 816),
  // AI infrastructure view, to the right of the agent column
  gateway: R(2140, 610, 400, 140), safety: R(2140, 380, 400), audit: R(2140, 880, 400),
  prov0: R(2740, 420, 320, 110), prov1: R(2740, 600, 320, 110), prov2: R(2740, 780, 320, 110),
  // tools, below: an orbit around the MCP server
  caller: R(1290, 1805, 400), mcp: R(1970, 1795, 420, 130),
  indexer: R(2187, 1564), toolado: R(2704, 1719), workspace: R(2612, 1948), vector: R(1858, 2051),
} satisfies Record<string, Rect>;
export type NodeKey = keyof typeof RECT;
export const NODE_KEYS = Object.keys(RECT) as NodeKey[];

/** Which JSON node supplies the text/kind of each world node. */
export const ARCH_ID: Record<NodeKey, string> = {
  ado: 'ado', orchestrator: 'orchestrator', runstore: 'runstore', chat: 'chat', portal: 'portal',
  defagent: 'defagent', qaagent: 'qaagent', devagent: 'devagent', reviewagent: 'reviewagent',
  gateway: 'gateway', safety: 'safety', audit: 'audit',
  prov0: 'provider', prov1: 'provider', prov2: 'provider',
  caller: 'devagent', mcp: 'mcp', indexer: 'indexer', toolado: 'ado', workspace: 'workspace', vector: 'vector',
};

export const centre = (k: NodeKey | 'arc'): Pt => {
  if (k === 'arc') return { x: 1795, y: 802 };
  const r = RECT[k];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};

/** Review → dev rework arc, to the right of the agent column. */
export const ARC_D = 'M1640,880 C1830,880 1830,732 1640,732';
export const ORBIT = { cx: 2180, cy: 1860, rx: 760, ry: 250 };

// ── edges ─────────────────────────────────────────────────────────────────────────────────────────────────────

export interface EdgeDef { id: string; from: NodeKey; to: NodeKey; json?: string; async?: boolean; off?: number; role?: boolean }
export const EDGES: EdgeDef[] = [
  { id: 'e1', from: 'ado', to: 'orchestrator', json: 'e1', async: true, off: -16 },
  { id: 'e20', from: 'ado', to: 'orchestrator', json: 'e20', async: true, off: 16 },
  { id: 'e3', from: 'orchestrator', to: 'runstore', json: 'e3' },
  { id: 'e4', from: 'orchestrator', to: 'defagent', json: 'e4', async: true },
  { id: 'e5', from: 'orchestrator', to: 'qaagent', json: 'e5', async: true },
  { id: 'e6', from: 'orchestrator', to: 'devagent', json: 'e6', async: true },
  { id: 'e7', from: 'orchestrator', to: 'reviewagent', json: 'e7', async: true },
  { id: 'e2', from: 'chat', to: 'orchestrator', json: 'e2' },
  { id: 'e18', from: 'orchestrator', to: 'portal', json: 'e18', async: true, off: -16 },
  { id: 'e19', from: 'portal', to: 'orchestrator', json: 'e19', off: 16 },
  // gateway: e13 is in the JSON (dev agent → gateway); the other roles are drawn the same way (highlights[1], decisions[0])
  { id: 'e13', from: 'devagent', to: 'gateway', json: 'e13', role: true },
  { id: 'r-def', from: 'defagent', to: 'gateway', role: true },
  { id: 'r-qa', from: 'qaagent', to: 'gateway', role: true },
  { id: 'r-rev', from: 'reviewagent', to: 'gateway', role: true },
  { id: 'e14', from: 'gateway', to: 'safety', json: 'e14' },
  { id: 'e15a', from: 'gateway', to: 'prov0', json: 'e15' },
  { id: 'e15b', from: 'gateway', to: 'prov1', json: 'e15' },
  { id: 'e15c', from: 'gateway', to: 'prov2', json: 'e15' },
  { id: 'e16', from: 'gateway', to: 'audit', json: 'e16', async: true },
  // tools
  { id: 'e8', from: 'caller', to: 'mcp', json: 'e8' },
  { id: 'e9', from: 'mcp', to: 'toolado', json: 'e9' },
  { id: 'e10', from: 'mcp', to: 'workspace', json: 'e10' },
  { id: 'e11', from: 'mcp', to: 'vector', json: 'e11' },
  { id: 'e12', from: 'indexer', to: 'mcp', json: 'e12', async: true },
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
  /** Where the glowing packet is (node key, or the rework arc). */
  pkt: NodeKey | 'arc' | null;
  /** Dwell time (ms) on this step before the next one. */
  ms: number;
  gate: '' | 'plan' | 'final';
  ok: boolean;
  ci: '' | 'fail' | 'ok';
  loop: boolean;
  crash: boolean;
  persist: '' | 'persisted' | 'resumed';
  stream: boolean;
  scan: boolean;
  fail: boolean;
  fallback: boolean;
  audit: boolean;
  lit: NodeKey[];
}
type Patch = Partial<Step> & { ms: number };
const BASE: Step = {
  pkt: null, ms: 0, gate: '', ok: false, ci: '', loop: false, crash: false, persist: '', stream: false, scan: false,
  fail: false, fallback: false, audit: false, lit: [],
};
/** Each entry patches the previous step: flags carry over until a step changes them. */
function build(list: Patch[]): Step[] {
  let cur = BASE;
  return list.map((p) => (cur = { ...cur, ...p }));
}

/** Lifecycle: ready signal → definition → QA → plan gate → dev → review/rework → PR + CI fail/fix → final gate → restart. */
export const LC: Step[] = build([
  { pkt: 'ado', ms: 700 }, { pkt: 'orchestrator', ms: 800 }, { pkt: 'runstore', ms: 900, persist: 'persisted' }, { pkt: 'orchestrator', ms: 600, persist: '' },
  // end of beat 0 = 3
  { pkt: 'defagent', ms: 900 }, { pkt: 'orchestrator', ms: 700 }, { pkt: 'qaagent', ms: 900 }, { pkt: 'orchestrator', ms: 600 },
  // 7
  { pkt: 'devagent', ms: 900 }, { pkt: 'orchestrator', ms: 600 }, { pkt: 'portal', ms: 1500, gate: 'plan', ok: false },
  { pkt: 'portal', ms: 800, ok: true }, { pkt: 'orchestrator', ms: 600, gate: '', ok: false }, { pkt: 'devagent', ms: 700 },
  // 13
  { pkt: 'orchestrator', ms: 500 }, { pkt: 'reviewagent', ms: 900 }, { pkt: 'arc', ms: 550, loop: true }, { pkt: 'devagent', ms: 1000 },
  { pkt: 'arc', ms: 550 }, { pkt: 'reviewagent', ms: 800 }, { pkt: 'orchestrator', ms: 500 },
  // 20
  { pkt: 'ado', ms: 900 }, { pkt: 'ado', ms: 1100, ci: 'fail' }, { pkt: 'orchestrator', ms: 600 }, { pkt: 'devagent', ms: 1000 },
  { pkt: 'orchestrator', ms: 500 }, { pkt: 'ado', ms: 800, ci: 'ok' },
  // 26
  { pkt: 'orchestrator', ms: 500 }, { pkt: 'portal', ms: 1500, gate: 'final', ok: false }, { pkt: 'portal', ms: 900, ok: true },
  // 29
  { pkt: 'orchestrator', ms: 900, gate: '', ok: false, crash: true }, { pkt: 'runstore', ms: 1000, crash: false, persist: 'resumed' },
  { pkt: 'orchestrator', ms: 600, persist: '' },
  // 32
]);
export const LC_ENDS = [3, 7, 13, 20, 26, 29, 32];

/** Gateway: streams in → rate limits (self-contained counters) → scan, primary fails, fallback → response scan + audit. */
export const GW: Step[] = build([
  { stream: true, ms: 1600 },
  // 0
  { stream: false, pkt: 'gateway', ms: 500 }, { pkt: 'safety', ms: 900, scan: true }, { pkt: 'gateway', ms: 400, scan: false },
  { pkt: 'prov0', ms: 800 }, { pkt: 'prov0', ms: 900, fail: true }, { pkt: 'gateway', ms: 500 },
  { pkt: 'prov1', ms: 800 }, { pkt: 'prov1', ms: 500, fallback: true },
  // 8
  { pkt: 'gateway', ms: 600 }, { pkt: 'safety', ms: 900, scan: true }, { pkt: 'gateway', ms: 500, scan: false },
  { pkt: 'audit', ms: 900, audit: true }, { pkt: 'devagent', ms: 900 },
  // 13
]);
export const GW_ENDS = [0, 0, 8, 13];

/** Tools: the dev agent calls memory, graph, workspace, then the work-tracking tool, one at a time. */
export const TC: Step[] = build([
  { pkt: 'caller', ms: 600 }, { pkt: 'mcp', ms: 700 },
  { pkt: 'vector', ms: 900, lit: ['vector'] }, { pkt: 'mcp', ms: 500 },
  { pkt: 'indexer', ms: 900, lit: ['vector', 'indexer'] }, { pkt: 'mcp', ms: 500 },
  { pkt: 'workspace', ms: 900, lit: ['vector', 'indexer', 'workspace'] }, { pkt: 'mcp', ms: 500 },
  { pkt: 'toolado', ms: 900, lit: ['vector', 'indexer', 'workspace', 'toolado'] }, { pkt: 'mcp', ms: 500 },
]);
export const TC_ENDS = [-1, -1, 9, 9];

export const SEQ = {
  lc: { scene: S_LC, steps: LC, ends: LC_ENDS },
  gw: { scene: S_GW, steps: GW, ends: GW_ENDS },
  tc: { scene: S_TC, steps: TC, ends: TC_ENDS },
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
/** The map beat (7.1): the whole world (about 3020 x 1810) under a one-line headline, node details faded, three big region labels. */
export const MAP_CAM: Cam = { x: -763, y: -255, s: 0.415 };
/** Top-left world coordinate seen at the stage origin, and zoom. Lifecycle → gateway pans right; tools pans down; the map zooms out. */
export function camFor(s: number, b: number): Cam {
  if (s <= S_LC) return { x: 0, y: 0, s: 1 };
  if (s === S_CERB || s === S_GW) return { x: 1180, y: 0, s: 1 };
  if (s === S_TC) return b === 0 ? MAP_CAM : { x: 1220, y: 1200, s: 1 };
  return { x: 1220, y: 1200, s: 1 };
}
export const worldVisible = (s: number) => s === S_LC || s === S_GW || s === S_TC;

// ── what is on stage, as a pure function of position + live ───────────────────────────────────────────────────

export type Tone = 'hot' | 'normal' | 'dim' | 'fault' | 'ok';

const LC_FIRST: Partial<Record<NodeKey, number>> = {
  ado: 0, orchestrator: 0, runstore: 0, defagent: 1, qaagent: 1, devagent: 2, portal: 2, reviewagent: 3, chat: 5,
};
const LC_NODES = new Set<NodeKey>(Object.keys(LC_FIRST) as NodeKey[]);
const GW_NODES = new Set<NodeKey>(['gateway', 'safety', 'audit', 'prov0', 'prov1', 'prov2']);
const AGENTS = new Set<NodeKey>(['defagent', 'qaagent', 'devagent', 'reviewagent']);

export function nodeOn(k: NodeKey, s: number, b: number): boolean {
  if (LC_NODES.has(k)) return s > S_LC || (s === S_LC && b >= LC_FIRST[k]!);
  if (k === 'gateway') return s >= S_GW;
  if (k === 'safety' || k.startsWith('prov')) return s > S_GW || (s === S_GW && b >= 2);
  if (k === 'audit') return s > S_GW || (s === S_GW && b >= 3);
  return s >= S_TC;
}

export interface Live { lc: number; gw: number; tc: number; ty: number; cs: number; boot: number; cut: boolean }

const stepAt = (steps: Step[], i: number): Step => (i < 0 ? BASE : steps[Math.min(i, steps.length - 1)]);

export interface WorldState {
  visible: boolean;
  tone: Partial<Record<NodeKey, Tone>>;
  on: Partial<Record<NodeKey, boolean>>;
  edges: { def: EdgeDef; on: boolean; tone: Tone | 'dimline' }[];
  pkt: NodeKey | 'arc' | null;
  prevPkt: NodeKey | 'arc' | null;
  step: Step;
  active: SeqKey | null;
  stream: boolean;
  /** True on the zoomed-out map beat: boxes show colour only, regions carry the labels. */
  map: boolean;
}

export function deriveWorld(s: number, b: number, live: Live): WorldState {
  const active: SeqKey | null = s === S_LC ? 'lc' : s === S_GW ? 'gw' : s === S_TC ? 'tc' : null;
  const idx = active ? live[active] : -1;
  const steps = active ? SEQ[active].steps : [];
  const step = stepAt(steps, idx);
  const prev = idx > 0 ? steps[Math.min(idx - 1, steps.length - 1)] : BASE;
  const on: WorldState['on'] = {};
  const tone: WorldState['tone'] = {};
  const lcFocus = s === S_LC;
  const gwFocus = s === S_GW;
  const tcFocus = s === S_TC;
  const mapBeat = tcFocus && b === 0;
  for (const k of NODE_KEYS) {
    on[k] = nodeOn(k, s, b);
    const inFocus = mapBeat
      || (lcFocus && LC_NODES.has(k))
      || (gwFocus && (GW_NODES.has(k) || AGENTS.has(k)))
      || (tcFocus && !LC_NODES.has(k) && !GW_NODES.has(k));
    let t: Tone = inFocus ? 'normal' : 'dim';
    if (step.pkt === k && inFocus && !mapBeat) t = 'hot';
    if (lcFocus) {
      if (k === 'orchestrator' && step.crash) t = 'fault';
      if (k === 'runstore' && step.persist) t = 'hot';
      if (k === 'portal' && step.gate) t = step.ok ? 'ok' : 'hot';
      if (k === 'ado' && step.ci === 'fail') t = 'fault';
      if (k === 'ado' && step.ci === 'ok' && idx === 26) t = 'ok';
    }
    if (gwFocus) {
      if (k === 'gateway' && step.stream) t = 'hot';
      if (k === 'safety' && step.scan) t = 'hot';
      if (k === 'prov0' && step.fail) t = 'fault';
      if (k === 'prov1' && step.fallback) t = 'ok';
      if (k === 'audit' && step.audit) t = 'ok';
      if (AGENTS.has(k) && step.stream) t = 'hot';
      if (b >= 1 && b <= 1 && AGENTS.has(k)) t = 'normal';
    }
    if (tcFocus && !mapBeat) {
      if (k === 'mcp' && b >= 1 && b !== 3) t = step.pkt === 'mcp' ? 'hot' : 'normal';
      if (step.lit.includes(k)) t = step.pkt === k ? 'hot' : 'ok';
      if (b === 3 && k === 'indexer') t = 'hot';
      if (b === 2 && !step.lit.includes(k) && step.pkt !== k && (k === 'indexer' || k === 'vector' || k === 'workspace' || k === 'toolado')) t = 'normal';
    }
    tone[k] = t;
  }

  const hotPair = (e: EdgeDef) =>
    !!prev.pkt && !!step.pkt && prev.pkt !== step.pkt &&
    ((e.from === prev.pkt && e.to === step.pkt) || (e.to === prev.pkt && e.from === step.pkt));
  const edges = EDGES.map((def) => {
    const lcEdge = LC_NODES.has(def.from) && LC_NODES.has(def.to);
    let vis = !!on[def.from] && !!on[def.to];
    if (def.id === 'e20') vis = vis && (s > S_LC || b >= 4);
    if (def.id === 'e2') vis = vis && (s > S_LC || b >= 5);
    const cluster = lcEdge ? 'lc' : GW_NODES.has(def.from) || GW_NODES.has(def.to) || def.role ? 'gw' : 'tc';
    const focus = mapBeat || (cluster === 'lc' && lcFocus) || (cluster === 'gw' && gwFocus) || (cluster === 'tc' && tcFocus);
    let t: Tone | 'dimline' = focus ? 'normal' : 'dimline';
    let hot = hotPair(def);
    if (lcFocus && step.gate && (def.id === 'e18' || (step.ok && def.id === 'e19'))) hot = true;
    if (gwFocus) {
      if (step.stream && def.role) hot = true;
      if (step.scan && def.id === 'e14') hot = true;
      if (step.audit && def.id === 'e16') hot = true;
      if (b === 1 && def.role) hot = false;
    }
    if (tcFocus && b === 3 && def.id === 'e12') hot = true;
    if (hot) t = 'hot';
    if (gwFocus && step.fail && def.id === 'e15a') t = 'fault';
    return { def, on: vis, tone: t };
  });

  return {
    visible: worldVisible(s), tone, on, edges,
    pkt: step.pkt, prevPkt: prev.pkt, step, active,
    stream: gwFocus && step.stream,
    map: mapBeat,
  };
}
