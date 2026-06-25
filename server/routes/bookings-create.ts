import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured, getPool } from "../db/pool";
import { findProviderById } from "../repositories/providers";
import { createBooking } from "../repositories/bookings";

const createBookingSchema = z.object({
  provider_id: z.string().uuid(),
  service_category: z.enum(["temenin", "curhat", "bantu_aktivitas"]),
  session_date: z.string(), // format: YYYY-MM-DD
  session_start: z.string(), // format: HH:mm
  duration_hours: z.number().min(1).max(24),
  notes: z.string().max(1000).optional(),
});

export const handleCreateBooking: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data pesanan tidak valid." });
    return;
  }

  const input = parsed.data;

  try {
    const provider = await findProviderById(input.provider_id);
    if (!provider) {
      res.status(404).json({ error: "Provider tidak ditemukan." });
      return;
    }
    if (provider.verification_status !== "verified") {
      res.status(400).json({ error: "Provider belum terverifikasi." });
      return;
    }
    if (provider.is_banned) {
      res.status(400).json({ error: "Provider tidak tersedia saat ini." });
      return;
    }
    if (provider.suspended_until && new Date(provider.suspended_until) > new Date()) {
      res.status(400).json({ error: "Provider sedang tidak tersedia saat ini." });
      return;
    }
    if (provider.user_id === userId) {
      res.status(400).json({ error: "Tidak bisa memesan diri sendiri." });
      return;
    }

    const hourlyRate = parseFloat(provider.hourly_rate);
    const totalPrice = hourlyRate * input.duration_hours;
    const platformFee = totalPrice * 0.1;

    const booking = await createBooking({
      userId,
      providerId: input.provider_id,
      serviceCategory: input.service_category,
      sessionDate: input.session_date,
      sessionStart: input.session_start,
      durationHours: input.duration_hours,
      totalPrice,
      platformFee,
      notes: input.notes,
    });

    // Notifikasi ke provider (best-effort, jangan blokir response jika gagal)
    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, 'booking_new', 'Pesanan Baru!', $2, $3)`,
        [
          provider.user_id,
          `Ada pesanan baru untuk ${input.service_category}`,
          JSON.stringify({ booking_id: booking.id }),
        ],
      );
    } catch {
      // tabel notifications mungkin belum ada — tidak fatal
    }

    res.status(201).json({ data: booking });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ error: "Gagal membuat pesanan." });
  }
};
