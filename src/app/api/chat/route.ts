import { NextResponse } from "next/server";
import { adminDb, IS_ADMIN_MOCK } from "@/firebase/admin";
import { mockDb } from "@/firebase/mockDb";
import { AIService } from "@/services/ai.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, question } = body;

    if (!videoId || !question) {
      return NextResponse.json({ error: "Missing videoId or question" }, { status: 400 });
    }

    let transcript = null;

    // 1. Fetch transcript from Firestore or mockDb
    if (IS_ADMIN_MOCK) {
      const analysis = mockDb.analysis[videoId];
      if (!analysis) {
        return NextResponse.json({ error: "Video analysis not found" }, { status: 404 });
      }
      transcript = analysis.transcript;
    } else {
      const analysisDoc = await adminDb!.collection("analysis").doc(videoId).get();
      if (!analysisDoc.exists) {
        return NextResponse.json({ error: "Video analysis not found" }, { status: 404 });
      }
      transcript = analysisDoc.data()?.transcript;
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "Transcript is empty or unavailable" }, { status: 404 });
    }

    // 2. Perform RAG Chat processing
    const answer = await AIService.chatWithVideo(transcript, question);

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}
