# Scripture for Life

A quiet place to meet God's Word. Scripture for Life is a static website to:

- **Find help**: Bible passages for real-life moments (fear, grief, loneliness and more), with gentle reflection prompts.
- **People & stories**: illustrated, scene-by-scene Genesis stories (In the Beginning; Cain and Abel), each with the exact Scripture, an interpretive note and a reflection question.
- **Read the Bible**: every chapter of the public-domain Berean Standard Bible (BSB), with read-aloud.
- **Study**: a close look at Psalm 23.
- **Saved**: saved verses and personal notes, kept only in your browser.

Plain HTML, CSS and JavaScript, with no build step and no backend.

## Files

- `index.html`, `styles.css`, `app.js`: the site
- `data/bible.json`: full BSB text used by the reader
- `data/episodes.json`, `data/story-scenes.json`: Genesis story content
- `assets/scenes/*.svg`: story illustrations
- `data/Berean-Standard-Bible-original.txt`: original public-domain BSB text (from bereanbible.com)
- `standalone.html`: a single-file version with all data built in. It works when opened directly, even offline.

## View it

Run a local web server in this folder, then open http://localhost:8000:

```
python3 -m http.server
```

Opening `index.html` directly as a file won't load the data files, so use the server, or open `standalone.html` instead.

Bible text: Berean Standard Bible, public domain (https://berean.bible).
