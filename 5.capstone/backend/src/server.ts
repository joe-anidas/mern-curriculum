import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { CORS_ORIGIN, MONGO_URI, PORT } from "./config/env";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import sprintRoutes from "./routes/sprintRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { notificationService } from "./notification";
import { initializeFirebase } from "./config/firebase";
import { checkTaskDueDates } from "./utils/taskScheduler";

const app = express();

// Initialize Firebase Admin
initializeFirebase();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  ...CORS_ORIGIN,
]);

const allowedOriginsArray = Array.from(allowedOrigins);

// ========================================
// BASIC MIDDLEWARE
// ========================================

// Basic CORS
app.use(
  cors({
    origin: allowedOriginsArray,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Database: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "taskflow-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// API ROUTES
// ========================================

// Main route handlers
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize notification service with Socket.IO
notificationService.initialize(httpServer, allowedOriginsArray);

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API documentation available at http://localhost:${PORT}/api`);
  
  // Set up periodic due date checks (runs every hour)
  // This ensures tasks that become due within 1 day get notified as time passes
  setInterval(async () => {
    try {
      await checkTaskDueDates();
    } catch (error) {
      console.error("Error in scheduled due date check:", error);
    }
  }, 60 * 60 * 1000); // Run every hour (60 minutes * 60 seconds * 1000 milliseconds)
  
  // Also run immediately on server start
  checkTaskDueDates().catch((error) => {
    console.error("Error in initial due date check:", error);
  });
  
  console.log("✅ Due date notification scheduler started (checks every hour)");
});

process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    mongoose.connection.close();
  });
});
