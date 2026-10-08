# Runbook: playing a project story

## Where it plays

- On the project page: an embedded 16:9 frame, `/stories/?story=<slug>&lang=<en|es>`.
- Fullscreen: the "Open fullscreen" link, or press `F` inside the deck.
- Offline: the build is static and self-contained (local fonts, no CDN, no analytics). `npm run present` serves it locally.

## Keys

| Key | Does |
| --- | --- |
| click, `→`, `↓`, `PageDown`, `Space` (fullscreen) | next beat |
| `←`, `↑`, `PageUp` | previous beat |
| `1` to `9` | jump to a scene |
| `Home`, `End` | first, last beat |
| `F` | fullscreen |
| `O` | overview |
| `P` | presenter window (notes, next beat, timer) |
| `B` or `.` | blackout |

Deep links: `#<scene>.<beat>`, for example `#4.3` is the plan gate. Add `?lang=es` for Spanish.

## Automatic beats

Most beats in scenes 4 to 7 move by themselves after the click (a packet walks the state machine, requests stream
into the gateway, the prompt types out). Wait for them to settle (2 to 6 seconds) before the next click, or click
early: leaving a beat stops its motion, and entering any beat always starts it from its beginning. Going back is
always valid. Only the boot (1.2) advances on its own, to the title.

## Reduced motion

With the OS setting "reduce motion" (or `?reduced=1`) the narrative and the hard cut stay; the ambient shimmer
(particles, sweep line, pulses, orbit dot, camera glide) is dropped.

## If something goes wrong

- Blank frame: reload; the URL hash restores the beat.
- Wrong language: add or remove `?lang=es`.
- Mobile portrait: the page shows a poster and the fullscreen link; rotate the phone.
- Presenter window out of sync: close it and press `P` again (same browser, same machine).

## Checks before publishing a story

```bash
npm run build
npm run verify -- --source=docs/cerberus-prompts.md
BEATDECK_QUERY="story=agentic-orchestration&lang=es" npm run verify -- --source=docs/cerberus-prompts.md
```

Open `artifacts/verify/contact.png` (and `verify-es`) and look at it: no clipped or overlapping text, every beat identical forwards, backwards and from the URL.
