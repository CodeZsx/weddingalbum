import { albums, site } from "../data";
import {
  getGithubToken,
  isAdmin,
  isAlbumOn,
  isPhotoOn,
  loginAdmin,
  logoutAdmin,
  publishVisibility,
  setAlbumOn,
  setGithubToken,
  setPhotoOn,
} from "../visibility";
import { escapeHtml } from "../utils";

export function renderAdmin(): string {
  if (!isAdmin()) {
    return `
      <section class="admin">
        <p class="eyebrow">Admin</p>
        <h1>管理</h1>
        <p class="admin__lead">上下线相册和单张照片。访客只看上线的内容。</p>
        <form class="admin__login" data-login>
          <label>
            <span>口令</span>
            <input type="password" name="password" autocomplete="current-password" />
          </label>
          <button class="admin__btn" type="submit">进入</button>
          <p class="admin__msg" data-msg hidden></p>
        </form>
      </section>
    `;
  }

  return `
    <section class="admin">
      <p class="eyebrow">Admin</p>
      <h1>管理</h1>
      <p class="admin__lead">点选即可上下线。填一次 GitHub Token 后，改动会直接写到仓库，访客刷新就能看到，不用重新发布网站。</p>
      <label class="admin__token">
        <span>GitHub Token（只存在这台电脑）</span>
        <input type="password" data-token value="${escapeHtml(getGithubToken())}" placeholder="ghp_ 开头，勾选 repo 权限" autocomplete="off" />
      </label>
      <div class="admin__actions">
        <button class="admin__btn" type="button" data-save>保存，立即生效</button>
        <button class="admin__btn admin__btn--ghost" type="button" data-logout>退出</button>
      </div>
      <p class="admin__msg" data-msg hidden></p>
      ${albums.map(albumBlock).join("")}
    </section>
  `;
}

function albumBlock(album: (typeof albums)[number]): string {
  const on = isAlbumOn(album.id);
  const hiddenCount = album.photos.filter((photo) => !isPhotoOn(album.id, photo.id)).length;
  return `
    <article class="admin-album${on ? "" : " is-album-off"}" data-album="${escapeHtml(album.id)}">
      <header class="admin-album__head">
        <label class="switch">
          <input type="checkbox" data-album-on ${on ? "checked" : ""} />
          <span>${escapeHtml(album.title)}</span>
        </label>
        <span class="admin-album__meta">${album.photos.length} 张${hiddenCount ? ` · ${hiddenCount} 张已下线` : ""}</span>
      </header>
      <div class="admin-album__photos">
        ${album.photos
          .map((photo) => {
            const photoOn = isPhotoOn(album.id, photo.id);
            const ratio = photo.w && photo.h ? photo.w / photo.h : 0.75;
            return `
              <label class="admin-shot${photoOn ? "" : " is-off"}" style="--ratio:${ratio}">
                <input type="checkbox" data-photo="${escapeHtml(photo.id)}" ${photoOn ? "checked" : ""} />
                <span class="admin-shot__media">
                  <img data-src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" decoding="async" />
                </span>
                <span class="admin-shot__name">${escapeHtml(photo.id)}</span>
              </label>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

export function bindAdmin(root: HTMLElement) {
  const msg = root.querySelector("[data-msg]") as HTMLElement | null;
  const say = (text: string) => {
    if (!msg) return;
    msg.hidden = false;
    msg.textContent = text;
  };

  root.querySelector<HTMLFormElement>("[data-login]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const password = String(new FormData(form).get("password") ?? "");
    if (!loginAdmin(password, site.adminPassword)) {
      say("口令不对。");
      return;
    }
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  root.querySelector("[data-logout]")?.addEventListener("click", () => {
    logoutAdmin();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  const tokenInput = root.querySelector<HTMLInputElement>("[data-token]");
  tokenInput?.addEventListener("change", () => {
    setGithubToken(tokenInput.value);
  });

  let saveTimer = 0;
  let saving = false;
  let saveAgain = false;
  const saveNow = async () => {
    window.clearTimeout(saveTimer);
    if (tokenInput) setGithubToken(tokenInput.value);
    if (saving) {
      saveAgain = true;
      return;
    }
    saving = true;
    say("正在保存…");
    try {
      do {
        saveAgain = false;
        const result = await publishVisibility();
        say(result.message);
      } while (saveAgain);
    } finally {
      saving = false;
    }
  };
  const saveSoon = () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      void saveNow();
    }, 900);
  };

  root.querySelector("[data-save]")?.addEventListener("click", () => {
    void saveNow();
  });

  const preview = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const image = entry.target as HTMLImageElement;
        const src = image.dataset.src;
        if (src) {
          image.src = src;
          image.removeAttribute("data-src");
        }
        preview.unobserve(image);
      }
    },
    { rootMargin: "240px 0px" },
  );
  root.querySelectorAll<HTMLImageElement>("img[data-src]").forEach((image) => preview.observe(image));

  const recount = (block: HTMLElement) => {
    const meta = block.querySelector(".admin-album__meta");
    if (!meta) return;
    const total = block.querySelectorAll(".admin-shot").length;
    const hidden = block.querySelectorAll(".admin-shot.is-off").length;
    meta.textContent = `${total} 张${hidden ? ` · ${hidden} 张已下线` : ""}`;
  };

  root.querySelectorAll<HTMLElement>("[data-album]").forEach((block) => {
    const albumId = block.dataset.album ?? "";
    block.querySelector<HTMLInputElement>("[data-album-on]")?.addEventListener("change", (event) => {
      const checked = (event.currentTarget as HTMLInputElement).checked;
      setAlbumOn(albumId, checked);
      block.classList.toggle("is-album-off", !checked);
      saveSoon();
    });
    block.querySelectorAll<HTMLInputElement>("[data-photo]").forEach((input) => {
      input.addEventListener("change", () => {
        setPhotoOn(albumId, input.dataset.photo ?? "", input.checked);
        input.closest(".admin-shot")?.classList.toggle("is-off", !input.checked);
        recount(block);
        saveSoon();
      });
    });
  });
}
