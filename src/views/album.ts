import { type Album } from "../data";
import { photoButton } from "./photo-grid";
import { escapeHtml, joinMeta, spanForIndex } from "../utils";

export function renderAlbum(album: Album): string {
  return `
    <section class="album-hero">
      <a class="back" href="#/">回到相册</a>
      <p class="eyebrow">${escapeHtml(album.en)}</p>
      <h1>${escapeHtml(album.title)}</h1>
      <p class="album-hero__meta">${escapeHtml(joinMeta(album.date, album.location, `${album.photos.length} 张`))}</p>
      <p class="album-hero__desc">${escapeHtml(album.description)}</p>
    </section>
    <section class="gallery" aria-label="${escapeHtml(album.title)}">
      ${album.photos.map((photo, index) => photoButton(photo, index, spanForIndex(index, album.photos.length))).join("")}
    </section>
    <p class="gallery-hint">点开一张，其余的会跟着来</p>
    <button class="imm-fab" type="button" data-immersive>一张一张看</button>
  `;
}
