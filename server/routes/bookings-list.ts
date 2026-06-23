import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { findUserById } from "../repositories/users";
import { findProviderByUserId } from "../repositories/providers";
import { findBookingsByUser, findBookingsByProvider } from "../repositories/bookings";

const querySchema = z.object({
  status: z
    .enum([
      "waiting_confirmation",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "auto_cancelled",
    ])
    .optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const handleListBookings: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parameter tidak valid." });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      res.status(401).json({ error: "Tidak terautentikasi." });
      return;
    }

    let bookings;
    if (user.role === "penyedia") {
      const provider = await findProviderByUserId(userId);
      if (!provider) {
        res.json({ data: [] });
        return;
      }
      bookings = await findBookingsByProvider(provider.id, {
        status: parsed.data.status,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      });
    } else {
      bookings = await findBookingsByUser(userId, {
        status: parsed.data.status,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      });
    }

    res.json({ data: bookings });
  } catch (error) {
    console.error("List bookings error:", error);
    res.status(500).json({ error: "Gagal mengambil riwayat pesanan." });
  }
};
