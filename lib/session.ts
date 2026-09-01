import type { SessionUser, User } from "@/lib/types";

const SESSION_KEY = "havennest.session";

let currentUser: SessionUser | null = null;
let hydrated = false;

const sessionListeners = new Set<() => void>();

function emit() {
  sessionListeners.forEach((listener) => listener());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      currentUser = JSON.parse(raw) as SessionUser;
    }
  } catch {
    currentUser = null;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    if (currentUser) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Storage may be unavailable (private mode, quota). Session still works in memory.
  }
}

function setUser(user: SessionUser | null) {
  currentUser = user;
  persist();
  emit();
}

export function subscribeToSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

export function getCurrentUser(): SessionUser | null {
  hydrate();
  return currentUser;
}

export function setSessionUser(user: SessionUser | null) {
  setUser(user);
}

function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function apiErrorMessage(data: { error?: unknown }): string {
  const { error } = data;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const flattened = error as { fieldErrors?: Record<string, { message?: string }[]> };
    const first = Object.values(flattened.fieldErrors ?? {})
      .flat()
      .find((item) => item?.message);
    if (first?.message) return first.message;
  }
  return "Something went wrong. Please try again.";
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: apiErrorMessage(data) };
  }
  setUser(toSessionUser(data.user));
  return { ok: true, user: currentUser! };
}

export async function registerUser(
  data: Omit<User, "id" | "createdAt"> & { password: string }
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    return { ok: false, error: apiErrorMessage(json) };
  }
  setUser(toSessionUser(json.user));
  return { ok: true, user: currentUser! };
}

export function logout() {
  setUser(null);
}
