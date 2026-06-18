// ─────────────────────────────────────────────────────────────
// Trash Client — Interactive Trash UI
// ─────────────────────────────────────────────────────────────
//
// WHY CLIENT COMPONENT?
// We need interactivity: search filtering, pagination state,
// confirmation dialogs, and button click handlers. None of these
// work in Server Components.
// ─────────────────────────────────────────────────────────────

"use client";

import React, { useState, useTransition } from "react";
import { FiFileText, FiRefreshCcw, FiTrash2, FiSearch, FiAlertTriangle } from "react-icons/fi";
import { restoreDocument, permanentDeleteDocument } from "@/app/actions/documents";
import { emptyTrash } from "@/app/actions/trash";

// ─── Types ───

type TrashedDoc = {
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string; // ISO string (serialized from server)
};

interface TrashClientProps {
    workspaceId: string;
    initialDocuments: TrashedDoc[];
}

// ─── How many documents to show per page ───
const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────
// Confirmation Dialog
// ─────────────────────────────────────────────────────────────
// A simple modal that asks "Are you sure?" before destructive actions.
// We build it inline here instead of a separate file to keep things simple.
function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    isDestructive = false,
}: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
                {/* Icon + Title */}
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <FiAlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{message}</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                            isDestructive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main Trash Component
// ─────────────────────────────────────────────────────────────
export default function TrashClient({ workspaceId, initialDocuments }: TrashClientProps) {
    const [isPending, startTransition] = useTransition();

    // ─── State ───
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        onConfirm: () => void;
        isDestructive: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        confirmLabel: "",
        onConfirm: () => {},
        isDestructive: false,
    });

    // ─── Filter documents by search query ───
    const filteredDocs = initialDocuments.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─── Pagination logic ───
    const totalPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + PAGE_SIZE);

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // ─── Actions ───

    const handleRestore = (docId: string, docTitle: string) => {
        startTransition(async () => {
            await restoreDocument(docId);
        });
    };

    const handlePermanentDelete = (docId: string, docTitle: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete permanently?",
            message: `"${docTitle}" will be permanently deleted. This action cannot be undone.`,
            confirmLabel: "Delete",
            isDestructive: true,
            onConfirm: () => {
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                startTransition(async () => {
                    await permanentDeleteDocument(docId);
                });
            },
        });
    };

    const handleEmptyTrash = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Empty trash?",
            message: `All ${initialDocuments.length} document(s) in trash will be permanently deleted. This action cannot be undone.`,
            confirmLabel: "Empty Trash",
            isDestructive: true,
            onConfirm: () => {
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                startTransition(async () => {
                    await emptyTrash(workspaceId);
                });
            },
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
                {initialDocuments.length > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Empty Trash
                    </button>
                )}
            </div>

            {/* Search Bar */}
            {initialDocuments.length > 0 && (
                <div className="relative mb-6">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search trash..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            )}

            {/* Empty State */}
            {initialDocuments.length === 0 && (
                <div className="text-center py-16">
                    <FiTrash2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-lg font-medium text-gray-500 mb-1">Trash is empty</h2>
                    <p className="text-sm text-gray-400">Deleted pages will appear here.</p>
                </div>
            )}

            {/* No search results */}
            {initialDocuments.length > 0 && filteredDocs.length === 0 && (
                <div className="text-center py-12">
                    <FiSearch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No trashed pages match &quot;{searchQuery}&quot;</p>
                </div>
            )}

            {/* Document List */}
            {paginatedDocs.length > 0 && (
                <div className="space-y-2">
                    {paginatedDocs.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                            {/* Left: Icon + Title + Date */}
                            <div className="flex items-center gap-3 text-gray-700 min-w-0">
                                {doc.icon ? (
                                    <span className="text-lg flex-shrink-0">{doc.icon}</span>
                                ) : (
                                    <FiFileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                                <span className="font-medium truncate">{doc.title || "Untitled"}</span>
                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                    {new Date(doc.updatedAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                                <button
                                    onClick={() => handleRestore(doc.id, doc.title)}
                                    disabled={isPending}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Restore"
                                >
                                    <FiRefreshCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePermanentDelete(doc.id, doc.title)}
                                    disabled={isPending}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete Permanently"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages} · {filteredDocs.length} item(s)
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmLabel={confirmDialog.confirmLabel}
                isDestructive={confirmDialog.isDestructive}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
