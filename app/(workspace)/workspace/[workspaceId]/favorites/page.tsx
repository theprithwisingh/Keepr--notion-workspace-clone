// ─────────────────────────────────────────────────────────────
// Favorites Page — Server Component
// ─────────────────────────────────────────────────────────────
//
// WHY SERVER COMPONENT?
// We fetch favorite docs and recent views from the database
// and pass them to FavoritesClient. Zero loading spinners.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { notFound } from "next/navigation";
import FavoritesClient from "@/components/workspace/favorites-client";

export default async function FavoritesPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params;
    const userId = await getAuthFromCookies();
    if (!userId) return notFound();

    // Fetch all favorites for this user in this workspace
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
                select: {
                    id: true,
                    title: true,
                    icon: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Fetch recently opened documents (top 10)
    const recentViews = await db.viewHistory.findMany({
        where: {
            userId,
            document: {
                organization: { slug: workspaceId },
                isArchived: false,
            },
        },
        include: {
            document: {
                select: {
                    id: true,
                    title: true,
                    icon: true,
                },
            },
        },
        orderBy: {
            viewedAt: "desc",
        },
        take: 10,
    });

    // Serialize for the client component
    const serializedFavorites = favorites.map((fav) => ({
        id: fav.document.id,
        title: fav.document.title,
        icon: fav.document.icon,
        favoritedAt: fav.createdAt.toISOString(),
    }));

    const serializedRecents = recentViews.map((view) => ({
        id: view.document.id,
        title: view.document.title,
        icon: view.document.icon,
        viewedAt: view.viewedAt.toISOString(),
    }));

    return (
        <FavoritesClient
            workspaceId={workspaceId}
            favorites={serializedFavorites}
            recents={serializedRecents}
        />
    );
}