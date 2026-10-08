/**
 * The exact text of the idempotency demo: ONE module, scenes import it and never retype it.
 * ILLUSTRATIVE: the key (pay-demo-001) and the transaction hash (9c4e…demo) are fake on purpose.
 */
export const KEY = 'pay-demo-001';
export const CONSUME = `$ consume payment key=${KEY}`;

/** First delivery (lines 0-2) and the redelivery (lines 3-4). */
export const FIRST: string[] = [CONSUME, '> new key: sign and broadcast', '> submitted · tx 9c4e…demo'];
export const AGAIN: string[] = [CONSUME, '> key already submitted: ack, skip'];
export const ALL: string[] = [...FIRST, ...AGAIN];
/** The substring of the last line the detector marks. */
export const SKIPPED = 'ack, skip';

/** Lines revealed by `chars` typed characters, one line after the other. */
export function typed(lines: readonly string[], chars: number): string[] {
  let left = chars;
  return lines.map((l) => {
    const n = Math.max(0, Math.min(l.length, left));
    left -= l.length;
    return l.slice(0, n);
  });
}

export const total = (lines: readonly string[]) => lines.reduce((n, l) => n + l.length, 0);
