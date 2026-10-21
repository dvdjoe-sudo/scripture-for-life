# Drafts

Psalm 30 now has twelve reviewed illustrations and a whole-chapter integration candidate; see its progress and verification files. Publication requires all checks and deployment verification.

`drafts/psalm31/` through `drafts/psalm40/` remain **unpublished text-only drafts (211 verses)**. Run `node scripts/verify-drafts-psalms30-40.mjs` (historical filename) to verify them.

`drafts/psalm41/` through `drafts/psalm60/` are **unpublished text-only drafts (277 verses)**. Each folder has `source.json` (exact BSB snapshot), `editorial.json` (study + topic plan) and `generation-prompts.json` (one distinct, ungenerated watercolor prompt per verse). Run `node scripts/verify-drafts-psalms41-60.mjs`; it also checks prompts are visually distinct (unique scenes, no repeated openings, at most one "traveler" per psalm).

**Psalm 46** already has a live six-section study (`psalm46.js`, `assets/psalm46/section-*.webp`). `drafts/psalm46/` is a separate per-verse draft that does not change it; the verify script confirms the live files are unchanged from `origin/main`.

People links follow headings: sons of Korah (42, 44–49), David (41, 51–60), Jacob where named (44:4, 46:7/11, 47:4, 53:6, 59:13). Asaph (50) has no People profile yet, so he is described without a link.

None of these drafts has runtime modules, generated assets, script tags, build entries or topic integration. Older draft folders record the editorial groups behind integrated chapters.
