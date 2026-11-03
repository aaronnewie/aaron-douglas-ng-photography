# Aaron Douglas Ng — Photography

My portfolio site. Three photobooks (About, Black & White, Color) that open into galleries.

The site rebuilds itself on GitHub Pages a minute or two after any change. Photos are
resized for the web and stripped of camera/location data automatically. The originals you
upload stay untouched in this repository.

---

## Adding photos (from the GitHub website or app)

Photos live in folders. **Each folder inside a book is one series.**

```
photos/
  black-and-white/
    01 Transit/          <- a series called "Transit"
      method-makers.jpg
      info.txt           <- optional
    02 Still Life/
  color/
    01 Still Life/
    02 Portraits/
  covers/                <- the three book covers
```

**Add photos to a series that already exists**
1. On GitHub, open `photos` → `black-and-white` or `color` → the series folder.
2. Click **Add file → Upload files**.
3. Drag your photos in (or tap *choose your files* on a phone).
4. Click **Commit changes**. That's it. The site updates in a minute or two.

**Start a new series**
1. On your computer, make a folder named with a number and a title, like `03 Night Walks`.
   The number sets the order and is hidden on the site.
2. Put the photos inside it.
3. On GitHub, open `photos/black-and-white` (or `photos/color`), click **Add file → Upload files**,
   and drag the whole folder in. Commit.

**Order of photos** inside a series follows the file names, so `01.jpg, 02.jpg …` or
`a-first.jpg, b-second.jpg` puts them in the order you want.

**Remove a photo**: open it on GitHub, click the **⋯** menu → **Delete file**, then commit.

**Rename or reorder a series**: renaming folders is easiest on a computer with
[GitHub Desktop](https://desktop.github.com/). Change the number at the front to reorder.

### The optional `info.txt`

Put a file called `info.txt` in a series folder (you can create it on GitHub with
**Add file → Create new file**):

```
Oakland · 2026
method-makers.jpg: A BART train passes a wall painted with the words Method Makers
```

- **Line 1** is the small line under the series title.
- **Other lines** (`filename: description`) describe a photo for people using screen readers.
  Skip them if you like.

### Changing a cover

Replace `photos/covers/about.jpg`, `black-and-white.jpg` or `color.jpg` with a new photo
**of the same name** (upload it into `photos/covers` and GitHub will replace the old one).
`about.jpg` is also the portrait on the About page.

### Good to know

- JPG, PNG and WebP work. iPhone photos are usually converted to JPG when you upload them from
  the phone. If one shows up as **.HEIC**, export it as JPG first, because browsers can't show HEIC.
- Very large files are fine (GitHub's limit is 25 MB per photo through the website).
- An empty series shows three dashed "Photo" frames. A series with one or two photos is padded
  up to three. To turn this off, open `index.html`, find `PLACEHOLDERS_UP_TO = 3` and change it to `0`.
  To remove a series entirely, delete its folder.

---

## One-time setup (already done if the site is live)

In the repository on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The address will be `https://<your-username>.github.io/<repository-name>/`.
To use your own domain later, add it under **Settings → Pages → Custom domain**.

## Previewing on your computer (optional)

```
node scripts/build-photos.mjs
python3 -m http.server
```

Then open http://localhost:8000.
