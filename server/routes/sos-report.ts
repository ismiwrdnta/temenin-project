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

    const updateResult = await pool.query<{ violation_count: number }>(
      `UPDATE users SET violation_count = violation_count + 1 WHERE id = $1 RETURNING violation_count`,
      [providerUserId],
    );
    const { violation_count } = updateResult.rows[0];

    let actionTaken: string;
    let suspendedUntil: string | null = null;
    let actionMessage: string;

    if (violation_count === 1) {
      actionTaken = "warning";
      actionMessage = "Provider telah menerima peringatan pertama.";
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, 'violation_warning', 'Peringatan Pelanggaran', $2, $3)`,
        [providerUserId, "Kamu mendapat peringatan pertama karena laporan pelanggaran dari pengguna. Harap patuhi aturan platform Temenin.", JSON.stringify({ booking_id })],
      );
    } else if (violation_count === 2) {
      actionTaken = "suspension";
      const suspendDate = new Date();
      suspendDate.setDate(suspendDate.getDate() + 30);
      suspendedUntil = suspendDate.toISOString();
      await pool.query(`UPDATE users SET suspended_until = $1 WHERE id = $2`, [suspendedUntil, providerUserId]);
      actionMessage = "Provider telah diskorsing selama 30 hari.";
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, 'violation_suspension', 'Akun Diskorsing', $2, $3)`,
        [providerUserId, `Akun kamu diskorsing 30 hari akibat pelanggaran kedua.`, JSON.stringify({ booking_id, suspended_until: suspendedUntil })],
      );
    } else {
      actionTaken = "permanent_ban";
      await pool.query(`UPDATE users SET is_banned = true WHERE id = $1`, [providerUserId]);
      actionMessage = "Akun provider telah dibekukan secara permanen.";
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, 'violation_ban', 'Akun Dibekukan Permanen', $2, $3)`,
        [providerUserId, "Akun kamu dibekukan permanen akibat pelanggaran berulang.", JSON.stringify({ booking_id })],
      );
    }

    await pool.query(
      `INSERT INTO provider_violations (provider_user_id, booking_id, reported_by, reason, violation_count, action_taken, suspended_until) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [providerUserId, booking_id, userId, reason, violation_count, actionTaken, suspendedUntil],
    );

    res.status(201).json({
      data: { action: actionTaken, violation_count, suspended_until: suspendedUntil, message: actionMessage },
    });
  } catch (error) {
    console.error("SOS report error:", error);
    res.status(500).json({ error: "Gagal memproses laporan SOS." });
  }
};
