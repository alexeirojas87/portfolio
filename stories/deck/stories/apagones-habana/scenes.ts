import type { SceneDef } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/**
 * Beat map: 8 scenes, 31 beats, one click each (about 2 minutes clicked through, automatic beats included).
 * `auto: true` = the beat moves by itself (timeline in live.ts) or counts (self-contained CountUp).
 * `ref` = JSON path(s) in src/content/projects/apagones-habana.json (mirrored in docs/CONTENT-AUDIT.md);
 * `note` = cue shown in the presenter view only.
 */
export const SCENES: SceneDef[] = [
  {
    id: '01', title: tr(copy.scene.open),
    beats: [
      { name: 'standby', ref: '-', note: 'Black screen, one flickering street light. The first click starts the story.' },
      { name: 'boot terminal', auto: true, ref: 'architecture nodes ingest, enrich; links.live; illustrative command', note: 'Types a command, hard cut, then moves on to the title by itself.' },
      { name: 'title', ref: 'title, tagline' },
    ],
  },
  {
    id: '02', title: tr(copy.scene.problem),
    beats: [
      { name: 'is there power on my block?', ref: 'architecture node users (what)', note: 'The question every resident has; the bulb flickers.' },
      { name: 'scattered across a channel', ref: 'problem; node tg (what)', note: 'Posts, comments and voice notes drift in (placeholder lines, no real text).' },
      { name: 'three things nobody could see', auto: true, ref: 'problem', note: 'A 3 counts up, the three missing views stagger in.' },
    ],
  },
  {
    id: '03', title: tr(copy.scene.pipeline),
    beats: [
      { name: 'every 30 minutes, tests first', auto: true, ref: 'additionalViews[watchdog] node cron; nodes gha; architecture.glance[0]; edge e1', note: 'The clock ticks, a packet reaches the pipeline runner, tests run and pass.' },
      { name: 'pull only what is new', auto: true, ref: 'nodes tg, ingest, db; edges e2, e3, e4; decisions[1]', note: 'The camera stays; boxes arrive as the packet walks.' },
      { name: 'rules read the posts first', auto: true, ref: 'node extract; edges e5, e6; decisions[3]' },
      { name: 'then the LLM fills the gaps', auto: true, ref: 'node enrich, llm; edges e21, e7, e8, e22; decisions[3]', note: 'Voice to text, structured parts, embeddings, one at a time.' },
      { name: 'tested, built, published', auto: true, ref: 'nodes build, pages, web; edges e9, e10, e11; highlights[0]' },
    ],
  },
  {
    id: '04', title: tr(copy.scene.map),
    beats: [
      { name: 'a map that answers at a glance', auto: true, ref: 'node web (what); node build (why); decisions[0]; ILLUSTRATIVE geometry', note: 'Ten zones light up one by one. Positions are illustrative.' },
      { name: 'zones go dark as notices land', auto: true, ref: 'node extract (events); decisions[3].why; ILLUSTRATIVE states', note: 'Four go dark, one turns unknown.' },
      { name: 'and come back, on the record', auto: true, ref: 'problem; node build (serie24h); node digest (hours history); ILLUSTRATIVE strip', note: 'Two relight; a 24 h strip of one illustrative circuit appears.' },
      { name: 'neighbors report, privately', ref: 'node pages (reports); highlights[5]; ILLUSTRATIVE dots' },
    ],
  },
  {
    id: '05', title: tr(copy.scene.assistant),
    beats: [
      { name: 'ask in plain words', auto: true, ref: 'additionalViews[assistant] nodes users, bot, tgapi (only text); ILLUSTRATIVE question', note: 'Camera drops to the assistant district; a sample question types out.' },
      { name: 'search by meaning', auto: true, ref: 'edge e16; node db (buscar_fragmentos); decisions[4]', note: 'pgvector search; three fragments come back.' },
      { name: 'answer from the data', auto: true, ref: 'edge e15; node bot (why); highlights[3]; ILLUSTRATIVE answer', note: 'The answer types out in the chat.' },
      { name: 'tools first, vectors last', ref: 'node bot (responsibilities); highlights[3]' },
    ],
  },
  {
    id: '06', title: tr(copy.scene.ops),
    beats: [
      { name: 'a watchdog outside GitHub', auto: true, ref: 'additionalViews[watchdog] node cron; edge e18; glance (45 min)', note: 'The camera pans to the watchdog district; the gauge shows the age of the data.' },
      { name: 'stale: cancel zombies, re-run', auto: true, ref: 'node cron (responsibilities); edges e19, e1; decisions[2]', note: 'The marker passes 45 min, a zombie run is cancelled, ingest is dispatched again.' },
      { name: 'still stale: raise the alarm', auto: true, ref: 'node cron (responsibilities, why); node gh; edge e23; glance (2 h)' },
      { name: 'Fridays: the weekly digest', auto: true, ref: 'additionalViews[operations] nodes digest, mail, gha; edges e28, e29', note: 'The camera drops to the operations district.' },
      { name: 'daily: the data audits itself', auto: true, ref: 'nodes verify, pages, gh; edges e30, e31, e32' },
    ],
  },
  {
    id: '07', title: tr(copy.scene.decisions),
    beats: [0, 1, 2, 3, 4].map((i) => ({ name: `decision ${i + 1}`, ref: `decisions[${i}]` })),
  },
  {
    id: '08', title: tr(copy.scene.outcome),
    beats: [
      { name: 'five facts', auto: true, ref: 'architecture.glance[0..4]', note: 'The 30 counts up.' },
      { name: 'closing and live address', ref: 'problem; links.live; tagline', note: 'Callback to the problem: what was missing, answered.' },
    ],
  },
];
