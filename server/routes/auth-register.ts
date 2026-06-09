import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { isJwtConfigured } from "../lib/jwt";
import { hashPassword } from "../lib/password";
import { sendAuthResponse } from "../lib/auth-response";
import { createUser, findUserByEmail } from "../repositories/users";

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10).regex(/^[0-9]+$/),
  password: z.string().min(8),
  role: z.enum(["pengguna", "penyedia"]),
});

export const handleRegister: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured() || !isJwtConfigured()) {
    res.status(503).json({
      error: "Database belum dikonfigurasi (DATABASE_URL, JWT_SECRET).",
    });
    return;
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data pendaftaran tidak valid." });
    return;
  }

  const { name, email, phone, password, role } = parsed.data;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "Email sudah terdaftar." });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      fullName: name,
      phone,
      role,
      passwordHash,
      emailVerified: false,
    });

    sendAuthResponse(res, user, 201);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Gagal mendaftarkan akun." });
  }
};
