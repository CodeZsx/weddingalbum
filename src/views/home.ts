import { type Album, site } from "../data";
import { escapeHtml, joinMeta } from "../utils";

export function renderHome(albumList: Album[]): string {
  const [a, b] = site.names;
  return `
    <section class="hero">
      <p class="eyebrow">${escapeHtml(site.tagline)}</p>
      <h1 class="hero__names">
        <span>${escapeHtml(a)}</span>
        <i>&</i>
        <span>${escapeHtml(b)}</span>
      </h1>
      <p class="hero__meta">${escapeHtml(joinMeta("婚期", site.dateFormal, site.location))}</p>
      <p class="hero__quote">${escapeHtml(site.quote)}</p>
    </section>

    <section class="albums" id="albums">
      <header class="section-head">
        <p class="eyebrow">Albums</p>
        <h2>相册</h2>
      </header>
      <div class="album-grid">
        ${albumList.map(albumCard).join("")}
      </div>
    </section>
  `;
}

function albumCard(album: Album, index: number): string {
  return `
    <a class="album-card" href="#/album/${encodeURIComponent(album.id)}" style="--i:${index}">
      <div class="album-card__media">
        <img src="${escapeHtml(album.cover)}" alt="${escapeHtml(album.title)}" loading="${index < 2 ? "eager" : "lazy"}" />
      </div>
      <div class="album-card__meta">
        <span class="album-card__en">${escapeHtml(album.en)}</span>
        <h3>${escapeHtml(album.title)}</h3>
        <p>${escapeHtml(joinMeta(album.date, album.location, `${album.photos.length} 张`))}</p>
      </div>
    </a>
  `;
}
