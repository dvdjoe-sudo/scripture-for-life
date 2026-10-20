# Scripture for Life

A peaceful Bible companion that places God's Word first. This repository's **main** branch contains the approved original warm-ivory, forest-green design and Psalm 23 illustration, alongside newer interactive Genesis storytelling.

## Live website

https://dvdjoe-sudo.github.io/scripture-for-life/

GitHub Pages can be configured under **Settings → Pages** to publish the `main` branch from `/(root)`. If Pages still publishes another branch, switching to `main` is a separate repository-setting change; merging alone doesn't change the Pages publishing source.

## What works today

- Find Bible passages for real-life circumstances, with links to original Scripture.
- Read the public-domain Berean Standard Bible (BSB), including Psalm 23's **primary original visual devotional study** at `#/study/23/1` with Meaning, Context, Explore, and Reflect tabs.
- Psalms 23 and 46 retain a collection and switcher. Psalm 23 has six verse-specific watercolor illustrations, plain verse links, and no trail or completion steps. Old walk links open the matching original verse study.
- Psalm 46 now uses the same original four-tab devotional design at `#/study/46/1`. Its six sections cover all eleven BSB verses without changing the Bible text. Read/listen, Meaning, Context, Explore, and optional Reflect tools connect directly with the fear and strength topics, the full reader, and new profiles of Jacob and the sons of Korah. The latter is a group named in the psalm heading, not an invented individual author. Jacob’s profile also links to the existing Genesis Episode 8.
- Explore Genesis Episodes 1–12, 92 illustrated story scenes, narration and reflections.
- Browse all 66 books in the Bible Journey.
- Save verses and personal notes locally in the current browser.
- The current homepage and Psalm 23 landscape art are restored from original Git history; newer Genesis story scenes use the same SVG landscape generator. Psalm 23 uses a consistent set of watercolor scenes based on the approved quiet-water preview. The six WebP images are bundled for Android and offline access. They are symbolic, not historical reconstructions. See `assets/psalm23/README.md` for artwork sources and prompts.
- Episode manuscripts 4–12 are preserved verbatim in `stories/`; CI checks every paragraph against the corresponding reader episode. Scene titles, reference links, and reflection questions are editorial additions displayed separately from Scripture. On the hosted site, a service worker precaches the essential reading files so previously loaded content can be used offline. The first visit and successful installation require an internet connection. Not all images or third-party assets are guaranteed available offline.

## Run the website

At the project root, run:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. Web routes use the location hash (e.g., `#/stories`).

## Build the same site for Android

Node.js 22 or later and Android Studio are recommended.

```sh
npm install
npm run check
npx cap add android       # first time only
npm run android:sync
npm run android:open
```

`npm run build` generates `www/` containing **the exact root HTML/CSS/JS files the live website uses**, together with `assets/`, `data/`, the icon and manifest. Capacitor uses that `www/` directory. `www/`, `android/` and `node_modules/` are generated and should not be committed by default. The Android build still requires native compilation and physical-device testing.

The package ID `com.scriptureforlife.bible` is a **provisional candidate**; confirm it is suitable/available before the first Google Play release, and do not publish or sign a production app with it until approved. This repo is not yet a tested, signed Google Play app.

### Icons and offline

- The manifest now correctly references `icon.svg` at the repository root and opens `#/.`? No: the actual home route is `#/`.
- The website registers `sw.js` on HTTPS hosted pages. Service-worker caching is a web/PWA feature; Android's bundled static assets don't depend on it.
- SVG is available now, but the eventual Play Store submission needs properly rendered Android launcher/adaptive icons and store artwork (including PNG assets).
- For future releases, check the current Google Play target API level, privacy/data-safety disclosures and testing requirements before submission.

### Legacy files

`standalone.html` and `assets/app.js`, `assets/style.css` are historical alternative builds. The website does **not** load them, and the Android build copies the root scripts instead. Keep them for now; remove only after confirming no references or backup needs.

### Attribution

Bible text is the public-domain Berean Standard Bible. Original retellings and contextual notes remain distinguished from Scripture, and scene illustrations are symbolic rather than historical images.

## Genesis complete collection

All 12 episodes now cover Genesis 1–50, from Creation through the death of Joseph. There are 92 illustrated reading scenes. Each uses the original Scripture for Life muted landscape SVG generator; no AI-generated historical portraits. Original narrated paragraphs for Episodes 4–12 are archived in `stories/genesis-episode-N.md` and tested against the app data. Scene interpretations remain clearly separated from biblical quotations and the original retelling. Episode navigation continues from one story to the next; Episode 12 concludes with the 66-book Bible Journey.

- All 150 Psalms now have chapter pages at `#/psalms/N`, with one main watercolor, exact complete BSB text, individual chapter introductions, literary context, reading prompts, reflections, and character connections when names occur in the chapter. The collection supports number/text search, theme and book filters, last-place resume, and chapter/verse navigation.
- Related chapters share suitable images from a consistent 24-scene watercolor library. The detailed Psalm 23 and Psalm 46 studies remain available. Future psalms artwork follows `assets/psalms/STYLE.md`. All images are bundled for offline reading and Android.

- Psalm 1 now follows the original Psalm 23 verse-by-verse format at `#/study/1/1`: six individual watercolors, exact Scripture, unique Meaning/Context/Explore/Reflect content, verse-specific private notes, freely accessible verse links, and local last-place resume. The Psalm 1 collection card opens the detailed view; the complete chapter remains available at `#/psalms/1`. The reusable renderer is `psalm-verse-study.js`, with Psalm 1 content in `psalm1.js`.

- Psalms 2 and 3 add 20 individually illustrated verses at `#/study/2/1` and `#/study/3/1`, with separate verse meaning, context, exploration, reflections, and validated related passages. All artwork is included offline and in the Android bundle. Verse-study expansion status is tracked in `PSALMS_ROLLOUT.md`; other chapters retain their existing complete chapter pages.

- Psalm 4 adds eight individual verse watercolors and Meaning/Context/Explore/Reflect notes at `#/study/4/1`, with David’s profile, a separate saved place, exact BSB headings and Selah, and links from Psalm 3 onward to the Psalm 5 verse study. Source and Android assets match; all eight images are included offline. Content: `psalm4.js`. Prompts: `assets/psalms/generation-prompts-4.json`.

- Psalms 5 and 6 add 22 individual verse paintings with verse-specific Meaning/Context/Explore/Reflect content, exact BSB text, David connections, optional saved reflections, and independent reading places. Psalm 5 preserves its morning prayer, holiness, justice, and refuge themes; Psalm 6 preserves lament, bodily frailty, tears, and the turn toward confidence without inventing a diagnosis or a narrated recovery. Artwork and code are matched in the offline website and Android web bundle. The next chapter is Psalm 7; full chapter pages remain available for every Psalm.

## Exodus opening episodes

The first three Exodus manuscripts are preserved verbatim in `stories/exodus-episode-N.md` and presented in 33 scenes across Exodus 1–15 at `#/exodus`. Each scene has a Bible-reader link, original context and reflection, optional narration, and its own saved reflection. Exodus progress is separate from Genesis. The whole-episode view keeps every manuscript paragraph in order. Moses, Aaron, Miriam, Zipporah, and Shiphrah/Puah profiles connect back to the episodes. Genesis’s ending, the story list, homepage links, People & stories, and Bible Journey lead into Exodus. These three episodes do not claim to cover Exodus 16–40; the last scene links to Exodus 16 in the complete reader. The original Genesis SVG landscape system and ivory/green design are retained; imagery is symbolic. Website offline assets and the Android web bundle include the new content.

- Psalms 7 and 8 add 26 individual verse paintings and complete Meaning/Context/Explore/Reflect notes at `#/study/7/1` and `#/study/8/1`. The original draft content has been checked against bundled BSB passages and integrated; all paintings use the approved Psalm 23:2 style. Psalm 7 connects with David without inventing Cush’s identity. Psalm 8 links to David and the later Jesus connections in Matthew 21 and Hebrews 2. Separate progress, private notes, chapter transitions, offline images, and Android asset parity are verified. The next unfinished chapter after that batch was Psalm 9.

- Psalm 9 now adds 20 individual verse studies and symbolic watercolors at `#/study/9/1`. The exact BSB heading, Higgaion, and Selah remain intact. Commentary distinguishes poetic judgment, the care of the afflicted, and the unknown historical occasion. Next sequential chapter: Psalm 10.
- “What are you facing today?” connects all eight everyday needs to curated Psalms, Genesis/Exodus scenes, and character profiles. Shared connections also point back from verse studies, mapped scenes, and people. Reflections on the same verse remain available from topics, studies, reader dialogs, and Saved; saved cards reopen the available verse study. Original story manuscripts and their separate scene reflections remain intact.
