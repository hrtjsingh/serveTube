/**
 * H1 / L1 FIX: Simple in-memory rate limiter for auth routes.
 * For production with multiple instances, swap the Map for a Redis store (e.g. Upstash).
 */

interface Bucket {
  count:     number;
  resetAt:   number;
  lockUntil: number; // account lockout timestamp
}

const store = new Map<string, Bucket>();

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.resetAt < now && v.lockUntil < now) store.delete(k);
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs:   number; // rolling window in ms
  max:        number; // max requests per window
  lockoutMs?: number; // lockout duration after max exceeded (default: none)
}

export function checkRateLimit(
  key: string,
  opts: RateLimitOptions
): { allowed: boolean; retryAfterMs: number } {
  const now  = Date.now();
  let bucket = store.get(key);

  // If currently locked out
  if (bucket && bucket.lockUntil > now) {
    return { allowed: false, retryAfterMs: bucket.lockUntil - now };
  }

  // Reset window if expired
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + opts.windowMs, lockUntil: 0 };
  }

  bucket.count++;

  if (bucket.count > opts.max) {
    if (opts.lockoutMs) bucket.lockUntil = now + opts.lockoutMs;
    store.set(key, bucket);
    return {
      allowed: false,
      retryAfterMs: opts.lockoutMs ? opts.lockoutMs : bucket.resetAt - now,
    };
  }

  store.set(key, bucket);
  return { allowed: true, retryAfterMs: 0 };
}

// Preset configs
export const AUTH_LIMIT = { windowMs: 15 * 60 * 1000, max: 10, lockoutMs: 15 * 60 * 1000 };
export const REGISTER_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 };
export const API_LIMIT = { windowMs: 60 * 1000, max: 60 };

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0].trim() : "unknown").slice(0, 45);
}
