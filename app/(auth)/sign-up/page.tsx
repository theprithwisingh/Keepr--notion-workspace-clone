// ─────────────────────────────────────────────────────────────
// Signup Page — Client Component
// ─────────────────────────────────────────────────────────────
//
// Very similar to the Login page, but with an extra "name" field
// and different API endpoint (/api/auth/register).
//
// 📚 FORM VALIDATION LEARNING POINT:
// We do validation in TWO places:
//   1. CLIENT-SIDE: Quick checks before sending (better UX)
//   2. SERVER-SIDE: Thorough checks in the API route (security!)
//
// Never rely on client-side validation alone — it can be bypassed.
// Always validate on the server too!
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa6";

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

export default function SignupPage() {
    // ─── State for each form field ───
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    // ─── Form Submission Handler ───
    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError("");

        // CLIENT-SIDE VALIDATION:
        // Quick checks for a better user experience.
        // The server will also validate, but this gives instant feedback.
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            // Send registration data to our API
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Registration failed. Please try again.");
                return;
            }

            // Registration successful!
            // The API already set the auth cookie, so we just redirect.
            router.push("/workspace");
            router.refresh();
        } catch {
            setError("Unable to connect. Please check your internet connection.");
        } finally {
            setIsLoading(false);
        }
    }

    // ─── Google Signup Handler ───
    function handleGoogleSignup() {
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
                    Create an account
                </h1>
                <p className="text-sm text-gray-500">
                    Join Keepr and bring your team&apos;s work together.
                </p>
            </div>

            <div className="auth-card">
                {/* ─── Error Message ─── */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* ─── Google Signup ─── */}
                <div className="space-y-3 mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        className="auth-btn-social"
                    >
                        <FaGoogle className="text-base" />
                        Sign up with Google
                    </button>
                </div>

                <div className="relative flex items-center py-1.5 mb-6">
                    <div className="flex-grow border-t border-gray-200/80"></div>
                    <span className="flex-shrink-0 px-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Or sign up with email
                    </span>
                    <div className="flex-grow border-t border-gray-200/80"></div>
                </div>

                {/* ─── Email Signup Form ─── */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label htmlFor="signup-name" className="block text-xs font-semibold text-gray-600">
                            Full name
                        </label>
                        <input
                            id="signup-name"
                            type="text"
                            placeholder="Jane Doe"
                            className="auth-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="signup-email" className="block text-xs font-semibold text-gray-600">
                            Email address
                        </label>
                        <input
                            id="signup-email"
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
                        <label htmlFor="signup-password" className="block text-xs font-semibold text-gray-600">
                            Password
                        </label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="Create a strong password (min. 8 characters)"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn-primary mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="text-center text-[11px] text-gray-500 mt-5 leading-relaxed">
                    By signing up, you agree to our{" "}
                    <a href="#" className="font-semibold text-gray-700 hover:text-gray-900 hover:underline">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="font-semibold text-gray-700 hover:text-gray-900 hover:underline">
                        Privacy Policy
                    </a>.
                </p>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                    href="/sign-in"
                    className="font-semibold text-gray-900 hover:underline underline-offset-4"
                >
                    Log in
                </Link>
            </p>
        </div>
    );
}
