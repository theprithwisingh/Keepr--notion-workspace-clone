import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { FiChevronRight } from "react-icons/fi";

export default async function Breadcrumbs({ documentId, workspaceId }: { documentId: string, workspaceId: string }) {
    // We need to fetch the hierarchy. 
    // Prisma doesn't natively support recursive CTEs out of the box for infinite depth in a single easy query.
    // However, since we just need the path for breadcrumbs, we can either:
    // 1. Fetch all documents and build the tree in memory (fine for small/medium workspaces).
    // 2. Do multiple sequential queries up the chain (fine if depth is usually < 5).

    // Let's go with sequential queries up the chain up to 5 levels deep
    const breadcrumbs = [];
    let currentId = documentId;

    for (let i = 0; i < 5; i++) {
        if (!currentId) break;

        const doc = await db.document.findUnique({
            where: { id: currentId },
            select: { id: true, title: true, icon: true, parentDocumentId: true }
        });

        if (!doc) break;

        breadcrumbs.unshift({
            id: doc.id,
            title: doc.title || "Untitled",
            icon: doc.icon
        });

        if (!doc.parentDocumentId) break;
        currentId = doc.parentDocumentId;
    }

    return (
        <div className="flex items-center text-sm text-gray-500 overflow-hidden whitespace-nowrap px-4 py-2 border-b border-gray-100 bg-[#fbfbfa]">
            <Link 
                href={`/workspace/${workspaceId}`}
                className="hover:bg-gray-100 px-2 py-1 rounded transition-colors"
            >
                Workspace
            </Link>
            
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                    <FiChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                    <Link 
                        href={`/workspace/${workspaceId}/${crumb.id}`}
                        className="hover:bg-gray-100 px-2 py-1 rounded transition-colors max-w-[150px] truncate flex items-center gap-2"
                    >
                        {crumb.icon && <span>{crumb.icon}</span>}
                        <span className="truncate">{crumb.title}</span>
                    </Link>
                </React.Fragment>
            ))}
        </div>
    );
}
