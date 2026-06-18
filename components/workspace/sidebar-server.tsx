import React from "react";
import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import SidebarClient from "./sidebar-client";

export default async function SidebarServer({ workspaceId }: { workspaceId: string }) {
    const userId = await getAuthFromCookies();
    if (!userId) return null;

    // Fetch user profile data for the sidebar header
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, image: true },
    });

    // Fetch the active documents for this workspace
    const documents = await db.document.findMany({
        where: {
            organization: { slug: workspaceId },
            isArchived: false,
        },
        orderBy: {
            createdAt: "asc",
        },
        select: {
            id: true,
            title: true,
            icon: true,
            parentDocumentId: true,
            isPublished: true,
        },
    });

    // Fetch favorites for this user in this workspace
    const favorites = await db.favorite.findMany({
        where: {
            userId,
            document: {
                organization: { slug: workspaceId },
                isArchived: false,
            },
        },
        include: {
            document: {
                select: { id: true, title: true, icon: true }
            }
        }
    });

    // Fetch recently viewed for this user in this workspace
    const recents = await db.viewHistory.findMany({
        where: {
            userId,
            document: {
                organization: { slug: workspaceId },
                isArchived: false,
            },
        },
        orderBy: {
            viewedAt: "desc",
        },
        take: 5,
        select: {
            documentId: true,
        },
    });

    const favoriteIds = new Set(favorites.map(f => f.documentId));
    const recentIds = recents.map(r => r.documentId);

    return (
        <SidebarClient 
            workspaceId={workspaceId} 
            initialDocuments={documents}
            initialFavorites={Array.from(favoriteIds)}
            initialRecents={recentIds}
            user={user ? { name: user.name, email: user.email, image: user.image } : null}
        />
    );
}
