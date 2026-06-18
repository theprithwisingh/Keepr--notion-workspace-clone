// ─────────────────────────────────────────────────────────────
// Favorites Client — Interactive Favorites Page
// ─────────────────────────────────────────────────────────────
//
// WHY CLIENT COMPONENT?
// Sorting and unpin actions require interactivity (button clicks,
// dropdown state changes). Server Components can't handle events.
// ─────────────────────────────────────────────────────────────

"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiFileText, FiStar, FiClock, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { toggleFavorite } from "@/app/actions/documents";

// ─── Types ───

type FavoriteDoc = {
    id: string;
    title: string;
    icon: string | null;
    favoritedAt: string; // ISO string — when the user favorited this doc
};

type RecentDoc = {
    id: string;
    title: string;
    icon: string | null;
    viewedAt: string; // ISO string — when the user last viewed this doc
};

interface FavoritesClientProps {
    workspaceId: string;
    favorites: FavoriteDoc[];
    recents: RecentDoc[];
}

// ─── Sort options ───
type SortOption = "name-asc" | "name-desc" | "date-asc" | "date-desc";

export default function FavoritesClient({
    workspaceId,
    favorites,
    recents,
}: FavoritesClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [sortBy, setSortBy] = useState<SortOption>("date-desc");

    // ─── Sort favorites based on the selected option ───
    const sortedFavorites = [...favorites].sort((a, b) => {
        switch (sortBy) {
            case "name-asc":
                return a.title.localeCompare(b.title);
            case "name-desc":
                return b.title.localeCompare(a.title);
            case "date-asc":
                return new Date(a.favoritedAt).getTime() - new Date(b.favoritedAt).getTime();
            case "date-desc":
            default:
                return new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime();
        }
    });

    // ─── Unpin a favorite ───
    const handleUnpin = (docId: string) => {
        startTransition(async () => {
            await toggleFavorite(docId);
        });
    };

    // ─── Navigate to a document ───
    const handleNavigate = (docId: string) => {
        router.push(`/workspace/${workspaceId}/${docId}`);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-8">
            {/* ─── Favorites Section ─── */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>

                    {/* Sort Dropdown */}
                    {favorites.length > 1 && (
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="date-desc">Newest first</option>
                            <option value="date-asc">Oldest first</option>
                            <option value="name-asc">Name A → Z</option>
                            <option value="name-desc">Name Z → A</option>
                        </select>
                    )}
                </div>

                {/* Empty State */}
                {favorites.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                        <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-gray-500 mb-1">No favorites yet</h2>
                        <p className="text-sm text-gray-400">
                            Click the star icon on any page to add it here.
                        </p>
                    </div>
                )}

                {/* Favorites List */}
                {sortedFavorites.length > 0 && (
                    <div className="space-y-2">
                        {sortedFavorites.map((doc) => (
                            <div
                                key={doc.id}
                                className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => handleNavigate(doc.id)}
                            >
                                {/* Left: Icon + Title */}
                                <div className="flex items-center gap-3 min-w-0">
                                    {doc.icon ? (
                                        <span className="text-lg flex-shrink-0">{doc.icon}</span>
                                    ) : (
                                        <FiFileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    )}
                                    <span className="font-medium text-gray-800 truncate">
                                        {doc.title || "Untitled"}
                                    </span>
                                </div>

                                {/* Right: Unpin button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Don't navigate when clicking unpin
                                        handleUnpin(doc.id);
                                    }}
                                    disabled={isPending}
                                    className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    title="Remove from favorites"
                                >
                                    <FiStar className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Recently Opened Section ─── */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiClock className="w-5 h-5 text-gray-400" />
                    Recently Opened
                </h2>

                {recents.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No recently opened pages.</p>
                ) : (
                    <div className="space-y-1">
                        {recents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleNavigate(doc.id)}
                            >
                                {doc.icon ? (
                                    <span className="text-base flex-shrink-0">{doc.icon}</span>
                                ) : (
                                    <FiFileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium text-gray-700 truncate flex-1">
                                    {doc.title || "Untitled"}
                                </span>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                    {new Date(doc.viewedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
