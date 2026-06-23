import type { RequestHandler } from "express";
import type { SendOtpResponse } from "@shared/api";
import { isDatabaseConfigured } from "../db/pool";
import { deliverOtpEmail, isDevOtpEnabled } from "../lib/email-otp";
import { createOtpForUser } from "../repositories/otp";
import { findUserById, isEmailVerified } from "../repositories/users";

export const handleSendOtp: RequestHandler = async (req, res) => {
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

    if (await isEmailVerified(userId)) {
      res.status(400).json({ error: "Email sudah terverifikasi." });
      return;
    }

    const code = await createOtpForUser(userId);
    await deliverOtpEmail(user.email, code);

    const body: SendOtpResponse = {
      message: "Kode OTP telah dikirim ke email kamu.",
      ...(isDevOtpEnabled() ? { devOtp: code } : {}),
    };
    res.json(body);
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Gagal mengirim kode OTP." });
  }
};
