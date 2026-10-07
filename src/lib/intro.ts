// Pure helpers for the boot-sequence intro (kept free of DOM/Astro so they are unit-testable).

export const INTRO_STORAGE_KEY = 'intro-played';

/** Calendar uptime since the 1st of `sinceMonth` (1-12) in `sinceYear`: "12y 09m 14d 03:21:07". Computed from `now`, never hard-coded. */
export function formatUptime(sinceYear: number, now: Date, sinceMonth = 1): string {
  let y = now.getFullYear() - sinceYear;
  let m = now.getMonth() - (sinceMonth - 1); // months since the start month
  let d = now.getDate() - 1; // days since the 1st
  if (d < 0) { m -= 1; d += daysInMonth(now.getFullYear(), now.getMonth() - 1); }
  if (m < 0) { y -= 1; m += 12; }
  const p = (n: number) => String(n).padStart(2, '0');
  return `${y}y ${p(m)}m ${p(d)}d ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}
const daysInMonth = (year: number, month0: number) => new Date(year, month0 + 1, 0).getDate();

export interface IntroCounts { total: number; client: number; personal: number }

export function countProjects(projects: { category: 'personal' | 'corporate' }[]): IntroCounts {
  const client = projects.filter((p) => p.category === 'corporate').length;
  return { total: projects.length, client, personal: projects.length - client };
}

/** The part of the terminal text typed after `chars` characters; the last line may be partial. */
export function typedLines(lines: string[], chars: number): string[] {
  const out: string[] = [];
  let left = Math.max(0, Math.floor(chars));
  for (const l of lines) {
    if (left <= 0) break;
    out.push(l.slice(0, left));
    left -= l.length;
  }
  return out;
}

export type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;

/** sessionStorage can throw (private mode, blocked): treat that as "not played yet". */
export function hasPlayed(storage: Storage | null | undefined): boolean {
  try { return storage?.getItem(INTRO_STORAGE_KEY) === '1'; } catch { return false; }
}
export function markPlayed(storage: Storage | null | undefined): void {
  try { storage?.setItem(INTRO_STORAGE_KEY, '1'); } catch { /* still plays once per page view */ }
}

/** Plays only on the home page, once per session, and never with reduced motion. */
export function shouldPlayIntro(o: { isHome: boolean; reducedMotion: boolean; storage?: Storage | null }): boolean {
  return o.isHome && !o.reducedMotion && !hasPlayed(o.storage);
}

export type Beat = 'cursor' | 'terminal' | 'title' | 'exit' | 'done';

// Timings (ms). Tuned so every beat can be read; skip is always available.
export const CURSOR_MS = 700; // cursor alone: a few blinks
export const CHAR_MS = 35; // typing speed per character
export const LINE_PAUSE_MS = 250; // pause after each terminal line
export const READY_PAUSE_MS = 400; // slightly longer pause before the last ("> ready") line
export const TERMINAL_END_MS = 1100; // hold on the finished terminal so the last line is readable
export const TITLE_ENTER_MS = 900; // staged entrance: eyebrow, name, sticker, uptime
export const TITLE_HOLD_MS = 2500; // everything visible, uptime visibly ticking
export const EXIT_MS = 800; // morph / wipe, ease-in-out
/** Delay of each title element's entrance (CSS animation-delay). */
export const TITLE_STAGGER_MS = { eyebrow: 0, name: 250, sticker: 500, uptime: 700, ready: 900 } as const;

/** Time to type all lines, including the pauses between them (none after the last line). */
export function terminalDuration(lines: string[]): number {
  let t = 0;
  lines.forEach((l, i) => {
    t += l.length * CHAR_MS;
    if (i < lines.length - 1) t += i === lines.length - 2 ? READY_PAUSE_MS : LINE_PAUSE_MS;
  });
  return t;
}

/** Characters typed (across all lines) `elapsed` ms into the terminal beat, honouring line pauses. */
export function charsTypedAt(lines: string[], elapsed: number): number {
  let t = elapsed;
  let chars = 0;
  for (let i = 0; i < lines.length; i++) {
    const typeMs = lines[i].length * CHAR_MS;
    if (t <= typeMs) return chars + Math.max(0, Math.floor(t / CHAR_MS));
    chars += lines[i].length;
    t -= typeMs;
    if (i < lines.length - 1) t -= i === lines.length - 2 ? READY_PAUSE_MS : LINE_PAUSE_MS;
    if (t < 0) return chars;
  }
  return chars;
}

export const terminalBeatMs = (lines: string[]) => terminalDuration(lines) + TERMINAL_END_MS;
export const titleBeatMs = () => TITLE_ENTER_MS + TITLE_HOLD_MS;
export const introTotalMs = (lines: string[]) => CURSOR_MS + terminalBeatMs(lines) + titleBeatMs() + EXIT_MS;

/** Beat for the elapsed time since the intro started (skip jumps straight to 'done'). */
export function beatAt(elapsed: number, lines: string[], skipped = false): Beat {
  if (skipped) return 'done';
  const term = CURSOR_MS + terminalBeatMs(lines);
  const title = term + titleBeatMs();
  if (elapsed < CURSOR_MS) return 'cursor';
  if (elapsed < term) return 'terminal';
  if (elapsed < title) return 'title';
  if (elapsed < title + EXIT_MS) return 'exit';
  return 'done';
}
