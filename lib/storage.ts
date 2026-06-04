/** Read JSON from localStorage — use only in useEffect after mount to avoid hydration mismatch. */
export function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return (JSON.parse(raw) as T) ?? fallback
  } catch {
    return fallback
  }
}

export function writeLocalJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}
