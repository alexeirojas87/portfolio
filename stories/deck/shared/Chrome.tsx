import { deck, useDeck } from 'beatdeck';

/**
 * Story chrome: one segment per beat (grouped by scene) along the bottom, and an "07 / 29" counter.
 * Sized for a 1920×1080 stage that is often shown at ~40% inside the project page, so nothing here is small.
 */
export function Chrome({ black }: { black: boolean }) {
  const d = useDeck((st) => ({ s: st.scene, b: st.beat }));
  const scenes = deck.scenes;
  const total = scenes.reduce((n, sc) => n + sc.beats.length, 0);
  const done = scenes.slice(0, d.s).reduce((n, sc) => n + sc.beats.length, 0) + d.b + 1;
  return (
    <div className="layer" style={{ opacity: black ? 0 : 1, transition: 'opacity 500ms' }}>
      <div style={{ position: 'absolute', left: 150, top: 1022, width: 1440, display: 'flex', gap: 22 }}>
        {scenes.map((sc, si) => (
          <div key={sc.id} style={{ flex: sc.beats.length, display: 'flex', gap: 5 }}>
            {sc.beats.map((_, bi) => {
              const state = si < d.s || (si === d.s && bi < d.b) ? 'done' : si === d.s && bi === d.b ? 'here' : 'todo';
              return (
                <span
                  key={bi}
                  style={{
                    flex: 1, height: 6, transition: 'background 300ms',
                    background: state === 'here' ? 'var(--accent-text)' : state === 'done' ? 'var(--accent)' : 'var(--hair-strong)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="t-meta" style={{ position: 'absolute', right: 150, top: 1004, fontSize: 28, letterSpacing: '0.06em', color: 'var(--ink-2)' }}>
        {String(done).padStart(2, '0')} / {total}
      </div>
    </div>
  );
}
