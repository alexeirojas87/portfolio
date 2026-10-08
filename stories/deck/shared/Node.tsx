import { NodeBox, type NodeTone, type Rect } from 'beatdeck';
import type { ArchNode } from './arch';
import { tr } from './lang';

/** Same meaning as the site diagrams: colour = kind of component. */
const KIND_VAR: Record<string, string> = {
  service: 'var(--k-compute)', gateway: 'var(--k-compute)', worker: 'var(--k-compute)', scheduler: 'var(--k-compute)',
  db: 'var(--k-data)', cache: 'var(--k-data)', storage: 'var(--k-data)',
  queue: 'var(--k-queue)', ai: 'var(--k-ai)', client: 'var(--k-client)', external: 'var(--k-external)',
};

/**
 * A node of the project's own architecture, drawn with beatdeck's NodeBox.
 * Text comes from the project data (label, sublabel, tech), so the diagram cannot drift from the site.
 * `hot` = the point of this beat, `normal` = on stage, `dim` = context from earlier beats.
 */
export function Node({ n, rect, on, tone = 'normal', delay = 0 }: {
  n: ArchNode; rect: Rect; on: boolean; tone?: NodeTone; delay?: number;
}) {
  const color = KIND_VAR[n.kind] ?? 'var(--ink-2)';
  const dim = tone === 'dim';
  return (
    <NodeBox
      rect={rect} on={on} tone={tone} delay={delay}
      style={{
        borderColor: dim ? 'var(--ink-3)' : color,
        borderWidth: tone === 'hot' ? 4 : 2,
        borderRadius: 4,
        background: tone === 'hot' ? 'var(--surface)' : 'var(--bg)',
        padding: '0 24px',
      }}
    >
      {n.tech && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '0.1em', textTransform: 'uppercase', color: dim ? 'var(--ink-3)' : color, marginBottom: 3 }}>
          {n.tech}
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 27, fontWeight: 600, lineHeight: 1.12, whiteSpace: 'normal', color: dim ? 'var(--ink-3)' : 'var(--ink)' }}>
        {tr(n.label)}
      </div>
      {n.sublabel && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 400, marginTop: 2, whiteSpace: 'normal', color: dim ? 'var(--ink-3)' : 'var(--ink-2)' }}>
          {tr(n.sublabel)}
        </div>
      )}
    </NodeBox>
  );
}
