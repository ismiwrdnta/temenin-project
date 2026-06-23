import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { findUserById } from "../repositories/users";
import { findProviderByUserId } from "../repositories/providers";
import { findBookingById, updateBookingStatus } from "../repositories/bookings";

const confirmSchema = z.object({
  action: z.enum(["accept", "reject"]),
  reason: z.string().max(500).optional(),
});

export const handleConfirmBooking: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Action harus accept atau reject." });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user || user.role !== "penyedia") {
      res.status(403).json({ error: "Hanya penyedia jasa yang bisa konfirmasi pesanan." });
      return;
    }

    const provider = await findProviderByUserId(userId);
    if (!provider) {
      res.status(404).json({ error: "Profil provider tidak ditemukan." });
      return;
    }

    const bookingId = req.params.id as string;
    const booking = await findBookingById(bookingId);
    if (!booking) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    if (booking.provider_id !== provider.id) {
      res.status(403).json({ error: "Bukan pesanan kamu." });
      return;
    }
    if (booking.status !== "waiting_confirmation") {
      res.status(400).json({ error: "Pesanan sudah tidak bisa dikonfirmasi." });
      return;
    }
    if (new Date() > new Date(booking.confirm_deadline)) {
      res.status(400).json({ error: "Waktu konfirmasi sudah habis." });
      return;
    }

    const { action, reason } = parsed.data;

    if (action === "accept") {
      await updateBookingStatus(booking.id, "confirmed", { confirmed_at: true });
    } else {
      await updateBookingStatus(booking.id, "cancelled", {
        cancelled_at: true,
        cancel_reason: reason ?? "Ditolak oleh provider",
      });
    }

    res.json({
      data: { status: action === "accept" ? "confirmed" : "cancelled" },
    });
  } catch (error) {
    console.error("Confirm booking error:", error);
    res.status(500).json({ error: "Gagal mengkonfirmasi pesanan." });
  }
};
