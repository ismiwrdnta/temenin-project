import { getPool } from "../db/pool";
import type { ServiceCategory, VerificationStatus } from "../types/booking-types";

export interface ProviderProfileRow {
  id: string;
  user_id: string;
  bio: string | null;
  verification_status: VerificationStatus;
  hourly_rate: string; // numeric dari pg dikembalikan sebagai string
  service_radius_km: number;
  latitude: string | null;
  longitude: string | null;
  area_description: string | null;
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  is_available: boolean;
  suspended_until?: string | null;
  is_banned?: boolean;
  full_name?: string;
  picture_url?: string | null;
  categories?: ServiceCategory[];
  distance_km?: number | null;
}

export async function findProviderByUserId(
  userId: string,
): Promise<ProviderProfileRow | null> {
  const pool = getPool();
  const result = await pool.query<ProviderProfileRow>(
    `SELECT pp.*, u.full_name, u.picture_url, u.suspended_until, u.is_banned,
            ARRAY_AGG(DISTINCT pc.category) FILTER (WHERE pc.category IS NOT NULL) AS categories
     FROM provider_profiles pp
     JOIN users u ON u.id = pp.user_id
     LEFT JOIN provider_categories pc ON pc.provider_id = pp.id
     WHERE pp.user_id = $1
     GROUP BY pp.id, u.id`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function findProviderById(
  id: string,
): Promise<ProviderProfileRow | null> {
  const pool = getPool();
  const result = await pool.query<ProviderProfileRow>(
    `SELECT pp.*, u.full_name, u.picture_url, u.suspended_until, u.is_banned,
            ARRAY_AGG(DISTINCT pc.category) FILTER (WHERE pc.category IS NOT NULL) AS categories
     FROM provider_profiles pp
     JOIN users u ON u.id = pp.user_id
     LEFT JOIN provider_categories pc ON pc.provider_id = pp.id
     WHERE pp.id = $1
     GROUP BY pp.id, u.id`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createProviderProfile(
  userId: string,
): Promise<ProviderProfileRow> {
  const pool = getPool();
  const result = await pool.query<ProviderProfileRow>(
    `INSERT INTO provider_profiles (user_id, hourly_rate)
     VALUES ($1, 0)
     RETURNING *`,
    [userId],
  );
  return result.rows[0];
}

export interface SearchProvidersParams {
  category?: ServiceCategory;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  limit: number;
  offset: number;
}

export async function searchProviders(
  params: SearchProvidersParams,
): Promise<ProviderProfileRow[]> {
  const pool = getPool();
  const conditions: string[] = [
    `pp.verification_status = 'verified'`,
    `(u.suspended_until IS NULL OR u.suspended_until < NOW())`,
    `u.is_banned = false`,
  ];
  const values: unknown[] = [];
  let idx = 1;

  if (params.category) {
    conditions.push(
      `EXISTS (SELECT 1 FROM provider_categories pc WHERE pc.provider_id = pp.id AND pc.category = $${idx})`,
    );
    values.push(params.category);
    idx++;
  }
  if (params.minPrice !== undefined) {
    conditions.push(`pp.hourly_rate >= $${idx}`);
    values.push(params.minPrice);
    idx++;
  }
  if (params.maxPrice !== undefined) {
    conditions.push(`pp.hourly_rate <= $${idx}`);
    values.push(params.maxPrice);
    idx++;
  }
  if (params.minRating !== undefined) {
    conditions.push(`pp.avg_rating >= $${idx}`);
    values.push(params.minRating);
    idx++;
  }

  let distanceSelect = "NULL AS distance_km";
  let havingClause = "";

  if (params.lat !== undefined && params.lng !== undefined) {
    const latIdx = idx;
    const lngIdx = idx + 1;
    distanceSelect = `ROUND((6371 * acos(LEAST(1.0, GREATEST(-1.0,
      cos(radians($${latIdx})) * cos(radians(pp.latitude)) *
      cos(radians(pp.longitude) - radians($${lngIdx})) +
      sin(radians($${latIdx})) * sin(radians(pp.latitude))
    ))))::numeric, 2) AS distance_km`;

    values.push(params.lat, params.lng);
    idx += 2;

    if (params.radiusKm !== undefined) {
      havingClause = `HAVING (6371 * acos(LEAST(1.0, GREATEST(-1.0,
        cos(radians($${latIdx})) * cos(radians(pp.latitude)) *
        cos(radians(pp.longitude) - radians($${lngIdx})) +
        sin(radians($${latIdx})) * sin(radians(pp.latitude))
      )))) <= $${idx}`;
      values.push(params.radiusKm);
      idx++;
    }
  }

  values.push(params.limit, params.offset);
  const limitIdx = idx;
  const offsetIdx = idx + 1;

  const query = `
    SELECT pp.*, u.full_name, u.picture_url, ${distanceSelect},
           ARRAY_AGG(DISTINCT pc.category) FILTER (WHERE pc.category IS NOT NULL) AS categories
    FROM provider_profiles pp
    JOIN users u ON u.id = pp.user_id
    LEFT JOIN provider_categories pc ON pc.provider_id = pp.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY pp.id, u.id
    ${havingClause}
    ORDER BY pp.avg_rating DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const result = await pool.query<ProviderProfileRow>(query, values);
  return result.rows;
}

export async function updateProviderProfile(
  userId: string,
  fields: Partial<{
    bio: string;
    hourly_rate: number;
    service_radius_km: number;
    latitude: number;
    longitude: number;
    area_description: string;
    is_available: boolean;
    verification_status: "pending" | "verified" | "rejected";
  }>,
): Promise<ProviderProfileRow | null> {
  const pool = getPool();
  const result = await pool.query<ProviderProfileRow>(
    `UPDATE provider_profiles SET
       bio = COALESCE($1, bio),
       hourly_rate = COALESCE($2, hourly_rate),
       service_radius_km = COALESCE($3, service_radius_km),
       latitude = COALESCE($4, latitude),
       longitude = COALESCE($5, longitude),
       area_description = COALESCE($6, area_description),
       is_available = COALESCE($7, is_available),
       verification_status = COALESCE($8, verification_status),
       updated_at = NOW()
     WHERE user_id = $9
     RETURNING *`,
    [
      fields.bio ?? null,
      fields.hourly_rate ?? null,
      fields.service_radius_km ?? null,
      fields.latitude ?? null,
      fields.longitude ?? null,
      fields.area_description ?? null,
      fields.is_available ?? null,
      fields.verification_status ?? null,
      userId,
    ],
  );
  return result.rows[0] ?? null;
}

export async function setProviderCategories(
  providerId: string,
  categories: ServiceCategory[],
): Promise<void> {
  const pool = getPool();
  await pool.query(`DELETE FROM provider_categories WHERE provider_id = $1`, [
    providerId,
  ]);
  for (const category of categories) {
    await pool.query(
      `INSERT INTO provider_categories (provider_id, category) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [providerId, category],
    );
  }
}

export async function verifyProvider(
  providerId: string,
  verifiedByUserId: string,
  status: "verified" | "rejected",
  rejectionReason?: string,
): Promise<ProviderProfileRow | null> {
  const pool = getPool();
  const result = await pool.query<ProviderProfileRow>(
    `UPDATE provider_profiles SET
       verification_status = $1,
       verified_by = $2,
       verified_at = NOW(),
       rejection_reason = $3
     WHERE id = $4
     RETURNING *`,
    [status, verifiedByUserId, rejectionReason ?? null, providerId],
  );
  return result.rows[0] ?? null;
}
