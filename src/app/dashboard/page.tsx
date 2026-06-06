"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Link from "next/link";
import { 
  Video, 
  Clock, 
  Coins, 
  Layers, 
  Trash2, 
  ExternalLink, 
  Search, 
  Play, 
  Loader2, 
  Plus, 
  AlertCircle 
} from "lucide-react";
import SidebarComponent from "@/components/Sidebar";

export default function DashboardPage() {
  useAuthRedirect();
  const router = useRouter();
  const { user, videos, fetchVideos, isLoading } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch videos on load
  useEffect(() => {
    if (user?.uid) {
      fetchVideos(user.uid);
    }
  }, [user, fetchVideos]);

  const handleDelete = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this analysis? This action cannot be undone.")) return;

    setDeletingId(videoId);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/videos?videoId=${videoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete video");
      
      // Refresh list
      if (user?.uid) {
        await fetchVideos(user.uid);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete video analysis.");
    } finally {
      setDeletingId(null);
      setIsDeleting(false);
    }
  };

  // Calculations for KPI widgets
  const totalAnalyzed = videos.length;
  const completedVideos = videos.filter((v) => v.status === "completed");
  const totalDurationSeconds = completedVideos.reduce((acc, curr) => acc + curr.duration, 0);
  const totalDurationMinutes = Math.floor(totalDurationSeconds / 60);

  // Simulated metrics
  const totalKeypoints = completedVideos.length * 5;
  const totalUrlsExtracted = completedVideos.length * 2;

  // Filtered List
  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m ${s}s`;
  };

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-zinc-400 font-medium">Loading workspace dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <SidebarComponent />

      {/* Main Panel Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back, {user.name}</h1>
            <p className="text-sm text-zinc-400 mt-1">Here is the intelligence breakdown of your media archive.</p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Analyze New Video</span>
          </Link>
        </div>

        {/* Stats Grid Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stats 1 */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Videos Analyzed</span>
              <Video className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{totalAnalyzed}</span>
              <span className="text-xs text-zinc-500 font-medium">videos</span>
            </div>
          </div>
          {/* Stats 2 */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Time Analyzed</span>
              <Clock className="h-4.5 w-4.5 text-secondary" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{totalDurationMinutes}</span>
              <span className="text-xs text-zinc-500 font-medium">minutes</span>
            </div>
          </div>
          {/* Stats 3 */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Insights Extracted</span>
              <Layers className="h-4.5 w-4.5 text-accent" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{totalKeypoints}</span>
              <span className="text-xs text-zinc-500 font-medium">milestones</span>
            </div>
          </div>
          {/* Stats 4 */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">AI Credits</span>
              <Coins className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{user.credits}</span>
              <span className="text-xs text-zinc-500 font-medium">credits</span>
            </div>
          </div>
        </div>

        {/* History Search Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white tracking-wide">Analysis History</h2>
            
            {/* Search filter input */}
            <div className="relative flex items-center w-full sm:w-72">
              <Search className="absolute left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search history by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-xs rounded-xl py-2 pl-9 pr-4 outline-none text-white transition-colors"
              />
            </div>
          </div>

          {/* Videos Grid list */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const isCompleted = video.status === "completed";
                const isProcessing = video.status === "processing";
                const isFailed = video.status === "failed";

                return (
                  <div
                    key={video.id}
                    onClick={() => {
                      if (isCompleted) router.push(`/analysis/${video.id}`);
                    }}
                    className={`rounded-2xl border border-white/5 bg-zinc-900/10 overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
                      isCompleted ? "cursor-pointer hover:border-white/10 hover:bg-zinc-900/30" : "opacity-80"
                    }`}
                  >
                    {/* Thumbnail banner */}
                    <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Video className="h-10 w-10 stroke-1" />
                        </div>
                      )}
                      
                      {/* Play overlay for completed */}
                      {isCompleted && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                            <Play className="h-4.5 w-4.5 fill-white ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Status pill overlay */}
                      <div className="absolute top-3 right-3 z-10">
                        {isCompleted && (
                          <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                            Completed
                          </span>
                        )}
                        {isProcessing && (
                          <span className="bg-primary/15 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Processing</span>
                          </span>
                        )}
                        {isFailed && (
                          <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                            Failed
                          </span>
                        )}
                      </div>

                      {/* Duration stamp */}
                      {isCompleted && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/70 px-2 py-0.5 rounded text-[10px] font-semibold text-white">
                          {formatTime(video.duration)}
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-4.5 space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white tracking-wide truncate group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                          Created {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex gap-2">
                          {isCompleted && (
                            <>
                              <Link
                                href={`/analysis/${video.id}`}
                                className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white"
                              >
                                <span>View Analysis</span>
                                <ExternalLink className="h-3 w-3 text-zinc-400" />
                              </Link>
                              <Link
                                href={`/chat/${video.id}`}
                                className="text-xs font-semibold text-primary hover:text-primary/80 ml-2"
                              >
                                Chat
                              </Link>
                            </>
                          )}
                        </div>

                        {/* Delete analysis trigger */}
                        <button
                          disabled={deletingId === video.id}
                          onClick={(e) => handleDelete(e, video.id)}
                          className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Delete Analysis"
                        >
                          {deletingId === video.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-zinc-900/10 p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center justify-center text-zinc-500">
                <Video className="h-6 w-6 stroke-1" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-white">No video analyses yet</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Start understanding your video files instantly by copying a YouTube URL or uploading directly to our pipeline.
                </p>
              </div>
              <Link
                href="/upload"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white px-4 py-2 text-xs font-bold shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Analyze Your First Video</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
