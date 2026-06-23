import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { findReviewById, replyToReview } from "../repositories/reviews";

const replySchema = z.object({
  reply: z.string().min(1).max(1000),
});

export const handleReplyReview: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Balasan tidak boleh kosong." });
    return;
  }

  const reviewId = req.params.id as string;

  try {
    const review = await findReviewById(reviewId);
    if (!review || review.reviewee_id !== userId) {
      res.status(404).json({ error: "Ulasan tidak ditemukan." });
      return;
    }
    if (review.provider_reply) {
      res.status(409).json({ error: "Kamu sudah membalas ulasan ini." });
      return;
    }

    const updated = await replyToReview(reviewId, parsed.data.reply.trim());
    res.json({ data: updated });
  } catch (error) {
    console.error("Reply review error:", error);
    res.status(500).json({ error: "Gagal mengirim balasan." });
  }
};
