import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { findBookingById } from "../repositories/bookings";
import { findProviderById } from "../repositories/providers";
import { createReview, findReviewByBookingId } from "../repositories/reviews";

const createReviewSchema = z.object({
  booking_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(""),
});

export const handleCreateReview: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Data ulasan tidak valid. Rating harus antara 1-5.",
    });
    return;
  }

  const { booking_id, rating, comment } = parsed.data;

  try {
    const booking = await findBookingById(booking_id);
    if (!booking || booking.user_id !== userId) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    if (booking.status !== "completed") {
      res.status(400).json({ error: "Pesanan belum selesai." });
      return;
    }

    const existing = await findReviewByBookingId(booking_id);
    if (existing) {
      res.status(409).json({ error: "Kamu sudah memberikan ulasan untuk pesanan ini." });
      return;
    }

    const provider = await findProviderById(booking.provider_id);
    if (!provider) {
      res.status(404).json({ error: "Provider tidak ditemukan." });
      return;
    }

    const review = await createReview({
      bookingId: booking_id,
      reviewerId: userId,
      revieweeId: provider.user_id,
      rating,
      comment,
    });

    res.status(201).json({ data: review });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Gagal mengirim ulasan." });
  }
};
