# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Calculator usability feedback — 2026-09-17

The user found too many fields and information visible at once and requested: “tem que ser simples igual a planilha.” Keep the main calculation compact: type, level, quantity, editable rows and automatic totals together. Keep current quotas and current total headcount visible on the main page, as in cells B2/C2 of the reference Excel. Show the two arithmetic differences immediately. Supporting explanations remain available on demand. Do not turn the basic calculation into a long wizard. Preserve the SIORG visual shell and exact arithmetic; do not gate simple numerical differences behind administrative metadata or claim that the totals establish administrative equivalence.

Add a small information icon beside field labels. Explanations should appear on hover, keyboard focus, or touch, with short examples rather than permanently visible instructional paragraphs.

## Organization references — 2026-09-24

The user requested an organization selector with decree-specific reference data, using Educação, Saúde and SGGD as examples. Research and verify which values actually change before implementing profiles. Preserve the simple spreadsheet-like flow and the two visible baseline fields. Keep unit coefficients, authorized decree totals and manually entered current values distinct. Show source/version and never assume a special multiplier merely from selecting an organization. Evidence and unresolved references are recorded in `evidence/orgaos-2026-09-24/pesquisa-e-proposta.md`.

The follow-up discussion distinguishes secretariats from their units. The proposed compact flow uses two dependent selectors: Secretaria → Unidade, defaulting to “Toda a secretaria”. The main comparison follows the selected scope. Any overall impact must retain the unchanged structure, use compatible reference data and avoid counting subordinate units twice. Do not infer unit hierarchy from table order alone or automatically include linked legal entities in a secretariat's totals.

The user prioritized SGGD and requested smaller adjacent selectors, ordered Secretaria then Unidade. SGGD is the default. Keep the two selectors on the same row, including narrow viewports, with the full scope description below. SGGD's conflicting annexes must never support a claimed official consolidation. Following the user's correction that selections were empty, auto-load the documented Annex II quantities and calculated quotas for each supported scope, clearly labeled as Annex II documentary data pending reconciliation with Annex III. Do not substitute the Annex III summary into the Annex II composition. A separate fictitious example remains optional. Education references demonstrate the compatible-reference flow. Do not treat the authorized decree base as occupied/current staff. The proposal represents the complete final composition of the selected scope, not additions only. Changing an untouched reference selection immediately loads its own quantities. If the user has edited values or entered a custom name, ask for replacement confirmation inside the app; a manual unit identification becomes locked when values are associated with it.

Autofill applies to the initial SGGD selection and to each supported scope change, populating both baseline and complete editable proposal. Baseline is read-only until the explicit manual action. Clear must remain a deliberate empty manual state. Keep the source conflict in screen and copied summary. The two compact selectors remain side by side.

## Publication — 2026-09-24

The user authorized a public Vercel link for other people to evaluate the MVP. The dedicated project is `siorg-calculadora-mvp` in `dudycappia-4508s-projects`; fixed public alias is https://siorg-calculadora-mvp.vercel.app/. This is a prototype release, not institutional SIORG production. Preserve the minimal `.vercelignore` allowlist; do not upload evidence, source spreadsheets, local credentials or work documents. Keep public UI labeled “Protótipo para avaliação” and local development labeled “Protótipo local”. On authorized updates, verify the fixed alias without login and test the changed feature; a READY deployment alone does not prove public access.

## Three-product alignment — 2026-09-24

The user supplied the team's proposed delivery scope: Calculator + Position Distribution/Organization Chart first, with SGGD as the initial example; Secretariat History follows. Formats remain open to collaborative refinement. The technical area reviews rules and information throughout development; Eduardo implements in the CMS after validation. Rafael structures the historical research. The supplied text does not identify the author responsible for the initial calculator/distribution models; do not assign that role by inference.

The calculator's intended outcome is comparison of a complete restructuring proposal against the latest approved secretariat baseline and applicable quantity/quota limits, keeping CCESP and FCESP separate. The current MVP only provides arithmetic comparisons; the new scope does not establish that any official limit has been validated. Distribution must share one proposal with the calculator, preserve edits across units, show direct and rolled-up amounts without double counting, and use a verified hierarchy for an organization chart. A single-unit selector is not a multi-unit distribution feature. Keep the simple sheet-like interface and contextual help. Documented SGGD annex conflicts remain unresolved until the technical area supplies an accepted reference. See `docs/alinhamento-tres-produtos.md` for the scoped next iteration and pending decisions.
