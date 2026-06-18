// ─────────────────────────────────────────────────────────────
// Command Palette / Global Search (Ctrl+K)
// ─────────────────────────────────────────────────────────────
//
// WHY IS THIS A CLIENT COMPONENT?
// This component needs heavy interactivity:
//   - Listening for keyboard events (Ctrl+K)
//   - Managing input state and debouncing
//   - Navigating results with arrow keys
//   - Storing recent searches in localStorage
// None of these things can be done in a Server Component.
//
// HOW IT WORKS:
//   1. User presses Ctrl+K (or clicks the Search button in sidebar)
//   2. A full-screen modal overlay opens
//   3. As the user types, we debounce for 300ms then call the
//      searchDocuments Server Action
//   4. Results are shown with highlighted matching text
//   5. User can navigate results with arrow keys and press Enter
//   6. Recent searches are saved in localStorage
// ─────────────────────────────────────────────────────────────

"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchDocuments, type SearchResult } from "@/app/actions/search";
import { FiSearch, FiFileText, FiClock, FiX, FiCornerDownLeft } from "react-icons/fi";

// ─── Constants ───

// How long to wait (in ms) after the user stops typing before searching
const DEBOUNCE_DELAY = 300;

// How many recent searches to remember
const MAX_RECENT_SEARCHES = 5;

// Key for localStorage
const RECENT_SEARCHES_KEY = "brainspace-recent-searches";

// ─── Helper: Highlight matching text ───
// This function wraps the matching part of a string in a <mark> tag
// so it appears highlighted in the UI.
function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query || query.length < 2) return text;

    // Find where the query appears (case-insensitive)
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    // If no match found, just return the plain text
    if (matchIndex === -1) return text;

    // Split the text into three parts: before, match, after
    const beforeMatch = text.slice(0, matchIndex);
    const matchedText = text.slice(matchIndex, matchIndex + query.length);
    const afterMatch = text.slice(matchIndex + query.length);

    return (
        <>
            {beforeMatch}
            <mark className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">
                {matchedText}
            </mark>
            {afterMatch}
        </>
    );
}

// ─── Helper: Read recent searches from localStorage ───
function getRecentSearches(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// ─── Helper: Save a search query to recent searches ───
function saveRecentSearch(query: string) {
    if (typeof window === "undefined" || !query.trim()) return;
    try {
        const recent = getRecentSearches();
        // Remove this query if it already exists (so it moves to the top)
        const filtered = recent.filter(
            (item) => item.toLowerCase() !== query.toLowerCase()
        );
        // Add the new query at the beginning
        filtered.unshift(query.trim());
        // Keep only the most recent ones
        const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
    } catch {
        // localStorage might be full or disabled — that's okay
    }
}

// ─── Helper: Clear all recent searches ───
function clearRecentSearches() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// ─── Main Component ───

interface CommandPaletteProps {
    // We receive `isOpen` and `onClose` from the parent so the sidebar
    // button and the keyboard shortcut can both control the modal.
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ─── State ───
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // ─── Focus the input when the modal opens ───
    useEffect(() => {
        if (isOpen) {
            // Small delay to let the modal animate in before focusing
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);

            // Load recent searches from localStorage
            setRecentSearches(getRecentSearches());

            return () => clearTimeout(timer);
        } else {
            // Reset state when modal closes
            setQuery("");
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // ─── Debounced Search ───
    // Every time the query changes, we wait DEBOUNCE_DELAY ms before searching.
    // This prevents sending a request on every single keystroke.
    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const response = await searchDocuments(searchQuery);

        if (response.success) {
            setResults(response.results);
        } else {
            console.error("Search error:", response.error);
            setResults([]);
        }

        setIsSearching(false);
    }, []);

    // ─── Handle input changes with debouncing ───
    const handleQueryChange = (newQuery: string) => {
        setQuery(newQuery);
        setSelectedIndex(0);

        // Clear any existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set a new timer — the search will fire after DEBOUNCE_DELAY ms
        debounceTimerRef.current = setTimeout(() => {
            performSearch(newQuery);
        }, DEBOUNCE_DELAY);
    };

    // ─── Navigate to a result ───
    const navigateToResult = (result: SearchResult) => {
        // Save this query to recent searches
        saveRecentSearch(query);

        // Navigate to the document
        router.push(`/workspace/${result.workspaceSlug}/${result.id}`);

        // Close the modal
        onClose();
    };

    // ─── Handle using a recent search ───
    const handleRecentSearch = (recentQuery: string) => {
        setQuery(recentQuery);
        setSelectedIndex(0);
        performSearch(recentQuery);
    };

    // ─── Handle clearing recent searches ───
    const handleClearRecent = () => {
        clearRecentSearches();
        setRecentSearches([]);
    };

    // ─── Keyboard Navigation ───
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Figure out how many items are currently in the list
        const totalItems = query.length >= 2 ? results.length : recentSearches.length;

        switch (e.key) {
            case "ArrowDown":
                // Move selection down (wrap around to top)
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < totalItems - 1 ? prev + 1 : 0
                );
                break;

            case "ArrowUp":
                // Move selection up (wrap around to bottom)
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : totalItems - 1
                );
                break;

            case "Enter":
                // Select the currently highlighted item
                e.preventDefault();
                if (query.length >= 2 && results[selectedIndex]) {
                    navigateToResult(results[selectedIndex]);
                } else if (recentSearches[selectedIndex]) {
                    handleRecentSearch(recentSearches[selectedIndex]);
                }
                break;

            case "Escape":
                // Close the modal
                onClose();
                break;
        }
    };

    // ─── Don't render anything if the modal is closed ───
    if (!isOpen) return null;

    // ─── Decide what to show in the body of the modal ───
    const showResults = query.length >= 2;
    const showRecent = !showResults && recentSearches.length > 0;
    const showEmpty = showResults && results.length === 0 && !isSearching;

    return (
        // Full-screen overlay — clicking outside the box closes it
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* The actual search box — clicking inside doesn't close it */}
            <div
                className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Search Input ─── */}
                <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    <FiSearch className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search pages..."
                        className="flex-1 text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                    />
                    {/* Keyboard shortcut badge */}
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200 ml-2">
                        Esc
                    </kbd>
                </div>

                {/* ─── Results / Recent / Empty State ─── */}
                <div className="max-h-80 overflow-y-auto">
                    {/* Loading indicator */}
                    {isSearching && (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                            Searching...
                        </div>
                    )}

                    {/* Search Results */}
                    {showResults && !isSearching && (
                        <div className="py-2">
                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Results
                            </div>
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                                        index === selectedIndex
                                            ? "bg-blue-50 text-blue-900"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                    onClick={() => navigateToResult(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        {result.icon ? (
                                            <span className="text-lg">{result.icon}</span>
                                        ) : (
                                            <FiFileText className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Title and snippet */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {highlightMatch(result.title, query)}
                                        </div>
                                        {result.contentSnippet && (
                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                {highlightMatch(result.contentSnippet, query)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Enter icon for selected item */}
                                    {index === selectedIndex && (
                                        <FiCornerDownLeft className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty state — no results found */}
                    {showEmpty && (
                        <div className="px-4 py-8 text-center">
                            <FiSearch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                                No pages found for &quot;{query}&quot;
                            </p>
                        </div>
                    )}

                    {/* Recent Searches */}
                    {showRecent && (
                        <div className="py-2">
                            <div className="px-4 py-1 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Recent Searches
                                </span>
                                <button
                                    onClick={handleClearRecent}
                                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((recentQuery, index) => (
                                <button
                                    key={recentQuery}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                                        index === selectedIndex
                                            ? "bg-blue-50 text-blue-900"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                    onClick={() => handleRecentSearch(recentQuery)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <FiClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm truncate">{recentQuery}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Default state — nothing typed yet, no recents */}
                    {!showResults && !showRecent && !isSearching && (
                        <div className="px-4 py-8 text-center">
                            <FiSearch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                                Type to search all your pages
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Search by title or content
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── Footer with keyboard hints ─── */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400 bg-gray-50">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">↑↓</kbd>
                        Navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">↵</kbd>
                        Open
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">Esc</kbd>
                        Close
                    </span>
                </div>
            </div>
        </div>
    );
}
