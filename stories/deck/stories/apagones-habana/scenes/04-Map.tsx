import { Scene, useScene } from 'beatdeck';
import { tr } from '../../../shared/lang';
import { copy } from '../copy';
import { useLive } from '../live';
import { S_MAP, zonesAt, type ZoneState } from '../archWorld';
import { WorldText } from '../WorldScene';

/** The map panel on the stage, and the geometry of its ten zones. ILLUSTRATIVE: invented positions, not real circuits. */
const P = { x: 150, y: 370, w: 1620, h: 540 };
const PITCH = 308;

const jit = (i: number, k: number) => Math.sin(i * 12.9898 + k * 4.1414) * 13;
const OUTLINE: [number, number][] = [[-134, -62], [-70, -86], [62, -88], [134, -58], [140, 44], [66, 86], [-66, 88], [-138, 52]];
function center(i: number) {
  const col = i % 5, row = Math.floor(i / 5);
  return { x: P.x + 40 + 135 + col * PITCH + jit(i, 9) * 0.8, y: P.y + 205 + row * 200 + jit(i, 11) * 0.6 };
}
function zonePath(i: number) {
  const c = center(i);
  const pts = OUTLINE.map(([dx, dy], k) => `${(c.x + dx + jit(i, k)).toFixed(1)},${(c.y + dy + jit(i, k + 20) * 0.6).toFixed(1)}`);
  return `M${pts.join(' L')} Z`;
}
/** A few report dots, placed inside zones (offsets from each zone's centre). */
const REPORTS: [number, number, number][] = [
  [2, -40, -10], [2, 50, 20], [6, 10, -30], [6, -60, 30], [7, 30, 10], [3, -20, 20], [9, 40, -20], [9, -50, 10], [1, 20, 30], [5, -10, 0],
];
/** 24 hourly cells of one circuit: outage hours (x), one unknown (u), the rest with power. ILLUSTRATIVE. */
const DAY: ZoneState[] = Array.from({ length: 24 }, (_, h) => ([7, 8, 9, 10, 18, 19].includes(h) ? 'x' : h === 14 ? 'u' : 'p'));

const FILL: Record<ZoneState, { fill: string; stroke: string; dash?: string; glow: string }> = {
  n: { fill: 'rgba(0,0,0,0)', stroke: 'rgba(232,238,248,0.22)', dash: '8 10', glow: 'none' },
  p: { fill: 'rgba(25,179,155,0.30)', stroke: '#19b39b', glow: 'drop-shadow(0 0 16px rgba(25,179,155,0.8))' },
  x: { fill: 'rgba(3,6,12,0.94)', stroke: 'rgba(232,238,248,0.34)', glow: 'none' },
  u: { fill: 'rgba(138,151,171,0.10)', stroke: 'rgba(232,238,248,0.74)', dash: '14 10', glow: 'none' },
};

function Streets() {
  const lines: string[] = [];
  for (let k = 0; k < 9; k++) lines.push(`M${P.x} ${P.y + 110 + k * 50} L${P.x + P.w} ${P.y + 100 + k * 52}`);
  for (let k = 0; k < 20; k++) lines.push(`M${P.x + 40 + k * 82} ${P.y + 60} L${P.x + 20 + k * 84} ${P.y + P.h}`);
  lines.push(`M${P.x} ${P.y + 470} L${P.x + P.w} ${P.y + 160}`);
  return <path d={lines.join(' ')} stroke="rgba(157,184,255,0.13)" strokeWidth={2} fill="none" />;
}

function MapPanel({ on, b }: { on: boolean; b: number }) {
  const mz = useLive((st) => st.live.mz);
  const zones = zonesAt(mz);
  const coast = `M${P.x} ${P.y} L${P.x + P.w} ${P.y} L${P.x + P.w} ${P.y + 52} C${P.x + 1300} ${P.y + 96} ${P.x + 1100} ${P.y + 30} ${P.x + 820} ${P.y + 70} C${P.x + 520} ${P.y + 108} ${P.x + 300} ${P.y + 50} ${P.x} ${P.y + 84} Z`;
  return (
    <svg className="layer" width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="map-clip"><rect x={P.x} y={P.y} width={P.w} height={P.h} rx={10} /></clipPath>
      </defs>
      <g style={{ opacity: on ? 1 : 0, transition: 'opacity 600ms' }}>
        <rect x={P.x} y={P.y} width={P.w} height={P.h} rx={10} fill="rgba(8,16,30,0.78)" stroke="var(--hair-strong)" strokeWidth={2} />
        <g clipPath="url(#map-clip)">
          <path d={coast} fill="rgba(91,140,255,0.10)" stroke="var(--k-compute)" strokeWidth={3} opacity={0.8} />
          <Streets />
          {zones.map((z, i) => {
            const f = FILL[z];
            const c = center(i);
            return (
              <g key={i}>
                <path
                  d={zonePath(i)} strokeLinejoin="round" strokeWidth={z === 'p' ? 4 : 3} strokeDasharray={f.dash}
                  style={{ fill: f.fill, stroke: f.stroke, filter: f.glow, transition: 'fill 700ms, stroke 500ms, filter 700ms' }}
                />
                <text x={c.x} y={c.y + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={48} fontWeight={600}
                  fill={z === 'x' ? '#e0559e' : '#e8eef8'} style={{ opacity: z === 'x' || z === 'u' ? 1 : 0, transition: 'opacity 500ms' }}>
                  {z === 'u' ? '?' : '✕'}
                </text>
              </g>
            );
          })}
          {REPORTS.map(([zi, dx, dy], i) => {
            const c = center(zi);
            const show = on && b >= 3;
            return (
              <g key={i} style={{ opacity: show ? 1 : 0, transition: `opacity 500ms ${300 + i * 150}ms` }}>
                <circle className="ripple" cx={c.x + dx} cy={c.y + dy} r={14} fill="none" stroke="var(--warning)" strokeWidth={3} />
                <circle cx={c.x + dx} cy={c.y + dy} r={9} fill="var(--warning)" style={{ filter: 'drop-shadow(0 0 10px var(--warning))' }} />
              </g>
            );
          })}
        </g>

        <text x={P.x + P.w - 24} y={P.y + 38} textAnchor="end" fontFamily="var(--font-mono)" fontSize={28} letterSpacing="0.06em" fill="var(--warning)" style={{ textTransform: 'uppercase' }}>{tr(copy.mapUi.illustrative)}</text>

        {/* legend */}
        {[
          { c: '#19b39b', label: copy.mapUi.power, kind: 'p' }, { c: '#e8eef8', label: copy.mapUi.off, kind: 'x' },
          { c: '#e8eef8', label: copy.mapUi.unknown, kind: 'u' }, { c: 'var(--warning)', label: copy.mapUi.report, kind: 'r' },
        ].map((l, i) => {
          const x = P.x + 34 + [0, 340, 640, 980][i];
          return (
            <g key={l.kind} style={{ opacity: l.kind === 'r' ? (b >= 3 ? 1 : 0) : 1, transition: 'opacity 500ms' }}>
              {l.kind === 'p' && <rect x={x} y={P.y + P.h - 54} width={34} height={26} rx={5} fill="rgba(25,179,155,0.30)" stroke={l.c} strokeWidth={3} />}
              {l.kind === 'x' && <rect x={x} y={P.y + P.h - 54} width={34} height={26} rx={5} fill="rgba(3,6,12,0.94)" stroke="rgba(232,238,248,0.5)" strokeWidth={3} />}
              {l.kind === 'u' && <rect x={x} y={P.y + P.h - 54} width={34} height={26} rx={5} fill="none" stroke={l.c} strokeWidth={3} strokeDasharray="6 5" />}
              {l.kind === 'r' && <circle cx={x + 17} cy={P.y + P.h - 41} r={10} fill={l.c} />}
              <text x={x + 52} y={P.y + P.h - 30} fontFamily="var(--font-sans)" fontSize={30} fontWeight={500} fill="var(--ink)">{tr(l.label)}</text>
            </g>
          );
        })}

        {/* the 24 h strip of one circuit, once outages have been restored */}
        <g style={{ opacity: b >= 2 ? 1 : 0, transition: 'opacity 500ms' }}>
          <text x={P.x} y={P.y + P.h + 78} fontFamily="var(--font-mono)" fontSize={28} letterSpacing="0.06em" fill="var(--ink-2)" style={{ textTransform: 'uppercase' }}>{tr(copy.mapUi.strip)}</text>
          {DAY.map((z, h) => {
            const f = z === 'p' ? 'rgba(25,179,155,0.7)' : z === 'x' ? '#e0559e' : 'rgba(138,151,171,0.5)';
            return (
              <rect key={h} x={P.x + 520 + h * 51} y={P.y + P.h + 48} width={44} height={42} rx={5} fill={f}
                style={{ opacity: b >= 2 ? 1 : 0, transform: `scaleY(${b >= 2 ? 1 : 0.2})`, transformOrigin: `0 ${P.y + P.h + 90}px`, transformBox: 'view-box', transition: `opacity 400ms ${h * 40}ms, transform 500ms var(--ease) ${h * 40}ms` }} />
            );
          })}
        </g>
      </g>
    </svg>
  );
}

function Map_() {
  const { here, b } = useScene();
  return (
    <>
      <WorldText label={copy.scene.map} pairs={copy.map} />
      <MapPanel on={here} b={here ? b : -1} />
    </>
  );
}

/** 04 MAP: a stylised map whose zones light up, go dark or unknown, and come back (automatic beats), then neighbors' reports. */
export const MapScene = () => <Scene index={S_MAP}><Map_ /></Scene>;
