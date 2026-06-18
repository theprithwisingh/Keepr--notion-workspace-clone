// ─────────────────────────────────────────────────────────────
// Workspace Layout — Wraps all protected pages
// ─────────────────────────────────────────────────────────────
//
// After login, there is NO top navbar. The sidebar handles
// everything: profile, search, navigation, and logout.
// This gives us a clean, full-height Notion-style layout.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { SearchProvider } from "@/components/search/search-provider";

export default async function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SearchProvider>
            <div className="h-screen bg-white">
                {children}
            </div>
        </SearchProvider>
    );
}
