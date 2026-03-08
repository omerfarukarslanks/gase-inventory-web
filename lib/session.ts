import type { SessionUser } from "@/lib/session-user";

export const SESSION_STORAGE_KEYS = {
  token: "token",
  user: "user",
} as const;

export const SESSION_CLEARED_EVENT = "app:session-cleared";

let activeSessionToken: string | null | undefined;
let activeSessionUser: SessionUser | null | undefined;

function readTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(SESSION_STORAGE_KEYS.token)?.trim();
  return token ? token : null;
}

function readUserFromStorage(): SessionUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function getActiveSessionToken(): string | null {
  if (activeSessionToken !== undefined) {
    return activeSessionToken;
  }

  activeSessionToken = readTokenFromStorage();
  return activeSessionToken;
}

export function getActiveSessionUser(): SessionUser | null {
  if (activeSessionUser !== undefined) {
    return activeSessionUser;
  }

  activeSessionUser = readUserFromStorage();
  return activeSessionUser;
}

export function readStoredSessionToken(): string | null {
  activeSessionToken = readTokenFromStorage();
  return activeSessionToken;
}

export function readStoredSessionUser(): SessionUser | null {
  activeSessionUser = readUserFromStorage();
  return activeSessionUser;
}

export function writeStoredSessionToken(token: string | null) {
  const normalizedToken = token?.trim() ? token.trim() : null;
  activeSessionToken = normalizedToken;

  if (typeof window === "undefined") return;

  if (normalizedToken) {
    localStorage.setItem(SESSION_STORAGE_KEYS.token, normalizedToken);
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEYS.token);
}

export function writeStoredSessionUser(user: SessionUser | null) {
  activeSessionUser = user;

  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem(SESSION_STORAGE_KEYS.user, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEYS.user);
}

export function clearStoredSession(options?: { emitEvent?: boolean }) {
  activeSessionToken = null;
  activeSessionUser = null;

  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_STORAGE_KEYS.token);
  localStorage.removeItem(SESSION_STORAGE_KEYS.user);

  if (options?.emitEvent) {
    window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
  }
}
