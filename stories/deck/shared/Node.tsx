import { NodeBox, type NodeTone, type Rect } from 'beatdeck';
import type { ArchNode } from './arch';
import { tr } from './lang';

/** Same meaning as the site diagrams: colour = kind of component. */
export const KIND_VAR: Record<string, string> = {
  service: 'var(--k-compute)', gateway: 'var(--k-compute)', worker: 'var(--k-compute)', scheduler: 'var(--k-compute)',
  db: 'var(--k-data)', cache: 'var(--k-data)', storage: 'var(--k-data)',
  queue: 'var(--k-queue)', ai: 'var(--k-ai)', client: 'var(--k-client)', external: 'var(--k-external)',
};

/**
 * A node of the project's own architecture for scenes outside the world (the world draws its own boxes).
 * Text comes from the project data (label, tech); kind colour with a glow.
 */
export function Node({ n, rect, on, tone = 'normal', delay = 0 }: {
  n: ArchNode; rect: Rect; on: boolean; tone?: NodeTone; delay?: number;
}) {
  const color = KIND_VAR[n.kind] ?? 'var(--ink-2)';
  return (
    <NodeBox
      rect={rect} on={on} tone={tone} delay={delay}
      style={{
        borderColor: color, borderWidth: tone === 'hot' ? 4 : 2, borderRadius: 6, background: 'var(--surface)', padding: '0 26px',
        boxShadow: `0 0 50px -6px ${color}, inset 0 0 30px -12px ${color}`,
      }}
    >
      {n.tech && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color, marginBottom: 4 }}>{n.tech}</div>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 38, fontWeight: 600, lineHeight: 1.1, whiteSpace: 'normal', color: 'var(--ink)' }}>{tr(n.label)}</div>
    </NodeBox>
  );
}
