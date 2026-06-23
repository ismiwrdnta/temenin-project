import { getPool } from "../db/pool";

export interface ReviewRow {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  provider_reply: string | null;
  replied_at: string | null;
  is_deleted: boolean;
  created_at: string;
  reviewer_name?: string;
  reviewer_picture?: string | null;
}

export async function findReviewByBookingId(
  bookingId: string,
): Promise<ReviewRow | null> {
  const pool = getPool();
  const result = await pool.query<ReviewRow>(
    `SELECT * FROM reviews WHERE booking_id = $1`,
    [bookingId],
  );
  return result.rows[0] ?? null;
}

export async function createReview(input: {
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}): Promise<ReviewRow> {
  const pool = getPool();
  const result = await pool.query<ReviewRow>(
    `INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.bookingId,
      input.reviewerId,
      input.revieweeId,
      input.rating,
      input.comment,
    ],
  );
  return result.rows[0];
}

export async function findReviewsByProviderId(
  providerId: string,
  options: { rating?: number; limit: number; offset: number },
): Promise<ReviewRow[]> {
  const pool = getPool();
  const conditions = [
    `r.reviewee_id = (SELECT user_id FROM provider_profiles WHERE id = $1)`,
    `r.is_deleted = false`,
  ];
  const values: unknown[] = [providerId];
  let idx = 2;

  if (options.rating) {
    conditions.push(`r.rating = $${idx}`);
    values.push(options.rating);
    idx++;
  }

  values.push(options.limit, options.offset);

  const result = await pool.query<ReviewRow>(
    `SELECT r.*, u.full_name AS reviewer_name, u.picture_url AS reviewer_picture
     FROM reviews r
     JOIN users u ON u.id = r.reviewer_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY r.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values,
  );
  return result.rows;
}

export async function getProviderRatingStats(providerId: string): Promise<{
  total: number;
  avg_rating: number | null;
  star_5: number;
  star_4: number;
  star_3: number;
  star_2: number;
  star_1: number;
}> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT
       COUNT(*) AS total,
       ROUND(AVG(rating)::numeric, 1) AS avg_rating,
       COUNT(*) FILTER (WHERE rating = 5) AS star_5,
       COUNT(*) FILTER (WHERE rating = 4) AS star_4,
       COUNT(*) FILTER (WHERE rating = 3) AS star_3,
       COUNT(*) FILTER (WHERE rating = 2) AS star_2,
       COUNT(*) FILTER (WHERE rating = 1) AS star_1
     FROM reviews
     WHERE reviewee_id = (SELECT user_id FROM provider_profiles WHERE id = $1)
     AND is_deleted = false`,
    [providerId],
  );
  return result.rows[0];
}

export async function findReviewById(id: string): Promise<ReviewRow | null> {
  const pool = getPool();
  const result = await pool.query<ReviewRow>(
    `SELECT * FROM reviews WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function replyToReview(
  id: string,
  reply: string,
): Promise<ReviewRow | null> {
  const pool = getPool();
  const result = await pool.query<ReviewRow>(
    `UPDATE reviews SET provider_reply = $1, replied_at = NOW() WHERE id = $2 RETURNING *`,
    [reply, id],
  );
  return result.rows[0] ?? null;
}
