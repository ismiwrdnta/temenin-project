// Tambahan untuk @shared/api — sesuaikan dengan file shared/api.ts yang sudah ada
// Tempel bagian ini ke file shared/api.ts milikmu, JANGAN timpa yang sudah ada

export type ServiceCategory = "temenin" | "curhat" | "bantu_aktivitas";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type BookingStatus =
  | "waiting_confirmation"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "auto_cancelled";

export interface ProviderProfile {
  id: string;
  user_id: string;
  bio: string | null;
  verification_status: VerificationStatus;
  hourly_rate: number;
  service_radius_km: number;
  latitude: number | null;
  longitude: number | null;
  area_description: string | null;
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  is_available: boolean;
  categories: ServiceCategory[];
}

export interface Booking {
  id: string;
  user_id: string;
  provider_id: string;
  service_category: ServiceCategory;
  session_date: string;
  session_start: string;
  duration_hours: number;
  total_price: number;
  platform_fee: number;
  status: BookingStatus;
  notes: string | null;
  confirm_deadline: string;
  created_at: string;
}

export interface CreateBookingInput {
  provider_id: string;
  service_category: ServiceCategory;
  session_date: string;
  session_start: string;
  duration_hours: number;
  notes?: string;
}
