import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/taskflow-int";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (_req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
