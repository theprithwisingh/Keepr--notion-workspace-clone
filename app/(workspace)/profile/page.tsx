// ─────────────────────────────────────────────────────────────
// Profile Page — SERVER COMPONENT
// ─────────────────────────────────────────────────────────────
//
// 📚 SERVER COMPONENT LEARNING POINT:
// This file does NOT have "use client" at the top.
// That makes it a Server Component by default in Next.js App Router.
//
// Server Components:
//   ✅ Run on the server only (code never reaches the browser)
//   ✅ Can directly access the database, read cookies, call APIs
//   ✅ Can use `async/await` at the top level (no useEffect needed!)
//   ✅ Don't add JavaScript to the client bundle (faster pages)
//   ❌ Cannot use hooks (useState, useEffect)
//   ❌ Cannot use event handlers (onClick, onSubmit)
//   ❌ Cannot use browser APIs (window, localStorage)
//
// This page fetches the user's profile data directly from the
// database ON THE SERVER. The HTML arrives fully rendered —
// no loading spinners, no fetch calls from the browser.
//
// Compare this to the Login page (Client Component) which
// MUST run in the browser because it handles form interactions.
// ─────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export default async function ProfilePage() {
    // Step 1: Get the current user's ID from the auth cookie
    // This runs on the server — the cookie is read from the request headers
    const userId = await getAuthFromCookies();

    // If not logged in, redirect to login
    // (This is a backup — middleware should catch this first)
    if (!userId) {
        redirect("/sign-in");
    }

    // Step 2: Fetch the user's data directly from the database
    // No need for useEffect or fetch() — we're on the server!
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            // Count how many organizations they belong to
            memberships: {
                select: {
                    organization: {
                        select: {
                            name: true,
                            slug: true,
                        },
                    },
                    role: true,
                },
            },
        },
    });

    if (!user) {
        redirect("/sign-in");
    }

    // Step 3: Format the date for display
    const joinedDate = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(user.createdAt);

    // Step 4: Render the profile page
    // Everything here is server-rendered — the HTML is sent to the
    // browser fully formed. No JavaScript needed!
    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

            {/* ─── Profile Card ─── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                        {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.image}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            // Show initials if no profile picture
                            user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                            {user.name}
                        </h2>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Joined {joinedDate}</p>
                    </div>
                </div>
            </div>

            {/* ─── Organizations Card ─── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Organizations
                </h3>

                {user.memberships.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        You haven&apos;t joined any organizations yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {user.memberships.map((membership) => (
                            <div
                                key={membership.organization.slug}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {membership.organization.name[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {membership.organization.name}
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                                    {membership.role}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
