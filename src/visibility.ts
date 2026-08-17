import { type Album, site } from "./data";

export type Visibility = {
  albums: Record<string, { on: boolean; off: string[] }>;
};

const DRAFT_KEY = "weddingalbum-visibility";
const AUTH_KEY = "weddingalbum-admin";
const TOKEN_KEY = "weddingalbum-github-token";

let fileState: Visibility = { albums: {} };
let remoteSha = "";
let draft: Visibility | null = null;

function clone(value: Visibility): Visibility {
  return JSON.parse(JSON.stringify(value)) as Visibility;
}

function decodeBase64(value: string): string {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function githubHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function githubContentsUrl(): string {
  return `https://api.github.com/repos/${site.githubRepo}/contents/${site.visibilityFile}`;
}

async function loadBundledVisibility(): Promise<Visibility> {
  try {
    const response = await fetch("./visibility.json", { cache: "no-store" });
    if (response.ok) return (await response.json()) as Visibility;
  } catch {
    /* empty */
  }
  return { albums: {} };
}

async function loadRemoteVisibility(
  token = getGithubToken(),
): Promise<{ vis: Visibility; sha: string } | null> {
  try {
    const response = await fetch(githubContentsUrl(), {
      headers: githubHeaders(token),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { content?: string; sha?: string };
    if (!payload.content || !payload.sha) return null;
    return { vis: JSON.parse(decodeBase64(payload.content)) as Visibility, sha: payload.sha };
  } catch {
    return null;
  }
}

export async function loadVisibility() {
  const remote = await loadRemoteVisibility();
  if (remote) {
    fileState = remote.vis;
    remoteSha = remote.sha;
  } else {
    fileState = await loadBundledVisibility();
    remoteSha = "";
  }
  if (isAdmin()) {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        draft = JSON.parse(raw) as Visibility;
      } catch {
        draft = null;
      }
    }
  } else {
    draft = null;
  }
}

export function currentVisibility(): Visibility {
  return draft ?? fileState;
}

export function isAdmin(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function loginAdmin(password: string, expected: string): boolean {
  if (password !== expected) return false;
  sessionStorage.setItem(AUTH_KEY, "1");
  const raw = localStorage.getItem(DRAFT_KEY);
  if (raw) {
    try {
      draft = JSON.parse(raw) as Visibility;
    } catch {
      draft = clone(fileState);
    }
  } else {
    draft = clone(fileState);
  }
  return true;
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
  draft = null;
}

export function getGithubToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setGithubToken(token: string) {
  const next = token.trim();
  if (next) localStorage.setItem(TOKEN_KEY, next);
  else localStorage.removeItem(TOKEN_KEY);
}

function albumEntry(id: string) {
  const vis = currentVisibility();
  if (!vis.albums[id]) vis.albums[id] = { on: true, off: [] };
  return vis.albums[id];
}

export function isAlbumOn(id: string): boolean {
  return currentVisibility().albums[id]?.on !== false;
}

export function isPhotoOn(albumId: string, photoId: string): boolean {
  return !currentVisibility().albums[albumId]?.off?.includes(photoId);
}

export function setAlbumOn(id: string, on: boolean) {
  if (!draft) draft = clone(fileState);
  albumEntry(id).on = on;
  persistDraft();
}

export function setPhotoOn(albumId: string, photoId: string, on: boolean) {
  if (!draft) draft = clone(fileState);
  const entry = albumEntry(albumId);
  const off = new Set(entry.off);
  if (on) off.delete(photoId);
  else off.add(photoId);
  entry.off = [...off];
  persistDraft();
}

function persistDraft() {
  if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function publishedAlbums(all: Album[]): Album[] {
  return all
    .filter((album) => isAlbumOn(album.id))
    .map((album) => {
      const photos = album.photos.filter((photo) => isPhotoOn(album.id, photo.id));
      const cover =
        photos.find((photo) => photo.id === album.coverId)?.src ?? photos[0]?.src ?? album.cover;
      return { ...album, photos, cover };
    })
    .filter((album) => album.photos.length > 0);
}

export function visibilityJson(): string {
  return `${JSON.stringify(currentVisibility(), null, 2)}\n`;
}

let publishLock: Promise<void> = Promise.resolve();

export async function publishVisibility(): Promise<{ ok: boolean; message: string }> {
  const token = getGithubToken();
  if (!token) {
    return { ok: false, message: "先在本页填入 GitHub Token，保存后访客刷新即可看到，不用重新发布网站。" };
  }

  let release: () => void = () => undefined;
  const previous = publishLock;
  publishLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;

  try {
    return await putVisibility(token);
  } finally {
    release();
  }
}

async function putVisibility(token: string): Promise<{ ok: boolean; message: string }> {
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const body = visibilityJson();
      const latest = await loadRemoteVisibility(token);
      if (latest) {
        remoteSha = latest.sha;
        if (body === `${JSON.stringify(latest.vis, null, 2)}\n`) {
          fileState = clone(latest.vis);
          return { ok: true, message: "已是最新，无需再存。" };
        }
      }

      const response = await fetch(githubContentsUrl(), {
        method: "PUT",
        headers: {
          ...githubHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "更新相册上下线",
          content: encodeBase64(body),
          branch: "main",
          sha: remoteSha || undefined,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { content?: { sha?: string } };
        if (payload.content?.sha) remoteSha = payload.content.sha;
        fileState = clone(currentVisibility());
        return { ok: true, message: "已保存。访客刷新页面即可看到，不用重新发布。" };
      }

      if (response.status === 401 || response.status === 403) {
        return { ok: false, message: "Token 无效或权限不够。细粒度 Token 需要 Contents: Read and write。" };
      }

      if (response.status === 409 || response.status === 422) {
        remoteSha = "";
        continue;
      }

      return { ok: false, message: `保存失败（${response.status}）。` };
    }

    return { ok: false, message: "保存冲突，请再点一次保存。" };
  } catch {
    return { ok: false, message: "保存失败，请检查网络后重试。" };
  }
}
