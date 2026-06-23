import type { UserRole } from "@shared/api";

/** Email yang dianggap akun admin (local part mengandung "admin"). */
export function isAdminEmail(email: string): boolean {
  const local = email.trim().toLowerCase().split("@")[0] ?? "";
  return local.includes("admin");
}

export function resolveRoleForEmail(
  email: string,
  role: UserRole,
): UserRole {
  return isAdminEmail(email) ? "admin" : role;
}

export function getDashboardPathForRole(role: UserRole): string {
  if (role === "admin") return "/dashboard-admin";
  if (role === "penyedia") return "/dashboard-penyedia";
  return "/dashboard";
}
