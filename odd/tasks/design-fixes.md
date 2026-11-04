# Feature: design-fixes

## Objective
Apply five approved design fixes to the portfolio site, preserving the existing diagram animations and all existing content.

## Specs
- S1 — Canvas wallpaper: remove the grid/dot wallpaper and radial glow from `.canvas`; flat navy, 1px border, radius 0, no outer lift shadow. Applies to hero compact diagrams, project previews and the full player.
- S2 — Radius scale: plates/media 0; surfaces/panels 4; controls 3; pills only for semantic tags/status. No 12/18/22 on boxes. Diagram node and zone boxes become rx 2; player cards/panels 4; controls/tabs 3; header language box 3; media frames 0.
- S3 — Icons: replace all Lucide icons with a small custom 16px geometric set (11 node kinds, 5 controls, close, arrow) with square caps and 1.4 stroke. Keep the same placement/API and the existing diagram behavior. Remove `lucide-react`.
- S4 — Fonts: self-host Familjen Grotesk Variable (display), Schibsted Grotesk Variable (text), Spline Sans Mono Variable (mono) via @fontsource-variable. Remove the Google Fonts CDN links. Update display weights/tracking; update the OG card fonts to static Familjen/Schibsted/Spline; update the boot-intro canvas mono family. These families are outside the Google Fonts top 10.
- S5 — Rhythm: Home client work = 1 feature + 3 index rows; personal work = 1 feature + an 8-row two-column ledger; one loud statement line between the groups. Project detail = problem pull quote, numbered "what I built" list, editorial decision blocks; no content card wrappers. Existing copy/i18n stays; the only new copy is the approved statement line. Status pills and stack chips stay (semantic tags); stack chips hide on compact ledger rows. Header/footer surfaces stay.
- Constraint — Do not touch diagram animations: comets, pulses, flow playback, timings, hover/focus emphasis, play/pause/restart, reduced-motion handling, or edge rendering. Only static styling changes.

## Tasks
- [x] T1 Fonts: add variable @fontsource imports, tokens/weights, remove Google links, update BootIntro and OG fonts. Route: inline (single coherent change).
- [x] T2 Static styles: flat canvas, radius scale, diagram node/zone rx, header language box, media frames, player UI radii. Route: inline.
- [x] T3 Icons: custom mark set, controls, close, arrow; update call sites; remove lucide-react. Route: inline.
- [x] T4 Home rhythm: ProjectCard, HomeView groups/statement, i18n keys, CSS. Route: inline.
- [x] T5 Detail rhythm: ProjectView problem/built/decisions, About display weights. Route: inline.
- [x] T6 Verify: tests, check, build, privacy, screenshots, git diff; confirm animation code untouched. Route: inline + focused checks.

## Log
- L1 (user request, verbatim excerpts):
  - «Fondo de grilla o puntitos… La grilla/puntitos de fondo con fade es el wallpaper default de shadcn/Vercel. Si no aporta, fuera. Cambia solo eso, sin tocar el resto, y dime qué cambiaste.»
  - «Las mismas esquinas redondeadas (100% de las cajas con radio ≥12px, radio más usado: 18px). rounded-2xl en cada caja aplana la jerarquía. Define radios con criterio (o ninguno) y que no todo sea una tarjeta. Cambia solo eso, sin tocar el resto…»
  - «Íconos de Lucide por defecto (142 íconos lucide)… Si usas íconos, que sean pocos y con un estilo propio. Cambia solo eso…»
  - «Fuentes cargadas de Google Fonts: Archivo, IBM Plex Sans, JetBrains Mono… Si vas a usar Google Fonts, elige fuera del top 10. Cambia solo eso…»
  - «Grillas de tarjetas iguales (4 tarjetas…, 9 tarjetas…)… Varía el ritmo: una sección con imagen grande, otra con lista, otra con una sola frase potente. Cambia solo eso…»
- L2 (mockup approval): «si dale».
- L3 (hard constraint): «espero que no toques las animaciones de los diagramas, eso estaba perfe[cto]».
- L4: Mockup approved: `Extra/mockups/design-fixes-before-after.html` (gitignored) + self-hosted preview fonts.

## Progress / Evidence
- T1-T5 implemented inline on branch `feat/design-fixes` (single coherent design change; no parallel writers).
- `npm test`: 0 fail, 0 cancelled, 0 skipped.
- `npm run check`: 0 errors, 0 warnings, 2 pre-existing hints.
- `npm run build`: 31 pages + OG cards, complete.
- `npm run privacy`: 0 hits.
- Static screenshots reviewed at 1440px and 390px for home, project detail and about; no page-level horizontal scroll.
- Animation safety: `git diff` contains no changes to `flow.ts`, `@keyframes`, animation/transition declarations, timings, playback or edge rendering. Only static canvas background, node/zone `rx`, icon glyphs/stroke and UI radii changed.
- Compact diagram previews render only for the first item of each group (`showDiagram`), matching the approved rhythm. Hero, detail player and their animations are unchanged.
- OG cards regenerated with static Familjen Grotesk / Schibsted Grotesk / Spline Sans Mono and a flat canvas; the grid wallpaper is gone there too.
- Removed `lucide-react` and the old Archivo / IBM Plex Sans / JetBrains Mono packages. No `fonts.googleapis.com` or `lucide` references remain in `src/` or `dist/_astro`.

## Commits
- `806bf43` — design system: flat canvas, radius scale, custom icons, self-hosted typefaces, OG cards.
- `9cd9bea` — home rhythm and project detail editorial blocks.
