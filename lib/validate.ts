// H2, H3, H4, M4, M5: Centralised input validation & sanitisation

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const COLOR_RE    = /^#[0-9a-fA-F]{6}$/;          // M4: only valid hex colors
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // L4: server-side email check

export const LIMITS = {
  NAME_MAX:        100,
  DESCRIPTION_MAX: 500,
  SONGS_MAX:       500,   // H4: cap songs per playlist
  PLAYLISTS_MAX:   50,    // H4: cap playlists per user
  PASSWORD_MIN:    8,     // L3: raised from 6
  PASSWORD_MAX:    128,
} as const;

export function sanitizeString(str: unknown, maxLen: number): string {
  if (typeof str !== "string") return "";
  // M5: strip HTML tags, trim whitespace, enforce length
  return str
    .replace(/<[^>]*>/g, "")          // strip HTML
    .replace(/[\x00-\x1F\x7F]/g, "") // strip control chars
    .trim()
    .slice(0, maxLen);
}

export function isValidVideoId(id: unknown): boolean {
  return typeof id === "string" && VIDEO_ID_RE.test(id);
}

export function isValidColor(color: unknown): boolean {
  return typeof color === "string" && COLOR_RE.test(color);
}

export function isValidEmail(email: unknown): boolean {
  return typeof email === "string" && EMAIL_RE.test(email) && email.length <= 254;
}

export function isValidPassword(pw: unknown): boolean {
  return (
    typeof pw === "string" &&
    pw.length >= LIMITS.PASSWORD_MIN &&
    pw.length <= LIMITS.PASSWORD_MAX
  );
}

// H3: Sanitise MongoDB ObjectId — must be 24 hex chars
export function isValidObjectId(id: unknown): boolean {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

export function isValidPlaylistId(id: unknown): boolean {
  return typeof id === "string" && /^[A-Za-z][A-Za-z0-9_-]{9,127}$/.test(id);
}

export function sanitizeSongs(raw: unknown): { id: string }[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > LIMITS.SONGS_MAX) return null;
  const cleaned: { id: string }[] = [];
  for (const item of raw) {
    if (!isValidVideoId(item?.id)) return null; // reject entire array on bad entry
    cleaned.push({ id: item.id });
  }
  return cleaned;
}
