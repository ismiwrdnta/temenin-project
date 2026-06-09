/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

export type UserRole = "pengguna" | "penyedia";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  picture?: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface MeResponse {
  user: PublicUser;
}

export interface AuthErrorResponse {
  error: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  accessToken: string;
  role?: UserRole;
}

/** @deprecated Use AuthResponse */
export interface GoogleAuthUser extends PublicUser {}

/** @deprecated Use AuthResponse */
export interface GoogleAuthResponse extends AuthResponse {}

export interface GoogleAuthErrorResponse {
  error: string;
}
