import type { InviteStyle } from "./data";

export type Route =
  | { name: "home" }
  | { name: "album"; id: string }
  | { name: "about" }
  | { name: "admin" }
  | { name: "invite"; style: InviteStyle };

const inviteStyles = new Set<InviteStyle>([
  "letter",
  "folio",
  "seal",
  "verse",
  "date",
  "gate",
  "overture",
  "reel",
  "mist",
]);

function decodePart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseHash(hash = window.location.hash): Route {
  const path = hash.replace(/^#/, "").replace(/^\/+/, "");
  if (!path) return { name: "home" };

  const parts = path.split("/").filter(Boolean).map(decodePart);
  if (parts[0] === "about") return { name: "about" };
  if (parts[0] === "admin") return { name: "admin" };
  if (parts[0] === "invite") {
    const style = inviteStyles.has(parts[1] as InviteStyle) ? (parts[1] as InviteStyle) : "letter";
    return { name: "invite", style };
  }
  if (parts[0] === "album" && parts[1]) return { name: "album", id: parts[1] };
  return { name: "home" };
}

export function toHash(route: Route): string {
  if (route.name === "about") return "#/about";
  if (route.name === "admin") return "#/admin";
  if (route.name === "invite") return `#/invite/${route.style}`;
  if (route.name === "album") return `#/album/${encodeURIComponent(route.id)}`;
  return "#/";
}

export function navigate(route: Route) {
  const next = toHash(route);
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = next;
}
