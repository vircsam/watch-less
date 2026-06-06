"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Video, LayoutDashboard, User, LogOut, Zap, HelpCircle } from "lucide-react";
import { useAppStore } from "@/store";
import { auth, IS_MOCK } from "@/firebase/config";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAppStore();

  const handleLogout = async () => {
    if (!IS_MOCK && auth) {
      await signOut(auth);
    }
    logout();
    router.push("/");
  };

  const isLanding = pathname === "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/8 glass-panel shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-accent text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors duration-200">
                Viddy
              </span>
            </Link>

            {/* Main Nav Links (Left side) */}
            {isLanding && (
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors duration-200">Features</a>
                <a href="#demo" className="text-sm text-muted-foreground hover:text-white transition-colors duration-200">Demo</a>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors duration-200">Pricing</a>
                <a href="#faq" className="text-sm text-muted-foreground hover:text-white transition-colors duration-200">FAQ</a>
              </div>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Credit balance indicator */}
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 animate-pulse-slow">
                  <Zap className="h-3.5 w-3.5 fill-primary" />
                  <span>{user.credits} Credits</span>
                </div>

                {/* Dashboard Shortcut */}
                {pathname !== "/dashboard" && (
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white border border-zinc-800 hover:bg-zinc-800 transition-all duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Profile menu dropdown or buttons */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 hover:border-primary transition-colors duration-200"
                    title="User Profile"
                  >
                    <User className="h-4.5 w-4.5 text-zinc-300" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-900 hover:bg-red-500/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all duration-200"
                    title="Log Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-200"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
