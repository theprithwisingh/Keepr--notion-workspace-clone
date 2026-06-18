"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getExtensions } from "./extensions";
import "./editor.css"; // Global styles for Tiptap

// ─────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────
type DocumentData = {
    id: string;
    title: string;
    content: string | null;
    icon: string | null;
    coverImage: string | null;
};

interface EditorProps {
    documentId: string;
    initialDocument: DocumentData;
}

// ─────────────────────────────────────────────────────────────
// Main Editor Component
// ─────────────────────────────────────────────────────────────
export default function NotionEditor({ documentId, initialDocument }: EditorProps) {
    // Component State
    const [title, setTitle] = useState(initialDocument.title || "");
    const [saving, setSaving] = useState(false);
    
    // We use a ref for the debounce timer so we can clear it if needed
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ─────────────────────────────────────────────────────────────
    // Auto-Save Logic
    // ─────────────────────────────────────────────────────────────
    const saveChanges = useCallback(
        (newTitle: string, newContent: string) => {
            // Clear any existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            
            // Show optimistic "Saving..." UI instantly
            setSaving(true);
            
            // Wait 1 second after the user stops typing before actually sending to server
            debounceTimerRef.current = setTimeout(async () => {
                try {
                    // Dynamically import Server Action to ensure we stay on the client
                    const { updateDocument } = await import("@/app/actions/documents");
                    await updateDocument(documentId, {
                        title: newTitle,
                        content: newContent,
                    });
                } catch (error) {
                    console.error("Failed to save document:", error);
                } finally {
                    // Revert UI to "Saved"
                    setSaving(false);
                }
            }, 1000); 
        },
        [documentId]
    );

    // ─────────────────────────────────────────────────────────────
    // Tiptap Initialization
    // ─────────────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: getExtensions(),
        content: initialDocument.content || "",
        editorProps: {
            attributes: {
                // Tailwind Typography classes provide beautiful defaults for ProseMirror
                class: "prose prose-lg prose-gray max-w-none focus:outline-none min-h-[500px]",
            },
        },
        onUpdate: ({ editor }) => {
            // Trigger auto-save whenever the editor content changes
            const html = editor.getHTML();
            saveChanges(title, html);
        },
    });

    // Handle document changes from the parent layout (e.g., clicking another doc in sidebar)
    useEffect(() => {
        setTitle(initialDocument.title || "");
        if (editor && initialDocument.id !== documentId) {
            editor.commands.setContent(initialDocument.content || "");
        }
    }, [initialDocument.id, documentId, editor, initialDocument.content, initialDocument.title]);

    // Handle the big Document Title input changes
    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (editor) {
            saveChanges(newTitle, editor.getHTML());
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-8 pb-32">
            {/* Auto-save Indicator */}
            <div className="mb-4 flex justify-between items-center text-xs text-gray-400">
                <span className="transition-opacity duration-200">
                    {saving ? "Saving..." : "Saved"}
                </span>
            </div>
            
            {/* Document Title Header */}
            <textarea
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled"
                className="w-full resize-none text-5xl font-bold bg-transparent focus:outline-none text-gray-900 placeholder-gray-300 mb-8 overflow-hidden"
                rows={1}
                onInput={(e) => {
                    // Auto-expand the textarea as the user types long titles
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                }}
            />

            {/* Tiptap Editor Canvas */}
            <div className="editor-container relative">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
