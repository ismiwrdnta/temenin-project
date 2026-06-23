import { getPool } from "../db/pool";
import type { UserRow } from "../lib/user-mapper";
import type { UserRole } from "@shared/api";

export async function findUserByEmail(
  email: string,
): Promise<(UserRow & { password_hash: string | null }) | null> {
  const pool = getPool();
  const result = await pool.query<
    UserRow & { password_hash: string | null }
  >(
    `SELECT id, email, full_name, phone, role, picture_url, password_hash
     FROM users WHERE LOWER(email) = LOWER($1)`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const pool = getPool();
  const result = await pool.query<UserRow>(
    `SELECT id, email, full_name, phone, role, picture_url
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  passwordHash?: string;
  pictureUrl?: string;
  googleSub?: string;
  emailVerified?: boolean;
}): Promise<UserRow> {
  const pool = getPool();
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, full_name, phone, role, password_hash, picture_url, google_sub, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, email, full_name, phone, role, picture_url`,
    [
      input.email.toLowerCase(),
      input.fullName,
      input.phone ?? null,
      input.role,
      input.passwordHash ?? null,
      input.pictureUrl ?? null,
      input.googleSub ?? null,
      input.emailVerified ?? false,
    ],
  );
  return result.rows[0];
}

export async function upsertGoogleUser(input: {
  email: string;
  fullName: string;
  role: UserRole;
  pictureUrl?: string;
  googleSub: string;
}): Promise<UserRow> {
  const pool = getPool();
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, full_name, role, picture_url, google_sub, email_verified)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (email) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       role = EXCLUDED.role,
       picture_url = COALESCE(EXCLUDED.picture_url, users.picture_url),
       google_sub = COALESCE(users.google_sub, EXCLUDED.google_sub),
       email_verified = true,
       updated_at = NOW()
     RETURNING id, email, full_name, phone, role, picture_url`,
    [
      input.email.toLowerCase(),
      input.fullName,
      input.role,
      input.pictureUrl ?? null,
      input.googleSub,
    ],
  );
  return result.rows[0];
}

export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<UserRow | null> {
  const pool = getPool();
  const result = await pool.query<UserRow>(
    `UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, email, full_name, phone, role, picture_url`,
    [id, role],
  );
  return result.rows[0] ?? null;
}

export async function markEmailVerified(id: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1`,
    [id],
  );
}

export async function isEmailVerified(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{ email_verified: boolean }>(
    `SELECT email_verified FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0]?.email_verified ?? false;
}
