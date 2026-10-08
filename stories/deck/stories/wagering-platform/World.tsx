import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { EASE, flags, layerFade, reducedMotion, usePos } from 'beatdeck';
import { tr } from '../../shared/lang';
import { arch, copy } from './copy';
import { useLive } from './live';
import {
  ARCH_ID, EDGES, LANE, NODE_KEYS, RECT, SLOT, S_LIM, S_ONE, S_PATH, S_RT, camFor, centre, deriveWorld, edgePts,
  type BadgeKey, type Cam, type NodeKey, type Pt, type Tok, type Tone, type WorldState,
} from './archWorld';

/** Current camera, shared with the particle canvas (it draws through the same transform). */
export const cam = { x: 0, y: 0, s: 1 };

const KIND_VAR: Record<string, string> = {
  service: 'var(--k-compute)', gateway: 'var(--k-compute)', worker: 'var(--k-compute)', scheduler: 'var(--k-compute)',
  db: 'var(--k-data)', cache: 'var(--k-data)', storage: 'var(--k-data)',
  queue: 'var(--k-queue)', ai: 'var(--k-ai)', client: 'var(--k-client)', external: 'var(--k-external)',
};
const kindColor = (k: NodeKey) => KIND_VAR[arch.node(ARCH_ID[k]).kind] ?? 'var(--ink-2)';

function applyCam(el: HTMLElement) {
  el.style.transform = `scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`;
}

/** The camera pans over the world between beats. Animated with GSAP (verify can wait for it); snapped on load, capture and reduced motion. */
function useCamera(ref: React.RefObject<HTMLDivElement | null>) {
  const { s, b, dir } = usePos();
  const target = camFor(s, b);
  const key = `${target.x},${target.y},${target.s}`;
  useLayoutEffect(() => {
    const el = ref.current!;
    if (flags.capture || dir === 'load' || reducedMotion.get()) {
      Object.assign(cam, target);
      applyCam(el);
      return;
    }
    const tw = gsap.to(cam, { ...target, duration: 1.5, ease: 'power3.inOut', onUpdate: () => applyCam(el) });
    return () => { tw.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

function WNode({ k, w, view }: { k: NodeKey; w: WorldState; view: Cam }) {
  const r = RECT[k];
  // a box only shows while it sits fully inside the camera window (its text would otherwise be cut by the stage edge)
  const vis = r.x >= view.x - 1 && r.x + r.w <= view.x + 1920 / view.s + 1 && r.y >= view.y - 1 && r.y + r.h <= view.y + 1080 / view.s + 1;
  const n = arch.node(ARCH_ID[k]);
  const tone = w.tone[k] ?? 'normal';
  const on = !!w.on[k];
  const color = tone === 'fault' ? 'var(--fault)' : tone === 'ok' ? 'var(--ok)' : kindColor(k);
  const ghost = tone === 'ghost';
  const dim = tone === 'dim' || ghost;
  const hot = tone === 'hot' || tone === 'ok' || tone === 'fault';
  return (
    <div
      style={{
        position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: 'border-box', padding: '0 24px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 6,
        border: `${hot ? 4 : 2}px solid ${dim ? 'var(--ink-3)' : color}`,
        background: hot ? 'var(--surface)' : 'var(--bg)',
        boxShadow: dim ? 'none' : hot ? `0 0 60px -4px ${color}, inset 0 0 34px -10px ${color}` : `0 0 26px -8px ${color}`,
        opacity: on ? (ghost ? 0.12 : dim ? 0.62 : 1) : 0, transform: `scale(${on ? 1 : 0.94})`, visibility: vis ? 'visible' : 'hidden',
        transition: `visibility 0s ${vis ? 0 : 1700}ms, opacity 600ms ${EASE}, transform 800ms ${EASE}, border-color 350ms, box-shadow 450ms, background 350ms`,
      }}
    >
      {n.tech && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color: dim ? 'var(--ink-3)' : color, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden' }}>{n.tech}</div>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600, lineHeight: 1.1, color: dim ? 'var(--ink-3)' : 'var(--ink)' }}>{tr(n.label)}</div>
    </div>
  );
}

function Ring({ r, on, color }: { r: { x: number; y: number; w: number; h: number }; on: boolean; color: string }) {
  return (
    <div
      className={on ? 'pulse' : undefined}
      style={{ position: 'absolute', left: r.x - 14, top: r.y - 14, width: r.w + 28, height: r.h + 28, borderRadius: 14, border: `3px solid ${color}`, opacity: on ? 1 : 0, transition: 'opacity 300ms', pointerEvents: 'none' }}
    />
  );
}

function Badge({ x, y, on, color, children }: { x: number; y: number; on: boolean; color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color, whiteSpace: 'nowrap',
        opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 10}px)`, transition: `opacity 350ms ${EASE}, transform 450ms ${EASE}`,
      }}
    >
      {children}
    </div>
  );
}

const EDGE_COLOR: Record<Tone | 'dimline', string> = {
  hot: 'var(--accent-text)', ok: 'var(--ok)', fault: 'var(--fault)', normal: 'var(--ink-2)', dim: 'var(--ink-3)', ghost: 'var(--ink-3)', dimline: 'var(--ink-3)',
};

function Edges({ w }: { w: WorldState }) {
  return (
    <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {w.edges.map(({ def, on, tone }) => {
        const [a, z] = edgePts(def);
        const color = EDGE_COLOR[tone];
        const hot = tone === 'hot' || tone === 'fault' || tone === 'ok';
        const len = Math.hypot(z.x - a.x, z.y - a.y) || 1;
        const ux = (z.x - a.x) / len, uy = (z.y - a.y) / len;
        const hl = 20, hw = 9;
        const bx = z.x - ux * hl, by = z.y - uy * hl;
        const head = `${z.x},${z.y} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`;
        return (
          <g key={def.id} style={{ opacity: on ? (tone === 'dimline' ? 0.5 : 1) : 0, transition: 'opacity 500ms', filter: hot ? `drop-shadow(0 0 7px ${color})` : 'none' }}>
            <path
              d={`M${a.x} ${a.y} L${bx} ${by}`} fill="none" stroke={color} strokeWidth={hot ? 4 : 2.5}
              pathLength={def.async ? undefined : 1}
              strokeDasharray={def.async ? '16 10' : 1}
              strokeDashoffset={def.async || on ? 0 : 1}
              style={{ transition: `stroke 350ms, stroke-width 350ms, stroke-dashoffset 800ms ${EASE}` }}
            />
            <polygon points={head} fill={color} style={{ transition: 'fill 350ms' }} />
          </g>
        );
      })}
    </svg>
  );
}

/** Where a token sits: on a node it rides the top-right edge (never over the label); a slot is a fixed point. */
function tokPos(t: Tok, i: number): Pt {
  if (t.at in SLOT) return SLOT[t.at as keyof typeof SLOT];
  const r = RECT[t.at as NodeKey];
  return { x: r.x + r.w - 52 - i * 76, y: r.y - 6 };
}

const TOK_COLOR = { ok: 'var(--ok)', fault: 'var(--fault)', def: 'var(--accent-text)' };

/** Glowing tokens (bets, states, traces) that glide between positions. Hidden ones keep their last position and fade. */
function Tokens({ w }: { w: WorldState }) {
  const last = useRef<Partial<Record<string, Pt>>>({});
  const was = useRef<Partial<Record<string, boolean>>>({});
  const ids = ['a', 'b', 'd'] as const;
  const idxAt = (t: Tok) => w.step.toks.filter((x) => x.at === t.at).findIndex((x) => x.id === t.id);
  return (
    <>
      {ids.map((id) => {
        const t = w.step.toks.find((x) => x.id === id);
        if (t) last.current[id] = tokPos(t, idxAt(t));
        // a token that was not on stage jumps to its place (no glide from wherever it last was)
        const jump = !!t && !was.current[id];
        was.current[id] = !!t;
        const p = last.current[id] ?? { x: 0, y: 0 };
        const color = t?.tone ? TOK_COLOR[t.tone] : TOK_COLOR.def;
        return (
          <div
            key={id}
            style={{
              position: 'absolute', left: 0, top: 0, width: 64, height: 64, boxSizing: 'border-box', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: `${t?.dup ? 3 : 4}px ${t?.dup ? 'dashed' : 'solid'} ${color}`,
              boxShadow: `0 0 30px 6px ${color}`, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700,
              opacity: t ? 1 : 0, transform: `translate(${p.x - 32}px, ${p.y - 32}px)`,
              transition: `${jump ? 'transform 0s' : 'transform 780ms cubic-bezier(.45,0,.2,1)'}, opacity 300ms, border-color 300ms, box-shadow 300ms`,
            }}
          >
            {t ? (t.label in copy.tok ? tr(copy.tok[t.label as keyof typeof copy.tok]) : t.label) : ''}
          </div>
        );
      })}
    </>
  );
}

/** Badge text positions: key -> where it hangs, and its colour. */
function badgeSpec(k: BadgeKey): { x: number; y: number; color: string; icon?: string } {
  const above = (n: NodeKey, dy = 50) => ({ x: RECT[n].x, y: RECT[n].y - dy });
  switch (k) {
    case 'received': return { ...above('api'), color: 'var(--ok)', icon: '✓ ' };
    case 'keyed': return { ...above('kvalid'), color: 'var(--accent-text)' };
    case 'validates': return { x: RECT.core.x, y: RECT.core.y - 50, color: 'var(--accent-text)' };
    case 'handoff': return { ...above('liveapi'), color: 'var(--accent-text)' };
    case 'inserted': return { x: RECT.livedb.x + RECT.livedb.w + 20, y: RECT.livedb.y + 40, color: 'var(--ok)', icon: '✓ ' };
    case 'sameKey': return { x: LANE.x - 20, y: LANE.y - 92, color: 'var(--accent-text)' };
    case 'locked': return { x: RECT.core.x, y: RECT.core.y - 50, color: 'var(--warning)' };
    case 'waits': return { x: LANE.x + LANE.w + 20, y: LANE.y + 18, color: 'var(--warning)' };
    case 'fresh': return { x: RECT.core.x, y: RECT.core.y + RECT.core.h + 18, color: 'var(--ok)' };
    case 'retry': return { x: RECT.core.x, y: RECT.core.y - 50, color: 'var(--ink-2)' };
    case 'absorbed': return { x: RECT.liveapi.x, y: RECT.liveapi.y - 50, color: 'var(--ok)', icon: '↩ ' };
    case 'violation': return { x: RECT.limits.x, y: RECT.limits.y - 50, color: 'var(--fault)', icon: '✕ ' };
    case 'rejected': return { x: RECT.core.x, y: RECT.core.y - 50, color: 'var(--fault)', icon: '✕ ' };
    case 'pushed': return { x: RECT.web.x, y: RECT.web.y - 50, color: 'var(--ok)', icon: '✓ ' };
    case 'otlp': return { x: RECT.obs.x, y: RECT.obs.y - 50, color: 'var(--accent-text)' };
  }
}
const ALL_BADGES: BadgeKey[] = ['received', 'keyed', 'validates', 'handoff', 'inserted', 'sameKey', 'locked', 'waits', 'fresh', 'retry', 'absorbed', 'violation', 'rejected', 'pushed', 'otlp'];

const chipStyle = (on: boolean, lit: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap', padding: '6px 18px', borderRadius: 6,
  border: `2px solid ${lit ? 'var(--ok)' : 'var(--hair-strong)'}`, color: lit ? 'var(--ok)' : 'var(--ink-2)',
  background: lit ? 'rgba(25,179,155,0.12)' : 'transparent', boxShadow: lit ? '0 0 24px -6px var(--ok)' : 'none',
  opacity: on ? 1 : 0, transition: `opacity 400ms ${EASE}, border-color 300ms, color 300ms, background 300ms`,
});

/** Everything that is not a box or a wire: lane, badges, lock ring, check chips, notification states. */
function Extras({ w, s, b }: { w: WorldState; s: number; b: number }) {
  const st = w.step;
  const path = s === S_PATH, one = s === S_ONE, rt = s === S_RT;
  const checks = tr(copy.checks);
  return (
    <>
      {/* the player's partition lane, a close-up of the topic */}
      <div style={{ opacity: one ? 1 : 0, transition: 'opacity 600ms' }}>
        <div style={{ position: 'absolute', left: LANE.x, top: LANE.y, width: LANE.w, height: LANE.h, borderRadius: 36, border: '3px solid var(--k-queue)', boxShadow: '0 0 30px -8px var(--k-queue)', background: 'rgba(8,16,30,0.6)' }} />
        <div className="t-meta" style={{ position: 'absolute', left: LANE.x, top: LANE.y - 46, fontSize: 30, color: 'var(--k-queue)', whiteSpace: 'nowrap' }}>{tr(copy.lane)}</div>
      </div>

      {/* validation checks, ticked one by one */}
      <div style={{ position: 'absolute', left: 1080, top: 520, display: 'flex', gap: 16 }}>
        {checks.map((c, i) => (
          <div key={c} style={chipStyle(path && b >= 2, path && st.checks > i)}>{st.checks > i && path ? '✓ ' : ''}{c}</div>
        ))}
      </div>

      {/* the six wager states, lit as they are published */}
      <div style={{ position: 'absolute', left: 640, top: 430, width: 1120, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {tr(copy.states).map((c, i) => (
          <div key={c} style={chipStyle(rt && b >= 0, rt && st.states > i && b === 0)}>{c}</div>
        ))}
      </div>

      <Ring r={RECT.core} on={one && st.lock} color="var(--warning)" />
      {ALL_BADGES.map((k) => {
        const sp = badgeSpec(k);
        const on = st.badges.includes(k) && s >= S_PATH;
        return <Badge key={k} x={sp.x} y={sp.y} on={on} color={sp.color}>{sp.icon ?? ''}{tr(copy.badge[k])}</Badge>;
      })}
    </>
  );
}

/** One persistent world: boxes, wires, tokens. The camera does the cinematography. */
export function World() {
  const { s, b } = usePos();
  const live = useLive((st) => st.live);
  const ref = useRef<HTMLDivElement>(null);
  useCamera(ref);
  const w = deriveWorld(s, b, live);
  return (
    <div className="layer" style={{ opacity: w.visible ? 1 : 0, transition: layerFade(w.visible) }}>
      <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0' }}>
        <Edges w={w} />
        {NODE_KEYS.map((k) => <WNode key={k} k={k} w={w} view={camFor(s, b)} />)}
        <Extras w={w} s={s} b={b} />
        <Tokens w={w} />
      </div>
    </div>
  );
}

export { EDGES, centre, S_LIM };
