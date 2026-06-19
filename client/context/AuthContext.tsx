import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "@shared/api";
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

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginLocal: (profile: LoginLocalInput) => void;
  loginFromStoredAccount: (account: StoredAccount) => void;
  logout: () => void;
};

const SESSION_KEY = "temenin_auth";

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

  const persistUser = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    sessionStorage.removeItem("temenin_token");
  }, []);

  const loginFromStoredAccount = useCallback(
    (account: StoredAccount) => {
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

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("temenin_token");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      loginLocal,
      loginFromStoredAccount,
      logout,
    }),
    [user, loginLocal, loginFromStoredAccount, logout],
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
