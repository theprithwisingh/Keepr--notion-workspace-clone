import React from "react";
import { FaRobot, FaWandSparkles } from "react-icons/fa6";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="auth-background min-h-screen flex lg:grid lg:grid-cols-12 select-none">
            {/* Left Panel: Major Branding/Visual (hidden on mobile, takes 5 cols on lg) */}
            <div className="hidden lg:flex lg:col-span-5 relative bg-zinc-950 text-white p-12 flex-col justify-between overflow-hidden border-r border-zinc-800">
                {/* Glowing radial circles */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1)_0%,transparent_50%)] z-0 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.1)_0%,transparent_50%)] z-0 pointer-events-none" />
                
                {/* Dots background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:24px_24px] z-0 pointer-events-none" />

                {/* Logo & Header */}
                <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 32 32" fill="currentColor" className="w-full h-full text-white" aria-hidden="true">
                            <path d="M 4 14 L 28 14 L 28 2 Z" />
                            <path d="M 4 18 L 28 18 L 28 30 Z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white select-none">Keepr</span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 my-auto space-y-8 max-w-sm">
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-orange-400">
                            <FaWandSparkles className="text-[10px] animate-pulse" />
                            <span>Teams & AI Agents Collaborative Space</span>
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                            Where teams and agents build together.
                        </h2>
                        <p className="text-xs xl:text-sm text-zinc-400 leading-relaxed">
                            Keepr is the AI-powered operating system that unites human teams and autonomous agents. Docs, tasks, and agents in one beautifully unified space.
                        </p>
                    </div>

                    {/* Collaborative Workspace Timeline Feed */}
                    <div className="space-y-3 pt-2">
                        {/* Timeline Item 1 */}
                        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-4 rounded-xl flex items-start gap-3 hover:border-zinc-700/80 transition-all duration-300">
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400 font-semibold text-xs flex-shrink-0 select-none">
                                SC
                            </div>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-200">Sarah Chen</span>
                                    <span className="text-zinc-500">edited doc</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Updated <span className="text-orange-400">Q3 Product Strategy Spec</span></p>
                                <span className="text-[9px] text-zinc-500 block">2m ago</span>
                            </div>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-4 rounded-xl flex items-start gap-3 hover:border-zinc-700/80 transition-all duration-300">
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400 flex-shrink-0">
                                <FaRobot className="text-xs" />
                            </div>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-200 flex items-center gap-1">
                                        Keepr AI
                                        <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Agent</span>
                                    </span>
                                    <span className="text-zinc-500">completed task</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Autocompleted meeting summary and updated 4 tasks</p>
                                <span className="text-[9px] text-zinc-500 block">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="relative z-10 text-[11px] text-zinc-500 flex justify-between">
                    <span>© 2026 Keepr, Inc.</span>
                    <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                </div>
            </div>

            {/* Right Panel: children (forms) */}
            <div className="flex-1 lg:col-span-7 flex flex-col justify-center items-center relative p-6 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-[440px] py-8">
                    {children}
                </div>
            </div>
        </div>
    );
}