# Verse-by-verse Psalms rollout

Approved goal: extend the Psalm 1 / original Psalm 23 format across all 150 Psalms. Each verse needs exact BSB text, its own fitting watercolor, individual Meaning/Context/Explore/Reflect content, related references, and optional verse-specific saved reflections. This is a staged editorial and illustration rollout; complete chapter pages already exist for all 150.

## Completed verse studies

| Psalm | Verses | Entry |
| --- | --- | --- |
| 1 | 6 | `#/study/1/1` |
| 2 | 12 | `#/study/2/1` |
| 3 | 8 | `#/study/3/1` |
| 4 | 8 | `#/study/4/1` |
| 5 | 12 | `#/study/5/1` |
| 6 | 10 | `#/study/6/1` |
| 7 | 17 | `#/study/7/1` |
| 8 | 9 | `#/study/8/1` |
| 9 | 20 | `#/study/9/1` |
| 10 | 18 | `#/study/10/1` |
| 11 | 7 | `#/study/11/1` |
| 12 | 8 | `#/study/12/1` |
| 13 | 6 | `#/study/13/1` |
| 14 | 7 | `#/study/14/1` |
| 15 | 5 | `#/study/15/1` |
| 23 | 6 | `#/study/23/1` |

Psalm 46 has a six-section study covering all eleven verses; it still needs conversion to individual verse pages to meet the new goal. All other Psalms retain their full chapter pages and chapter introductions, rather than being labeled finished verse studies.

Next sequential chapter: **Psalm 16**. Continue in order, keeping the completed Psalm 23 study and arranging Psalm 46's conversion when reached. No new approval is needed for each chapter within this authorized scope. Do not imply unfinished chapters have verse-specific commentary or unique verse art, or imply that work continues in the background after a session ends.

In review: Psalm 16 on `feature/psalm-16-verse-study`, PR #28. All eleven individual watercolors and verse notes are present; resume this PR and its checks before starting Psalm 17. The chapter remains unpublished until the completion gate passes and the PR is merged.

## Completion gate for each batch

- Read the exact source verses and any named cross-references before drafting explanations.
- Write individual meaning and context for every verse. Distinguish quoted opponents, changes of speaker, poetic imagery, and later biblical connections. Avoid manufactured settings or generic chapter paragraphs reused as verse commentary.
- Generate and inspect individual watercolors using the approved Psalm 23:2 style reference. Save production assets in the repository and record prompts.
- Keep Scripture unchanged. Preserve source headings and Selah, existing notes, free navigation, and separate per-psalm resume.
- Verify every related reference and every artwork file; compare source and Android bundle. Test mobile navigation, all tabs, image loading, reflections across reload, and chapter transitions. Publish only after CI passes.

The renderer and collection use the registered studies, so future batches should not require lists of hard-coded psalm numbers. Keep offline asset packaging and mobile payload size under review as the illustrated collection grows.

User reaffirmed authorization on October 19, 2026 to continue all Psalms. Continue sequential tested batches without requesting approval for each chapter. Report only chapters actually completed; the collection goal remains in progress.

Everyday-needs integration: “What are you facing today?” uses shared topic connections for Psalm passages, Genesis/Exodus scenes, and character profiles. Verse studies and mapped story scenes link back to those needs. New batches should add fitting source references to the existing topic selections, preserve shared verse notes and saved passages, and verify the connections in both website and Android builds. Connections are thematic, not claims that a story supplies a psalm’s historical setting.

Joe reaffirmed continuous development on October 19, 2026. A recurring development task is configured to resume tested sequential batches. This is distinct from the read-only readiness watch; do not ask for routine chapter approval or claim work happened merely because a task is scheduled. Reconcile main and any open Psalms PR before starting another batch. Story content remains Joe’s separate workstream.

## Shared build compatibility

The Psalms 13–15 batch also includes the existing `leviticus.js` in the Android web copy list and updates the shared Exodus checks to cover all eight original manuscripts (293 paragraphs across 72 scenes) and actual episode transitions. Story text, scene data, and story renderers are unchanged. Full source, mobile-browser, offline-asset, and Capacitor checks passed for the implementation before publication.
