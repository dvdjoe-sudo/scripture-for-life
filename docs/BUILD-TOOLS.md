# Build tools

## Art: sharp (WebP)
All watercolors are WebP (quality 75). `npm run check` runs `scripts/verify-art.mjs`, which fails if any
PNG/JPEG art lacks a WebP version or if two images are byte-identical (every picture must be unique).
To add new art from PNG/JPEG: drop it under `assets/` (or `stories/`), run `npm run art:optimize`
(add `-- --keep` to keep the originals as fallbacks), then point `src=` at the `.webp`.
Existing WebP files are not re-encoded: it saves only ~3% and adds generational loss.
