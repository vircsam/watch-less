"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import SidebarComponent from "@/components/Sidebar";
import { User, Mail, Calendar, Coins, Loader2, CheckCircle2 } from "lucide-react";
import { auth, IS_MOCK } from "@/firebase/config";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  useAuthRedirect();
  const { user, fetchProfile } = useAppStore();
  const [name, setName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isUpdating) return;

    setIsUpdating(true);
    setSuccess(false);
    setError(null);

    try {
      if (IS_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await fetchProfile(user.uid, name, user.email);
      } else {
        if (auth?.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
        }
        await fetchProfile(user.uid, name, user.email);
      }
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to update profile name.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <SidebarComponent />

      {/* Main Content Workspace */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">User Profile</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your account credentials and personal details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left panel: Info stats */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/10 p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xl font-bold mb-3">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">{user.name}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
            </div>

            <hr className="border-white/5" />

            <div className="space-y-3.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span>{user.credits} AI credits available</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right panel: Update form */}
          <div className="md:col-span-2 rounded-2xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
            <h3 className="text-sm font-bold text-white tracking-wide">Account Settings</h3>

            {success && (
              <div className="p-3 text-xs rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                <span>Profile name updated successfully!</span>
              </div>
            )}

            {error && (
              <div className="p-3 text-xs rounded-lg border border-red-500/10 bg-red-500/5 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
                <div className="relative flex items-center opacity-60">
                  <Mail className="absolute left-3.5 h-4.5 w-4.5 text-zinc-500" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-zinc-950 border border-zinc-900 text-sm rounded-xl py-2.5 pl-11 pr-4 outline-none text-zinc-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-medium">To modify your email address, contact support.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Display Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4.5 w-4.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-xl py-2.5 pl-11 pr-4 outline-none text-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating || !name.trim() || name === user.name}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
