import type { SceneDef } from 'beatdeck';
import { tr } from '../../shared/lang';
import { copy } from './copy';

/**
 * Beat map: 8 scenes, 29 beats, one click each (about 90 s clicked through).
 * `ref` = JSON path(s) in src/content/projects/agentic-orchestration.json (mirrored in docs/CONTENT-AUDIT.md);
 * `note` = cue shown in the presenter view only.
 */
export const SCENES: SceneDef[] = [
  {
    id: '01', title: tr(copy.scene.open),
    beats: [
      { name: 'poster', ref: 'title, tagline', note: 'Poster frame: this is what the project page shows before the first click.' },
    ],
  },
  {
    id: '02', title: tr(copy.scene.problem),
    beats: [
      { name: 'teams wanted LLM-assisted delivery', ref: 'problem' },
      { name: 'what agents could not be allowed to do', ref: 'problem', note: 'The four items stagger in on this one click.' },
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
      { name: 'ready signal', ref: 'edge e1; nodes ado, orchestrator; flow-lifecycle' },
      { name: 'persisted state', ref: 'edge e3; node runstore; highlights[0]' },
      { name: 'definition and QA planning', ref: 'edges e4, e5; nodes defagent, qaagent' },
      { name: 'plan, approval, development', ref: 'edge e6; node devagent details.what' },
      { name: 'review and rework', ref: 'edge e7; node reviewagent; decisions[3]' },
      { name: 'pull request and CI', ref: 'edge e20; flow-lifecycle' },
      { name: 'human gates', ref: 'edges e2, e18, e19; nodes chat, portal; highlights[6]; decisions[1]' },
    ],
  },
  {
    id: '05', title: tr(copy.scene.gateway),
    beats: [
      { name: 'one path for every model call', ref: 'edge e13; node gateway; decisions[0]' },
      { name: 'scanned before it leaves', ref: 'edge e14; node safety; highlights[2]; decisions[2]' },
      { name: 'routed by role, with fallback', ref: 'edge e15; node provider; highlights[1]' },
      { name: 'response scanned, call audited', ref: 'edge e16; node audit; node safety details' },
    ],
  },
  {
    id: '06', title: tr(copy.scene.tools),
    beats: [
      { name: 'tools live on the MCP server', ref: 'edges e8, e9; nodes mcp, ado; decisions[4]' },
      { name: 'sandbox and vector memory', ref: 'edges e10, e11; nodes workspace, vector' },
      { name: 'code graph', ref: 'edge e12; node indexer; highlights[4]; decisions[5]' },
    ],
  },
  {
    id: '07', title: tr(copy.scene.decisions),
    beats: [0, 1, 2, 3, 4, 5].map((i) => ({ name: `decision ${i + 1}`, ref: `decisions[${i}]` })),
  },
  {
    id: '08', title: tr(copy.scene.summary),
    beats: [
      { name: 'four facts', ref: 'architecture.glance[0..3]' },
      { name: 'closing', ref: 'problem (challenge sentence)', note: 'Callback to the problem scene: the same three words, now answered.' },
    ],
  },
];
