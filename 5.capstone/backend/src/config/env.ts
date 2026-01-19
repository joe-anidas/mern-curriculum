/**
 * Environment Configuration (TypeScript)
 */
import "dotenv/config";

export const PORT: number = parseInt(process.env.PORT || "3000", 10);
export const NODE_ENV: string = process.env.NODE_ENV || "development";

export const MONGO_URI: string =
  process.env.MONGO_URI || "mongodb://localhost:27017/taskflow";

export const JWT_SECRET: string =
  process.env.JWT_SECRET || "jwt-secret-change-me";

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || "";
 
// Firebase Admin
// Firebase Admin
export const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
export const FIREBASE_TYPE = process.env.FIREBASE_TYPE;
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const FIREBASE_PRIVATE_KEY_ID = process.env.FIREBASE_PRIVATE_KEY_ID;
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
export const FIREBASE_CLIENT_ID = process.env.FIREBASE_CLIENT_ID;
export const FIREBASE_AUTH_URI = process.env.FIREBASE_AUTH_URI;
export const FIREBASE_TOKEN_URI = process.env.FIREBASE_TOKEN_URI;
export const FIREBASE_AUTH_PROVIDER_CERT_URL = process.env.FIREBASE_AUTH_PROVIDER_CERT_URL;
export const FIREBASE_CLIENT_CERT_URL = process.env.FIREBASE_CLIENT_CERT_URL;

if (NODE_ENV === "production" && JWT_SECRET === "jwt-secret-change-me") {
  throw new Error("❌ JWT_SECRET must be set to a secure value in production!");
}

export const CORS_ORIGIN: string[] = (
  process.env.CORS_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (NODE_ENV === "development") {
  console.log("🔧 Environment Configuration Loaded:");
  console.log(`   - Port: ${PORT}`);
  console.log(`   - Environment: ${NODE_ENV}`);
  console.log(`   - MongoDB: ${MONGO_URI}`);
  console.log(`   - CORS Origins: ${CORS_ORIGIN.join(", ")}`);
}
