// ─────────────────────────────────────────────────────────────
// Create Organization Form — Client Component
// ─────────────────────────────────────────────────────────────
//
// 📚 WHY IS THIS A SEPARATE CLIENT COMPONENT?
// The parent workspace page is a Server Component (for fast data loading).
// But forms need interactivity (tracking input, handling submit).
// So we extract JUST the interactive form into a small Client Component.
//
// This is the "Islands of Interactivity" pattern:
//   - Most of the page is server-rendered (fast, no JS sent to browser)
//   - Only the form sends JavaScript to the browser (for interaction)
// ─────────────────────────────────────────────────────────────

"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function CreateOrgForm() {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Please enter an organization name.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create organization.");
                return;
            }

            // Clear the form and refresh the page to show the new org
            setName("");
            router.refresh(); // This re-runs the Server Component's data fetch!
        } catch {
            setError("Unable to connect. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., My Startup"
                    className="auth-input"
                    disabled={isLoading}
                />
                {error && (
                    <p className="text-xs text-red-500 mt-1.5">{error}</p>
                )}
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex-shrink-0"
            >
                {isLoading ? "Creating..." : "Create"}
            </button>
        </form>
    );
}
