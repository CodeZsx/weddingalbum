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
};

export const site: Site = {
  names: ["张守祥", "张悦婷"],
  monogram: "祥婷",
  date: "2026.10.03",
  dateFormal: "二〇二六年十月三日",
  location: "",
  tagline: "婚纱写真",
  quote: "把这些照片，慢慢看完。",
  adminPassword: "xt1003",
  about: [
    "这些是张守祥与张悦婷的婚纱照，想留给自己，也留给你们。",
    "精修是挑过的，初修更全，产品是相册、挂画和摆台。点进去即可，也可以开沉浸式左右翻页。",
    "十月三日是婚期。这里先放下写真，婚礼当天的照片以后再补。",
  ],
};

const blueprints = [
  {
    id: "精修",
    title: "精修",
    en: "Fine",
    coverId: "A71I4485.jpg",
    description: "挑过的写真。颜色、光线和想留下来的样子。",
  },
  {
    id: "初修",
    title: "初修",
    en: "Proofs",
    coverId: "A71I4541.jpg",
    description: "更全的一套初修，按拍摄顺序排，方便慢慢翻。",
  },
  {
    id: "产品",
    title: "产品",
    en: "Album",
    coverId: "4摆台20x20cm.jpg",
    description: "相册内页、挂画和摆台。看做成册、上墙之后的样子。",
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
