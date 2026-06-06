"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import SidebarComponent from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import AIChat from "@/components/AIChat";
import { Video, VideoAnalysis } from "@/types";
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  Video as VideoIcon, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function ChatWithVideoPage() {
  useAuthRedirect();
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [video, setVideo] = useState<Video | null>(null);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [seekTime, setSeekTime] = useState<number>(0);

  // Fetch video details
  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/videos?videoId=${id}`);
        if (!res.ok) {
          throw new Error("Failed to load video details.");
        }
        const data = await res.json();
        setVideo(data.video);
        setAnalysis(data.analysis);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load details.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const handleSeek = (seconds: number) => {
    setSeekTime(seconds);
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
            <span className="text-sm text-zinc-400 font-medium">Entering interactive chat room...</span>
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
            <h3 className="text-base font-bold text-white">Chat workspace unavailable</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              We couldn&apos;t load the video chat room. The analysis may not have finished or was deleted.
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
      {/* Navigation Sidebar */}
      <SidebarComponent />

      {/* Main Panel Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full space-y-6">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div className="space-y-1.5">
            <Link
              href={`/analysis/${video.id}`}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Analysis</span>
            </Link>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                Chat Workspace: {video.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Double-Panel Chat Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Mini Player & Moments */}
          <div className="lg:col-span-5 space-y-6">
            {/* Custom seekable video player */}
            <VideoPlayer url={video.sourceUrl} seekTime={seekTime} />

            {/* Chapters list */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900/10 p-5 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Chapters Index</h3>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {analysis.chapters.map((ch, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSeek(ch.timestamp)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-zinc-950/20 hover:bg-zinc-900/40 hover:border-zinc-800 transition-all cursor-pointer group text-xs"
                  >
                    <span className="font-bold text-primary group-hover:text-white transition-colors">
                      {formatTime(ch.timestamp)}
                    </span>
                    <span className="font-semibold text-zinc-300 group-hover:text-primary transition-colors text-right flex-1 truncate pl-4">
                      {ch.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Chat Log */}
          <div className="lg:col-span-7">
            <AIChat videoId={video.id} onSeek={handleSeek} />
          </div>

        </div>

      </div>
    </div>
  );
}
