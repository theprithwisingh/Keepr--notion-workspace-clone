"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import {
    FaMagnifyingGlass, FaHouse, FaInbox, FaClipboardList, FaFileLines,
    FaFolderOpen, FaDatabase, FaRobot, FaBug, FaRoute, FaGear,
    FaMicroscope, FaCalendarDay, FaChartSimple, FaBookOpen, FaBuildingUser,
    FaRocket, FaFileSignature, FaMapLocationDot, FaPalette, FaEnvelope,
    FaMobileScreenButton, FaNoteSticky, FaChartPie, FaWandMagicSparkles
} from "react-icons/fa6";

/* ═══════════════════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════════════════ */

const ArrowRightIcon = ({ className = "" }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
        <path d="M5.25 2.5L9.75 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StarIcon = ({ className = "" }: { className?: string }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M7 0l2.16 4.38 4.84.7-3.5 3.42.83 4.82L7 11.17l-4.33 2.15.83-4.82L0 5.08l4.84-.7L7 0z" />
    </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
        <path d="M3.5 8.5L6 11l6.5-6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════════════════
   LOGO
   ═══════════════════════════════════════════════════════════════════════ */

const KeeprLogo = ({ size = "default" }: { size?: "default" | "small" }) => {
    const s = size === "small";
    return (
        <a href="/" className="flex items-center gap-2 group" aria-label="Keepr — Home">
            <div className={`${s ? "w-6 h-6" : "w-7 h-7"} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                <svg viewBox="0 0 32 32" fill="currentColor" className="w-full h-full text-gray-900" aria-hidden="true">
                    <path d="M 4 14 L 28 14 L 28 2 Z" />
                    <path d="M 4 18 L 28 18 L 28 30 Z" />
                </svg>
            </div>
            <span className={`${s ? "text-base" : "text-lg"} font-bold tracking-tight text-gray-900`}>Keepr</span>
        </a>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   INLINE UI MOCKUP COMPONENTS — Fake product previews built with CSS
   ═══════════════════════════════════════════════════════════════════════ */

/** Mini sidebar + content workspace mockup */
const WorkspaceMockup = () => (
    <div className="w-full rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-[0_24px_64px_rgb(0_0_0/0.07),0_8px_20px_rgb(0_0_0/0.04)]">
        <div className="flex min-h-[480px] md:min-h-[580px]">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-60 bg-gray-50/80 border-r border-gray-100 p-5 shrink-0">
                <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">K</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Team Workspace</span>
                </div>
                <div className="space-y-1">
                    {[
                        { icon: <FaMagnifyingGlass className="inline mr-2" size="1.5em" />, label: "Search" },
                        { icon: <FaHouse className="inline mr-2" size="1.5em" />, label: "Home" },
                        { icon: <FaInbox className="inline mr-2" size="1.5em" />, label: "Inbox" }
                    ].map(item => (
                        <div key={item.label} className="text-[13px] text-gray-500 py-2 px-2.5 rounded flex items-center">{item.icon}{item.label}</div>
                    ))}
                </div>
                <div className="mt-5 mb-2 text-[12px] font-semibold text-gray-400 uppercase tracking-wider px-2.5">Teamspaces</div>
                <div className="space-y-0.5">
                    {[
                        { icon: <FaClipboardList size="1.5em" />, label: "Projects", active: true },
                        { icon: <FaFileLines size="1.5em" />, label: "Documents" },
                        { icon: <FaFolderOpen size="1.5em" />, label: "Knowledge Base" },
                        { icon: <FaDatabase size="1.5em" />, label: "Databases" },
                        { icon: <FaRobot size="1.5em" />, label: "AI Agents" },
                    ].map(item => (
                        <div key={item.label} className={`text-[13px] py-2 px-2.5 rounded flex items-center gap-2 ${item.active ? "bg-white text-gray-900 font-medium shadow-sm border border-gray-100" : "text-gray-500"}`}>
                            <span className="text-[15px]">{item.icon}</span>{item.label}
                        </div>
                    ))}
                </div>
                <div className="mt-auto pt-4">
                    <div className="flex -space-x-1.5">
                        {["bg-rose-400", "bg-violet-400", "bg-sky-400", "bg-amber-400"].map((c, i) => (
                            <div key={i} className={`w-6 h-6 rounded-full ${c} ring-2 ring-gray-50 flex items-center justify-center text-[9px] text-white font-bold`}>
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                        <div className="w-6 h-6 rounded-full bg-gray-200 ring-2 ring-gray-50 flex items-center justify-center text-[9px] text-gray-500 font-medium">+3</div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 md:p-7">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-[15px] font-semibold text-gray-900">Projects</h4>
                        <p className="text-[13px] text-gray-400 mt-0.5">Sprint 14 · 3 weeks remaining</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md font-medium">Board</span>
                        <span className="text-[12px] bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md font-medium">Timeline</span>
                    </div>
                </div>
                {/* Kanban columns */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        {
                            title: "To Do", color: "bg-gray-400", tasks: [
                                { label: "Design system tokens", tag: "Design", tagColor: "bg-violet-50 text-violet-600" },
                                { label: "API documentation", tag: "Docs", tagColor: "bg-sky-50 text-sky-600" },
                            ]
                        },
                        {
                            title: "In Progress", color: "bg-orange-400", tasks: [
                                { label: "Auth flow redesign", tag: "Engineering", tagColor: "bg-amber-50 text-amber-600" },
                                { label: "Dashboard analytics", tag: "Feature", tagColor: "bg-emerald-50 text-emerald-600" },
                                { label: "Mobile responsiveness", tag: "Bug", tagColor: "bg-rose-50 text-rose-600" },
                            ]
                        },
                        {
                            title: "Done", color: "bg-emerald-400", tasks: [
                                { label: "User onboarding flow", tag: "Feature", tagColor: "bg-emerald-50 text-emerald-600" },
                                { label: "Performance audit", tag: "Ops", tagColor: "bg-gray-100 text-gray-600" },
                            ]
                        },
                    ].map(col => (
                        <div key={col.title}>
                            <div className="flex items-center gap-1.5 mb-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                                <span className="text-[13px] font-semibold text-gray-700">{col.title}</span>
                                <span className="text-[12px] text-gray-300 ml-auto">{col.tasks.length}</span>
                            </div>
                            <div className="space-y-2.5">
                                {col.tasks.map(task => (
                                    <div key={task.label} className="bg-white border border-gray-100 rounded-lg p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:shadow-md transition-shadow duration-200">
                                        <p className="text-[13px] text-gray-800 font-medium leading-snug mb-2">{task.label}</p>
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${task.tagColor}`}>{task.tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

/** Mini AI chat conversation */
const AIChatMockup = () => (
    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-violet-600 text-[11px]">✦</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">Keepr AI</span>
            <span className="text-[12px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium ml-auto">Online</span>
        </div>
        <div className="p-5 space-y-4">
            <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-sky-400 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">S</div>
                <div className="bg-gray-50 rounded-lg rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                    <p className="text-[13px] text-gray-700 leading-relaxed">Find last month&apos;s roadmap and summarize the key decisions.</p>
                </div>
            </div>
            <div className="flex gap-2.5 justify-end">
                <div className="bg-violet-50 rounded-lg rounded-tr-sm px-3.5 py-2.5 max-w-[85%]">
                    <p className="text-[13px] text-gray-700 leading-relaxed">Found <span className="font-semibold text-violet-700">Q4 Product Roadmap</span> in Team Docs. Here&apos;s the summary:</p>
                    <div className="mt-2.5 space-y-1.5">
                        <p className="text-[12px] text-gray-500">• Mobile app launch moved to March</p>
                        <p className="text-[12px] text-gray-500">• AI features prioritized for Q1</p>
                        <p className="text-[12px] text-gray-500">• 3 new integrations approved</p>
                    </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[11px] shrink-0 mt-0.5">✦</div>
            </div>
            <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-sky-400 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">S</div>
                <div className="bg-gray-50 rounded-lg rounded-tl-sm px-3.5 py-2.5">
                    <p className="text-[13px] text-gray-700">Create tasks for each pending item and assign to the team.</p>
                </div>
            </div>
            <div className="flex gap-2.5 justify-end">
                <div className="bg-violet-50 rounded-lg rounded-tr-sm px-3.5 py-2.5 max-w-[85%]">
                    <p className="text-[13px] text-gray-700">Done! Created <span className="font-semibold text-violet-700">3 tasks</span> and assigned to Sarah, Marcus, and Priya. Sprint board updated. ✓</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[11px] shrink-0 mt-0.5">✦</div>
            </div>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-2.5">
            <div className="flex-1 bg-gray-50 rounded-lg px-3.5 py-2 text-[13px] text-gray-300">Ask Keepr AI anything...</div>
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                <ArrowRightIcon className="text-white w-3.5 h-3.5" />
            </div>
        </div>
    </div>
);

/** Mini bug tracker list */
const BugTrackerMockup = () => (
    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Bug Tracker</span>
            <span className="text-[12px] bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full font-medium">5 open</span>
        </div>
        <div className="divide-y divide-gray-50">
            {[
                { id: "#142", title: "Auth token expires during file upload", severity: "Critical", sevColor: "bg-rose-500", assignee: "S", assigneeColor: "bg-sky-400" },
                { id: "#139", title: "Dashboard charts not loading on Safari", severity: "High", sevColor: "bg-amber-500", assignee: "M", assigneeColor: "bg-violet-400" },
                { id: "#138", title: "Search results missing pagination", severity: "Medium", sevColor: "bg-orange-400", assignee: "P", assigneeColor: "bg-emerald-400" },
            ].map(bug => (
                <div key={bug.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                    <span className="text-[12px] text-gray-300 font-mono w-10">{bug.id}</span>
                    <p className="text-[13px] text-gray-700 flex-1 truncate">{bug.title}</p>
                    <span className={`w-2 h-2 rounded-full ${bug.sevColor} shrink-0`} />
                    <span className="text-[11px] text-gray-400 w-14 text-right">{bug.severity}</span>
                    <div className={`w-6 h-6 rounded-full ${bug.assigneeColor} flex items-center justify-center text-[9px] text-white font-bold shrink-0`}>{bug.assignee}</div>
                </div>
            ))}
        </div>
    </div>
);

/** Mini agent status cards */
const AgentCardMockup = ({ name, status, tasks, icon, color }: { name: string; status: string; tasks: string; icon: React.ReactNode; color: string }) => (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-3xl shrink-0`}>{icon}</div>
            <div>
                <p className="text-[14px] font-semibold text-gray-800">{name}</p>
                <p className="text-[12px] text-gray-400">{status}</p>
            </div>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400">{tasks} completed today</span>
            <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
        </div>
    </div>
);

/** Knowledge base doc preview */
const DocPreviewMockup = ({ title, icon, description, tags }: { title: string; icon: React.ReactNode; description: string; tags: string[] }) => (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
        <div className="flex items-start gap-3.5 mb-4">
            <span className="text-5xl">{icon}</span>
            <div>
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{title}</h4>
                <p className="text-[13px] text-gray-400 mt-1.5 leading-relaxed">{description}</p>
            </div>
        </div>
        <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
                <span key={tag} className="text-[11px] bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded-full border border-gray-100 font-medium">{tag}</span>
            ))}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function Page() {
    const router = useRouter()
    return (
        <>
            {/* ─── NAVBAR ─── */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-5 lg:px-8">
                    <KeeprLogo />
                    <ul className="hidden md:flex items-center gap-1 text-[13px] font-medium text-gray-500">
                        {[
                            { label: "Features", href: "/features" },
                            { label: "Pricing", href: "/pricing" },
                            { label: "Changelog", href: "#" },
                            { label: "Docs", href: "#" },
                            { label: "Contact", href: "/contact" },
                        ].map(link => (
                            <li key={link.label}>
                                <a href={link.href} className="px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors">{link.label}</a>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push("/sign-in")}
                            className="hidden sm:inline-flex text-[13px] text-gray-500 font-medium px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer">Log in</button>
                        <button
                            onClick={() => router.push("/sign-up")}
                            className="bg-gray-900 text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow cursor-pointer active:scale-[0.97]">Get Keepr free</button>
                    </div>
                </div>
            </nav>

            <main>
                {/* ─────────── SECTION 1 · HERO ─────────── */}
                <section className="relative pt-20 md:pt-28 pb-4" aria-labelledby="hero-heading">
                    {/* Soft background glow */}
                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(251,146,60,0.07)_0%,_rgba(244,63,94,0.03)_40%,_transparent_70%)]" />
                    </div>

                    <div className="relative max-w-4xl mx-auto text-center px-5 lg:px-8">
                        {/* Floating colored icons */}
                        <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
                            {[
                                { emoji: <FaNoteSticky size="2em" />, bg: "bg-blue-50 border-blue-100 text-blue-500" },
                                { emoji: <FaRobot size="2em" />, bg: "bg-violet-50 border-violet-100 text-violet-500" },
                                { emoji: <FaChartPie size="2em" />, bg: "bg-amber-50 border-amber-100 text-amber-500" },
                                { emoji: <FaWandMagicSparkles size="2em" />, bg: "bg-rose-50 border-rose-100 text-rose-500" },
                                { emoji: <FaRocket size="2em" />, bg: "bg-emerald-50 border-emerald-100 text-emerald-500" },
                            ].map((item, i) => (
                                <div key={i} className={`w-14 h-14 rounded-xl ${item.bg} border flex items-center justify-center shadow-sm`}>
                                    {item.emoji}
                                </div>
                            ))}
                        </div>

                        {/* Headline */}
                        <h1
                            id="hero-heading"
                            className="text-[clamp(2.5rem,7vw,5rem)] font-bold tracking-[-0.03em] text-gray-900 leading-[1.05] animate-fade-in-up"
                        >
                            Where teams and{" "}
                            <br className="hidden sm:block" />
                            agents{" "}
                            <span className="relative inline-flex items-center">
                                <span className="relative z-10 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent px-1">Build</span>
                                <span className="absolute inset-0 bg-orange-100/60 rounded-xl -skew-x-2" aria-hidden="true" />
                            </span>{" "}
                            together.
                        </h1>

                        {/* Subheading */}
                        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                            Keepr is an all-in-one workspace where notes, documents, tasks,lecture,socialmedia content, scheduling
                            projects, databases, and AI agents coexist. One platform to replace them all.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 animate-fade-in-up delay-300">
                            <a href="#" className="group inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/10 hover:shadow-xl hover:shadow-gray-900/15 active:scale-[0.97]">
                                Get Keepr free
                                <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
                            </a>
                            <a href="#" className="group inline-flex items-center gap-1 text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors px-4 py-3">
                                Request a demo
                                <ChevronRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* ─────────── SECTION 2 · WORKSPACE PREVIEW ─────────── */}
                <section className="pt-12 md:pt-16 pb-24 md:pb-32">
                    <div className="max-w-[1140px] mx-auto px-5 lg:px-8 animate-fade-in-up delay-400">
                        <WorkspaceMockup />
                        {/* Bottom fade */}
                        <div className="relative -mt-20 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" aria-hidden="true" />
                    </div>
                </section>

                {/* ─────────── SECTION 3 · KEEP WORK MOVING 24/7 ─────────── */}
                <section className="py-24 md:py-36 bg-[#fafafa]" aria-labelledby="agents-heading">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <div className="max-w-2xl mb-16">
                            <h2 id="agents-heading" className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-900 tracking-tight leading-[1.08]">
                                Keep work moving 24/7.
                            </h2>
                            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                                AI agents that create tasks, organize information, summarize documents,
                                assign work, and automate workflows — even when your team is offline.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-5">
                            {/* Left: Agent status cards */}
                            <div className="lg:col-span-2 space-y-4">
                                <AgentCardMockup name="Bug Tracker Agent" status="Monitoring 3 repos" tasks="12" icon={<FaBug />} color="bg-rose-50 text-rose-500" />
                                <AgentCardMockup name="Task Router" status="Processing inbox" tasks="28" icon={<FaRoute />} color="bg-sky-50 text-sky-500" />
                                <AgentCardMockup name="Engineering Agent" status="Reviewing PRs" tasks="7" icon={<FaGear />} color="bg-amber-50 text-amber-500" />
                                <AgentCardMockup name="Research Agent" status="Analyzing docs" tasks="5" icon={<FaMicroscope />} color="bg-violet-50 text-violet-500" />
                                <AgentCardMockup name="Custom Agent" status="Running workflow" tasks="15" icon={<FaRobot />} color="bg-emerald-50 text-emerald-500" />
                            </div>
                            {/* Right: Bug tracker detail */}
                            <div className="lg:col-span-3 space-y-4">
                                <BugTrackerMockup />
                                {/* AI triage card */}
                                <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px]">✦</div>
                                        <span className="text-xs font-semibold text-gray-700">AI Auto-Triage</span>
                                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium ml-auto">Active</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                                            <p className="text-[11px] text-gray-600"><span className="font-medium text-gray-800">#142</span> classified as <span className="text-rose-600 font-medium">Critical</span> — assigned to Sarah (auth specialist)</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                                            <p className="text-[11px] text-gray-600"><span className="font-medium text-gray-800">#139</span> linked to 2 related issues — created fix branch</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                                            <p className="text-[11px] text-gray-600"><span className="font-medium text-gray-800">#138</span> auto-labeled <span className="text-orange-600 font-medium">Medium</span> — added to Sprint 14 backlog</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─────────── SECTION 4 · ASK YOUR ON-DEMAND ASSISTANTS ─────────── */}
                <section className="py-24 md:py-36" aria-labelledby="assistants-heading">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <div className="max-w-2xl mb-16">
                            <h2 id="assistants-heading" className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-900 tracking-tight leading-[1.08]">
                                Ask your on-demand assistants.
                            </h2>
                            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                                You ask the question. Keepr Agent does the work — searching across your
                                entire workspace and responding immediately.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-5">
                            {/* Large AI chat */}
                            <div className="lg:col-span-2">
                                <AIChatMockup />
                            </div>
                            {/* Side cards */}
                            <div className="space-y-5">
                                <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                    <div className="w-14 h-14 rounded-xl bg-sky-50 border border-sky-100 text-sky-500 flex items-center justify-center mb-4">
                                        <FaMagnifyingGlass size="2em" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Search across everything</h3>
                                    <p className="text-[13px] text-gray-500 leading-relaxed">
                                        Instant answers from every doc, task, database, and conversation in your workspace.
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                    <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center mb-4">
                                        <FaCalendarDay size="2em" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Perfect meetings every time</h3>
                                    <p className="text-[13px] text-gray-500 leading-relaxed">
                                        AI-generated agendas, real-time notes, and automatic action items after every call.
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                    <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mb-4">
                                        <FaChartSimple size="2em" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Smart summaries</h3>
                                    <p className="text-[13px] text-gray-500 leading-relaxed">
                                        Standup updates, sprint reviews, and progress reports — generated and ready to share.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─────────── SECTION 5 · BRING ALL YOUR WORK TOGETHER ─────────── */}
                <section className="py-24 md:py-36 bg-[#fafafa]" aria-labelledby="workspace-heading">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <h2 id="workspace-heading" className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-900 tracking-tight leading-[1.08]">
                                    Bring all your work together.
                                </h2>
                                <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                                    Stop scattering information across PDFs, emails, Google Docs, and Slack.
                                    Everything lives in one connected workspace.
                                </p>
                            </div>
                            {/* Tabs */}
                            <div className="shrink-0">
                                <div className="inline-flex items-center gap-0.5 bg-white p-1 rounded-full border border-gray-200/80 shadow-sm">
                                    {[
                                        { label: "Teamspaces", active: true },
                                        { label: "Import & Sync" },
                                        { label: "Integrations" },
                                    ].map(tab => (
                                        <button key={tab.label} className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${tab.active ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            <DocPreviewMockup
                                title="Help Center"
                                icon={<FaBookOpen className="text-blue-500" />}
                                description="Self-serve knowledge base for customers with search, categories, and AI-powered answers."
                                tags={["Public", "42 articles", "AI-enabled"]}
                            />
                            <DocPreviewMockup
                                title="Company HQ"
                                icon={<FaBuildingUser className="text-indigo-500" />}
                                description="Team directory, policies, onboarding guides, and company-wide announcements in one place."
                                tags={["Internal", "Team wiki", "Onboarding"]}
                            />
                            <DocPreviewMockup
                                title="Launch Tracker"
                                icon={<FaRocket className="text-rose-500" />}
                                description="Track feature launches with timelines, owners, status updates, and linked design docs."
                                tags={["Project", "Timeline", "Cross-team"]}
                            />
                            <DocPreviewMockup
                                title="Meeting Notes"
                                icon={<FaFileSignature className="text-amber-500" />}
                                description="Automatically transcribed and summarized meetings with linked action items and decisions."
                                tags={["Automated", "AI summary", "Linked"]}
                            />
                            <DocPreviewMockup
                                title="Product Roadmap"
                                icon={<FaMapLocationDot className="text-emerald-500" />}
                                description="Visual roadmap with priorities, dependencies, and real-time status synced from engineering."
                                tags={["Strategy", "Database", "Synced"]}
                            />
                            <DocPreviewMockup
                                title="Design System"
                                icon={<FaPalette className="text-violet-500" />}
                                description="Component documentation, design tokens, and usage guidelines — always up to date."
                                tags={["Design", "Components", "Versioned"]}
                            />
                        </div>

                        {/* Stats */}
                        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200/60 pt-12">
                            {[
                                { value: "50K+", label: "Teams collaborating" },
                                { value: "2M+", label: "Docs created" },
                                { value: "99.99%", label: "Uptime SLA" },
                                { value: "<50ms", label: "API latency" },
                            ].map(stat => (
                                <div key={stat.label} className="text-center py-2">
                                    <p className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight tabular-nums">{stat.value}</p>
                                    <p className="text-sm text-gray-400 mt-1.5 font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─────────── SECTION 6 · TRUSTED BY TEAMS THAT SHIP ─────────── */}
                <section className="py-24 md:py-36" aria-labelledby="social-proof-heading">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <div className="max-w-2xl mb-16">
                            <h2 id="social-proof-heading" className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-900 tracking-tight leading-[1.08]">
                                Trusted by teams that ship.
                            </h2>
                        </div>

                        {/* Logo strip */}
                        <div className="flex flex-wrap items-center gap-x-12 gap-y-4 mb-16" aria-label="Trusted by these companies">
                            {["Vercel", "Stripe", "Linear", "Figma", "Supabase", "Loom"].map(name => (
                                <span key={name} className="text-xl font-bold text-gray-900/20 tracking-tight select-none">{name}</span>
                            ))}
                        </div>

                        {/* Testimonial feature */}
                        <div className="grid md:grid-cols-3 gap-5">
                            {[
                                {
                                    quote: "Keepr replaced five separate tools for us. Notes, tasks, docs, wikis, and project tracking — all in one place. The AI agents handle triage and summaries while we focus on building.",
                                    name: "Sarah Chen",
                                    role: "VP Engineering, Acme",
                                    color: "bg-rose-500",
                                },
                                {
                                    quote: "Finally, a workspace that actually understands context. I ask the AI to find last quarter's roadmap decisions and it pulls the exact doc with a summary. This is how tools should work.",
                                    name: "Marcus Rivera",
                                    role: "Staff Engineer, Vercel",
                                    color: "bg-violet-500",
                                },
                                {
                                    quote: "We consolidated everything into Keepr in a weekend. The import was seamless, the team adopted it immediately, and the AI meeting summaries alone save us hours every week.",
                                    name: "Priya Sharma",
                                    role: "Head of Product, Loom",
                                    color: "bg-sky-500",
                                },
                            ].map(t => (
                                <figure key={t.name} className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex gap-0.5 mb-4" aria-label="5 out of 5 stars">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <StarIcon key={i} className="text-amber-400" />
                                        ))}
                                    </div>
                                    <blockquote className="text-[15px] text-gray-600 leading-[1.7] mb-6">
                                        &ldquo;{t.quote}&rdquo;
                                    </blockquote>
                                    <figcaption className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>{t.name.charAt(0)}</div>
                                        <div>
                                            <cite className="not-italic text-sm font-semibold text-gray-900 block">{t.name}</cite>
                                            <span className="text-xs text-gray-400">{t.role}</span>
                                        </div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─────────── SECTION 7 · TRY FOR FREE ─────────── */}
                <section className="py-24 md:py-36 bg-[#fafafa]" aria-labelledby="cta-heading">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <div className="max-w-2xl mx-auto text-center mb-16">
                            <h2 id="cta-heading" className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-900 tracking-tight leading-[1.08]">
                                Try for free.
                            </h2>
                            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                                Get started with the full Keepr ecosystem. No credit card required.
                            </p>
                        </div>

                        {/* Ecosystem cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 max-w-4xl mx-auto mb-16">
                            {[
                                { icon: <FaEnvelope size="2em" />, title: "Keepr Mail", desc: "Email inside your workspace", bg: "bg-rose-50 border-rose-100 text-rose-500" },
                                { icon: <FaCalendarDay size="2em" />, title: "Calendar", desc: "Schedule and sync meetings", bg: "bg-sky-50 border-sky-100 text-sky-500" },
                                { icon: <FaPalette size="2em" />, title: "Design Resources", desc: "Templates and design tools", bg: "bg-violet-50 border-violet-100 text-violet-500" },
                                { icon: <FaMobileScreenButton size="2em" />, title: "Mobile & Desktop", desc: "Native apps everywhere", bg: "bg-emerald-50 border-emerald-100 text-emerald-500" },
                            ].map(card => (
                                <div key={card.title} className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center">
                                    <div className={`w-14 h-14 rounded-xl ${card.bg} border flex items-center justify-center mx-auto mb-4`}>{card.icon}</div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{card.title}</h3>
                                    <p className="text-[12px] text-gray-400 leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pricing */}
                        <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
                            {[
                                {
                                    name: "Free", price: "$0", period: "/mo",
                                    features: ["Up to 5 members", "Unlimited pages & docs", "Basic integrations", "Community support"],
                                    highlight: false, cta: "Get started",
                                },
                                {
                                    name: "Pro", price: "$10", period: "/user/mo",
                                    features: ["Unlimited members", "AI agents & assistants", "Advanced integrations", "Priority support"],
                                    highlight: true, cta: "Start free trial",
                                },
                                {
                                    name: "Enterprise", price: "Custom", period: "",
                                    features: ["SSO & SAML", "Audit logs", "Dedicated account manager", "99.99% SLA"],
                                    highlight: false, cta: "Contact sales",
                                },
                            ].map(plan => (
                                <article key={plan.name} className={`relative rounded-2xl border p-6 md:p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${plan.highlight ? "border-orange-200 bg-gradient-to-b from-orange-50/60 to-white ring-1 ring-orange-200/50" : "border-gray-200/60 bg-white"}`}>
                                    {plan.highlight && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1 rounded-full shadow-sm">Popular</span>
                                    )}
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{plan.name}</p>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-3xl font-bold text-gray-900 tracking-tight">{plan.price}</span>
                                        {plan.period && <span className="text-sm text-gray-400 font-medium">{plan.period}</span>}
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                                                <CheckIcon className="text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ${plan.highlight ? "bg-gray-900 text-white hover:bg-gray-800 shadow-md shadow-gray-900/10 active:scale-[0.98]" : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98]"}`}>
                                        {plan.cta}
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* ─── FOOTER ─── */}
            <footer className="border-t border-gray-100 bg-white py-16 md:py-20" aria-label="Site footer">
                <div className="max-w-7xl mx-auto px-5 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
                        <div className="col-span-2">
                            <div className="mb-4"><KeeprLogo size="small" /></div>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                                The all-in-one workspace where<br />teams and AI agents build together.
                            </p>
                        </div>
                        {[
                            { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"] },
                            { title: "Company", links: ["About", "Blog", "Careers", "Contact", "Press"] },
                            { title: "Resources", links: ["Docs", "API Reference", "Guides", "Community", "Status"] },
                            { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
                        ].map(col => (
                            <nav key={col.title} aria-label={col.title}>
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{col.title}</h3>
                                <ul className="space-y-2.5">
                                    {col.links.map(link => (
                                        <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link}</a></li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                    <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Keepr, Inc. All rights reserved.</p>
                        <div className="flex items-center gap-3">
                            {[
                                { label: "X (Twitter)", icon: "X" },
                                { label: "GitHub", icon: "GH" },
                                { label: "LinkedIn", icon: "LI" },
                                { label: "YouTube", icon: "YT" },
                            ].map(social => (
                                <a key={social.icon} href="#" aria-label={social.label} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-200 transition-all duration-200">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}