import { useDeck, type DeckState, type Position, type TimelineHost } from 'beatdeck';
import { SEQ, seqValue, type Live, type SeqKey } from './archWorld';
import { copy } from './copy';
import { lang } from '../../shared/lang';

export type { Live };
/** Subscribe to a slice of the deck state, typed with this story's `live`. */
export const useLive = <T,>(f: (s: DeckState<Live>) => T): T => useDeck<T, Live>(f);

export const FULL = 9999;
const BOOT_LINES = copy.boot[lang];
export const BOOT_TOTAL = BOOT_LINES.reduce((n, l) => n + l.length, 0);
const KEYS = ['path', 'one', 'lim', 'rt'] as const satisfies readonly SeqKey[];

/** Every beat reconstructable from `{scene, beat}` alone: auto beats start from their start state, others are settled. */
export function initialLive({ scene: s, beat: b }: Position): Live {
  const seq = (k: SeqKey) => seqValue(k, s, b, true);
  const boot = s === 0 && b <= 1 ? 0 : FULL;
  return { path: seq('path'), one: seq('one'), lim: seq('lim'), rt: seq('rt'), boot, cut: false };
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
  for (const key of KEYS) if (s === SEQ[key].scene) runSeq(host, key, s, b);
}

/** Stepping back from the automatic boot returns to standby (it would otherwise auto-advance again). */
export const prev = ({ scene, beat }: Position) => (scene === 0 && beat > 0 ? { scene: 0, beat: 0 } : undefined);
