"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Video, Mail, KeyRound, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { auth, IS_MOCK } from "@/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    if (IS_MOCK) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSuccess(true);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      await sendPasswordResetEmail(auth!, email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send reset link. Verify your email address.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-glow-primary">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-white shadow-md shadow-primary/20 mb-4">
            <Video className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Reset your password</h2>
          <p className="text-sm text-zinc-400 mt-1.5">Recover your Viddy account access</p>
        </div>

        {/* Card Body */}
        <div className="rounded-2xl border border-white/8 glass-panel p-6 shadow-2xl space-y-6">
          {success ? (
            <div className="space-y-4 text-center py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Verification Link Sent</h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  We have emailed password reset instructions to **{email}**. Please check your inbox.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 py-2.5 text-sm font-semibold transition-all mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 text-xs rounded-lg border border-red-500/10 bg-red-500/5 text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4.5 w-4.5 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-xl py-2.5 pl-11 pr-4 outline-none text-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white py-2.5 text-sm font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  <span>Request Reset Link</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back navigation link */}
        {!success && (
          <p className="text-center text-xs text-zinc-500">
            <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-white transition-colors font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}
