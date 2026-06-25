import { getStoredToken } from "./authApi";

function adminHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function adminFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: adminHeaders() });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Terjadi kesalahan.");
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

export interface AdminStats {
  totalPengguna: number;
  totalTransaksi: number;
  totalPendapatan: number;
  laporanAktif: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_banned: boolean;
  suspended_until: string | null;
  violation_count: number;
  created_at: string;
}

export interface AdminChartData {
  monthlyUsers: { month: string; value: number }[];
  monthlyBookings: { month: string; value: number }[];
  byCategory: { category: string; value: number }[];
  monthlyRevenue: { month: string; value: number }[];
}

export interface AdminVerifikasiItem {
  id: string; // provider_profile id
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  ktp_url: string | null;
  selfie_url: string | null;
  verification_status: string;
  created_at: string;
}

export interface AdminProvider {
  id: string; // provider_profile id
  user_id: string;
  full_name: string;
  email: string;
  verification_status: string;
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  hourly_rate: string;
  is_available: boolean;
  is_banned: boolean;
  suspended_until: string | null;
  violation_count: number;
  categories: string[] | null;
}

export interface AdminTransaction {
  id: string; // booking id
  service_category: string;
  total_price: string;
  platform_fee: string;
  status: string;
  session_date: string;
  created_at: string;
  provider_name: string;
  user_name: string;
  payment_id: string | null;
  payment_amount: string | null;
  payment_status: string | null;
}

export interface AdminReport {
  id: string;
  reason: string | null;
  action_taken: string;
  violation_count: number;
  suspended_until: string | null;
  created_at: string;
  reporter_name: string;
  reporter_email: string;
  provider_name: string;
  provider_email: string;
}

export interface AdminLog {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  created_at: string;
  admin_name: string;
}

export const adminApi = {
  getStats: () => adminFetch<AdminStats>("/api/admin/stats"),
  getUsers: () => adminFetch<AdminUser[]>("/api/admin/users"),
  banUser: (id: string) =>
    adminFetch<AdminUser>(`/api/admin/users/${id}/ban`, { method: "PATCH" }),
  unbanUser: (id: string) =>
    adminFetch<AdminUser>(`/api/admin/users/${id}/unban`, { method: "PATCH" }),
  getPendingVerification: () =>
    adminFetch<AdminVerifikasiItem[]>("/api/admin/providers/pending"),
  verifyProvider: (id: string, action: "approve" | "reject", reason?: string) =>
    adminFetch<{ verification_status: string }>(`/api/admin/providers/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ action, reason }),
    }),
  getProviders: () => adminFetch<AdminProvider[]>("/api/admin/providers"),
  suspendProvider: (id: string) =>
    adminFetch<{ suspended_until: string }>(`/api/admin/providers/${id}/suspend`, {
      method: "PATCH",
    }),
  activateProvider: (id: string) =>
    adminFetch<{ activated: boolean }>(`/api/admin/providers/${id}/activate`, {
      method: "PATCH",
    }),
  getTransactions: () => adminFetch<AdminTransaction[]>("/api/admin/transactions"),
  refundTransaction: (id: string) =>
    adminFetch<{ refunded: boolean; amount: number }>(
      `/api/admin/transactions/${id}/refund`,
      { method: "POST" },
    ),
  getReports: () => adminFetch<AdminReport[]>("/api/admin/reports"),
  getLogs: () => adminFetch<AdminLog[]>("/api/admin/logs"),
  getCharts: () => adminFetch<AdminChartData>("/api/admin/charts"),
};
