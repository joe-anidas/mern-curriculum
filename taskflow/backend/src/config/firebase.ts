import admin from "firebase-admin";
import {
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_CERT_URL,
  FIREBASE_CLIENT_CERT_URL,
} from "./env";

const firebaseConfig = {
  type: FIREBASE_TYPE,
  projectId: FIREBASE_PROJECT_ID,
  privateKeyId: FIREBASE_PRIVATE_KEY_ID,
  privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: FIREBASE_CLIENT_EMAIL,
  clientId: FIREBASE_CLIENT_ID,
  authUri: FIREBASE_AUTH_URI,
  tokenUri: FIREBASE_TOKEN_URI,
  authProviderCertUrl: FIREBASE_AUTH_PROVIDER_CERT_URL,
  clientCertUrl: FIREBASE_CLIENT_CERT_URL,
};

 try {
    if (!admin.apps.length) {
        console.log("🔥 Attempting to initialize Firebase Admin...");
        if (GOOGLE_APPLICATION_CREDENTIALS) {
             admin.initializeApp({
                credential: admin.credential.applicationDefault(),
             });
             console.log("🔥 Firebase Admin initialized (using credentials file via GOOGLE_APPLICATION_CREDENTIALS)");
        } else if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
             console.log("🔥 Found env vars: PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY");
             admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
                projectId: FIREBASE_PROJECT_ID,
            });
            console.log("🔥 Firebase Admin initialized (using env vars)");
        } else {
             console.warn("⚠️ No Firebase credentials found. Admin not initialized.");
             console.warn("DEBUG: PROJECT_ID:", !!FIREBASE_PROJECT_ID);
             console.warn("DEBUG: CLIENT_EMAIL:", !!FIREBASE_CLIENT_EMAIL);
             console.warn("DEBUG: PRIVATE_KEY:", !!FIREBASE_PRIVATE_KEY);
        }
    } else {
        console.log("🔥 Firebase Admin already initialized");
    }
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
}

export const messaging = admin.messaging();
export const initializeFirebase = () => {}; // No-op for backward compatibility
export default admin;


