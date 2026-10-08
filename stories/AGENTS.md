# Agent guide

Project stories for the portfolio, built with [beatdeck](https://github.com/borjaperfra/beatdeck): a fixed
1920x1080 React stage where one click is one beat. Method: `skills/building-a-beatdeck/SKILL.md`
(content audit -> beat map -> scenes -> verify). See `README.md` for the layout and how to add a story.

- Edit `deck/` (stories, shared helpers), `themes/site.css`, `docs/CONTENT-AUDIT.md`. Never edit `src/beatdeck/`.
- Facts come only from `src/content/projects/<slug>.json`. No company information on stage.
- Copy is a typed `{ en, es }` dictionary; language is `?lang=`, story is `?story=`.
- Offline only: local fonts, no CDN. `npm run build` fails otherwise.
- Done means `npm run build` and `npm run verify` pass (en and es, via `BEATDECK_QUERY`) and the contact sheet was reviewed.
