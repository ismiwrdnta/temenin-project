import type { RequestHandler } from "express";
import { isDatabaseConfigured } from "../db/pool";
import { findUserById } from "../repositories/users";
import { findProviderByUserId } from "../repositories/providers";
import { findBookingDetailById } from "../repositories/bookings";

export const handleGetBooking: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const bookingId = req.params.id as string;

  try {
    const booking = await findBookingDetailById(bookingId);
    if (!booking) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(401).json({ error: "Tidak terautentikasi." });
      return;
    }

    const isCustomer = booking.user_id === userId;
    let isProvider = false;
    if (user.role === "penyedia") {
      const provider = await findProviderByUserId(userId);
      isProvider = provider?.id === booking.provider_id;
    }

    if (!isCustomer && !isProvider) {
      res.status(403).json({ error: "Akses ditolak." });
      return;
    }

    res.json({ data: booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ error: "Gagal mengambil detail pesanan." });
  }
};
