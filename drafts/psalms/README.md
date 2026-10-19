# Psalms 7–8 editorial drafts

Status: **UNPUBLISHED, CONTENT AND ART PROMPTS ONLY**.

These drafts prepare 26 individual verse entries in the established Meaning / Context / Explore / Reflect format. They do not register new studies, add working art assets, or modify the production website. The completed chapter list in `PSALMS_ROLLOUT.md` must remain unchanged until each chapter passes its completion gates.

## Prepared

- Psalm 7: 17 original verse notes, reflection questions, related references, descriptive alt-text briefs, and individual illustration prompts. Its conditional appeal in verses 3–5, judicial imagery, repentance warning, and closing praise are kept in their literary sequence. Cush is mentioned only as the heading identifies him; no biography or identification with another biblical Cush is invented.
- Psalm 8: 9 original verse notes and illustration prompts. Its opening/closing refrain, question about humanity, dignity, and responsibility for living creatures are distinct. Genesis 1 is a related creation account; Matthew 21 and Hebrews 2 are identified as later uses, with a later Jesus connection separate from the psalm’s own voice.
- The JSON structure, unique meanings, field presence/length, and reference book/chapter/verse ranges have been checked in the orchestration runtime. This is content validation, not an app test.

## Sources reviewed

Only BSB Scripture and its translation footnotes were used from these pages; do not import their adjacent chapter summaries or other commentary.

- https://biblehub.com/bsb/psalms/7.htm
- https://biblehub.com/bsb/psalms/8.htm
- https://biblehub.com/bsb/genesis/1.htm
- https://biblehub.com/bsb/matthew/21.htm
- https://biblehub.com/bsb/hebrews/2.htm
- Related Psalm 5–6 and Romans 12:19 text had already been reviewed in the preceding project batch.

No replacement Scripture is embedded. Before integration, compare every referenced verse and the chapter headings directly against the repository’s bundled `data/bible.json`, which remains authoritative for rendered Scripture.

## Remaining work before publication

1. Recover a working project execution environment. The current workspace failed its initialization handshake; local build, image conversion, and browser testing could not be run in this session; no artwork was generated.
2. Inspect the approved Psalm 23:2 image and generate all 26 individual paintings using the retained prompt sets. Compress to the established 1280 × 853 WebP format; inspect every output and verify it decodes.
3. Convert each draft into its registered study module. Remove draft-only metadata, retain editorial fields, replace the `scene` brief with an actual `art` path, and add the files to HTML loading, the Android build, verification, and the offline asset list. Do not advance the sequential chapter past unfinished content.
4. Preserve exact bundled BSB rows, headings, Selah, saved notes, and separate per-psalm last-place resume. Verify all related references against that source.
5. Run the established content/build checks and phone-width browser suite on source and packaged Android web assets. Cover every verse and tab, image decoding, notes after reload, character links, and chapter transitions. Review screenshots, then require CI success before publishing.

The user has authorized all 150 Psalms; no new chapter approval is required. These two chapters are not yet completed or live. Work does not continue automatically after the active session ends.
