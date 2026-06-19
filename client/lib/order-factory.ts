import type { Companion, TemeninMode } from "@/data/temenin-companions";
import { getModeLabel } from "@/data/temenin-companions";
import type { AntriHelper } from "@/data/antri-helpers";
import type { AntriMewakiliRequest } from "@/lib/antri-mewakili-request";
import type { BantuHelper } from "@/data/bantu-helpers";
import type { AmbilRaporRequest } from "@/lib/ambil-rapor-request";
import { formatAmbilRaporSchedule } from "@/lib/ambil-rapor-request";
import { formatAntriDateTime } from "@/lib/antri-mewakili-request";
import type { Order } from "@/data/orders";

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatSchedule(date: Date, durationHours: number) {
  const end = new Date(date.getTime() + durationHours * 60 * 60 * 1000);
  const dateLabel = "Hari ini";
  const startTime = formatTime(date);
  const endTime = formatTime(end);
  return {
    datetime: `${dateLabel}, ${startTime}`,
    datetimeRange: `${dateLabel}, ${startTime} - ${endTime}`,
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getHourlyRate(mode: TemeninMode) {
  return mode === "tatap-muka" ? 70000 : 50000;
}

export function createOrderFromBooking(input: {
  companion: Companion;
  mode: TemeninMode;
  durationHours: number;
  orderId: number;
  customer: {
    name: string;
    location?: string;
  };
}): Order {
  const { companion, mode, durationHours, orderId, customer } = input;
  const now = new Date();
  const schedule = formatSchedule(now, durationHours);
  const hourlyRate = getHourlyRate(mode);
  const price = hourlyRate * durationHours;
  const modeLabel = getModeLabel(mode);
  const timeLabel = formatTime(now);
  const verified = companion.status !== "pending";

  return {
    id: orderId,
    companionId: companion.id,
    providerName: companion.name,
    initials: companion.initials,
    userName: customer.name,
    userInitials: getInitials(customer.name),
    userLocation: customer.location ?? "Bandung, Jawa Barat",
    service: `Jasa Temenin · ${modeLabel}`,
    duration: `${durationHours} Jam`,
    datetime: schedule.datetime,
    datetimeRange: schedule.datetimeRange,
    status: "pending",
    price,
    tags: companion.tags.slice(0, 2),
    verified,
    rating: companion.rating,
    reviewCount: companion.reviews,
    hourlyRate: `Rp ${Math.round(hourlyRate / 1000)}rb/jam`,
    paymentMethod: "GoPay",
    statusHistory: [
      {
        id: 1,
        label: "Pesanan dibuat",
        time: `Hari ini, ${timeLabel}`,
        state: "done",
      },
      {
        id: 2,
        label: "Pembayaran berhasil (GoPay)",
        time: `Hari ini, ${timeLabel}`,
        state: "done",
      },
      {
        id: 3,
        label: `Menunggu konfirmasi ${companion.name}`,
        time: "Segera dikonfirmasi penyedia",
        state: "active",
      },
    ],
  };
}

export function canBookCompanion(companion: Companion) {
  return companion.status !== "pending";
}

export function createAmbilRaporOrder(input: {
  helper: BantuHelper;
  request: AmbilRaporRequest;
  orderId: number;
  paymentMethod: string;
  customer: { name: string; location?: string };
}): Order {
  const { helper, request, orderId, paymentMethod, customer } = input;
  const now = new Date();
  const timeLabel = formatTime(now);
  const schedule = formatAmbilRaporSchedule(request);

  return {
    id: orderId,
    companionId: 100 + helper.id,
    providerName: helper.name,
    initials: helper.initials,
    userName: customer.name,
    userInitials: getInitials(customer.name),
    userLocation: customer.location ?? "Bandung, Jawa Barat",
    service: `Jasa Bantu · Ambil Rapor`,
    duration: "1 Aktivitas",
    datetime: schedule.replace("Jadwal: ", "").split(" • ")[0] ?? "Hari ini",
    datetimeRange: schedule.replace("Jadwal: ", ""),
    status: "pending",
    price: request.totalPrice,
    tags: ["Ambil Rapor", "Bantu"],
    verified: true,
    rating: helper.rating,
    reviewCount: helper.reviews,
    hourlyRate: helper.price,
    paymentMethod,
    statusHistory: [
      {
        id: 1,
        label: "Pesanan dibuat",
        time: `Hari ini, ${timeLabel}`,
        state: "done",
      },
      {
        id: 2,
        label: `Pembayaran berhasil (${paymentMethod})`,
        time: `Hari ini, ${timeLabel}`,
        state: "done",
      },
      {
        id: 3,
        label: `Menunggu konfirmasi ${helper.name}`,
        time: "Segera dikonfirmasi helper",
        state: "active",
      },
    ],
  };
}

export function createAntriMewakiliOrder(input: {
  helper: AntriHelper;
  request: AntriMewakiliRequest;
  orderId: number;
  paymentMethod: string;
  customer: { name: string; location?: string };
}): Order {
  const { helper, request, orderId, paymentMethod, customer } = input;
  const now = new Date();
  const timeLabel = formatTime(now);
  const schedule = formatAntriDateTime(request.queueDate, request.startTime);

  return {
    id: orderId,
    companionId: 200 + helper.id,
    providerName: helper.name,
    initials: helper.initials,
    userName: customer.name,
    userInitials: getInitials(customer.name),
    userLocation: customer.location ?? "Bandung, Jawa Barat",
    service: "Jasa Bantu · Antri Mewakili",
    duration: `${request.durationHours} Jam`,
    datetime: schedule,
    datetimeRange: `${schedule} · ${request.location}`,
    status: "pending",
    price: request.totalPrice,
    tags: ["Antri Mewakili", "Bantu"],
    verified: true,
    rating: helper.rating,
    reviewCount: helper.reviews,
    hourlyRate: `${helper.price}/jam`,
    paymentMethod,
    statusHistory: [
      {
        id: 1,
        label: "Pesanan dibuat",
        time: `Hari ini, ${timeLabel}`,
        state: "done",
      },
      {
        id: 2,
        label: `Pembayaran berhasil (${paymentMethod})`,
        time: `Hari ini, ${timeLabel}`,
        state: "done",
      },
      {
        id: 3,
        label: `Menunggu konfirmasi ${helper.name}`,
        time: "Segera dikonfirmasi helper",
        state: "active",
      },
    ],
  };
}
