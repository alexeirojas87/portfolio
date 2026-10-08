import { useDeck, type DeckState, type Position, type TimelineHost } from 'beatdeck';
import { SEQ, S_CERB, seqValue, type Live, type SeqKey } from './archWorld';
import { BLOCKED, CLEAN, total } from './prompts';
import { copy } from './copy';
import { lang } from '../../shared/lang';

export type { Live };
/** Subscribe to a slice of the deck state, typed with this story's `live`. */
export const useLive = <T,>(f: (s: DeckState<Live>) => T): T => useDeck<T, Live>(f);

export const FULL = 9999;
const BOOT_LINES = copy.boot[lang];
export const BOOT_TOTAL = BOOT_LINES.reduce((n, l) => n + l.length, 0);

/**
 * Cerberus scene state per beat: [start, end] of (ty = typed chars, cs = stage).
 * cs: 0 raw · 1 beam scanning · 2 findings marked · 3 redacted · 4 verdict.
 */
const CERB: { start: [number, number]; end: [number, number] }[] = [
  { start: [0, 0], end: [FULL, 0] },
  { start: [FULL, 0], end: [FULL, 2] },
  { start: [FULL, 2], end: [FULL, 4] },
  { start: [0, 0], end: [FULL, 4] },
];

/** Every beat reconstructable from `{scene, beat}` alone: auto beats start from their start state, others are settled. */
export function initialLive({ scene: s, beat: b }: Position): Live {
  const seq = (k: SeqKey) => seqValue(k, s, b, true);
  let ty = s < S_CERB ? 0 : FULL, cs = s < S_CERB ? 0 : 4;
  if (s === S_CERB) [ty, cs] = CERB[b].start;
  let boot = s === 0 ? (b === 0 ? 0 : b === 1 ? 0 : FULL) : FULL;
  if (s > 0) boot = FULL;
  return { lc: seq('lc'), gw: seq('gw'), tc: seq('tc'), ty, cs, boot, cut: false };
}

function runSeq(host: TimelineHost<Live>, key: SeqKey, s: number, b: number) {
  const q = SEQ[key];
  const start = seqValue(key, s, b, true), end = seqValue(key, s, b, false);
  let t = 300;
  for (let i = start + 1; i <= end; i++) {
    host.at(t, () => host.setLive({ [key]: i } as Partial<Live>));
    t += q.steps[i].ms;
  }
}

function typeText(host: TimelineHost<Live>, n: number, from = 300, ms = 28) {
  for (let i = 1; i <= n; i++) host.at(from + i * ms, () => host.setLive({ ty: i }));
  return from + n * ms;
}

/** Automatic motion. The engine kills it when the beat is left; `?capture=1` still runs it, only autoGo is suppressed. */
export function timeline({ scene: s, beat: b }: Position, host: TimelineHost<Live>) {
  const { at } = host;
  if (s === 0 && b === 1) {
    for (let i = 1; i <= BOOT_TOTAL; i++) at(500 + i * 34, () => host.setLive({ boot: i }));
    const t = 500 + BOOT_TOTAL * 34 + 500;
    at(t, () => host.setLive({ cut: true }));
    at(t + 180, () => host.setLive({ cut: false }));
    at(t + 230, () => host.autoGo({ scene: 0, beat: 2 }));
    return;
  }
  for (const key of ['lc', 'gw', 'tc'] as const) if (s === SEQ[key].scene) runSeq(host, key, s, b);
  if (s === S_CERB) {
    if (b === 0) typeText(host, total(BLOCKED));
    if (b === 1) { at(300, () => host.setLive({ cs: 1 })); at(2000, () => host.setLive({ cs: 2 })); }
    if (b === 2) { at(400, () => host.setLive({ cs: 3 })); at(1500, () => host.setLive({ cs: 4 })); }
    if (b === 3) {
      const t = typeText(host, total(CLEAN));
      at(t + 300, () => host.setLive({ cs: 1 }));
      at(t + 1900, () => host.setLive({ cs: 4 }));
    }
  }
}

/** Stepping back from the automatic boot returns to standby (it would otherwise auto-advance again). */
export const prev = ({ scene, beat }: Position) => (scene === 0 && beat > 0 ? { scene: 0, beat: 0 } : undefined);
