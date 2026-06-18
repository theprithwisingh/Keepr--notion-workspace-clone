"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
    FiPlus, 
    FiFileText, 
    FiTrash2, 
    FiSettings, 
    FiSearch,
    FiChevronRight,
    FiChevronDown,
    FiStar,
    FiLogOut,
} from "react-icons/fi";
import { createDocument } from "@/app/actions/documents";
import { useSearch } from "@/components/search/search-provider";

// ─── Types ───

type DocumentPartial = {
    id: string;
    title: string;
    icon: string | null;
    parentDocumentId: string | null;
    isPublished: boolean;
};

type UserProfile = {
    name: string;
    email: string;
    image: string | null;
} | null;

interface SidebarClientProps {
    workspaceId: string;
    initialDocuments: DocumentPartial[];
    initialFavorites: string[];
    initialRecents: string[];
    user: UserProfile;
}

export default function SidebarClient({ 
    workspaceId, 
    initialDocuments, 
    initialFavorites, 
    initialRecents,
    user,
}: SidebarClientProps) {
    const router = useRouter();
    const params = useParams();
    const activeDocumentId = params.slug ? params.slug[params.slug.length - 1] : null;

    const [isPending, startTransition] = useTransition();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // Connect to the global search provider
    const { openSearch } = useSearch();

    const handleCreateDocument = (parentId?: string) => {
        startTransition(async () => {
            const res = await createDocument(workspaceId, parentId);
            if (res.success && res.document) {
                if (parentId) {
                    setExpanded(prev => ({ ...prev, [parentId]: true }));
                }
                router.push(`/workspace/${workspaceId}/${res.document.id}`);
            } else {
                console.error(res.error);
            }
        });
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/sign-in");
            router.refresh();
        } catch {
            router.push("/sign-in");
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ─── Recursive Document Tree ───
    const DocumentList = ({ parentId = null, level = 0 }: { parentId: string | null, level?: number }) => {
        const items = initialDocuments.filter(doc => doc.parentDocumentId === parentId);
        if (items.length === 0) return null;

        return (
            <div className="flex flex-col w-full">
                {items.map(doc => {
                    const hasChildren = initialDocuments.some(d => d.parentDocumentId === doc.id);
                    const isExpanded = expanded[doc.id];
                    const isActive = activeDocumentId === doc.id;

                    return (
                        <div key={doc.id}>
                            <div 
                                className={`group flex items-center min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-gray-200 cursor-pointer text-gray-600 ${isActive ? 'bg-gray-200 font-medium text-gray-900' : ''}`}
                                style={{ paddingLeft: `${level * 12 + 12}px` }}
                                onClick={() => router.push(`/workspace/${workspaceId}/${doc.id}`)}
                            >
                                <div 
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-300 mr-1"
                                    onClick={(e) => hasChildren ? toggleExpand(doc.id, e) : undefined}
                                >
                                    {hasChildren ? (
                                        isExpanded ? <FiChevronDown className="w-4 h-4 text-gray-500" /> : <FiChevronRight className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <FiFileText className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                
                                {doc.icon && <span className="mr-2">{doc.icon}</span>}
                                <span className="truncate flex-1">{doc.title}</span>
                                
                                <div className="opacity-0 group-hover:opacity-100 h-full flex items-center">
                                    <div 
                                        className="px-1 hover:bg-gray-300 rounded text-gray-500"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            startTransition(async () => {
                                                const { toggleFavorite } = await import("@/app/actions/documents");
                                                await toggleFavorite(doc.id);
                                            });
                                        }}
                                        title="Toggle Favorite"
                                    >
                                        <FiStar className={`w-3.5 h-3.5 ${initialFavorites.includes(doc.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                    </div>
                                    <div 
                                        className="px-1 hover:bg-gray-300 rounded text-gray-500"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            startTransition(async () => {
                                                const { softDeleteDocument } = await import("@/app/actions/documents");
                                                await softDeleteDocument(doc.id);
                                                if (isActive) router.push(`/workspace/${workspaceId}`);
                                            });
                                        }}
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div 
                                        className="px-1 hover:bg-gray-300 rounded text-gray-500"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCreateDocument(doc.id);
                                        }}
                                        title="New Sub-page"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            
                            {isExpanded && hasChildren && (
                                <DocumentList parentId={doc.id} level={level + 1} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ─── Flat list for favorites and recents ───
    const renderFlatList = (docIds: string[]) => {
        const docs = docIds.map(id => initialDocuments.find(d => d.id === id)).filter(Boolean) as DocumentPartial[];
        
        return docs.map(doc => {
            const isActive = activeDocumentId === doc.id;
            return (
                <div 
                    key={`flat-${doc.id}`}
                    className={`group flex items-center min-h-[27px] text-sm py-1 pl-4 pr-3 w-full hover:bg-gray-200 cursor-pointer text-gray-600 ${isActive ? 'bg-gray-200 font-medium text-gray-900' : ''}`}
                    onClick={() => router.push(`/workspace/${workspaceId}/${doc.id}`)}
                >
                    <div className="w-5 h-5 flex items-center justify-center mr-1">
                        {doc.icon ? <span>{doc.icon}</span> : <FiFileText className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span className="truncate flex-1">{doc.title}</span>
                </div>
            );
        });
    }

    // Helper to get user initials for the avatar
    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <aside className="w-64 bg-[#fbfbfa] flex-shrink-0 flex flex-col h-full border-r border-gray-200 relative">

            {/* ─── Profile Header ─── */}
            {user && (
                <div className="px-3 pt-3 pb-2 border-b border-gray-200">
                    <Link 
                        href="/profile"
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-[11px] font-bold overflow-hidden flex-shrink-0">
                            {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getUserInitials(user.name)
                            )}
                        </div>
                        {/* Name */}
                        <span className="text-sm font-semibold text-gray-900 truncate flex-1">
                            {user.name}
                        </span>
                    </Link>
                </div>
            )}

            {/* ─── Top Actions (Search, Settings) ─── */}
            <div className="flex flex-col p-3 gap-1 text-gray-600">
                <button 
                    onClick={openSearch}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 rounded-md transition-colors text-left w-full"
                >
                    <FiSearch className="w-4 h-4" />
                    <span className="flex-1">Search</span>
                    <kbd className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">
                        ⌘K
                    </kbd>
                </button>
                <Link href={`/workspace/${workspaceId}/settings`} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 rounded-md transition-colors">
                    <FiSettings className="w-4 h-4" />
                    Settings
                </Link>
            </div>

            {/* ─── Document Tree ─── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden mt-2 pb-4">
                
                {/* Favorites Section */}
                {initialFavorites.length > 0 && (
                    <div className="mb-4">
                        <div className="px-3 pb-1 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider group cursor-pointer hover:bg-gray-100">
                            <FiChevronDown className="w-3 h-3 mr-1" />
                            <span>Favorites</span>
                        </div>
                        {renderFlatList(initialFavorites)}
                    </div>
                )}

                {/* Recents Section */}
                {initialRecents.length > 0 && (
                    <div className="mb-4">
                        <div className="px-3 pb-1 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider group cursor-pointer hover:bg-gray-100">
                            <FiChevronDown className="w-3 h-3 mr-1" />
                            <span>Recent</span>
                        </div>
                        {renderFlatList(initialRecents)}
                    </div>
                )}

                {/* Private Pages Section */}
                <div>
                    <div className="px-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between group cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center">
                            <FiChevronDown className="w-3 h-3 mr-1" />
                            <span>Private Pages</span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleCreateDocument(); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded transition-all"
                            disabled={isPending}
                        >
                            <FiPlus className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {initialDocuments.length === 0 ? (
                        <div className="px-6 py-2 text-sm text-gray-400 italic">No pages inside</div>
                    ) : (
                        <DocumentList parentId={null} />
                    )}
                </div>
            </div>

            {/* ─── Bottom: Trash + Logout ─── */}
            <div className="p-3 border-t border-gray-200 bg-[#fbfbfa] flex items-center gap-1">
                <Link 
                    href={`/workspace/${workspaceId}/trash`} 
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors flex-1"
                >
                    <FiTrash2 className="w-4 h-4" />
                    Trash
                </Link>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Log out"
                >
                    <FiLogOut className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
}
