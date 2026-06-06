"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play, Square } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  seekTime?: number; // Prop to force seek to a timestamp
  onTimeUpdate?: (seconds: number) => void;
}

export default function VideoPlayer({ url, seekTime = 0, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  // Extract YouTube Video ID
  useEffect(() => {
    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(reg);
    const id = match && match[2].length === 11 ? match[2] : null;
    
    setIsYouTube(!!id);
    setYoutubeId(id);
  }, [url]);

  // Handle Seeking
  useEffect(() => {
    if (seekTime === undefined || seekTime < 0) return;

    if (isYouTube && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [seekTime, true],
        }),
        "*"
      );
      // Force play after seek
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "playVideo",
          args: [],
        }),
        "*"
      );
    } else if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      videoRef.current.play().catch(() => {});
    }
  }, [seekTime, isYouTube]);

  // Listen to time updates for HTML5 native video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    const handleTime = () => {
      if (onTimeUpdate) {
        onTimeUpdate(Math.floor(video.currentTime));
      }
    };

    video.addEventListener("timeupdate", handleTime);
    return () => video.removeEventListener("timeupdate", handleTime);
  }, [onTimeUpdate, isYouTube]);

  if (isYouTube && youtubeId) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-black shadow-2xl">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${encodeURIComponent(origin)}&autoplay=0&rel=0`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="YouTube Video Player"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-black shadow-2xl">
      <video
        ref={videoRef}
        src={url}
        controls
        className="h-full w-full object-contain"
        poster="https://picsum.photos/seed/viddy-poster/1280/720"
      />
    </div>
  );
}
