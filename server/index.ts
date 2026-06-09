import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGoogleAuth } from "./routes/auth-google";
import { handleRegister } from "./routes/auth-register";
import { handleLogin } from "./routes/auth-login";
import { handleMe } from "./routes/auth-me";
import { requireAuth } from "./middleware/require-auth";

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

  return app;
}
