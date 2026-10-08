# Cerberus demo text (illustrative)

Source for `npm run verify -- --source=docs/cerberus-prompts.md`. Every secret and address is fake on purpose.
This file mirrors `deck/stories/agentic-orchestration/prompts.ts` character for character.

Blocked prompt:

$ agent.complete --role dev
task: add retry to the export job
db_password=hunter2
notify jane@example.com
api_key=sk-test-XXXX

After redaction:

$ agent.complete --role dev
task: add retry to the export job
db_password=[REDACTED]
notify [REDACTED]
api_key=[REDACTED]

Clean prompt:

$ agent.complete --role dev
task: add retry to the export job
context: code-graph summary

Boot lines (en):

$ agent run --item ready
> requirements · qa · dev · review · ci
> human gates armed

Boot lines (es):

$ agent run --item ready
> requisitos · qa · dev · revisión · ci
> puertas humanas activas
