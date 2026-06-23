import type { RequestHandler } from "express";
import { isDatabaseConfigured } from "../db/pool";
import { findProviderById } from "../repositories/providers";

export const handleGetProviderDetail: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const id = req.params.id as string;

  try {
    const provider = await findProviderById(id);
    if (!provider) {
      res.status(404).json({ error: "Provider tidak ditemukan." });
      return;
    }

    res.json({ data: provider });
  } catch (error) {
    console.error("Get provider detail error:", error);
    res.status(500).json({ error: "Gagal mengambil detail provider." });
  }
};
