"use client";

import React from "react";
import { ArrowRight, HelpCircle, Activity, Sparkles, Target, Clock } from "lucide-react";
import { DiagramData } from "@/types";
import { motion } from "framer-motion";

interface DiagramViewProps {
  diagramData: DiagramData;
  onSeek: (seconds: number) => void;
}

export default function DiagramView({ diagramData, onSeek }: DiagramViewProps) {
  const nodes = diagramData?.nodes || [];
  const connections = diagramData?.connections || [];

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "problem":
        return <HelpCircle className="h-4 w-4 text-red-400" />;
      case "process":
        return <Activity className="h-4 w-4 text-amber-400" />;
      case "solution":
        return <Sparkles className="h-4 w-4 text-primary" />;
      case "outcome":
        return <Target className="h-4 w-4 text-secondary" />;
      default:
        return <Activity className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getNodeColors = (type: string) => {
    switch (type) {
      case "problem":
        return "bg-red-500/10 border-red-500/20 text-red-200 hover:border-red-500/40";
      case "process":
        return "bg-amber-500/10 border-amber-500/20 text-amber-200 hover:border-amber-500/40";
      case "solution":
        return "bg-primary/10 border-primary/20 text-indigo-200 hover:border-primary/40";
      case "outcome":
        return "bg-secondary/10 border-secondary/20 text-cyan-200 hover:border-secondary/40";
      default:
        return "bg-zinc-800/60 border-zinc-700 text-zinc-200 hover:border-zinc-550";
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-zinc-900/10 rounded-2xl text-zinc-500 text-sm">
        <Activity className="h-6 w-6 stroke-1 mb-2 text-zinc-600" />
        <span>No diagram flowchart nodes available for this video.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 border border-white/5 bg-zinc-900/10 rounded-2xl overflow-x-auto">
      <div className="flex items-center flex-wrap gap-4 min-w-max py-2">
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          
          return (
            <React.Fragment key={node.id}>
              {/* Flowchart Node Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                onClick={() => onSeek(node.timestamp)}
                className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 group shadow-md ${getNodeColors(node.type)}`}
              >
                {/* Node Type Icon */}
                <div className="p-2 bg-zinc-950/80 rounded-lg border border-white/5">
                  {getNodeIcon(node.type)}
                </div>

                {/* Node Details */}
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 leading-none mb-1">
                    {node.type}
                  </span>
                  <span className="text-sm font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                    {node.label}
                  </span>
                  
                  {/* Clickable timestamp */}
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold mt-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{formatTime(node.timestamp)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Connecting Arrow */}
              {!isLast && (
                <div className="flex items-center text-zinc-700 animate-pulse">
                  <ArrowRight className="h-5 w-5 stroke-1" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
