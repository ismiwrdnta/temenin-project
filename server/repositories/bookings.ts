import { getPool } from "../db/pool";
import type { BookingStatus, ServiceCategory } from "../types/booking-types";

export interface BookingRow {
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
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
}

export async function createBooking(input: {
  userId: string;
  providerId: string;
  serviceCategory: ServiceCategory;
  sessionDate: string;
  sessionStart: string;
  durationHours: number;
  totalPrice: number;
  platformFee: number;
  notes?: string;
}): Promise<BookingRow> {
  const pool = getPool();
  const confirmDeadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const result = await pool.query<BookingRow>(
    `INSERT INTO bookings
       (user_id, provider_id, service_category, session_date, session_start,
        duration_hours, total_price, platform_fee, notes, confirm_deadline)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      input.userId,
      input.providerId,
      input.serviceCategory,
      input.sessionDate,
      input.sessionStart,
      input.durationHours,
      input.totalPrice,
      input.platformFee,
      input.notes ?? null,
      confirmDeadline,
    ],
  );
  return result.rows[0];
}

export async function findBookingById(id: string): Promise<BookingRow | null> {
  const pool = getPool();
  const result = await pool.query<BookingRow>(
    `SELECT * FROM bookings WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findBookingsByUser(
  userId: string,
  options: { status?: BookingStatus; limit: number; offset: number },
): Promise<BookingRow[]> {
  const pool = getPool();
  const conditions = [`b.user_id = $1`];
  const values: unknown[] = [userId];
  let idx = 2;

  if (options.status) {
    conditions.push(`b.status = $${idx}`);
    values.push(options.status);
    idx++;
  }

  values.push(options.limit, options.offset);

  const result = await pool.query<BookingRow>(
    `SELECT b.*, u.full_name AS provider_name, u.picture_url AS provider_picture
     FROM bookings b
     JOIN provider_profiles pp ON pp.id = b.provider_id
     JOIN users u ON u.id = pp.user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY b.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values,
  );
  return result.rows;
}

export async function findBookingsByProvider(
  providerId: string,
  options: { status?: BookingStatus; limit: number; offset: number },
): Promise<BookingRow[]> {
  const pool = getPool();
  const conditions = [`b.provider_id = $1`];
  const values: unknown[] = [providerId];
  let idx = 2;

  if (options.status) {
    conditions.push(`b.status = $${idx}`);
    values.push(options.status);
    idx++;
  }

  values.push(options.limit, options.offset);

  const result = await pool.query<BookingRow>(
    `SELECT b.*, u.full_name AS user_name, u.phone AS user_phone
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY b.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values,
  );
  return result.rows;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  extra: {
    confirmed_at?: boolean;
    completed_at?: boolean;
    cancelled_at?: boolean;
    cancel_reason?: string;
  } = {},
): Promise<BookingRow | null> {
  const pool = getPool();
  const result = await pool.query<BookingRow>(
    `UPDATE bookings SET
       status = $1,
       confirmed_at = CASE WHEN $2 THEN NOW() ELSE confirmed_at END,
       completed_at = CASE WHEN $3 THEN NOW() ELSE completed_at END,
       cancelled_at = CASE WHEN $4 THEN NOW() ELSE cancelled_at END,
       cancel_reason = COALESCE($5, cancel_reason)
     WHERE id = $6
     RETURNING *`,
    [
      status,
      extra.confirmed_at ?? false,
      extra.completed_at ?? false,
      extra.cancelled_at ?? false,
      extra.cancel_reason ?? null,
      id,
    ],
  );
  return result.rows[0] ?? null;
}

export interface BookingDetailRow extends BookingRow {
  provider_name: string;
  provider_picture: string | null;
  provider_user_id: string;
  avg_rating: number;
  total_reviews: number;
  user_name: string;
  user_phone: string | null;
  payment_status: string | null;
  has_review: boolean;
}

export async function findBookingDetailById(
  id: string,
): Promise<BookingDetailRow | null> {
  const pool = getPool();
  const result = await pool.query<BookingDetailRow>(
    `SELECT b.*,
            pu.full_name AS provider_name,
            pu.picture_url AS provider_picture,
            pu.id AS provider_user_id,
            pp.avg_rating,
            pp.total_reviews,
            uu.full_name AS user_name,
            uu.phone AS user_phone,
            pay.status AS payment_status,
            EXISTS(SELECT 1 FROM reviews r WHERE r.booking_id = b.id AND r.is_deleted = false) AS has_review
     FROM bookings b
     JOIN provider_profiles pp ON pp.id = b.provider_id
     JOIN users pu ON pu.id = pp.user_id
     JOIN users uu ON uu.id = b.user_id
     LEFT JOIN payments pay ON pay.booking_id = b.id
     WHERE b.id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}
