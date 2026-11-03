"""Shrinks every photo in a folder to web size, in place.

Used by the GitHub workflow on a copy of the site, so the originals in the
repository are never changed. Long edge is capped at 2400px, the photo is
turned upright using its camera orientation, and camera metadata (including
GPS location) is dropped.

    python3 scripts/resize_photos.py _site/photos
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

MAX_EDGE = 2400
root = Path(sys.argv[1] if len(sys.argv) > 1 else "photos")
done = 0
for f in sorted(root.rglob("*")):
    ext = f.suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        continue
    with Image.open(f) as im:
        im = ImageOps.exif_transpose(im)
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        if ext in {".jpg", ".jpeg"}:
            im.convert("RGB").save(f, "JPEG", quality=84, optimize=True, progressive=True)
        elif ext == ".png":
            im.save(f, "PNG", optimize=True)
        else:
            im.save(f, "WEBP", quality=84)
    done += 1
print(f"resized {done} photos for the web")
