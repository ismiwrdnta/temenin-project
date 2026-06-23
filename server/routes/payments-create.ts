import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { isMidtransConfigured, getSnapClient } from "../lib/midtrans";
import { findUserById } from "../repositories/users";
import { findBookingById } from "../repositories/bookings";
import {
  createPayment,
  findPaymentByBookingId,
} from "../repositories/payments";

const createPaymentSchema = z.object({
  booking_id: z.string().uuid(),
});

export const handleCreatePayment: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }
  if (!isMidtransConfigured()) {
    res.status(503).json({ error: "Midtrans belum dikonfigurasi (MIDTRANS_SERVER_KEY)." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "booking_id tidak valid." });
    return;
  }

  try {
    const booking = await findBookingById(parsed.data.booking_id);
    if (!booking || booking.user_id !== userId) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    if (booking.status !== "waiting_confirmation") {
      res.status(400).json({ error: "Status pesanan tidak valid untuk pembayaran." });
      return;
    }

    const existing = await findPaymentByBookingId(booking.id);
    if (existing) {
      res.status(409).json({ error: "Transaksi sudah dibuat untuk pesanan ini." });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ error: "User tidak ditemukan." });
      return;
    }

    const orderId = `TEMENIN-${booking.id}-${Date.now()}`;
    const grossAmount = Math.round(parseFloat(booking.total_price));

    const snap = getSnapClient();
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user.full_name,
        email: user.email,
        phone: user.phone ?? undefined,
      },
      expiry: { unit: "hours", duration: 1 },
    });

    const payment = await createPayment({
      bookingId: booking.id,
      midtransOrderId: orderId,
      amount: grossAmount,
    });

    res.json({
      data: {
        payment,
        snap_token: transaction.token,
        snap_url: transaction.redirect_url,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: "Gagal membuat transaksi pembayaran." });
  }
};
