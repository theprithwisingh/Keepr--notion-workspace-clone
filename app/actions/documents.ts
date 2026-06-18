"use server";

import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Custom error to throw if user is unauthorized
class ActionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ActionError";
    }
}

// Ensure the user has access to this workspace via its slug
async function verifyWorkspaceAccess(workspaceSlug: string) {
    const userId = await getAuthFromCookies();
    if (!userId) throw new ActionError("Unauthorized");

    const member = await db.member.findFirst({
        where: {
            userId,
            organization: { slug: workspaceSlug },
        },
    });

    if (!member) throw new ActionError("Forbidden access to workspace");
    return { userId, organizationId: member.organizationId };
}

// Ensure the user has access to the specific document
async function verifyDocumentAccess(documentId: string) {
    const userId = await getAuthFromCookies();
    if (!userId) throw new ActionError("Unauthorized");

    const document = await db.document.findUnique({
        where: { id: documentId },
        select: { organizationId: true, organization: { select: { slug: true } } },
    });

    if (!document) throw new ActionError("Document not found");

    const member = await db.member.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId: document.organizationId,
            },
        },
    });

    if (!member) throw new ActionError("Forbidden access to document");
    return { userId, document };
}

export async function createDocument(workspaceSlug: string, parentDocumentId?: string) {
    try {
        const { userId, organizationId } = await verifyWorkspaceAccess(workspaceSlug);

        const document = await db.document.create({
            data: {
                title: "Untitled",
                organizationId,
                userId,
                parentDocumentId: parentDocumentId || null,
            },
        });

        // Tell Next.js to re-fetch the server components for this path
        revalidatePath(`/workspace/${workspaceSlug}`);
        
        return { success: true, document };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateDocument(
    documentId: string,
    data: { title?: string; content?: string; icon?: string; coverImage?: string; }
) {
    try {
        const { document } = await verifyDocumentAccess(documentId);

        const updated = await db.document.update({
            where: { id: documentId },
            data,
        });

        revalidatePath(`/workspace/${document.organization.slug}`);
        return { success: true, document: updated };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function softDeleteDocument(documentId: string) {
    try {
        const { document } = await verifyDocumentAccess(documentId);

        await db.document.update({
            where: { id: documentId },
            data: { isArchived: true },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function restoreDocument(documentId: string) {
    try {
        const { document } = await verifyDocumentAccess(documentId);

        await db.document.update({
            where: { id: documentId },
            data: { isArchived: false },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function permanentDeleteDocument(documentId: string) {
    try {
        const { document } = await verifyDocumentAccess(documentId);

        await db.document.delete({
            where: { id: documentId },
        });

        revalidatePath(`/workspace/${document.organization.slug}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleFavorite(documentId: string) {
    try {
        const { userId, document } = await verifyDocumentAccess(documentId);

        const existing = await db.favorite.findUnique({
            where: {
                userId_documentId: {
                    userId,
                    documentId,
                },
            },
        });

        if (existing) {
            await db.favorite.delete({
                where: { id: existing.id },
            });
        } else {
            await db.favorite.create({
                data: {
                    userId,
                    documentId,
                },
            });
        }

        revalidatePath(`/workspace/${document.organization.slug}`);
        return { success: true, isFavorited: !existing };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function logDocumentView(documentId: string) {
    try {
        const { userId } = await verifyDocumentAccess(documentId);

        // Upsert to only keep the latest view
        await db.viewHistory.upsert({
            where: {
                userId_documentId: {
                    userId,
                    documentId,
                },
            },
            update: {
                viewedAt: new Date(),
            },
            create: {
                userId,
                documentId,
            },
        });

        // Optional: We don't always need to revalidate the whole path just for a view log
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
