import type { RequestHandler } from "express";
import { isDatabaseConfigured } from "../db/pool";
import { findBookingById, updateBookingStatus } from "../repositories/bookings";
import {
  findPaymentByBookingId,
  releaseEscrow,
} from "../repositories/payments";
import {
  findWalletByProviderId,
  creditWallet,
} from "../repositories/payments";

export const handleCompleteBooking: RequestHandler = async (req, res) => {
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
    const booking = await findBookingById(bookingId);
    if (!booking || booking.user_id !== userId) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    if (!["confirmed", "in_progress"].includes(booking.status)) {
      res.status(400).json({ error: "Sesi belum bisa diselesaikan." });
      return;
    }

    await updateBookingStatus(booking.id, "completed", { completed_at: true });

    const payment = await findPaymentByBookingId(booking.id);
    if (payment && payment.status === "paid") {
      await releaseEscrow(booking.id, "user_confirm");

      const wallet = await findWalletByProviderId(booking.provider_id);
      if (wallet) {
        const totalPrice = parseFloat(booking.total_price);
        const platformFee = parseFloat(booking.platform_fee);
        await creditWallet(
          wallet.id,
          totalPrice,
          booking.id,
          platformFee,
          "Pembayaran sesi selesai",
        );
      }
    }

    res.json({ data: { status: "completed" } });
  } catch (error) {
    console.error("Complete booking error:", error);
    res.status(500).json({ error: "Gagal menyelesaikan sesi." });
  }
};
