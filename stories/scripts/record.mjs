// Records the automatic beats as screen videos (Playwright, 1920x1080) into artifacts/rec/.
//   node scripts/record.mjs [dist=dist] [--lang=en] [--story=agentic-orchestration]
// One clip per automatic scene; the clip table is per story (CLIPS below).
// Not part of beatdeck: a portfolio addition, for reviewing motion by eye (verify only compares settled frames).
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { launchBrowser, startServer, sleep } from './lib.mjs';

const args = process.argv.slice(2);
const DIST = args.find((a) => !a.startsWith('--')) ?? 'dist';
const LANG = args.find((a) => a.startsWith('--lang='))?.slice(7) ?? 'en';
const STORY = args.find((a) => a.startsWith('--story='))?.slice(8) ?? 'agentic-orchestration';
const OUT = process.env.REC_OUT ?? 'artifacts/rec';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// how long to watch each beat (ms): its automatic motion plus a short rest
const CLIPS_BY_STORY = {
  'agentic-orchestration': {
    lifecycle: { start: '#3.3', waits: [800, 5200, 6400, 7000, 6600, 6200, 4600, 3200] },
    cerberus: { start: '#4.7', waits: [800, 4400, 4600, 4000, 6200] },
    gateway: { start: '#5.4', waits: [800, 4600, 4200, 8200, 5600] },
    tools: { start: '#6.4', waits: [800, 3200, 3200, 7600, 3000] },
  },
  // start = the beat before the first one recorded (one ArrowRight per wait after the first)
  'crypto-payments': {
    intake: { start: '#2.3', waits: [800, 3000, 3000, 3000, 3600, 6200] },
    execution: { start: '#3.5', waits: [800, 4000, 5000, 4000, 7000] },
    idempotency: { start: '#4.4', waits: [800, 3600, 3400, 4600] },
    confirmation: { start: '#5.4', waits: [800, 8200, 4600, 4200, 8200] },
  },
};
const CLIPS = CLIPS_BY_STORY[STORY];
if (!CLIPS) { console.error(`record: no clips defined for story "${STORY}"`); process.exit(1); }

const { base, stop } = await startServer({ dist: DIST, port: 4188 });
const browser = await launchBrowser();
for (const [name, c] of Object.entries(CLIPS)) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: `${OUT}/tmp-${name}`, size: { width: 1920, height: 1080 } } });
  const page = await ctx.newPage();
  await page.goto(`${base}?story=${STORY}&lang=${LANG}${c.start}`);
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  await sleep(c.waits[0]);
  for (const w of c.waits.slice(1)) {
    await page.keyboard.press('ArrowRight');
    await sleep(w);
  }
  await ctx.close(); // flushes the video
  const f = readdirSync(`${OUT}/tmp-${name}`)[0];
  renameSync(`${OUT}/tmp-${name}/${f}`, `${OUT}/${STORY === 'agentic-orchestration' ? '' : STORY + '-'}${name}-${LANG}.webm`);
  rmSync(`${OUT}/tmp-${name}`, { recursive: true });
  console.log(`✓ recorded ${name}`);
}
await browser.close();
await stop();
