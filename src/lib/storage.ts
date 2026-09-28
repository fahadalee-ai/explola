const KEY = "explola-v1";

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
