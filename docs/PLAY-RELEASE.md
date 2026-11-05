# Google Play release checklist (Joe)

This repo prepares the Android app and listing drafts. **You** must finish Play Console, signing, and secrets. Do **not** commit keystores or service-account JSON to git.

## Already prepared in-repo (see `play/store-prep` / store assets)

- [x] `compileSdk` / `targetSdk` **36**, `versionName` **0.6.0**, `versionCode` **2** via `npm run android:config`
- [x] Adaptive launcher icons from `icon.svg` (`resources/android/`, applied by `android:config`)
- [x] Play hi-res icon `store/icon-512.png` (512×512)
- [x] Feature graphic `store/feature-graphic-1024x500.png` (1024×500)
- [x] Listing copy `store/listing.txt` (short ≤80 chars + full description)
- [x] Phone screenshots under `store/screenshots/` (390×844)
- [x] Privacy policy on GitHub Pages: https://dvdjoe-sudo.github.io/scripture-for-life/privacy.html
- [x] Unused `@capacitor/local-notifications` removed (no notification scheduling in app code)
- [x] Debug APK workflow on `main` / `workflow_dispatch` (test APK only — not Play upload)

## What Joe must do in Play Console / GitHub

### 1. Play Console account & app
1. Create or use a Google Play Console developer account (one-time registration fee).
2. Create app **Scripture for Life**, package **`com.scriptureforlife.bible`** (must match `capacitor.config.json` / Android `applicationId`).
3. Complete **Store listing**: paste short/full description from `store/listing.txt`; upload `store/icon-512.png`, `store/feature-graphic-1024x500.png`, and phone screenshots from `store/screenshots/`.
4. Set privacy policy URL to  
   `https://dvdjoe-sudo.github.io/scripture-for-life/privacy.html`  
   (merge/deploy `privacy.html` to `main` first so Pages serves it).

### 2. Content rating & audience
1. Run the **content rating** questionnaire (IARC). Expected for a Bible reader with no user-generated chat, violence simulation, or ads: typically **Everyone** / low maturity — answer honestly from the live app.
2. Target audience / **News apps** / **COVID** declarations: answer per current Play forms (this app is not a news or COVID app).

### 3. Data safety (prefilled answers — confirm against current code before submit)

| Question area | Suggested answer (verify) |
|---|---|
| Collects personal info? | **No** (no accounts; notes stay on device; no first-party analytics backend in code) |
| Shares data with third parties? | **No** (optional outbound links / OS share / OS TTS are user-initiated or system-controlled) |
| Encrypted in transit? | N/A for collected data; site/app assets over HTTPS on Pages / Play delivery |
| Users can request deletion? | Local-only: clear app storage / uninstall |
| Encrypted at rest? | OS / WebView storage defaults |
| Data used for ads / fraud / personalization? | **No** |
| Required vs optional | No account; all local features optional |
| Sensitive permissions | **Internet** only for WebView/content and possible system TTS networking |

Update this table if you add analytics, accounts, crash reporting, or notifications later.

### 4. App signing & upload key (you create — never commit)

1. Generate an **upload keystore** locally, e.g.:

```bash
keytool -genkeypair -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

2. Enroll in **Play App Signing** (Play holds the app signing key; you keep the upload key).
3. Build a signed App Bundle for upload (CI path below) or locally with the same passwords.

### 5. GitHub Actions secrets (for `.github/workflows/play-publish.yml`)

Set these repository secrets (Settings → Secrets and variables → Actions). **Do not** paste them into chat or commit them:

| Secret | Purpose |
|---|---|
| `PLAY_SERVICE_ACCOUNT_JSON` | Full JSON key for a Google Cloud service account with Play Console API access to this app |
| `UPLOAD_KEYSTORE_BASE64` | `base64 -w0 upload-keystore.jks` (or macOS `base64 -i upload-keystore.jks`) |
| `UPLOAD_KEYSTORE_PASSWORD` | Keystore password |
| `UPLOAD_KEY_ALIAS` | Usually `upload` |
| `UPLOAD_KEY_PASSWORD` | Key password |

Then run **Actions → Publish to Google Play → Run workflow** (manual). It uploads a **draft** bundle to the chosen track (`internal` recommended first). `PLAY_VERSION_CODE` uses the workflow run number — ensure it stays higher than any version already on Play (local config currently documents `versionCode` 2 for non-Play debug builds).

### 6. Before first production release
- [ ] Internal testing track install on a real device
- [ ] Confirm privacy URL loads and matches Data safety
- [ ] Confirm launcher icon / feature graphic look correct on device and store listing preview
- [ ] Confirm no notification permission prompts (plugin removed)
- [ ] Bump `versionName` / ensure Play `versionCode` increases for every upload
- [ ] Review restricted-content and export-compliance declarations in Play Console

### 7. Out of scope for agents
- Creating keystores or cloud keys
- Storing or printing secret values
- Merging release PRs without your approval
- Publishing to production without your explicit request
