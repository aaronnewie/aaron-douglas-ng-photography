"""Prepares photos for the web, used by the GitHub workflow on a copy of the
site (the originals in the repository are never changed).

For every photo in <site>/photos:
  - turns it upright using its camera orientation
  - drops camera metadata (including GPS location)
  - caps the long edge at 2400px (used by the full-screen viewer)
  - writes a copy at most 1200px wide to <site>/thumbs/ (used by the
    gallery grid, much lighter on phones)
Then adds each photo's width and height to <site>/photos.json so the page
can lay out the grid before the images arrive.

    python3 scripts/resize_photos.py _site
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps

FULL_EDGE = 2400
THUMB_EDGE = 1200
site = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
photos = site / "photos"
thumbs = site / "thumbs"
sizes = {}


def save(im, path, ext, quality):
    path.parent.mkdir(parents=True, exist_ok=True)
    if ext in {".jpg", ".jpeg"}:
        im.convert("RGB").save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    elif ext == ".png":
        im.save(path, "PNG", optimize=True)
    else:
        im.save(path, "WEBP", quality=quality)


for f in sorted(photos.rglob("*")):
    ext = f.suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        continue
    with Image.open(f) as src:
        im = ImageOps.exif_transpose(src)
        im.load()
    im.thumbnail((FULL_EDGE, FULL_EDGE), Image.LANCZOS)
    save(im, f, ext, 84)
    rel = f.relative_to(photos)
    sizes[f.relative_to(site).as_posix()] = im.size
    small = im.copy()
    small.thumbnail((THUMB_EDGE, FULL_EDGE), Image.LANCZOS)
    save(small, thumbs / rel, ext, 80)

manifest = site / "photos.json"
if manifest.exists():
    data = json.loads(manifest.read_text())
    for series in data.values():
        for group in series:
            for p in group["photos"]:
                if p["src"] in sizes:
                    p["w"], p["h"] = sizes[p["src"]]
    manifest.write_text(json.dumps(data, indent=2) + "\n")

print(f"prepared {len(sizes)} photos for the web")
