import type {
  BookingRecord,
  BookingStatus,
  ConfirmBookingRequest,
  CreateBookingRequest,
  CreateReviewRequest,
  ProviderSearchResult,
} from "@shared/api";
export type { ProviderSearchResult };
import type { Order } from "@/data/orders";
import { formatRupiah } from "@/data/orders";
import { getStoredToken } from "./authApi";

type ApiError = { error: string };

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as ApiError;
  return data.error ?? "Terjadi kesalahan. Coba lagi.";
}

export async function searchProviders(params: {
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
}): Promise<ProviderSearchResult[]> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.lat != null) query.set("lat", String(params.lat));
  if (params.lng != null) query.set("lng", String(params.lng));
  if (params.radius != null) query.set("radius", String(params.radius));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`/api/providers?${query.toString()}`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: ProviderSearchResult[] };
  return data.data;
}

export async function getProviderDetail(
  id: string,
): Promise<ProviderSearchResult> {
  const res = await fetch(`/api/providers/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: ProviderSearchResult };
  return data.data;
}

export type MyProviderProfile = ProviderSearchResult & {
  email?: string;
  phone?: string | null;
  bio?: string | null;
  service_radius_km?: number;
  is_available?: boolean;
};

export async function fetchMyProviderProfile(): Promise<MyProviderProfile> {
  const res = await fetch("/api/providers/me", { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: MyProviderProfile };
  return data.data;
}

export async function updateMyProviderProfile(input: {
  bio?: string;
  hourly_rate?: number;
  latitude?: number;
  longitude?: number;
  area_description?: string;
  is_available?: boolean;
  categories?: ("temenin" | "curhat" | "bantu_aktivitas")[];
}): Promise<MyProviderProfile> {
  const res = await fetch("/api/providers/profile", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: MyProviderProfile };
  return data.data;
}

export async function createBooking(
  input: CreateBookingRequest,
): Promise<BookingRecord> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: BookingRecord };
  return data.data;
}

export async function listBookings(): Promise<BookingRecord[]> {
  const res = await fetch("/api/bookings?limit=50", {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: BookingRecord[] };
  return data.data;
}

export async function getBooking(id: string): Promise<BookingRecord> {
  const res = await fetch(`/api/bookings/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: BookingRecord };
  return data.data;
}

export async function confirmBooking(
  id: string,
  input: ConfirmBookingRequest,
): Promise<void> {
  const res = await fetch(`/api/bookings/${id}/confirm`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function completeBooking(id: string): Promise<void> {
  const res = await fetch(`/api/bookings/${id}/complete`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function simulatePayment(bookingId: string): Promise<void> {
  const res = await fetch("/api/payments/simulate", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ booking_id: bookingId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function submitReview(input: CreateReviewRequest): Promise<void> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export type ChatMessageRecord = {
  id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
  sender_name?: string;
};

export async function getChatHistory(bookingId: string): Promise<{
  messages: ChatMessageRecord[];
}> {
  const res = await fetch(`/api/chat/${bookingId}?limit=100`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as {
    data: { messages: ChatMessageRecord[] };
  };
  return data.data;
}

export async function sendChatMessage(
  bookingId: string,
  content: string,
): Promise<void> {
  const res = await fetch(`/api/chat/${bookingId}/send`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content, message_type: "text" }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function mapBookingStatus(status: BookingStatus):
  | "pending"
  | "berlangsung"
  | "selesai"
  | "dibatalkan" {
  switch (status) {
    case "waiting_confirmation":
      return "pending";
    case "confirmed":
    case "in_progress":
      return "berlangsung";
    case "completed":
      return "selesai";
    default:
      return "dibatalkan";
  }
}

export function formatSessionDate(date?: string | null, start?: string | null): string {
  if (!date || !start) return "Tanggal belum ditentukan";
  // Normalise time to HH:MM to avoid browser quirks
  const normalizedStart = start.length >= 5 ? start.slice(0, 5) : start;
  const d = new Date(`${date}T${normalizedStart}:00`);
  if (isNaN(d.getTime())) return "Tanggal tidak valid";
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    temenin: "Jasa Temenin",
    curhat: "Jasa Curhat",
    bantu_aktivitas: "Jasa Bantu Aktivitas",
  };
  return labels[category] ?? category;
}

function buildStatusHistory(booking: BookingRecord): Order["statusHistory"] {
  const created = new Date(booking.created_at).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const steps: Order["statusHistory"] = [
    {
      id: 1,
      label: "Pesanan dibuat",
      time: created,
      state: "done",
    },
  ];

  if (booking.payment_status === "paid") {
    steps.push({
      id: 2,
      label: "Pembayaran berhasil (simulasi)",
      time: created,
      state: "done",
    });
  }

  const uiStatus = mapBookingStatus(booking.status);

  if (uiStatus === "pending") {
    steps.push({
      id: 3,
      label: "Menunggu konfirmasi penyedia",
      time: "Sekarang",
      state: "active",
    });
  }

  if (uiStatus === "berlangsung" || uiStatus === "selesai") {
    steps.push({
      id: 3,
      label: "Penyedia menerima pesanan",
      time: created,
      state: "done",
    });
  }

  if (uiStatus === "berlangsung") {
    steps.push({
      id: 4,
      label: "Sesi berlangsung",
      time: "Sekarang",
      state: "active",
    });
  }

  if (uiStatus === "selesai") {
    steps.push({
      id: 4,
      label: "Sesi selesai",
      time: created,
      state: "done",
    });
  }

  if (uiStatus === "dibatalkan") {
    steps.push({
      id: 3,
      label: "Pesanan dibatalkan",
      time: created,
      state: "done",
    });
  }

  return steps;
}

export function mapBookingToOrder(booking: BookingRecord): Order {
  const status = mapBookingStatus(booking.status);
  const providerName = booking.provider_name ?? "Provider";
  const price = parseFloat(booking.total_price);
  const hourlyRate = price / Math.max(booking.duration_hours, 1);
  const datetime = formatSessionDate(
    booking.session_date,
    booking.session_start,
  );

  return {
    id: booking.id,
    companionId: booking.provider_id,
    providerName,
    initials: getInitials(providerName),
    userName: booking.user_name ?? "Pengguna",
    userInitials: getInitials(booking.user_name ?? "P"),
    userLocation: "-",
    service: categoryLabel(booking.service_category),
    duration: `${booking.duration_hours} Jam`,
    datetime,
    datetimeRange: datetime,
    status,
    price,
    reviewStatus: booking.has_review
      ? "sent"
      : status === "selesai"
        ? "pending"
        : undefined,
    tags: [categoryLabel(booking.service_category)],
    verified: true,
    rating: booking.avg_rating ?? 0,
    reviewCount: booking.total_reviews ?? 0,
    hourlyRate: `${formatRupiah(hourlyRate)}/jam`,
    paymentMethod:
      booking.payment_status === "paid" ? "GoPay (Simulasi)" : "Belum dibayar",
    statusHistory: buildStatusHistory(booking),
  };
}
