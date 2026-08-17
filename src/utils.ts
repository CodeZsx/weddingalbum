export function $(selector: string, root: ParentNode = document): HTMLElement {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el as HTMLElement;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function spanForIndex(index: number, total: number): 6 | 12 {
  if (index === 0 || index === total - 1 && (index - 1) % 3 === 0) return 12;
  return (index - 1) % 3 === 2 ? 12 : 6;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function monogramMark(size = 36): string {
  return `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <line x1="46" y1="14" x2="18" y2="50"/>
    <text x="13" y="27">祥</text>
    <text x="35" y="52">婷</text>
  </svg>`;
}

export function joinMeta(...parts: Array<string | number | undefined>): string {
  return parts
    .map((part) => (part === undefined ? "" : String(part)))
    .filter((part) => part.length > 0)
    .join(" · ");
}
