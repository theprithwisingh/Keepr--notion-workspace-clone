// ─────────────────────────────────────────────────────────────
// Share Button — Tiny Client Component
// ─────────────────────────────────────────────────────────────
//
// WHY A SEPARATE COMPONENT?
// The document page is a Server Component. We need a button that
// opens a modal (client-side interactivity). So we extract just
// the button + dialog into this tiny Client Component.
// ─────────────────────────────────────────────────────────────

"use client";

import React, { useState } from "react";
import { FiShare2 } from "react-icons/fi";
import ShareDialog from "./share-dialog";

interface ShareButtonProps {
    documentId: string;
    documentTitle: string;
    shareLink: string | null;
}

export default function ShareButton({ documentId, documentTitle, shareLink }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
                <FiShare2 className="w-4 h-4" />
                Share
            </button>

            <ShareDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                documentId={documentId}
                documentTitle={documentTitle}
                initialShareLink={shareLink}
            />
        </>
    );
}
