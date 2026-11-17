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
