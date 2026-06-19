export type AntriHelper = {
  id: number;
  name: string;
  initials: string;
  avatarBg: string;
  completedQueues: number;
  rating: number;
  reviews: number;
  distanceKm: number;
  price: string;
  available: boolean;
};

export const ANTRI_HELPERS: AntriHelper[] = [
  {
    id: 1,
    name: "Rafi Ananda",
    initials: "RA",
    avatarBg: "bg-[#7C3AED]",
    completedQueues: 43,
    rating: 4.87,
    reviews: 43,
    distanceKm: 1.2,
    price: "Rp 45rb",
    available: true,
  },
  {
    id: 2,
    name: "Niken Fajri",
    initials: "NF",
    avatarBg: "bg-[#0D9488]",
    completedQueues: 28,
    rating: 4.82,
    reviews: 28,
    distanceKm: 1.8,
    price: "Rp 45rb",
    available: true,
  },
];

export function getAntriHelperById(id: number): AntriHelper | undefined {
  return ANTRI_HELPERS.find((h) => h.id === id);
}
