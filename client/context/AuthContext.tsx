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
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  setStoredToken,
} from "@/lib/authApi";

export type { UserRole };

export type AuthUser = {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  email: string;
  phone?: string;
  picture?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: PublicUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

function toAuthUser(user: PublicUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    initials: getInitials(user.name),
    role: user.role,
    email: user.email,
    phone: user.phone,
    picture: user.picture,
  };
}

function loadCachedUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadCachedUser);
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));

  const persistUser = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  }, []);

  const setSession = useCallback(
    (token: string, publicUser: PublicUser) => {
      setStoredToken(token);
      persistUser(toAuthUser(publicUser));
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    clearStoredToken();
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      logout();
      return;
    }
    const publicUser = await fetchCurrentUser(token);
    persistUser(toAuthUser(publicUser));
  }, [logout, persistUser]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser(token)
      .then((publicUser) => persistUser(toAuthUser(publicUser)))
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, [logout, persistUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      setSession,
      logout,
      refreshUser,
    }),
    [user, isLoading, setSession, logout, refreshUser],
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
