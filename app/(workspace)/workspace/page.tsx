// ─────────────────────────────────────────────────────────────
// Workspace Page — SERVER COMPONENT
// ─────────────────────────────────────────────────────────────
//
// 📚 SERVER COMPONENT LEARNING POINT:
// This is another Server Component that fetches data on the server.
// Notice there's no "use client", no useState, no useEffect.
//
// The page loads with all data already in the HTML.
// This is FASTER than client-side fetching because:
//   1. No loading spinner — the data is already there
//   2. No extra network request from the browser
//   3. The database query runs on the server (closer to the DB)
// ─────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { CreateOrgForm } from "./create-org-form";

export default async function WorkspacePage() {
    // Step 1: Get the current user from the auth cookie
    const userId = await getAuthFromCookies();

    if (!userId) {
        redirect("/sign-in");
    }

    // Step 2: Fetch the user and their organizations from the database
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            memberships: {
                include: {
                    organization: {
                        include: {
                            _count: {
                                select: { members: true },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        redirect("/sign-in");
    }

    // Extract the first name for a friendly greeting
    const firstName = user.name.split(" ")[0];
    const organizations = user.memberships;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            {/* ─── Welcome Header ─── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Welcome back, {firstName}! 👋
                </h1>
                <p className="text-sm text-gray-500">
                    Here are your workspaces. Choose one to continue, or create a new one.
                </p>
            </div>

            {/* ─── Organizations Grid ─── */}
            {organizations.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 mb-8">
                    {organizations.map((membership) => (
                        <Link
                            key={membership.organization.id}
                            href={`/workspace/${membership.organization.slug}`}
                            className="group block bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200"
                        >
                            <div className="flex items-start gap-3">
                                {/* Org Avatar */}
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {membership.organization.name[0].toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                        {membership.organization.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {membership.organization._count.members} member{membership.organization._count.members !== 1 ? "s" : ""}
                                        {" · "}
                                        <span className="capitalize">{membership.role}</span>
                                    </p>
                                </div>

                                {/* Arrow icon */}
                                <svg
                                    className="w-4 h-4 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-8">
                    <div className="text-4xl mb-3">🏢</div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        No organizations yet
                    </h3>
                    <p className="text-xs text-gray-500">
                        Create your first organization to get started.
                    </p>
                </div>
            )}

            {/* ─── Create Organization Section ─── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                    Create a new organization
                </h2>
                {/* 
                    This is a CLIENT COMPONENT embedded inside our SERVER COMPONENT.
                    
                    📚 COMPONENT COMPOSITION LEARNING POINT:
                    Server Components CAN render Client Components as children.
                    The server renders everything it can, and the client component
                    handles the interactive parts (form submission).
                    
                    This is the recommended pattern in Next.js:
                    - Keep as much as possible in Server Components
                    - Only use Client Components for interactive UI
                */}
                <CreateOrgForm />
            </div>
        </div>
    );
}
