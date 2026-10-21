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
| 16 | 11 | `#/study/16/1` |
| 17 | 15 | `#/study/17/1` |
| 18 | 50 | `#/study/18/1` |
| 19 | 14 | `#/study/19/1` |
| 20 | 9 | `#/study/20/1` |
| 21 | 13 | `#/study/21/1` |
| 22 | 31 | `#/study/22/1` |
| 23 | 6 | `#/study/23/1` |
| 24 | 10 | `#/study/24/1` |
| 25 | 22 | `#/study/25/1` |
| 26 | 12 | `#/study/26/1` |
| 27 | 14 | `#/study/27/1` |
| 28 | 9 | `#/study/28/1` |

Psalm 46 has a six-section study covering all eleven verses; it still needs conversion to individual verse pages to meet the new goal. All other Psalms retain their full chapter pages and chapter introductions, rather than being labeled finished verse studies.

Next sequential unfinished chapter: **Psalm 29**. Preserve the completed original Psalm 23 study and arrange Psalm 46's conversion when reached. No routine chapter approval is needed within this authorized scope. Do not imply unfinished chapters have verse-specific commentary or unique art, or that work continues after a session ends.

Psalm 28 passed the whole-chapter gate in PR #66 on c8eff98455c72049c0e9971f8ca4eae1c7f35c18 (CI 39587636678 and 39587612156): nine exact BSB verses with David's heading, individual notes, eighteen related references read in context, nine distinct inspected built-in watercolors and alone/gratitude/strength/direction links. Source/reference/asset/offline/Android parity checks passed, along with every verse/tab/image at 390px in source website and packaged webview, reflection reload/Saved/dialog, isolated Psalm 27/28 resume, topic round trips and 27→28→29 navigation. Capacitor creation/sync passed. Full prompts are in assets/psalm28/generation-prompts.json; the production art totals 2,010,232 bytes (1.92 MiB). Resume PR #66 first if open. Publication follows final PR CI, authorized merge, main CI, Pages and live verification. Story manuscripts, scene data, renderers and Psalm 23 are unchanged. Native APK/device testing is separate.

Psalm 27 was published through PR #65 at 8030a1105e2a0ed271112383d90826768d0a23d2 after final PR CI 39584822891, main CI 39585280951 and Pages 39585279955 passed. All eighteen live files matched the tested bytes, including fourteen paintings. The earlier candidate note below records its pre-publication gate.

Psalm 27 passed the whole-chapter gate in PR #65 on 0f4f324a27c62d3cb9cd5a95c7d03d2cf13fd7f8 (CI 39584239584 and 39584234145): fourteen exact BSB verses and heading, original individual notes and fourteen distinct built-in generated watercolors, all originals and production files inspected. Full prompts are in assets/psalm27/generation-prompts.json. Notes preserve the movement from confidence and longing to urgent prayer and patient hope, distinguish face imagery from bodily depiction and avoid an invented historical setting. All related references were read in bundled context. Every verse/tab/image passed 390px source website and packaged-webview tests, reflection reload/Saved/dialog, isolated Psalm 26/27 resume, fear/alone/direction/strength round trips and 26→27→28 navigation. Capacitor creation/sync passed. Production art totals 3,194,032 bytes (3.05 MiB), packaged offline and for Android. Existing topic entries, story manuscripts, scene data, renderers and original Psalm 23 are preserved. Publication follows final PR CI, authorized merge, main CI, Pages and live-byte verification; finish PR #65 first if open. Native APK/device testing is separate.

Psalm 26 was published through PR #64 at 4dd8cd17ef3fc37374e67b241e2e2fe1163a55df. Final CI 39575133177, main CI 39575631221 and Pages 39575630794 passed. All sixteen live release files matched the tested bytes, including twelve paintings. Shared Saved/dialog and isolated mobile resume checks passed; the 1 Kings packaging repair retains strict offline/byte-parity assertions. The older candidate note below describes its pre-publication preparation.

Psalm 26 is a whole-chapter candidate on branch `psalm26-verse-study` (PR pending review, not merged): 12 exact BSB verses with the heading Of David and the 6–7 and 9–10 sentence continuations, individual original Meaning/Context/Explore/Reflect notes, 12 distinct inspected watercolors saved as 1024px-wide WebP at quality 75 (about 1.2 MiB total), David link, direction/gratitude/forgiveness/strength connections and 25→26→27 navigation. Local `scripts/verify-psalm26.mjs`, source checks and 420px headless rendering of every verse passed; publication follows PR review, CI and an authorized merge. Native APK/device testing is separate.

Psalm 25 passed the whole-chapter gate in PR #52 on 48cee68bda39a0c7c8b3816b98e71412dd6e592f (CI 39544919004 and 39544915223): 22 exact BSB verses with heading and 1–2 continuation, individual notes and distinct inspected watercolors, contextual covenant/provision, confession and distress explanations, David, shared Saved/dialog reflections, isolated resume, direction/forgiveness/alone/strength links and 24→25→26 navigation. All verse/tab/image checks passed at 390px on source website and packaged webview, including reflection reload, people/needs links and resume. Capacitor creation/sync passed. Production art adds 7.53 MiB for offline and Android. Current main home behavior, all story text/scenes/renderers and original Psalm 23 are preserved. Minimal shared copy-list/parity repairs include main’s existing 2 Samuel scripts; home expectations now match Joe’s merged changes while direct original Psalm 23 and Genesis assertions remain. Publication follows passing final PR CI, authorized merge, main CI, Pages and live verification; finish PR #52 first if open. Native APK/device testing is separate.

Psalm 24 passed its whole-chapter gate in PR #48 on implementation bd5b9f9716b5ae29041fe4ebe7237ca35826b3dd (CI 39538423228 and 39538419705): ten exact bundled BSB verses, David's heading, both Selah markers, individual notes and distinct inspected watercolors, contextual references, David/Jacob connections, shared reflections, independent resume and gratitude/direction/strength links. Every verse/tab/image passed phone-width website and packaged-webview tests, including reload/Saved/dialog reflections, needs round trips, original 23→24 via the switcher and 24→25 navigation. Capacitor creation/sync passed. Production art adds 3.38 MiB for offline and Android packaging. Story manuscripts, scene data, renderers and original Psalm 23 remain unchanged. Shared packaging includes main's existing 1 Samuel scripts with strict byte-parity/offline assertions. Publication follows the tested final PR #48 merge, main CI, Pages deployment and live-byte verification; finish PR #48 first if it remains open. Native APK/device testing is separate.

Psalm 22 passed the whole-chapter gate in PR #42: all 31 exact BSB verses and musical heading, individual original notes and distinct inspected watercolors, contextual Gospel/Hebrews connections, David/Jesus/Jacob links, shared Saved/dialog reflections, independent resume, alone/grief/gratitude needs links and 21→22→original 23 navigation. CI 39521988286 and 39521983431 passed on 19e265226985f84a5ddc743c5defb5acfd9e7f46, including source/reference/art checks, all-verse/tab/image phone-width website/packaged-webview tests, reload/shared reflections, needs round trips and Capacitor creation/sync. Production art adds 9.78 MiB, packaged for offline and Android. Story manuscripts, scene data, renderers and Psalm 23 are unchanged. The minimal Ruth copy-list/parity repair preserves current main integration. Native APK/device testing is separate. Publication follows tested final PR #42 merge, main CI, Pages deployment and live verification; if PR #42 remains open, finish it before starting Psalm 24.

Psalm 21 passed its whole-chapter gate in PR #41: thirteen exact BSB verses with heading and Selah, individual original notes and distinct inspected paintings, careful royal life/judgment context, David background, shared Saved/dialog reflections, independent resume and gratitude/strength needs links. CI 39507086883 and 39507083938 passed source/reference/art checks, phone-width website and packaged-browser tests, and Capacitor creation/sync. The 20→21→22 transitions, every verse/tab/image, reflection reload and topic round trips passed. Publication follows the tested PR #41 merge and Pages deployment. Production art adds 4.13 MiB. Story manuscripts, scene data, routes, renderers and Psalm 23 are unchanged. Native APK/device testing remains separate. If PR #41 is still open, finish it before starting Psalm 22; its 31 verses may be developed in clearly unpublished groups.

Psalm 20 passed its whole-chapter gate in PR #40: nine exact BSB verses, individual original notes and distinct inspected paintings, Selah, royal and communal voices, David/Jacob links, shared saved reflections, independent resume and needs connections. CI 39491437968 and 39491431902 passed all source/reference/art checks, 390px website/packaged-webview tests and Capacitor creation/sync on the implementation after reconciling main’s people additions. The 19→20→21 transitions and all verse tabs/images passed. Publication follows the tested PR #40 merge and Pages deployment. The nine offline paintings add 2.77 MiB. Shared repairs restore Psalm 19 loading/offline entries and preserve all concurrently added story/people scripts with strict Android byte parity. Story manuscripts, scene data, app routes and renderers remain unchanged. Native APK/device testing is separate. If PR #40 remains open, finish it before starting Psalm 21.

Psalm 19 passed its whole-chapter gate in PR #35: fourteen exact BSB verses and distinct inspected watercolors, original individual notes, heading and 3–4/5–6 sentence continuations, context-sensitive Romans 10 connection, David/needs links, shared reflections and isolated resume. CI 39480159217 and 39480153842 passed all source checks, 390px source website/packaged-webview tests and Capacitor creation/sync. Publication follows the tested merge of PR #35 and Pages deployment. The fourteen offline paintings add 4.47 MiB. Story manuscripts, scene data and renderers remain unchanged. Native APK/device testing is not covered. If PR #35 is still open, finish it before starting Psalm 20.

Psalm 18 passed its whole-chapter gate in PR #30: fifty exact source verses and individual notes/paintings, 390px website and packaged-webview tests for every verse/tab/image, shared reflections through reload/Saved/dialog, isolated resume, needs links and 17→18→19 transitions; Capacitor creation/sync also passed (CI 39473490381 and 39473403966). Publication follows PR #30’s tested merge and Pages deployment. Story manuscripts, data and renderers remain unchanged; the shared copy list includes the concurrently added Deuteronomy and Joshua renderers with byte-parity assertions. Production Psalm 18 paintings total about 16 MiB; all are offline-cached. Native APK/device testing remains separate.

Psalm 17 completed its source, phone-width website/packaged-webview, and Capacitor checks in PR #29. Fifteen individually generated, inspected paintings and verse-specific notes preserve the heading, sentence continuations, plural voice and BSB provision prayer. Publication follows the merge of PR #29; if it is still open, finish it first. Psalm 18 is long; use clearly unpublished groups of verses if needed and mark it complete only when all fifty verses pass. Android web-bundle/Capacitor checks do not constitute native APK or device testing.

Psalm 16 completed its source, phone-width website/packaged-webview, and Capacitor checks in PR #28. All eleven individual watercolors and verse notes are present. The original heading is preserved; notes distinguish the psalm’s trust from its later use in Acts. Publication follows the merge of PR #28; if it is still open, finish that PR before starting Psalm 17. These checks do not constitute native APK or device testing.

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
