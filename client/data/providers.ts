export type Provider = {
  id: number;
  name: string;
  initials: string;
  tags: string[];
  rating: number;
  reviews: number;
  price: string;
  distance: string;
  distanceKm: number;
  lat: number;
  lng: number;
};

export const PROVIDERS: Provider[] = [
  {
    id: 2,
    name: "Risna",
    initials: "RI",
    tags: ["Curhat", "Bantu"],
    rating: 4.88,
    reviews: 61,
    price: "70rb/Jam",
    distance: "0.8 km",
    distanceKm: 0.8,
    lat: -6.9118,
    lng: 107.6172,
  },
  {
    id: 4,
    name: "Ismi Wardanita",
    initials: "IW",
    tags: ["Curhat", "Bantu"],
    rating: 4.88,
    reviews: 61,
    price: "70rb/Jam",
    distance: "0.8 km",
    distanceKm: 0.8,
    lat: -6.9105,
    lng: 107.6148,
  },
  {
    id: 1,
    name: "Rafi Ananda",
    initials: "RA",
    tags: ["Temenin", "Curhat"],
    rating: 4.88,
    reviews: 83,
    price: "70rb/Jam",
    distance: "1.2 km",
    distanceKm: 1.2,
    lat: -6.9082,
    lng: 107.6154,
  },
  {
    id: 3,
    name: "Bimo Pratama",
    initials: "BP",
    tags: ["Temenin", "Bantu"],
    rating: 4.75,
    reviews: 45,
    price: "65rb/Jam",
    distance: "2.1 km",
    distanceKm: 2.1,
    lat: -6.9235,
    lng: 107.6021,
  },
  {
    id: 5,
    name: "Ima",
    initials: "IM",
    tags: ["Temenin", "Bantu"],
    rating: 4.75,
    reviews: 45,
    price: "65rb/Jam",
    distance: "2.1 km",
    distanceKm: 2.1,
    lat: -6.9268,
    lng: 107.6115,
  },
];

export function getNearestProviders(limit = 3): Provider[] {
  return [...PROVIDERS]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
