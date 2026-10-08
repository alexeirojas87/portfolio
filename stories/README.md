# Project stories

Beat-by-beat animated decks that explain a project and why its architecture was chosen. Embedded in the
project detail page of the portfolio (and playable fullscreen). Built with
[beatdeck](https://github.com/borjaperfra/beatdeck) (MIT, see `LICENSE`): a fixed 1920x1080 React stage where one
click is one beat. The engine in `src/beatdeck/` is untouched. beatdeck's Kernel Panic example (non-MIT
assets) was removed by `init` and is not part of this repo.

## One app, one entry per story (decision)

A single Vite app holds every story. The story is chosen by URL, and the language by query param:

```
/stories/?story=agentic-orchestration&lang=es
```

Why one app and not one entry per story:

- one build, one offline check, one set of fonts and engine code (about 300 kB of JS shared), instead of N copies;
- each story is code-split (`deck/index.tsx` registry uses dynamic `import()`), so a page only downloads its story;
- the site embeds one fixed URL shape, and `story: true` in the project JSON is the only switch;
- language is a query param, so there is no deck per language: copy is a typed `{ en, es }` dictionary.

Trade-off: all stories share one `id`-namespaced localStorage and one verify run; `verify` takes the story via
`BEATDECK_QUERY` (see below). If stories ever need different engines or themes, split into entries then.

## Layout

| Path | What |
| --- | --- |
| `deck/index.tsx` | story registry, `?story` resolution, portrait-phone hint |
| `deck/shared/` | `lang` (`L10n`, `tr`), `arch` (typed project JSON + lookups), `Node`, `DiagramScene`, `Chrome`, `Frame`, `fit` |
| `deck/stories/<slug>/` | one story: `copy.ts` (typed en/es), `scenes.ts` (beat map), `scenes/*.tsx`, `index.tsx` |
| `themes/site.css` | the site's tokens (navy canvas, cobalt, node-kind colours) and local fonts (Archivo, IBM Plex Sans, JetBrains Mono via `@fontsource`) |
| `docs/CONTENT-AUDIT.md` | every beat mapped to its JSON source |
| `src/beatdeck/`, `scripts/` | engine and tooling (scripts patched only to accept `BEATDECK_QUERY`) |

## Commands

```bash
npm run dev     # http://127.0.0.1:5173/?story=agentic-orchestration&lang=en#1.1  (←/→ or click to step)
npm run build   # typecheck + bundle + offline check -> dist/
npm run verify  # every beat forwards/back/from URL, frame diff, text/overlap audit -> artifacts/verify/contact.png
BEATDECK_QUERY="story=agentic-orchestration&lang=es" npm run verify   # same, for another story/language
```

From the repo root, `npm run build:stories` installs, builds and copies `stories/dist` to `public/stories`
(gitignored); `npm run build` runs it before `astro build`, so `dist/stories/` ships with the site. Offline:
no CDN, no remote fonts, no analytics.

## Adding a story

1. Create `deck/stories/<slug>/` (copy the agentic one): `copy.ts` with an `L10n` dictionary, `scenes.ts`, scenes, `index.tsx`.
2. Register it in `deck/index.tsx`.
3. Add `"story": true` to `src/content/projects/<slug>.json`.
4. Write its section in `docs/CONTENT-AUDIT.md`, then `build` + `verify` in `en` and `es`.

Facts come only from the project JSON; no company information on stage.
