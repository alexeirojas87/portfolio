import { useEffect, useRef, useState } from 'react';
import { useTranslations, type Locale } from '../i18n/ui.ts';
import {
  CURSOR_MS, EXIT_MS, TITLE_STAGGER_MS, charsTypedAt, formatUptime, introTotalMs, markPlayed,
  terminalBeatMs, titleBeatMs, typedLines, type Beat, type IntroCounts,
} from '../lib/intro.ts';

interface Props { locale: Locale; counts: IntroCounts; sinceYear: number; sinceMonth: number }

/**
 * Boot-sequence intro, home page only. The page renders underneath; this is an aria-hidden overlay.
 * The inline script in HomeView decides (once per session, no reduced motion) by adding
 * `html.intro-pending`; without JS nothing is added and nothing plays.
 */
export default function BootIntro({ locale, counts, sinceYear, sinceMonth }: Props) {
  const t = useTranslations(locale);
  const [beat, setBeat] = useState<Beat | 'off'>('off');
  const [chars, setChars] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [clip, setClip] = useState<string | null>(null);
  const startRef = useRef(0);
  const doneRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});

  const lines = [
    t('intro.l1'),
    t('intro.l2'),
    t('intro.l3', { total: counts.total, client: counts.client, personal: counts.personal }),
    t('intro.l4'),
  ];

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('intro-pending')) return; // skipped: not home / already played / reduced motion
    let storage: Storage | null = null;
    try { storage = window.sessionStorage; } catch { /* unavailable: plays once per page view */ }
    markPlayed(storage);
    window.scrollTo(0, 0);
    setBeat('cursor');
    startRef.current = performance.now();

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      root.classList.remove('intro-pending');
      setBeat('off');
      cleanup();
    };
    finishRef.current = finish;
    const exit = () => {
      if (doneRef.current) return;
      // Morph the navy panel into the hero canvas; fall back to an upward wipe.
      const stage = document.querySelector('.hero-stage')?.getBoundingClientRect();
      const ok = stage && stage.width > 120 && stage.top < window.innerHeight - 60 && stage.bottom > 0;
      root.classList.remove('intro-pending'); // reveal the light page behind the shrinking panel
      setBeat('exit');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setClip(ok
          ? `inset(${Math.max(0, stage!.top)}px ${Math.max(0, window.innerWidth - stage!.right)}px ${Math.max(0, window.innerHeight - stage!.bottom)}px ${Math.max(0, stage!.left)}px round 18px)`
          : 'inset(0 0 100% 0)');
      }));
      window.setTimeout(finish, EXIT_MS + 60);
    };

    const termStart = CURSOR_MS;
    const titleStart = termStart + terminalBeatMs(lines);
    const exitStart = titleStart + titleBeatMs();
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setBeat('terminal'), termStart));
    timers.push(window.setTimeout(() => setBeat('title'), titleStart));
    timers.push(window.setTimeout(exit, exitStart));
    // Typing: fixed ms per character with pauses between lines.
    const typing = window.setInterval(() => {
      const el = performance.now() - startRef.current - termStart;
      setChars(charsTypedAt(lines, Math.max(0, el)));
    }, 20);
    const tick = window.setInterval(() => setNow(new Date()), 250);

    const skip = () => finish();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); skip(); } };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    const safety = window.setTimeout(finish, introTotalMs(lines) + 1500);

    function cleanup() {
      timers.forEach(clearTimeout); clearTimeout(safety);
      clearInterval(typing); clearInterval(tick);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    }
    return () => { cleanup(); root.classList.remove('intro-pending'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (beat === 'off') return null;
  const shown = typedLines(lines, chars);
  const showTitle = beat === 'title' || beat === 'exit';
  const typing = beat === 'terminal' || beat === 'cursor';

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">{t('intro.summary', { total: counts.total })}</p>
      <div className={`intro ${beat === 'exit' ? 'is-exit' : ''}`} aria-hidden="true"
        style={clip ? { clipPath: clip } : undefined} onClick={() => finishRef.current()}>
        <div className={`intro-inner ${beat === 'exit' ? 'fade' : ''}`}>
          {!showTitle && (
            <div className="intro-term">
              {shown.map((l, i) => (
                <p key={i}>{l}{i === shown.length - 1 && typing ? <span className="cur" /> : null}</p>
              ))}
              {shown.length === 0 && <p><span className="cur fast" /></p>}
            </div>
          )}
          {showTitle && (
            <div className="intro-title">
              <span className="intro-sticker" style={{ animationDelay: `${TITLE_STAGGER_MS.sticker}ms` }}>{t('intro.sticker')}</span>
              <div className="intro-status" style={{ animationDelay: `${TITLE_STAGGER_MS.uptime}ms` }}>
                <b>{t('intro.live')}</b>
                <span>{t('intro.since', { year: sinceYear })} · {formatUptime(sinceYear, now, sinceMonth)}</span>
              </div>
              <div className="intro-card">
                <p className="intro-eyebrow" style={{ animationDelay: `${TITLE_STAGGER_MS.eyebrow}ms` }}>{t('intro.eyebrow')}</p>
                <p className="intro-name" style={{ animationDelay: `${TITLE_STAGGER_MS.name}ms` }}>{t('site.name').toUpperCase()}</p>
                <p className="intro-ready" style={{ animationDelay: `${TITLE_STAGGER_MS.ready}ms` }}>{lines[3]}<span className="cur" /></p>
              </div>
            </div>
          )}
        </div>
        {beat !== 'exit' && <button type="button" className="intro-skip" autoFocus onClick={(e) => { e.stopPropagation(); finishRef.current(); }}>
          {t('intro.skip')}
        </button>}
      </div>
    </>
  );
}
