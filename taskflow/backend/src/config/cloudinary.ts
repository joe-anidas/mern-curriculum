import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_URL,
} from "./env";

if (CLOUDINARY_URL) {
  // If CLOUDINARY_URL is set (from environment), the SDK auto-detects it if process.env.CLOUDINARY_URL is present.
  // However, since we might be loading it explicitly, we can rely on standard behavior or set it manually.
  // The cloudinary SDK reads the CLOUDINARY_URL environment variable automatically if it exists.
  // If we confirm it's in process.env, we might not even need to call .config(true).
  // But let's be explicit if we are manually passing it (Wait, SDK doesn't have a direct URL setter in config object in v2 usually, it relies on env var being set).
  // Actually, setting process.env.CLOUDINARY_URL before import usually works, or just having it there.
  // If we have separate vars, we config them.
  
  // If CLOUDINARY_URL is provided, we prefer that. 
  // We can leave it to the SDK's auto-config if we don't call config() with conflicting params,
  // OR we just ensure the env var is set.
  // Since we use dotenv, process.env.CLOUDINARY_URL should be available to the SDK.
  
  // However, if we want to support our explicit config/env.ts exports:
  // If CLOUDINARY_URL is present, we don't need to do anything if it's in process.env.
  // But to be safe and explicit:
  process.env.CLOUDINARY_URL = CLOUDINARY_URL;
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;
