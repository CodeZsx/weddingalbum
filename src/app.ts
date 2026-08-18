import { albums, getAlbum, site } from "./data";
import { closeImmersive, mountImmersive, openImmersive } from "./components/immersive";
import { navigate, parseHash, type Route } from "./router";
import { escapeHtml, joinMeta, monogramMark } from "./utils";
import { isAdmin, loadVisibility, publishedAlbums } from "./visibility";
import { renderAbout } from "./views/about";
import { bindAdmin, renderAdmin } from "./views/admin";
import { renderAlbum } from "./views/album";
import { renderHome } from "./views/home";
import { renderInvite } from "./views/invite";

export async function startApp(root: HTMLElement) {
  mountImmersive();
  await loadVisibility();
  window.addEventListener("hashchange", () => render(root));
  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const route = parseHash();
    if (route.name !== "album") return;
    const album = getAlbum(route.id, publishedAlbums(albums));
    if (!album) return;
    if (target.closest("[data-immersive]")) {
      openImmersive(album.photos, 0);
      return;
    }
    const photo = target.closest<HTMLElement>("[data-photo-index]");
    if (!photo) return;
    openImmersive(album.photos, Number(photo.dataset.photoIndex));
  });

  if (!window.location.hash) {
    window.location.replace("#/");
  }
  render(root);
}

function render(root: HTMLElement) {
  closeImmersive();
  const route = parseHash();
  const visible = publishedAlbums(albums);
  const [a, b] = site.names;

  if (route.name === "invite") {
    root.innerHTML = renderInvite(route.style);
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `邀请函 · ${a} & ${b}`;
    return;
  }

  root.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#/">
        ${monogramMark(36)}
        <span>${escapeHtml(a)} <i>&</i> ${escapeHtml(b)}</span>
      </a>
      <nav class="nav">
        <a href="#/" data-nav="home">相册</a>
        <a href="#/invite/letter" data-nav="invite">邀请</a>
        <a href="#/about" data-nav="about">关于</a>
        ${isAdmin() ? `<a href="#/admin" data-nav="admin">管理</a>` : ""}
      </nav>
    </header>
    <main id="content" class="page">
      ${view(route, visible)}
    </main>
    <footer class="site-footer">
      <span class="site-footer__mark">${monogramMark(28)}</span>
      <span>${escapeHtml(joinMeta(site.date, site.location))}</span>
    </footer>
  `;

  const active = route.name === "about" || route.name === "admin" ? route.name : "home";
  root.querySelector(`[data-nav="${active}"]`)?.classList.add("is-active");
  if (route.name === "admin") bindAdmin(root);
  window.scrollTo({ top: 0, behavior: "instant" });
  document.title =
    route.name === "album"
      ? `${getAlbum(route.id, visible)?.title ?? "相册"} · ${a} & ${b}`
      : route.name === "about"
        ? `关于 · ${a} & ${b}`
        : route.name === "admin"
          ? `管理 · ${a} & ${b}`
          : `${a} & ${b} · 婚纱相册`;
}

function view(route: Route, visible: typeof albums): string {
  if (route.name === "about") return renderAbout();
  if (route.name === "admin") return renderAdmin();
  if (route.name === "album") {
    const album = getAlbum(route.id, visible);
    if (!album) {
      navigate({ name: "home" });
      return renderHome(visible);
    }
    return renderAlbum(album);
  }
  return renderHome(visible);
}
