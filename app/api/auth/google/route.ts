// ─────────────────────────────────────────────────────────────
// GET /api/auth/google — Start the Google OAuth Flow
// ─────────────────────────────────────────────────────────────
//
// 📚 OAUTH LEARNING POINT:
// OAuth is a protocol that lets users log in with their Google
// (or GitHub, Facebook, etc.) account instead of creating a
// separate username/password for your app.
//
// THE FLOW (simplified):
//   1. User clicks "Continue with Google" button
//   2. Your app redirects them to Google's login page
//   3. User logs in on Google and grants permission
//   4. Google redirects BACK to your app with a temporary "code"
//   5. Your app exchanges this code for the user's info
//   6. Your app creates/finds the user and logs them in
//
// This file handles Step 2 — building the Google URL and redirecting.
// The "callback" route handles Steps 4-6.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // If Google credentials aren't configured, return an error
  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID in .env" },
      { status: 500 }
    );
  }

  // Build the URL that sends the user to Google's consent screen
  // Each parameter tells Google what we want:
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", `${appUrl}/api/auth/google/callback`);
  googleAuthUrl.searchParams.set("response_type", "code");  // We want an authorization code
  googleAuthUrl.searchParams.set("scope", "openid email profile"); // What user data we want
  googleAuthUrl.searchParams.set("access_type", "offline"); // Get a refresh token too
  googleAuthUrl.searchParams.set("prompt", "consent");      // Always show the consent screen

  // Redirect the user to Google
  return NextResponse.redirect(googleAuthUrl.toString());
}
