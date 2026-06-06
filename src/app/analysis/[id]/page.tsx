"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAppStore } from "@/store";
import SidebarComponent from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import VisualDashboard from "@/components/VisualDashboard";
import TimelineView from "@/components/TimelineView";
import TranscriptSearch from "@/components/TranscriptSearch";
import DiagramView from "@/components/DiagramView";
import { ReportExporter } from "@/utils/exporter";
import { Video, VideoAnalysis, KeyFrame } from "@/types";
import { 
  FileText, 
  Clock, 
  Search, 
  Layers, 
  Map, 
  MessageSquare, 
  Download, 
  ArrowLeft, 
  Loader2, 
  Link2, 
  Copy, 
  Check, 
  Eye, 
  PieChart,
  AlertCircle 
} from "lucide-react";

export default function AnalysisDetailPage() {
  useAuthRedirect();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [video, setVideo] = useState<Video | null>(null);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [frames, setFrames] = useState<KeyFrame[]>([]);
  
  const [seekTime, setSeekTime] = useState<number>(0);
  const [activeRightTab, setActiveRightTab] = useState<"summary" | "timeline" | "transcript" | "details" | "flowchart">("summary");
  
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Fetch analysis details on mount
  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/videos?videoId=${id}`);
        if (!res.ok) {
          throw new Error("Failed to retrieve analysis logs.");
        }
        const data = await res.json();
        setVideo(data.video);
        setAnalysis(data.analysis);
        setFrames(data.frames || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const handleSeek = (seconds: number) => {
    setSeekTime(seconds);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
        <SidebarComponent />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-zinc-400 font-medium">Decompressing speech logs &amp; keyframes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video || !analysis) {
    return (
      <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
        <SidebarComponent />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Analysis details unavailable</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              We couldn&apos;t load the analysis details. The report may have been deleted or the pipeline failed.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 text-xs font-semibold text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
      {/* Side Navigation */}
      <SidebarComponent />

      {/* Main Container */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full space-y-6">
        
        {/* Workspace Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">{video.title}</h1>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 shrink-0 relative">
            {/* Ask AI Chat trigger */}
            <Link
              href={`/chat/${video.id}`}
              className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/95 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-primary/10 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Ask AI Chat</span>
            </Link>

            {/* Export Dropdown toggle */}
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-zinc-400" />
              <span>Export Report</span>
            </button>

            {/* Export Dropdown menu */}
            {exportDropdownOpen && (
              <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-white/5 bg-zinc-950 p-2.5 shadow-2xl space-y-1">
                <button
                  onClick={() => {
                    ReportExporter.exportToPDF(video, analysis, frames);
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-lg hover:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Download PDF Report
                </button>
                <button
                  onClick={() => {
                    ReportExporter.exportToMarkdown(video, analysis);
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-lg hover:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Download Markdown (.md)
                </button>
                <button
                  onClick={() => {
                    ReportExporter.exportToCSV(analysis);
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-lg hover:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Download Transcript CSV
                </button>
                <button
                  onClick={() => {
                    ReportExporter.exportToJSON(video, analysis, frames);
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-lg hover:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Download raw JSON log
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Double-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Player & Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            {/* Custom seekable Video Player */}
            <VideoPlayer url={video.sourceUrl} seekTime={seekTime} />

            {/* Visual Analytics Tab */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <PieChart className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-base font-bold tracking-wide">Visual Intelligence Charts</h2>
              </div>
              <VisualDashboard analysis={analysis} frames={frames} />
            </div>

            {/* Chapters breakdown list */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-4.5 w-4.5 text-secondary" />
                <h2 className="text-base font-bold tracking-wide">Chapters &amp; Milestones</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.chapters.map((ch, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSeek(ch.timestamp)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-800 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-primary group-hover:text-white transition-colors">
                      {formatTime(ch.timestamp)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-primary transition-colors text-right flex-1 truncate pl-4">
                      {ch.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Tabs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tab navigation headers */}
            <div className="flex border-b border-white/5 gap-4.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "summary", label: "Summary", icon: FileText },
                { id: "timeline", label: "Timeline", icon: Clock },
                { id: "transcript", label: "Transcript", icon: Search },
                { id: "details", label: "Resources", icon: Layers },
                { id: "flowchart", label: "Flowchart", icon: Map }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRightTab(tab.id as any)}
                    className={`pb-2.5 text-xs font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
                      activeRightTab === tab.id 
                        ? "border-primary text-white" 
                        : "border-transparent text-zinc-500 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT CARDS */}
            <div className="min-h-[450px]">
              
              {/* SUMMARY TAB */}
              {activeRightTab === "summary" && (
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Executive Summary</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/10 border border-white/5 rounded-xl p-4.5">
                      {analysis.summary}
                    </p>
                  </div>
                  
                  {/* Detailed Analysis Markdown */}
                  <div className="space-y-2.5 border-t border-white/5 pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">In-Depth Analysis</h3>
                    <div className="text-sm text-zinc-400 leading-relaxed prose prose-invert max-w-none prose-sm bg-zinc-900/10 border border-white/5 rounded-xl p-4.5 space-y-4 select-text">
                      {/* Formatted inline markdown summary rendering */}
                      {analysis.detailedSummary.split("\n\n").map((para, pIdx) => {
                        if (para.startsWith("###")) {
                          return <h4 key={pIdx} className="text-sm font-bold text-white mt-4 first:mt-0">{para.replace("###", "").trim()}</h4>;
                        }
                        if (para.startsWith("-") || para.startsWith("*")) {
                          return (
                            <ul key={pIdx} className="list-disc pl-5 space-y-1 text-xs">
                              {para.split("\n").map((li, liIdx) => (
                                <li key={liIdx}>{li.replace(/^[-\*]\s+/, "").trim()}</li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={pIdx} className="text-zinc-400 text-xs leading-relaxed">{para}</p>;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TIMELINE TAB */}
              {activeRightTab === "timeline" && (
                <TimelineView timeline={analysis.timeline} onSeek={handleSeek} />
              )}

              {/* TRANSCRIPT TAB */}
              {activeRightTab === "transcript" && (
                <TranscriptSearch transcript={analysis.transcript} onSeek={handleSeek} />
              )}

              {/* FLOWCHART TAB */}
              {activeRightTab === "flowchart" && (
                <DiagramView diagramData={analysis.diagramData} onSeek={handleSeek} />
              )}

              {/* DETAILS TAB (URLs, Entities & Frames) */}
              {activeRightTab === "details" && (
                <div className="space-y-6">
                  {/* Extracted URLs */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Mentioned Resources</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {analysis.urls.map((u, uIdx) => (
                        <div
                          key={uIdx}
                          className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-zinc-900/20 text-xs"
                        >
                          <div className="flex flex-col gap-0.5 truncate pr-4">
                            <span className="font-semibold text-zinc-300 truncate">{u.label}</span>
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                              Mentioned @ {formatTime(u.timestamp || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={u.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700"
                              title="Open Link"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={() => handleCopyLink(u.url)}
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
                              title="Copy URL"
                            >
                              {copiedUrl === u.url ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Entity Extraction */}
                  <div className="space-y-2.5 border-t border-white/5 pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Key Entities Mentioned</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.entities.map((ent, entIdx) => {
                        let colorClass = "bg-primary/10 border-primary/20 text-indigo-300";
                        if (ent.type === "company") colorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
                        if (ent.type === "location") colorClass = "bg-amber-500/10 border-amber-500/20 text-amber-300";
                        if (ent.type === "product") colorClass = "bg-secondary/10 border-secondary/20 text-cyan-300";

                        return (
                          <span
                            key={entIdx}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 uppercase tracking-wide ${colorClass}`}
                          >
                            <span>{ent.name}</span>
                            <span className="opacity-60 bg-black/30 px-1 py-0.5 rounded text-[9px]">{ent.count}x</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Frames Gallery */}
                  <div className="space-y-2.5 border-t border-white/5 pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Extracted Key Frames</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                      {frames.map((fr) => (
                        <div
                          key={fr.id}
                          onClick={() => handleSeek(fr.timestamp)}
                          className="rounded-lg overflow-hidden border border-white/5 bg-zinc-950/40 cursor-pointer group flex flex-col justify-between"
                        >
                          <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden">
                            <img
                              src={fr.imageUrl}
                              alt={fr.description}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                            />
                            <div className="absolute top-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                              {formatTime(fr.timestamp)}
                            </div>
                            <div className="absolute top-1.5 right-1.5 bg-primary/25 text-primary border border-primary/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {fr.score}% Match
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 p-2 leading-snug line-clamp-2">
                            {fr.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
