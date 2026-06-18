// ─────────────────────────────────────────────────────────────
// POST /api/auth/register — Create a New Account
// ─────────────────────────────────────────────────────────────
//
// 📚 API ROUTE LEARNING POINT:
// In Next.js App Router, you create API endpoints by making a
// `route.ts` file inside the `app/api/` directory.
//
// Each HTTP method (GET, POST, PUT, DELETE) is a separate
// exported function. This file exports `POST` because
// registration creates new data (a new user).
//
// FLOW:
//   1. Client sends POST with { name, email, password }
//   2. We validate the data
//   3. Check if email is already taken
//   4. Hash the password (NEVER store plain text!)
//   5. Create the user in the database
//   6. Create a JWT token
//   7. Set the token as a cookie
//   8. Return success
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse the JSON body from the request
    // The client sends: { name: "Jane", email: "jane@...", password: "..." }
    const body = await request.json();
    const { name, email, password } = body;

    // Step 2: Validate — make sure all required fields are present
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 } // 400 = "Bad Request" (client sent incomplete data)
      );
    }

    // Step 3: Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Step 4: Check if a user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 } // 409 = "Conflict" (resource already exists)
      );
    }

    // Step 5: Hash the password before storing it
    // NEVER store passwords as plain text in the database!
    const hashedPassword = await hashPassword(password);

    // Step 6: Create the user in the database
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    // Step 7: Create a JWT token for the new user
    const token = await createToken(user.id);

    // Step 8: Set the token as an HttpOnly cookie
    // From now on, the browser will send this cookie with every request
    await setAuthCookie(token);

    // Step 9: Return success (don't send the password back!)
    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 } // 201 = "Created" (a new resource was created)
    );
  } catch (error) {
    // Something unexpected went wrong (database error, etc.)
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 } // 500 = "Internal Server Error"
    );
  }
}
