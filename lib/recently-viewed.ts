const KEY = "havennest.recent";
const MAX = 8;

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentlyViewedIds().filter((item) => item !== id);
    current.unshift(id);
    window.localStorage.setItem(KEY, JSON.stringify(current.slice(0, MAX)));
  } catch {
    // Storage unavailable — viewing history is best-effort.
  }
}
