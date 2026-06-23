// Tempel ke shared/api.ts — JANGAN timpa yang sudah ada

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  provider_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface CreateReviewInput {
  booking_id: string;
  rating: number;
  comment: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  message_type: "text" | "location" | "image";
  content: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_read: boolean;
  created_at: string;
}
