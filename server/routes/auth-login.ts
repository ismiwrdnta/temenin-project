import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { isJwtConfigured } from "../lib/jwt";
import { verifyPassword } from "../lib/password";
import { sendAuthResponse } from "../lib/auth-response";
import { findUserByEmail } from "../repositories/users";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const handleLogin: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured() || !isJwtConfigured()) {
    res.status(503).json({
      error: "Database belum dikonfigurasi (DATABASE_URL, JWT_SECRET).",
    });
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email atau kata sandi tidak valid." });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await findUserByEmail(email);
    if (!user?.password_hash) {
      res.status(401).json({
        error: "Email tidak ditemukan atau akun terdaftar via Google.",
      });
      return;
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Email atau kata sandi salah." });
      return;
    }

    sendAuthResponse(res, {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      picture_url: user.picture_url,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Gagal masuk." });
  }
};
