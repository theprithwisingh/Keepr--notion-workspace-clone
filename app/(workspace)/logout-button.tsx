// ─────────────────────────────────────────────────────────────
// Logout Button — Client Component
// ─────────────────────────────────────────────────────────────
//
// 📚 TINY CLIENT COMPONENT PATTERN:
// This is intentionally a very small Client Component.
// The parent layout is a Server Component, but we need a button
// that responds to clicks. So we extract ONLY the button.
//
// This keeps the amount of JavaScript sent to the browser minimal.
// ─────────────────────────────────────────────────────────────

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        setIsLoading(true);

        try {
            // Call our logout API to clear the auth cookie
            await fetch("/api/auth/logout", { method: "POST" });

            // Redirect to the login page
            router.push("/sign-in");
            router.refresh();
        } catch {
            // Even if the request fails, try to redirect
            router.push("/sign-in");
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
            {isLoading ? "Logging out..." : "Log out"}
        </button>
    );
}
