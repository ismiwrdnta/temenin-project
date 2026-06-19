export type TemeninMode = "tatap-muka" | "online";

export type CompanionStatus =
  | "verified-online"
  | "verified-offline"
  | "pending";

export type Companion = {
  id: number;
  name: string;
  initials: string;
  tags: string[];
  rating: number;
  reviews: number;
  age: number;
  status: CompanionStatus;
  modes: TemeninMode[];
};

export const COMPANION_FILTERS = [
  "Semua",
  "Nonton",
  "Jalan-Jalan",
  "Olahraga",
  "Makan Bareng",
] as const;

export type CompanionFilter = (typeof COMPANION_FILTERS)[number];

export const TEMENIN_COMPANIONS: Companion[] = [
  {
    id: 1,
    name: "Rafi Ananda",
    initials: "RA",
    tags: ["Nonton", "Jalan-Jalan", "Olahraga"],
    rating: 4.88,
    reviews: 83,
    age: 24,
    status: "verified-online",
    modes: ["tatap-muka", "online"],
  },
  {
    id: 2,
    name: "Bimo Pratama",
    initials: "BP",
    tags: ["Nonton", "Jalan-Jalan", "Makan Bareng"],
    rating: 4.75,
    reviews: 45,
    age: 22,
    status: "verified-online",
    modes: ["tatap-muka", "online"],
  },
  {
    id: 3,
    name: "Bimo Pratama",
    initials: "BP",
    tags: ["Nonton", "Jalan-Jalan", "Makan Bareng"],
    rating: 4.75,
    reviews: 45,
    age: 22,
    status: "pending",
    modes: ["online"],
  },
];

export function getModeLabel(mode: TemeninMode) {
  return mode === "tatap-muka" ? "Tatap Muka" : "Online Bareng";
}
