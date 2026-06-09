import type { RequestHandler } from "express";
import { verifyToken } from "../lib/jwt";

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token autentikasi tidak ditemukan." });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Sesi tidak valid atau sudah kedaluwarsa." });
  }
};
