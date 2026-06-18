// ─────────────────────────────────────────────────────────────
// Authentication Library — The Heart of Your Auth System
// ─────────────────────────────────────────────────────────────
//
// This file contains ALL the core auth logic:
//   1. Password hashing (bcrypt)
//   2. JWT token creation & verification (jose)
//   3. Cookie management (setting/reading/deleting auth cookies)
//   4. A helper to get the current user from cookies
//
// 📚 KEY CONCEPTS:
//
// HASHING: Converting a password into a random-looking string
//   that can't be reversed. Even if someone steals your database,
//   they can't read the original passwords.
//
// JWT (JSON Web Token): A compact, signed "ticket" that proves
//   who a user is. It contains the user's ID and an expiration
//   date, all signed with a secret key so it can't be forged.
//
// COOKIES: Small pieces of data the browser stores and
//   automatically sends with every request. We store the JWT
//   in an "HttpOnly" cookie so JavaScript can't access it
//   (this prevents XSS attacks from stealing the token).
// ─────────────────────────────────────────────────────────────

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ─── Configuration ───

// The name of the cookie that stores the JWT token.
// You'll see this in your browser's DevTools under Application > Cookies.
const COOKIE_NAME = "keepr-auth-token";

// How long the token (and cookie) should last before expiring.
// After 7 days, the user will need to log in again.
const TOKEN_EXPIRY = "7d";

// The secret key used to sign JWTs. This MUST be kept secret!
// We read it from the .env file. If it's missing, we throw an error
// immediately so you know something is wrong.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set in your .env file! " +
      "Add a random string like: JWT_SECRET=\"my-super-secret-key\""
    );
  }
  // jose requires the secret as a Uint8Array (a binary format),
  // so we convert the string to bytes using TextEncoder.
  return new TextEncoder().encode(secret);
}


// ─────────────────────────────────────────────────────────────
// 1. PASSWORD HASHING
// ─────────────────────────────────────────────────────────────

/**
 * Hash a plain-text password so it's safe to store in the database.
 *
 * HOW IT WORKS:
 *   "mypassword" → "$2a$10$Xz3Jk..." (a long random-looking string)
 *
 * The "10" is the "salt rounds" — it controls how slow the hashing is.
 * Slower = harder for attackers to brute-force. 10 is a good default.
 *
 * @param password - The plain-text password from the user's form
 * @returns The hashed password to store in the database
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

/**
 * Check if a plain-text password matches a hashed password.
 *
 * Used during login: we take the password the user typed,
 * and compare it against the hash we stored during registration.
 *
 * @param password - The plain-text password the user just typed
 * @param hashedPassword - The hashed password from the database
 * @returns true if they match, false if they don't
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}


// ─────────────────────────────────────────────────────────────
// 2. JWT TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * Create a signed JWT token for a user.
 *
 * WHAT'S INSIDE THE TOKEN (the "payload"):
 *   { userId: "clx1abc...", iat: 1234567890, exp: 1235172690 }
 *   - userId: who this token belongs to
 *   - iat: "issued at" timestamp (when the token was created)
 *   - exp: "expires at" timestamp (when the token stops working)
 *
 * The token is SIGNED with our secret key. This means:
 *   - Anyone can READ the payload (it's just base64-encoded)
 *   - But nobody can MODIFY it without the secret key
 *   - So we can trust the userId inside is legitimate
 *
 * @param userId - The user's database ID to embed in the token
 * @returns The signed JWT string (like "eyJhbGciOi...")
 */
export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    // Set the algorithm — HS256 is the most common for JWTs
    .setProtectedHeader({ alg: "HS256" })
    // Record when this token was created
    .setIssuedAt()
    // Set when this token expires (e.g., "7d" = 7 days from now)
    .setExpirationTime(TOKEN_EXPIRY)
    // Sign it with our secret key
    .sign(getJwtSecret());

  return token;
}

/**
 * Verify a JWT token and extract the userId from it.
 *
 * This does TWO things:
 *   1. Checks that the token was signed with our secret key (not forged)
 *   2. Checks that the token hasn't expired
 *
 * If either check fails, we return null (the token is invalid).
 *
 * @param token - The JWT string to verify
 * @returns The userId if valid, or null if the token is bad/expired
 */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    // jwtVerify throws an error if the token is invalid or expired
    const { payload } = await jwtVerify(token, getJwtSecret());

    // Extract the userId we stored when creating the token
    const userId = payload.userId as string;
    return userId;
  } catch {
    // Token is invalid, expired, or tampered with
    return null;
  }
}


// ─────────────────────────────────────────────────────────────
// 3. COOKIE MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * Store the JWT token in a secure, HttpOnly cookie.
 *
 * 🍪 COOKIE OPTIONS EXPLAINED:
 *   - httpOnly: true  → JavaScript can't access it (prevents XSS theft)
 *   - secure: true    → Only sent over HTTPS (prevents network sniffing)
 *   - sameSite: "lax" → Prevents CSRF attacks (cookie only sent from same site)
 *   - path: "/"       → Cookie is available on ALL pages
 *   - maxAge: ...     → Cookie expires after 7 days (in seconds)
 *
 * @param token - The JWT token to store
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,                        // JavaScript can't read this cookie
    secure: process.env.NODE_ENV === "production",  // HTTPS only in production
    sameSite: "lax",                       // Prevents cross-site request forgery
    path: "/",                             // Available on all pages
    maxAge: 60 * 60 * 24 * 7,             // 7 days in seconds
  });
}

/**
 * Delete the auth cookie (used for logout).
 *
 * After calling this, the browser will stop sending the JWT
 * with requests, and the middleware will redirect to /login.
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Read the JWT from cookies and return the userId.
 *
 * This is the main helper you'll use in Server Components
 * and API routes to find out WHO is making the request.
 *
 * FLOW:
 *   1. Read the cookie from the incoming request
 *   2. If no cookie → user is not logged in → return null
 *   3. If cookie exists → verify the JWT → return userId
 *   4. If JWT is invalid/expired → return null
 *
 * @returns The userId if logged in, or null if not
 */
export async function getAuthFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);

  // No cookie found — user isn't logged in
  if (!token) {
    return null;
  }

  // Verify the token and extract the userId
  const userId = await verifyToken(token.value);
  return userId;
}

/**
 * Get the cookie name (exported for use in middleware).
 * Middleware can't use the `cookies()` function from Next.js,
 * so it reads cookies directly from the request object.
 */
export function getAuthCookieName(): string {
  return COOKIE_NAME;
}
