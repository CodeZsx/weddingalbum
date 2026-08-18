import { photosByAlbum } from "./albums.generated";

export type Photo = {
  id: string;
  src: string;
  alt: string;
  w: number;
  h: number;
};

export type Album = {
  id: string;
  title: string;
  en: string;
  date: string;
  location: string;
  cover: string;
  coverId: string;
  description: string;
  photos: Photo[];
};

export type Site = {
  names: [string, string];
  monogram: string;
  date: string;
  dateFormal: string;
  location: string;
  tagline: string;
  quote: string;
  about: string[];
  adminPassword: string;
  githubRepo: string;
  visibilityFile: string;
};

export const site: Site = {
  names: ["张守祥", "张悦婷"],
  monogram: "祥婷",
  date: "2026.10.03",
  dateFormal: "二〇二六年十月三日",
  location: "仁和镇张家门前",
  tagline: "我们的样子",
  quote: "不必一次看完。它们会等。",
  adminPassword: "xt1003",
  githubRepo: "CodeZsx/weddingalbum",
  visibilityFile: "public/visibility.json",
  about: [
    "这些照片，是张守祥与张悦婷留给彼此的，也留给看见的人。",
    "精修里，是反复看过仍想留下的样子。初修更全，还带着拍摄那天的次序。入了册、上了墙的，在产品里。",
    "十月三日，是我们的婚期。婚礼当天的光阴，以后再补进来。",
  ],
};

const blueprints = [
  {
    id: "精修",
    title: "精修",
    en: "Fine",
    coverId: "A71I4485.jpg",
    description: "反复看过，仍想留下来的样子。",
  },
  {
    id: "初修",
    title: "初修",
    en: "Proofs",
    coverId: "A71I4541.jpg",
    description: "拍摄那天的次序，一张也不想先丢掉。",
  },
  {
    id: "产品",
    title: "产品",
    en: "Album",
    coverId: "4摆台20x20cm.jpg",
    description: "入了册，上了墙。它们开始有自己的位置。",
  },
] as const;

export const albums: Album[] = blueprints.map((meta) => {
  const photos = photosByAlbum[meta.id] ?? [];
  const cover = photos.find((photo) => photo.id === meta.coverId) ?? photos[0];
  return {
    id: meta.id,
    title: meta.title,
    en: meta.en,
    date: "",
    location: site.location,
    cover: cover?.src ?? "",
    coverId: cover?.id ?? meta.coverId,
    description: meta.description,
    photos,
  };
});

export function getAlbum(id: string, pool: Album[] = albums): Album | undefined {
  return pool.find((album) => album.id === id);
}

export type InviteStyle = "letter" | "folio" | "seal" | "verse" | "date" | "gate";

export const invite = {
  greeting: "把这一天，轻轻告诉你。",
  closer: "我们等你。",
  letter: [
    "二〇二六年十月三日，张守祥与张悦婷成婚。",
    "不必远道，也不必备礼。你在，便是这一天的一部分。",
  ],
  time: "2026.10.03 11:28",
  place: "仁和镇张家门前",
  note: "衣着深浅皆宜。不必盛装，人到就好。",
};

export const inviteStyles: { id: InviteStyle; name: string; en: string }[] = [
  { id: "letter", name: "短笺", en: "Letter" },
  { id: "folio", name: "册页", en: "Folio" },
  { id: "seal", name: "夜宴", en: "Seal" },
  { id: "verse", name: "竖笺", en: "Verse" },
  { id: "date", name: "佳期", en: "Date" },
  { id: "gate", name: "对开", en: "Gate" },
];
