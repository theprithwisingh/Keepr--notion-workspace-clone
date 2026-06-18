// ─────────────────────────────────────────────────────────────
// Search Server Action
// ─────────────────────────────────────────────────────────────
//
// WHY A SERVER ACTION?
// Search queries need to hit the database (Prisma). Server Actions
// run securely on the server, so the user never sees our database
// queries. This also means we don't need to create a separate
// API route — Next.js handles everything for us.
//
// WHY NOT A SERVER COMPONENT?
// Because the search results change every time the user types,
// we need to call this function repeatedly from the client.
// Server Components only render once on page load.
// ─────────────────────────────────────────────────────────────

"use server";

import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

// The shape of each search result we send back to the client
export type SearchResult = {
    id: string;
    title: string;
    icon: string | null;
    // A short snippet of the content where the match was found
    contentSnippet: string | null;
    // The workspace slug so we can build a link to the document
    workspaceSlug: string;
};

/**
 * Search all pages the current user has access to.
 *
 * HOW IT WORKS:
 *   1. Verify the user is logged in
 *   2. Find all workspaces the user belongs to
 *   3. Search documents by title OR content using Prisma's `contains`
 *   4. Return the top 10 results with a short content snippet
 *
 * @param query - The search text the user typed
 * @returns An array of matching documents
 */
export async function searchDocuments(query: string): Promise<{
    success: boolean;
    results: SearchResult[];
    error?: string;
}> {
    try {
        // Step 1: Make sure the user is logged in
        const userId = await getAuthFromCookies();
        if (!userId) {
            return { success: false, results: [], error: "Unauthorized" };
        }

        // Step 2: If the query is empty or too short, return nothing
        // This prevents searching for every document on every keystroke
        if (!query || query.trim().length < 2) {
            return { success: true, results: [] };
        }

        const trimmedQuery = query.trim();

        // Step 3: Find all workspace IDs the user is a member of
        // We need this to make sure users can only search their OWN documents
        const memberships = await db.member.findMany({
            where: { userId },
            select: {
                organizationId: true,
                organization: { select: { slug: true } },
            },
        });

        // Build a list of organization IDs the user has access to
        const orgIds = memberships.map((m) => m.organizationId);

        // Build a lookup map: organizationId -> slug (for building URLs later)
        const orgSlugMap = new Map(
            memberships.map((m) => [m.organizationId, m.organization.slug])
        );

        // If the user has no workspaces, there's nothing to search
        if (orgIds.length === 0) {
            return { success: true, results: [] };
        }

        // Step 4: Search documents using Prisma
        // We search both the title AND the content fields
        // `contains` does a case-insensitive substring match
        const documents = await db.document.findMany({
            where: {
                organizationId: { in: orgIds },
                isArchived: false, // Don't show trashed documents
                OR: [
                    { title: { contains: trimmedQuery, mode: "insensitive" } },
                    { content: { contains: trimmedQuery, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                title: true,
                icon: true,
                content: true,
                organizationId: true,
            },
            take: 10, // Limit to 10 results for performance
            orderBy: { updatedAt: "desc" }, // Show recently edited docs first
        });

        // Step 5: Transform each document into a SearchResult
        // We create a short "snippet" showing WHERE the match was found in the content
        const results: SearchResult[] = documents.map((doc) => {
            let contentSnippet: string | null = null;

            if (doc.content) {
                // Strip HTML tags so we only search plain text
                const plainText = doc.content.replace(/<[^>]*>/g, "");

                // Find where the query appears in the content
                const matchIndex = plainText
                    .toLowerCase()
                    .indexOf(trimmedQuery.toLowerCase());

                if (matchIndex !== -1) {
                    // Extract ~80 characters around the match for context
                    const snippetStart = Math.max(0, matchIndex - 30);
                    const snippetEnd = Math.min(
                        plainText.length,
                        matchIndex + trimmedQuery.length + 50
                    );
                    contentSnippet =
                        (snippetStart > 0 ? "..." : "") +
                        plainText.slice(snippetStart, snippetEnd) +
                        (snippetEnd < plainText.length ? "..." : "");
                }
            }

            return {
                id: doc.id,
                title: doc.title || "Untitled",
                icon: doc.icon,
                contentSnippet,
                workspaceSlug: orgSlugMap.get(doc.organizationId) || "",
            };
        });

        return { success: true, results };
    } catch (error: any) {
        console.error("Search failed:", error);
        return { success: false, results: [], error: error.message };
    }
}
