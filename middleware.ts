// ─────────────────────────────────────────────────────────────
// Middleware — The Gatekeeper of Your App
// ─────────────────────────────────────────────────────────────
//
// 📚 WHAT IS MIDDLEWARE?
// Middleware is code that runs BEFORE a page loads. Think of it
// as a security guard at the entrance of a building:
//   - It checks your badge (JWT cookie)
//   - If you have a valid badge → you can enter (proceed to the page)
//   - If you don't → you get redirected to the lobby (login page)
//
// 📚 HOW IT WORKS IN NEXT.JS:
// 1. This file MUST be named `middleware.ts` and placed in the project root
// 2. The `config.matcher` at the bottom tells Next.js WHICH routes
//    this middleware should run on
// 3. The middleware function receives the request and can:
//    - Allow it through (NextResponse.next())
//    - Redirect it (NextResponse.redirect())
//    - Add headers (response.headers.set())
//
// 📚 HEADERS LEARNING POINT:
// We add a custom "x-user-id" header to the request. This lets
// Server Components downstream know WHO is logged in without
// having to re-parse the cookie themselves.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ─── Configuration ───

// Cookie name must match what we use in lib/auth.ts
const COOKIE_NAME = "keepr-auth-token";

// Pages that DON'T require login (anyone can visit these)
const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/features",
  "/pricing",
  "/api/auth",       // All auth API routes must be public (login, register, etc.)
];

// The home page "/" is also public
function isPublicPath(pathname: string): boolean {
  // The home page is always public
  if (pathname === "/") {
    return true;
  }

  // Check if the path starts with any of our public paths
  return PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath));
}

// ─── Helper: Verify JWT in Edge Runtime ───
// Middleware runs in the "Edge Runtime" (a lightweight environment).
// We can't import our lib/auth.ts here because it uses Node.js features.
// So we duplicate the JWT verification logic using `jose` (which works in Edge).
async function verifyTokenInEdge(token: string): Promise<string | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return null;
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload.userId as string;
  } catch {
    // Token is invalid or expired
    return null;
  }
}

// ─── The Middleware Function ───

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Step 1: If this is a public path, let it through — no login required
  if (isPublicPath(pathname)) {
    // BONUS: If the user IS logged in and tries to visit /login or /signup,
    // redirect them to /workspace instead (they don't need to login again!)
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      const token = request.cookies.get(COOKIE_NAME)?.value;

      if (token) {
        const userId = await verifyTokenInEdge(token);
        if (userId) {
          // User is already logged in — send them to workspace
          return NextResponse.redirect(new URL("/workspace", request.url));
        }
      }
    }

    // Public path, no valid token (or not a login/signup page) — let through
    return NextResponse.next();
  }

  // Step 2: This is a protected path — check for the auth cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // No cookie at all — redirect to login
  if (!token) {
    const loginUrl = new URL("/sign-in", request.url);
    // Save where they were trying to go, so we can redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Step 3: Cookie exists — verify the JWT is valid
  const userId = await verifyTokenInEdge(token);

  if (!userId) {
    // Token is invalid or expired — redirect to login
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Step 4: Token is valid! Add the userId as a custom header.
  //
  // 📚 HEADERS LEARNING POINT:
  // HTTP headers are key-value pairs sent with every request/response.
  // Custom headers usually start with "x-" by convention.
  // By adding "x-user-id" here, any Server Component can read it
  // using `headers()` from "next/headers" without re-verifying the JWT.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userId);

  // Let the request through with the added header
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// ─── Route Matcher ───
// Tell Next.js which routes this middleware should run on.
// This pattern excludes static files, images, and the favicon.
export const config = {
  matcher: [
    // Match all routes EXCEPT:
    // - _next (Next.js internals like CSS, JS bundles)
    // - Static files (images, fonts, etc.)
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
