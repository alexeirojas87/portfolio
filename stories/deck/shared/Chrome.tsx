import { deck, useDeck } from 'beatdeck';

/**
 * Story chrome: one segment per beat (grouped by scene) along the bottom, and a "07 / 36" counter.
 * Hidden on pure black (standby, boot). Counter is 34 px so it stays legible in the ~0.5 scale embed.
 */
export function Chrome({ black }: { black: boolean }) {
  const d = useDeck((st) => ({ s: st.scene, b: st.beat }));
  const scenes = deck.scenes;
  const total = scenes.reduce((n, sc) => n + sc.beats.length, 0);
  const done = scenes.slice(0, d.s).reduce((n, sc) => n + sc.beats.length, 0) + d.b + 1;
  return (
    <div className="layer" style={{ opacity: black ? 0 : 1, transition: 'opacity 500ms' }}>
      <div style={{ position: 'absolute', left: 150, top: 1030, width: 1380, display: 'flex', gap: 20 }}>
        {scenes.map((sc, si) => (
          <div key={sc.id} style={{ flex: sc.beats.length, display: 'flex', gap: 4 }}>
            {sc.beats.map((_, bi) => {
              const state = si < d.s || (si === d.s && bi < d.b) ? 'done' : si === d.s && bi === d.b ? 'here' : 'todo';
              return (
                <span
                  key={bi}
                  style={{
                    flex: 1, height: 7, transition: 'background 300ms',
                    background: state === 'here' ? 'var(--accent-text)' : state === 'done' ? 'var(--accent)' : 'var(--hair-strong)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="t-meta" style={{ position: 'absolute', right: 150, top: 1008, fontSize: 34, letterSpacing: '0.06em', color: 'var(--ink-2)' }}>
        {String(done).padStart(2, '0')} / {total}
      </div>
    </div>
  );
}
