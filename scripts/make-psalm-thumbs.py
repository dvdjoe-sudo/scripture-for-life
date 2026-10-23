"""Make the small square thumbnails used by the Psalms list (#/psalms).

Usage: python3 scripts/make-psalm-thumbs.py assets/psalm37/verse-1-watercolor.webp [...]
Each thumbnail is a centre crop of an existing watercolor (no new art), saved as
assets/psalm-thumbs/<folder>-<file>.webp. smoke-web.mjs fails if one is missing.
"""
import os, sys
from PIL import Image

for src in sys.argv[1:]:
    out = 'assets/psalm-thumbs/' + src.removeprefix('assets/').replace('/', '-')
    im = Image.open(src).convert('RGB')
    w, h = im.size
    s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((192, 192), Image.LANCZOS)
    os.makedirs('assets/psalm-thumbs', exist_ok=True)
    im.save(out, 'WEBP', quality=72, method=6)
    print(out)
