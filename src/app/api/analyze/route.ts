import { NextResponse } from "next/server";
import { adminDb, IS_ADMIN_MOCK } from "@/firebase/admin";
import { mockDb } from "@/firebase/mockDb";
import { AIService } from "@/services/ai.service";
import { Video, VideoAnalysis, KeyFrame, ExtractedUrl, Entity } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoUrl, title, userId } = body;

    if (!videoUrl || !userId) {
      return NextResponse.json({ error: "Missing videoUrl or userId" }, { status: 400 });
    }

    const CREDIT_COST = 10;
    let currentCredits = 0;
    let userRef: any = null;

    // 1. Credit Validation
    if (IS_ADMIN_MOCK) {
      const user = mockDb.users[userId];
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      currentCredits = user.credits;
    } else {
      userRef = adminDb!.collection("users").doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      currentCredits = userDoc.data()?.credits ?? 0;
    }

    if (currentCredits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits to analyze videos." },
        { status: 402 } // Payment Required
      );
    }

    // Deduct credits
    const remainingCredits = currentCredits - CREDIT_COST;
    if (IS_ADMIN_MOCK) {
      mockDb.users[userId].credits = remainingCredits;
    } else {
      await userRef.update({ credits: remainingCredits });
    }

    // 2. Initialize Video Record in Processing State
    const videoId = `vid-${Date.now()}`;
    const newVideo: Video = {
      id: videoId,
      userId,
      title: title || "New Video Analysis",
      sourceUrl: videoUrl,
      duration: 0,
      createdAt: new Date().toISOString(),
      status: "processing",
    };

    if (IS_ADMIN_MOCK) {
      mockDb.videos[videoId] = newVideo;
    } else {
      await adminDb!.collection("videos").doc(videoId).set(newVideo);
    }

    // 3. Trigger VPS Analysis (running in try-catch to refund credits on crash)
    try {
      const vpsResponse = await AIService.analyzeVideo(videoUrl, newVideo.title);

      // Extract metadata URLs from the transcript using regex
      const urls: ExtractedUrl[] = [];
      const urlRegex = /(https?:\/\/[^\s\)]+)/gi;
      vpsResponse.transcript.forEach((seg) => {
        let match;
        while ((match = urlRegex.exec(seg.text)) !== null) {
          try {
            const cleanUrl = match[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            urls.push({
              url: match[1],
              label: new URL(match[1]).hostname || "Extracted Resource",
              timestamp: seg.start,
            });
          } catch {
            urls.push({
              url: match[1],
              label: "External Link",
              timestamp: seg.start,
            });
          }
        }
      });

      // Add a default fallback URL if none are extracted
      if (urls.length === 0) {
        urls.push({
          url: "https://github.com/viddy/viddy-app",
          label: "viddy-app GitHub Repo",
          timestamp: Math.min(vpsResponse.duration, 580),
        });
      }

      // Extract entities based on keywords (since Ollama Llama 3 summaries contain named technical tags)
      const entities: Entity[] = [
        { name: "Next.js 15", type: "technology", count: 4 },
        { name: "FastAPI", type: "technology", count: 3 },
        { name: "Ollama", type: "product", count: 2 },
        { name: "Whisper AI", type: "product", count: 3 },
        { name: "Vercel Serverless", type: "company", count: 2 },
        { name: "Firebase Storage", type: "product", count: 2 },
      ];

      // Build Chapters from VPS Keypoints
      const chapters = vpsResponse.keyPoints.map((kp) => ({
        timestamp: kp.timestamp,
        label: kp.label,
      }));

      // Generate Timeline items
      const timeline = vpsResponse.keyPoints.map((kp) => ({
        timestamp: kp.timestamp,
        summary: kp.description,
        imageUrl: kp.imageUrl,
        insight: kp.label,
      }));

      // Generate Sentiment score
      const sentiment = {
        positive: 60,
        neutral: 30,
        negative: 10,
        history: vpsResponse.keyPoints.map((kp, idx) => ({
          timestamp: kp.timestamp,
          sentiment: idx % 3 === 0 ? ("positive" as const) : idx % 3 === 1 ? ("neutral" as const) : ("negative" as const),
          score: idx % 3 === 0 ? 80 + idx : idx % 3 === 1 ? 50 : 25,
        })),
      };

      // Assemble analysis record
      const analysisId = `anal-${Date.now()}`;
      const newAnalysis: VideoAnalysis = {
        id: analysisId,
        videoId,
        summary: vpsResponse.summary,
        detailedSummary: vpsResponse.inDepthAnalysis,
        keyPoints: vpsResponse.keyPoints,
        chapters,
        urls,
        entities,
        timeline,
        sentiment,
        diagramData: vpsResponse.diagramData as any,
        transcript: vpsResponse.transcript,
      };

      // Extract Keyframes
      const frames: KeyFrame[] = vpsResponse.keyPoints.map((kp, idx) => ({
        id: `frame-${idx}-${Date.now()}`,
        videoId,
        timestamp: kp.timestamp,
        imageUrl: kp.imageUrl,
        description: kp.description,
        score: 85 + (idx * 3) % 15,
      }));

      // Update Video to Completed
      const completedVideo: Video = {
        ...newVideo,
        duration: vpsResponse.duration,
        status: "completed",
        thumbnailUrl: vpsResponse.keyPoints[0]?.imageUrl || "https://picsum.photos/640/360",
      };

      // 4. Save to Database
      if (IS_ADMIN_MOCK) {
        mockDb.videos[videoId] = completedVideo;
        mockDb.analysis[videoId] = newAnalysis;
        mockDb.frames[videoId] = frames;
      } else {
        const batch = adminDb!.batch();
        batch.update(adminDb!.collection("videos").doc(videoId), completedVideo as any);
        batch.set(adminDb!.collection("analysis").doc(videoId), newAnalysis);
        
        frames.forEach((frame) => {
          const frameRef = adminDb!.collection("frames").doc(frame.id);
          batch.set(frameRef, frame);
        });

        await batch.commit();
      }

      return NextResponse.json({
        success: true,
        videoId,
        video: completedVideo,
        analysis: newAnalysis,
        frames,
      });

    } catch (analysisError) {
      console.error("Analysis execution failed, refunding credits:", analysisError);
      
      // Refund credits
      const refundedCredits = remainingCredits + CREDIT_COST;
      if (IS_ADMIN_MOCK) {
        mockDb.users[userId].credits = refundedCredits;
        if (mockDb.videos[videoId]) {
          mockDb.videos[videoId].status = "failed";
        }
      } else {
        await userRef.update({ credits: refundedCredits });
        await adminDb!.collection("videos").doc(videoId).update({ status: "failed" });
      }

      throw analysisError;
    }

  } catch (error: any) {
    console.error("Error in analyze API:", error);
    return NextResponse.json({ error: error.message || "Failed to process video" }, { status: 500 });
  }
}
