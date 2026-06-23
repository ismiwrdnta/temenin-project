import { getPool } from "../db/pool";

const OTP_TTL_MINUTES = 10;

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtpForUser(userId: string): Promise<string> {
  const pool = getPool();
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await pool.query(`DELETE FROM email_otp_codes WHERE user_id = $1`, [userId]);
  await pool.query(
    `INSERT INTO email_otp_codes (user_id, code, expires_at) VALUES ($1, $2, $3)`,
    [userId, code, expiresAt],
  );

  return code;
}

export async function verifyOtpForUser(
  userId: string,
  code: string,
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM email_otp_codes
     WHERE user_id = $1 AND code = $2 AND expires_at > NOW()
     LIMIT 1`,
    [userId, code],
  );

  if (!result.rows[0]) return false;

  await pool.query(`DELETE FROM email_otp_codes WHERE user_id = $1`, [userId]);
  return true;
}
