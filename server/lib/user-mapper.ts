import type { PublicUser, UserRole } from "@shared/api";

export type UserRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  picture_url: string | null;
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    phone: row.phone ?? undefined,
    role: row.role,
    picture: row.picture_url ?? undefined,
  };
}
