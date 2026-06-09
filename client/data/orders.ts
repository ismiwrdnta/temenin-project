export type OrderStatus = "berlangsung" | "selesai" | "dibatalkan";

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
  providerName: string;
  initials: string;
  service: string;
  duration: string;
  datetime: string;
  datetimeRange: string;
  status: OrderStatus;
  price: number;
  reviewStatus?: "pending" | "sent";
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

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    providerName: "Rafi Ananda",
    initials: "RA",
    service: "Jasa Temenin",
    duration: "2 Jam",
    datetime: "Hari ini, 14:00",
    datetimeRange: "Hari ini, 14:00 - 16:00",
    status: "berlangsung",
    price: 160000,
    tags: ["Temenin", "Curhat"],
    verified: true,
    rating: 4.97,
    reviewCount: 83,
    hourlyRate: "Rp 80rb/jam",
    paymentMethod: "GoPay",
    remainingTime: "1j 24m",
    chatMessages: [
      {
        id: 1,
        sender: "provider",
        text: "Hai! Aku udah siap ya, sampai ketemu nanti jam 14.00 😊",
        time: "13:45",
      },
      {
        id: 2,
        sender: "user",
        text: "Sip! Ketemu di lobby Mallioboro ya",
        time: "13:47",
      },
      {
        id: 3,
        sender: "provider",
        text: "Oke siap! Aku pakai baju putih ya biar gampang ketemu 🤘",
        time: "13:48",
      },
    ],
    statusHistory: [
      {
        id: 1,
        label: "Pesanan dibuat",
        time: "Hari ini, 13:30",
        state: "done",
      },
      {
        id: 2,
        label: "Pembayaran berhasil (GoPay)",
        time: "Hari ini, 13:31",
        state: "done",
      },
      {
        id: 3,
        label: "Dikonfirmasi oleh Rafi Ananda",
        time: "Hari ini, 13:35",
        state: "done",
      },
      {
        id: 4,
        label: "Sesi berlangsung",
        time: "Hari ini, 14:00 — menunggu konfirmasi selesai",
        state: "active",
      },
    ],
  },
  {
    id: 2,
    providerName: "Sari Dewi",
    initials: "SD",
    service: "Jasa Curhat",
    duration: "1 Jam",
    datetime: "Kemarin, 10:00",
    datetimeRange: "Kemarin, 10:00 - 11:00",
    status: "selesai",
    price: 70000,
    reviewStatus: "pending",
    tags: ["Curhat"],
    verified: true,
    rating: 4.88,
    reviewCount: 61,
    hourlyRate: "Rp 70rb/jam",
    paymentMethod: "GoPay",
    statusHistory: [
      {
        id: 1,
        label: "Pesanan dibuat",
        time: "Kemarin, 09:30",
        state: "done",
      },
      {
        id: 2,
        label: "Pembayaran berhasil (GoPay)",
        time: "Kemarin, 09:31",
        state: "done",
      },
      {
        id: 3,
        label: "Dikonfirmasi oleh Sari Dewi",
        time: "Kemarin, 09:40",
        state: "done",
      },
      {
        id: 4,
        label: "Sesi selesai",
        time: "Kemarin, 11:00",
        state: "done",
      },
    ],
  },
  {
    id: 3,
    providerName: "Lina Susanti",
    initials: "LS",
    service: "Jasa Curhat",
    duration: "1 Jam",
    datetime: "20 Mei, 16:00",
    datetimeRange: "20 Mei, 16:00 - 17:00",
    status: "selesai",
    price: 75000,
    reviewStatus: "sent",
    tags: ["Curhat"],
    verified: false,
    rating: 4.9,
    reviewCount: 45,
    hourlyRate: "Rp 75rb/jam",
    paymentMethod: "GoPay",
    statusHistory: [
      {
        id: 1,
        label: "Pesanan dibuat",
        time: "20 Mei, 15:00",
        state: "done",
      },
      {
        id: 2,
        label: "Pembayaran berhasil (GoPay)",
        time: "20 Mei, 15:01",
        state: "done",
      },
      {
        id: 3,
        label: "Sesi selesai",
        time: "20 Mei, 17:00",
        state: "done",
      },
      {
        id: 4,
        label: "Ulasan dikirim",
        time: "20 Mei, 17:30",
        state: "done",
      },
    ],
  },
  {
    id: 4,
    providerName: "Bimo Pratama",
    initials: "BP",
    service: "Jasa Bantu",
    duration: "1 Jam",
    datetime: "18 Mei, 09:00",
    datetimeRange: "18 Mei, 09:00 - 10:00",
    status: "dibatalkan",
    price: 65000,
    tags: ["Bantu"],
    verified: true,
    rating: 4.75,
    reviewCount: 45,
    hourlyRate: "Rp 65rb/jam",
    paymentMethod: "GoPay",
    statusHistory: [
      {
        id: 1,
        label: "Pesanan dibuat",
        time: "18 Mei, 08:00",
        state: "done",
      },
      {
        id: 2,
        label: "Pembayaran berhasil (GoPay)",
        time: "18 Mei, 08:01",
        state: "done",
      },
      {
        id: 3,
        label: "Pesanan dibatalkan",
        time: "18 Mei, 08:30",
        state: "active",
      },
      {
        id: 4,
        label: "Dana dikembalikan",
        time: "18 Mei, 08:31",
        state: "done",
      },
    ],
  },
];

export function getOrderById(id: number): Order | undefined {
  return MOCK_ORDERS.find((order) => order.id === id);
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
