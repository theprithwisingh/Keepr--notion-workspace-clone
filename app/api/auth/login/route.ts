// ─────────────────────────────────────────────────────────────
// POST /api/auth/login — Log In to an Existing Account
// ─────────────────────────────────────────────────────────────
//
// FLOW:
//   1. Client sends POST with { email, password }
//   2. Find the user by email
//   3. Compare the password with the stored hash
//   4. If valid → create JWT → set cookie → return success
//   5. If invalid → return error
//
// 🔒 SECURITY NOTE:
// We deliberately return vague error messages like
// "Invalid email or password" instead of "User not found" or
// "Wrong password". This prevents attackers from figuring out
// which emails are registered in our system.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse the JSON body
    const body = await request.json();
    const { email, password } = body;

    // Step 2: Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Step 3: Find the user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If no user found, return a generic error
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 } // 401 = "Unauthorized"
      );
    }

    // Step 4: Check if this user has a password
    // (Google-only users don't have a password set)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google login. Please sign in with Google." },
        { status: 401 }
      );
    }

    // Step 5: Compare the password with the stored hash
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Step 6: Password is correct! Create a JWT token
    const token = await createToken(user.id);

    // Step 7: Set the token as a cookie
    await setAuthCookie(token);

    // Step 8: Return success
    return NextResponse.json({
      message: "Logged in successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
