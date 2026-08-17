import { type Album } from "./data";

export type Visibility = {
  albums: Record<string, { on: boolean; off: string[] }>;
};

const DRAFT_KEY = "weddingalbum-visibility";
const AUTH_KEY = "weddingalbum-admin";

let fileState: Visibility = { albums: {} };
let draft: Visibility | null = null;

function clone(value: Visibility): Visibility {
  return JSON.parse(JSON.stringify(value)) as Visibility;
}

export async function loadVisibility() {
  try {
    const response = await fetch("./visibility.json", { cache: "no-store" });
    if (response.ok) fileState = (await response.json()) as Visibility;
  } catch {
    fileState = { albums: {} };
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

export async function saveVisibilityToSite(): Promise<boolean> {
  try {
    const response = await fetch("/__admin/visibility", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: visibilityJson(),
    });
    return response.ok;
  } catch {
    return false;
  }
}
