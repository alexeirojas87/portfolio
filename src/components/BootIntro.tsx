import { useEffect, useRef, useState } from 'react';
import { useTranslations, type Locale } from '../i18n/ui.ts';
import {
  CURSOR_MS, DISSOLVE_MS, charsTypedAt, dissolveStartMs, introTotalMs, markPlayed, typedLines, type IntroCounts,
} from '../lib/intro.ts';
import {
  GLYPHS, SOFT_ROWS, dropRows, edgeY, glyphAt, mulberry32, navyTop, planColumns,
} from '../lib/columns.ts';

interface Props { locale: Locale; counts: IntroCounts }

const NAVY = '#0f1b2d';
const TEAL = '#19b39b'; // --k-data
const TEXT = '#e8eef8'; // --canvas-text

type Atlas = { white: HTMLCanvasElement; teal: HTMLCanvasElement; sw: number; sh: number };
let atlasCache: (Atlas & { key: string }) | null = null;

/** Binary glyph sprites, rendered once: white heads and teal tails. */
function getAtlas(cellW: number, cellH: number, dpr: number): Atlas {
  const key = `${cellW}x${cellH}@${dpr}`;
  if (atlasCache?.key === key) return atlasCache;
  const sw = Math.round(cellW * dpr), sh = Math.round(cellH * dpr);
  const sprite = (color: string) => {
    const c = document.createElement('canvas');
    c.width = sw * GLYPHS.length; c.height = sh;
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    g.font = `${Math.round(cellH * 0.78)}px "JetBrains Mono", monospace`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = color;
    for (let i = 0; i < GLYPHS.length; i++) g.fillText(GLYPHS[i], i * cellW + cellW / 2, cellH / 2 + 1);
    return c;
  };
  atlasCache = { key, white: sprite('#e9fffa'), teal: sprite(TEAL), sw, sh };
  return atlasCache;
}

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
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      // Typed characters, exactly where the DOM draws them (spaces keep their slot, no piece).
      const termFont = parseFloat(getComputedStyle(term.querySelector('p') ?? term).fontSize) || 16;
      const text: { x: number; y: number; w: number; h: number; ch: string }[] = [];
      term.querySelectorAll<HTMLElement>('.ch').forEach((el) => {
        const ch = el.textContent ?? '';
        if (!ch.trim()) return;
        const r = el.getBoundingClientRect();
        text.push({ x: r.left, y: r.top, w: r.width, h: r.height, ch });
      });
      const cursors = [...term.querySelectorAll<HTMLElement>('.cur')].map((el) => el.getBoundingClientRect());
      const cellW = W < 720 ? 13 : 16, cellH = Math.round(cellW * 1.55);
      const plan = planColumns({ width: W, height: H, cellW, cellH, durationMs: DISSOLVE_MS, textXs: text.map((x) => x.x + x.w / 2), rng: mulberry32(Date.now() & 0xffff) });
      const { columns } = plan;
      const drops = plan.drops.slice().sort((a, b) => a.layer - b.layer);
      const colOf = (x: number) => columns[Math.min(columns.length - 1, Math.max(0, Math.floor(x / cellW)))];

      canvas = document.createElement('canvas');
      canvas.className = 'intro-rain';
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) { finish(); return; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const atlas = getAtlas(cellW, cellH, dpr);
      ctx.font = `${termFont}px "JetBrains Mono", monospace`;
      // DOM glyph boxes include half-leading: baseline = top + (box height - content height) / 2 + ascent
      const m = ctx.measureText('M');
      const ascM = m.fontBoundingBoxAscent || termFont * 0.98, descM = m.fontBoundingBoxDescent || termFont * 0.3;
      const boxH = text[0]?.h ?? ascM + descM;
      const asc = (boxH - (ascM + descM)) / 2 + ascM;
      const t0 = performance.now();

      const frame = (now: number) => {
        if (done) return;
        const t = now - t0;
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        // 1) navy strips whose top edge is the falling head, with a soft 3-row gradient
        ctx.fillStyle = NAVY;
        for (const c of columns) {
          const e = edgeY(c, t, cellH);
          if (e >= H) continue;
          for (let k = 0; k < SOFT_ROWS; k++) {
            const y = e + k * cellH;
            if (y + cellH <= 0) continue;
            ctx.globalAlpha = (k + 1) / (SOFT_ROWS + 1);
            ctx.fillRect(c.x, y, cellW + 1, cellH + 0.5);
          }
          const y = Math.max(0, e + SOFT_ROWS * cellH);
          ctx.globalAlpha = 1;
          ctx.fillRect(c.x, y, cellW + 1, H - y + 1);
        }
        // 2) the typed text stays until the head reaches it, then it is swallowed by the stream
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.font = `${termFont}px "JetBrains Mono", monospace`;
        ctx.fillStyle = TEXT;
        for (const x of text) {
          const top = navyTop(colOf(x.x + x.w / 2), t, cellH);
          const k = (x.y + x.h / 2 - top) / (cellH * 2);
          if (k <= 0) continue;
          ctx.globalAlpha = Math.min(1, k);
          ctx.fillText(x.ch, x.x + x.w / 2, x.y + asc);
        }
        if (cursors.length && t < 120) { ctx.globalAlpha = 1; for (const r of cursors) ctx.fillRect(r.left, r.top, r.width, r.height); }
        // 3) binary streams, back to front; they exist only on navy (never above the drain edge)
        for (const d of drops) {
          const col = columns[d.col];
          if (edgeY(col, t, cellH) >= H) continue;
          const clip = navyTop(col, t, cellH);
          for (const r of dropRows(d, t, clip)) {
            if (r.y > H) continue;
            const a = r.i === 0 ? 1 : Math.pow(1 - r.i / d.trail, 1.6);
            const fadeIn = Math.min(1, (r.y - clip) / cellH);
            ctx.globalAlpha = a * d.alpha * fadeIn;
            if (ctx.globalAlpha < 0.02) continue;
            const g = glyphAt(d.salt, r.i, t);
            ctx.drawImage(r.i === 0 ? atlas.white : atlas.teal, g * atlas.sw, 0, atlas.sw, atlas.sh, d.x - d.cell / 2, r.y, d.cell, d.row);
          }
        }
        ctx.globalAlpha = 1;
        if (t > DISSOLVE_MS * 0.8) overlay.classList.add('is-late'); // fade the skip button near the end
        if (t >= DISSOLVE_MS) { finish(); return; }
        raf = requestAnimationFrame(frame);
      };
      // First frame is drawn synchronously and equals the DOM terminal; the DOM text and the overlay
      // background are dropped in the same task: no flash, no jump.
      overlay.appendChild(canvas);
      frame(performance.now());
      overlay.classList.add('is-dissolve');
      root.classList.remove('intro-pending'); // the page shows through where the navy has drained
      raf = requestAnimationFrame(frame);
    };

    // build the glyph sprites while the terminal types, so the dissolve starts without a hitch
    timers.push(window.setTimeout(() => { const w = window.innerWidth; const cw = w < 720 ? 13 : 16; getAtlas(cw, Math.round(cw * 1.55), Math.min(2, window.devicePixelRatio || 1)); }, 120));
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
