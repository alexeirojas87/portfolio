import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { useTranslations, type Locale as UiLocale } from '../../i18n/ui.ts';
import DiagramSvg from './DiagramSvg.tsx';
import CuratedSvg from './CuratedSvg.tsx';
import NodePanel from './NodePanel.tsx';
import { computeCurated, fitNodeW, gridRows, type Orientation } from './curated.ts';
import { CLASS_COLOR, CLASS_ORDER, KIND_CLASS } from './kinds.ts';
import { computeLayout } from './layout.ts';
import { buildSteps, nextStep, prevStep, progressAt, stepState } from './flow.ts';
import { isCurated, nodeLabel, type Architecture, type Locale, type Mode } from './types.ts';

interface Props {
  architecture: Architecture;
  locale: Locale;
  mode?: Mode;
  /** Compact only: show node titles and tech chips (hero). */
  labels?: boolean;
  /** Compact only: lay out top to bottom with this node width (phones). */
  vertical?: { nodeW: number };
  /** Used in the text alternative. */
  title?: string;
  className?: string;
}

const STEP_MS = 2000;

export default function ArchitectureDiagram({ architecture, locale, mode = 'full', title, className, labels, vertical }: Props) {
  return mode === 'compact'
    ? <CompactDiagram architecture={architecture} locale={locale} title={title} className={className} labels={labels} vertical={vertical} />
    : <FullDiagram architecture={architecture} locale={locale} title={title} />;
}

/** Decorative, non-interactive, CSS-animated: renders identically on the server (no hydration needed). */
function CompactDiagram({ architecture, locale, title, className, labels, vertical }: Omit<Props, 'mode'>) {
  const uid = useSafeId();
  const t = useTranslations(locale as UiLocale);
  const curated = isCurated(architecture);
  const layout = useMemo(() => (curated ? null : computeLayout(architecture, locale, 'compact')), [architecture, locale, curated]);
  const cLayout = useMemo(
    () => (curated ? computeCurated(architecture, locale, vertical ? { orientation: 'vertical', nodeW: vertical.nodeW } : { orientation: 'horizontal', compact: true }) : null),
    [architecture, locale, curated, vertical],
  );
  const flow0 = useMemo(() => new Set(architecture.flows[0]?.edges ?? []), [architecture]);
  const flow0Map = useMemo(() => new Map([...flow0].map((id, i) => [id, i + 1])), [flow0]);
  const alt = t('diagram.alt', {
    nodes: architecture.nodes.length,
    names: architecture.nodes.map((n) => nodeLabel(n, locale)).join(', '),
  });
  return (
    <div className={`canvas dg-compact ${className ?? ''}`}>
      {cLayout
        ? <CuratedSvg arch={architecture} layout={cLayout} locale={locale} uid={uid} compact labels={labels} stepNo={flow0Map} />
        : <DiagramSvg arch={architecture} layout={layout!} locale={locale} mode="compact" uid={uid} flowEdges={flow0} />}
      <span className="sr-only">{title ? `${title}. ` : ''}{alt}</span>
    </div>
  );
}

function FullDiagram({ architecture, locale, title }: Omit<Props, 'mode' | 'className'>) {
  const uid = useSafeId();
  const t = useTranslations(locale as UiLocale);
  const curated = isCurated(architecture);
  const rootRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [overflow, setOverflow] = useState(false);
  const [flowIdx, setFlowIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [emph, setEmph] = useState<string | null>(null);

  // Orientation follows the diagram's own container: vertical (top to bottom) on phones.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { setWidth(el.clientWidth); setOverflow(el.scrollWidth > el.clientWidth + 2); });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) setOverflow(el.scrollWidth > el.clientWidth + 2);
  }, []);
  const orientation: Orientation = curated && width > 0 && width < 720 ? 'vertical' : 'horizontal';

  const layout = useMemo(() => (curated ? null : computeLayout(architecture, locale, 'full')), [architecture, locale, curated]);
  const cLayout = useMemo(() => {
    if (!curated) return null;
    const nodeW = orientation === 'vertical' ? fitNodeW(gridRows(architecture), width) : undefined;
    return computeCurated(architecture, locale, { orientation, nodeW });
  }, [architecture, locale, curated, orientation, width]);

  const flow = architecture.flows[flowIdx];
  const steps = useMemo(() => (flow ? buildSteps(architecture, flow) : []), [architecture, flow]);
  const progress = useMemo(() => progressAt(steps, step), [steps, step]);
  const flowEdges = useMemo(() => new Set(steps.map((s) => s.edge.id)), [steps]);
  const stepNo = useMemo(() => new Map(steps.map((s) => [s.edge.id, s.index + 1])), [steps]);

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

  const closePanel = () => {
    const id = selected;
    setSelected(null); setEmph(null);
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(`[data-node-id="${id}"]`)?.focus());
  };
  const selectedNode = selected ? architecture.nodes.find((n) => n.id === selected) ?? null : null;
  const selectFlow = (i: number) => { setFlowIdx(i); setStep(0); if (!reduced) setPlaying(true); };
  const goTo = (i: number) => setStep(i);
  const kindsPresent = CLASS_ORDER.filter((c) => architecture.nodes.some((n) => KIND_CLASS[n.kind] === c));
  const isPlaying = playing && !reduced;
  const natural = (cLayout ?? layout)!.width;
  const vertical = orientation === 'vertical';

  return (
    <section className="dg-player" ref={rootRef} aria-label={t('diagram.label')}>
      <div className="dg-head">
        <div className="dg-tabs" role="group" aria-label={t('diagram.flows')}>
          {architecture.flows.map((f, i) => (
            <button key={f.id} type="button" className="dg-tab" aria-pressed={i === flowIdx} onClick={() => selectFlow(i)}>
              {f.name[locale]}
            </button>
          ))}
        </div>
        {flow && <p className="dg-desc">{flow.description[locale]}</p>}
      </div>

      <div className={`dg-body ${natural > 1400 ? 'wide' : ''}`}>
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

          {steps[step] && (
            <p className="dg-caption" aria-hidden="true">
              <span className="n">{step + 1}</span>
              <b>{nodeLabel(steps[step].from, locale)}</b> → <b>{nodeLabel(steps[step].to, locale)}</b>
              <span className="what">{steps[step].edge.label[locale]}</span>
            </p>
          )}

          <div className="dg-scroll" ref={scrollRef} tabIndex={0} role="region" aria-label={title ? `${t('diagram.label')}: ${title}` : t('diagram.label')}>
            <div className="dg-inner" style={vertical ? { width: natural } : { minWidth: Math.round(natural * 0.72), maxWidth: Math.round(natural * 1.3) }}>
              {cLayout ? (
                <CuratedSvg arch={architecture} layout={cLayout} locale={locale} uid={uid}
                  boundaryLabel={t('diagram.boundary')} progress={progress} stepNo={stepNo}
                  stepKey={`${flowIdx}:${step}`} playing={isPlaying} hoverNode={selected ?? hover} onHover={setHover} onSelect={setSelected} emphasisEdge={emph} fixedWidth={vertical} />
              ) : (
                <DiagramSvg arch={architecture} layout={layout!} locale={locale} mode="full" uid={uid}
                  progress={progress} flowEdges={flowEdges} stepKey={`${flowIdx}:${step}`}
                  playing={isPlaying} hoverNode={selected ?? hover} onHover={setHover} onSelect={setSelected} emphasisEdge={emph} />
              )}
            </div>
          </div>

          <div className="dg-foot" data-overflow={overflow}>
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
                      <span className="path"><b>{nodeLabel(s.from, locale)}</b> <i aria-hidden="true">→</i><span className="sr-only"> to </span> <b>{nodeLabel(s.to, locale)}</b>{s.edge.async && <em>async</em>}</span>
                      <span className="what">{s.edge.label[locale]}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="dg-hint">{t('diagram.hint')}</p>
        </div>
      </div>

      {selectedNode && (
        <NodePanel arch={architecture} node={selectedNode} locale={locale} emphasisEdge={emph}
          onEmphasis={setEmph} onClose={closePanel} />
      )}
    </section>
  );
}

function useSafeId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, '');
}
