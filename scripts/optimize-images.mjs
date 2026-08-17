import { readdir, rename, stat, unlink } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const albumsRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public", "albums");
const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const concurrency = 3;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

async function optimize(file) {
  const info = await stat(file);
  const meta = await sharp(file).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const needsResize = longEdge > 1920;
  const needsReencode = info.size > 450_000 || needsResize || extname(file).toLowerCase() !== ".jpg";
  const label = relative(albumsRoot, file);

  if (!needsReencode) {
    console.log(`skip ${label}`);
    return;
  }

  const out = file.replace(/\.[^.]+$/, ".jpg");
  const tmp = `${out}.${process.pid}.tmp.jpg`;
  await sharp(file)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(tmp);
  await rename(tmp, out);
  if (out !== file) await unlink(file);
  const after = await stat(out);
  console.log(`optimized ${relative(albumsRoot, out)} ${Math.round(info.size / 1024)}kb -> ${Math.round(after.size / 1024)}kb`);
}

const files = (await walk(albumsRoot)).filter((file) => allowed.has(extname(file).toLowerCase()));
let index = 0;
let failed = 0;

async function worker() {
  while (index < files.length) {
    const current = files[index++];
    try {
      await optimize(current);
    } catch (error) {
      failed += 1;
      console.error(`fail ${relative(albumsRoot, current)}:`, error);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
if (failed) process.exit(1);
console.log(`done ${files.length} files`);
