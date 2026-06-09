import jwt from "jsonwebtoken";

const EXPIRES_IN = "7d";

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}

export function isJwtConfigured(): boolean {
  return Boolean(process.env.JWT_SECRET);
}
