# Content audit

Source of truth for every story: the project's JSON in `src/content/projects/<slug>.json` (this deck reads node and
edge text, decision text, title, tagline and glance straight from it). Nothing outside that file is stated.
No company names, people, ticket ids, repo names or domains appear on stage. Generic technology names and
"Cerberus" are allowed. Spanish is neutral and professional.

Legend: **V** verbatim from the JSON, **C** condensed or split from JSON sentences, **A** authored rhythm only
(scene labels, short headlines) that restate a JSON fact.

## agentic-orchestration (8 scenes, 29 beats)

| Beat | On stage | JSON source | Kind |
| --- | --- | --- | --- |
| 1.1 | Poster: title, tagline, start hint | `title`, `tagline` | V |
| 2.1 | Teams wanted LLM-assisted delivery | `problem` (first clause) | C |
| 2.2 | Could not allow agents to: talk to providers directly, leak sensitive data in prompts, hold unrestricted repo/backlog access, lose work on a crash | `problem` | C |
| 2.3 | Auditable. Resumable. Governed. / not a chain of ad hoc prompts | `problem` (challenge sentence) | C |
| 3.1 | Agents do the work: requirements, QA planning, development, adversarial review, CI repair | `summary` | C |
| 3.2 | Humans decide: approval gates at every critical step | `summary` | C |
| 3.3 | Four role-specific agents (4 nodes) | `architecture.glance[0]`; nodes `defagent`, `qaagent`, `devagent`, `reviewagent` | V |
| 4.1 | A ready signal starts a run | edge `e1`, `flow-lifecycle`, node `ado` details | C |
| 4.2 | State survives restarts: phase, pending work, lease | edge `e3`, node `runstore`, `highlights[0]` | C |
| 4.3 | Definition, then QA planning | edges `e4`, `e5` | C |
| 4.4 | A plan a human approves, then development | edge `e6`, node `devagent` details | C |
| 4.5 | Review, rework, escalate (bounded iterations) | edge `e7`, `decisions[3].why` | C |
| 4.6 | Pull request published, CI watched | edge `e20`, `flow-lifecycle` description | C |
| 4.7 | A person approves each gate (portal or chat cards) | edges `e2`, `e18`, `e19`; `highlights[6]`; `decisions[1].why` | C |
| 5.1 | One path for every model call | edge `e13`, node `gateway` details, `decisions[0].why` | C |
| 5.2 | Cerberus scans the prompt before it leaves | edge `e14`, `highlights[2]`, `decisions[2].why` | C |
| 5.3 | Routed by role, with fallback | edge `e15`, node `provider` details, `highlights[1]` | C |
| 5.4 | Response scanned, every call audited | edge `e16`, nodes `safety` and `audit` details | C |
| 6.1 | Tools live on the MCP server | edges `e8`, `e9`, `decisions[4].why` | C |
| 6.2 | Isolated builds, episodic memory | edges `e10`, `e11`, nodes `workspace`, `vector` details | C |
| 6.3 | Context from a code graph | edge `e12`, `highlights[4]`, `decisions[5].why` | C |
| 7.1 to 7.6 | One beat per decision: title (split in two lines) and "why" | `decisions[0..5]` title and why | V |
| 8.1 | Four facts | `architecture.glance[0..3]` | V |
| 8.2 | Closing callback: same three words + tagline | `problem`, `tagline` | C |

Diagram labels, sublabels, tech tags and kind colours come from the node data of both views
("Agent lifecycle" and "AI infrastructure"). Arrows are the JSON edges; async edges show the flow dashes.

### Deliberately cut

- `outcome` is `null` in the JSON, so there is no "results" scene and no numbers are claimed.
- Stack list, `links`, `role`, `year`: on the project page already, not part of the explanation.
- Node `details.responsibilities`: too granular for a 90 s story; they stay on the site's node panel.
- Highlight 5 (container workspace worker and browser test runner) beyond the sandbox beat 6.2.

### Fidelity checks in code

`deck/stories/agentic-orchestration/copy.ts` throws at load if the poster title or any decision title
(en or es, lines joined by a space) differs from the JSON, and `shared/arch.ts` throws on an unknown node or edge id.
`npm run verify` therefore fails if the data and the story drift apart.

### Decisions taken on the owner's behalf

- Beat 1.1 is the poster (title and tagline) rather than a black standby, so the embedded frame is meaningful before the first click.
- Light cobalt (`#9db8ff`) is used for accent text; cobalt `#2f5bea` for fills and lines (contrast on navy).
- Decision "why" text is shown in full (up to ~270 characters) rather than shortened, to avoid rewording the claims.
