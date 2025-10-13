import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

export const verifyIdToken = async (token: string) => {
  return await auth.verifyIdToken(token);
};

export const getUserRole = async (uid: string) => {
  const userDoc = await db.collection("users").doc(uid).get();
  if (userDoc.exists) {
    return userDoc.data()?.role || "user";
  }
  throw new Error("User not found");
};

export { db, auth };
