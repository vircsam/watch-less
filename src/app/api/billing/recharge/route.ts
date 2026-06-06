import { NextResponse } from "next/server";
import { adminDb, IS_ADMIN_MOCK } from "@/firebase/admin";
import { mockDb } from "@/firebase/mockDb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, creditsToAdd } = body;

    if (!userId || !creditsToAdd) {
      return NextResponse.json({ error: "Missing userId or creditsToAdd" }, { status: 400 });
    }

    let updatedUser = null;

    if (IS_ADMIN_MOCK) {
      const user = mockDb.users[userId];
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      user.credits += creditsToAdd;
      updatedUser = user;
    } else {
      const userRef = adminDb!.collection("users").doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const currentCredits = userDoc.data()?.credits ?? 0;
      const newCredits = currentCredits + creditsToAdd;
      
      await userRef.update({ credits: newCredits });
      
      updatedUser = {
        ...userDoc.data(),
        credits: newCredits
      };
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Error recharging credits:", error);
    return NextResponse.json({ error: error.message || "Failed to recharge credits" }, { status: 500 });
  }
}
