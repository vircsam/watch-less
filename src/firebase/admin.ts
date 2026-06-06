import * as admin from "firebase-admin";

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;
let IS_ADMIN_MOCK = true;

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : null;

const hasAdminConfig = projectId && clientEmail && privateKey;

if (hasAdminConfig) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    adminAuth = admin.auth();
    adminDb = admin.firestore();
    IS_ADMIN_MOCK = false;
    console.log("🔥 Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("⚠️ Failed to initialize Firebase Admin SDK. Falling back to mock mode.", error);
  }
} else {
  console.warn(
    "⚠️ Firebase Admin credentials are not set. API routes will operate in Server Mock Mode."
  );
}

export { admin, adminAuth, adminDb, IS_ADMIN_MOCK };
