import { useEffect, useRef, useState } from 'react';
import { useTranslations, type Locale } from '../i18n/ui.ts';
import {
  CURSOR_MS, DISSOLVE_MS, charsTypedAt, dissolveStartMs, introTotalMs, markPlayed, typedLines, type IntroCounts,
} from '../lib/intro.ts';
import {
  GLYPHS, TEXT_HOLD_MS, endOf, fallState, glyphIndex, mulberry32, planDecompose, stageAt, type Piece, type TextSeed,
} from '../lib/decompose.ts';

interface Props { locale: Locale; counts: IntroCounts }

type Atlas = { atlas: { white: HTMLCanvasElement; teal: HTMLCanvasElement; page: HTMLCanvasElement }; sw: number; sh: number; glyphPx: number };
let atlasCache: (Atlas & { key: string }) | null = null;

/** Sprite atlases: glyphs pre-rendered once (white flash / teal on navy / teal with a halo over the page). */
function getAtlas(cellW: number, cellH: number, dpr: number): Atlas {
  const key = `${cellW}x${cellH}@${dpr}`;
  if (atlasCache?.key === key) return atlasCache;
  const glyphPx = Math.round(cellH * 0.8);
  const sw = Math.round(cellW * dpr), sh = Math.round(cellH * dpr);
  const sprite = (style: 'white' | 'teal' | 'page') => {
    const c = document.createElement('canvas');
    c.width = sw * GLYPHS.length; c.height = sh;
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    g.font = `${glyphPx}px "JetBrains Mono", monospace`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < GLYPHS.length; i++) {
      const cx = (sw / dpr) * i + cellW / 2, cy = cellH / 2 + 1;
      if (style === 'page') { g.lineWidth = 3; g.strokeStyle = 'rgba(15, 27, 45, .55)'; g.lineJoin = 'round'; g.strokeText(GLYPHS[i], cx, cy); }
      g.fillStyle = style === 'white' ? '#ffffff' : TEAL;
      g.fillText(GLYPHS[i], cx, cy);
    }
    return c;
  };
  atlasCache = { key, atlas: { white: sprite('white'), teal: sprite('teal'), page: sprite('page') }, sw, sh, glyphPx };
  return atlasCache;
}


const NAVY = '#0f1b2d';
const TEAL = '#19b39b'; // --k-data
const TEXT = '#e8eef8'; // --canvas-text

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
      // Text pieces: each typed character exactly where the DOM draws it (spaces keep their slot, no piece).
      const termFont = parseFloat(getComputedStyle(term.querySelector('p') ?? term).fontSize) || 16;
      const lineEls = [...term.querySelectorAll('p')];
      const text: TextSeed[] = [];
      lineEls.forEach((pEl, row) => {
        pEl.querySelectorAll<HTMLElement>('.ch').forEach((el) => {
          const ch = el.textContent ?? '';
          if (!ch.trim()) return;
          const r = el.getBoundingClientRect();
          text.push({ x: r.left, y: r.top, w: r.width, h: r.height, ch, row });
        });
        pEl.querySelectorAll<HTMLElement>('.cur').forEach((el) => {
          const r = el.getBoundingClientRect();
          text.push({ x: r.left, y: r.top, w: r.width, h: r.height, ch: '', row, cursor: true });
        });
      });
      const cellW = W < 720 ? 13 : 16, cellH = Math.round(cellW * 1.55);
      const pieces = planDecompose({ width: W, height: H, cellW, cellH, durationMs: DISSOLVE_MS, text, rng: mulberry32(Date.now() & 0xffff), seed: Date.now() & 0xff });
      const cells = pieces.filter((p) => p.kind === 'cell').sort((a, b) => a.act + a.glitch - (b.act + b.glitch));
      const actors = pieces.slice().sort((a, b) => a.act - b.act);

      canvas = document.createElement('canvas');
      canvas.className = 'intro-rain';
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) { finish(); return; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { atlas, sw, sh, glyphPx } = getAtlas(cellW, cellH, dpr);
      const drawGlyph = (a: HTMLCanvasElement, idx: number, x: number, y: number) =>
        ctx.drawImage(a, idx * sw, 0, sw, sh, x, y, cellW, cellH);

      ctx.font = `${termFont}px "JetBrains Mono", monospace`;
      // DOM glyph boxes include half-leading: baseline = top + (box height - content height) / 2 + ascent
      const m = ctx.measureText('M');
      const ascM = m.fontBoundingBoxAscent || termFont * 0.98, descM = m.fontBoundingBoxDescent || termFont * 0.3;
      const boxH = text.find((x) => !x.cursor)?.h ?? ascM + descM;
      const asc = (boxH - (ascM + descM)) / 2 + ascM;
      let lo = 0;
      const t0 = performance.now();

      const frame = (now: number) => {
        if (done) return;
        const t = now - t0;
        ctx.clearRect(0, 0, W, H);
        // 1) the console surface: solid navy, with a hole wherever a cell has detached
        ctx.fillStyle = NAVY;
        ctx.fillRect(0, 0, W, H);
        for (const c of cells) {
          if (c.act + c.glitch > t) break;
          ctx.clearRect(c.x, c.y, c.w + 1, c.h + 1);
        }
        // 2) pieces: typed text still solid, glitching cells, detached and falling glyphs
        while (lo < actors.length && endOf(actors[lo]) < t && actors[lo].act < t) lo++;
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.font = `${termFont}px "JetBrains Mono", monospace`;
        for (const p of actors) {
          const { stage, p: prog } = stageAt(p, t);
          if (stage === 'done') continue;
          if (p.kind === 'cell' && stage === 'solid') continue;
          if (p.kind === 'text' && (stage === 'solid' || (stage === 'glitch' && t - p.act < TEXT_HOLD_MS))) {
            ctx.fillStyle = TEXT;
            if (p.cursor) ctx.fillRect(p.x, p.y, p.w, p.h); else ctx.fillText(p.ch ?? '', p.x + p.w / 2, p.y + asc);
            continue;
          }
          const gx = p.kind === 'text' ? p.x + p.w / 2 - cellW / 2 : p.x;
          const gy = p.kind === 'text' ? p.y + p.h / 2 - cellH / 2 : p.y;
          const idx = glyphIndex(p, t);
          if (stage === 'glitch') drawGlyph(t - p.act < 60 ? atlas.white : atlas.teal, idx, gx, gy);
          else if (stage === 'detached') drawGlyph(atlas.page, idx, gx, gy);
          else {
            const { dy, alpha } = fallState(p, prog);
            ctx.globalAlpha = alpha;
            drawGlyph(atlas.page, idx, gx, gy + dy);
            for (let k = 1; k <= 3; k++) { ctx.globalAlpha = alpha * (0.4 / k); drawGlyph(atlas.teal, (idx + k * 7) % GLYPHS.length, gx, gy + dy - k * cellH * 0.62 * Math.min(1, prog * 3)); }
            ctx.globalAlpha = 1;
          }
        }
        if (t > DISSOLVE_MS * 0.8) overlay.classList.add('is-late'); // fade the skip button near the end
        if (t >= DISSOLVE_MS) { finish(); return; }
        raf = requestAnimationFrame(frame);
      };
      // First frame is drawn synchronously and is identical to the DOM terminal; the DOM text and the
      // overlay background are dropped in the same task: no flash, no jump.
      overlay.appendChild(canvas);
      frame(performance.now());
      overlay.classList.add('is-dissolve');
      root.classList.remove('intro-pending'); // the page shows through the first holes
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
