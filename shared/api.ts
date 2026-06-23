/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

export type UserRole = "pengguna" | "penyedia";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  picture?: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface MeResponse {
  user: PublicUser;
}

export interface AuthErrorResponse {
  error: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  accessToken: string;
  role?: UserRole;
}

/** @deprecated Use AuthResponse */
export interface GoogleAuthUser extends PublicUser {}

/** @deprecated Use AuthResponse */
export interface GoogleAuthResponse extends AuthResponse {}

export interface GoogleAuthErrorResponse {
  error: string;
}

export interface SendOtpResponse {
  message: string;
  /** Hanya ada di development — jangan dipakai di production */
  devOtp?: string;
}

export interface VerifyOtpRequest {
  code: string;
}

export interface VerifyOtpResponse {
  message: string;
}

export type ServiceCategory = "temenin" | "curhat" | "bantu_aktivitas";

export type BookingStatus =
  | "waiting_confirmation"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "auto_cancelled";

export interface ProviderSearchResult {
  id: string;
  user_id: string;
  full_name: string;
  picture_url: string | null;
  bio: string | null;
  verification_status: "pending" | "verified" | "rejected";
  hourly_rate: string;
  avg_rating: number;
  total_reviews: number;
  is_available: boolean;
  area_description: string | null;
  categories: ServiceCategory[] | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  distance_km?: number | null;
}

export interface BookingRecord {
  id: string;
  user_id: string;
  provider_id: string;
  service_category: ServiceCategory;
  session_date: string;
  session_start: string;
  duration_hours: number;
  total_price: string;
  platform_fee: string;
  status: BookingStatus;
  notes: string | null;
  confirm_deadline: string;
  created_at: string;
  provider_name?: string;
  provider_picture?: string | null;
  user_name?: string;
  user_phone?: string | null;
  payment_status?: string | null;
  has_review?: boolean;
  avg_rating?: number;
  total_reviews?: number;
  provider_user_id?: string;
}

export interface CreateBookingRequest {
  provider_id: string;
  service_category: ServiceCategory;
  session_date: string;
  session_start: string;
  duration_hours: number;
  notes?: string;
}

export interface ConfirmBookingRequest {
  action: "accept" | "reject";
  reason?: string;
}

export interface CreateReviewRequest {
  booking_id: string;
  rating: number;
  comment: string;
}
