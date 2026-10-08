import type { SceneDef } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/**
 * Beat map: 8 scenes, 29 beats, one click each (about 100 s clicked through, automatic beats included).
 * `auto: true` = the beat moves by itself (timeline in live.ts) or counts (self-contained CountUp).
 * `ref` = JSON path(s) in src/content/projects/crypto-payments.json (mirrored in docs/CONTENT-AUDIT.md);
 * `note` = cue shown in the presenter view only.
 */
export const SCENES: SceneDef[] = [
  {
    id: '01', title: tr(copy.scene.open),
    beats: [
      { name: 'standby', ref: '-', note: 'Black screen with a quiet mark. The first click starts the story.' },
      { name: 'boot terminal', auto: true, ref: 'ILLUSTRATIVE command; states from highlights[1], edges e2, e3', note: 'Types a request, hard cut, then moves on to the title by itself.' },
      { name: 'title', ref: 'title, tagline' },
    ],
  },
  {
    id: '02', title: tr(copy.scene.problem),
    beats: [
      { name: 'merchants want any cryptocurrency', ref: 'problem; summary (Bitcoin, Ethereum, Litecoin and other)' },
      { name: 'on-chain is slow and can fail', auto: true, ref: 'problem; ILLUSTRATIVE wait', note: 'A request waits on a lane, then breaks.' },
      { name: 'accept, execute, tell', ref: 'problem (last sentence)' },
    ],
  },
  {
    id: '03', title: tr(copy.scene.intake),
    beats: [
      { name: 'checkout calls the API', auto: true, ref: 'edge e1; node merchant', note: 'A packet leaves the checkout and reaches the payment API.' },
      { name: 'validated, pending in the store', auto: true, ref: 'edge e2; node api details; node db', note: 'The camera sits on the left of the world.' },
      { name: 'enqueued on RabbitMQ', auto: true, ref: 'edge e3; node reqq' },
      { name: 'acknowledged at once', auto: true, ref: 'highlights[1]; node api details.why', note: 'The green acknowledgement returns while the chain has not started.' },
      { name: 'the queue absorbs bursts', auto: true, ref: 'decisions[0].why; node reqq; ILLUSTRATIVE depth', note: 'Queue depth dots are illustrative.' },
    ],
  },
  {
    id: '04', title: tr(copy.scene.execution),
    beats: [
      { name: 'consume, sign with the wallet', auto: true, ref: 'edges e4, e5; node executor details', note: 'The camera pans right.' },
      { name: 'one adapter per coin, broadcast', auto: true, ref: 'edges e6, e7; node adapters; highlights[5]' },
      { name: 'hash recorded, submitted', auto: true, ref: 'edge e8; node executor responsibilities; ILLUSTRATIVE hash' },
      { name: 'failures to the dead-letter queue', auto: true, ref: 'edge e9; node dlq; decisions[0].why' },
    ],
  },
  {
    id: '05', title: tr(copy.scene.idempotent),
    beats: [
      { name: 'first delivery, paid once', auto: true, ref: 'highlights[2]; decisions[1].why; ILLUSTRATIVE key and hash', note: 'Fake key and hash on purpose.' },
      { name: 'the same message returns', auto: true, ref: 'decisions[1].why (at-least-once); ILLUSTRATIVE' },
      { name: 'absorbed, never twice', auto: true, ref: 'highlights[2]; decisions[1].why; ILLUSTRATIVE' },
    ],
  },
  {
    id: '06', title: tr(copy.scene.confirmation),
    beats: [
      { name: 'the watcher polls the chain', auto: true, ref: 'edges e10, e11; node watcher; highlights[3]; ILLUSTRATIVE 1/3 to 3/3', note: 'The camera pans to the confirmation view. The counter is illustrative.' },
      { name: 'confirmed, event published', auto: true, ref: 'edges e12, e13; nodes db, evtq' },
      { name: 'the notifier pushes over SignalR', auto: true, ref: 'edges e14, e15; node notifier; highlights[4]' },
      { name: 'push versus polling', auto: true, ref: 'decisions[3].why; ILLUSTRATIVE timing', note: 'Ticks are illustrative time.' },
    ],
  },
  {
    id: '07', title: tr(copy.scene.decisions),
    beats: [0, 1, 2, 3, 4].map((i) => ({ name: `decision ${i + 1}`, ref: `decisions[${i}]` })),
  },
  {
    id: '08', title: tr(copy.scene.outcome),
    beats: [
      { name: '20% and four facts', auto: true, ref: 'architecture.glance[0..3]; resume metric (20% faster transaction processing)', note: 'The 20% counts up. Public resume metric, blockchain adoption work.' },
      { name: 'closing', ref: 'tagline', note: 'Accepted instantly, confirmed safely, pushed live.' },
    ],
  },
];
