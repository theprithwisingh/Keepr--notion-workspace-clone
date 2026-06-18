// ─────────────────────────────────────────────────────────────
// Login Page — Client Component
// ─────────────────────────────────────────────────────────────
//
// 📚 "use client" LEARNING POINT:
// This file has "use client" at the top, making it a Client Component.
// Client Components run in the BROWSER and can use:
//   - useState, useEffect, and other React hooks
//   - Event handlers (onClick, onSubmit)
//   - Browser APIs (window, document)
//
// We need this to be a Client Component because:
//   - The form needs to track input values (useState)
//   - We handle form submission with JavaScript (fetch)
//   - We show loading/error states that update dynamically
//
// Compare this to Server Components (like the profile page)
// which run on the server and can't use hooks.
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa6";

// ─── Reusable Logo Component ───
const Logo = () => (
    <Link href="/" className="flex items-center justify-center gap-2 group mb-6 inline-flex" aria-label="Keepr — Home">
        <div className="w-8 h-8 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <svg viewBox="0 0 32 32" fill="currentColor" className="w-full h-full text-gray-900" aria-hidden="true">
                <path d="M 4 14 L 28 14 L 28 2 Z" />
                <path d="M 4 18 L 28 18 L 28 30 Z" />
            </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">Keepr</span>
    </Link>
);

export default function LoginPage() {
    // ─── State ───
    // useState creates a piece of state that React tracks.
    // When state changes, the component re-renders with the new value.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");       // Error message to show the user
    const [isLoading, setIsLoading] = useState(false); // Shows a loading spinner on the button

    // ─── Navigation ───
    const router = useRouter();          // Lets us redirect the user programmatically
    const searchParams = useSearchParams(); // Read URL query params (like ?redirect=/workspace)

    // Check if there was a Google OAuth error
    const googleError = searchParams.get("error");

    // ─── Form Submission Handler ───
    async function handleSubmit(event: React.FormEvent) {
        // Prevent the browser from doing a full page reload
        event.preventDefault();

        // Clear any previous error messages
        setError("");
        setIsLoading(true);

        try {
            // Send the login data to our API route
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // The API returned an error (wrong password, user not found, etc.)
                setError(data.error || "Login failed. Please try again.");
                return;
            }

            // Login successful! Redirect the user.
            // If they were trying to access a specific page before being
            // redirected to login, send them back there. Otherwise, go to /workspace.
            const redirectTo = searchParams.get("redirect") || "/workspace";
            router.push(redirectTo);
            router.refresh(); // Refresh server components to reflect the new auth state
        } catch {
            // Network error (no internet, server down, etc.)
            setError("Unable to connect. Please check your internet connection.");
        } finally {
            // Always stop the loading spinner, whether login succeeded or failed
            setIsLoading(false);
        }
    }

    // ─── Google Login Handler ───
    function handleGoogleLogin() {
        // Redirect to our Google OAuth API route
        // This will send the user to Google's login page
        window.location.href = "/api/auth/google";
    }

    return (
        <div className="animate-fade-in-up">
            {/* Show Logo only on screens below lg (split screen hidden) */}
            <div className="lg:hidden text-center">
                <Logo />
            </div>
            
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1.5">
                    Welcome back
                </h1>
                <p className="text-sm text-gray-500">
                    Log in to your Keepr workspace to continue.
                </p>
            </div>

            <div className="auth-card">
                {/* ─── Error Messages ─── */}
                {(error || googleError) && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error || "Google login failed. Please try again."}
                    </div>
                )}

                {/* ─── Google Login Button ─── */}
                <div className="space-y-3 mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="auth-btn-social"
                    >
                        <FaGoogle className="text-base" />
                        Continue with Google
                    </button>
                </div>

                <div className="relative flex items-center py-1.5 mb-6">
                    <div className="flex-grow border-t border-gray-200/80"></div>
                    <span className="flex-shrink-0 px-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Or log in with email
                    </span>
                    <div className="flex-grow border-t border-gray-200/80"></div>
                </div>

                {/* ─── Email Login Form ─── */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label htmlFor="login-email" className="block text-xs font-semibold text-gray-600">
                            Email address
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="you@company.com"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="login-password" className="block text-xs font-semibold text-gray-600">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn-primary mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Log in"}
                    </button>
                </form>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
                Don&apos;t have an account?{" "}
                <Link
                    href="/sign-up"
                    className="font-semibold text-gray-900 hover:underline underline-offset-4"
                >
                    Sign up
                </Link>
            </p>
        </div>
    );
}
