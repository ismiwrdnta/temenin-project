export type BantuHelper = {
  id: number;
  name: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  experienceLabel: string;
  description: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  price: string;
  ready: boolean;
};

export const AMBIL_RAPOR_HELPERS: BantuHelper[] = [
  {
    id: 1,
    name: "Rina Wati",
    initials: "RW",
    avatarBg: "bg-[#0D9488]",
    avatarText: "text-white",
    experienceLabel: "23x Ambil Rapor",
    description:
      "Sudah 23x berhasil ambil rapor, selalu tepat waktu dan langsung kirim foto ke orang tua.",
    rating: 4.99,
    reviews: 23,
    distanceKm: 0.9,
    price: "Rp 50rb",
    ready: true,
  },
  {
    id: 2,
    name: "Arif Santoso",
    initials: "AS",
    avatarBg: "bg-[#9F1239]",
    avatarText: "text-white",
    experienceLabel: "11x Ambil Rapor",
    description:
      "Responsif dan bisa langsung berangkat. Biasa bantu orang tua yang sibuk kerja.",
    rating: 4.91,
    reviews: 11,
    distanceKm: 1.5,
    price: "Rp 50rb",
    ready: true,
  },
];

export function getBantuHelperById(id: number): BantuHelper | undefined {
  return AMBIL_RAPOR_HELPERS.find((h) => h.id === id);
}
