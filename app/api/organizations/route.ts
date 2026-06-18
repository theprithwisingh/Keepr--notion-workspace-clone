// ─────────────────────────────────────────────────────────────
// /api/organizations — Manage Organizations
// ─────────────────────────────────────────────────────────────
//
// GET  → List all organizations the current user belongs to
// POST → Create a new organization (user becomes the "owner")
//
// 📚 ORGANIZATION LEARNING POINT:
// Organizations allow users to group their work into separate
// workspaces. A user can belong to multiple organizations,
// and each organization can have multiple members.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

// ─── GET: List the user's organizations ───

export async function GET() {
  try {
    // Step 1: Verify the user is logged in
    const userId = await getAuthFromCookies();

    if (!userId) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      );
    }

    // Step 2: Find all organizations where this user is a member
    // We use `include` to also fetch the member count for each org.
    const memberships = await db.member.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: { members: true }, // Count how many members each org has
            },
          },
        },
      },
    });

    // Step 3: Transform the data into a clean shape for the client
    const organizations = memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
      memberCount: membership.organization._count.members,
      createdAt: membership.organization.createdAt,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("List organizations error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new organization ───

export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify the user is logged in
    const userId = await getAuthFromCookies();

    if (!userId) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      );
    }

    // Step 2: Parse the request body
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Organization name is required." },
        { status: 400 }
      );
    }

    // Step 3: Generate a URL-friendly "slug" from the name
    // "My Cool Team" → "my-cool-team"
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
      .replace(/^-|-$/g, "");       // Remove leading/trailing hyphens

    // Step 4: Check if the slug is already taken
    const existingOrg = await db.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "An organization with a similar name already exists. Try a different name." },
        { status: 409 }
      );
    }

    // Step 5: Create the organization AND add the user as the owner
    // We use a Prisma "nested create" to do both in one operation.
    const organization = await db.organization.create({
      data: {
        name: name.trim(),
        slug,
        members: {
          create: {
            userId,
            role: "owner", // The creator is always the owner
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Organization created!",
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
