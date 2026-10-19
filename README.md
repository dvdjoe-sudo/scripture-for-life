# Scripture for Life — Original Home Screen Restored

This review branch restores the **actual first-release home screen, original Psalm 23 scene() vector artwork, original Psalm 23 study, navigation, and original CSS** directly from historical commit `adb60cfbc4823ee424492e8a179ebde3cfbb761b` (not an imitation). The only changes in original styling are small-screen overflow fixes and a new, matching Genesis-story stylesheet. Three full Genesis episodes and their 20 scene interpretations are retained using `data/episodes.json` and `data/story-scenes.json`.

Run with `python3 -m http.server 8000`, then view `http://localhost:8000`. Click People & stories → Explore Genesis stories. The Bible reader uses the existing public-domain BSB `data/bible.json`.

## Source of visuals
Home and Psalm 23 artwork: original SVG `scene()` generator in `app.js` from Git history. All Genesis artwork in the revised reader is rendered by that same original landscape function, using different original palettes. The old v4 scene assets remain in the repo for future decisions and are not used on the restored homepage.

This is a **draft-review branch only**. Not merged into `main`, not a published website, and not a finished Google Play release.
