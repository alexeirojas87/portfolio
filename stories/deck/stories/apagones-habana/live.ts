import { useDeck, type DeckState, type Position, type TimelineHost } from 'beatdeck';
import { MAP_ENDS, MAP_OPS, S_AS, S_MAP, SEQ, mapValue, seqValue, type Live, type SeqKey } from './archWorld';
import { copy } from './copy';
import { lang, tr } from '../../shared/lang';

export type { Live };
/** Subscribe to a slice of the deck state, typed with this story's `live`. */
export const useLive = <T,>(f: (s: DeckState<Live>) => T) => useDeck<T, Live>(f);

export const FULL = 9999;
const BOOT_LINES = copy.boot[lang];
export const BOOT_TOTAL = BOOT_LINES.reduce((n, l) => n + l.length, 0);
export const QUESTION = () => tr(copy.chat.question);
export const ANSWER = () => tr(copy.chat.answer);

/** Every beat reconstructable from `{scene, beat}` alone: auto beats start from their start state, others are settled. */
export function initialLive({ scene: s, beat: b }: Position): Live {
  const seq = (k: SeqKey) => seqValue(k, s, b, true);
  let qs = s < S_AS ? 0 : FULL, ans = s < S_AS ? 0 : FULL;
  if (s === S_AS) {
    qs = b === 0 ? 0 : FULL;
    ans = b >= 3 ? FULL : 0;
  }
  const boot = s === 0 && b <= 1 ? 0 : FULL;
  return { pl: seq('pl'), as: seq('as'), op: seq('op'), mz: mapValue(s, b, true), qs, ans, boot, cut: false };
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

function runMap(host: TimelineHost<Live>, b: number) {
  const start = b === 0 ? 0 : MAP_ENDS[b - 1], end = MAP_ENDS[b];
  let t = 400;
  for (let i = start + 1; i <= end; i++) {
    const idx = i;
    host.at(t, () => host.setLive({ mz: idx }));
    t += MAP_OPS[i - 1][2];
  }
}

function typeInto(host: TimelineHost<Live>, key: 'qs' | 'ans', n: number, from: number, ms: number) {
  for (let i = 1; i <= n; i++) host.at(from + i * ms, () => host.setLive({ [key]: i } as Partial<Live>));
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
  for (const key of ['pl', 'as', 'op'] as const) if (s === SEQ[key].scene) runSeq(host, key, s, b);
  if (s === S_MAP && b <= 2) runMap(host, b);
  if (s === S_AS) {
    if (b === 0) typeInto(host, 'qs', QUESTION().length, 500, 32);
    if (b === 2) typeInto(host, 'ans', ANSWER().length, 2100, 26);
  }
}

/** Lines revealed by `chars` typed characters, one line after the other. */
export function typed(lines: readonly string[], chars: number): string[] {
  let left = chars;
  return lines.map((l) => {
    const n = Math.max(0, Math.min(l.length, left));
    left -= l.length;
    return l.slice(0, n);
  });
}

/** Stepping back from the automatic boot returns to standby (it would otherwise auto-advance again). */
export const prev = ({ scene, beat }: Position) => (scene === 0 && beat > 0 ? { scene: 0, beat: 0 } : undefined);
