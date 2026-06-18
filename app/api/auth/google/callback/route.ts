// ─────────────────────────────────────────────────────────────
// GET /api/auth/google/callback — Handle Google's Response
// ─────────────────────────────────────────────────────────────
//
// 📚 OAUTH CALLBACK LEARNING POINT:
// After the user logs in on Google, Google redirects them BACK
// to this URL with a "code" in the query string:
//   /api/auth/google/callback?code=4/abc123...
//
// We then:
//   1. Exchange the "code" for an "access token" (by calling Google's API)
//   2. Use the access token to get the user's info (name, email, picture)
//   3. Find or create the user in our database
//   4. Set our own auth cookie
//   5. Redirect to the workspace
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createToken, setAuthCookie } from "@/lib/auth";

// TypeScript type for the user info Google returns
interface GoogleUserInfo {
  sub: string;     // Google's unique user ID
  name: string;    // Full name
  email: string;   // Email address
  picture: string; // Profile picture URL
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // Step 1: Get the authorization code from the URL
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      // Google didn't send a code — something went wrong
      return NextResponse.redirect(new URL("/sign-in?error=google_failed", appUrl));
    }

    // Step 2: Exchange the code for access tokens
    // We send the code to Google's token endpoint, and Google
    // sends back an access_token we can use to get user info.
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/sign-in?error=google_failed", appUrl));
    }

    // Step 3: Use the access token to get the user's profile info
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/sign-in?error=google_failed", appUrl));
    }

    // Step 4: Find or create the user in our database
    // First, check if we've seen this Google account before
    let user = await db.user.findUnique({
      where: { googleId: googleUser.sub },
    });

    if (!user) {
      // Haven't seen this Google ID before.
      // Check if there's already an account with this email
      // (maybe they registered with email/password first)
      user = await db.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        // Account exists with this email — link the Google ID to it
        user = await db.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.sub,
            image: user.image || googleUser.picture, // Keep existing image if they have one
          },
        });
      } else {
        // Brand new user — create their account
        user = await db.user.create({
          data: {
            name: googleUser.name,
            email: googleUser.email,
            googleId: googleUser.sub,
            image: googleUser.picture,
            // No password — this user logs in via Google only
          },
        });
      }
    }

    // Step 5: Create our own JWT and set the auth cookie
    const token = await createToken(user.id);
    await setAuthCookie(token);

    // Step 6: Redirect to the workspace
    return NextResponse.redirect(new URL("/workspace", appUrl));
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(new URL("/sign-in?error=google_failed", appUrl));
  }
}
