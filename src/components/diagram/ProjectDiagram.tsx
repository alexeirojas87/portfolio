import { useState } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram.tsx';
import { useTranslations, type Locale as UiLocale } from '../../i18n/ui.ts';
import { viewById, type View } from './views.ts';
import type { Locale } from './types.ts';

interface Props { views: View[]; locale: Locale; title: string }

/** Glance strip + optional view tabs + the diagram for the selected view. */
export default function ProjectDiagram({ views, locale, title }: Props) {
  const t = useTranslations(locale as UiLocale);
  const [id, setId] = useState(views[0].id);
  const view = viewById(views, id);
  const glance = view.architecture.glance ?? [];
  return (
    <div>
      {views.length > 1 && (
        <div className="dg-views" role="group" aria-label={t('view.label')}>
          {views.map((v) => (
            <button key={v.id} type="button" className="dg-view" aria-pressed={v.id === view.id} onClick={() => setId(v.id)}>
              {v.name[locale]}
            </button>
          ))}
        </div>
      )}
      {view.description && <p className="dg-viewdesc">{view.description[locale]}</p>}
      {glance.length > 0 && (
        <ul className="dg-glance" aria-label="At a glance">
          {glance.map((g, i) => <li key={i}>{g[locale]}</li>)}
        </ul>
      )}
      <ArchitectureDiagram key={view.id} architecture={view.architecture} locale={locale} mode="full" title={`${title} · ${view.name[locale]}`} />
    </div>
  );
}
