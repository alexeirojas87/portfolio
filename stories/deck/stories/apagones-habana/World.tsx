import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { EASE, flags, layerFade, reducedMotion, usePos } from 'beatdeck';
import { KIND_VAR } from '../../shared/Node';
import { tr } from '../../shared/lang';
import { arch, copy } from './copy';
import { useLive } from './live';
import {
  ARCH_ID, NODE_KEYS, RECT, S_AS, S_OP, S_PL, camFor, centre, deriveWorld, edgePts, worldVisible,
  type Cam, type NodeKey, type Tone, type WorldState,
} from './archWorld';

/** Current camera, shared with the particle canvas (it draws through the same transform). */
export const cam = { x: 0, y: 0, s: 1 };

const kindColor = (k: NodeKey) => KIND_VAR[arch.node(ARCH_ID[k]).kind] ?? 'var(--ink-2)';

function applyCam(el: HTMLElement) {
  el.style.transform = `scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`;
}

/**
 * The camera: travels between the four districts. Animated with GSAP (so verify can wait for it); snapped on load,
 * capture, reduced motion, and whenever the world was hidden (it fades in already in place).
 */
function useCamera(ref: React.RefObject<HTMLDivElement | null>) {
  const { s, b, dir } = usePos();
  const target = camFor(s, b);
  const key = `${target.x},${target.y},${target.s}`;
  const wasVisible = useRef(worldVisible(s));
  useLayoutEffect(() => {
    const el = ref.current!;
    if (flags.capture || dir === 'load' || reducedMotion.get() || !wasVisible.current) {
      Object.assign(cam, target);
      applyCam(el);
      return;
    }
    const tw = gsap.to(cam, { ...target, duration: 1.8, ease: 'power3.inOut', onUpdate: () => applyCam(el) });
    return () => { tw.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useLayoutEffect(() => { wasVisible.current = worldVisible(s); });
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
  // the tech tag only when it fits one line; the web node's tag is ambiguous against the stack list, so it is left out
  const tech = n.tech && n.tech.length <= 19 && n.id !== 'web' ? n.tech : null;
  return (
    <div
      style={{
        position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: 'border-box', padding: '0 24px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 6,
        border: `${hot ? 4 : 2}px solid ${dim ? 'var(--ink-3)' : color}`,
        background: hot ? 'var(--surface)' : 'var(--bg)',
        boxShadow: dim ? 'none' : hot ? `0 0 60px -4px ${color}, inset 0 0 34px -10px ${color}` : `0 0 26px -8px ${color}`,
        opacity: on ? (dim ? 0.62 : 1) : 0, transform: `scale(${on ? 1 : 0.94})`, visibility: vis ? 'visible' : 'hidden',
        transition: `visibility 0s ${vis ? 0 : 2000}ms, opacity 600ms ${EASE}, transform 800ms ${EASE}, border-color 350ms, box-shadow 450ms, background 350ms`,
      }}
    >
      {tech && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.04em', textTransform: 'uppercase', color: dim ? 'var(--ink-3)' : color, marginBottom: 2, whiteSpace: 'nowrap' }}>{tech}</div>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600, lineHeight: 1.1, color: dim ? 'var(--ink-3)' : 'var(--ink)' }}>{tr(n.label)}</div>
    </div>
  );
}

/** Pulsing ring around a node (a tick, a gate). Static in capture / reduced motion (CSS). */
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

/** The glowing packet: rides on the right side of its box. A jump to another district teleports (the camera does the travelling). */
function Packet({ w }: { w: WorldState }) {
  const last = useRef({ x: 1240, y: 500 });
  const jump = useRef(false);
  if (w.pkt) {
    const c = centre(w.pkt);
    const next = { x: c.x + RECT[w.pkt].w / 2 - 34, y: c.y };
    jump.current = Math.hypot(next.x - last.current.x, next.y - last.current.y) > 1300;
    last.current = next;
  }
  const p = last.current;
  const color = w.step.zombie ? 'var(--fault)' : 'var(--accent-text)';
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
              transition: jump.current ? 'opacity 300ms' : `transform ${620 + i * 240}ms cubic-bezier(.45,0,.2,1), opacity 300ms, background 300ms, box-shadow 300ms`,
            }}
          />
        );
      })}
    </>
  );
}

/** Freshness gauge of the watchdog (minutes since the published data changed). Thresholds come from the JSON; the marker positions are illustrative. */
const G = { x: 2160, w: 1720, max: 150, y: 450 };
const gx = (min: number) => G.x + (Math.min(min, G.max) / G.max) * G.w;

function Gauge({ on, age, stale }: { on: boolean; age: number; stale: boolean }) {
  const color = stale ? 'var(--fault)' : 'var(--ok)';
  return (
    <div style={{ opacity: on ? 1 : 0, transition: 'opacity 600ms' }}>
      <div style={{ position: 'absolute', left: G.x, top: G.y, width: G.w, height: 26, borderRadius: 13, background: 'var(--surface)', border: '2px solid var(--hair-strong)' }} />
      <div style={{ position: 'absolute', left: G.x, top: G.y, width: gx(age) - G.x, height: 26, borderRadius: 13, background: color, boxShadow: `0 0 30px -2px ${color}`, transition: `width 1000ms ${EASE}, background 400ms` }} />
      <div style={{ position: 'absolute', left: gx(age) - 14, top: G.y - 6, width: 28, height: 38, borderRadius: 14, background: '#fff', boxShadow: `0 0 26px 6px ${color}`, transition: `left 1000ms ${EASE}` }} />
      {[{ m: 45, label: tr(copy.badge.stale45), c: 'var(--warning)' }, { m: 120, label: tr(copy.badge.alert120), c: 'var(--fault)' }].map((t) => (
        <div key={t.m}>
          <div style={{ position: 'absolute', left: gx(t.m) - 2, top: G.y - 22, width: 4, height: 70, background: t.c, boxShadow: `0 0 12px ${t.c}` }} />
          <div style={{ position: 'absolute', left: gx(t.m) + 14, top: G.y - 50, fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, letterSpacing: '0.06em', color: t.c, whiteSpace: 'nowrap' }}>
            {t.m} min · {t.label}
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: G.x, top: G.y + 44, fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
        {tr(copy.badge.gauge)}
      </div>
    </div>
  );
}

/** Everything that is not a box: gauge, badges, rings, fragment chips. */
function Extras({ w, s, b }: { w: WorldState; s: number; b: number }) {
  const st = w.step;
  const pl = s === S_PL, op = s === S_OP, as = s === S_AS;
  const above = (k: NodeKey) => ({ x: RECT[k].x, y: RECT[k].y - 46 });
  const voice = st.voice === 'voice' ? copy.badge.voice : st.voice === 'parts' ? copy.badge.parts : copy.badge.embed;
  return (
    <>
      <Gauge on={op && b <= 2} age={st.age} stale={st.stale} />

      {/* pipeline */}
      <Ring k="cron" on={pl && st.tick} color="var(--accent-text)" />
      <Badge {...above('cron')} on={pl && b === 0} color="var(--accent-text)">{tr(copy.badge.every)}</Badge>
      <Badge {...above('gha')} on={pl && !!st.tests} color={st.tests === 'ok' ? 'var(--ok)' : 'var(--accent-text)'}>
        {st.tests === 'ok' ? `✓ ${tr(copy.badge.tests)}` : tr(copy.badge.testing)}
      </Badge>
      <Badge {...above('db')} on={pl && st.ups} color="var(--accent-text)">{tr(copy.badge.upsert)}</Badge>
      <Badge {...above('extract')} on={pl && st.ev} color="var(--accent-text)">{tr(copy.badge.events)}</Badge>
      <Badge x={RECT.llm.x} y={RECT.llm.y + RECT.llm.h + 10} on={pl && !!st.voice} color="var(--k-ai)">{tr(voice)}</Badge>
      <Badge {...above('pages')} on={pl && st.deploy} color="var(--ok)">✓ {tr(copy.badge.deploy)}</Badge>

      {/* watchdog */}
      <Ring k="wCron" on={op && st.tick} color="var(--accent-text)" />
      <Badge {...above('wPages')} on={op && b <= 2 && st.age > 0 && w.idx >= 1} color={st.stale ? 'var(--fault)' : 'var(--ok)'}>
        {st.stale ? `✕ ${tr(copy.badge.stale)}` : `✓ ${tr(copy.badge.fresh)}`}
      </Badge>
      <Badge {...above('wGha')} on={op && (st.zombie || st.cancelled || st.dispatch)} color={st.zombie ? 'var(--fault)' : st.dispatch ? 'var(--ok)' : 'var(--warning)'}>
        {st.zombie ? `✕ ${tr(copy.badge.zombie)}` : st.dispatch ? `↻ ${tr(copy.badge.dispatch)}` : tr(copy.badge.cancelled)}
      </Badge>
      <Badge x={RECT.wGh.x + RECT.wGh.w + 24} y={RECT.wGh.y + 52} on={op && st.alert} color="var(--accent-text)">{tr(copy.badge.guardian)}</Badge>

      {/* operations */}
      <Badge {...above('mail')} on={op && st.sent} color="var(--ok)">✓ {tr(copy.badge.sent)}</Badge>
      <Badge {...above('verify')} on={op && st.purged} color="var(--accent-text)">{tr(copy.badge.purged)}</Badge>
      <Badge x={RECT.oGh.x} y={RECT.oGh.y + RECT.oGh.h + 10} on={op && st.issue} color="var(--ok)">{tr(copy.badge.oneIssue)}</Badge>

      {/* assistant: the top fragments coming back from the vector search */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: RECT.aDb.x + i * 205, top: RECT.aDb.y + RECT.aDb.h + 30, width: 185, height: 54, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6, border: '2px solid var(--k-data)', background: 'var(--surface)', boxShadow: '0 0 24px -6px var(--k-data)', fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--ink)',
            opacity: as && st.frag ? 1 : 0, transform: `translateY(${as && st.frag ? 0 : -24}px)`, transition: `opacity 500ms ${EASE} ${i * 160}ms, transform 600ms ${EASE} ${i * 160}ms`,
          }}
        >
          {tr(copy.badge.fragment)} {i + 1}
        </div>
      ))}
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
