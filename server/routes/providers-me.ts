import type { RequestHandler } from "express";
import { isDatabaseConfigured } from "../db/pool";
import { findUserById } from "../repositories/users";
import { findProviderByUserId } from "../repositories/providers";

export const handleGetMyProviderProfile: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user || user.role !== "penyedia") {
      res.status(403).json({ error: "Hanya penyedia jasa yang bisa mengakses profil ini." });
      return;
    }

    const provider = await findProviderByUserId(userId);
    if (!provider) {
      res.status(404).json({ error: "Profil provider tidak ditemukan." });
      return;
    }

    res.json({
      data: {
        ...provider,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Get my provider profile error:", error);
    res.status(500).json({ error: "Gagal mengambil profil provider." });
  }
};
