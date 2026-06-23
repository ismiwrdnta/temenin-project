import { getPool } from "../db/pool";

export interface ChatSessionRow {
  id: string;
  booking_id: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  sender_id: string;
  message_type: "text" | "location" | "image";
  content: string | null;
  location_lat: string | null;
  location_lng: string | null;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export async function findChatSessionByBookingForUser(
  bookingId: string,
  userId: string,
): Promise<ChatSessionRow | null> {
  const pool = getPool();
  const result = await pool.query<ChatSessionRow>(
    `SELECT cs.* FROM chat_sessions cs
     JOIN bookings b ON b.id = cs.booking_id
     JOIN provider_profiles pp ON pp.id = b.provider_id
     WHERE cs.booking_id = $1 AND (b.user_id = $2 OR pp.user_id = $2)`,
    [bookingId, userId],
  );
  return result.rows[0] ?? null;
}

export async function findMessages(
  sessionId: string,
  options: { limit: number; before?: string },
): Promise<ChatMessageRow[]> {
  const pool = getPool();
  const conditions = [`cm.session_id = $1`];
  const values: unknown[] = [sessionId];
  let idx = 2;

  if (options.before) {
    conditions.push(`cm.created_at < $${idx}`);
    values.push(options.before);
    idx++;
  }

  values.push(options.limit);

  const result = await pool.query<ChatMessageRow>(
    `SELECT cm.*, u.full_name AS sender_name
     FROM chat_messages cm
     JOIN users u ON u.id = cm.sender_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY cm.created_at DESC
     LIMIT $${idx}`,
    values,
  );
  return result.rows.reverse();
}

export async function createMessage(input: {
  sessionId: string;
  senderId: string;
  messageType: "text" | "location" | "image";
  content?: string;
  locationLat?: number;
  locationLng?: number;
}): Promise<ChatMessageRow> {
  const pool = getPool();
  const result = await pool.query<ChatMessageRow>(
    `INSERT INTO chat_messages (session_id, sender_id, message_type, content, location_lat, location_lng)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.sessionId,
      input.senderId,
      input.messageType,
      input.content ?? null,
      input.locationLat ?? null,
      input.locationLng ?? null,
    ],
  );
  return result.rows[0];
}

export async function markMessagesAsRead(
  sessionId: string,
  readerId: string,
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE chat_messages SET is_read = true, read_at = NOW()
     WHERE session_id = $1 AND sender_id != $2 AND is_read = false`,
    [sessionId, readerId],
  );
}

export async function countUnread(
  bookingId: string,
  userId: string,
): Promise<number> {
  const pool = getPool();
  const result = await pool.query<{ unread_count: string }>(
    `SELECT COUNT(*) AS unread_count
     FROM chat_messages cm
     JOIN chat_sessions cs ON cs.id = cm.session_id
     WHERE cs.booking_id = $1 AND cm.sender_id != $2 AND cm.is_read = false`,
    [bookingId, userId],
  );
  return parseInt(result.rows[0].unread_count, 10);
}
