import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// C4 FIX: Fail hard if secret missing — never fall back to a known value
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error(
    "SECURITY: JWT_SECRET env var is missing or too short (min 32 chars). " +
    "Set it in .env.local before starting the server."
  );
}
const SECRET = new TextEncoder().encode(rawSecret);

// C3 FIX: bcrypt with cost factor 12 (replaces SHA-256 + static salt)
const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT helpers (jose — Edge-compatible)
export async function createToken(payload: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")   // Reduced from 30d — shorter window limits damage if stolen
    .sign(SECRET);
}

// C5 FIX: function is properly async, always awaited
export async function verifyToken(
  token: string
): Promise<{ id: string; email: string; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}
