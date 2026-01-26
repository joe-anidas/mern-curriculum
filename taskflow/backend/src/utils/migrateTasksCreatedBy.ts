import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "../models/Task";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/taskflow";

async function migrateTasksCreatedBy() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🔄 Migrating tasks to add createdBy field...");

    // Find all tasks without createdBy field
    const tasksWithoutCreatedBy = await Task.find({
      createdBy: { $exists: false },
    });

    console.log(
      `📊 Found ${tasksWithoutCreatedBy.length} tasks without createdBy field`
    );

    let updated = 0;
    for (const task of tasksWithoutCreatedBy) {
      // Set createdBy to userId (assume task owner created it)
      task.createdBy = task.userId;
      await task.save();
      updated++;

      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated} tasks...`);
      }
    }

    console.log(`✅ Migration complete! Updated ${updated} tasks.`);
    console.log("🔌 Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("✅ Done!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateTasksCreatedBy();
