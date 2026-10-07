# Feature: portfolio-mockups

## Objective
Build the visual mockups of a personal portfolio site (frontend first, backend later) that showcases personal and corporate projects with detailed, animated architecture diagrams, used to attach to job applications.

## Problem / Why
Corporate code cannot be shown. Employers need to see, at a glance, the systems built and the architecture behind them. Mockups are built in the final stack with mock data so they are not thrown away when the backend arrives.

## Scope
- Sections: Home, Personal projects, Corporate projects, Project detail, About me.
- Project detail: description, links (URL / GitHub for personal only), animated architecture flow diagram (style reference: dark node/edge flow diagram with status pulses), tech stack, "why" for key decisions, video slot.
- i18n: English (base) + Spanish.
- About me: CV summary focus (years of experience, technologies, areas). No employer names.
- Out of scope now: backend/CMS, real videos, deployment.

## Constraints
- HARD: no company information anywhere (names, domains, clients, vendors, namespaces, internal service names). Corporate projects are company-agnostic but architecturally detailed.
- Denylist lives in `.privacy-denylist` (gitignored) and is scanned before every commit.
- CV PDF stays local (gitignored).
- Artifacts in English.

## Projects
Personal: apagones-habana (https://apagoneshabana.lat/), SmartValue (https://smartvalue-monitor.pages.dev/), DungeonAndDragons, CameraDesk, Cerberus, MyOutfits, PlayerMesh, CanadaBankJobs, StorageLens.
Corporate (anonymized slugs): wagering-platform, live-betting-engine, agentic-orchestration, crypto-payments (no repo; described by the user).

## TDD
Mode: off. Source: no project/session configuration found. Ordinary functional checks: `astro check` + `astro build` + privacy scan.

## Delivery
Strategy: ask-on-risk (default). Forecast exceeds ~400 authored lines; no remote yet, so chain strategy will be asked before the first PR.

## Tasks
- [x] T1 Content extraction: sanitized architecture data for all 13 projects. Route: delegated (mapping trigger, 13 repos), 3 parallel read-only explorers. Evidence: 12 JSON files valid, corporate files 0 denylist hits.
- [ ] T1b Content corrections from user: player-mesh and storage-lens show target architecture as built (no "planned"); dungeon-and-dragons LLM chapter generation is real; Cerberus kept both as personal project and as a component inside agentic-orchestration (adapted variant); crypto-payments authored from user description. Route: delegated writer.
- [x] T2 Scaffold: Astro + React islands + Tailwind, en/es routing, design tokens, privacy scan script. Route: delegated writer.
- [x] T3 Animated architecture diagram component (SVG nodes/edges, flow pulses, groups, legend). Route: delegated writer.
- [x] T4 Pages: Home, project lists, project detail, About me, language switch. Route: delegated writer.
- [ ] T5 Visual review with user, iterate on design.
- [ ] T6 (later) Backend design.

## Acceptance criteria
- `astro build` passes; privacy scan returns zero hits.
- Every project renders a detail page with an animated diagram in en and es.

## Progress / Evidence
- T2 done (light "systems, explained" tokens, Astro 7 + React + Tailwind v4, en/es i18n, privacy scan). Route: delegated writer. Evidence: `npm run check` 0 errors; `npm run build` ok; `npm run privacy` 0 hits. TypeScript pinned to 6 (astro check does not support TS 7). Privacy scan skips vendor js/css/map in dist/_astro only (owner-approved). T2 commit `024f4c9`. T3 commit `254540f`.
- T3 done: ArchitectureDiagram (full: flow tabs, narrated step list, play/pause/step, comets, hover trace, legend; compact: ambient CSS comets, decorative with text alt), pure `layout.ts`/`flow.ts` with `npm test` (4 passing). Route: delegated writer. Evidence: check 0 errors, build ok, privacy 0 hits. Decision: edge labels on canvas only for active/hovered edges; every label is in the narrated step list.
- T4 done: home (hero cycling 3 featured architectures, capability strip, personal/client sections with compact-diagram cards), project detail (diagram + narrated player first, what/built/decisions/stack/video slot/prev-next), about, en+es. Route: delegated writer. Evidence: check 0 errors; build 28 pages (12 projects x en/es + 4); privacy 0 hits; preview curl 200 for /, /es/, /about, /projects/smartvalue, /es/projects/wagering-platform; visual check via headless Chrome at 1280/1360 and 360px (no page-level horizontal scroll). Deviation: narrated step list sits below the canvas (not beside) so the canvas keeps full width and legible text.
- Repo initialized (`8fb4204`), branch `feat/portfolio-mockups`.

## Next step
T1.
