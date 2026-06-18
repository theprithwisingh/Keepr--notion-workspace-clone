import React from "react";
import NotionEditor from "@/components/editor";
import Breadcrumbs from "@/components/workspace/breadcrumbs";
import ShareButton from "@/components/workspace/share-button";
import { logDocumentView } from "@/app/actions/documents";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function DocumentPage({ 
    params 
}: { 
    params: Promise<{ workspaceId: string, slug: string[] }> 
}) {
    const { workspaceId, slug } = await params;
    // The slug is an array of path segments. We only care about the last one (the actual document ID)
    const documentId = slug[slug.length - 1];

    // Log the view for Recent Pages (this runs safely on the server side)
    await logDocumentView(documentId);

    // Fetch initial document data on the server (including shareLink for the Share button)
    const document = await db.document.findUnique({
        where: { id: documentId },
        select: { id: true, title: true, content: true, icon: true, coverImage: true, shareLink: true }
    });

    if (!document) {
        return notFound();
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Top bar: Breadcrumbs on left, Share button on right */}
            <div className="flex items-center justify-between pr-4">
                <Breadcrumbs documentId={documentId} workspaceId={workspaceId} />
                <ShareButton
                    documentId={documentId}
                    documentTitle={document.title}
                    shareLink={document.shareLink}
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                {/* The Editor is a Client Component since it requires TipTap and rich interactivity */}
                <NotionEditor documentId={documentId} initialDocument={document} />
            </div>
        </div>
    );
}
