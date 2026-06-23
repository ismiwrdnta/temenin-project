import type { RequestHandler } from "express";
import { z } from "zod";
import type { VerifyOtpResponse } from "@shared/api";
import { isDatabaseConfigured } from "../db/pool";
import { verifyOtpForUser } from "../repositories/otp";
import { findUserById, isEmailVerified, markEmailVerified } from "../repositories/users";

const verifySchema = z.object({
  code: z.string().length(6).regex(/^[0-9]+$/),
});

export const handleVerifyOtp: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Kode OTP tidak valid." });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ error: "Pengguna tidak ditemukan." });
      return;
    }

    if (await isEmailVerified(userId)) {
      const body: VerifyOtpResponse = { message: "Email sudah terverifikasi." };
      res.json(body);
      return;
    }

    const valid = await verifyOtpForUser(userId, parsed.data.code);
    if (!valid) {
      res.status(400).json({ error: "Kode OTP salah atau sudah kedaluwarsa." });
      return;
    }

    await markEmailVerified(userId);

    const body: VerifyOtpResponse = { message: "Email berhasil diverifikasi." };
    res.json(body);
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Gagal memverifikasi kode OTP." });
  }
};
