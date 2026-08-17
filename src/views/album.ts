import { type Album } from "../data";
import { photoButton } from "./photo-grid";
import { escapeHtml, joinMeta, spanForIndex } from "../utils";

export function renderAlbum(album: Album): string {
  return `
    <section class="album-hero">
      <a class="back" href="#/">全部相册</a>
      <p class="eyebrow">${escapeHtml(album.en)}</p>
      <h1>${escapeHtml(album.title)}</h1>
      <p class="album-hero__meta">${escapeHtml(joinMeta(album.date, album.location, `${album.photos.length} 张`))}</p>
      <p class="album-hero__desc">${escapeHtml(album.description)}</p>
      <button class="imm-launch" type="button" data-immersive>沉浸式观看</button>
    </section>
    <section class="gallery" aria-label="${escapeHtml(album.title)}">
      ${album.photos.map((photo, index) => photoButton(photo, index, spanForIndex(index, album.photos.length))).join("")}
    </section>
    <p class="gallery-hint">点击照片进入沉浸式 · 左右滑动或方向键翻页</p>
  `;
}
