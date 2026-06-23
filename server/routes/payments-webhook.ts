import type { RequestHandler } from "express";
import { isDatabaseConfigured } from "../db/pool";
import { verifyMidtransSignature } from "../lib/midtrans";
import { findBookingById } from "../repositories/bookings";
import { findProviderById } from "../repositories/providers";
import {
  findPaymentByOrderId,
  updatePaymentStatus,
  createEscrow,
} from "../repositories/payments";

// Webhook ini dipanggil oleh server Midtrans, bukan oleh user.
// Tidak perlu requireAuth — keamanan dijamin lewat verifikasi signature.
export const handleMidtransWebhook: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const notification = req.body as {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    transaction_status: string;
    fraud_status?: string;
    transaction_id: string;
    payment_type: string;
  };

  const isValid = verifyMidtransSignature(
    notification.order_id,
    notification.status_code,
    notification.gross_amount,
    notification.signature_key,
  );

  if (!isValid) {
    res.status(401).json({ error: "Signature tidak valid." });
    return;
  }

  try {
    const payment = await findPaymentByOrderId(notification.order_id);
    if (!payment) {
      res.status(404).json({ error: "Payment tidak ditemukan." });
      return;
    }

    let newStatus: "pending" | "paid" | "failed" | "expired" | "refunded" =
      payment.status;

    const { transaction_status, fraud_status } = notification;

    if (transaction_status === "capture" && fraud_status === "accept") {
      newStatus = "paid";
    } else if (transaction_status === "settlement") {
      newStatus = "paid";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      newStatus = "failed";
    } else if (transaction_status === "refund") {
      newStatus = "refunded";
    }

    if (newStatus !== payment.status) {
      await updatePaymentStatus(payment.id, newStatus, {
        transactionId: notification.transaction_id,
        paymentMethod: notification.payment_type,
      });

      if (newStatus === "paid") {
        const booking = await findBookingById(payment.booking_id);
        if (booking) {
          await createEscrow({
            bookingId: payment.booking_id,
            paymentId: payment.id,
            amount: parseFloat(payment.amount),
          });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    res.status(500).json({ error: "Gagal memproses notifikasi." });
  }
};
