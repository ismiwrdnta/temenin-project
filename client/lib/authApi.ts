import type {
  AuthErrorResponse,
  AuthResponse,
  LoginRequest,
  MeResponse,
  PublicUser,
  RegisterRequest,
  UserRole,
} from "@shared/api";

const TOKEN_KEY = "temenin_token";

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

function authHeaders(token?: string): HeadersInit {
  const t = token ?? getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as AuthErrorResponse;
  return data.error ?? "Terjadi kesalahan. Coba lagi.";
}

export async function registerUser(
  data: RegisterRequest,
): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<AuthResponse>;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<AuthResponse>;
}

export async function authenticateWithGoogle(
  accessToken: string,
  role?: UserRole,
): Promise<AuthResponse> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, role }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<AuthResponse>;
}

export async function fetchCurrentUser(
  token?: string,
): Promise<PublicUser> {
  const res = await fetch("/api/auth/me", {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as MeResponse;
  return data.user;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}
