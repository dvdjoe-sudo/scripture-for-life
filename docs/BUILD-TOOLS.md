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
