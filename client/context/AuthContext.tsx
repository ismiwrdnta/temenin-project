import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicUser, UserRole } from "@shared/api";
import {
  getAccountByEmail,
  saveAccount,
  type StoredAccount,
} from "@/lib/local-accounts";
import { resolveCompanionId } from "@/lib/provider-link";

export type { UserRole };

export type AuthUser = {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  email: string;
  phone?: string;
  picture?: string;
  companionId?: number;
};

type LoginLocalInput = {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  picture?: string;
  companionId?: number;
  rememberAccount?: boolean;
};

// Shape response dari backend — lihat server/lib/auth-response.ts
type RemoteAuthResponse = {
  token: string;
  user: PublicUser;
};

type LoginRemoteInput = {
  email: string;
  password: string;
};

type RegisterRemoteInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Jalur lama — dipertahankan untuk halaman yang belum diintegrasikan
  loginLocal: (profile: LoginLocalInput) => void;
  loginFromStoredAccount: (account: StoredAccount) => void;
  // Jalur baru — terhubung ke backend asli
  loginRemote: (input: LoginRemoteInput) => Promise<void>;
  registerRemote: (input: RegisterRemoteInput) => Promise<void>;
  logout: () => void;
};

const SESSION_KEY = "temenin_auth";
const TOKEN_KEY = "temenin_token";

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildAuthUser(profile: LoginLocalInput): AuthUser {
  const companionId =
    profile.companionId ??
    (profile.role === "penyedia"
      ? resolveCompanionId(profile.name)
      : undefined);

  return {
    id: `local-${profile.email.toLowerCase()}`,
    name: profile.name.trim(),
    initials: getInitials(profile.name),
    role: profile.role,
    email: profile.email.trim().toLowerCase(),
    phone: profile.phone,
    picture: profile.picture,
    companionId,
  };
}

// Konversi response asli dari backend ke shape AuthUser yang dipakai
// di seluruh frontend — supaya halaman lain tidak perlu tahu bedanya
// user dari loginLocal vs loginRemote.
function mapRemoteUserToAuthUser(remote: PublicUser): AuthUser {
  return {
    id: remote.id,
    name: remote.name,
    initials: getInitials(remote.name),
    role: remote.role,
    email: remote.email,
    phone: remote.phone,
    picture: remote.picture,
    companionId:
      remote.role === "penyedia"
        ? resolveCompanionId(remote.name)
        : undefined,
  };
}

function loadCachedUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    if (user.role === "penyedia" && !user.companionId) {
      user.companionId = resolveCompanionId(user.name);
    }
    return user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadCachedUser);
  const [isLoading, setIsLoading] = useState(false);

  const persistUser = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  }, []);

  // ── Jalur LAMA — tetap ada, dipakai halaman yang belum diintegrasikan ──
  const loginFromStoredAccount = useCallback(
    (account: StoredAccount) => {
      sessionStorage.removeItem(TOKEN_KEY); // bukan sesi asli, jangan bawa token lama
      persistUser(
        buildAuthUser({
          email: account.email,
          name: account.name,
          role: account.role,
          phone: account.phone,
          companionId: account.companionId,
        }),
      );
    },
    [persistUser],
  );

  const loginLocal = useCallback(
    (profile: LoginLocalInput) => {
      sessionStorage.removeItem(TOKEN_KEY);
      const authUser = buildAuthUser(profile);
      persistUser(authUser);

      if (profile.rememberAccount !== false) {
        saveAccount({
          email: authUser.email,
          name: authUser.name,
          role: authUser.role,
          phone: authUser.phone,
        });
      }
    },
    [persistUser],
  );

  // ── Jalur BARU — terhubung ke backend asli ──────────────────────────
  const loginRemote = useCallback(
    async (input: LoginRemoteInput) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Gagal masuk. Coba lagi.");
        }

        const { token, user: remoteUser } = data as RemoteAuthResponse;
        sessionStorage.setItem(TOKEN_KEY, token);
        persistUser(mapRemoteUserToAuthUser(remoteUser));
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser],
  );

  const registerRemote = useCallback(
    async (input: RegisterRemoteInput) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Gagal mendaftar. Coba lagi.");
        }

        const { token, user: remoteUser } = data as RemoteAuthResponse;
        sessionStorage.setItem(TOKEN_KEY, token);
        persistUser(mapRemoteUserToAuthUser(remoteUser));
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      loginLocal,
      loginFromStoredAccount,
      loginRemote,
      registerRemote,
      logout,
    }),
    [
      user,
      isLoading,
      loginLocal,
      loginFromStoredAccount,
      loginRemote,
      registerRemote,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { getAccountByEmail };
