import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured, getPool } from "../db/pool";

const topupSchema = z.object({
  amount: z.number().min(10000, "Minimal top-up Rp 10.000").max(10000000, "Maksimal top-up Rp 10.000.000"),
});

export const handleTopupBalance: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = topupSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Nominal tidak valid.";
    res.status(400).json({ error: msg });
    return;
  }

  try {
    const pool = getPool();
    const result = await pool.query<{ balance: string }>(
      `UPDATE users SET balance = balance + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING balance`,
      [parsed.data.amount, userId],
    );
    const newBalance = parseFloat(result.rows[0]?.balance ?? "0");
    res.json({ data: { balance: newBalance }, message: "Top-up berhasil." });
  } catch (error) {
    console.error("Topup error:", error);
    res.status(500).json({ error: "Gagal memproses top-up." });
  }
};

export const handleGetUserBalance: RequestHandler = async (req, res) => {
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
    const result = await pool.query<{ balance: string }>(
      `SELECT balance FROM users WHERE id = $1`,
      [userId],
    );
    const balance = parseFloat(result.rows[0]?.balance ?? "0");
    res.json({ data: { balance } });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({ error: "Gagal mengambil saldo." });
  }
};
