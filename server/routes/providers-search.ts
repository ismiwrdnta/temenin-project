import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { searchProviders } from "../repositories/providers";

const searchSchema = z.object({
  category: z.enum(["temenin", "curhat", "bantu_aktivitas"]).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().default(5),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  min_rating: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const handleSearchProviders: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parameter pencarian tidak valid." });
    return;
  }

  const q = parsed.data;

  try {
    const providers = await searchProviders({
      category: q.category,
      lat: q.lat,
      lng: q.lng,
      radiusKm: q.radius,
      minPrice: q.min_price,
      maxPrice: q.max_price,
      minRating: q.min_rating,
      limit: q.limit,
      offset: q.offset,
    });

    res.json({ data: providers });
  } catch (error) {
    console.error("Search providers error:", error);
    res.status(500).json({ error: "Gagal mencari provider." });
  }
};
