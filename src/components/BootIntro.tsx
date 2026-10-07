import { useEffect, useRef, useState } from 'react';
import { useTranslations, type Locale } from '../i18n/ui.ts';
import {
  CURSOR_MS, DISSOLVE_MS, charsTypedAt, dissolveStartMs, introTotalMs, markPlayed, typedLines, type IntroCounts,
} from '../lib/intro.ts';
import { columnCount, finishTime, glyphFor, headY, mulberry32, planRain, revealLines, tailY, type Seed } from '../lib/rain.ts';

interface Props { locale: Locale; counts: IntroCounts }

const NAVY = '#0f1b2d';
const TEAL = '25, 179, 155'; // --k-data (#19B39B)
const HEAD = '#b9fff0';

/**
 * Boot-sequence intro, home page only: a typed terminal, then a Matrix-style dissolve that erodes the
 * navy overlay column by column and reveals the real page underneath. The page renders underneath the
 * whole time; the overlay is aria-hidden. The inline script in the head decides (once per session, no
 * reduced motion) by adding `html.intro-pending`; without JS nothing is added and nothing plays.
 */
export default function BootIntro({ locale, counts }: Props) {
  const t = useTranslations(locale);
  const [beat, setBeat] = useState<'off' | 'cursor' | 'terminal'>('off');
  const [chars, setChars] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
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
    const start = performance.now();
    let done = false;
    let raf = 0;
    let canvas: HTMLCanvasElement | null = null;
    const timers: number[] = [];

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      clearInterval(typing);
      canvas?.remove(); canvas = null;
      root.classList.remove('intro-pending');
      setBeat('off');
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', finish);
      window.removeEventListener('touchmove', finish);
    };
    finishRef.current = finish;

    const startDissolve = () => {
      const overlay = overlayRef.current, term = termRef.current;
      if (!overlay || !term || done) return;
      const W = window.innerWidth, H = window.innerHeight;
      // Seeds: where each typed character sits on screen.
      const chEls = [...term.querySelectorAll<HTMLElement>('.ch')];
      const seeds: Seed[] = [];
      let cell = 12;
      for (const el of chEls) {
        const r = el.getBoundingClientRect();
        cell = r.width || cell;
        const ch = el.textContent ?? '';
        if (ch.trim()) seeds.push({ x: r.left + r.width / 2, y: r.top, ch });
      }
      const fontSize = Math.max(11, Math.round(cell / 0.6));
      const cols = columnCount(W, cell);
      const streams = planRain({ width: W, height: H, cell, durationMs: DISSOLVE_MS, seeds, rng: mulberry32(Date.now() & 0xffff) });

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas = document.createElement('canvas');
      canvas.className = 'intro-rain';
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) { finish(); return; }
      ctx.scale(dpr, dpr);
      overlay.appendChild(canvas);
      const endT = Math.max(...streams.map((s) => finishTime(s, H, cell))) + 40; // everything has left the screen
      const t0 = performance.now();
      let reveal: number[] = new Array(cols).fill(0);

      const frame = (now: number) => {
        if (done) return;
        const t = now - t0;
        ctx.clearRect(0, 0, W, H);
        reveal = revealLines(streams, cols, t, cell, H, reveal);
        // navy curtain per column, eroded from the top behind each falling trail
        ctx.fillStyle = NAVY;
        for (let c = 0; c < cols; c++) if (reveal[c] < H) ctx.fillRect(c * cell, reveal[c], cell + 1, H - reveal[c] + 1);
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (const s of streams) {
          if (t < s.delay && s.y0 < 0) continue;
          const head = headY(s, t);
          if (tailY(s, t, cell) > H) continue;
          for (let i = 0; i < s.trail; i++) {
            const y = head - i * cell;
            if (y < -cell || y > H) continue;
            const a = Math.pow(1 - i / s.trail, 1.7);
            if (i === 0) {
              ctx.shadowColor = `rgba(${TEAL}, .95)`; ctx.shadowBlur = 8;
              ctx.fillStyle = HEAD;
              ctx.fillText(s.seed && t - s.delay < 140 ? s.seed : glyphFor(s, 0, t), s.x, y);
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = `rgba(${TEAL}, ${a.toFixed(2)})`;
              ctx.fillText(glyphFor(s, i, t), s.x, y);
            }
          }
        }
        if (t > endT * 0.7) overlay.classList.add('is-late'); // fade the skip button as the last trails leave
        if (t >= endT) { finish(); return; }
        raf = requestAnimationFrame(frame);
      };
      // First frame is drawn synchronously, identical to the terminal, then the DOM text and the
      // navy overlay background are dropped in the same task: no flash, no jump.
      frame(performance.now());
      overlay.classList.add('is-dissolve');
      root.classList.remove('intro-pending'); // the page shows through the eroded curtain
      raf = requestAnimationFrame(frame);
    };

    timers.push(window.setTimeout(() => setBeat('terminal'), CURSOR_MS));
    timers.push(window.setTimeout(startDissolve, dissolveStartMs(lines)));
    const typing = window.setInterval(() => {
      const el = performance.now() - start - CURSOR_MS;
      setChars(charsTypedAt(lines, Math.max(0, el)));
    }, 20);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); finish(); } };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('touchmove', finish, { passive: true });
    timers.push(window.setTimeout(finish, introTotalMs(lines) + 1500)); // safety
    return finish;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (beat === 'off') return null;
  const shown = typedLines(lines, chars);
  const typing = chars < lines.reduce((n, l) => n + l.length, 0);

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">{t('intro.summary', { total: counts.total })}</p>
      <div className="intro" ref={overlayRef} aria-hidden="true" onClick={() => finishRef.current()}>
        <div className="intro-inner">
          <div className="intro-term" ref={termRef}>
            {shown.map((l, i) => (
              <p key={i}>
                {[...l].map((c, k) => <span key={k} className="ch">{c}</span>)}
                {i === shown.length - 1 && typing ? <span className="cur" /> : null}
              </p>
            ))}
            {shown.length === 0 && <p><span className="cur fast" /></p>}
            {shown.length > 0 && !typing && <p className="term-hold"><span className="cur" /></p>}
          </div>
        </div>
        <button type="button" className="intro-skip" autoFocus onClick={(e) => { e.stopPropagation(); finishRef.current(); }}>
          {t('intro.skip')}
        </button>
      </div>
    </>
  );
}
