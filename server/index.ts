import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGoogleAuth } from "./routes/auth-google";
import { handleRegister } from "./routes/auth-register";
import { handleLogin } from "./routes/auth-login";
import { handleMe } from "./routes/auth-me";
import { requireAuth } from "./middleware/require-auth";
import { handleSearchProviders } from "./routes/providers-search";
import { handleGetProviderDetail } from "./routes/providers-detail";
import { handleUpdateProviderProfile } from "./routes/providers-update-profile";
import { handleCreateBooking } from "./routes/bookings-create";
import { handleListBookings } from "./routes/bookings-list";
import { handleConfirmBooking } from "./routes/bookings-confirm";

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
  app.post("/api/auth/google", handleGoogleAuth);
  app.get("/api/auth/me", requireAuth, handleMe);

  // Providers — publik (tidak perlu login untuk lihat)
  app.get("/api/providers", handleSearchProviders);
  app.get("/api/providers/:id", handleGetProviderDetail);

  // Providers — perlu login + role penyedia
  app.put("/api/providers/profile", requireAuth, handleUpdateProviderProfile);

  // Bookings — semua perlu login
  app.post("/api/bookings", requireAuth, handleCreateBooking);
  app.get("/api/bookings", requireAuth, handleListBookings);
  app.patch("/api/bookings/:id/confirm", requireAuth, handleConfirmBooking);

  return app;
}
