// ─────────────────────────────────────────────────────────────
// Trash Server Actions
// ─────────────────────────────────────────────────────────────
//
// WHY A SEPARATE FILE?
// We keep trash-specific actions separate from the main document
// actions to keep each file focused and easy to read.
// ─────────────────────────────────────────────────────────────

"use server";

import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Permanently delete ALL trashed documents in a workspace.
 *
 * HOW IT WORKS:
 *   1. Verify the user is logged in and is a member of this workspace
 *   2. Delete all documents where isArchived = true in this org
 *   3. Revalidate the trash page so the UI updates
 *
 * @param workspaceSlug - The workspace URL slug (e.g. "prithwi")
 */
export async function emptyTrash(workspaceSlug: string) {
    try {
        const userId = await getAuthFromCookies();
        if (!userId) return { success: false, error: "Unauthorized" };

        // Find the organization by its slug
        const member = await db.member.findFirst({
            where: {
                userId,
                organization: { slug: workspaceSlug },
            },
        });

        if (!member) return { success: false, error: "Forbidden" };

        // Delete all trashed documents in this workspace
        const result = await db.document.deleteMany({
            where: {
                organizationId: member.organizationId,
                isArchived: true,
            },
        });

        // Tell Next.js to re-fetch the trash page
        revalidatePath(`/workspace/${workspaceSlug}/trash`);
        revalidatePath(`/workspace/${workspaceSlug}`);

        return { success: true, deletedCount: result.count };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
