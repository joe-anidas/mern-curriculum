import multer from "multer";
import path from "path";

// Multer config
const storage = multer.diskStorage({
  // Use memory storage if you want to upload directly from buffer, 
  // or disk storage if you want to save temporarily to disk.
  // Using disk storage is often safer for large files.
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    // Optional: filter file types
    // if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("application/pdf")) ...
    cb(null, true);
  },
});
