"use client";

import React, { useState, useMemo } from "react";
import { Search, Clock, FileText } from "lucide-react";
import { TranscriptSegment } from "@/types";

interface TranscriptSearchProps {
  transcript: TranscriptSegment[];
  onSeek: (seconds: number) => void;
  currentSecond?: number;
}

export default function TranscriptSearch({ transcript, onSeek, currentSecond = 0 }: TranscriptSearchProps) {
  const [query, setQuery] = useState("");

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const filteredSegments = useMemo(() => {
    if (!query.trim()) return transcript;
    const lowerQuery = query.toLowerCase();
    return transcript.filter((seg) => seg.text.toLowerCase().includes(lowerQuery));
  }, [transcript, query]);

  // Helper to highlight matching text
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-white rounded-sm px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[500px] border border-white/5 bg-zinc-900/10 rounded-2xl overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-white/5 bg-zinc-950/40 flex items-center gap-3">
        <Search className="h-4.5 w-4.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search inside video transcript..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="text-xs text-zinc-400 hover:text-white font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Transcript Scrolling list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredSegments.length > 0 ? (
          filteredSegments.map((seg, idx) => {
            const isPlayingNow = currentSecond >= seg.start && currentSecond < seg.start + (seg.duration || 5);
            
            return (
              <div
                key={idx}
                onClick={() => onSeek(seg.start)}
                className={`flex gap-4 p-2.5 rounded-lg text-left cursor-pointer transition-all duration-150 group border ${
                  isPlayingNow
                    ? "bg-primary/10 border-primary/20 text-white"
                    : "border-transparent hover:bg-zinc-900/60 hover:border-zinc-800 text-zinc-300"
                }`}
              >
                {/* Seek Button */}
                <button
                  className={`flex items-center gap-1 text-[11px] font-semibold h-fit py-0.5 px-1.5 rounded border transition-all ${
                    isPlayingNow
                      ? "bg-primary border-primary/20 text-white"
                      : "bg-zinc-800/80 border-zinc-700/60 text-zinc-400 group-hover:bg-primary group-hover:border-primary group-hover:text-white"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(seg.start)}</span>
                </button>

                {/* Text Content */}
                <p className="text-sm leading-relaxed flex-1 pt-0.5">
                  {highlightText(seg.text, query)}
                </p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
            <FileText className="h-8 w-8 stroke-1" />
            <p className="text-sm">No matches found for &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
