# Build tools

## Art: sharp (WebP)
All watercolors are WebP (quality 75). `npm run check` runs `scripts/verify-art.mjs`, which fails if any
PNG/JPEG art lacks a WebP version or if two images are byte-identical (every picture must be unique).
To add new art from PNG/JPEG: drop it under `assets/` (or `stories/`), run `npm run art:optimize`
(add `-- --keep` to keep the originals as fallbacks), then point `src=` at the `.webp`.
Existing WebP files are not re-encoded: it saves only ~3% and adds generational loss.

## Phone tests: Playwright (390px)
- `npm run smoke:web` runs the full smoke suite at a 390px phone viewport against the site and the Android web bundle (CI runs it on every PR and push).
- `npm run screenshots` saves 390x844 light and dark screenshots of key pages to `screenshots/`. CI uploads them as the
  **phone-screenshots** artifact on each run (Actions run page -> Artifacts), kept 14 days.

## Lighthouse CI (warn only)
`.github/workflows/lighthouse.yml` runs Lighthouse on every PR at a 390px phone size for Home, Stories and Psalm 23
(config in `lighthouserc.json`). Scores below the targets only **warn**; the job is `continue-on-error` and is not a
required check, so it never blocks a merge. Scores appear in the run's Summary; full HTML reports are in the
**lighthouse-report** artifact. Run locally with `npx @lhci/cli autorun`.

## Service worker VERSION: Workbox (automatic)
`sw.js` keeps its hand-written caching logic (precache `CORE` at install, network-first pages, cache-first
psalm watercolors), so offline behavior is unchanged. What changed is how `VERSION` is set:
- `scripts/update-sw-version.mjs` uses **workbox-build** `getManifest` to get a content revision for every
  file in `CORE`, hashes those plus `sw.js` itself, and writes `VERSION = 'scripture-for-life-shell-v-<hash>'`.
- The **Update service worker version** workflow runs it on every push to `main`, commits `sw.js` if the
  VERSION changed, and requests a GitHub Pages build.
- **Do not hand-bump VERSION in PRs.** Still add new files to `CORE` (`npm run check` tells you which).
- Optional locally: `npm run sw:version` (rewrite) or `node scripts/update-sw-version.mjs --check`.

## Capacitor plugins (Android app)
- **@capacitor/share**: the existing Share buttons call the native Android share sheet in the app
  (`nativeShare()` in `app.js`), then fall back to `navigator.share`, then copy to clipboard on the web.
- **@capacitor/local-notifications** and **@capacitor/preferences**: installed and synced into the Android
  build, **not used by any UI yet**. They make a future opt-in "verse of the day" reminder possible
  (Preferences stores the chosen time; LocalNotifications schedules a daily notification offline).
  Adding that needs a settings toggle and the Android 13+ notification permission prompt.

## Google Play upload: Gradle Play Publisher (inactive until set up)
`scripts/android-play-publisher.mjs` adds Gradle Play Publisher plus release signing to the CI-generated
`android/` project. The **Publish to Google Play** workflow runs only when started by hand and uploads a
signed `.aab` as a **draft** on the chosen track (internal by default). Until the secrets exist it stops
with a clear error. The test APK workflow is unaffected.

What Joseph needs to supply (repo Settings > Secrets and variables > Actions):
1. A Google Play Console developer account with the app created (package `com.scriptureforlife.bible`).
   The first ever upload must be done by hand in Play Console; after that this workflow can upload.
2. `PLAY_SERVICE_ACCOUNT_JSON`: JSON key for a Google Cloud service account with the Google Play
   Android Developer API enabled, invited in Play Console > Users and permissions with release rights.
3. An upload keystore: `UPLOAD_KEYSTORE_BASE64` (`base64 -w0 upload.jks`), `UPLOAD_KEYSTORE_PASSWORD`,
   `UPLOAD_KEY_ALIAS`, `UPLOAD_KEY_PASSWORD`. Keep a safe backup of the keystore.
`versionCode` is the workflow run number, so each upload is higher than the last.
