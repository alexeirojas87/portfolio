/**
 * The exact text of the Cerberus demo: ONE module, character for character the same as
 * docs/cerberus-prompts.md (`npm run verify -- --source=docs/cerberus-prompts.md` checks it).
 * ILLUSTRATIVE: every secret and address below is fake on purpose (hunter2, example.com, sk-test-XXXX).
 */
export const PROMPT_HEAD = '$ agent.complete --role dev';

/** The prompt that gets blocked. */
export const BLOCKED: string[] = [
  PROMPT_HEAD,
  'task: add retry to the export job',
  'db_password=hunter2',
  'notify jane@example.com',
  'api_key=sk-test-XXXX',
];

/** The same prompt after Cerberus redacted what it detected. */
export const REDACTED: string[] = [
  PROMPT_HEAD,
  'task: add retry to the export job',
  'db_password=[REDACTED]',
  'notify [REDACTED]',
  'api_key=[REDACTED]',
];

/** A prompt with nothing sensitive in it. */
export const CLEAN: string[] = [
  PROMPT_HEAD,
  'task: add retry to the export job',
  'context: code-graph summary',
];

/** What the detector flags: substring of the BLOCKED line, and the label key. */
export const FLAGS = [
  { line: 2, text: 'hunter2', label: 'credential' },
  { line: 3, text: 'jane@example.com', label: 'pii' },
  { line: 4, text: 'sk-test-XXXX', label: 'secret' },
] as const;

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
