import { useEffect, useId, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { useTranslations, type Locale as UiLocale } from '../../i18n/ui.ts';
import DiagramSvg from './DiagramSvg.tsx';
import { CLASS_COLOR, CLASS_ORDER, KIND_CLASS } from './kinds.ts';
import { computeLayout } from './layout.ts';
import { buildSteps, nextStep, prevStep, progressAt, stepState } from './flow.ts';
import type { Architecture, Locale, Mode } from './types.ts';

interface Props {
  architecture: Architecture;
  locale: Locale;
  mode?: Mode;
  /** Used in the text alternative. */
  title?: string;
  className?: string;
}

const STEP_MS = 2000;

export default function ArchitectureDiagram({ architecture, locale, mode = 'full', title, className }: Props) {
  return mode === 'compact'
    ? <CompactDiagram architecture={architecture} locale={locale} title={title} className={className} />
    : <FullDiagram architecture={architecture} locale={locale} title={title} />;
}

/** Decorative, non-interactive, CSS-animated: renders identically on the server (no hydration needed). */
function CompactDiagram({ architecture, locale, title, className }: Omit<Props, 'mode'>) {
  const uid = useSafeId();
  const t = useTranslations(locale as UiLocale);
  const layout = useMemo(() => computeLayout(architecture, locale, 'compact'), [architecture, locale]);
  const flow0 = useMemo(() => new Set(architecture.flows[0]?.edges ?? []), [architecture]);
  const alt = t('diagram.alt', {
    nodes: architecture.nodes.length,
    names: architecture.nodes.map((n) => n.label).join(', '),
  });
  return (
    <div className={`canvas dg-compact ${className ?? ''}`}>
      <DiagramSvg arch={architecture} layout={layout} locale={locale} mode="compact" uid={uid} flowEdges={flow0} />
      <span className="sr-only">{title ? `${title}. ` : ''}{alt}</span>
    </div>
  );
}

function FullDiagram({ architecture, locale, title }: Omit<Props, 'mode' | 'className'>) {
  const uid = useSafeId();
  const t = useTranslations(locale as UiLocale);
  const layout = useMemo(() => computeLayout(architecture, locale, 'full'), [architecture, locale]);
  const [flowIdx, setFlowIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const flow = architecture.flows[flowIdx];
  const steps = useMemo(() => (flow ? buildSteps(architecture, flow) : []), [architecture, flow]);
  const progress = useMemo(() => progressAt(steps, step), [steps, step]);
  const flowEdges = useMemo(() => new Set(steps.map((s) => s.edge.id)), [steps]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => { setReduced(mq.matches); if (mq.matches) setPlaying(false); };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!playing || reduced || steps.length === 0) return;
    const id = window.setTimeout(() => setStep((s) => nextStep(s, steps.length)), STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, reduced, step, steps.length, flowIdx]);

  const selectFlow = (i: number) => { setFlowIdx(i); setStep(0); if (!reduced) setPlaying(true); };
  const goTo = (i: number) => setStep(i);
  const kindsPresent = CLASS_ORDER.filter((c) => architecture.nodes.some((n) => KIND_CLASS[n.kind] === c));
  const isPlaying = playing && !reduced;

  return (
    <section className="dg-player" aria-label={t('diagram.label')}>
      <div className="dg-tabs" role="group" aria-label={t('diagram.flows')}>
        {architecture.flows.map((f, i) => (
          <button key={f.id} type="button" className="dg-tab" aria-pressed={i === flowIdx} onClick={() => selectFlow(i)}>
            {f.name[locale]}
          </button>
        ))}
      </div>
      {flow && <p className="dg-desc">{flow.description[locale]}</p>}

      <div className="canvas dg-full on-canvas">
        <div className="dg-bar">
          <span className="dg-eyebrow">
            {t('diagram.eyebrow', { nodes: architecture.nodes.length, flows: architecture.flows.length })}
          </span>
          <div className="dg-controls">
            <button type="button" className="dg-ctl" onClick={() => goTo(prevStep(step, steps.length))} aria-label={t('diagram.prev')}><SkipBack size={16} aria-hidden="true" /></button>
            <button type="button" className="dg-ctl primary" onClick={() => setPlaying((p) => !p)} aria-label={isPlaying ? t('diagram.pause') : t('diagram.play')}>
              {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            </button>
            <button type="button" className="dg-ctl" onClick={() => goTo(nextStep(step, steps.length))} aria-label={t('diagram.next')}><SkipForward size={16} aria-hidden="true" /></button>
            <button type="button" className="dg-ctl" onClick={() => goTo(0)} aria-label={t('diagram.restart')}><RotateCcw size={16} aria-hidden="true" /></button>
          </div>
        </div>

        <div className="dg-scroll" tabIndex={0} role="region" aria-label={title ? `${t('diagram.label')}: ${title}` : t('diagram.label')}>
          <div className="dg-inner" style={{ minWidth: Math.min(layout.width, 980) }}>
            <DiagramSvg arch={architecture} layout={layout} locale={locale} mode="full" uid={uid}
              progress={progress} flowEdges={flowEdges} stepKey={`${flowIdx}:${step}`}
              playing={isPlaying} hoverNode={hover} onHover={setHover} />
          </div>
        </div>

        <div className="dg-foot">
          <ul className="dg-legend" aria-label={t('diagram.legend.title')}>
            {kindsPresent.map((c) => (
              <li key={c}><span className="sw" style={{ background: CLASS_COLOR[c] }} />{t(`kindclass.${c}` as const)}</li>
            ))}
            <li><span className="ln" />{t('diagram.legend.sync')}</li>
            <li><span className="ln async" />{t('diagram.legend.async')}</li>
          </ul>
          <span className="dg-scrollhint">{t('diagram.scroll')}</span>
        </div>
        {reduced && <p className="dg-note">{t('diagram.reduced')}</p>}
      </div>

      <div className="dg-steps-wrap">
        <h3 className="dg-steps-title">{t('diagram.steps')}</h3>
        <ol className="dg-steps">
          {steps.map((s) => {
            const st = stepState(s.index, step);
            return (
              <li key={s.edge.id + s.index}>
                <button type="button" className={`dg-step st-${st}`} onClick={() => goTo(s.index)}
                  aria-current={st === 'active' ? 'step' : undefined}>
                  <span className="n">{s.index + 1}</span>
                  <span className="txt">
                    <span className="path"><b>{s.from.label}</b> <i aria-hidden="true">→</i><span className="sr-only"> to </span> <b>{s.to.label}</b>{s.edge.async && <em>async</em>}</span>
                    <span className="what">{s.edge.label[locale]}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="dg-hint">{t('diagram.hint')}</p>
      </div>
    </section>
  );
}

function useSafeId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, '');
}
