import { useEffect, useRef, useState } from 'react';
import { useTranslations, type Locale } from '../i18n/ui.ts';
import {
  BEAT_MS, INTRO_STORAGE_KEY, formatUptime, markPlayed, typedLines, type Beat, type IntroCounts,
} from '../lib/intro.ts';

interface Props { locale: Locale; counts: IntroCounts; sinceYear: number }

/**
 * Boot-sequence intro, home page only. The page renders underneath; this is an aria-hidden overlay.
 * The inline script in HomeView decides (once per session, no reduced motion) by adding
 * `html.intro-pending`; without JS nothing is added and nothing plays.
 */
export default function BootIntro({ locale, counts, sinceYear }: Props) {
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
  const total = lines.reduce((n, l) => n + l.length, 0);

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
      window.setTimeout(finish, BEAT_MS.exit + 60);
    };

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setBeat('terminal'), BEAT_MS.cursor));
    timers.push(window.setTimeout(() => setBeat('title'), BEAT_MS.cursor + BEAT_MS.terminal));
    timers.push(window.setTimeout(exit, BEAT_MS.cursor + BEAT_MS.terminal + BEAT_MS.title));
    // Typing: a steady rate over the terminal beat.
    const typing = window.setInterval(() => {
      const el = performance.now() - startRef.current - BEAT_MS.cursor;
      setChars(Math.min(total, Math.max(0, (el / (BEAT_MS.terminal - 150)) * total)));
    }, 24);
    const tick = window.setInterval(() => setNow(new Date()), 250);

    const skip = () => finish();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); skip(); } };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    const safety = window.setTimeout(finish, 4500);

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
              {shown.length === 0 && <p><span className="cur" /></p>}
            </div>
          )}
          {showTitle && (
            <div className="intro-title">
              <span className="intro-sticker">{t('intro.sticker')}</span>
              <div className="intro-status">
                <b>{t('intro.live')}</b>
                <span>{t('intro.since', { year: sinceYear })} · {formatUptime(sinceYear, now)}</span>
              </div>
              <div className="intro-card">
                <p className="intro-eyebrow">{t('intro.eyebrow')}</p>
                <p className="intro-name">{t('site.name').toUpperCase()}</p>
                <p className="intro-ready">{lines[3]}<span className="cur" /></p>
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
