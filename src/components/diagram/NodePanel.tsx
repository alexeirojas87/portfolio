import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslations, type Locale as UiLocale } from '../../i18n/ui.ts';
import { connectionsFor, type Connection } from './connections.ts';
import { CLASS_COLOR, KIND_CLASS } from './kinds.ts';
import { isOwned, nodeLabel, type Architecture, type ArchNode, type Locale } from './types.ts';

interface Props {
  arch: Architecture;
  node: ArchNode;
  locale: Locale;
  emphasisEdge: string | null;
  onEmphasis: (edgeId: string | null) => void;
  onClose: () => void;
}

const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

/** Slide-over (desktop) / bottom sheet (phones) with a node's details and derived connections. */
export default function NodePanel({ arch, node, locale, emphasisEdge, onEmphasis, onClose }: Props) {
  const t = useTranslations(locale as UiLocale);
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { incoming, outgoing } = connectionsFor(arch, node.id);
  const cls = KIND_CLASS[node.kind];
  const owned = isOwned(node);
  const d = node.details;
  const titleId = `np-${node.id}`;

  useEffect(() => { closeRef.current?.focus(); }, [node.id]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.hasAttribute('disabled'));
    if (items.length === 0) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const list = (title: string, items: Connection[], arrow: string) => (
    <div className="np-conn">
      <h4>{title}</h4>
      {items.length === 0 ? <p className="np-muted">—</p> : (
        <ul>
          {items.map((c) => (
            <li key={c.edgeId}>
              <button type="button" aria-pressed={emphasisEdge === c.edgeId} title={t('details.show')}
                onClick={() => onEmphasis(emphasisEdge === c.edgeId ? null : c.edgeId)}>
                <span className="arrow" aria-hidden="true">{arrow}</span>
                <span className="who">{nodeLabel(c.other, locale)}</span>
                <span className="what">{c.label[locale]}</span>
                {c.async && <em>{t('details.async')}</em>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <div className="np-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="np" ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
        <div className="np-head">
          <div>
            <h3 id={titleId}>{nodeLabel(node, locale)}</h3>
            <div className="np-chips">
              <span className="chip" style={{ ['--c' as string]: CLASS_COLOR[cls] }}><span className="dot" aria-hidden="true" />{t(`kindclass.${cls}` as const)}</span>
              {node.tech && <span className="chip">{node.tech}</span>}
              <span className={`chip np-own ${owned ? 'in' : 'out'}`}>{owned ? t('details.owned') : t('details.external')}</span>
            </div>
          </div>
          <button type="button" ref={closeRef} className="np-close" onClick={onClose} aria-label={t('details.close')}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="np-body">
          <section>
            <h4>{t('details.what')}</h4>
            <p>{d ? d.what[locale] : node.sublabel[locale]}</p>
          </section>
          {d && d.responsibilities.length > 0 && (
            <section>
              <h4>{t('details.responsibilities')}</h4>
              <ul className="np-list">{d.responsibilities.map((r, i) => <li key={i}>{r[locale]}</li>)}</ul>
            </section>
          )}
          {d?.why && (
            <section>
              <h4>{t('details.why')}</h4>
              <p>{d.why[locale]}</p>
            </section>
          )}
          <section>
            <h4>{t('details.connections')}</h4>
            {incoming.length + outgoing.length === 0 ? <p className="np-muted">{t('details.none')}</p> : (
              <>
                {list(t('details.incoming'), incoming, '←')}
                {list(t('details.outgoing'), outgoing, '→')}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
