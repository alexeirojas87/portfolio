import { useEffect, useState } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram.tsx';
import { useTranslations, type Locale as UiLocale } from '../../i18n/ui.ts';
import type { Architecture, Locale } from './types.ts';

interface Item { slug: string; title: string; href: string; architecture: Architecture }
interface Props { items: Item[]; locale: Locale }

/** Crossfades through a few featured architectures. Static (manual dots only) under reduced motion. */
export default function HeroCanvas({ items, locale }: Props) {
  const t = useTranslations(locale as UiLocale);
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduced || items.length < 2) return;
    const id = window.setTimeout(() => setI((n) => (n + 1) % items.length), 6500);
    return () => window.clearTimeout(id);
  }, [i, reduced, items.length]);

  const cur = items[i];
  return (
    <div className="hero-canvas">
      <div className="hero-stage">
        {items.map((it, n) => (
          <div key={it.slug} className={`hero-layer ${n === i ? 'on' : ''}`} aria-hidden={n === i ? undefined : true}>
            <ArchitectureDiagram architecture={it.architecture} locale={locale} mode="compact" title={it.title} className="hero-diagram" />
          </div>
        ))}
      </div>
      <div className="hero-caption">
        <div>
          <span className="eyebrow">{t('hero.now')}</span>
          <a href={cur.href} className="hero-title">{cur.title} <span aria-hidden="true">→</span></a>
        </div>
        <div className="hero-dots">
          {items.map((it, n) => (
            <button key={it.slug} type="button" aria-label={t('hero.dot', { title: it.title })}
              aria-pressed={n === i} onClick={() => setI(n)} />
          ))}
        </div>
      </div>
    </div>
  );
}
