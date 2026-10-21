# Drafts

`drafts/psalm30/` through `drafts/psalm40/` and `drafts/psalm41/` through `drafts/psalm60/` hold **text-only verse-study drafts**. They are **not wired into the app**: there is no `psalmNN.js` module, script tag, navigation, build-list, service-worker, topic or rollout-table entry for them, and no art has been generated yet.

**Psalm 46 is the exception.** It already has a live six-section study (`psalm46.js`, `assets/psalm46/section-*.webp`). `drafts/psalm46/` is a separate full per-verse draft. It does not change the live study, and any future switch to it would need its own review.

Each folder contains:
- `source.json`: the exact bundled BSB verses, including headings and Selah, for checking only. The app always loads Scripture from `data/bible.json`.
- `editorial.json`: the `study` object in the same shape as `psalm26.js` (original Meaning/Context/Explore/Reflect notes, related references, people links and alt text), plus a `topicPlan` of suggested everyday-need links.
- `generation-prompts.json`: one watercolor prompt per verse following `assets/psalms/STYLE.md`. Its status is "prompt drafted; image not generated". In the 41–60 drafts, each verse has a distinct scene (objects, animals, landscapes, architecture, groups or weather), so that the same figure-on-a-path image does not repeat.

These drafts are waiting for art generation and visual inspection, and then for wiring that follows the Psalm 26–29 pattern. To check them, run:

- `node scripts/verify-drafts-psalms30-40.mjs`
- `node scripts/verify-drafts-psalms41-60.mjs`

These scripts check that the drafts cover every verse exactly, that all references, people and topics are valid, and that the art prompts are distinct. They also check that nothing is wired yet. For Psalm 46 the 41–60 script checks that the live files are unchanged from `origin/main`.

Older `drafts/psalmNN/` folders record the groups behind psalms already published.

People links follow the headings:
- Sons of Korah: 42 and 44–49.
- David: 41 and 51–60.
- Jacob: where he is named (44:4, 46:7/11, 47:4, 53:6, 59:13).

Asaph (Psalm 50) has no People profile yet, so he is described in the note and has no link.
