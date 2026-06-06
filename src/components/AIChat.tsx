"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ChatMessage } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface AIChatProps {
  videoId: string;
  onSeek: (seconds: number) => void;
}

export default function AIChat({ videoId, onSeek }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am Viddy AI. I've analyzed this video's speech-to-text transcript. Ask me anything about the pricing, the tech stack, or summaries of specific sections!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          question: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI processor");
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `assist-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while calling the RAG API");
    } finally {
      setIsPending(false);
    }
  };

  // Helper to parse text and inject clickable timestamp badges
  const renderFormattedContent = (content: string) => {
    const timestampRegex = /\[(\d{2}):(\d{2})\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = timestampRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) parts.push(textBefore);

      const m = parseInt(match[1], 10);
      const s = parseInt(match[2], 10);
      const seconds = m * 60 + s;
      const displayLabel = match[0];

      parts.push(
        <button
          key={match.index}
          onClick={() => onSeek(seconds)}
          className="inline-flex items-center gap-1 font-bold text-secondary hover:text-white px-1.5 py-0.5 rounded bg-secondary/15 hover:bg-secondary border border-secondary/20 hover:border-secondary transition-all text-[11px] mx-1 relative top-[-1px]"
        >
          <span>{displayLabel}</span>
        </button>
      );

      lastIndex = timestampRegex.lastIndex;
    }

    const textAfter = content.substring(lastIndex);
    if (textAfter) parts.push(textAfter);

    if (parts.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed text-sm select-text">{content}</p>;
    }

    return <div className="whitespace-pre-wrap leading-relaxed text-sm select-text">{parts}</div>;
  };

  return (
    <div className="flex flex-col h-[550px] border border-white/5 bg-zinc-950/20 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary fill-primary" />
          <span className="text-sm font-bold text-white tracking-wide">RAG Chat Assistant</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Ready to assist" />
      </div>

      {/* Messages View */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.role === "assistant";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3.5 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border ${
                  isBot 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : "bg-zinc-800 border-zinc-700 text-zinc-300"
                }`}>
                  {isBot ? <Bot className="h-4.5 w-4.5" /> : <UserIcon className="h-4.5 w-4.5" />}
                </div>

                {/* Message Body */}
                <div className="flex flex-col gap-1">
                  <div className={`rounded-xl px-4 py-3 border ${
                    isBot 
                      ? "bg-zinc-900/40 border-zinc-800 text-zinc-100" 
                      : "bg-primary border-primary text-white shadow-lg shadow-primary/15"
                  }`}>
                    {isBot ? renderFormattedContent(msg.content) : <p className="text-sm select-text">{msg.content}</p>}
                  </div>
                  <span className={`text-[10px] text-zinc-500 font-medium ${!isBot && "text-right"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isPending && (
          <div className="flex gap-3.5 max-w-[85%] mr-auto">
            <div className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
              <Bot className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div className="rounded-xl px-4 py-3 border bg-zinc-900/40 border-zinc-800 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-zinc-400 font-medium animate-pulse">Thinking, searching transcript...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-2 p-3 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 text-xs items-center max-w-[85%] mr-auto">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Submit */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-zinc-950/40 flex items-center gap-3">
        <input
          type="text"
          placeholder="Ask a question about this video (e.g. summarized pricing)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isPending}
          className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-primary/50 text-sm rounded-xl py-2.5 px-4 outline-none text-white placeholder-zinc-500 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary hover:bg-primary/95 text-white disabled:opacity-50 shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
