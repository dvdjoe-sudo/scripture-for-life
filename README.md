# Scripture for Life

A peaceful Bible companion that places God's Word first. This repository's **main** branch contains the approved original warm-ivory, forest-green design and Psalm 23 illustration, alongside newer interactive Genesis storytelling.

## Live website

https://dvdjoe-sudo.github.io/scripture-for-life/

GitHub Pages can be configured under **Settings → Pages** to publish the `main` branch from `/(root)`. If Pages still publishes another branch, switching to `main` is a separate repository-setting change; merging alone doesn't change the Pages publishing source.

## What works today

- Find Bible passages for real-life circumstances, with links to original Scripture.
- Read the public-domain Berean Standard Bible (BSB), including Psalm 23's original visual devotional study.
- Optionally walk through Psalm 23 in six illustrated scenes at `#/walk/23/1`, with Scripture first, narration, contextual interpretation, meaningful imagery, optional private reflections, progress on this device, suggested prayers, and links to David and the original Psalm study. The original `#/study/23/1` experience remains available.
- Explore Genesis Episodes 1–12, 92 illustrated story scenes, narration and reflections.
- Browse all 66 books in the Bible Journey.
- Save verses and personal notes locally in the current browser.
- The current homepage and Psalm 23 landscape art are restored from original Git history; newer Genesis story scenes use the same SVG landscape generator. The separate Psalm walk adds six symbolic overlays in the same approved editorial palette; these are not historical reconstructions.
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
