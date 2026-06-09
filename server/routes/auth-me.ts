import type { RequestHandler } from "express";
import { isDatabaseConfigured } from "../db/pool";
import { mapPublicUser } from "../lib/auth-response";
import { findUserById } from "../repositories/users";

export const handleMe: RequestHandler = async (req, res) => {
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
    if (!user) {
      res.status(404).json({ error: "Pengguna tidak ditemukan." });
      return;
    }
    res.json({ user: mapPublicUser(user) });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Gagal memuat profil." });
  }
};
