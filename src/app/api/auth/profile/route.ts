import { NextResponse } from "next/server";
import { adminDb, IS_ADMIN_MOCK } from "@/firebase/admin";
import { mockDb } from "@/firebase/mockDb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, name, email } = body;

    if (!uid) {
      return NextResponse.json({ error: "Missing user ID (uid)" }, { status: 400 });
    }

    if (IS_ADMIN_MOCK) {
      // Mock db logic
      if (!mockDb.users[uid]) {
        mockDb.users[uid] = {
          uid,
          name: name || "New User",
          email: email || "user@example.com",
          createdAt: new Date().toISOString(),
          credits: 50, // 50 free credits for signing up
        };
      }
      return NextResponse.json(mockDb.users[uid]);
    } else {
      // Firebase db logic
      const userRef = adminDb!.collection("users").doc(uid);
      const doc = await userRef.get();

      if (doc.exists) {
        return NextResponse.json(doc.data());
      } else {
        const newUser = {
          uid,
          name: name || "New User",
          email: email || "user@example.com",
          createdAt: new Date().toISOString(),
          credits: 50,
        };
        await userRef.set(newUser);
        return NextResponse.json(newUser);
      }
    }
  } catch (error: any) {
    console.error("Error in profile sync API:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
