import type { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import type {
  GoogleAuthErrorResponse,
  GoogleAuthRequest,
  UserRole,
} from "@shared/api";
import { isDatabaseConfigured } from "../db/pool";
import { isJwtConfigured } from "../lib/jwt";
import { sendAuthResponse } from "../lib/auth-response";
import { upsertGoogleUser } from "../repositories/users";

const clientId = process.env.GOOGLE_CLIENT_ID;

function getOAuthClient() {
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  return new OAuth2Client(clientId);
}

function isUserRole(value: unknown): value is UserRole {
  return value === "pengguna" || value === "penyedia";
}

export const handleGoogleAuth: RequestHandler = async (req, res) => {
  if (!clientId) {
    const body: GoogleAuthErrorResponse = {
      error: "Google Sign-In belum dikonfigurasi di server (GOOGLE_CLIENT_ID).",
    };
    res.status(503).json(body);
    return;
  }

  if (!isDatabaseConfigured() || !isJwtConfigured()) {
    const body: GoogleAuthErrorResponse = {
      error: "Database belum dikonfigurasi (DATABASE_URL, JWT_SECRET).",
    };
    res.status(503).json(body);
    return;
  }

  const { accessToken, role } = req.body as GoogleAuthRequest;

  if (!accessToken || typeof accessToken !== "string") {
    const body: GoogleAuthErrorResponse = { error: "Token Google tidak valid." };
    res.status(400).json(body);
    return;
  }

  const userRole: UserRole = isUserRole(role) ? role : "pengguna";

  try {
    const client = getOAuthClient();
    await client.getTokenInfo(accessToken);

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!profileRes.ok) {
      const body: GoogleAuthErrorResponse = {
        error: "Gagal mengambil profil Google.",
      };
      res.status(401).json(body);
      return;
    }

    const profile = (await profileRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };

    if (!profile.email || !profile.sub) {
      const body: GoogleAuthErrorResponse = {
        error: "Profil Google tidak lengkap.",
      };
      res.status(400).json(body);
      return;
    }

    const user = await upsertGoogleUser({
      email: profile.email,
      fullName: profile.name ?? profile.email.split("@")[0],
      role: userRole,
      pictureUrl: profile.picture,
      googleSub: profile.sub,
    });

    sendAuthResponse(res, user);
  } catch (error) {
    console.error("Google auth error:", error);
    const body: GoogleAuthErrorResponse = {
      error: "Token Google tidak valid atau sudah kedaluwarsa.",
    };
    res.status(401).json(body);
  }
};
