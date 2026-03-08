"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe } from "@/app/auth/auth";
import {
  normalizePermissionNames,
} from "@/lib/authz";
import {
  getSessionUserStoreIds,
  getSessionUserStoreType,
  type SessionStoreType,
  type SessionUser,
} from "@/lib/session-user";
import { clearAuthCookie, setAuthCookie } from "@/lib/cookie";
import {
  clearStoredSession,
  getActiveSessionToken,
  readStoredSessionToken,
  readStoredSessionUser,
  SESSION_CLEARED_EVENT,
  writeStoredSessionToken,
  writeStoredSessionUser,
} from "@/lib/session";

type SessionContextValue = {
  token: string | null;
  user: SessionUser | null;
  permissions: string[];
  storeType: SessionStoreType | null;
  storeIds: string[];
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (token: string, user?: SessionUser | null) => Promise<SessionUser | null>;
  signOut: () => void;
  refreshUser: (tokenOverride?: string) => Promise<SessionUser | null>;
  setUser: (user: SessionUser | null) => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const setUser = useCallback((nextUser: SessionUser | null) => {
    setUserState(nextUser);
    writeStoredSessionUser(nextUser);
  }, []);

  const setTokenValue = useCallback((nextToken: string | null) => {
    setToken(nextToken);
    writeStoredSessionToken(nextToken);

    if (nextToken) {
      setAuthCookie(nextToken);
    } else {
      clearAuthCookie();
    }
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUserState(null);
    clearAuthCookie();
    clearStoredSession();
  }, []);

  const refreshUser = useCallback(
    async (tokenOverride?: string) => {
      const activeToken = tokenOverride ?? token ?? getActiveSessionToken();
      if (!activeToken) {
        setUser(null);
        return null;
      }

      try {
        setTokenValue(activeToken);
        const nextUser = (await getMe(activeToken)) as SessionUser;
        setUser(nextUser);
        return nextUser;
      } catch (error) {
        signOut();
        throw error;
      }
    },
    [setTokenValue, setUser, signOut, token],
  );

  const signIn = useCallback(
    async (nextToken: string, nextUser?: SessionUser | null) => {
      setTokenValue(nextToken);

      if (nextUser) {
        setUser(nextUser);
        return nextUser;
      }

      return refreshUser(nextToken);
    },
    [refreshUser, setTokenValue, setUser],
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const storedToken = readStoredSessionToken();
      const storedUser = readStoredSessionUser();

      setToken(storedToken);
      setUserState(storedUser);

      if (!storedToken) {
        if (active) setIsHydrated(true);
        return;
      }

      try {
        setAuthCookie(storedToken);
        const nextUser = (await getMe(storedToken)) as SessionUser;
        if (!active) return;
        setUser(nextUser);
      } catch {
        if (!active) return;
        signOut();
      } finally {
        if (active) setIsHydrated(true);
      }
    };

    const syncFromStorage = () => {
      if (!active) return;
      setToken(readStoredSessionToken());
      setUserState(readStoredSessionUser());
    };

    const handleSessionCleared = () => {
      if (!active) return;
      setToken(null);
      setUserState(null);
      clearAuthCookie();
    };

    void bootstrap();

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);

    return () => {
      active = false;
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
    };
  }, [setUser, signOut]);

  const value = useMemo<SessionContextValue>(() => {
    const permissions = normalizePermissionNames(user?.permissions);
    const storeType = getSessionUserStoreType(user);
    const storeIds = getSessionUserStoreIds(user);

    return {
      token,
      user,
      permissions,
      storeType,
      storeIds,
      isAuthenticated: Boolean(token),
      isHydrated,
      signIn,
      signOut,
      refreshUser,
      setUser,
    };
  }, [isHydrated, refreshUser, setUser, signIn, signOut, token, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider.");
  }
  return context;
}
