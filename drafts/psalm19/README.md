# Psalm 19 — unpublished release candidate

All fourteen editorial rows and distinct paintings are integrated on the Psalms-only branch. This is not a published completion claim. Resume this branch/PR before starting Psalm 20.

- Source: exact bundled BSB, including the choirmaster/David heading and the sentence continuations in 3–4 and 5–6; snapshot in source.json.
- Editorial: editorial.json matches psalm19.js. Original Meaning/Context/Explore/Reflect notes distinguish the creation setting from Romans 10:18’s later quotation. Read Psalm 19, Psalm 8, Psalm 119:97–112 and Romans 10:14–21 before writing these connections.
- Art: fourteen built-in image-generation calls using assets/psalm23/verse-2-watercolor.webp as the style reference. Full prompts and selected original filenames are in assets/psalm19/generation-prompts.json. All originals and all fourteen 1280×853 WebP production files were visually inspected. No shared painting is labeled individual.
- Symbolic images, interpretation, personal reflection and exact Scripture remain separate. Anonymous people are not portraits of David; no divine body is portrayed.
- Packaging: all fourteen files are copied into the Android web bundle and cached by the version-26 web service worker. Paintings total approximately 4.5 MiB; offline storage grows with the collection.
- Local npm run check passed, including exact Scripture, valid references, unique note/art files, topic quotes, independent resume and source/web-bundle parity. The phone-width browser and Capacitor creation/sync CI gate is pending.
- Browser coverage includes every verse/image/tab, reload and Saved/dialog shared reflections, independent 18/19 resume, needs round trips and 18→19→20 transitions, in both website and packaged-webview roots.
- No story manuscripts, scene data or renderers changed. Native APK builds/device testing are separate and not performed by web-bundle/Capacitor checks.

Next: run the complete CI gate, record passing run IDs here and in PSALMS_ROLLOUT.md, then merge only after the final PR checks pass. Confirm post-merge website deployment and live bytes before notifying publication.
