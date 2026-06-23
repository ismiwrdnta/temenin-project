import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import {
  findReviewsByProviderId,
  getProviderRatingStats,
} from "../repositories/reviews";

const querySchema = z.object({
  rating: z.coerce.number().min(1).max(5).optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const handleListProviderReviews: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parameter tidak valid." });
    return;
  }

  const providerId = req.params.providerId as string;

  try {
    const [reviews, stats] = await Promise.all([
      findReviewsByProviderId(providerId, {
        rating: parsed.data.rating,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      }),
      getProviderRatingStats(providerId),
    ]);

    res.json({ data: reviews, stats });
  } catch (error) {
    console.error("List provider reviews error:", error);
    res.status(500).json({ error: "Gagal mengambil ulasan." });
  }
};
