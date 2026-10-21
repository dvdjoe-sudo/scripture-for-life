# Drafts

`drafts/psalm30/` through `drafts/psalm40/` hold **text-only verse-study drafts** for Psalms 30–40. They are **not wired into the app**: there is no `psalmNN.js` module, script tag, navigation, build-list, service-worker, topic or rollout-table entry for them, and no art has been generated yet.

Each folder contains:
- `source.json`: the exact bundled BSB verses, including headings and Selah, for checking only. The app always loads Scripture from `data/bible.json`.
- `editorial.json`: the `study` object in the same shape as `psalm26.js` (original Meaning/Context/Explore/Reflect notes, related references, people links and alt text), plus a `topicPlan` of suggested everyday-need links.
- `generation-prompts.json`: one watercolor prompt per verse following `assets/psalms/STYLE.md`. Its status is "prompt drafted; image not generated".

They are waiting for art generation and visual inspection, and then for wiring that follows the Psalm 26–29 pattern. Run `node scripts/verify-drafts-psalms30-40.mjs` to check that the drafts cover every verse exactly, that all references are valid, and that nothing is wired yet. Older `drafts/psalmNN/` folders record the groups behind psalms already published.
