// ─────────────────────────────────────────────────────────────
// Search Provider — Global Keyboard Shortcut Handler
// ─────────────────────────────────────────────────────────────
//
// WHY THIS EXISTS:
// The Command Palette (Ctrl+K) needs to be accessible from
// ANYWHERE in the app — the sidebar, the editor, any page.
// To do this, we create a "provider" that wraps the entire
// workspace layout. It listens for the Ctrl+K shortcut and
// manages the open/close state of the search modal.
//
// HOW TO USE IT:
//   1. Wrap your layout with <SearchProvider>
//   2. Any child component can call useSearch() to open/close
//      the search modal programmatically
// ─────────────────────────────────────────────────────────────

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import CommandPalette from "./command-palette";

// ─── Context Type ───
// This defines what data and functions are available to
// any component that calls useSearch()
interface SearchContextType {
    // Whether the search modal is currently visible
    isOpen: boolean;
    // Call this to open the search modal
    openSearch: () => void;
    // Call this to close the search modal
    closeSearch: () => void;
    // Call this to toggle the search modal (open if closed, close if open)
    toggleSearch: () => void;
}

// Create the React Context with a default value of null
// (It will be properly set when SearchProvider renders)
const SearchContext = createContext<SearchContextType | null>(null);

// ─── Custom Hook ───
// Components use this to access the search state and controls
export function useSearch() {
    const context = useContext(SearchContext);

    // If someone tries to use useSearch() outside of a SearchProvider,
    // throw a helpful error message instead of silently failing
    if (!context) {
        throw new Error("useSearch must be used within a <SearchProvider>");
    }

    return context;
}

// ─── Provider Component ───
export function SearchProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openSearch = useCallback(() => setIsOpen(true), []);
    const closeSearch = useCallback(() => setIsOpen(false), []);
    const toggleSearch = useCallback(() => setIsOpen((prev) => !prev), []);

    // ─── Global Keyboard Shortcut: Ctrl+K ───
    // We attach this listener to the entire window so it works
    // no matter where the user's focus is.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
            const isCtrlOrCmd = event.ctrlKey || event.metaKey;

            if (isCtrlOrCmd && event.key === "k") {
                // Prevent the browser's default Ctrl+K behavior
                // (e.g., Chrome focuses the address bar)
                event.preventDefault();
                toggleSearch();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Clean up the listener when this component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [toggleSearch]);

    return (
        <SearchContext.Provider value={{ isOpen, openSearch, closeSearch, toggleSearch }}>
            {children}
            {/* The CommandPalette renders as a fixed overlay,
                so it doesn't matter where in the tree it is */}
            <CommandPalette isOpen={isOpen} onClose={closeSearch} />
        </SearchContext.Provider>
    );
}
