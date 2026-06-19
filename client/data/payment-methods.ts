export type PaymentCategory = "va" | "qris" | "ewallet";

export type PaymentMethod = {
  id: string;
  category: PaymentCategory;
  label: string;
  shortLabel: string;
  accent: string;
  bg: string;
};

export const PAYMENT_CATEGORIES: {
  id: PaymentCategory;
  label: string;
}[] = [
  { id: "va", label: "Virtual Account" },
  { id: "qris", label: "QRIS" },
  { id: "ewallet", label: "E-Wallet" },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "va-bca",
    category: "va",
    label: "BCA Virtual Account",
    shortLabel: "BCA",
    accent: "#1D4ED8",
    bg: "bg-[#EFF6FF]",
  },
  {
    id: "va-mandiri",
    category: "va",
    label: "Mandiri Virtual Account",
    shortLabel: "Mandiri",
    accent: "#F59E0B",
    bg: "bg-[#FFFBEB]",
  },
  {
    id: "va-bni",
    category: "va",
    label: "BNI Virtual Account",
    shortLabel: "BNI",
    accent: "#F97316",
    bg: "bg-[#FFF7ED]",
  },
  {
    id: "va-bri",
    category: "va",
    label: "BRI Virtual Account",
    shortLabel: "BRI",
    accent: "#0369A1",
    bg: "bg-[#F0F9FF]",
  },
  {
    id: "va-permata",
    category: "va",
    label: "Permata Virtual Account",
    shortLabel: "Permata",
    accent: "#15803D",
    bg: "bg-[#F0FDF4]",
  },
  {
    id: "va-cimb",
    category: "va",
    label: "CIMB Niaga Virtual Account",
    shortLabel: "CIMB",
    accent: "#DC2626",
    bg: "bg-[#FEF2F2]",
  },
  {
    id: "qris",
    category: "qris",
    label: "QRIS",
    shortLabel: "QRIS",
    accent: "#0D9488",
    bg: "bg-[#F0FDFA]",
  },
  {
    id: "ewallet-shopeepay",
    category: "ewallet",
    label: "ShopeePay",
    shortLabel: "ShopeePay",
    accent: "#EA580C",
    bg: "bg-[#FFF7ED]",
  },
  {
    id: "ewallet-dana",
    category: "ewallet",
    label: "DANA",
    shortLabel: "DANA",
    accent: "#0284C7",
    bg: "bg-[#F0F9FF]",
  },
  {
    id: "ewallet-ovo",
    category: "ewallet",
    label: "OVO",
    shortLabel: "OVO",
    accent: "#7C3AED",
    bg: "bg-[#F5F3FF]",
  },
];

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function generateVirtualAccount(bankCode: string, orderId: number): string {
  const suffix = String(orderId).padStart(8, "0").slice(-8);
  const prefixes: Record<string, string> = {
    bca: "8808",
    mandiri: "8860",
    bni: "8810",
    bri: "8820",
    permata: "8840",
    cimb: "8850",
  };
  return `${prefixes[bankCode] ?? "8800"}${suffix}`;
}
