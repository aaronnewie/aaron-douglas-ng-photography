// Builds photos.json from the folders in photos/.
//
//   photos/black-and-white/01 Transit/any-photo.jpg
//   photos/color/02 Portraits/another.jpg
//
// Each folder inside a book is one series. The number at the front of the
// folder name sets the order and is hidden on the site ("01 Transit" -> "Transit").
// Photos inside a series are shown in the order info.txt lists them (the
// site editor at /edit.html writes that list); any photo not listed follows,
// in filename order.
//
// Optional info.txt in a series folder:
//   line 1:          the small line under the series title, e.g. "Bay Area · 2026"
//   later lines:     one photo per line, in display order:
//                      filename.jpg
//                      filename.jpg: description for screen readers (alt text)
//
// Usage:
//   node scripts/build-photos.mjs          writes ./photos.json (for previewing locally)
//   node scripts/build-photos.mjs _site    used by the GitHub workflow

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.argv[2] || ".";
const BOOKS = ["black-and-white", "color"];
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;

const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const tidy = s => s.replace(/^\d+[\s._-]*/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
// camera-style names ("DSC_0426", "P1040077", "IMG 2201 2") don't make useful descriptions
const cameraName = /^(dsc[fn]?|img|pxl|crw|p\d+|r\d{3,}|\d+)[\s\d-]*$/i;
const PHOTO_LINE = /^([^:]+\.(?:jpe?g|png|webp|avif|gif))\s*(?::\s*(.*))?$/i;

async function readInfo(dir) {
  try {
    const lines = (await readFile(path.join(dir, "info.txt"), "utf8")).split(/\r?\n/).map(l => l.trim());
    const note = lines.find(l => l && !PHOTO_LINE.test(l)) || "";
    const alts = {}, order = [];
    for (const l of lines) {
      const m = l.match(PHOTO_LINE);
      if (!m) continue;
      const name = m[1].trim().toLowerCase();
      order.push(name);
      if (m[2]) alts[name] = m[2].trim();
    }
    return { note, alts, order };
  } catch { return { note: "", alts: {}, order: [] }; }
}

const out = {};
let count = 0;
for (const book of BOOKS) {
  out[book] = [];
  const dir = path.join(root, "photos", book);
  let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { continue; }
  const folders = entries.filter(e => e.isDirectory()).map(e => e.name).sort(byName);
  const loose = entries.filter(e => e.isFile() && IMAGE.test(e.name)).map(e => e.name).sort(byName);
  if (loose.length) folders.unshift("");            // photos dropped straight into the book folder
  for (const folder of folders) {
    const sdir = path.join(dir, folder);
    const { note, alts, order } = folder ? await readInfo(sdir) : { note: "", alts: {}, order: [] };
    const rank = n => { const i = order.indexOf(n.toLowerCase()); return i < 0 ? Infinity : i; };
    const files = (folder ? (await readdir(sdir)).filter(n => IMAGE.test(n)) : loose)
      .sort((a, b) => (rank(a) - rank(b)) || byName(a, b));
    const title = folder ? tidy(folder) : "";
    const photos = files.map(name => {
      const base = path.parse(name).name;
      const fallback = cameraName.test(tidy(base)) ? `${title || "Photograph"}` : tidy(base);
      return { src: ["photos", book, folder, name].filter(Boolean).join("/"), alt: alts[name.toLowerCase()] || fallback };
    });
    count += photos.length;
    out[book].push({ title, note, photos });
  }
}

await writeFile(path.join(root, "photos.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`photos.json: ${count} photos in ${out["black-and-white"].length + out.color.length} series`);
