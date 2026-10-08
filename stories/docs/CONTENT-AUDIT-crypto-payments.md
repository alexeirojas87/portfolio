# Content audit: crypto-payments (8 scenes, 29 beats)

Source of truth: `src/content/projects/crypto-payments.json` (both architecture views). Node, edge, decision and
title text is read from it by the deck. Same legend and rules as `CONTENT-AUDIT.md`: **V** verbatim, **C** condensed,
**A** authored UI words restating a JSON fact, **I** illustrative. No company names, people, vendors or domains.

The one figure not in the JSON is the public resume metric "20% faster transaction processing", shown on beat 8.1
and attributed on stage to the blockchain adoption work.

| Beat | On stage | JSON source | Kind |
| --- | --- | --- | --- |
| 1.1 | Standby: black, a quiet mark | none | A |
| 1.2 | Boot terminal: a request, three states, acknowledged (automatic) | `highlights[1]`, edges `e2`, `e3`; the command itself | I |
| 1.3 | Title, tagline, start hint | `title`, `tagline` | V |
| 2.1 | Merchants wanted any cryptocurrency; four chips (Bitcoin, Ethereum, Litecoin, and more); no blockchain integrations | `problem`, `summary` | C |
| 2.2 | On-chain is slow and can fail: a request waits on a lane, then breaks (automatic) | `problem`; the wait animation | C, I |
| 2.3 | Accept reliably, execute safely, tell clients, the moment the outcome is final | `problem` (last sentence) | C |
| 3.1 | Checkout sends a payment request to the API | edge `e1`; node `merchant` | C |
| 3.2 | API validates, payment stored as pending | edge `e2`; node `api` details; node `db` | C |
| 3.3 | Request enqueued on RabbitMQ | edge `e3`; node `reqq` | C |
| 3.4 | Acknowledged at once; "instant" against "minutes" | `highlights[1]`; node `api` why; `highlights[3]` (minutes) | C |
| 3.5 | The queue absorbs bursts: a request stream, queue depth | `decisions[0].why`; depth dots | C, I |
| 4.1 | Executor consumes, signs with the user's wallet | edges `e4`, `e5`; node `executor` details | C |
| 4.2 | One adapter per coin (BTC, ETH, LTC), broadcast through the node | edges `e6`, `e7`; node `adapters`; `highlights[5]` | C |
| 4.3 | Hash and submitted status recorded; executor free | edge `e8`; node `executor` responsibilities; hash text | C, I |
| 4.4 | A message that keeps failing goes to the dead-letter queue | edge `e9`; node `dlq`; `decisions[0].why` | C |
| 5.1 | Terminal: first delivery of a message, paid once | `highlights[2]`; `decisions[1].why`; key and hash text | C, I |
| 5.2 | The same message is redelivered | `decisions[1].why` ("at-least-once") | C, I |
| 5.3 | Absorbed at the key check, never paid twice; counter stays 1 | `highlights[2]`; `decisions[1].why` | C, I |
| 6.1 | Watcher polls the nodes for confirmations; counter 1/3 to 3/3 | edges `e10`, `e11`; node `watcher`; `highlights[3]` | C, I (counter) |
| 6.2 | Marked confirmed in the store, payment-confirmed event published | edges `e12`, `e13`; nodes `db`, `evtq` | C |
| 6.3 | Notifier consumes the event and pushes over SignalR | edges `e14`, `e15`; node `notifier`; `highlights[4]` | C |
| 6.4 | Push versus polling lanes | `decisions[3].why`; tick timing | C, I |
| 7.1 to 7.5 | One beat per decision: index, title (two lines), "why" verbatim, drawn vignette | `decisions[0..4]` | V (vignettes: A) |
| 8.1 | 20% counts up with attribution, beside the four glance facts | resume metric; `architecture.glance[0..3]` | V, C |
| 8.2 | Closing: accepted instantly, confirmed safely, pushed live; tagline | `highlights`; `tagline` | A, V |

## Illustrative items (never presented as data)

- Boot command and its three state words (1.2).
- The wait-then-fail lane (2.2): no duration is claimed beyond the JSON's "can take minutes".
- Queue depth dots and the request burst (3.5, 4.x): counts are not data.
- Transaction hash `9c4e…demo` and message key `pay-demo-001` (4.3, 5.x): fake on purpose, no real address or hash anywhere.
- The confirmation counter 1/3 to 3/3 (6.1), labelled "illustrative" on stage. The JSON gives no confirmation threshold.
- The push versus polling lanes (6.4): ticks are illustrative time, labelled on stage; three polls are drawn only to contrast the idea.
- The redelivered message and the dead-letter failure (4.4, 5.x) are staged to show behaviour the JSON describes.

## Decisions on the speaker's behalf

- The 20% metric is the only external figure; it is attributed and the word "metric" is not turned into a claim about how it was measured.
- Both JSON views are laid out as one row; the payments store appears once per view, as in the JSON. Node `merchant` also appears at both ends.
- Minimum stage text is 28 px.
