/** Dotted grid, faint scanlines and a vignette behind everything. Static (a slow sweep line runs only outside capture / reduced motion). */
import { usePos } from 'beatdeck';

export function Atmosphere() {
  const p = usePos();
  const black = p.s === 0 && p.b <= 1;
  return (
    <div className="layer" aria-hidden="true" style={{ opacity: black ? 0 : 1, transition: "opacity 500ms" }}>
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: [
            'radial-gradient(circle, rgba(157,184,255,0.16) 1.6px, transparent 1.8px)',
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 4px)',
          ].join(','),
          backgroundSize: '56px 56px, 100% 100%',
          backgroundPosition: '28px 28px, 0 0',
        }}
      />
      <div className="sweep" />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(6,12,22,0.62) 100%)' }} />
    </div>
  );
}
