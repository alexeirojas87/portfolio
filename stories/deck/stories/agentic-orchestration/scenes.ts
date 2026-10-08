import type { SceneDef } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/**
 * Beat map: 9 scenes, 36 beats, one click each (about 2 minutes clicked through, automatic beats included).
 * `auto: true` = the beat moves by itself (timeline in live.ts) or counts (self-contained CountUp).
 * `ref` = JSON path(s) in src/content/projects/agentic-orchestration.json (mirrored in docs/CONTENT-AUDIT.md);
 * `note` = cue shown in the presenter view only.
 */
export const SCENES: SceneDef[] = [
  {
    id: '01', title: tr(copy.scene.open),
    beats: [
      { name: 'standby', ref: '-', note: 'Black screen with a quiet mark. The first click starts the story.' },
      { name: 'boot terminal', auto: true, ref: 'summary (phase names); illustrative command', note: 'Types a command, hard cut, then moves on to the title by itself.' },
      { name: 'title', ref: 'title, tagline' },
    ],
  },
  {
    id: '02', title: tr(copy.scene.problem),
    beats: [
      { name: 'teams wanted LLM-assisted delivery', ref: 'problem' },
      { name: 'four things agents could not be allowed to do', auto: true, ref: 'problem', note: 'A 4 counts up, the four refusals stagger in.' },
      { name: 'auditable, resumable, governed', ref: 'problem' },
    ],
  },
  {
    id: '03', title: tr(copy.scene.idea),
    beats: [
      { name: 'agents do the work', ref: 'summary' },
      { name: 'humans decide', ref: 'summary' },
      { name: 'four role-specific agents', ref: 'architecture.glance[0]; nodes defagent, qaagent, devagent, reviewagent' },
    ],
  },
  {
    id: '04', title: tr(copy.scene.lifecycle),
    beats: [
      { name: 'ready signal, state persisted', auto: true, ref: 'edges e1, e3; node runstore; flow-lifecycle', note: 'A packet leaves the work tracker, reaches the orchestrator, state is written to the store.' },
      { name: 'definition, then QA planning', auto: true, ref: 'edges e4, e5; nodes defagent, qaagent' },
      { name: 'plan gate: awaiting approval, approved', auto: true, ref: 'edges e6, e18, e19; node devagent details.what; node portal', note: 'The packet stops at the portal with a pulse; it approves and continues.' },
      { name: 'review, rework arc', auto: true, ref: 'edge e7; node reviewagent; decisions[3]', note: 'The correction arc plays once.' },
      { name: 'pull request, CI fails, CI fixed', auto: true, ref: 'edge e20; flow-lifecycle; highlights[0] (CI monitoring and fixing)' },
      { name: 'final gate', auto: true, ref: 'edges e2, e18, e19; nodes chat, portal; highlights[6]' },
      { name: 'crash, resume from the store', auto: true, ref: 'edge e3; highlights[0]; decisions[1]' },
    ],
  },
  {
    id: '05', title: tr(copy.scene.cerberus),
    beats: [
      { name: 'prompt types out', auto: true, ref: 'highlights[2]; ILLUSTRATIVE fake prompt', note: 'Fake secrets on purpose.' },
      { name: 'Cerberus scans', auto: true, ref: 'highlights[2]; ILLUSTRATIVE' },
      { name: 'redacted, blocked before leaving', auto: true, ref: 'highlights[2]; decisions[2]; ILLUSTRATIVE' },
      { name: 'a clean prompt passes', auto: true, ref: 'decisions[2]; ILLUSTRATIVE' },
    ],
  },
  {
    id: '06', title: tr(copy.scene.gateway),
    beats: [
      { name: 'requests flow into the gateway', auto: true, ref: 'edge e13; node gateway; decisions[0]; highlights[1]', note: 'The camera pans right from the lifecycle; four roles stream in.' },
      { name: 'rate limit per role', auto: true, ref: 'highlights[1]; ILLUSTRATIVE numbers', note: 'Counters are self-contained (CountUp).' },
      { name: 'scan, primary fails, fallback', auto: true, ref: 'edges e14, e15; node provider; highlights[1]' },
      { name: 'response scanned, audited', auto: true, ref: 'edges e16, e13; nodes safety, audit; highlights[1]' },
    ],
  },
  {
    id: '07', title: tr(copy.scene.tools),
    beats: [
      { name: 'map: orchestrator, gateway, tools', ref: 'decisions[0]; nodes of both views', note: 'The camera zooms out over the same world.' },
      { name: 'MCP hub, enforced server-side', ref: 'edges e8, e9, e10, e11, e12; node mcp; decisions[4]' },
      { name: 'tools called one at a time', auto: true, ref: 'flow-dev-tools; nodes vector, indexer, workspace, ado' },
      { name: 'code graph', ref: 'edge e12; node indexer; highlights[4]; decisions[5]' },
    ],
  },
  {
    id: '08', title: tr(copy.scene.decisions),
    beats: [0, 1, 2, 3, 4, 5].map((i) => ({ name: `decision ${i + 1}`, ref: `decisions[${i}]` })),
  },
  {
    id: '09', title: tr(copy.scene.summary),
    beats: [
      { name: 'four facts', auto: true, ref: 'architecture.glance[0..3]', note: 'The 4 counts up.' },
      { name: 'closing', ref: 'problem (challenge sentence); tagline', note: 'Callback to the problem scene: the same three words, now answered.' },
    ],
  },
];
