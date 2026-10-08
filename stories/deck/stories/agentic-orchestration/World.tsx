import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CountUp, EASE, flags, layerFade, reducedMotion, usePos } from 'beatdeck';
import { tr } from '../../shared/lang';
import { arch, copy } from './copy';
import { useLive } from './live';
import {
  ARC_D, ARCH_ID, EDGES, NODE_KEYS, ORBIT, RECT, S_GW, S_LC, S_TC, camFor, centre, deriveWorld, edgePts,
  type Cam, type NodeKey, type Tone, type WorldState,
} from './archWorld';

/** Current camera, shared with the particle canvas (it draws through the same transform). */
export const cam = { x: 0, y: 0, s: 1 };

const KIND_VAR: Record<string, string> = {
  service: 'var(--k-compute)', gateway: 'var(--k-compute)', worker: 'var(--k-compute)', scheduler: 'var(--k-compute)',
  db: 'var(--k-data)', cache: 'var(--k-data)', storage: 'var(--k-data)',
  queue: 'var(--k-queue)', ai: 'var(--k-ai)', client: 'var(--k-client)', external: 'var(--k-external)',
};
const kindColor = (k: NodeKey) => KIND_VAR[arch.node(ARCH_ID[k]).kind] ?? 'var(--ink-2)';
const TONE_COLOR: Record<Tone, string | null> = { hot: 'var(--accent-text)', ok: 'var(--ok)', fault: 'var(--fault)', normal: null, dim: null };

function applyCam(el: HTMLElement) {
  el.style.transform = `scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`;
}

/** The camera: pans/zooms over the world between scenes. Animated with GSAP (so verify can wait for it); snapped on load, capture and reduced motion. */
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
    const tw = gsap.to(cam, { ...target, duration: 1.6, ease: 'power3.inOut', onUpdate: () => applyCam(el) });
    return () => { tw.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

function WNode({ k, w, view }: { k: NodeKey; w: WorldState; view: Cam }) {
  const r = RECT[k];
  // a box outside the camera window is hidden once the camera has arrived (it would otherwise be text outside the stage)
  const vis = r.x + r.w > view.x && r.x < view.x + 1920 / view.s && r.y + r.h > view.y && r.y < view.y + 1080 / view.s;
  const n = arch.node(ARCH_ID[k]);
  const tone = w.tone[k] ?? 'normal';
  const on = !!w.on[k];
  const color = tone === 'fault' ? 'var(--fault)' : tone === 'ok' ? 'var(--ok)' : kindColor(k);
  const dim = tone === 'dim';
  const hot = tone === 'hot' || tone === 'ok' || tone === 'fault';
  const isProv = k.startsWith('prov');
  const provNames = tr(arch.node('provider').sublabel!).split(', ');
  const label = isProv ? provNames[+k.slice(4)].replace(/^./, (c) => c.toUpperCase()) : tr(n.label);
  return (
    <div
      style={{
        position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: 'border-box', padding: '0 24px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 6,
        border: `${hot ? 4 : 2}px solid ${dim ? 'var(--ink-3)' : color}`,
        background: hot ? 'var(--surface)' : 'var(--bg)',
        boxShadow: dim ? 'none' : hot ? `0 0 60px -4px ${color}, inset 0 0 34px -10px ${color}` : `0 0 26px -8px ${color}`,
        opacity: on ? (dim ? 0.62 : 1) : 0, transform: `scale(${on ? 1 : 0.94})`, visibility: vis ? 'visible' : 'hidden',
        transition: `visibility 0s ${vis ? 0 : 1800}ms, opacity 600ms ${EASE}, transform 800ms ${EASE}, border-color 350ms, box-shadow 450ms, background 350ms`,
      }}
    >
      {!isProv && n.tech && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color: dim ? 'var(--ink-3)' : color, marginBottom: 2 }}>{n.tech}</div>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600, lineHeight: 1.1, color: dim ? 'var(--ink-3)' : 'var(--ink)' }}>{label}</div>
      {isProv && (
        <div style={{ position: 'absolute', right: 22, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 48, color, opacity: tone === 'fault' || tone === 'ok' ? 1 : 0, transition: 'opacity 300ms' }}>
          {tone === 'fault' ? '✕' : '✓'}
        </div>
      )}
    </div>
  );
}

/** Pulsing ring around a node (gate waiting, scan running). Static in capture / reduced motion (CSS). */
function Ring({ k, on, color }: { k: NodeKey; on: boolean; color: string }) {
  const r = RECT[k];
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
        position: 'absolute', left: x, top: y, fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color, whiteSpace: 'nowrap',
        opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 10}px)`, transition: `opacity 350ms ${EASE}, transform 450ms ${EASE}`,
      }}
    >
      {children}
    </div>
  );
}

const EDGE_COLOR: Record<Tone | 'dimline', string> = {
  hot: 'var(--accent-text)', ok: 'var(--ok)', fault: 'var(--fault)', normal: 'var(--ink-2)', dim: 'var(--ink-3)', dimline: 'var(--ink-3)',
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

/** Meters on the wires: requests per role against its limit (illustrative numbers, see the audit). */
const METERS: { id: NodeKey; n: number; limit: number }[] = [
  { id: 'defagent', n: 6, limit: 10 },
  { id: 'qaagent', n: 4, limit: 10 },
  { id: 'devagent', n: 15, limit: 20 },
  { id: 'reviewagent', n: 12, limit: 12 },
];

function Meters({ s, b }: { s: number; b: number }) {
  const { entry, dir } = usePos();
  const on = s === S_GW && b >= 1;
  const animate = s === S_GW && b === 1 && dir === 'forward';
  const gw = centre('gateway');
  return (
    <>
      {METERS.map((m, i) => {
        const a = centre(m.id);
        const x0 = RECT[m.id].x + RECT[m.id].w;
        const t = (1900 - x0) / (RECT.gateway.x - x0);
        const y = a.y + (gw.y - a.y) * t;
        const full = m.n >= m.limit;
        const color = full ? 'var(--warning)' : 'var(--accent-text)';
        return (
          <div
            key={m.id}
            style={{
              position: 'absolute', left: 1760, top: y - 33, width: 280, height: 66, boxSizing: 'border-box', borderRadius: 6, background: 'var(--bg)',
              border: `2px solid ${full ? 'var(--warning)' : 'var(--hair-strong)'}`, overflow: 'hidden',
              opacity: on ? 1 : 0, transform: `translateX(${on ? 0 : -16}px)`, transition: `opacity 500ms ${EASE} ${i * 140}ms, transform 600ms ${EASE} ${i * 140}ms, border-color 400ms`,
            }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${on ? (m.n / m.limit) * 100 : 0}%`, background: full ? 'rgba(242,169,59,0.28)' : 'rgba(47,91,234,0.4)', transition: `width 1200ms ${EASE} ${i * 140 + 200}ms` }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 16px', fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 600, color }}>
              <span>
                <CountUp value={m.n} from={animate ? 0 : undefined} entry={entry} ms={1200} delay={i * 140 + 200} /> / {m.limit}
              </span>
              <span style={{ fontSize: 28, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: full ? 1 : 0, transition: `opacity 400ms 1400ms` }}>{tr(copy.badge.limit)}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

function Packet({ w }: { w: WorldState }) {
  const last = useRef({ x: 780, y: 682 });
  if (w.pkt) {
    const c = centre(w.pkt);
    // ride on the right side of the box so the packet never covers its label
    last.current = w.pkt === 'arc' ? c : { x: c.x + RECT[w.pkt].w / 2 - (w.pkt.startsWith('prov') ? 120 : 34), y: c.y };
  }
  const p = last.current;
  const color = w.step.fail && w.pkt === 'prov0' ? 'var(--fault)' : w.step.crash ? 'var(--fault)' : 'var(--accent-text)';
  return (
    <>
      {[0, 1, 2].map((i) => {
        const r = [16, 12, 8][i];
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 0, top: 0, width: r * 2, height: r * 2, borderRadius: '50%', background: i === 0 ? '#fff' : color,
              boxShadow: `0 0 ${34 - i * 8}px ${10 - i * 2}px ${color}`, opacity: w.pkt ? [1, 0.55, 0.28][i] : 0,
              transform: `translate(${p.x - r}px, ${p.y - r}px)`,
              transition: `transform ${620 + i * 240}ms cubic-bezier(.45,0,.2,1), opacity 300ms, background 300ms, box-shadow 300ms`,
            }}
          />
        );
      })}
    </>
  );
}

/** Everything that is not a box: orbit, rework arc, badges, gate rings. */
function Extras({ w, s, b }: { w: WorldState; s: number; b: number }) {
  const st = w.step;
  const lc = s === S_LC;
  const tools = s === S_TC;
  const o = ORBIT;
  return (
    <>
      <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path
          d={ARC_D} fill="none" stroke="var(--warning)" strokeWidth={4} pathLength={1} strokeDasharray={1}
          strokeDashoffset={(lc && st.loop) || s > S_LC ? 0 : 1}
          style={{ transition: `stroke-dashoffset 900ms ${EASE}, opacity 400ms`, opacity: s > S_LC ? 0.35 : 1, filter: 'drop-shadow(0 0 8px var(--warning))' }}
        />
        <ellipse
          cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} fill="none" stroke="var(--k-compute)" strokeWidth={2} strokeDasharray="4 14"
          style={{ opacity: tools ? 0.7 : 0, transition: 'opacity 800ms' }}
        />
      </svg>
      {tools && (
        <div
          className="orbit-dot"
          style={{ offsetPath: `path('M${o.cx - o.rx} ${o.cy} a${o.rx} ${o.ry} 0 1 0 ${2 * o.rx} 0 a${o.rx} ${o.ry} 0 1 0 ${-2 * o.rx} 0')` }}
        />
      )}
      <Ring k="portal" on={lc && !!st.gate && !st.ok} color="var(--accent-text)" />
      <Ring k="safety" on={s === S_GW && st.scan} color="var(--accent-text)" />
      <Badge x={RECT.portal.x} y={RECT.portal.y - 46} on={lc && !!st.gate} color={st.ok ? 'var(--ok)' : 'var(--accent-text)'}>
        {st.ok ? `✓ ${tr(copy.badge.approved)}` : tr(copy.badge.awaiting)}
      </Badge>
      <Badge x={1660} y={780} on={lc && st.loop && w.step.pkt !== null} color="var(--warning)">{tr(copy.badge.rework)}</Badge>
      <Badge x={RECT.ado.x} y={RECT.ado.y - 46} on={lc && !!st.ci} color={st.ci === 'fail' ? 'var(--fault)' : 'var(--ok)'}>
        {st.ci === 'fail' ? `✕ ${tr(copy.badge.ciFail)}` : `✓ ${tr(copy.badge.ciOk)}`}
      </Badge>
      <Badge x={RECT.orchestrator.x} y={RECT.orchestrator.y - 46} on={lc && st.crash} color="var(--fault)">✕ {tr(copy.badge.crash)}</Badge>
      <Badge x={RECT.runstore.x + RECT.runstore.w + 24} y={RECT.runstore.y + 44} on={lc && !!st.persist} color={st.persist === 'resumed' ? 'var(--ok)' : 'var(--accent-text)'}>
        {st.persist === 'resumed' ? tr(copy.badge.resumed) : tr(copy.badge.persisted)}
      </Badge>
      <div style={{ position: 'absolute', left: RECT.prov0.x, top: RECT.prov0.y - 84, fontFamily: 'var(--font-mono)', fontSize: 30, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'normal', width: 320, lineHeight: 1.15, color: 'var(--ink-2)', opacity: w.on.prov0 && (s === S_GW || (s === S_TC && b === 0)) ? 1 : 0, transition: 'opacity 600ms' }}>
        {tr(arch.node('provider').label)}
      </div>
      <Meters s={s} b={b} />
    </>
  );
}

/** One persistent world: boxes, wires, packets. The camera does the cinematography. */
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
        <Packet w={w} />
      </div>
    </div>
  );
}

export { EDGES, TONE_COLOR };
