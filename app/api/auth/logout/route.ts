// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout — Log Out (Clear the Auth Cookie)
// ─────────────────────────────────────────────────────────────
//
// Logout is surprisingly simple:
//   1. Delete the auth cookie
//   2. That's it!
//
// Once the cookie is gone, the middleware won't find a valid
// JWT on the next request, and the user will be redirected
// to the login page.
//
// We use POST (not GET) for logout because it's a state-changing
// action. GET requests should never modify state (this is a
// REST API best practice).
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export async function POST() {
  // Delete the auth cookie — user is now logged out
  await removeAuthCookie();

  return NextResponse.json({ message: "Logged out successfully!" });
}
