"use client";

import React, { useEffect, useState } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import SidebarComponent from "@/components/Sidebar";
import {
  Bell,
  CheckCircle2,
  Download,
  Languages,
  Loader2,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  useAuthRedirect();

  const [language, setLanguage] = useState("auto");
  const [defaultExport, setDefaultExport] = useState("pdf");
  const [autoOpenReport, setAutoOpenReport] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setLanguage(localStorage.getItem("viddy_language") || "auto");
    setDefaultExport(localStorage.getItem("viddy_default_export") || "pdf");
    setAutoOpenReport(localStorage.getItem("viddy_auto_open_report") !== "false");
    setEmailDigest(localStorage.getItem("viddy_email_digest") === "true");
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    await new Promise((resolve) => setTimeout(resolve, 350));
    localStorage.setItem("viddy_language", language);
    localStorage.setItem("viddy_default_export", defaultExport);
    localStorage.setItem("viddy_auto_open_report", String(autoOpenReport));
    localStorage.setItem("viddy_email_digest", String(emailDigest));
    setSuccess(true);
    setIsSaving(false);
  };

  return (
    <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
      <SidebarComponent />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <Settings className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Workspace preferences</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Video analysis settings</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Tune how Viddy presents reports, exports, and notifications for your analyzed videos.
            </p>
          </div>
        </div>

        {success && (
          <div className="p-4 text-xs rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>Preferences saved for this workspace.</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-4">
            <section className="rounded-xl border border-white/5 bg-zinc-900/20 p-5 space-y-5">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Languages className="h-4.5 w-4.5 text-secondary" />
                <span>Transcript Preferences</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Spoken Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-lg py-2.5 px-3 outline-none text-white transition-colors cursor-pointer"
                >
                  <option value="auto">Auto-detect for every video</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </section>

            <section className="rounded-xl border border-white/5 bg-zinc-900/20 p-5 space-y-5">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Download className="h-4.5 w-4.5 text-accent" />
                <span>Report Defaults</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Preferred Export Format
                </label>
                <select
                  value={defaultExport}
                  onChange={(e) => setDefaultExport(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-lg py-2.5 px-3 outline-none text-white transition-colors cursor-pointer"
                >
                  <option value="pdf">PDF report</option>
                  <option value="markdown">Markdown notes</option>
                  <option value="json">Raw JSON</option>
                  <option value="csv">Transcript CSV</option>
                </select>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-950/40 px-4 py-3 cursor-pointer">
                <span>
                  <span className="block text-sm font-semibold text-white">Open report after analysis</span>
                  <span className="block text-xs text-zinc-500 mt-0.5">Jump straight into the finished timeline view.</span>
                </span>
                <input
                  type="checkbox"
                  checked={autoOpenReport}
                  onChange={(e) => setAutoOpenReport(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-950/40 px-4 py-3 cursor-pointer">
                <span>
                  <span className="block text-sm font-semibold text-white">Email analysis digest</span>
                  <span className="block text-xs text-zinc-500 mt-0.5">Receive a compact summary when a video completes.</span>
                </span>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            </section>
          </div>

          <aside className="rounded-xl border border-white/5 bg-zinc-900/20 p-5 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Managed processing is built in</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                Video transcription, keyframes, summaries, and chat context are handled automatically by Viddy.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="rounded-lg bg-zinc-950/50 border border-white/5 p-3">
                <Sparkles className="h-4 w-4 text-primary mb-2" />
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Pipeline</p>
                <p className="text-xs text-white font-semibold mt-1">Automatic</p>
              </div>
              <div className="rounded-lg bg-zinc-950/50 border border-white/5 p-3">
                <Bell className="h-4 w-4 text-secondary mb-2" />
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Alerts</p>
                <p className="text-xs text-white font-semibold mt-1">Optional</p>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/95 text-white px-6 py-3 text-xs font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
