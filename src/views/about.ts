import { site } from "../data";
import { escapeHtml, joinMeta } from "../utils";

export function renderAbout(): string {
  const [a, b] = site.names;
  return `
    <section class="about">
      <p class="eyebrow">Letter</p>
      <h1>写给看见的人</h1>
      <p class="about__names">${escapeHtml(a)} & ${escapeHtml(b)}</p>
      <p class="about__meta">${escapeHtml(joinMeta("婚期", site.dateFormal, site.location))}</p>
      ${site.about.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
    </section>
  `;
}
