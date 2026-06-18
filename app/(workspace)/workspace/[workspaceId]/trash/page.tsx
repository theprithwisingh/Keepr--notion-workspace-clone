// ─────────────────────────────────────────────────────────────
// Trash Page — Server Component
// ─────────────────────────────────────────────────────────────
//
// WHY SERVER COMPONENT?
// We fetch all trashed documents from the database on the server
// and pass them to the TrashClient. This means no loading spinner —
// the page arrives fully rendered.
//
// The TrashClient handles all the interactivity (search, pagination,
// confirmation dialogs) on the client side.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { db } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { notFound } from "next/navigation";
import TrashClient from "@/components/workspace/trash-client";

export default async function TrashPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params;
    const userId = await getAuthFromCookies();
    if (!userId) return notFound();

    // Fetch all trashed documents in this workspace
    const trashedDocuments = await db.document.findMany({
        where: {
            organization: { slug: workspaceId },
            isArchived: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
        select: {
            id: true,
            title: true,
            icon: true,
            updatedAt: true,
        },
    });

    // Serialize dates to strings so they can be passed to the Client Component
    // (React can't serialize Date objects across the server/client boundary)
    const serializedDocs = trashedDocuments.map((doc) => ({
        ...doc,
        updatedAt: doc.updatedAt.toISOString(),
    }));

    return (
        <TrashClient
            workspaceId={workspaceId}
            initialDocuments={serializedDocs}
        />
    );
}