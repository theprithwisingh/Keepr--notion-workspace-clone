// ─────────────────────────────────────────────────────────────
// Share Dialog — Client Component
// ─────────────────────────────────────────────────────────────
//
// WHY CLIENT COMPONENT?
// This is a modal with lots of interactivity:
//   - Toggle public link on/off
//   - Copy link to clipboard
//   - Type an email and select a role
//   - Remove/change roles for shared users
// ─────────────────────────────────────────────────────────────

"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
    FiX,
    FiLink,
    FiCopy,
    FiCheck,
    FiUserPlus,
    FiTrash2,
    FiGlobe,
    FiLock,
} from "react-icons/fi";
import {
    generatePublicLink,
    revokePublicLink,
    inviteUser,
    removeShare,
    updateShareRole,
    getDocumentShares,
} from "@/app/actions/sharing";

// ─── Types ───

type SharedUser = {
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
};

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentTitle: string;
    // The current public share link token (null = not shared publicly)
    initialShareLink: string | null;
}

export default function ShareDialog({
    isOpen,
    onClose,
    documentId,
    documentTitle,
    initialShareLink,
}: ShareDialogProps) {
    const [isPending, startTransition] = useTransition();

    // ─── State ───
    const [shareLink, setShareLink] = useState(initialShareLink);
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("viewer");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    // ─── Load shared users when dialog opens ───
    useEffect(() => {
        if (isOpen) {
            setShareLink(initialShareLink);
            setError("");
            setCopied(false);
            setInviteEmail("");

            // Fetch the list of users who have access
            getDocumentShares(documentId).then((res) => {
                if (res.success) {
                    setSharedUsers(res.shares);
                }
            });
        }
    }, [isOpen, documentId, initialShareLink]);

    // ─── Toggle Public Link ───
    const handleTogglePublicLink = () => {
        startTransition(async () => {
            if (shareLink) {
                // Currently shared publicly → revoke
                const res = await revokePublicLink(documentId);
                if (res.success) setShareLink(null);
            } else {
                // Not shared → generate a new link
                const res = await generatePublicLink(documentId);
                if (res.success && res.shareLink) setShareLink(res.shareLink);
            }
        });
    };

    // ─── Copy Link to Clipboard ───
    const handleCopyLink = async () => {
        if (!shareLink) return;

        const fullUrl = `${window.location.origin}/shared/${shareLink}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);

        // Reset the "Copied!" state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
    };

    // ─── Invite a User ───
    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        setError("");

        startTransition(async () => {
            const res = await inviteUser(documentId, inviteEmail, inviteRole);
            if (res.success) {
                setInviteEmail("");
                // Refresh the shared users list
                const updatedShares = await getDocumentShares(documentId);
                if (updatedShares.success) setSharedUsers(updatedShares.shares);
            } else {
                setError(res.error || "Failed to invite user");
            }
        });
    };

    // ─── Remove a User's Access ───
    const handleRemoveUser = (userId: string) => {
        startTransition(async () => {
            const res = await removeShare(documentId, userId);
            if (res.success) {
                setSharedUsers((prev) => prev.filter((u) => u.userId !== userId));
            }
        });
    };

    // ─── Change a User's Role ───
    const handleChangeRole = (userId: string, newRole: string) => {
        startTransition(async () => {
            const res = await updateShareRole(documentId, userId, newRole);
            if (res.success) {
                setSharedUsers((prev) =>
                    prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u))
                );
            }
        });
    };

    // ─── Don't render when closed ───
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Share &quot;{documentTitle}&quot;
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* ─── Public Link Section ─── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {shareLink ? (
                                    <FiGlobe className="w-4 h-4 text-green-500" />
                                ) : (
                                    <FiLock className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-gray-700">
                                    {shareLink ? "Public link enabled" : "Public link disabled"}
                                </span>
                            </div>
                            <button
                                onClick={handleTogglePublicLink}
                                disabled={isPending}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                    shareLink ? "bg-green-500" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                        shareLink ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Show the link if public sharing is enabled */}
                        {shareLink && (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 truncate font-mono">
                                    {typeof window !== "undefined"
                                        ? `${window.location.origin}/shared/${shareLink}`
                                        : `/shared/${shareLink}`}
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <FiCheck className="w-4 h-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <FiCopy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ─── Invite User Section ─── */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Invite people
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => {
                                    setInviteEmail(e.target.value);
                                    setError("");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleInvite();
                                }}
                                placeholder="Enter email address"
                                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                            </select>
                            <button
                                onClick={handleInvite}
                                disabled={isPending || !inviteEmail.trim()}
                                className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Invite"
                            >
                                <FiUserPlus className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Error message */}
                        {error && (
                            <p className="text-xs text-red-500 mt-1.5">{error}</p>
                        )}
                    </div>

                    {/* ─── Shared Users List ─── */}
                    {sharedUsers.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                People with access
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {sharedUsers.map((user) => (
                                    <div
                                        key={user.userId}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                                    >
                                        {/* User info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {user.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                        .slice(0, 2)
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Role select + Remove */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleChangeRole(user.userId, e.target.value)
                                                }
                                                className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="editor">Editor</option>
                                            </select>
                                            <button
                                                onClick={() => handleRemoveUser(user.userId)}
                                                disabled={isPending}
                                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                                title="Remove access"
                                            >
                                                <FiTrash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
