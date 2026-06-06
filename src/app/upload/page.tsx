"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import SidebarComponent from "@/components/Sidebar";
import { 
  UploadCloud, 
  Link2, 
  Play,
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  FileVideo,
  Gauge,
  ListChecks
} from "lucide-react";

const processingStages = [
  "Preparing the video analysis engine...",
  "Downloading audio stream from source URL (yt-dlp)...",
  "Running faster-whisper speech-to-text transcription...",
  "Speech transcribed. Building query prompt context...",
  "Running Ollama Llama 3 to generate summaries, chapters, & flowcharts...",
  "Capturing key video frames with FFmpeg...",
  "Synchronizing Firestore entries & updating credit balances...",
  "Finishing up report..."
];

export default function UploadPage() {
  useAuthRedirect();
  const router = useRouter();
  const { user, fetchProfile } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<"file" | "youtube" | "url">("file");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Rotate through loading logs
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setProgressStage((prev) => {
          if (prev < processingStages.length - 1) return prev + 1;
          return prev;
        });
      }, 2500);
    } else {
      setProgressStage(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const triggerAnalysis = async (url: string, title: string) => {
    if (!user) return;
    setError(null);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: url,
          title: title || "Video Analysis",
          userId: user.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "The analysis engine could not process this video.");
      }

      const data = await response.json();
      
      // Update credits in Zustand store
      await fetchProfile(user.uid);

      // Redirect to detailed analysis screen
      router.push(`/analysis/${data.videoId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze video. Check connections and try again.";
      console.error(err);
      setError(message);
      setIsProcessing(false);
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    triggerAnalysis(youtubeUrl.trim(), videoTitle.trim() || "YouTube Video Analysis");
  };

  const handleDirectUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    triggerAnalysis(directUrl.trim(), videoTitle.trim() || "Direct Video Link Analysis");
  };

  const handleFileDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    // Simulate uploading file to Firebase Storage.
    const mockFileUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // standard fallback direct video file link
    triggerAnalysis(mockFileUrl, videoTitle.trim() || file.name.split(".")[0]);
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = ["mp4", "mov", "mkv", "webm"];
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      
      if (ext && validExtensions.includes(ext)) {
        setFile(droppedFile);
      } else {
        alert("Invalid file format. Please upload MP4, MOV, MKV, or WEBM.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
      <SidebarComponent />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">New analysis</p>
            <h1 className="text-2xl font-bold tracking-tight text-white">Analyze a video</h1>
            <p className="text-sm text-zinc-400 mt-1">Upload a file, paste a YouTube link, or use a direct video URL.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-4">
              <Gauge className="h-4.5 w-4.5 text-secondary mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cost</p>
              <p className="text-sm font-bold text-white mt-1">10 credits</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-4">
              <ListChecks className="h-4.5 w-4.5 text-accent mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Output</p>
              <p className="text-sm font-bold text-white mt-1">Report + chat</p>
            </div>
          </div>
        </div>

        {/* Check credit warnings */}
        {user && user.credits < 10 && (
          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200 text-xs">
            <div className="flex gap-2.5 items-start">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="font-bold">Insufficient Credits</p>
                <p className="text-zinc-400 mt-0.5">Analyzing a video requires 10 credits. You currently have {user.credits} credits.</p>
              </div>
            </div>
            <Link
              href="/billing"
              className="bg-primary hover:bg-primary/95 text-white px-3 py-1.5 rounded-lg font-semibold text-center transition-all shrink-0"
            >
              Get Credits
            </Link>
          </div>
        )}

        {/* Processing State Log UI */}
        {isProcessing ? (
          <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-8 text-center flex flex-col items-center justify-center gap-6 py-16">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="h-6 w-6 text-primary absolute animate-pulse" />
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="text-base font-bold text-white">Analyzing video</h3>
              <p className="text-sm text-zinc-300 font-medium h-5 animate-pulse text-gradient-primary">
                {processingStages[progressStage]}
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed pt-3">
                Processing time depends on the length and source of the video.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-4 text-xs rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 flex gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Video Analysis Title (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank to auto-detect from title..."
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-xl py-2.5 px-4 outline-none text-white transition-colors"
              />
            </div>

            <div className="flex border-b border-white/5 gap-6 overflow-x-auto">
              <button
                onClick={() => { setActiveTab("file"); setError(null); }}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "file" ? "border-primary text-white" : "border-transparent text-zinc-500 hover:text-white"
                }`}
              >
                <FileVideo className="h-4 w-4" />
                <span>Upload File</span>
              </button>
              <button
                onClick={() => { setActiveTab("youtube"); setError(null); }}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "youtube" ? "border-primary text-white" : "border-transparent text-zinc-500 hover:text-white"
                }`}
              >
                <Play className="h-4 w-4" />
                <span>YouTube</span>
              </button>
              <button
                onClick={() => { setActiveTab("url"); setError(null); }}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "url" ? "border-primary text-white" : "border-transparent text-zinc-500 hover:text-white"
                }`}
              >
                <Link2 className="h-4 w-4" />
                <span>Direct Link</span>
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD */}
            {activeTab === "file" && (
              <form onSubmit={handleFileDropSubmit} className="space-y-6">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-150 flex flex-col items-center justify-center gap-4 ${
                    dragActive 
                      ? "border-primary bg-primary/5 scale-99" 
                      : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".mp4,.mov,.mkv,.webm"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="h-12 w-12 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center justify-center text-zinc-400">
                    <UploadCloud className="h-6 w-6 stroke-1.5" />
                  </div>

                  {file ? (
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <button 
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-xs text-red-400 hover:text-red-300 font-bold"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Drop a video file here</p>
                      <p className="text-xs text-zinc-500">
                        Supports MP4, MOV, MKV, or WEBM (up to 200MB)
                      </p>
                      <label 
                        htmlFor="file-upload"
                        className="mt-4 inline-flex items-center rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
                      >
                        Browse Files
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!file || (user && user.credits < 10)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white py-3 text-sm font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>Analyze Uploaded Video</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </form>
            )}

            {/* TAB 2: YOUTUBE LINK */}
            {activeTab === "youtube" && (
              <form onSubmit={handleYoutubeSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    YouTube URL
                  </label>
                  <div className="relative flex items-center">
                    <Play className="absolute left-3.5 h-4.5 w-4.5 text-zinc-500" />
                    <input
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-xl py-2.5 pl-11 pr-4 outline-none text-white transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Paste any public YouTube watch link or short URL.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!youtubeUrl.trim() || (user && user.credits < 10)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white py-3 text-sm font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>Analyze YouTube Video</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </form>
            )}

            {/* TAB 3: DIRECT URL */}
            {activeTab === "url" && (
              <form onSubmit={handleDirectUrlSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Direct Video file URL
                  </label>
                  <div className="relative flex items-center">
                    <Link2 className="absolute left-3.5 h-4.5 w-4.5 text-zinc-500" />
                    <input
                      type="url"
                      required
                      placeholder="https://mybucket.storage.googleapis.com/video.mp4"
                      value={directUrl}
                      onChange={(e) => setDirectUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-xl py-2.5 pl-11 pr-4 outline-none text-white transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Make sure the direct link is publicly accessible (e.g. Firebase storage signed link).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!directUrl.trim() || (user && user.credits < 10)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white py-3 text-sm font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>Analyze Video Link</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
