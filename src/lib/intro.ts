// Pure helpers for the boot-sequence intro (kept free of DOM/Astro so they are unit-testable).

export const INTRO_STORAGE_KEY = 'intro-played';

/** Calendar uptime since Jan 1 of `sinceYear`: "12y 09m 14d 03:21:07". Computed from `now`, never hard-coded. */
export function formatUptime(sinceYear: number, now: Date): string {
  let y = now.getFullYear() - sinceYear;
  let m = now.getMonth(); // months since Jan 1
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
export const BEAT_MS = { cursor: 300, terminal: 1100, title: 1100, exit: 400 } as const;
export const INTRO_TOTAL_MS = BEAT_MS.cursor + BEAT_MS.terminal + BEAT_MS.title + BEAT_MS.exit;

/** Beat for the elapsed time since the intro started (skip jumps straight to 'done'). */
export function beatAt(elapsed: number, skipped = false): Beat {
  if (skipped) return 'done';
  if (elapsed < BEAT_MS.cursor) return 'cursor';
  if (elapsed < BEAT_MS.cursor + BEAT_MS.terminal) return 'terminal';
  if (elapsed < BEAT_MS.cursor + BEAT_MS.terminal + BEAT_MS.title) return 'title';
  if (elapsed < INTRO_TOTAL_MS) return 'exit';
  return 'done';
}
