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
let animToken = 0;
let stripRange = "";

export function mountImmersive() {
  if (root) return root;
  root = document.createElement("div");
  root.className = "imm";
  root.hidden = true;
  root.innerHTML = `
    <div class="imm__stage" data-stage tabindex="-1">
      <header class="imm__bar">
        <button class="imm__back" type="button" data-close aria-label="返回">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H6.5M11.5 6 6 12l5.5 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="imm__count"></span>
      </header>
      <button class="imm__hit imm__hit--prev" type="button" data-prev aria-label="上一张"></button>
      <button class="imm__hit imm__hit--mid" type="button" data-toggle aria-label="显示或隐藏控件"></button>
      <div class="imm__frame">
        <img class="imm__image" alt="" />
        <img class="imm__image" alt="" />
      </div>
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
    if (target.closest("[data-toggle]")) {
      if (Math.abs(touchDeltaX) > 24) return;
      toggleChrome();
    }
    const thumb = target.closest<HTMLElement>("[data-jump]");
    if (thumb) jumpTo(Number(thumb.dataset.jump));
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

  const strip = root.querySelector(".imm__strip") as HTMLElement;
  new ResizeObserver(() => {
    if (!root?.hidden) renderStrip();
  }).observe(strip);

  return root;
}

export function openImmersive(photos: Photo[], index: number) {
  const el = mountImmersive();
  state.photos = photos;
  state.index = index;
  stripRange = "";
  el.classList.remove("is-chrome-off");
  el.hidden = false;
  document.body.classList.add("is-locked");
  void showPhoto(0);
  renderStrip();
  requestAnimationFrame(renderStrip);
  (el.querySelector("[data-stage]") as HTMLElement).focus({ preventScroll: true });
}

function toggleChrome() {
  if (!root) return;
  root.classList.toggle("is-chrome-off");
  requestAnimationFrame(renderStrip);
}

export function closeImmersive() {
  if (!root) return;
  root.hidden = true;
  document.body.classList.remove("is-locked");
}

function step(delta: number) {
  if (!state.photos.length) return;
  state.index = (state.index + delta + state.photos.length) % state.photos.length;
  void showPhoto(delta > 0 ? 1 : -1);
  renderStrip();
}

function jumpTo(index: number) {
  if (index === state.index) return;
  const direction = index > state.index ? 1 : -1;
  state.index = index;
  void showPhoto(direction);
  renderStrip();
}

function sameSrc(image: HTMLImageElement, src: string): boolean {
  return image.getAttribute("src") === src || image.src.endsWith(src);
}

async function showPhoto(direction: -1 | 0 | 1) {
  if (!root) return;
  const photo = state.photos[state.index];
  if (!photo) return;

  const count = root.querySelector(".imm__count") as HTMLElement;
  count.textContent = `${state.index + 1} / ${state.photos.length}`;

  const images = [...root.querySelectorAll<HTMLImageElement>(".imm__image")];
  const active = images.find((image) => image.classList.contains("is-active"));
  if (active && sameSrc(active, photo.src)) {
    active.alt = photo.alt;
    return;
  }

  const incoming = images.find((image) => image !== active) ?? images[0];
  const token = ++animToken;
  incoming.className = "imm__image";
  incoming.alt = photo.alt;
  incoming.src = photo.src;

  try {
    if (!incoming.complete) await incoming.decode();
    else await incoming.decode();
  } catch {
    /* empty */
  }
  if (token !== animToken || !root) return;

  const instant = prefersReducedMotion() || direction === 0 || !active;
  if (instant) {
    incoming.className = "imm__image is-active";
    if (active) active.className = "imm__image";
    preload(state.photos[state.index + 1]?.src);
    preload(state.photos[state.index - 1]?.src);
    return;
  }

  incoming.classList.add(direction > 0 ? "is-from-right" : "is-from-left");
  incoming.getBoundingClientRect();
  incoming.classList.add("is-animating", "is-active");
  incoming.classList.remove("is-from-right", "is-from-left");

  active.classList.add("is-animating", direction > 0 ? "is-to-left" : "is-to-right");
  active.classList.remove("is-active");

  const finish = () => {
    if (token !== animToken) return;
    active.className = "imm__image";
    incoming.classList.remove("is-animating");
  };
  active.addEventListener("transitionend", finish, { once: true });
  window.setTimeout(finish, 640);

  preload(state.photos[state.index + 1]?.src);
  preload(state.photos[state.index - 1]?.src);
}

function thumbCount(strip: HTMLElement): number {
  const styles = getComputedStyle(strip);
  const pad = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const gap = parseFloat(styles.columnGap || styles.gap) || 8;
  const minThumb = strip.clientWidth < 720 ? 52 : 72;
  const inner = Math.max(0, strip.clientWidth - pad);
  return Math.max(3, Math.floor((inner + gap) / (minThumb + gap)));
}

function renderStrip() {
  if (!root) return;
  const strip = root.querySelector(".imm__strip") as HTMLElement;
  const total = state.photos.length;
  if (!total) {
    strip.innerHTML = "";
    return;
  }

  const windowSize = Math.min(total, thumbCount(strip));
  const half = Math.floor(windowSize / 2);
  let start = state.index - half;
  let end = start + windowSize - 1;
  if (start < 0) {
    end += -start;
    start = 0;
  }
  if (end > total - 1) {
    start = Math.max(0, start - (end - (total - 1)));
    end = total - 1;
  }

  const range = `${start}:${end}`;
  strip.classList.toggle("is-short", end - start + 1 < windowSize);

  if (range === stripRange) {
    strip.querySelectorAll<HTMLElement>("[data-jump]").forEach((thumb) => {
      thumb.classList.toggle("is-current", Number(thumb.dataset.jump) === state.index);
    });
  } else {
    stripRange = range;
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
  }

  if (strip.scrollWidth > strip.clientWidth) {
    strip.querySelector(".is-current")?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }
}

function preload(src?: string) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}
