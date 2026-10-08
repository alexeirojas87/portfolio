# Content audit

Source of truth for every story: the project's JSON in `src/content/projects/<slug>.json` (this deck reads node and
edge text, decision text, title, tagline and glance straight from it). Nothing outside that file is stated as a fact.
No company names, people, ticket ids, repo names or domains appear on stage. Generic technology names and
"Cerberus" are allowed. Spanish is neutral and professional.

Legend: **V** verbatim from the JSON, **C** condensed or split from JSON sentences, **A** authored UI words or rhythm that
restate a JSON fact, **I** illustrative (invented to make a mechanism visible; labelled as such, never presented as data).

## agentic-orchestration (9 scenes, 36 beats)

| Beat | On stage | JSON source | Kind |
| --- | --- | --- | --- |
| 1.1 | Standby: black, a quiet mark | none | A |
| 1.2 | Boot terminal types a command, then the phase names, hard cut (automatic) | `summary` (phase names); the command itself | I |
| 1.3 | Title, tagline, start hint | `title`, `tagline` | V |
| 2.1 | Teams wanted LLM-assisted delivery | `problem` (first clause) | C |
| 2.2 | A 4 counts up; four refusals: providers directly, leak sensitive data, unrestricted repo/backlog, lose work on a crash | `problem` (the four items; 4 = their count) | C |
| 2.3 | Auditable. Resumable. Governed. / not a chain of ad hoc prompts | `problem` (challenge sentence) | C |
| 3.1 | Agents do the work: five jobs as chips | `summary` (requirements, QA planning, development, adversarial review, CI repair) | C |
| 3.2 | Humans decide; an approval gate draws itself | `summary` ("human approval gates at every critical step") | C |
| 3.3 | Four role-specific agents (4 nodes) | `architecture.glance[0]`; nodes `defagent`, `qaagent`, `devagent`, `reviewagent` | V |
| 4.1 | Packet: work tracker to orchestrator; state written to the store (automatic) | edges `e1`, `e3`; node `runstore`; `flow-lifecycle` | C |
| 4.2 | Packet visits definition, then QA planning (automatic) | edges `e4`, `e5` | C |
| 4.3 | Plan drafted, packet stops at the portal ("Awaiting approval" pulse), approves, continues (automatic) | edges `e6`, `e18`, `e19`; node `devagent` details (plan waits for approval); node `portal` | C |
| 4.4 | Review, rework arc back to dev once, review again (automatic) | edge `e7`; `decisions[3].why` (structured rework, bounded iterations) | C |
| 4.5 | Pull request published, CI fails, goes back to dev, CI passes (automatic) | edge `e20`; `flow-lifecycle`; `highlights[0]` ("CI monitoring and fixing") | C |
| 4.6 | Final gate: portal awaits and approves; chat node appears | edges `e2`, `e18`, `e19`; `highlights[6]` (portal and chat cards) | C |
| 4.7 | Orchestrator crash flash, resume from the store (automatic) | edge `e3`; `highlights[0]` ("resume exactly where they stopped"); `decisions[1].why` | C |
| 5.1 | A fake prompt types out in a terminal (automatic) | `highlights[2]` (Cerberus runs in process before a request leaves); prompt text | I |
| 5.2 | Beam scans it; credential, personal data and secret key are marked (automatic) | `highlights[2]` (secrets, credentials, personal or payment data) | C |
| 5.3 | Redacted, "BLOCKED before leaving the trust boundary" (automatic) | `highlights[2]`, `decisions[2].why` | C |
| 5.4 | A clean prompt types out and passes (automatic) | `decisions[2].why` (rules are shared data, evolve without redeploying) | C |
| 6.1 | Camera pans to the gateway; requests from the role agents stream in | edge `e13`; node `gateway`; `decisions[0].why`; `highlights[1]` (role-based routing) | C |
| 6.2 | Per-role meters count up to their limit; one hits "Limit" (automatic) | `highlights[1]` ("per-role rate limiting"); the numbers | I |
| 6.3 | Scan, primary provider fails (red), fallback answers (automatic) | edges `e14`, `e15`; node `provider` (primary, fallback, self-hosted); `highlights[1]` (fallback with circuit breaking) | C |
| 6.4 | Response comes back, scanned again, written to audit, delivered (automatic) | edges `e16`, `e13`; nodes `safety`, `audit`; `highlights[1]` | C |
| 7.1 | Camera zooms out over the whole world | `decisions[0].why`; nodes of both views | C |
| 7.2 | MCP hub and its orbit of tools | edges `e8` to `e12`; node `mcp`; `decisions[4].why` | C |
| 7.3 | Tools light up as called: memory, code graph, workspace, work tracking (automatic) | `flow-dev-tools` | C |
| 7.4 | Code graph highlighted | edge `e12`; node `indexer`; `highlights[4]`; `decisions[5].why` | C |
| 8.1 to 8.6 | One beat per decision: index, title (two lines), "why" verbatim, drawn vignette | `decisions[0..5]` title and why | V (vignettes: A) |
| 9.1 | A 4 counts up with its caption, then the other three facts | `architecture.glance[0..3]` | V |
| 9.2 | Closing callback: same three words + tagline | `problem`, `tagline` | C |

Diagram labels, tech tags and kind colours come from the node data of both views ("Agent lifecycle" and
"AI infrastructure"). Wires are the JSON edges (dashed = async). Provider chips are the three words of the
`provider` sublabel. Edges from the definition, QA and review agents to the gateway are drawn like `e13`
(dev agent to gateway): the JSON states role-based routing and per-role limits (`highlights[1]`) and a gateway reusable
by any caller (`decisions[0]`), but draws only the dev edge.

### Illustrative content (not data)

- **Cerberus prompt** (`deck/stories/agentic-orchestration/prompts.ts`, mirrored in `docs/cerberus-prompts.md`):
  every secret and address is fake on purpose (`hunter2`, `jane@example.com`, `sk-test-XXXX`). Verified verbatim with
  `npm run verify -- --source=docs/cerberus-prompts.md`.
- **Rate-limit numbers** (6 / 10, 4 / 10, 15 / 20, 12 / 12): invented to show a meter. The JSON says per-role limits exist, not their values.
- **Boot command** (`$ agent run --item ready`): invented; the lines after it restate the JSON phases.
- The lifecycle order of the packet follows `flow-lifecycle`; the CI failure and the single rework arc are staged
  examples of "CI monitoring and fixing" and "structured rework with a bounded number of iterations".

### Deliberately cut

- `outcome` is `null` in the JSON, so there is no results scene and no numbers are claimed.
- Stack list, `links`, `role`, `year`: on the project page already, not part of the explanation.
- Node `details.responsibilities`: too granular for a 2 minute story; they stay on the site's node panel.
- Highlight 5 (container workspace worker, browser test runner) beyond the sandbox node in the tools orbit.

### Fidelity checks in code

`copy.ts` throws at load if the poster title or any decision title (en or es, lines joined by a space) differs from the JSON,
and `shared/arch.ts` throws on an unknown node or edge id. `npm run verify` therefore fails if the data and the story drift apart.

### Decisions taken on the owner's behalf

- The opening is a black standby, a typed boot terminal with a hard cut (as the site intro does: a terminal line, then the title).
- Light cobalt (`#9db8ff`) is used for accent text; cobalt `#2f5bea` for fills and lines (contrast on navy).
- Minimum stage text is 28 px (tech tags) and 34 px or more for labels and captions, so it stays above 18 px effective in the project page embed (about 0.5 to 0.7 scale).
- Decision "why" text is shown in full rather than shortened, to avoid rewording the claims.
- Tolerances: none. The canvas particle layer draws nothing in `?capture=1`, so verify frames are deterministic.
