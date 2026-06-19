export type CurhatListenerStatus = "online" | "offline";

export type CurhatListener = {
  id: string;
  alias: string;
  price: string;
  priceLabel: string;
  isNearest?: boolean;
  description: string;
  rating: number;
  reviews: number;
  gender: string;
  ageRange: string;
  status: CurhatListenerStatus;
};

export const ANONIM_LISTENERS: CurhatListener[] = [
  {
    id: "a-021",
    alias: "Pendengar #A-021",
    price: "Rp 55rb/jam",
    priceLabel: "Terdekat",
    isNearest: true,
    description:
      "Pendengar empatik, tidak menghakimi, Pengalaman 60+ sesi. Spesialis masalah pribadi & keluarga.",
    rating: 4.88,
    reviews: 61,
    gender: "Perempuan",
    ageRange: "20an",
    status: "online",
  },
  {
    id: "a-019",
    alias: "Pendengar #A-019",
    price: "Rp 65rb/jam",
    priceLabel: "Terdekat",
    description:
      "Pendengar sabar & bijak. Berpengalaman mendampingi 45+ sesi. Fokus masalah relasi & pekerjaan.",
    rating: 4.9,
    reviews: 47,
    gender: "Laki-laki",
    ageRange: "30an",
    status: "online",
  },
];

export function getListenerById(id: string): CurhatListener | undefined {
  return ANONIM_LISTENERS.find((l) => l.id === id);
}
