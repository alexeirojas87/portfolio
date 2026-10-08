# Content audit: wagering-platform

Source of truth: `src/content/projects/wagering-platform.json` (the deck reads node text, decision titles and the poster title straight from it) plus four public resume metrics (beat 8.1). Nothing else is stated as fact. No company names, brands, domains, people, codenames or ticket ids appear on stage. Spanish is neutral and professional.

Legend: **V** verbatim from JSON, **C** condensed from JSON sentences, **A** authored UI word or rhythm that restates a JSON fact, **I** illustrative (invented to make a mechanism visible, labelled as such), **R** public resume metric.

Owner decisions respected: only the live path is shown (no pregame branch, no legacy-ledger path, no persistence worker); the validation service validates and never inserts; no ticket writer; no live-bet delay or re-queue.

## wagering-platform (8 scenes, 29 beats)

| Beat | On stage | JSON source | Kind |
| --- | --- | --- | --- |
| 1.1 | Standby: black, quiet mark | none | A |
| 1.2 | Boot terminal types a command and the stages, hard cut (automatic) | `tagline` (stages); command itself | I |
| 1.3 | Title, tagline, start hint | `title`, `tagline` | V |
| 2.1 | A monolithic, synchronous path; many bets converge on one box | `problem` (first clause) | C |
| 2.2 | A 3 counts up; cannot absorb peak traffic, no feedback while validating, limit rules hard to test or evolve | `problem` | C |
| 2.3 | Decouple. Keep order. Don't break the ledger. | `problem` (second sentence) | C |
| 3.1 | Peak traffic streams in; a bet reaches the API, "received" (automatic) | edge `e1`; nodes `web`, `api` details (answers "received" without waiting) | C |
| 3.2 | Bet published to the validation topic, keyed by player (automatic) | edge `e2`; node `kvalid` | C |
| 3.3 | Camera pans right; validate only: freshness, odds, limits, history ticks (automatic) | edges `e3`, `e6`, `e7`; node `core` (live batches) | C |
| 3.4 | Hand-off to the live engine's bet API with an idempotent id (automatic) | edge `e21`; node `liveapi` details | C |
| 3.5 | The live API inserts into the live database (automatic) | edge `e24`; node `liveapi` (serializable transaction) | C |
| 4.1 | Two bets of one player enter one partition lane (automatic) | node `kvalid` details; `decisions[0].why` | C (labels A1, A2: I) |
| 4.2 | First bet takes the per-player lock, second waits (automatic) | node `livedb` details (exclusive lock per tenant and player); `highlights[2]` | C |
| 4.3 | Second bet validates against fresh history after the first is inserted (automatic) | `decisions[2].why` | C |
| 4.4 | A duplicate id is absorbed: existing wager id returned, no second insert (automatic) | node `liveapi` details (replay returns the existing id); `highlights[3]` | C |
| 5.1 | A pure library, not a service (automatic) | node `limits` details; `decisions[1].why` | C |
| 5.2 | Three caps count up (automatic) | node `limits` responsibilities (per-pick, parlay, max-per-game; most restrictive merge) | C; numbers I |
| 5.3 | A bet over the per-game cap is rejected, fails closed (automatic) | node `limits` (violation codes); node `core` (fails closed) | C; numbers I |
| 6.1 | Stages publish state to the notification topic; six states light up (automatic) | edge `e13`; node `knotify` (states listed) | C |
| 6.2 | One hub fans out to the player over WebSocket (automatic) | edges `e15`, `e16`; node `hub`; `decisions[3].why` | C |
| 6.3 | Traces and metrics over OTLP (automatic) | edge `e19`; node `obs` | C |
| 6.4 | One id followed across stages (automatic) | node `obs` details (trace context in Kafka headers) | C |
| 7.1 to 7.5 | Index, title (two lines), "why", drawn vignette, for `decisions[0, 1, 2, 3, 5]` | `decisions[*]` | V titles; why V except 7.3 and 7.5 (C: one sentence each dropped, see below); vignettes A |
| 8.1 | Four metrics count up, attributed to the modernization as a whole (automatic) | resume: "30% less downtime", "60% faster", "+40% concurrent users", "50% faster response" | R |
| 8.2 | Closing: Decoupled. Ordered. Idempotent. + tagline | `decisions`, `tagline` | A |

Decision 4 (strangler-style wrapper around the legacy insertion path) is not shown: it describes the legacy insertion path, outside this live-only story. In 7.3 the sentence about the public pre-check endpoint is dropped, and in 7.5 the parenthesis naming the legacy API is dropped.

Diagram labels, tech tags and kind colours come from node data (`web`, `api`, `kvalid`, `core`, `limits`, `livedb`, `liveapi`, `knotify`, `hub`, `obs`). Wires are JSON edges (`e1`, `e2`, `e3`, `e6`, `e7`, `e21`, `e24`, `e13`, `e15`, `e16`, `e19`); dashed = async. The static pre-check edge (`e17`) is not drawn.

### Illustrative content (not data)

- **Boot terminal** (1.2): the command `bet place --live --player A` and `one player, one order`.
- **Player and bet labels** (4.x): "player A", tokens A1 and A2 are invented to show queueing.
- **Cap numbers** (5.2, 5.3): 25 / 50 per pick, 3 / 5 parlay, 80 / 100 then 120 / 100 per game are invented to show a meter; the JSON says per-pick, parlay and per-game caps exist, not their values. Marked "illustrative numbers" on stage.
- **Peak traffic stream** (3.1) and token motion are depictions, not measurements.
- **Notification states** (6.1) are the six names in `knotify` details; the order of lighting is authored.

### Metrics (not in the JSON)

The four metrics are the public resume figures, attributed to the modernization as a whole, never to a single component. They are not in `wagering-platform.json`; confirm they stay public before publishing.

### Text size

Every stage text is at least 28 px (verify warns below 18 px; authored minimum here is 28 px: badges and chips 30, node tech tag 28, vignette labels 30).

## Recordings

`node scripts/record.mjs dist --lang=en --story=wagering-platform` writes `artifacts/rec/wagering-platform-{path,player,limits,realtime}-en.webm` (beats 3.1-3.5, 4.1-4.4, 5.1-5.3, 6.1-6.4).
