// ─────────────────────────────────────────────────────────────
// Public Shared Document Page
// ─────────────────────────────────────────────────────────────
//
// WHY SERVER COMPONENT?
// This page renders a document that was shared via a public link.
// We look up the document by its share token in the database,
// and display it as read-only. No auth required.
//
// SECURITY NOTE:
// The share token is a random 32-character hex string. It's
// practically impossible to guess. If the document owner revokes
// the link, the token becomes null and this page returns 404.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SharedDocumentPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    // Look up the document by its public share token
    const document = await db.document.findUnique({
        where: { shareLink: token },
        select: {
            id: true,
            title: true,
            content: true,
            icon: true,
            coverImage: true,
            isArchived: true,
            user: {
                select: { name: true },
            },
        },
    });

    // If no document matches this token, or the doc was trashed → 404
    if (!document || document.isArchived) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Top Banner — tells the reader this is a shared view */}
            <div className="bg-blue-50 border-b border-blue-100">
                <div className="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between">
                    <p className="text-sm text-blue-700">
                        📄 Shared by <span className="font-medium">{document.user.name}</span>
                    </p>
                    <Link
                        href="/sign-in"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Sign in to BrainSpace
                    </Link>
                </div>
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto py-12 px-8">
                {/* Title */}
                <h1 className="text-5xl font-bold text-gray-900 mb-8">
                    {document.icon && <span className="mr-3">{document.icon}</span>}
                    {document.title || "Untitled"}
                </h1>

                {/* Body — render the stored HTML content */}
                {document.content ? (
                    <div
                        className="prose prose-lg prose-gray max-w-none"
                        dangerouslySetInnerHTML={{ __html: document.content }}
                    />
                ) : (
                    <p className="text-gray-400 italic">This page is empty.</p>
                )}
            </div>
        </div>
    );
}
