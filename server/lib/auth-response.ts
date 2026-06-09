import type { Response } from "express";
import type { AuthResponse, PublicUser } from "@shared/api";
import { signToken } from "./jwt";
import { toPublicUser } from "./user-mapper";
import type { UserRow } from "./user-mapper";

export function sendAuthResponse(res: Response, row: UserRow, status = 200) {
  const user = toPublicUser(row);
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const body: AuthResponse = { token, user };
  res.status(status).json(body);
}

export function mapPublicUser(row: UserRow): PublicUser {
  return toPublicUser(row);
}
