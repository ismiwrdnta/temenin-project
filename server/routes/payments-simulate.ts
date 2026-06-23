import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { findBookingById } from "../repositories/bookings";
import {
  createPayment,
  createEscrow,
  findPaymentByBookingId,
  updatePaymentStatus,
} from "../repositories/payments";

const simulateSchema = z.object({
  booking_id: z.string().uuid(),
});

export const handleSimulatePayment: RequestHandler = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Simulasi pembayaran tidak tersedia di production." });
    return;
  }

  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = simulateSchema.safeParse(req.body);
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

    let payment = await findPaymentByBookingId(booking.id);
    if (!payment) {
      const orderId = `DEV-${booking.id}-${Date.now()}`;
      payment = await createPayment({
        bookingId: booking.id,
        midtransOrderId: orderId,
        amount: Math.round(parseFloat(booking.total_price)),
      });
    }

    if (payment.status !== "paid") {
      payment =
        (await updatePaymentStatus(payment.id, "paid", {
          transactionId: `DEV-TXN-${Date.now()}`,
          paymentMethod: "dev_simulate",
        })) ?? payment;

      await createEscrow({
        bookingId: booking.id,
        paymentId: payment.id,
        amount: parseFloat(payment.amount),
      });
    }

    res.json({
      data: {
        payment,
        message: "Pembayaran simulasi berhasil. Dana ditahan di escrow.",
      },
    });
  } catch (error) {
    console.error("Simulate payment error:", error);
    res.status(500).json({ error: "Gagal mensimulasikan pembayaran." });
  }
};
