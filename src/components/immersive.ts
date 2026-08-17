import type { Photo } from "../data";
import { escapeHtml, prefersReducedMotion } from "../utils";

type ImmersiveState = {
  photos: Photo[];
  index: number;
};

const state: ImmersiveState = {
  photos: [],
  index: 0,
};

let root: HTMLElement | null = null;
let touchStartX = 0;
let touchDeltaX = 0;

export function mountImmersive() {
  if (root) return root;
  root = document.createElement("div");
  root.className = "imm";
  root.hidden = true;
  root.innerHTML = `
    <header class="imm__bar">
      <button class="imm__text" type="button" data-close>退出</button>
      <span class="imm__count"></span>
    </header>
    <div class="imm__stage" data-stage>
      <button class="imm__hit imm__hit--prev" type="button" data-prev aria-label="上一张"></button>
      <img class="imm__image" alt="" />
      <button class="imm__hit imm__hit--next" type="button" data-next aria-label="下一张"></button>
    </div>
    <nav class="imm__strip" aria-label="前后预览"></nav>
  `;
  document.body.append(root);

  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-close]")) closeImmersive();
    if (target.closest("[data-prev]")) step(-1);
    if (target.closest("[data-next]")) step(1);
    const thumb = target.closest<HTMLElement>("[data-jump]");
    if (thumb) {
      state.index = Number(thumb.dataset.jump);
      renderFrame();
    }
  });

  const stage = root.querySelector("[data-stage]") as HTMLElement;
  stage.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? 0;
      touchDeltaX = 0;
    },
    { passive: true },
  );
  stage.addEventListener(
    "touchmove",
    (event) => {
      touchDeltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
    },
    { passive: true },
  );
  stage.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 48) step(touchDeltaX > 0 ? -1 : 1);
  });

  document.addEventListener("keydown", (event) => {
    if (root?.hidden) return;
    if (event.key === "Escape") closeImmersive();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });

  return root;
}

export function openImmersive(photos: Photo[], index: number) {
  const el = mountImmersive();
  state.photos = photos;
  state.index = index;
  el.hidden = false;
  document.body.classList.add("is-locked");
  renderFrame();
  (el.querySelector("[data-close]") as HTMLButtonElement).focus();
}

export function closeImmersive() {
  if (!root) return;
  root.hidden = true;
  document.body.classList.remove("is-locked");
}

function step(delta: number) {
  if (!state.photos.length) return;
  state.index = (state.index + delta + state.photos.length) % state.photos.length;
  renderFrame();
}

function renderFrame() {
  if (!root) return;
  const photo = state.photos[state.index];
  if (!photo) return;

  const image = root.querySelector(".imm__image") as HTMLImageElement;
  const count = root.querySelector(".imm__count") as HTMLElement;
  const strip = root.querySelector(".imm__strip") as HTMLElement;

  if (!prefersReducedMotion()) image.style.opacity = "0";
  image.src = photo.src;
  image.alt = photo.alt;
  image.onload = () => {
    image.style.opacity = "1";
  };
  count.textContent = `${state.index + 1} / ${state.photos.length}`;

  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  let start = state.index - half;
  let end = state.index + half;
  if (start < 0) {
    end += -start;
    start = 0;
  }
  if (end > state.photos.length - 1) {
    start = Math.max(0, start - (end - (state.photos.length - 1)));
    end = state.photos.length - 1;
  }

  strip.innerHTML = state.photos
    .slice(start, end + 1)
    .map((item, offset) => {
      const index = start + offset;
      const current = index === state.index ? " is-current" : "";
      return `
        <button class="imm__thumb${current}" type="button" data-jump="${index}" aria-label="第 ${index + 1} 张">
          <img src="${escapeHtml(item.src)}" alt="" loading="lazy" decoding="async" />
        </button>
      `;
    })
    .join("");

  const currentThumb = strip.querySelector(".is-current");
  currentThumb?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });

  preload(state.photos[state.index + 1]?.src);
  preload(state.photos[state.index - 1]?.src);
}

function preload(src?: string) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}
