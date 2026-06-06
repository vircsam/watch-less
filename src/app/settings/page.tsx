"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import SidebarComponent from "@/components/Sidebar";
import { Settings, Server, Cpu, Globe, Loader2, CheckCircle2, ShieldAlert, Heartbeat } from "lucide-react";

export default function SettingsPage() {
  useAuthRedirect();
  const { user } = useAppStore();

  const [vpsUrl, setVpsUrl] = useState("http://localhost:8000");
  const [vpsToken, setVpsToken] = useState("");
  const [whisperModel, setWhisperModel] = useState("base");
  const [ollamaModel, setOllamaModel] = useState("llama3");
  const [language, setLanguage] = useState("auto");
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"unchecked" | "loading" | "healthy" | "unreachable">("unchecked");

  // Load settings from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("viddy_vps_url");
      const savedToken = localStorage.getItem("viddy_vps_token");
      const savedWhisper = localStorage.getItem("viddy_whisper_model");
      const savedOllama = localStorage.getItem("viddy_ollama_model");
      const savedLang = localStorage.getItem("viddy_language");

      if (savedUrl) setVpsUrl(savedUrl);
      if (savedToken) setVpsToken(savedToken);
      if (savedWhisper) setWhisperModel(savedWhisper);
      if (savedOllama) setOllamaModel(savedOllama);
      if (savedLang) setLanguage(savedLang);
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.setItem("viddy_vps_url", vpsUrl);
      localStorage.setItem("viddy_vps_token", vpsToken);
      localStorage.setItem("viddy_whisper_model", whisperModel);
      localStorage.setItem("viddy_ollama_model", ollamaModel);
      localStorage.setItem("viddy_language", language);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const checkVpsHealth = async () => {
    setHealthStatus("loading");
    try {
      // Direct call to health check endpoint on the configured VPS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res = await fetch(`${vpsUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setHealthStatus("healthy");
      } else {
        setHealthStatus("unreachable");
      }
    } catch (err) {
      console.error(err);
      setHealthStatus("unreachable");
    }
  };

  return (
    <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <SidebarComponent />

      {/* Main Container */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <span>Workspace Settings</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Configure your speech transcription engines, LLM models, and AI nodes.</p>
        </div>

        {success && (
          <div className="p-4 text-xs rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>Settings saved successfully! Local cache updated.</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* COLUMN 1: AI NODE CONFIG */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 border-b border-white/5 pb-3">
              <Server className="h-4.5 w-4.5 text-primary" />
              <span>AI VPS Endpoint</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">VPS Server Address</label>
                <input
                  type="url"
                  required
                  value={vpsUrl}
                  onChange={(e) => setVpsUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-xs rounded-xl py-2.5 px-4 outline-none text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">VPS Security Token</label>
                <input
                  type="password"
                  placeholder="Enter AI_VPS_TOKEN if configured..."
                  value={vpsToken}
                  onChange={(e) => setVpsToken(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-xs rounded-xl py-2.5 px-4 outline-none text-white transition-colors"
                />
              </div>

              {/* Health Diagnostics Panel */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={checkVpsHealth}
                  className="w-full text-center rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white py-2 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                >
                  Test Connection Health
                </button>

                {healthStatus === "loading" && (
                  <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mt-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Querying VPS /health status...</span>
                  </div>
                )}
                {healthStatus === "healthy" && (
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs mt-3 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>VPS online! Whisper and Llama 3 ready.</span>
                  </div>
                )}
                {healthStatus === "unreachable" && (
                  <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs mt-3 bg-red-500/5 border border-red-500/10 p-2 rounded-lg">
                    <ShieldAlert className="h-4.5 w-4.5" />
                    <span>Unreachable. Check firewall port 8000.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: TRANSCRIPTION & LLM MODEL TUNING */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 border-b border-white/5 pb-3">
              <Cpu className="h-4.5 w-4.5 text-secondary" />
              <span>Model Selection</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Transcription Model</label>
                <select
                  value={whisperModel}
                  onChange={(e) => setWhisperModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-xs rounded-xl py-2.5 px-4 outline-none text-white transition-colors cursor-pointer"
                >
                  <option value="tiny">Whisper Tiny (High speed, CPU-only)</option>
                  <option value="base">Whisper Base (Recommended for CPU)</option>
                  <option value="small">Whisper Small (High accuracy)</option>
                  <option value="medium">Whisper Medium (GPU recommended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Ollama LLM Model</label>
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-xs rounded-xl py-2.5 px-4 outline-none text-white transition-colors cursor-pointer"
                >
                  <option value="llama3">Llama 3 (8B parameters)</option>
                  <option value="mistral">Mistral (7B parameters)</option>
                  <option value="llama3.1">Llama 3.1 (Latest)</option>
                  <option value="phi3">Phi 3 (Microsoft small model)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Language Detection</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-xs rounded-xl py-2.5 px-4 outline-none text-white transition-colors cursor-pointer"
                >
                  <option value="auto">Auto-Detect spoken language</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white px-6 py-3 text-xs font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Settings Toggles</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
