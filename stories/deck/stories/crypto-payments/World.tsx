import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { EASE, flags, layerFade, reducedMotion, usePos } from 'beatdeck';
import { tr } from '../../shared/lang';
import { arch, copy } from './copy';
import { useLive } from './live';
import {
  ARCH_ID, EDGES, NODE_KEYS, RECT, S_CF, S_EX, S_IN, camFor, centre, deriveWorld, edgePts,
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

function applyCam(el: HTMLElement) {
  el.style.transform = `scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`;
}

/** The camera: pans over the world between scenes. Animated with GSAP (so verify can wait for it); snapped on load, capture and reduced motion. */
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
  const vis = r.x >= view.x - 24 && r.x + r.w <= view.x + 1920 / view.s + 24 && r.y + r.h > view.y && r.y < view.y + 1080 / view.s;
  const n = arch.node(ARCH_ID[k]);
  const tone = w.tone[k] ?? 'normal';
  const on = !!w.on[k];
  const color = tone === 'fault' ? 'var(--fault)' : tone === 'ok' ? 'var(--ok)' : kindColor(k);
  const dim = tone === 'dim';
  const hot = tone === 'hot' || tone === 'ok' || tone === 'fault';
  return (
    <div
      style={{
        position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: 'border-box', padding: '0 22px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 6,
        border: `${hot ? 4 : 2}px solid ${dim ? 'var(--ink-3)' : color}`,
        background: hot ? 'var(--surface)' : 'var(--bg)',
        boxShadow: dim ? 'none' : hot ? `0 0 60px -4px ${color}, inset 0 0 34px -10px ${color}` : `0 0 26px -8px ${color}`,
        opacity: on ? (dim ? 0.62 : 1) : 0, transform: `scale(${on ? 1 : 0.94})`, visibility: vis ? 'visible' : 'hidden',
        transition: `visibility 0s ${vis ? 0 : 1800}ms, opacity 600ms ${EASE}, transform 800ms ${EASE}, border-color 350ms, box-shadow 450ms, background 350ms`,
      }}
    >
      {n.tech && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.06em', textTransform: 'uppercase', color: dim ? 'var(--ink-3)' : color, marginBottom: 2, whiteSpace: 'nowrap' }}>{n.tech}</div>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600, lineHeight: 1.1, color: dim ? 'var(--ink-3)' : 'var(--ink)' }}>{tr(n.label)}</div>
    </div>
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

/** The glowing packet that rides the wires: a head and two trailing echoes that follow it with a delay. */
function Packet({ w }: { w: WorldState }) {
  const last = useRef({ x: 400, y: 700 });
  if (w.step.pkt) {
    const c = centre(w.step.pkt);
    last.current = { x: c.x + RECT[w.step.pkt].w / 2 - 34, y: c.y };
  }
  const p = last.current;
  const color = w.step.fail ? 'var(--fault)' : w.step.ackw || w.step.push ? 'var(--ok)' : 'var(--accent-text)';
  return (
    <>
      {[0, 1, 2].map((i) => {
        const r = [16, 12, 8][i];
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 0, top: 0, width: r * 2, height: r * 2, borderRadius: '50%', background: i === 0 ? '#fff' : color,
              boxShadow: `0 0 ${34 - i * 8}px ${10 - i * 2}px ${color}`, opacity: w.step.pkt ? [1, 0.55, 0.28][i] : 0,
              transform: `translate(${p.x - r}px, ${p.y - r}px)`,
              transition: `transform ${620 + i * 240}ms cubic-bezier(.45,0,.2,1), opacity 300ms, background 300ms, box-shadow 300ms`,
            }}
          />
        );
      })}
    </>
  );
}

/** Small round message dots inside a queue (illustrative depth). */
function Msgs({ k, n, on, color, dx = 0, dy = 0 }: { k: NodeKey; n: number; on: boolean; color: string; dx?: number; dy?: number }) {
  const r = RECT[k];
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: r.x + r.w / 2 - 54 + i * 40 + dx, top: r.y + r.h + 20 + dy, width: 26, height: 26, borderRadius: '50%', background: color,
            boxShadow: `0 0 16px 3px ${color}`, opacity: on && i < n ? 1 : 0, transform: `scale(${on && i < n ? 1 : 0.2})`,
            transition: `opacity 350ms ${EASE}, transform 450ms ${EASE}`,
          }}
        />
      ))}
    </>
  );
}

/** Everything that is not a box: badges, queue depth, coin chips, the illustrative confirmation counter. */
function Extras({ w, s, b }: { w: WorldState; s: number; b: number }) {
  const st = w.step;
  const inS = s === S_IN, exS = s === S_EX, cfS = s === S_CF;
  const dbCol = st.hash ? 'var(--ok)' : 'var(--accent-text)';
  const showPending = st.pend && !st.hash && (inS || exS);
  const showSubmitted = st.hash && exS;
  return (
    <>
      {/* intake: acknowledgement on the checkout, "pending" on the store, queue depth */}
      <Badge x={RECT.merchant.x} y={RECT.merchant.y - 46} on={inS && st.ack} color="var(--ok)">✓ {tr(copy.badge.accepted)}</Badge>
      <Badge x={RECT.db.x + RECT.db.w + 24} y={RECT.db.y + 52} on={showPending} color="var(--accent-text)">{tr(copy.badge.pending)}</Badge>
      <Badge x={RECT.db.x + RECT.db.w + 24} y={RECT.db.y + 20} on={showSubmitted} color="var(--ok)">✓ {tr(copy.badge.submitted)}</Badge>
      <Badge x={RECT.db.x + RECT.db.w + 24} y={RECT.db.y + 76} on={showSubmitted} color={dbCol}>{tr(copy.badge.tx)}</Badge>
      <Msgs k="reqq" n={st.q} on={w.on.reqq === true && (inS || exS)} color="var(--k-queue)" />

      {/* execution: signed, one chip per coin, the dead-letter queue */}
      <Badge x={RECT.wallet.x} y={RECT.wallet.y - 46} on={exS && st.sign && st.pkt === 'wallet'} color="var(--ok)">✓ {tr(copy.badge.signed)}</Badge>
      {copy.coins.map((c, i) => {
        const lit = st.coin === i;
        const on = !!w.on.adapters && exS;
        return (
          <div
            key={c}
            style={{
              position: 'absolute', left: RECT.adapters.x + i * 114, top: RECT.adapters.y + RECT.adapters.h + 18, width: 102, height: 58, boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600,
              color: lit ? '#fff' : 'var(--ink-2)', background: lit ? 'var(--surface)' : 'var(--bg)',
              border: `${lit ? 4 : 2}px solid ${lit ? 'var(--accent-text)' : 'var(--hair-strong)'}`,
              boxShadow: lit ? '0 0 34px -2px var(--accent-text)' : 'none',
              opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 10}px)`, transition: `opacity 400ms ${EASE} ${i * 90}ms, transform 500ms ${EASE} ${i * 90}ms, border-color 250ms, box-shadow 250ms`,
            }}
          >
            {c}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute', left: RECT.dlq.x + RECT.dlq.w + 24, top: RECT.dlq.y + RECT.dlq.h / 2 - 13, width: 26, height: 26, borderRadius: '50%', background: 'var(--fault)',
          boxShadow: '0 0 22px 5px var(--fault)', opacity: st.dlq > 0 && exS ? 1 : 0, transform: `scale(${st.dlq > 0 && exS ? 1 : 0.2})`, transition: `opacity 350ms, transform 500ms ${EASE}`,
        }}
      />
      <Badge x={RECT.dlq.x + RECT.dlq.w + 66} y={RECT.dlq.y + RECT.dlq.h / 2 - 20} on={st.dlq > 0 && exS} color="var(--fault)">{tr(copy.badge.dead)}</Badge>
      <Badge x={RECT.executor.x} y={RECT.executor.y - 46} on={exS && st.fail} color="var(--fault)">✕ {tr(copy.badge.failed)}</Badge>

      {/* confirmation: the illustrative counter above the watcher, submitted / confirmed on its store, the event on its queue */}
      <div
        style={{
          position: 'absolute', left: RECT.watcher.x, top: RECT.watcher.y - 196, width: 330, opacity: cfS && b <= 1 && w.on.watcher ? 1 : 0, transition: `opacity 500ms ${EASE}`,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1, height: 20, borderRadius: 4, background: st.cf >= i ? 'var(--ok)' : 'var(--hair-strong)', boxShadow: st.cf >= i ? '0 0 20px var(--ok)' : 'none', transition: 'background 350ms, box-shadow 350ms' }} />
          ))}
        </div>
        <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 600, color: st.cf >= 3 ? 'var(--ok)' : 'var(--accent-text)', transition: 'color 350ms', whiteSpace: 'nowrap' }}>
          {Math.max(st.cf, st.confirmed ? 3 : st.cf)} / 3 <span style={{ fontSize: 28, color: 'var(--ink-2)' }}>{tr(copy.badge.confirmations)}</span>
        </div>
        <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--warning)' }}>{tr(copy.badge.illustrative)}</div>
      </div>
      <Badge x={RECT.db2.x + RECT.db2.w + 24} y={RECT.db2.y + 52} on={cfS && st.pkt !== null && w.on.db2 === true} color={st.confirmed ? 'var(--ok)' : 'var(--accent-text)'}>
        {st.confirmed ? `✓ ${tr(copy.badge.confirmed)}` : tr(copy.badge.submitted)}
      </Badge>
      <Badge x={RECT.evtq.x - 30} y={RECT.evtq.y - 46} on={cfS && st.evt} color="var(--k-queue)">{tr(copy.badge.event)}</Badge>
      <Badge x={RECT.merchant2.x} y={RECT.merchant2.y - 46} on={cfS && st.push} color="var(--ok)">✓ {tr(copy.badge.confirmed)}</Badge>
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

export { EDGES };
