"use client";

import Link from "next/link";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";

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

export default function ModifyPasswordPage() {
    return (
        <div className="animate-fade-in-up">
            {/* Show Logo only on screens below lg (split screen hidden) */}
            <div className="lg:hidden text-center">
                <Logo />
            </div>
            
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1.5">
                    Reset password
                </h1>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
            </div>

            <div className="auth-card">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-semibold text-gray-600">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            className="auth-input"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn-primary mt-2">
                        Send reset link
                    </button>
                </form>
            </div>

            <div className="text-center mt-6">
                <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <FaArrowLeft className="text-xs" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}

