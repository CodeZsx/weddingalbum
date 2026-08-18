import { albums, invite, inviteStyles, site, type InviteStyle } from "../data";
import { escapeHtml, monogramMark } from "../utils";

const views: Record<InviteStyle, () => string> = {
  letter,
  folio,
  seal,
  verse,
  date,
  gate,
};

export function renderInvite(style: InviteStyle): string {
  return `
    <div class="invite invite--${style}">
      ${switcher(style)}
      ${views[style]()}
    </div>
  `;
}

function switcher(style: InviteStyle): string {
  return `
    <nav class="invite-switch" aria-label="邀请函风格">
      <a href="#/">相册</a>
      <span class="invite-switch__dot"></span>
      ${inviteStyles
        .map(
          (item) => `
        <a href="#/invite/${item.id}" data-style="${item.id}" class="${item.id === style ? "is-active" : ""}">${escapeHtml(item.name)}</a>
      `,
        )
        .join("")}
    </nav>
  `;
}

function names(): string {
  const [a, b] = site.names;
  return `
    <h1 class="invite-names">
      <span>${escapeHtml(a)}</span>
      <i>&</i>
      <span>${escapeHtml(b)}</span>
    </h1>
  `;
}

function events(): string {
  return `
    <ul class="invite-events">
      <li>
        <span class="invite-events__label">时间</span>
        <span>${escapeHtml(invite.time)}</span>
      </li>
      <li>
        <span class="invite-events__label">地点</span>
        <span>${escapeHtml(invite.place)}</span>
      </li>
    </ul>
  `;
}

function letter(): string {
  return `
    <article class="invite-card">
      ${monogramMark(48)}
      <p class="eyebrow">Invitation</p>
      <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
      ${names()}
      <p class="invite-date">${escapeHtml(site.dateFormal)}</p>
      <div class="invite-rule"></div>
      ${invite.letter.map((p) => `<p class="invite-copy">${escapeHtml(p)}</p>`).join("")}
      ${events()}
      <p class="invite-note">${escapeHtml(invite.note)}</p>
      <p class="invite-closer">${escapeHtml(invite.closer)}</p>
    </article>
  `;
}

function folio(): string {
  const cover = albums[0]?.cover ?? "";
  return `
    <div class="invite-folio">
      <figure class="invite-folio__photo">
        ${cover ? `<img src="${escapeHtml(cover)}" alt="" />` : ""}
      </figure>
      <div class="invite-folio__body">
        <p class="eyebrow">Invitation</p>
        <p class="invite-folio__day">${escapeHtml(site.date)}</p>
        ${names()}
        <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
        ${invite.letter.map((p) => `<p class="invite-copy">${escapeHtml(p)}</p>`).join("")}
        ${events()}
        <p class="invite-note">${escapeHtml(invite.note)}</p>
        <p class="invite-closer">${escapeHtml(invite.closer)}</p>
        <a class="invite-link" href="#/">去看我们的样子</a>
      </div>
    </div>
  `;
}

function seal(): string {
  return `
    <section class="invite-seal__hero">
      <div class="invite-seal__ring">${monogramMark(56)}</div>
      <p class="eyebrow">The Wedding</p>
      ${names()}
      <p class="invite-date">${escapeHtml(site.dateFormal)}</p>
      <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
    </section>
    <section class="invite-seal__sheet">
      ${invite.letter.map((p) => `<p class="invite-copy">${escapeHtml(p)}</p>`).join("")}
      ${events()}
      <p class="invite-note">${escapeHtml(invite.note)}</p>
      <p class="invite-closer">${escapeHtml(invite.closer)}</p>
    </section>
  `;
}

function verse(): string {
  const [a, b] = site.names;
  return `
    <article class="invite-verse">
      <span class="invite-verse__rod"></span>
      <div class="invite-verse__sheet">
        <p class="invite-verse__col invite-verse__col--name">${escapeHtml(a)}</p>
        <p class="invite-verse__col invite-verse__col--soft">与</p>
        <p class="invite-verse__col invite-verse__col--name">${escapeHtml(b)}</p>
        <p class="invite-verse__col invite-verse__col--soft">成婚</p>
        <p class="invite-verse__col">${escapeHtml(invite.time)}</p>
        <p class="invite-verse__col">${escapeHtml(invite.place)}</p>
        ${invite.letter.map((p) => `<p class="invite-verse__col invite-verse__col--copy">${escapeHtml(p)}</p>`).join("")}
        <p class="invite-verse__col invite-verse__col--gold">${escapeHtml(invite.closer)}</p>
      </div>
      <span class="invite-verse__rod"></span>
    </article>
  `;
}

function date(): string {
  return `
    <section class="invite-poster">
      <p class="eyebrow">Save the Date</p>
      <p class="invite-poster__month">十月</p>
      <p class="invite-poster__num">03</p>
      <p class="invite-poster__year">二〇二六</p>
      ${names()}
      <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
      <div class="invite-rule"></div>
      ${invite.letter.map((p) => `<p class="invite-copy">${escapeHtml(p)}</p>`).join("")}
      ${events()}
      <p class="invite-note">${escapeHtml(invite.note)}</p>
      <p class="invite-closer">${escapeHtml(invite.closer)}</p>
    </section>
  `;
}

function gate(): string {
  const [a, b] = site.names;
  return `
    <div class="invite-gate">
      <aside class="invite-gate__panel invite-gate__panel--left">
        <span class="invite-gate__zi">祥</span>
        <span class="invite-gate__who">${escapeHtml(a)}</span>
      </aside>
      <section class="invite-gate__fold">
        <p class="eyebrow">Invitation</p>
        <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
        <p class="invite-date">${escapeHtml(site.dateFormal)}</p>
        <div class="invite-rule"></div>
        ${invite.letter.map((p) => `<p class="invite-copy">${escapeHtml(p)}</p>`).join("")}
        ${events()}
        <p class="invite-note">${escapeHtml(invite.note)}</p>
        <p class="invite-closer">${escapeHtml(invite.closer)}</p>
      </section>
      <aside class="invite-gate__panel invite-gate__panel--right">
        <span class="invite-gate__zi">婷</span>
        <span class="invite-gate__who">${escapeHtml(b)}</span>
      </aside>
    </div>
  `;
}
