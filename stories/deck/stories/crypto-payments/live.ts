import { useDeck, type DeckState, type Position, type TimelineHost } from 'beatdeck';
import { S_CF, S_ID, STEPS, isAutoWorld, wEnd, wStart, type Live } from './archWorld';
import { ALL, FIRST, total } from './prompts';
import { copy } from './copy';
import { lang } from '../../shared/lang';

export type { Live };
/** Subscribe to a slice of the deck state, typed with this story's `live`. */
export const useLive = <T,>(f: (s: DeckState<Live>) => T): T => useDeck<T, Live>(f);

export const FULL = 9999;
const BOOT_LINES = copy.boot[lang];
export const BOOT_TOTAL = BOOT_LINES.reduce((n, l) => n + l.length, 0);
const T_FIRST = total(FIRST), T_ALL = total(ALL);
/** Push-versus-polling clock: ticks 0..PC_END; the confirmation lands at tick PC_EVENT. */
export const PC_END = 8, PC_EVENT = 4, POLLS = [1, 3, 5, 7];

/** Every beat reconstructable from `{scene, beat}` alone: auto beats start from their start state, others are settled. */
export function initialLive({ scene: s, beat: b }: Position): Live {
  const w = isAutoWorld(s, b) ? wStart(s, b) : wEnd(s, b);
  let ty = 0, cs = 0;
  if (s === S_ID) { ty = b === 0 ? 0 : b === 1 ? T_FIRST : T_ALL; cs = 0; }
  if (s > S_ID) { ty = T_ALL; cs = 2; }
  return {
    w, boot: s === 0 && b <= 1 ? 0 : FULL, ty, cs,
    pc: s === S_CF && b === 3 ? 0 : PC_END,
    pb: s === 1 && b === 1 ? 0 : 2,
    cut: false,
  };
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
  if (s === 1 && b === 1) {
    at(300, () => host.setLive({ pb: 1 }));
    at(4800, () => host.setLive({ pb: 2 }));
  }
  if (isAutoWorld(s, b)) {
    let t = 300;
    for (let i = wStart(s, b) + 1; i <= wEnd(s, b); i++) {
      at(t, () => host.setLive({ w: i }));
      t += STEPS[i].ms;
    }
  }
  if (s === S_ID) {
    if (b === 0) for (let i = 1; i <= T_FIRST; i++) at(300 + i * 28, () => host.setLive({ ty: i }));
    if (b === 1) for (let i = T_FIRST + 1; i <= T_ALL; i++) at(300 + (i - T_FIRST) * 28, () => host.setLive({ ty: i }));
    if (b === 2) { at(500, () => host.setLive({ cs: 1 })); at(1900, () => host.setLive({ cs: 2 })); }
  }
  if (s === S_CF && b === 3) for (let i = 1; i <= PC_END; i++) at(400 + i * 800, () => host.setLive({ pc: i }));
}

/** Stepping back from the automatic boot returns to standby (it would otherwise auto-advance again). */
export const prev = ({ scene, beat }: Position) => (scene === 0 && beat > 0 ? { scene: 0, beat: 0 } : undefined);
