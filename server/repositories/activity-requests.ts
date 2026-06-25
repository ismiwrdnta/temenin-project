import { getPool } from "../db/pool";
import type { BookingRow } from "./bookings";

export type ActivityRequestType =
  | "belanja_titip"
  | "antri_mewakili"
  | "ambil_rapor";

export type ActivityRequestStatus = "open" | "claimed" | "cancelled" | "expired";

export interface ActivityRequestRow {
  id: string;
  user_id: string;
  request_type: ActivityRequestType;
  status: ActivityRequestStatus;
  payment_status: "pending" | "paid";
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  payload: Record<string, unknown>;
  total_price: string;
  claimed_by_provider_id: string | null;
  booking_id: string | null;
  expires_at: string | null;
  created_at: string;
  user_name?: string;
  user_phone?: string | null;
}

export async function createActivityRequest(input: {
  userId: string;
  requestType: ActivityRequestType;
  latitude?: number;
  longitude?: number;
  address?: string;
  payload: Record<string, unknown>;
  totalPrice: number;
}): Promise<ActivityRequestRow> {
  const pool = getPool();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const result = await pool.query<ActivityRequestRow>(
    `INSERT INTO activity_requests
       (user_id, request_type, latitude, longitude, address, payload, total_price, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.userId,
      input.requestType,
      input.latitude ?? null,
      input.longitude ?? null,
      input.address ?? null,
      JSON.stringify(input.payload),
      input.totalPrice,
      expiresAt,
    ],
  );
  return result.rows[0];
}

export async function findActivityRequestById(
  id: string,
): Promise<ActivityRequestRow | null> {
  const pool = getPool();
  const result = await pool.query<ActivityRequestRow>(
    `SELECT ar.*, u.full_name AS user_name, u.phone AS user_phone
     FROM activity_requests ar
     JOIN users u ON u.id = ar.user_id
     WHERE ar.id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findOpenActivityRequests(): Promise<ActivityRequestRow[]> {
  const pool = getPool();
  const result = await pool.query<ActivityRequestRow>(
    `SELECT ar.*, u.full_name AS user_name, u.phone AS user_phone
     FROM activity_requests ar
     JOIN users u ON u.id = ar.user_id
     WHERE ar.status = 'open'
       AND ar.payment_status = 'paid'
       AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
     ORDER BY ar.created_at ASC`,
  );
  return result.rows;
}

export async function findUserActivityRequests(
  userId: string,
): Promise<ActivityRequestRow[]> {
  const pool = getPool();
  const result = await pool.query<ActivityRequestRow>(
    `SELECT * FROM activity_requests
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId],
  );
  return result.rows;
}

export async function markActivityRequestPaid(
  id: string,
  userId: string,
): Promise<ActivityRequestRow | null> {
  const pool = getPool();
  const result = await pool.query<ActivityRequestRow>(
    `UPDATE activity_requests
     SET payment_status = 'paid'
     WHERE id = $1 AND user_id = $2 AND payment_status = 'pending' AND status = 'open'
     RETURNING *`,
    [id, userId],
  );
  return result.rows[0] ?? null;
}

function requestTypeLabel(type: ActivityRequestType): string {
  const labels: Record<ActivityRequestType, string> = {
    belanja_titip: "Belanja / Titip Beli",
    antri_mewakili: "Antri Mewakili",
    ambil_rapor: "Ambil Rapor",
  };
  return labels[type];
}

function sessionFromPayload(
  payload: Record<string, unknown>,
): { sessionDate: string; sessionStart: string; durationHours: number } {
  const today = new Date().toISOString().slice(0, 10);
  const queueDate =
    typeof payload.queueDate === "string" && payload.queueDate
      ? payload.queueDate
      : today;
  const startTime =
    typeof payload.startTime === "string" && payload.startTime
      ? payload.startTime
      : "09:00";
  const durationHours =
    typeof payload.durationHours === "number" && payload.durationHours >= 1
      ? payload.durationHours
      : 1;

  return {
    sessionDate: queueDate,
    sessionStart: startTime.length >= 5 ? startTime.slice(0, 5) : startTime,
    durationHours,
  };
}

export async function claimActivityRequest(
  requestId: string,
  providerProfileId: string,
): Promise<{ request: ActivityRequestRow; booking: BookingRow }> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reqResult = await client.query<ActivityRequestRow>(
      `SELECT * FROM activity_requests
       WHERE id = $1 AND status = 'open' AND payment_status = 'paid'
       FOR UPDATE`,
      [requestId],
    );

    const request = reqResult.rows[0];
    if (!request) {
      throw new Error("REQUEST_NOT_AVAILABLE");
    }

    // Cek apakah provider sedang diskorsing atau dibanned
    const providerStatusResult = await client.query<{ suspended_until: string | null; is_banned: boolean }>(
      `SELECT u.suspended_until, u.is_banned
       FROM provider_profiles pp JOIN users u ON u.id = pp.user_id
       WHERE pp.id = $1`,
      [providerProfileId],
    );
    const providerStatus = providerStatusResult.rows[0];
    if (providerStatus?.is_banned || (providerStatus?.suspended_until && new Date(providerStatus.suspended_until) > new Date())) {
      throw new Error("PROVIDER_SUSPENDED");
    }

    const payload =
      typeof request.payload === "string"
        ? (JSON.parse(request.payload) as Record<string, unknown>)
        : (request.payload as Record<string, unknown>);

    const { sessionDate, sessionStart, durationHours } =
      sessionFromPayload(payload);
    const totalPrice = parseFloat(request.total_price);
    const platformFee = totalPrice * 0.1;

    const notes = [
      requestTypeLabel(request.request_type),
      request.address ? `Lokasi: ${request.address}` : null,
      JSON.stringify(payload),
    ]
      .filter(Boolean)
      .join(" | ");

    const bookingResult = await client.query<BookingRow>(
      `INSERT INTO bookings
         (user_id, provider_id, service_category, session_date, session_start,
          duration_hours, total_price, platform_fee, notes, confirm_deadline, status, confirmed_at)
       VALUES ($1, $2, 'bantu_aktivitas', $3, $4, $5, $6, $7, $8, NOW() + INTERVAL '24 hours', 'confirmed', NOW())
       RETURNING *`,
      [
        request.user_id,
        providerProfileId,
        sessionDate,
        sessionStart,
        durationHours,
        totalPrice,
        platformFee,
        notes.slice(0, 1000),
      ],
    );

    const booking = bookingResult.rows[0];

    const paymentResult = await client.query<{ id: string }>(
      `INSERT INTO payments (booking_id, midtrans_order_id, amount, status, payment_method, paid_at)
       VALUES ($1, $2, $3, 'paid', 'activity_request', NOW())
       RETURNING id`,
      [booking.id, `ACT-${booking.id}-${Date.now()}`, Math.round(totalPrice)],
    );
    const paymentId = paymentResult.rows[0].id;

    await client.query(
      `INSERT INTO escrow_transactions (booking_id, payment_id, amount, status)
       VALUES ($1, $2, $3, 'held')
       ON CONFLICT (booking_id) DO NOTHING`,
      [booking.id, paymentId, totalPrice],
    );

    const updatedReq = await client.query<ActivityRequestRow>(
      `UPDATE activity_requests
       SET status = 'claimed',
           claimed_by_provider_id = $1,
           booking_id = $2
       WHERE id = $3
       RETURNING *`,
      [providerProfileId, booking.id, requestId],
    );

    // Booking di-insert langsung sebagai 'confirmed' sehingga DB trigger tidak jalan.
    // Buat chat session secara eksplisit di dalam transaksi yang sama.
    await client.query(
      `INSERT INTO chat_sessions (booking_id, expires_at)
       VALUES ($1, ($2::date + $3::time + ($4 || ' hours')::INTERVAL + INTERVAL '30 days'))
       ON CONFLICT (booking_id) DO NOTHING`,
      [booking.id, sessionDate, sessionStart, durationHours],
    );

    await client.query("COMMIT");

    return { request: updatedReq.rows[0], booking };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
