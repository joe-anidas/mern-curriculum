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
