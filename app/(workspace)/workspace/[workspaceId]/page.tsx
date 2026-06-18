"use client";

import React, { useTransition } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { createDocument } from "@/app/actions/documents";
import { useRouter } from "next/navigation";

export default function WorkspaceEmptyState({ params }: { params: Promise<{ workspaceId: string }> }) {
    // We unwrap params directly using React.use for client components or just await in Server Components.
    // However, in Next.js 15+, for client components, we use `use` from react:
    const { workspaceId } = React.use(params);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCreate = () => {
        startTransition(async () => {
            const res = await createDocument(workspaceId);
            if (res.success && res.document) {
                router.push(`/workspace/${workspaceId}/${res.document.id}`);
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-white text-gray-500">
            <div className="bg-gray-50 rounded-full p-6 mb-4">
                <FiPlusCircle className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to your Workspace</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-sm text-center">
                Create a new page to start writing, planning, and organizing your thoughts.
            </p>
            <button 
                onClick={handleCreate}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {isPending ? "Creating..." : "Create New Page"}
            </button>
        </div>
    );
}
