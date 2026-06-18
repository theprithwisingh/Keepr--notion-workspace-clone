// ─────────────────────────────────────────────────────────────
// GET /api/auth/me — Get the Currently Logged-In User
// ─────────────────────────────────────────────────────────────
//
// This endpoint returns the current user's profile data.
// It's used by client-side components that need to know
// who is logged in (e.g., showing the user's name in a nav bar).
//
// FLOW:
//   1. Read the JWT from cookies
//   2. Find the user in the database
//   3. Return their profile (without the password!)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET() {
  try {
    // Step 1: Get the userId from the auth cookie
    const userId = await getAuthFromCookies();

    if (!userId) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      );
    }

    // Step 2: Find the user in the database
    // We use `select` to choose ONLY the fields we want to return.
    // This is important — we NEVER want to send the password hash
    // back to the client, even accidentally.
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        // password: false (not selected — never sent to client!)
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Step 3: Return the user profile
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
