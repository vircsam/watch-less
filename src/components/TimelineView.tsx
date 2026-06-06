"use client";

import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import { TimelineItem } from "@/types";
import { motion } from "framer-motion";

interface TimelineViewProps {
  timeline: TimelineItem[];
  onSeek: (seconds: number) => void;
}

export default function TimelineView({ timeline, onSeek }: TimelineViewProps) {
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-8 py-4">
      {timeline.map((item, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="relative group"
        >
          {/* Node Icon Indicator */}
          <div className="absolute -left-[31px] top-1 bg-zinc-950 border border-zinc-800 rounded-full h-5 w-5 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-colors duration-250">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-primary" />
          </div>

          <div className="flex flex-col md:flex-row gap-6 bg-zinc-900/20 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300">
            
            {/* Thumbnail Keyframe */}
            {item.imageUrl && (
              <div 
                className="w-full md:w-48 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/5 relative group/thumb cursor-pointer bg-zinc-950"
                onClick={() => onSeek(item.timestamp)}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.insight || "Keyframe"} 
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-primary px-2 py-1 rounded">Seek Player</span>
                </div>
              </div>
            )}

            {/* Description Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <button 
                    onClick={() => onSeek(item.timestamp)}
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-colors duration-200"
                  >
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(item.timestamp)}</span>
                  </button>
                  <h4 className="text-sm font-bold text-white tracking-wide">{item.insight}</h4>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.summary}</p>
              </div>

              <button
                onClick={() => onSeek(item.timestamp)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-white transition-colors duration-200 mt-4 group/btn"
              >
                <span>Jump to Moment</span>
                <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </motion.div>
      ))}
    </div>
  );
}
