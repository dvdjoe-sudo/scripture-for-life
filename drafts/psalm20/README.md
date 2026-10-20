# Psalm 20 — completed gate; publication after tested merge/deployment

Nine original verse studies and nine distinct paintings are integrated on feature/psalm-20-verse-study. The full gate passed on 7661246d30a44b38df0604d10581fceed80a0815 in CI 39491437968 and 39491431902. Publication follows the tested PR #40 merge and deployment. Resume any open Psalm 20 PR before starting Psalm 21.

- Exact source snapshot: source.json, copied from bundled BSB without changing the heading or verse 3 Selah. Verse 9 retains the BSB address to the LORD to save the king and answer us.
- Editorial: editorial.json matches psalm20.js. The notes preserve the you/we/I/us voices, royal setting, and petitions rather than universal guarantees of success. Related contexts were read in Psalm 20, Psalm 21, Psalm 33, Psalm 46, Psalm 121 and 1 Samuel 7; 2 Chronicles 20 was also reviewed but is not claimed as this psalm’s occasion.
- Characters: David is in the heading; Jacob is the named ancestor, not a participant in the prayer scene. Existing profiles only.
- Art: built-in image_gen.imagegen, nine separate calls using assets/psalm23/verse-2-watercolor.webp as style reference. Full prompts and original filenames: assets/psalm20/generation-prompts.json. All originals and nine 1280×853 production WebPs visually inspected. Symbolic paintings are distinct from exact Scripture and editorial explanation.
- Nine WebPs total 2,900,030 bytes (2.77 MiB), individually offline-cached and copied byte-for-byte into the Android web bundle.
- Shared integration repair restores Psalm 19’s script and offline entries dropped by the concurrent story merge. Judges scripts and the concurrently added Genesis/Joshua people scripts are copied verbatim into the Android bundle; added strict byte parity covers these scripts and the corresponding story assets. Main’s newer people-profile merge was reconciled without editing its content. No story text, scene data, app routes or renderers changed.
- Local npm run check passed all source/reference/asset/packaging checks. Phone-width website and packaged-webview tests plus Capacitor creation/sync passed in CI 39491437968 and 39491431902. The local browser executable was unavailable; CI supplied Chromium. No native APK/device testing is claimed.
- Mobile coverage: each verse, all tabs and paintings, navigation, saved reflections through reload/Saved/dialog, independent 19/20 resume, needs round trips, David/Jacob links and 19→20→21 transitions.

Next: wait for final PR-head checks, then merge and verify deployment plus live files. Initial CI caught a newly added people-script copy omission and a test-ordering error; both are corrected, with every meaningful assertion retained. Next sequential unfinished chapter after this one: Psalm 21.
