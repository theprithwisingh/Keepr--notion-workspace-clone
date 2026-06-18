import React from "react";
import SidebarServer from "@/components/workspace/sidebar-server";

export default async function WorkspaceIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar (Notion style) */}
            <SidebarServer workspaceId={workspaceId} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
