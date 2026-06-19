export type OrderStatus = "pending" | "berlangsung" | "selesai" | "dibatalkan";

export type ChatMessage = {
  id: number;
  sender: "user" | "provider";
  text: string;
  time: string;
};

export type StatusHistoryItem = {
  id: number;
  label: string;
  time: string;
  state: "done" | "active" | "pending";
};

export type Order = {
  id: number;
  companionId: number;
  providerName: string;
  initials: string;
  userName: string;
  userInitials: string;
  userLocation: string;
  service: string;
  duration: string;
  datetime: string;
  datetimeRange: string;
  status: OrderStatus;
  price: number;
  reviewStatus?: "pending" | "sent";
  reviewRating?: number;
  tags: string[];
  verified: boolean;
  rating: number;
  reviewCount: number;
  hourlyRate: string;
  paymentMethod: string;
  remainingTime?: string;
  chatMessages?: ChatMessage[];
  statusHistory: StatusHistoryItem[];
};

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Menunggu Konfirmasi",
    className: "bg-[#FEF9C3] text-[#CA8A04]",
  },
  berlangsung: {
    label: "Berlangsung",
    className: "bg-[#FFEDD5] text-[#EA580C]",
  },
  selesai: {
    label: "Selesai",
    className: "bg-[#DCFCE7] text-[#16A34A]",
  },
  dibatalkan: {
    label: "Dibatalkan",
    className: "bg-[#FEE2E2] text-[#DC2626]",
  },
};

export type ProviderOrderFilter = {
  name: string;
  companionId?: number;
};

export function getOrdersForProvider(
  orders: Order[],
  provider: ProviderOrderFilter,
) {
  if (provider.companionId != null) {
    return orders.filter((order) => order.companionId === provider.companionId);
  }

  const normalized = provider.name.trim().toLowerCase().replace(/\s+/g, " ");
  return orders.filter(
    (order) =>
      order.providerName.trim().toLowerCase().replace(/\s+/g, " ") ===
      normalized,
  );
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("Rp", "Rp ");
}
