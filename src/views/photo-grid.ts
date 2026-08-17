import type { Photo } from "../data";
import { escapeHtml } from "../utils";

export function photoButton(photo: Photo, index: number, span: number): string {
  const ratio = photo.w && photo.h ? photo.w / photo.h : 0.75;
  return `
    <button
      class="frame"
      type="button"
      data-photo-index="${index}"
      style="--span:${span};--ratio:${ratio}"
    >
      <img
        src="${escapeHtml(photo.src)}"
        alt="${escapeHtml(photo.alt)}"
        width="${photo.w || ""}"
        height="${photo.h || ""}"
        loading="${index < 2 ? "eager" : "lazy"}"
        decoding="async"
      />
    </button>
  `;
}
