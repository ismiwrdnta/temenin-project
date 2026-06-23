import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { findUserById } from "../repositories/users";
import {
  findProviderByUserId,
  updateProviderProfile,
  setProviderCategories,
} from "../repositories/providers";

const updateSchema = z.object({
  bio: z.string().max(1000).optional(),
  hourly_rate: z.number().min(0).optional(),
  service_radius_km: z.number().min(1).max(50).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  area_description: z.string().max(255).optional(),
  is_available: z.boolean().optional(),
  categories: z
    .array(z.enum(["temenin", "curhat", "bantu_aktivitas"]))
    .optional(),
});

export const handleUpdateProviderProfile: RequestHandler = async (
  req,
  res,
) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  // requireAuth sudah set req.userId sebelumnya
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data profil tidak valid." });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user || user.role !== "penyedia") {
      res.status(403).json({ error: "Hanya penyedia jasa yang bisa mengakses ini." });
      return;
    }

    const provider = await findProviderByUserId(userId);
    if (!provider) {
      res.status(404).json({ error: "Profil provider tidak ditemukan." });
      return;
    }

    const { categories, ...profileFields } = parsed.data;

    const updated = await updateProviderProfile(userId, profileFields);

    if (categories) {
      await setProviderCategories(provider.id, categories);
    }

    res.json({ data: updated });
  } catch (error) {
    console.error("Update provider profile error:", error);
    res.status(500).json({ error: "Gagal mengupdate profil." });
  }
};
