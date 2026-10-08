import type { SceneDef } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/**
 * Beat map: 8 scenes, 29 beats, one click each (about 2 minutes clicked through, automatic beats included).
 * `auto: true` = the beat moves by itself (timeline in live.ts) or counts (self-contained CountUp).
 * `ref` = JSON path(s) in src/content/projects/wagering-platform.json (mirrored in docs/CONTENT-AUDIT-wagering-platform.md);
 * `note` = cue shown in the presenter view only.
 */
export const SCENES: SceneDef[] = [
  {
    id: '01', title: tr(copy.scene.open),
    beats: [
      { name: 'standby', ref: '-', note: 'Black screen with a quiet mark. The first click starts the story.' },
      { name: 'boot terminal', auto: true, ref: 'tagline (stages); ILLUSTRATIVE command', note: 'Types a command, hard cut, then moves on to the title by itself.' },
      { name: 'title', ref: 'title, tagline' },
    ],
  },
  {
    id: '02', title: tr(copy.scene.problem),
    beats: [
      { name: 'one monolithic synchronous path', ref: 'problem (first clause)' },
      { name: 'three things it could not do', auto: true, ref: 'problem', note: 'A 3 counts up, the three failures stagger in.' },
      { name: 'decouple, keep order, keep the ledger', ref: 'problem (second sentence)' },
    ],
  },
  {
    id: '03', title: tr(copy.scene.path),
    beats: [
      { name: 'bet reaches the API, "received"', auto: true, ref: 'edge e1; nodes web, api', note: 'Peak traffic streams in, then one bet walks the path.' },
      { name: 'published, keyed by player', auto: true, ref: 'edge e2; node kvalid' },
      { name: 'validate only: freshness, odds, limits, history', auto: true, ref: 'edges e3, e6, e7; node core', note: 'The camera pans right with the bet. Checks tick one by one.' },
      { name: 'idempotent hand-off', auto: true, ref: 'edge e21; node liveapi details.what' },
      { name: 'the live API inserts', auto: true, ref: 'edge e24; node liveapi details.what; node livedb' },
    ],
  },
  {
    id: '04', title: tr(copy.scene.one),
    beats: [
      { name: 'same player, same lane', auto: true, ref: 'node kvalid details; decisions[0].why', note: 'ILLUSTRATIVE labels A1, A2.' },
      { name: 'one at a time, under a lock', auto: true, ref: 'node livedb details (exclusive lock, 5 s); highlights[2]' },
      { name: 'the second sees the first', auto: true, ref: 'decisions[2].why' },
      { name: 'a duplicate id is absorbed', auto: true, ref: 'node liveapi details.what (replay returns existing id); highlights[3]' },
    ],
  },
  {
    id: '05', title: tr(copy.scene.limits),
    beats: [
      { name: 'a pure library', auto: true, ref: 'node limits details; decisions[1].why' },
      { name: 'caps evaluated', auto: true, ref: 'node limits responsibilities; ILLUSTRATIVE numbers', note: 'Meters are self-contained (CountUp).' },
      { name: 'over the cap, rejected', auto: true, ref: 'node limits what (violation codes); node core (fails closed); ILLUSTRATIVE numbers' },
    ],
  },
  {
    id: '06', title: tr(copy.scene.rt),
    beats: [
      { name: 'every stage reports its state', auto: true, ref: 'edge e13; node knotify details', note: 'The six states light up as they are published.' },
      { name: 'one hub pushes to the player', auto: true, ref: 'edges e15, e16; node hub; decisions[3].why' },
      { name: 'traces and metrics', auto: true, ref: 'edge e19; node obs' },
      { name: 'one wager, followed across stages', auto: true, ref: 'node obs details (trace context in headers)' },
    ],
  },
  {
    id: '07', title: tr(copy.scene.decisions),
    beats: copy.decisionIdx.map((di, i) => ({ name: `decision ${i + 1}`, ref: `decisions[${di}]` })),
  },
  {
    id: '08', title: tr(copy.scene.outcome),
    beats: [
      { name: 'four public metrics', auto: true, ref: 'resume (public metrics), not in the JSON', note: 'Attributed to the modernization as a whole.' },
      { name: 'closing', ref: 'tagline; decisions', note: 'Decoupled. Ordered. Idempotent.' },
    ],
  },
];
