import type { RequestHandler } from "express";
import { isDatabaseConfigured, getPool } from "../db/pool";

export const handleListAllNotifications: RequestHandler = async (req, res) => {
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
    const pool = getPool();
    const result = await pool.query<{
      id: string; type: string; title: string; body: string;
      data: Record<string, unknown>; is_read: boolean; created_at: string;
    }>(
      `SELECT id, type, title, body, data, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId],
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error("List notifications error:", error);
    res.status(500).json({ error: "Gagal mengambil notifikasi." });
  }
};

export const handleGetUnreadNotifications: RequestHandler = async (req, res) => {
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
    const pool = getPool();

    // Ambil notifikasi yang belum dibaca, lalu tandai sebagai sudah dibaca
    const result = await pool.query<{
      id: string;
      type: string;
      title: string;
      body: string;
      data: Record<string, unknown>;
      created_at: string;
    }>(
      `SELECT id, type, title, body, data, created_at
       FROM notifications
       WHERE user_id = $1 AND is_read = false
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId],
    );

    if (result.rows.length > 0) {
      await pool.query(
        `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
        [userId],
      );
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Gagal mengambil notifikasi." });
  }
};
