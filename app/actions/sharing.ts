// ─────────────────────────────────────────────────────────────
// Sharing Server Actions
// ─────────────────────────────────────────────────────────────
//
// These actions handle all the sharing logic:
//   - Generate / revoke public links
//   - Invite users by email
//   - Change user roles
//   - Remove user access
//
// WHY SERVER ACTIONS?
// All of these require database writes and must be authorized.
// Server Actions run securely on the server.
// ─────────────────────────────────────────────────────────────

"use server";

import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ─── Helper: Verify the user owns or can manage this document ───
async function verifyDocumentOwner(documentId: string) {
    const userId = await getAuthFromCookies();
    if (!userId) throw new Error("Unauthorized");

    const document = await db.document.findUnique({
        where: { id: documentId },
        select: {
            id: true,
            userId: true,
            organizationId: true,
            organization: { select: { slug: true } },
        },
    });

    if (!document) throw new Error("Document not found");

    // Check if the user is the document creator OR has owner/editor share
    if (document.userId !== userId) {
        // Check if they have editor/owner role via DocumentShare
        const share = await db.documentShare.findUnique({
            where: {
                documentId_userId: { documentId, userId },
            },
        });

        if (!share || share.role === "viewer") {
            throw new Error("You don't have permission to manage sharing for this document");
        }
    }

    return { userId, document };
}

// ─────────────────────────────────────────────────────────────
// 1. Generate a Public Share Link
// ─────────────────────────────────────────────────────────────
export async function generatePublicLink(documentId: string) {
    try {
        const { document } = await verifyDocumentOwner(documentId);

        // Generate a unique, random token for the share link
        const token = crypto.randomBytes(16).toString("hex");

        await db.document.update({
            where: { id: documentId },
            data: { shareLink: token },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);

        return { success: true, shareLink: token };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─────────────────────────────────────────────────────────────
// 2. Revoke a Public Share Link
// ─────────────────────────────────────────────────────────────
export async function revokePublicLink(documentId: string) {
    try {
        const { document } = await verifyDocumentOwner(documentId);

        // Set shareLink to null — this disables the public link
        await db.document.update({
            where: { id: documentId },
            data: { shareLink: null },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─────────────────────────────────────────────────────────────
// 3. Invite a User by Email
// ─────────────────────────────────────────────────────────────
export async function inviteUser(
    documentId: string,
    email: string,
    role: string = "viewer"
) {
    try {
        const { document } = await verifyDocumentOwner(documentId);

        // Look up the user by their email
        const invitedUser = await db.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!invitedUser) {
            return {
                success: false,
                error: "No user found with that email. They need to create an account first.",
            };
        }

        // Don't let the owner invite themselves
        if (invitedUser.id === document.userId) {
            return { success: false, error: "You already own this document." };
        }

        // Create or update the share (upsert)
        await db.documentShare.upsert({
            where: {
                documentId_userId: {
                    documentId,
                    userId: invitedUser.id,
                },
            },
            update: { role },
            create: {
                documentId,
                userId: invitedUser.id,
                role,
            },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─────────────────────────────────────────────────────────────
// 4. Remove a User's Access
// ─────────────────────────────────────────────────────────────
export async function removeShare(documentId: string, userId: string) {
    try {
        const { document } = await verifyDocumentOwner(documentId);

        await db.documentShare.delete({
            where: {
                documentId_userId: {
                    documentId,
                    userId,
                },
            },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─────────────────────────────────────────────────────────────
// 5. Update a User's Role
// ─────────────────────────────────────────────────────────────
export async function updateShareRole(
    documentId: string,
    userId: string,
    role: string
) {
    try {
        const { document } = await verifyDocumentOwner(documentId);

        await db.documentShare.update({
            where: {
                documentId_userId: {
                    documentId,
                    userId,
                },
            },
            data: { role },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─────────────────────────────────────────────────────────────
// 6. Get All Shares for a Document
// ─────────────────────────────────────────────────────────────
export async function getDocumentShares(documentId: string) {
    try {
        await verifyDocumentOwner(documentId);

        const shares = await db.documentShare.findMany({
            where: { documentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        return {
            success: true,
            shares: shares.map((s) => ({
                userId: s.user.id,
                name: s.user.name,
                email: s.user.email,
                image: s.user.image,
                role: s.role,
            })),
        };
    } catch (error: any) {
        return { success: false, shares: [], error: error.message };
    }
}
