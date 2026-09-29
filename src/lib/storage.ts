const KEY = "explola-v1";
const SEEN_KEY = "explola-seen";

export function readStorage<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStorage(value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function clearStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

/** Kept separate from the main store so a later save cannot wipe it. */
export function hasSeenOnboarding() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
}
