import { getAlbum, invite, inviteStyles, site, type InviteStyle } from "../data";
import { escapeHtml, monogramMark } from "../utils";

function shot(id: string): string {
  return getAlbum("精修")?.photos.find((photo) => photo.id === id)?.src ?? "";
}

const views: Record<InviteStyle, () => string> = {
  letter,
  folio,
  seal,
  verse,
  date,
  gate,
  overture,
  reel,
  mist,
};

const musicStyles = new Set<InviteStyle>(["overture", "reel", "mist"]);

export function renderInvite(style: InviteStyle): string {
  return `
    <div class="invite invite--${style}">
      ${switcher(style)}
      ${views[style]()}
      ${musicStyles.has(style) ? musicButton() : ""}
    </div>
  `;
}

function musicButton(): string {
  return `
    <button class="invite-music" type="button" data-music aria-label="播放或暂停音乐">
      <span data-music-icon>♪</span>
    </button>
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
  const photo = shot(invite.photos.letter);
  return `
    <article class="invite-card">
      ${monogramMark(48)}
      ${photo ? `<figure class="invite-card__photo"><img src="${escapeHtml(photo)}" alt="" /></figure>` : ""}
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
  const photo = shot(invite.photos.folio);
  return `
    <div class="invite-folio">
      <figure class="invite-folio__photo">
        ${photo ? `<img src="${escapeHtml(photo)}" alt="" />` : ""}
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
  const photo = shot(invite.photos.seal);
  return `
    <section class="invite-seal__hero">
      ${
        photo
          ? `<figure class="invite-seal__portrait"><img src="${escapeHtml(photo)}" alt="" /></figure>`
          : `<div class="invite-seal__ring">${monogramMark(56)}</div>`
      }
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
  const photo = shot(invite.photos.verse);
  return `
    <article class="invite-verse">
      <span class="invite-verse__rod"></span>
      <div class="invite-verse__sheet">
        ${photo ? `<figure class="invite-verse__photo"><img src="${escapeHtml(photo)}" alt="" /></figure>` : ""}
        <div class="invite-verse__cols">
          <p class="invite-verse__col invite-verse__col--name">${escapeHtml(a)}</p>
          <p class="invite-verse__col invite-verse__col--soft">与</p>
          <p class="invite-verse__col invite-verse__col--name">${escapeHtml(b)}</p>
          <p class="invite-verse__col invite-verse__col--soft">成婚</p>
          <p class="invite-verse__col">${escapeHtml(invite.time)}</p>
          <p class="invite-verse__col">${escapeHtml(invite.place)}</p>
          ${invite.letter.map((p) => `<p class="invite-verse__col invite-verse__col--copy">${escapeHtml(p)}</p>`).join("")}
          <p class="invite-verse__col invite-verse__col--gold">${escapeHtml(invite.closer)}</p>
        </div>
      </div>
      <span class="invite-verse__rod"></span>
    </article>
  `;
}

function date(): string {
  const photo = shot(invite.photos.date);
  return `
    <section class="invite-poster">
      <p class="eyebrow">Save the Date</p>
      <p class="invite-poster__month">十月</p>
      <p class="invite-poster__num">03</p>
      <p class="invite-poster__year">二〇二六</p>
      ${photo ? `<figure class="invite-poster__photo"><img src="${escapeHtml(photo)}" alt="" /></figure>` : ""}
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
  const [leftId, rightId] = invite.photos.gate;
  const left = shot(leftId);
  const right = shot(rightId);
  return `
    <div class="invite-gate">
      <aside class="invite-gate__panel invite-gate__panel--left">
        ${left ? `<img class="invite-gate__img" src="${escapeHtml(left)}" alt="" />` : ""}
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
        ${right ? `<img class="invite-gate__img" src="${escapeHtml(right)}" alt="" />` : ""}
        <span class="invite-gate__zi">婷</span>
        <span class="invite-gate__who">${escapeHtml(b)}</span>
      </aside>
    </div>
  `;
}

function overture(): string {
  const photo = shot(invite.photos.overture);
  return `
    <div class="invite-overture">
      <section class="invite-overture__cover">
        ${photo ? `<img src="${escapeHtml(photo)}" alt="" />` : ""}
        <div class="invite-overture__veil">
          <p class="eyebrow">The Wedding</p>
          ${names()}
          <p class="invite-date">${escapeHtml(site.dateFormal)}</p>
          <button class="invite-overture__open" type="button" data-open>开启请柬</button>
        </div>
      </section>
      <article class="invite-overture__body">
        <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
        ${invite.letter.map((p) => `<p class="invite-copy">${escapeHtml(p)}</p>`).join("")}
        ${events()}
        <p class="invite-note">${escapeHtml(invite.note)}</p>
        <p class="invite-closer">${escapeHtml(invite.closer)}</p>
      </article>
    </div>
  `;
}

function reel(): string {
  const frames = invite.photos.reel.map(shot).filter(Boolean);
  return `
    <section class="invite-reel">
      <p class="eyebrow">A Short Reel</p>
      ${names()}
      <div class="invite-reel__strip">
        ${frames.map((src) => `<img src="${escapeHtml(src)}" alt="" />`).join("")}
      </div>
      <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
      ${events()}
      <p class="invite-note">${escapeHtml(invite.note)}</p>
      <p class="invite-closer">${escapeHtml(invite.closer)}</p>
    </section>
  `;
}

function mist(): string {
  const photo = shot(invite.photos.mist);
  return `
    <section class="invite-mist">
      ${photo ? `<img class="invite-mist__bg" src="${escapeHtml(photo)}" alt="" />` : ""}
      <article class="invite-mist__card">
        <p class="eyebrow">Invitation</p>
        ${names()}
        <p class="invite-greeting">${escapeHtml(invite.greeting)}</p>
        ${events()}
        <p class="invite-closer">${escapeHtml(invite.closer)}</p>
      </article>
    </section>
  `;
}

let musicPlaying = false;
let toneTimer = 0;
let audioCtx: AudioContext | null = null;
let fileAudio: HTMLAudioElement | null = null;

export function stopInviteMusic() {
  musicPlaying = false;
  window.clearInterval(toneTimer);
  fileAudio?.pause();
  if (fileAudio) {
    fileAudio.currentTime = 0;
  }
  void audioCtx?.close();
  audioCtx = null;
}

export function bindInvite(root: HTMLElement) {
  root.querySelector("[data-open]")?.addEventListener("click", () => {
    root.querySelector(".invite-overture")?.classList.add("is-open");
    const music = root.querySelector("[data-music]") as HTMLButtonElement | null;
    if (music && !musicPlaying) music.click();
  });

  const button = root.querySelector("[data-music]") as HTMLButtonElement | null;
  if (!button) return;
  button.addEventListener("click", () => {
    if (musicPlaying) {
      stopInviteMusic();
      button.classList.remove("is-on");
      return;
    }
    void startMusic();
    button.classList.add("is-on");
  });
}

async function startMusic() {
  stopInviteMusic();
  musicPlaying = true;
  fileAudio = new Audio(invite.music);
  fileAudio.loop = true;
  try {
    await fileAudio.play();
    return;
  } catch {
    fileAudio = null;
  }
  playTones();
}

function playTones() {
  const ctx = new AudioContext();
  audioCtx = ctx;
  const notes = [261.63, 329.63, 392.0, 329.63, 392.0, 523.25, 392.0, 329.63];
  let step = 0;
  const strike = () => {
    if (!musicPlaying || audioCtx !== ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[step % notes.length];
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.7);
    step += 1;
  };
  strike();
  toneTimer = window.setInterval(strike, 900);
}
