# AGENTS.md — Rules for writing Scripture for Life story episodes

These rules apply to any AI assistant (Cursor, Copilot, Gemini CLI, Claude Code, etc.) that writes or edits Bible story episodes in this repo.

## Where episodes live
- **Genesis:** `data/episodes.json` (episodes) + `data/story-scenes.json` (scenes)
- **Exodus:** `data/exodus-episodes.json` + `data/exodus-scenes.json`
- New books follow the Exodus pattern: `data/<book>-episodes.json` + `data/<book>-scenes.json`. Do not wire them into the app code unless asked.
- Scripture source: `data/bible.json` / `data/Berean-Standard-Bible-original.txt` (Berean Standard Bible, BSB).

## 1. Source first
Before writing, quote the exact BSB verses for the episode. Retell only what the text says. Do not invent events, dialogue, names, motives or numbers.

## 2. Structure
- One episode = 6–8 scenes, covering the passage in order, with no gaps or overlaps.
- Each scene covers 2–9 entries of the episode's `paragraphs` array.
- Scene `start` and `end` are **0-based, inclusive** indexes into `paragraphs`. The next scene starts at the previous `end + 1`, and the last scene ends at the last paragraph.

## 3. Verse references
- Every scene has `passage` (verse range, e.g. `"Genesis 2:4–17"`, using an en dash) and `anchor` (one key verse inside that range).
- Anything in quotation marks must match the BSB word for word.

## 4. Imagined details
Keep sensory color to a minimum. Anything not stated in the text never goes in `paragraphs`; put it in `context`, starting with "Imagined detail:".

## 5. Context
`context` = 1–3 sentences of historical or literary background. Where Christians disagree, present the views evenhandedly (see the Creation scene's note on the days of creation). No denominational bias.

## 6. Question
`question` = one open, personal reflection question. No leading or "right answer" wording.

## 7. Tone
Warm, plain and reverent. About an 8th-grade reading level. Use consistent tense. No sermonizing inside `paragraphs`.

## 8. Output format
- Valid JSON only, UTF-8, curly quotes/en dashes like the existing data.
- Episode `id` and scene `id` are strings. The scenes file is an object keyed by episode `id`.
- Append new episodes; **never edit or reorder existing episodes or scenes** unless explicitly asked.
- `art` (Genesis scenes): reuse an existing key (`light`, `garden`, `companions`, `serpent`, `exile`, `brothers`, `offering`, `field`, `world`, `noah`, `flood`, `dove`, `rainbow`, `vineyard`, `building`, `gate`, `door`, `hiding`, `mountain`, `generations`) or propose a new one in your summary. Exodus scenes currently have no `art`.
- `characters` (optional): array of names appearing in the scene, e.g. `["Noah"]`.

### Episode entry shape
```json
{
  "id": "13",
  "book": "Genesis",
  "title": "In the Beginning",
  "subtitle": "Genesis 1 to 3, Berean Standard Bible",
  "description": "The creation of the world, Eden, and the first human choices.",
  "paragraphs": [
    "\"In the beginning God created the heavens and the earth.\"",
    "The earth was formless and void..."
  ]
}
```

### Scene entry shape (inside `"<episode id>": [ ... ]`)
```json
{
  "id": "2",
  "title": "Breath & the Garden",
  "start": 9,
  "end": 13,
  "passage": "Genesis 2:4–17",
  "anchor": "Genesis 2:15",
  "art": "garden",
  "context": "The story moves from the whole world to one person and one garden. Adam is given both meaningful work and a boundary.",
  "question": "What responsibilities in your life feel like something entrusted to your care?",
  "characters": ["Adam"]
}
```

## 9. Self-check before finishing
- List each scene with its `passage` and paragraph range, and confirm the ranges are complete, in order and non-overlapping.
- Flag anything in `paragraphs` that is not in the text.
- Validate the JSON (for example `python3 -m json.tool <file>`).
- Change only the data files for the episode you were asked to write.

## Adding a new book
A new book must be added to `index.html`, the copy list in `scripts/build-web.mjs`, and `sw.js` (cache list plus a version bump). `npm run check` must pass before merging; `verify-web.mjs` (run by `npm run build`) fails if any `index.html` script or stylesheet is missing from `www/`.
