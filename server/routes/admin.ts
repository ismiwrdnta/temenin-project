import type { RequestHandler } from "express";
import { z } from "zod";
import { getPool, isDatabaseConfigured } from "../db/pool";

function db() {
  if (!isDatabaseConfigured()) throw new Error("DB not configured");
  return getPool();
}

async function logAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: string,
) {
  try {
    await getPool().query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, action, targetType ?? null, targetId ?? null, details ?? null],
    );
  } catch {
    // log failure tidak boleh blokir response
  }
}

// A01 — GET /api/admin/stats
export const handleAdminStats: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const [users, transactions, revenue, reports] = await Promise.all([
      pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM users WHERE role = 'pengguna'`,
      ),
      pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM bookings`),
      pool.query<{ total: string }>(
        `SELECT COALESCE(SUM(platform_fee), 0) AS total FROM bookings WHERE status = 'completed'`,
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM provider_violations WHERE action_taken = 'warning'`,
      ),
    ]);

    res.json({
      data: {
        totalPengguna: parseInt(users.rows[0].count, 10),
        totalTransaksi: parseInt(transactions.rows[0].count, 10),
        totalPendapatan: parseFloat(revenue.rows[0].total),
        laporanAktif: parseInt(reports.rows[0].count, 10),
      },
    });
  } catch (err) {
    console.error("admin stats error:", err);
    res.status(500).json({ error: "Gagal memuat statistik." });
  }
};

// A02 — GET /api/admin/users
export const handleAdminListUsers: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const result = await pool.query(
      `SELECT id, full_name, email, phone, is_banned, suspended_until, violation_count, created_at
       FROM users WHERE role = 'pengguna'
       ORDER BY created_at DESC
       LIMIT 100`,
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("admin list users error:", err);
    res.status(500).json({ error: "Gagal memuat daftar user." });
  }
};

// A02 — PATCH /api/admin/users/:id/ban
export const handleAdminBanUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const adminId = req.userId!;
  try {
    const pool = db();
    const result = await pool.query(
      `UPDATE users SET is_banned = true, updated_at = NOW() WHERE id = $1 AND role = 'pengguna'
       RETURNING id, full_name, email, is_banned`,
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "User tidak ditemukan." });
      return;
    }
    await logAction(adminId, "Blokir user", "user", id, `User: ${result.rows[0].email}`);
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("admin ban user error:", err);
    res.status(500).json({ error: "Gagal memblokir user." });
  }
};

// A02 — PATCH /api/admin/users/:id/unban
export const handleAdminUnbanUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const adminId = req.userId!;
  try {
    const pool = db();
    const result = await pool.query(
      `UPDATE users SET is_banned = false, suspended_until = NULL, violation_count = 0, updated_at = NOW()
       WHERE id = $1 AND role = 'pengguna'
       RETURNING id, full_name, email, is_banned`,
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "User tidak ditemukan." });
      return;
    }
    await logAction(adminId, "Aktifkan user", "user", id, `User: ${result.rows[0].email}`);
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("admin unban user error:", err);
    res.status(500).json({ error: "Gagal mengaktifkan user." });
  }
};

// A03 — GET /api/admin/providers/pending
export const handleAdminPendingVerification: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const result = await pool.query(
      `SELECT pp.id, pp.ktp_url, pp.selfie_url, pp.verification_status, pp.created_at,
              u.id AS user_id, u.full_name, u.email, u.phone
       FROM provider_profiles pp
       JOIN users u ON u.id = pp.user_id
       WHERE pp.verification_status = 'pending'
       ORDER BY pp.created_at ASC`,
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("admin pending verification error:", err);
    res.status(500).json({ error: "Gagal memuat antrian verifikasi." });
  }
};

// A03 — PATCH /api/admin/providers/:id/verify
const verifySchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export const handleAdminVerifyProvider: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const adminId = req.userId!;
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data tidak valid." });
    return;
  }
  const { action, reason } = parsed.data;
  const newStatus = action === "approve" ? "verified" : "rejected";

  try {
    const pool = db();
    const result = await pool.query(
      `UPDATE provider_profiles
       SET verification_status = $1, verified_by = $2, verified_at = NOW(),
           rejection_reason = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, verification_status`,
      [newStatus, adminId, reason ?? null, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Provider tidak ditemukan." });
      return;
    }
    const label = action === "approve" ? "Verifikasi provider" : "Tolak verifikasi provider";
    await logAction(adminId, label, "provider", id, reason);
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("admin verify provider error:", err);
    res.status(500).json({ error: "Gagal memproses verifikasi." });
  }
};

// A04 — GET /api/admin/providers
export const handleAdminListProviders: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const result = await pool.query(
      `SELECT pp.id, pp.verification_status, pp.avg_rating, pp.total_reviews,
              pp.total_bookings, pp.hourly_rate, pp.is_available,
              u.id AS user_id, u.full_name, u.email, u.is_banned, u.suspended_until, u.violation_count,
              ARRAY_AGG(DISTINCT pc.category) FILTER (WHERE pc.category IS NOT NULL) AS categories
       FROM provider_profiles pp
       JOIN users u ON u.id = pp.user_id
       LEFT JOIN provider_categories pc ON pc.provider_id = pp.id
       GROUP BY pp.id, u.id
       ORDER BY pp.created_at DESC
       LIMIT 100`,
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("admin list providers error:", err);
    res.status(500).json({ error: "Gagal memuat daftar provider." });
  }
};

// A04 — PATCH /api/admin/providers/:id/suspend
export const handleAdminSuspendProvider: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const adminId = req.userId!;
  try {
    const pool = db();
    // id di sini adalah provider_profiles.id
    const provResult = await pool.query<{ user_id: string }>(
      `SELECT user_id FROM provider_profiles WHERE id = $1`,
      [id],
    );
    if (provResult.rows.length === 0) {
      res.status(404).json({ error: "Provider tidak ditemukan." });
      return;
    }
    const userId = provResult.rows[0].user_id;
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + 30);
    await pool.query(
      `UPDATE users SET suspended_until = $1, updated_at = NOW() WHERE id = $2`,
      [suspendUntil.toISOString(), userId],
    );
    await logAction(adminId, "Suspend provider 30 hari", "provider", id);
    res.json({ data: { suspended_until: suspendUntil.toISOString() } });
  } catch (err) {
    console.error("admin suspend provider error:", err);
    res.status(500).json({ error: "Gagal mensuspend provider." });
  }
};

// A04 — PATCH /api/admin/providers/:id/activate
export const handleAdminActivateProvider: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const adminId = req.userId!;
  try {
    const pool = db();
    const provResult = await pool.query<{ user_id: string }>(
      `SELECT user_id FROM provider_profiles WHERE id = $1`,
      [id],
    );
    if (provResult.rows.length === 0) {
      res.status(404).json({ error: "Provider tidak ditemukan." });
      return;
    }
    const userId = provResult.rows[0].user_id;
    await pool.query(
      `UPDATE users SET suspended_until = NULL, is_banned = false, violation_count = 0, updated_at = NOW()
       WHERE id = $1`,
      [userId],
    );
    await logAction(adminId, "Aktifkan provider", "provider", id);
    res.json({ data: { activated: true } });
  } catch (err) {
    console.error("admin activate provider error:", err);
    res.status(500).json({ error: "Gagal mengaktifkan provider." });
  }
};

// A05 — GET /api/admin/transactions
export const handleAdminListTransactions: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const result = await pool.query(
      `SELECT b.id, b.service_category, b.total_price, b.platform_fee, b.status,
              b.session_date, b.created_at,
              pu.full_name AS provider_name,
              uu.full_name AS user_name,
              pay.id AS payment_id, pay.amount AS payment_amount, pay.status AS payment_status
       FROM bookings b
       JOIN provider_profiles pp ON pp.id = b.provider_id
       JOIN users pu ON pu.id = pp.user_id
       JOIN users uu ON uu.id = b.user_id
       LEFT JOIN payments pay ON pay.booking_id = b.id
       ORDER BY b.created_at DESC
       LIMIT 100`,
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("admin list transactions error:", err);
    res.status(500).json({ error: "Gagal memuat daftar transaksi." });
  }
};

// A05 — POST /api/admin/transactions/:id/refund
export const handleAdminRefundTransaction: RequestHandler = async (req, res) => {
  const { id } = req.params; // booking id
  const adminId = req.userId!;
  try {
    const pool = db();

    const bookingResult = await pool.query<{
      user_id: string;
      total_price: string;
      status: string;
    }>(
      `SELECT user_id, total_price, status FROM bookings WHERE id = $1`,
      [id],
    );
    if (bookingResult.rows.length === 0) {
      res.status(404).json({ error: "Transaksi tidak ditemukan." });
      return;
    }
    const booking = bookingResult.rows[0];
    if (booking.status === "cancelled") {
      res.status(400).json({ error: "Transaksi sudah dibatalkan." });
      return;
    }

    // Update booking status
    await pool.query(
      `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(),
       cancel_reason = 'Refund oleh admin' WHERE id = $1`,
      [id],
    );

    // Update payment status
    await pool.query(
      `UPDATE payments SET status = 'refunded' WHERE booking_id = $1`,
      [id],
    );

    // Update escrow status
    await pool.query(
      `UPDATE escrow_transactions SET status = 'refunded_full', released_at = NOW()
       WHERE booking_id = $1`,
      [id],
    );

    // Kembalikan saldo ke user
    const amount = parseFloat(booking.total_price);
    await pool.query(
      `UPDATE users SET balance = balance + $1 WHERE id = $2`,
      [amount, booking.user_id],
    );

    await logAction(adminId, `Refund transaksi Rp${amount.toLocaleString()}`, "transaction", id);
    res.json({ data: { refunded: true, amount } });
  } catch (err) {
    console.error("admin refund error:", err);
    res.status(500).json({ error: "Gagal memproses refund." });
  }
};

// A06 — GET /api/admin/reports
export const handleAdminListReports: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const result = await pool.query(
      `SELECT pv.id, pv.reason, pv.action_taken, pv.violation_count,
              pv.suspended_until, pv.created_at,
              pv.admin_status, pv.reviewed_at,
              u_reporter.full_name AS reporter_name, u_reporter.email AS reporter_email,
              u_provider.full_name AS provider_name, u_provider.email AS provider_email,
              u_provider.id AS provider_user_id
       FROM provider_violations pv
       JOIN users u_reporter ON u_reporter.id = pv.reported_by
       JOIN users u_provider ON u_provider.id = pv.provider_user_id
       ORDER BY
         CASE WHEN pv.admin_status = 'pending' THEN 0 ELSE 1 END,
         pv.created_at DESC
       LIMIT 100`,
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("admin list reports error:", err);
    res.status(500).json({ error: "Gagal memuat daftar laporan." });
  }
};

// A06b — PATCH /api/admin/sos/:id/review
export const handleAdminReviewSos: RequestHandler = async (req, res) => {
  const adminId = req.userId!;
  const { id } = req.params;
  const { action } = req.body as { action: "approve" | "reject" };

  if (action !== "approve" && action !== "reject") {
    res.status(400).json({ error: "Action harus 'approve' atau 'reject'." });
    return;
  }

  try {
    const pool = db();

    const violResult = await pool.query<{
      id: string;
      provider_user_id: string;
      booking_id: string;
      admin_status: string;
    }>(
      `SELECT id, provider_user_id, booking_id, admin_status FROM provider_violations WHERE id = $1`,
      [id],
    );
    if (violResult.rows.length === 0) {
      res.status(404).json({ error: "Laporan tidak ditemukan." });
      return;
    }
    const violation = violResult.rows[0];
    if (violation.admin_status !== "pending") {
      res.status(409).json({ error: "Laporan ini sudah diproses sebelumnya." });
      return;
    }

    if (action === "reject") {
      await pool.query(
        `UPDATE provider_violations
         SET admin_status = 'rejected', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2`,
        [adminId, id],
      );
      await logAction(adminId, "Tolak laporan SOS", "violation", id);
      res.json({ data: { action: "rejected" } });
      return;
    }

    // approve: hitung pelanggaran baru dan terapkan tindakan
    const providerUserId = violation.provider_user_id;

    const updateResult = await pool.query<{ violation_count: number }>(
      `UPDATE users SET violation_count = violation_count + 1 WHERE id = $1 RETURNING violation_count`,
      [providerUserId],
    );
    const violationCount = updateResult.rows[0].violation_count;

    let actionTaken: string;
    let suspendedUntil: string | null = null;

    if (violationCount <= 2) {
      // Pelanggaran ke-1 dan ke-2: peringatan
      actionTaken = "warning";
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, 'violation_warning', 'Peringatan Pelanggaran', $2, $3)`,
        [
          providerUserId,
          `Kamu mendapat peringatan ke-${violationCount} karena laporan pelanggaran yang telah disetujui admin. Harap patuhi aturan platform Temenin.`,
          JSON.stringify({ violation_id: id, booking_id: violation.booking_id }),
        ],
      );
    } else if (violationCount === 3) {
      // Pelanggaran ke-3: skorsing 30 hari
      actionTaken = "suspension";
      const suspendDate = new Date();
      suspendDate.setDate(suspendDate.getDate() + 30);
      suspendedUntil = suspendDate.toISOString();
      await pool.query(`UPDATE users SET suspended_until = $1 WHERE id = $2`, [
        suspendedUntil,
        providerUserId,
      ]);
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, 'violation_suspension', 'Akun Diskorsing', $2, $3)`,
        [
          providerUserId,
          `Akun kamu diskorsing selama 30 hari karena pelanggaran ke-3 yang telah disetujui admin.`,
          JSON.stringify({ violation_id: id, suspended_until: suspendedUntil }),
        ],
      );
    } else {
      // Pelanggaran ke-4+: ban permanen
      actionTaken = "permanent_ban";
      await pool.query(`UPDATE users SET is_banned = true WHERE id = $1`, [providerUserId]);
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, 'violation_ban', 'Akun Dibekukan Permanen', $2, $3)`,
        [
          providerUserId,
          "Akun kamu dibekukan permanen akibat pelanggaran berulang.",
          JSON.stringify({ violation_id: id }),
        ],
      );
    }

    await pool.query(
      `UPDATE provider_violations
       SET admin_status = 'approved', action_taken = $1, violation_count = $2,
           suspended_until = $3, reviewed_by = $4, reviewed_at = NOW()
       WHERE id = $5`,
      [actionTaken, violationCount, suspendedUntil, adminId, id],
    );

    await logAction(adminId, `Setujui laporan SOS — tindakan: ${actionTaken}`, "violation", id);

    res.json({
      data: { action: actionTaken, violation_count: violationCount, suspended_until: suspendedUntil },
    });
  } catch (err) {
    console.error("admin review SOS error:", err);
    res.status(500).json({ error: "Gagal memproses review SOS." });
  }
};

// A08 — GET /api/admin/logs
export const handleAdminLogs: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const result = await pool.query(
      `SELECT al.id, al.action, al.target_type, al.target_id, al.details, al.created_at,
              u.full_name AS admin_name
       FROM admin_logs al
       JOIN users u ON u.id = al.admin_id
       ORDER BY al.created_at DESC
       LIMIT 100`,
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("admin logs error:", err);
    res.status(500).json({ error: "Gagal memuat log aktivitas." });
  }
};

// A01 — GET /api/admin/charts (data grafik berbasis DB)
export const handleAdminCharts: RequestHandler = async (req, res) => {
  try {
    const pool = db();
    const [monthlyUsers, monthlyBookings, byCategory, monthlyRevenue] = await Promise.all([
      pool.query<{ month: string; month_num: string; year: string; count: string }>(
        `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
                EXTRACT(MONTH FROM created_at) AS month_num,
                EXTRACT(YEAR FROM created_at) AS year,
                COUNT(*) AS count
         FROM users WHERE role = 'pengguna'
           AND created_at >= NOW() - INTERVAL '6 months'
         GROUP BY month, month_num, year
         ORDER BY year, month_num`,
      ),
      pool.query<{ month: string; month_num: string; year: string; count: string }>(
        `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
                EXTRACT(MONTH FROM created_at) AS month_num,
                EXTRACT(YEAR FROM created_at) AS year,
                COUNT(*) AS count
         FROM bookings
           WHERE created_at >= NOW() - INTERVAL '6 months'
         GROUP BY month, month_num, year
         ORDER BY year, month_num`,
      ),
      pool.query<{ category: string; count: string }>(
        `SELECT service_category AS category, COUNT(*) AS count
         FROM bookings GROUP BY service_category ORDER BY count DESC`,
      ),
      pool.query<{ month: string; month_num: string; year: string; total: string }>(
        `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
                EXTRACT(MONTH FROM created_at) AS month_num,
                EXTRACT(YEAR FROM created_at) AS year,
                COALESCE(SUM(platform_fee), 0) AS total
         FROM bookings WHERE status = 'completed'
           AND created_at >= NOW() - INTERVAL '6 months'
         GROUP BY month, month_num, year
         ORDER BY year, month_num`,
      ),
    ]);

    const catLabel = (c: string) =>
      c === "temenin" ? "Temenin" : c === "curhat" ? "Curhat" : c === "bantu_aktivitas" ? "Bantu" : c;

    res.json({
      data: {
        monthlyUsers: monthlyUsers.rows.map((r) => ({
          month: r.month,
          value: parseInt(r.count, 10),
        })),
        monthlyBookings: monthlyBookings.rows.map((r) => ({
          month: r.month,
          value: parseInt(r.count, 10),
        })),
        byCategory: byCategory.rows.map((r) => ({
          category: catLabel(r.category),
          value: parseInt(r.count, 10),
        })),
        monthlyRevenue: monthlyRevenue.rows.map((r) => ({
          month: r.month,
          value: parseFloat(r.total),
        })),
      },
    });
  } catch (err) {
    console.error("admin charts error:", err);
    res.status(500).json({ error: "Gagal memuat data chart." });
  }
};
