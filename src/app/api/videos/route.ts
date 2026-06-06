import { NextResponse } from "next/server";
import { adminDb, IS_ADMIN_MOCK } from "@/firebase/admin";
import { mockDb } from "@/firebase/mockDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const videoId = searchParams.get("videoId");

    // Case 1: Fetch details of a single video analysis
    if (videoId) {
      if (IS_ADMIN_MOCK) {
        const video = mockDb.videos[videoId];
        const analysis = mockDb.analysis[videoId];
        const frames = mockDb.frames[videoId] || [];
        
        if (!video) {
          return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }
        
        return NextResponse.json({ video, analysis, frames });
      } else {
        const videoDoc = await adminDb!.collection("videos").doc(videoId).get();
        if (!videoDoc.exists) {
          return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }
        
        const videoData = videoDoc.data();
        
        const analysisDoc = await adminDb!.collection("analysis").doc(videoId).get();
        const analysisData = analysisDoc.exists ? analysisDoc.data() : null;
        
        const framesSnapshot = await adminDb!
          .collection("frames")
          .where("videoId", "==", videoId)
          .get();
          
        const framesData = framesSnapshot.docs.map((doc) => doc.data());
        
        return NextResponse.json({
          video: videoData,
          analysis: analysisData,
          frames: framesData,
        });
      }
    }

    // Case 2: Fetch list of videos analyzed by a user
    if (userId) {
      if (IS_ADMIN_MOCK) {
        const list = Object.values(mockDb.videos)
          .filter((v: any) => v.userId === userId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(list);
      } else {
        const videosSnapshot = await adminDb!
          .collection("videos")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .get();
          
        const list = videosSnapshot.docs.map((doc) => doc.data());
        return NextResponse.json(list);
      }
    }

    return NextResponse.json({ error: "Missing userId or videoId" }, { status: 400 });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch videos" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    if (IS_ADMIN_MOCK) {
      delete mockDb.videos[videoId];
      delete mockDb.analysis[videoId];
      delete mockDb.frames[videoId];
      return NextResponse.json({ success: true });
    } else {
      const batch = adminDb!.batch();
      
      // Delete video document
      batch.delete(adminDb!.collection("videos").doc(videoId));
      
      // Delete analysis document
      batch.delete(adminDb!.collection("analysis").doc(videoId));
      
      // Delete frames documents
      const framesSnapshot = await adminDb!
        .collection("frames")
        .where("videoId", "==", videoId)
        .get();
        
      framesSnapshot.docs.forEach((doc) => {
        batch.delete(adminDb!.collection("frames").doc(doc.id));
      });
      
      await batch.commit();
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: error.message || "Failed to delete video" }, { status: 500 });
  }
}
