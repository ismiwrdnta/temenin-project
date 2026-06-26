import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured, getPool } from "../db/pool";
import { findBookingById } from "../repositories/bookings";

const sosSchema = z.object({
  booking_id: z.string().uuid(),
  reason: z.string().max(500).optional().default("Pelanggaran dilaporkan melalui SOS"),
});

export const handleSosReport: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = sosSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data tidak valid." });
    return;
  }

  const { booking_id, reason } = parsed.data;

  try {
    const pool = getPool();

    const booking = await findBookingById(booking_id);
    if (!booking) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    if (booking.user_id !== userId) {
      res.status(403).json({ error: "Bukan pesanan kamu." });
      return;
    }
    if (booking.status !== "in_progress" && booking.status !== "confirmed") {
      res.status(400).json({ error: "SOS hanya bisa dilakukan saat sesi berlangsung." });
      return;
    }

    const existingViolation = await pool.query(
      `SELECT id FROM provider_violations WHERE booking_id = $1 AND reported_by = $2`,
      [booking_id, userId],
    );
    if (existingViolation.rows.length > 0) {
      res.status(409).json({ error: "Kamu sudah melaporkan pelanggaran untuk pesanan ini." });
      return;
    }

    const providerResult = await pool.query<{ user_id: string }>(
      `SELECT pp.user_id FROM provider_profiles pp WHERE pp.id = $1`,
      [booking.provider_id],
    );
    if (providerResult.rows.length === 0) {
      res.status(404).json({ error: "Provider tidak ditemukan." });
      return;
    }
    const providerUserId = providerResult.rows[0].user_id;

    // Buat laporan dengan status pending — belum ada tindakan sampai admin approve
    await pool.query(
      `INSERT INTO provider_violations
         (provider_user_id, booking_id, reported_by, reason, violation_count, action_taken, admin_status)
       VALUES ($1, $2, $3, $4, 0, NULL, 'pending')`,
      [providerUserId, booking_id, userId, reason],
    );

    // Notifikasi ke semua admin agar segera mereview
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       SELECT id, 'sos_pending', 'Laporan SOS Baru', $1, $2
       FROM users WHERE role = 'admin'`,
      [
        `Ada laporan SOS baru dari pengguna yang perlu disetujui. Alasan: ${reason}`,
        JSON.stringify({ booking_id }),
      ],
    );

    res.status(201).json({
      data: {
        action: "pending",
        violation_count: 0,
        suspended_until: null,
        message: "Laporan SOS kamu sudah diterima dan sedang menunggu review admin.",
      },
    });
  } catch (error) {
    console.error("SOS report error:", error);
    res.status(500).json({ error: "Gagal memproses laporan SOS." });
  }
};
