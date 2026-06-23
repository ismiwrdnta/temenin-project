import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGoogleAuth } from "./routes/auth-google";
import { handleRegister } from "./routes/auth-register";
import { handleLogin } from "./routes/auth-login";
import { handleSendOtp } from "./routes/auth-send-otp";
import { handleVerifyOtp } from "./routes/auth-verify-otp";
import { handleMe } from "./routes/auth-me";
import { requireAuth } from "./middleware/require-auth";
import { handleSearchProviders } from "./routes/providers-search";
import { handleGetProviderDetail } from "./routes/providers-detail";
import { handleGetMyProviderProfile } from "./routes/providers-me";
import { handleUpdateProviderProfile } from "./routes/providers-update-profile";
import { handleCreateBooking } from "./routes/bookings-create";
import { handleListBookings } from "./routes/bookings-list";
import { handleGetBooking } from "./routes/bookings-get";
import { handleConfirmBooking } from "./routes/bookings-confirm";
import { handleCompleteBooking } from "./routes/bookings-complete";
import { handleGetMyWallet, handleGetWalletTransactions, handleRequestWithdrawal } from "./routes/payments-wallet";
import { handleCreatePayment } from "./routes/payments-create";
import { handleMidtransWebhook } from "./routes/payments-webhook";
import { handleSimulatePayment } from "./routes/payments-simulate";

import { handleCreateReview } from "./routes/reviews-create";
import { handleListProviderReviews } from "./routes/reviews-list";
import { handleReplyReview } from "./routes/reviews-reply";
import { handleGetChatHistory } from "./routes/chat-history";
import { handleSendChatMessage } from "./routes/chat-send";
import { handleGetUnreadCount } from "./routes/chat-unread";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/send-otp", requireAuth, handleSendOtp);
  app.post("/api/auth/verify-otp", requireAuth, handleVerifyOtp);
  app.post("/api/auth/google", handleGoogleAuth);
  app.get("/api/auth/me", requireAuth, handleMe);

  // Providers — publik (tidak perlu login untuk lihat)
  app.get("/api/providers", handleSearchProviders);
  app.get("/api/providers/me", requireAuth, handleGetMyProviderProfile);
  app.get("/api/providers/:id", handleGetProviderDetail);

  // Providers — perlu login + role penyedia
  app.put("/api/providers/profile", requireAuth, handleUpdateProviderProfile);

  // Bookings — semua perlu login
  app.post("/api/bookings", requireAuth, handleCreateBooking);
  app.get("/api/bookings", requireAuth, handleListBookings);
  app.get("/api/bookings/:id", requireAuth, handleGetBooking);
  app.patch("/api/bookings/:id/confirm", requireAuth, handleConfirmBooking);

  app.patch("/api/bookings/:id/complete", requireAuth, handleCompleteBooking);
  app.get("/api/payments/wallet/me", requireAuth, handleGetMyWallet);
  app.get("/api/payments/wallet/transactions", requireAuth, handleGetWalletTransactions);
  app.post("/api/payments/withdraw", requireAuth, handleRequestWithdrawal);
  app.post("/api/payments/create", requireAuth, handleCreatePayment);
  app.post("/api/payments/webhook", handleMidtransWebhook);
  app.post("/api/payments/simulate", requireAuth, handleSimulatePayment);

  // Reviews
  app.post("/api/reviews", requireAuth, handleCreateReview);
  app.get("/api/reviews/provider/:providerId", handleListProviderReviews); // publik
  app.post("/api/reviews/:id/reply", requireAuth, handleReplyReview);

  // Chat
  app.get("/api/chat/:bookingId", requireAuth, handleGetChatHistory);
  app.post("/api/chat/:bookingId/send", requireAuth, handleSendChatMessage);
  app.get("/api/chat/:bookingId/unread", requireAuth, handleGetUnreadCount);

  return app;
}
